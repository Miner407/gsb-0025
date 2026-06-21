import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Server } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_PORT = 3002;
const API_BASE = `http://localhost:${TEST_PORT}/api`;
const TEST_DB_PATH = path.join(__dirname, '../data/issues.test.db');

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

async function cleanupTestDb(retries = 5, delay = 200) {
  if (!fs.existsSync(TEST_DB_PATH)) {
    return;
  }

  for (let i = 0; i < retries; i++) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
      console.log('🧹 测试数据库已清理');
      return;
    } catch (err) {
      if (i === retries - 1) {
        console.warn('⚠️  清理测试数据库失败（文件可能被占用）:', err);
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

async function startTestServer(): Promise<Server> {
  process.env.NODE_ENV = 'test';
  process.env.PORT = String(TEST_PORT);

  const { default: app } = await import('../api/app.js');
  return new Promise((resolve) => {
    const server = app.listen(TEST_PORT, () => {
      console.log(`🚀 测试服务器已启动在端口 ${TEST_PORT}`);
      resolve(server);
    });
  });
}

async function stopTestServer(server: Server) {
  return new Promise<void>((resolve) => {
    server.close(() => {
      console.log('🛑 测试服务器已停止');
      resolve();
    });
  });
}

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  try {
    await testFn();
    results.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (err) {
    results.push({
      name,
      passed: false,
      error: err instanceof Error ? err.message : String(err),
    });
    console.log(`❌ ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

async function request(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('客服问题标签归档看板 - API 接口验证测试');
  console.log('='.repeat(60) + '\n');

  await cleanupTestDb();

  const server = await startTestServer();

  await new Promise(resolve => setTimeout(resolve, 500));

  let createdIssueId: number;
  let createdIssueIds: number[] = [];

  try {
    await runTest('健康检查', async () => {
      const response = await fetch(`${API_BASE}/health`);
      assert.strictEqual(response.status, 200, '健康检查应该返回 200');
      const data = await response.json();
      assert.ok(data.success, '应该返回 success: true');
    });

    await runTest('1. 新增问题 - 创建单条记录', async () => {
      const data = await request('/issues', {
        method: 'POST',
        body: JSON.stringify({
          customerName: '测试客户A',
          channel: '在线客服',
          description: '这是一个测试问题，用于验证新增功能',
          tags: ['测试', '新增验证'],
          status: 'pending',
          assignee: '李四',
          solution: '',
        }),
      });
      assert.ok(data.id, '应该返回创建的问题ID');
      assert.strictEqual(data.customerName, '测试客户A');
      assert.deepStrictEqual(data.tags, ['测试', '新增验证']);
      createdIssueId = data.id;
      createdIssueIds.push(data.id);
    });

    await runTest('1.1 新增问题 - 批量创建测试数据', async () => {
      for (let i = 1; i <= 5; i++) {
        const data = await request('/issues', {
          method: 'POST',
          body: JSON.stringify({
            customerName: `批量测试客户${i}`,
            channel: ['电话', '邮件', 'APP反馈'][i % 3],
            description: `这是第 ${i} 条批量创建的测试问题`,
            tags: ['批量测试', `标签${i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'}`],
            status: (['pending', 'processing', 'resolved'][i % 3] as any),
            assignee: ['李四', '赵六', '钱七'][i % 3],
            solution: i % 3 === 2 ? `解决方案${i}` : '',
          }),
        });
        createdIssueIds.push(data.id);
      }
      assert.strictEqual(createdIssueIds.length, 6, '应该创建了6条测试数据');
    });

    await runTest('2. 获取问题列表 - 基本查询', async () => {
      const data = await request('/issues?page=1&pageSize=20');
      assert.ok(Array.isArray(data.data), 'data 应该是数组');
      assert.ok(typeof data.total === 'number', 'total 应该是数字');
      assert.strictEqual(data.total, 14, '测试数据库中应该有14条数据（6条测试+8条示例）');
    });

    await runTest('2.1 获取问题列表 - 分页功能', async () => {
      const page1 = await request('/issues?page=1&pageSize=3');
      const page2 = await request('/issues?page=2&pageSize=3');
      assert.strictEqual(page1.data.length, 3, '第一页应该有3条数据');
      assert.strictEqual(page2.data.length, 3, '第二页应该有3条数据');
      assert.notDeepStrictEqual(
        page1.data[0].id,
        page2.data[0].id,
        '不同页面的数据应该不同'
      );
    });

    await runTest('2.2 获取问题列表 - 关键词搜索', async () => {
      const data = await request('/issues?keyword=测试客户A');
      assert.ok(data.data.length > 0, '应该能搜索到测试客户A');
      assert.strictEqual(
        data.data[0].customerName,
        '测试客户A',
        '搜索结果应该包含测试客户A'
      );
    });

    await runTest('2.3 获取问题列表 - 关键词搜索（问题描述）', async () => {
      const data = await request('/issues?keyword=验证新增功能');
      assert.ok(data.data.length > 0, '应该能搜索到描述包含关键词的问题');
    });

    await runTest('3. 多标签筛选 - 单标签筛选', async () => {
      const data = await request('/issues?tags=测试');
      assert.ok(data.data.length > 0, '应该能筛选出带测试标签的问题');
      data.data.forEach((issue: any) => {
        assert.ok(
          issue.tags.includes('测试'),
          '筛选结果应该都包含测试标签'
        );
      });
    });

    await runTest('3.1 多标签筛选 - 多标签组合筛选', async () => {
      const data = await request('/issues?tags=批量测试,标签A');
      assert.ok(data.data.length > 0, '应该能筛选出同时带多个标签的问题');
      data.data.forEach((issue: any) => {
        assert.ok(
          issue.tags.includes('批量测试') && issue.tags.includes('标签A'),
          '筛选结果应该同时包含所有指定标签'
        );
      });
    });

    await runTest('3.2 状态筛选', async () => {
      const data = await request('/issues?status=pending');
      assert.ok(data.data.length > 0, '应该能筛选出待处理的问题');
      data.data.forEach((issue: any) => {
        assert.strictEqual(issue.status, 'pending', '状态应该都是待处理');
      });
    });

    await runTest('3.3 负责人筛选', async () => {
      const data = await request('/issues?assignee=李四');
      assert.ok(data.data.length > 0, '应该能筛选出李四负责的问题');
      data.data.forEach((issue: any) => {
        assert.strictEqual(issue.assignee, '李四', '负责人应该都是李四');
      });
    });

    await runTest('3.4 组合筛选（标签 + 状态 + 负责人）', async () => {
      const data = await request(
        '/issues?tags=批量测试&status=pending&assignee=李四'
      );
      data.data.forEach((issue: any) => {
        assert.ok(issue.tags.includes('批量测试'), '应该包含批量测试标签');
        assert.strictEqual(issue.status, 'pending', '状态应该是待处理');
        assert.strictEqual(issue.assignee, '李四', '负责人应该是李四');
      });
    });

    await runTest('3.5 排序功能', async () => {
      const dataAsc = await request(
        '/issues?sortBy=createdAt&sortOrder=asc&pageSize=5'
      );
      const dataDesc = await request(
        '/issues?sortBy=createdAt&sortOrder=desc&pageSize=5'
      );
      assert.notDeepStrictEqual(
        dataAsc.data[0].id,
        dataDesc.data[0].id,
        '不同排序顺序的首条数据应该不同'
      );
    });

    await runTest('4. 获取单个问题详情', async () => {
      const data = await request(`/issues/${createdIssueId}`);
      assert.strictEqual(data.id, createdIssueId, 'ID应该匹配');
      assert.strictEqual(data.customerName, '测试客户A');
      assert.ok(Array.isArray(data.tags), 'tags 应该是数组');
      assert.ok(data.createdAt, '应该包含创建时间');
      assert.ok(data.updatedAt, '应该包含更新时间');
    });

    await runTest('5. 更新问题', async () => {
      const beforeUpdate = await request(`/issues/${createdIssueId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = await request(`/issues/${createdIssueId}`, {
        method: 'PUT',
        body: JSON.stringify({
          description: '这是更新后的问题描述',
          status: 'processing',
          solution: '这是解决方案',
        }),
      });
      assert.strictEqual(data.id, createdIssueId, 'ID应该匹配');
      assert.strictEqual(data.description, '这是更新后的问题描述');
      assert.strictEqual(data.status, 'processing');
      assert.strictEqual(data.solution, '这是解决方案');
      assert.notStrictEqual(
        data.updatedAt,
        beforeUpdate.updatedAt,
        '更新时间应该变化'
      );
    });

    await runTest('6. 按负责人统计未解决数量', async () => {
      const data = await request('/stats/unresolved-by-assignee');
      assert.ok(Array.isArray(data), '应该返回数组');
      if (data.length > 0) {
        assert.ok(data[0].assignee, '应该包含负责人字段');
        assert.ok(typeof data[0].count === 'number', 'count 应该是数字');
      }
      console.log('  统计结果:', JSON.stringify(data));
    });

    await runTest('7. 高频问题标签统计', async () => {
      const data = await request('/stats/hot-tags?limit=10');
      assert.ok(Array.isArray(data), '应该返回数组');
      assert.ok(data.length <= 10, '返回数量不应该超过limit');
      if (data.length > 0) {
        assert.ok(data[0].tag, '应该包含标签字段');
        assert.ok(typeof data[0].count === 'number', 'count 应该是数字');
      }
      console.log('  高频标签:', JSON.stringify(data));
    });

    await runTest('8. 获取所有标签列表', async () => {
      const data = await request('/tags');
      assert.ok(Array.isArray(data), '应该返回数组');
      assert.ok(data.length > 0, '应该有标签数据');
      console.log('  所有标签:', JSON.stringify(data));
    });

    await runTest('9. 批量修改负责人', async () => {
      const batchIds = createdIssueIds.slice(0, 3);
      const data = await request('/issues/batch/assignee', {
        method: 'PATCH',
        body: JSON.stringify({
          ids: batchIds,
          assignee: '钱七',
        }),
      });
      assert.strictEqual(data.updated, 3, '应该更新3条记录');

      for (const id of batchIds) {
        const issue = await request(`/issues/${id}`);
        assert.strictEqual(
          issue.assignee,
          '钱七',
          `问题 ${id} 的负责人应该更新为钱七`
        );
      }
    });

    await runTest('9.1 批量修改状态', async () => {
      const batchIds = createdIssueIds.slice(3, 6);
      const data = await request('/issues/batch/status', {
        method: 'PATCH',
        body: JSON.stringify({
          ids: batchIds,
          status: 'resolved',
        }),
      });
      assert.strictEqual(data.updated, 3, '应该更新3条记录');

      for (const id of batchIds) {
        const issue = await request(`/issues/${id}`);
        assert.strictEqual(
          issue.status,
          'resolved',
          `问题 ${id} 的状态应该更新为已解决`
        );
      }
    });

    await runTest('10. 搜索功能 - 边界测试（空关键词）', async () => {
      const data = await request('/issues?keyword=');
      assert.ok(Array.isArray(data.data), '空关键词应该返回正常结果');
    });

    await runTest('10.1 搜索功能 - 无结果搜索', async () => {
      const data = await request('/issues?keyword=不存在的关键词12345');
      assert.strictEqual(data.total, 0, '无结果时total应该为0');
      assert.deepStrictEqual(data.data, [], '无结果时data应该为空数组');
    });

    await runTest('11. 输入验证 - 缺失必填字段', async () => {
      try {
        await request('/issues', {
          method: 'POST',
          body: JSON.stringify({
            customerName: '',
            channel: '在线客服',
            description: '测试',
            tags: [],
            status: 'pending',
            assignee: '李四',
          }),
        });
        throw new Error('应该抛出验证错误');
      } catch (err) {
        assert.ok(
          err instanceof Error && err.message.includes('客户名称'),
          '应该返回客户名称不能为空的错误'
        );
      }
    });

    await runTest('12. 删除问题', async () => {
      const data = await request(`/issues/${createdIssueId}`, {
        method: 'DELETE',
      });
      assert.ok(data.success, '删除应该成功');

      try {
        await request(`/issues/${createdIssueId}`);
        throw new Error('应该返回404');
      } catch (err) {
        assert.ok(
          err instanceof Error && err.message.includes('不存在'),
          '删除后应该查询不到'
        );
      }
    });
  } finally {
    await stopTestServer(server);
    await cleanupTestDb();
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试结果汇总');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n总测试数: ${results.length}`);
  console.log(`通过: ${passed} ✅`);
  console.log(`失败: ${failed} ❌`);
  console.log(`通过率: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n失败的测试:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    process.exit(1);
  } else {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  }
}

main().catch(async (err) => {
  console.error('测试运行失败:', err);
  process.exit(1);
});
