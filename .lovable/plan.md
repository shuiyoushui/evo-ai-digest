

## 计划：服务中心数据驱动化 + AI 配置独立子 Tab

### 问题分析

1. **MakerStudio 服务中心页面**中的"自助推广"（种子用户获取、体验评测、用户规模增长）和"技术服务"（大模型接入、MCP 开发、其他云服务）仍然是**硬编码的常量数组** `selfServiceCards` 和 `techServiceCards`，未与 `service_categories` 表关联。管理后台的服务分类管理改了数据库但前台不会变。

2. **AI 智能解析配置**目前放在"服务中心配置"子 Tab 下，用户希望移到一个独立的"AI 配置"子 Tab。

### 变更内容

#### 1. `src/pages/Admin.tsx` — 系统配置增加第三个子 Tab

当前子 Tab：`展示配置` | `服务中心配置`

改为：`展示配置` | `服务中心配置` | `AI 配置`

- 将"AI 智能解析配置"卡片（lines 625-676）从 `service` TabsContent 移到新的 `ai` TabsContent
- 服务中心配置仅保留服务分类树形管理

#### 2. `src/pages/MakerStudio.tsx` — 从数据库读取服务分类

替换硬编码的 `selfServiceCards` 和 `techServiceCards`：

- 引入 `useServiceCategories` hook 获取数据
- 用 `service_categories` 中 `parent_id = null` 的记录作为**一级 Tab**（替代硬编码的"自助推广"/"技术服务"）
- 用对应 `parent_id` 的子记录作为**服务卡片**（替代硬编码的 3+3 张卡片）
- 只显示 `enabled = true` 的分类和服务
- 保留现有的点击交互逻辑（种子用户/体验评测/规模增长打开对应 Dialog，大模型接入打开 LLM 推荐 Dialog，其他服务打开通用咨询 Dialog）
- 图标映射：在代码中维护一个 `iconMap`（icon string → Lucide 组件），将数据库中的 icon 字段映射为组件

#### 3. 文件变更清单

| 文件 | 操作 |
|---|---|
| `src/pages/Admin.tsx` | 新增 `ai` 子 Tab，移入 AI 配置卡片 |
| `src/pages/MakerStudio.tsx` | 用 `useServiceCategories` 替换硬编码服务数组，动态渲染 Tab 和卡片 |

无数据库变更。

