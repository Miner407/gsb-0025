import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'issues.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const migrationPath = join(__dirname, '../../migrations/001_init.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  db.exec(migrationSql, (err) => {
    if (err) {
      console.error('Error executing migration:', err.message);
    } else {
      console.log('Database migration executed successfully');
      seedInitialData();
    }
  });
}

function seedInitialData() {
  db.get('SELECT COUNT(*) as count FROM issues', (err, row: { count: number }) => {
    if (err) {
      console.error('Error checking data:', err.message);
      return;
    }

    if (row.count === 0) {
      const seedData = [
        {
          customerName: '张三',
          channel: '电话',
          description: '用户无法登录账户，提示密码错误',
          tags: JSON.stringify(['账户问题', '认证']),
          status: 'pending',
          assignee: '李四',
          solution: '',
        },
        {
          customerName: '王五',
          channel: '在线客服',
          description: '支付后订单状态未更新',
          tags: JSON.stringify(['支付', '订单']),
          status: 'processing',
          assignee: '赵六',
          solution: '正在核实支付记录',
        },
        {
          customerName: '陈七',
          channel: '邮件',
          description: '退款申请已提交3天未处理',
          tags: JSON.stringify(['退款', '订单']),
          status: 'pending',
          assignee: '李四',
          solution: '',
        },
        {
          customerName: '周八',
          channel: 'APP反馈',
          description: '优惠券无法使用',
          tags: JSON.stringify(['优惠券', '促销']),
          status: 'resolved',
          assignee: '钱七',
          solution: '已补发新优惠券',
        },
        {
          customerName: '吴九',
          channel: '微信公众号',
          description: '收货地址修改失败',
          tags: JSON.stringify(['配送', '账户']),
          status: 'processing',
          assignee: '赵六',
          solution: '联系技术排查中',
        },
        {
          customerName: '郑十',
          channel: '在线客服',
          description: '商品质量问题，要求退换货',
          tags: JSON.stringify(['售后', '订单']),
          status: 'pending',
          assignee: '孙八',
          solution: '',
        },
        {
          customerName: '冯十一',
          channel: '电话',
          description: '咨询会员等级权益',
          tags: JSON.stringify(['使用咨询', '会员']),
          status: 'resolved',
          assignee: '周九',
          solution: '已详细解释会员权益',
        },
        {
          customerName: '陈十二',
          channel: 'APP反馈',
          description: 'APP闪退问题',
          tags: JSON.stringify(['系统故障', 'APP']),
          status: 'processing',
          assignee: '钱七',
          solution: '已转交技术团队',
        },
      ];

      const stmt = db.prepare(
        'INSERT INTO issues (customer_name, channel, description, tags, status, assignee, solution) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      seedData.forEach((data) => {
        stmt.run(
          data.customerName,
          data.channel,
          data.description,
          data.tags,
          data.status,
          data.assignee,
          data.solution
        );
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error seeding data:', err.message);
        } else {
          console.log('Initial data seeded successfully');
        }
      });
    }
  });
}

export function runQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });
}

export function allQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}
