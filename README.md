# 客服问题标签归档看板

Customer Service Issue Archive Dashboard

一个用于管理和归档客服问题的全栈 Web 应用，支持问题录入、标签分类、多维度筛选、批量操作和数据统计分析。

## 项目用途

本项目旨在帮助客服团队高效管理客户问题，通过标签系统对问题进行分类归档，支持多维度筛选和数据统计，便于团队追踪问题处理进度、分析高频问题、优化客服工作流程。

主要功能包括：

- **问题管理**：录入、编辑、删除客服问题记录
- **标签系统**：支持预设标签和自定义标签，便于问题分类
- **多维度筛选**：关键词搜索、多标签筛选、状态筛选、负责人筛选
- **批量操作**：批量修改负责人、批量修改状态
- **数据统计**：未解决问题数量统计、按负责人统计、高频问题标签展示
- **分页浏览**：支持大量数据的分页展示和排序

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **状态管理**：Zustand
- **后端**：Express.js + TypeScript
- **数据库**：SQLite3
- **图标**：Lucide React
- **HTTP 客户端**：原生 Fetch API

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务

同时启动前端开发服务器（端口 5173）和后端 API 服务器（端口 3001）：

```bash
npm run dev
```

启动后访问：http://localhost:5173

### 仅启动前端

```bash
npm run client:dev
```

### 仅启动后端

```bash
npm run server:dev
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同时启动前端和后端开发服务 |
| `npm run client:dev` | 仅启动前端开发服务 |
| `npm run server:dev` | 仅启动后端开发服务 |
| `npm run check` | TypeScript 类型检查 |
| `npm run build` | 构建生产版本（先执行类型检查） |
| `npm run lint` | ESLint 代码检查 |
| `npm run test` | 运行 API 接口验证测试 |
| `npm run preview` | 预览生产构建结果 |

## 接口验证

### 运行测试

```bash
npm run test
```

测试脚本特性：

- **独立测试数据库**：自动使用 `issues.test.db` 作为测试数据库，不影响开发数据
- **自动清理**：测试前自动删除旧的测试数据库，测试完成后自动清理
- **独立测试服务器**：在端口 3002 启动独立的测试服务器，不冲突开发服务
- **完整覆盖**：覆盖所有 API 接口，包括增删改查、筛选、批量操作、统计等

测试覆盖的接口：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/issues` | GET | 获取问题列表（支持筛选、分页、排序） |
| `/api/issues/:id` | GET | 获取单个问题详情 |
| `/api/issues` | POST | 创建新问题 |
| `/api/issues/:id` | PUT | 更新问题 |
| `/api/issues/:id` | DELETE | 删除问题 |
| `/api/issues/batch/assignee` | PATCH | 批量修改负责人 |
| `/api/issues/batch/status` | PATCH | 批量修改状态 |
| `/api/stats/unresolved-by-assignee` | GET | 按负责人统计未解决数量 |
| `/api/stats/hot-tags` | GET | 高频问题标签统计 |
| `/api/tags` | GET | 获取所有标签列表 |

## 类型检查

```bash
npm run check
```

该命令执行 TypeScript 类型检查但不生成输出文件，用于快速验证类型正确性。

## 构建

```bash
npm run build
```

构建流程：
1. 先执行 `tsc -b` 进行类型检查和编译
2. 再执行 `vite build` 进行前端构建
3. 构建产物输出到 `dist` 目录

## 数据库

### 文件位置

- 开发数据库：`data/issues.db`
- 测试数据库：`data/issues.test.db`（自动创建和清理）

### 数据库结构

数据库表结构定义在 `migrations/001_init.sql` 中，包含 `issues` 表，字段如下：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER | 主键，自增 |
| `customer_name` | TEXT | 客户名称 |
| `channel` | TEXT | 反馈渠道（电话、在线客服、邮件等） |
| `description` | TEXT | 问题描述 |
| `tags` | TEXT | 标签（JSON 数组格式存储） |
| `status` | TEXT | 状态（pending/processing/resolved/closed） |
| `assignee` | TEXT | 负责人 |
| `solution` | TEXT | 解决方案 |
| `created_at` | DATETIME | 创建时间 |
| `updated_at` | DATETIME | 更新时间 |

### 示例数据初始化

首次启动时，如果数据库为空，会自动初始化 8 条示例数据，定义在 `api/db/index.ts` 的 `seedInitialData` 函数中。示例数据包含：

- 不同渠道的客户问题
- 多种标签分类
- 不同处理状态
- 不同负责人分配
- 部分已解决问题带解决方案

如果需要重新初始化示例数据，可以删除 `data/issues.db` 文件后重启服务。

## 项目结构

```
.
├── api/                    # 后端代码
│   ├── db/                 # 数据库连接和初始化
│   ├── repositories/       # 数据访问层
│   ├── routes/             # API 路由定义
│   ├── services/           # 业务逻辑层
│   ├── app.ts              # Express 应用配置
│   ├── server.ts           # 开发服务器入口
│   └── index.ts            # Vercel 部署入口
├── data/                   # 数据库文件目录
├── migrations/             # 数据库迁移脚本
├── public/                 # 静态资源
├── shared/                 # 共享类型定义
│   └── types.ts            # 前后端共用的类型定义
├── src/                    # 前端代码
│   ├── components/         # React 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具函数
│   ├── pages/              # 页面组件
│   ├── store/              # Zustand 状态管理
│   ├── utils/              # API 调用封装
│   ├── App.tsx             # 应用根组件
│   └── main.tsx            # 应用入口
├── tests/                  # 测试文件
│   └── api.test.ts         # API 接口验证测试
├── index.html              # HTML 入口
├── package.json            # 项目配置
├── tailwind.config.js      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 配置
```

## 主要功能说明

### 问题录入

点击"新建问题"按钮，填写以下信息：
- 客户名称（必填）
- 反馈渠道（必填）
- 问题描述（必填）
- 标签（可多选预设标签或自定义）
- 处理状态
- 负责人（必填）
- 解决方案（可选）

### 问题编辑

点击问题卡片右上角的编辑图标，可修改问题的所有信息。

### 问题删除

点击问题卡片右上角的删除图标，确认后删除问题。

### 筛选功能

- **关键词搜索**：在搜索框输入关键词，可搜索客户名称、问题描述、解决方案
- **标签筛选**：点击"标签筛选"，可多选标签进行筛选
- **状态筛选**：通过状态下拉框筛选待处理、处理中、已解决、已关闭
- **负责人筛选**：通过负责人下拉框筛选指定负责人的问题

### 批量操作

1. 勾选需要操作的问题（可全选当前页）
2. 在批量操作栏中选择：
   - 批量分配负责人
   - 批量修改状态

### 数据统计

右侧面板展示：
- 未解决问题总数
- 按负责人统计的未解决数量（条形图）
- 高频问题标签（词云样式，字体大小反映使用频率）

## 已知限制

1. **单用户系统**：当前版本不支持多用户登录和权限控制，所有用户看到的数据相同
2. **SQLite 限制**：使用 SQLite 作为数据库，适合中小规模数据，高并发场景建议改用 PostgreSQL 或 MySQL
3. **标签限制**：自定义标签仅支持纯文本，不支持标签颜色、图标等自定义属性
4. **附件支持**：当前版本不支持上传附件或图片
5. **导出功能**：暂不支持数据导出为 Excel 或 CSV 格式
6. **实时更新**：数据变更后需要手动刷新或触发重新获取，不支持 WebSocket 实时推送
7. **测试数据库**：测试使用独立数据库文件，不支持内存数据库模式
8. **部署限制**：Vercel 部署时 SQLite 数据会在函数实例重启后丢失，生产环境建议使用外部数据库

## 开发建议

- 如需支持多用户，可在 `issues` 表中添加 `user_id` 字段，并引入用户认证系统
- 如需支持更大规模数据，建议更换数据库为 PostgreSQL
- 如需实时更新，可引入 Socket.IO 或 Server-Sent Events
- 如需导出功能，可使用 `json2csv` 或 `exceljs` 库实现

## License

MIT
