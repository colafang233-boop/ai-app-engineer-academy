# Course Runtime Architecture

## 目标

把当前“每节课自己维护 HTML、状态和事件监听”的单文件实现，逐步迁移为：

```text
LessonConfig
    ↓
CourseRuntime
    ↓
Interaction Primitive / Simulator
    ↓
ArtifactStore + ProgressStore
```

这里的“自动生成课程”不是让大模型自动写课程，而是 Runtime 根据明确的 JavaScript 配置渲染页面、管理状态并装载交互模拟器。

## 分层

### 1. LessonConfig

课程配置只描述教学意图：

- 标题与导语
- 阶段顺序
- 预测题和迁移题
- 使用哪个模拟器
- 模拟器参数
- 读取哪些前置产物
- 写出什么课程产物

示例：

```js
{
  id: 'lesson-03-typescript-repair',
  stages: [
    { type: 'prediction', ... },
    {
      type: 'simulator',
      simulator: 'code-repair',
      config: {
        artifactInputs: ['businessRisk', 'languageDecision'],
        artifactOutput: 'tsSource',
        issues: [...]
      }
    },
    { type: 'content', ... },
    { type: 'quiz', ... }
  ]
}
```

### 2. CourseRuntime

Runtime 负责所有课程共享行为：

- 渲染课程 Hero 与阶段结构
- 按顺序解锁阶段
- 挂载 Prediction Gate
- 挂载 Retryable Quiz
- 装载课程指定的 Simulator
- 保存阶段和课程完成状态
- 发出阶段、产物和课程事件
- 恢复本地学习进度

Runtime 不理解 TypeScript、Prompt、RAG 或 Agent。它只理解“阶段”和“组件”。

### 3. Interaction Primitives

可跨课程复用的低层交互：

- `prediction-gate`
- `retryable-quiz`
- 后续增加 `range-lab`
- `budget-picker`
- `concept-linker`
- `pipeline-gates`
- `step-simulator`

Primitive 只解决一种交互行为，不包含特定课程知识。

### 4. Lesson Simulators

Simulator 对应知识点自己的实验装置：

- `code-repair-lab`
- 后续的 `context-window-lab`
- `rule-routing-lab`
- `structured-output-lab`
- `few-shot-map-lab`
- `prompt-evaluation-lab`

Simulator 可以有自己的复杂状态，但通过统一接口接入 Runtime：

```js
mountSimulator({
  root,
  config,
  artifacts,
  eventBus,
  onComplete
});
```

### 5. ArtifactStore

ArtifactStore 保存真正跨课流动的产物。

当前保持与 V3 的 localStorage key 兼容：

```text
ai-academy-artifacts-v3
```

因此旧版已经产生的数据不会因为迁移而丢失。

计划中的产物流：

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

### 6. ProgressStore

ProgressStore 与 ArtifactStore 分离。

- ArtifactStore 回答“学员做出了什么”。
- ProgressStore 回答“学员完成了哪些阶段”。

这能避免把解锁状态、考试状态和课程产物混在同一个对象里。

### 7. EventBus

EventBus 将模块解耦：

```text
artifact:change
artifact:reset
progress:change
stage:complete
lesson:complete
```

总控台、调试面板、埋点和教师模式以后都可以订阅事件，而不需要侵入课程组件。

## 第一条迁移样板：第 3 课

第 3 课已经迁移为第一个配置驱动案例：

```text
courses/ai-app-engineering/lessons/lesson-03.js
```

它使用：

- 通用预测门
- `code-repair-lab` 模拟器
- 通用内容揭示阶段
- 可重试迁移题
- `ArtifactStore.tsSource`

预览入口：

```text
apps/runtime-preview/index.html
```

本地启动：

```bash
python3 -m http.server 8000
```

打开：

```text
http://localhost:8000/apps/runtime-preview/
```

## 渐进迁移原则

1. V3 主页面继续可用，不做一次性推翻。
2. 每次只迁移一节课或一个交互原语。
3. 新 Runtime 读取旧 ArtifactStore 数据。
4. 每个新组件必须有独立测试。
5. 迁移完成前，旧课考试和总控台逻辑保持不变。

## 下一步

1. 将第 4 课迁移为 `context-window-lab`。
2. 将第 6 课迁移为 `rule-routing-lab`。
3. 为 Runtime 增加统一导航、考试接口和 Dashboard adapter。
4. 将浏览器预览升级为 Playwright 端到端测试。
5. 再将第 7、8、9 课迁移到专属模拟器。
