# AI 应用开发学院

面向 Java CRUD 开发者的交互式 AI 应用开发课程。

当前版本覆盖：

- 专栏一：从 Java CRUD 到 AI 应用
- 专栏二：Prompt 与输出契约工程
- 课程总控台、顺序解锁、课末考试和专栏考试
- 多样化交互实验与课程级 ArtifactStore

## 本地打开

直接打开：

```text
apps/academy/index.html
```

页面是单文件应用，不依赖远程 CSS、字体或图片。

## 当前课程产物流

```text
业务风险
→ 语言选型
→ TypeScript 源码
→ Messages
→ Prompt v1
→ 分类规则
→ Zod Schema
→ Few-shot 示例
→ 评估报告
```

## 仓库结构

```text
apps/academy/                  当前可运行课程平台
docs/                          教学、交互与质量审查文档
config/interaction-catalog.json 可复用交互原语目录
tools/                         生成与浏览器测试脚本
```

## 开发原则

1. 总控台与课程正文使用不同职责的页面结构。
2. 课程共享教学语法，但知识点使用专属实验装置。
3. 答错必须允许重试，不允许状态机死锁。
4. 上一课产物必须能流入下一课。
5. 文案优先使用老师会说的话，再引入术语。
6. 不提前引入当前课程不需要的高级知识。
7. 每次提交前检查脚本语法、重复 ID、移动端溢出和完整解锁流程。

## 后续路线

- 将 V3 多样交互重做版完整回归测试
- 抽离 CourseRuntime / ArtifactStore / InteractionPrimitives
- 增加真实 WebContainer TypeScript 运行器
- 开发专栏三：LangChain 核心开发
