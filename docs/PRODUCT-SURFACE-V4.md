# Product Surface V4

## 目标

CourseRuntime 继续负责状态、解锁、成果流转和模拟器装载，但这些实现细节不再暴露给学员。

正式产品界面现在遵循：

```text
学习路径
→ 课程叙事
→ 互动实验
→ 原理揭示
→ 迁移应用
→ 我的项目成果
```

而不是：

```text
Runtime
→ Simulator
→ Artifact key
→ Debug state
```

## 产品层变化

- 总控台改为正式学习路径首页。
- 增加继续学习入口和学习进度概览。
- `产物账本` 改为 `我的项目成果`。
- 隐藏 ArtifactStore 内部 key；仅在 `?debug=1` 下显示原始数据。
- 默认不显示重置、自由解锁和开发者工具。
- 使用 `?preview=1` 可进入课程导览模式。
- 使用 `?debug=1` 可打开开发者工具和原始状态。
- 课程章节恢复为：先判断、动手实验、原理揭示、迁移应用。
- 九节课的短标题、实验标题和描述全部改为学员语言。
- 实验区中的“前置产物、运行诊断、产物账本”等词汇已经产品化翻译。

## 入口

```bash
python3 -m http.server 8000
```

正式学习模式：

```text
http://localhost:8000/apps/runtime-academy/
```

自由导览模式：

```text
http://localhost:8000/apps/runtime-academy/?preview=1
```

开发者模式：

```text
http://localhost:8000/apps/runtime-academy/?debug=1
```

## 质量保护

`tools/test_product_surface.mjs` 会阻止以下回退：

- 正式入口重新出现 CourseRuntime / 配置驱动 / 完整体验版等调试描述。
- 正式导航重新显示“产物账本”或“体验模式”。
- 项目成果和学习路径等正式产品用语丢失。
- 第 3、8、9 课等关键产品标题退回模拟器命名。
