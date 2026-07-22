# AI 应用开发学院

面向 Java 开发者的互动式 AI 应用工程课程。

当前仓库同时保留：

- `apps/academy/`：早期单文件 V3 版本，用于对照和回退。
- `apps/runtime-academy/`：配置驱动、正式产品化的 CourseRuntime 版本。

## 推荐体验入口

在仓库根目录启动静态服务器：

```bash
python3 -m http.server 8000
```

正式学习模式：

```text
http://localhost:8000/apps/runtime-academy/
```

课程导览模式：

```text
http://localhost:8000/apps/runtime-academy/?preview=1
```

开发者调试模式：

```text
http://localhost:8000/apps/runtime-academy/?debug=1
```

## 当前课程

### 专栏一：从 CRUD 到模型请求

1. 从 CRUD 到概率系统
2. 如何选择项目语言
3. 修复异步模型调用
4. 组装一次模型请求

### 专栏二：Prompt 与输出契约工程

5. Prompt 的五个组成部分
6. 让分类规则可执行
7. 验证结构化输出
8. 选择有效的 Few-shot 示例
9. 建立 Prompt 回归测试

## 项目成果流

```text
AI 应用风险清单
→ 技术路线选择
→ TypeScript 调用骨架
→ 模型请求消息包
→ Prompt v1
→ 分类规则与优先级
→ 结构化输出契约
→ Few-shot 示例集
→ Prompt 评估报告
```

## 仓库结构

```text
apps/runtime-academy/             正式课程产品入口
packages/course-runtime/          课程运行时、进度、成果和交互组件
courses/ai-app-engineering/       课程配置与产品文案层
docs/                             架构、交互和 QA 文档
tools/                            自动化检查脚本
```

## 开发原则

1. Runtime 必须隐藏在产品体验之下。
2. 课程共享教学语法，但每个知识点使用专属实验装置。
3. 答错必须允许重试，不允许状态机死锁。
4. 上一课成果必须能流入下一课。
5. 正式界面使用学员语言，不暴露 ArtifactStore、Simulator 等内部概念。
6. 调试能力只在 `?debug=1` 下出现。
7. 每次提交前检查脚本语法、完整解锁流程、产品文案和移动端溢出。

## 自动检查

```bash
node tools/test_course_runtime.mjs
node tools/test_runtime_full.mjs
node tools/test_product_surface.mjs
```
