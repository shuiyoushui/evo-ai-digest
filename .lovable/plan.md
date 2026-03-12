

## 计划：排名权重总和 100% 校验

### 分析

当前排名权重有 4 个 Slider（投票、浏览、评论、时间衰减），各自独立可调 0-100，但保存时没有验证总和是否为 100%。用户希望：

1. **保存时校验总和 = 100%**，不满足则阻止保存并提示
2. **权重调整后排名暂时维持不变** — 当前已是如此，`get_products_with_upvotes` 函数仅按 `upvote_count desc` 排序，未使用权重，无需改动

### 变更

**`src/pages/Admin.tsx`** — 仅改动 `handleSaveWeights` 函数和 UI：

- `handleSaveWeights` 开头增加校验：`weights.upvotes + weights.views + weights.comments + weights.decay !== 100` 时 `toast.error("权重总和必须为 100%")` 并 return
- Slider 区域下方增加实时总和显示（如 `80/100`），总和 ≠ 100 时红色提示
- 保存按钮在总和 ≠ 100 时 disabled

单文件改动，无数据库变更。

