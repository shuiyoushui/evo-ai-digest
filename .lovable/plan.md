

## 阿里云部署后的迭代与更新指导方案

本方案将作为 `docs/deployment-guide.md` 文件输出到项目中，供团队长期参考。

### 文档内容结构

**`docs/deployment-guide.md`** — 一份完整的运维迭代手册，涵盖以下章节：

---

#### 1. 部署架构概览
简述三层架构：前端（OSS + CDN）、后端函数（FC）、数据库（Supabase / RDS）

#### 2. 前端迭代流程
- 本地 `npm run build` 生成 `dist/`
- 通过 ossutil 或阿里云控制台上传到 OSS Bucket
- CDN 刷新缓存命令示例
- 环境变量说明（`VITE_SUPABASE_URL` 等需在构建前设置）

#### 3. 后端函数（FC）迭代流程
- `server/analyze-url/` 目录即为 FC 函数代码
- 修改后通过 Serverless Devs（s deploy）或控制台上传
- 环境变量在 FC 控制台配置（`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、AI/Scraper Key）
- 切换 AI 服务商：只需在管理后台修改 `ai_config` 表的 endpoint/model/key_name，无需改代码

#### 4. 数据库迭代流程
- Schema 变更：在 `supabase/migrations/` 目录编写新的 SQL 文件
- 连接 RDS/Supabase 执行 migration（psql 或控制台 SQL 编辑器）
- RLS 策略和函数变更同样通过 SQL 脚本管理
- 注意事项：先在测试环境验证，再应用到生产

#### 5. AI 服务商切换
- 管理后台 → 系统配置 → AI 智能解析配置
- 可修改字段：`ai_endpoint`、`model`、`ai_api_key_name`
- 常用配置示例表（DeepSeek、通义千问、Lovable AI Gateway）
- FC 环境变量中需确保对应的 Key 已配置

#### 6. 常见迭代场景速查

| 场景 | 操作 |
|---|---|
| 修改前端 UI/功能 | 改代码 → build → 上传 OSS → 刷新 CDN |
| 修改 AI 解析逻辑 | 改 `server/analyze-url/index.js` → 部署 FC |
| 切换 AI 模型 | 管理后台修改 ai_config，FC 配置对应 Key |
| 新增数据库表/字段 | 写 migration SQL → 在数据库执行 |
| 新增后端 API | 在 `server/` 新建目录 → 部署为新的 FC 函数 |
| 更新环境变量 | FC 控制台 / 构建脚本中修改 |

#### 7. 回滚策略
- 前端：OSS 版本管理或保留上一版 dist 包
- FC：函数版本/别名机制
- 数据库：备份 + 逆向 migration

### 实现方式

创建 `docs/deployment-guide.md`，约 200 行 Markdown 文档。无代码变更，纯文档输出。

