# AI 应用开发学院

面向 Java CRUD 开发者的交互式 AI 应用开发课程。

## 当前可体验版本

完整的 CourseRuntime 体验入口：

```text
apps/runtime-academy/index.html
```

本地启动：

```bash
python3 -m http.server 8000
```

打开：

```text
http://localhost:8000/apps/runtime-academy/
```

当前覆盖：

- 专栏一：从 Java CRUD 到模型请求
- 专栏二：Prompt 与输出契约工程
- 9 节配置驱动课程
- 9 种知识点专属互动实验
- 2 次专栏综合考试
- 顺序解锁与体验模式
- ArtifactStore 课程产物账本
- ProgressStore 进度和考试记录

旧版单文件课程仍保留在：

```text
apps/academy/index.html
```

## 课程产物流

```text
businessRisk
→ languageDecision
→ tsSource
→ messages
→ promptV1
→ classificationRules
→ outputSchema
→ fewShotExamples
→ evaluationReport
```

## 仓库结构

```text
apps/academy/                    原 V3 单文件课程
apps/runtime-academy/            完整 CourseRuntime 体验入口
apps/runtime-preview/            第 3 课迁移样板
packages/course-runtime/src/     Runtime、状态和模拟器
courses/ai-app-engineering/      课程配置
docs/                            架构、迁移和 QA 文档
tools/                           自动检查脚本
```

## 开发原则

1. 课程共享教学语法，但知识点使用专属实验装置。
2. 答错必须允许重试，不允许状态机死锁。
3. 上一课的真实产物进入下一课。
4. Runtime 管理通用行为，LessonConfig 只描述教学内容。
5. 新专栏必须通过 Runtime 扩展，不再回到单页手写状态机。
6. 每次提交前检查模块语法、课程配置、解锁状态和移动端溢出。

## 当前实验装置

| 课程 | Simulator |
|---|---|
| 01 | 重复运行分布实验 |
| 02 | 项目条件语言混合器 |
| 03 | TypeScript 代码修理厂 |
| 04 | Messages 上下文窗口 |
| 05 | Prompt 反事实删除实验 |
| 06 | 规则优先级路由台 |
| 07 | JSON / Schema / 业务三道验证门 |
| 08 | Few-shot 语义地图 |
| 09 | Prompt 评估与回归矩阵 |

## 下一步

- 完成 Runtime 版内容体验评审
- 将 Runtime 入口切换为主入口
- 开发专栏三：LangChain 核心开发
- 增加统一的浏览器端 Playwright CI
