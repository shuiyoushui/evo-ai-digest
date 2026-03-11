

## Bug 根因分析

通过直接查询数据库确认：

1. **RLS 策略已全部是 PERMISSIVE** — 上次迁移生效了，策略本身没有问题
2. **真正的根因：`user_roles` 表为空** — 没有任何用户被分配 admin 角色

所有写操作的 RLS 策略都检查 `has_role(auth.uid(), 'admin')`，由于 `user_roles` 表中没有数据，所有 admin 写操作（Banner 增删改、模块开关、分类新增、LLM 配置等）全部被 RLS 拒绝。

数据库中现有两个用户：
- `123456@qq.com` (id: `08bcad78-...`)
- `123456789@phone.agenthunt.local` (id: `d8f9760b-...`)

## 修复方案

### 1. 数据库操作 — 为用户分配 admin 角色

向 `user_roles` 表插入 admin 角色记录（两个用户都赋予 admin）：

```sql
INSERT INTO user_roles (user_id, role) VALUES 
  ('08bcad78-e54f-4073-a149-d249a93edac1', 'admin'),
  ('d8f9760b-6250-47fc-8d00-da9e80398359', 'admin');
```

### 2. 验证测试

分配角色后，所有 5 个 bug 应自动修复：
- Banner 新增/启用/删除
- 产品详情页模块开关
- 服务中心分类新增
- 大模型优选新增
- 配置变更在关联模块生效

### 3. 测试方案

修复后需验证：
1. Admin 页面 Banner 配置的新增、启用/禁用、删除
2. 产品详情页模块 Switch 开关
3. 服务中心一级/二级分类新增
4. 大模型优选新增并在 MakerStudio 页面生效
5. 分类变更后首页侧边栏同步更新
6. 刷新页面后配置持久化

无需前端代码改动。

