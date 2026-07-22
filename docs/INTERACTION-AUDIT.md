# 交互课程源码审查与前两专栏优化报告

## 结论

当前课程已经解决了“统一视觉”和“顺序解锁”，但交互层过度依赖同一页面母版。  
下一阶段不应该继续复制一个更大的母版，而应拆成：

1. **共享教学语法**：章节、预测门、概念揭示、迁移题、进度。
2. **可复用交互原语**：滑块、开关、预算选择、分支树、逐步模拟、窗口溢出、检查门、代码运行器。
3. **知识点专属模拟器**：每节课选择最贴合概念的实验装置。
4. **活的串联桥**：上一课产出的真实对象，进入下一课，而不是只解锁按钮。

原项目真正值得学习的不是某一个页面外观，而是“共享 common.js + 每页专属模拟器”的分工。

---

## 一、原项目源码中可抽象的交互方式

### A. 通用教学层

#### 1. Prediction Gate

学习者先作答，不论答对答错都解锁实验。  
关键点：**预测只负责暴露直觉，不应该成为惩罚或死锁。**

#### 2. Retryable Quiz

答错时只标记当前答案并给反馈，其他选项仍然可以继续尝试。  
我们第三课此前的卡死，正是因为把答错误当成“作答结束”。

#### 3. Concept Linker

用统一的数据标记把三类对象连接起来：

- 术语或公式项
- 图中的对应部件
- 代码中的对应表达

悬停任意一处，其余位置同步高亮。

#### 4. Manual Check

不是所有验证都用选择题。让学习者填数字、字段、代码片段或排序结果，再进行容差/规则检查。

#### 5. Progress Ledger

页面只记录真正完成的能力点，而不是滚动过某个章节就算完成。

#### 6. Help Drawer

高级名词不提前塞进正文。需要时从右下角打开速查，不破坏主线阅读。

#### 7. Runtime Block

原项目使用 Pyodide 真正运行 Python。我们的 TS 课程应该对应为 WebContainer/Node 运行器，而不是只播放预设输出。

---

### B. 连续参数与对比实验

#### 8. Range Lab

拖动一个连续变量，图形、数字、解释同时变化。

适合：

- Temperature
- Token 预算
- 置信度阈值
- Context window
- Chunk size / overlap
- Top-K

#### 9. Toggle Compare

只开关一个条件，左右或前后对比。

适合：

- 有/无 System Prompt
- 有/无 Few-shot
- 有/无 Schema
- 有/无业务校验
- 有/无位置/记忆/工具

#### 10. Preset Explorer

提供几个极端预设，帮助学习者迅速看到规律，而不是要求每次手动调到正确参数。

---

### C. 空间、选择与预算

#### 11. Spatial Map

在 SVG/Canvas 里点击两个对象，画连线、距离或相似度。

可迁移到：

- Few-shot 示例相似度
- Embedding 和 Retriever
- Tool/Intent 的语义边界
- Prompt 样例聚类

#### 12. Budget Picker

每个候选项有价值和成本，用户只能在有限预算内选择。

适合：

- Few-shot 示例
- Context 内容
- Tool 暴露范围
- RAG 检索文档
- Token 分配

#### 13. Sort / Rank / Group

让用户拖动排序或分组，比选择题更适合表达优先级和分类边界。

---

### D. 流程与动态系统

#### 14. Branch Tree

每次选择一个分支，下一层选项和累计结果实时变化。

适合：

- 条件路由
- Agent 决策
- Tool loop
- 多意图优先级
- MCP 工具选择

#### 15. Step Simulator

提供：

- 走一步
- 自动运行
- 暂停
- 重置
- 轨迹
- 发散/失败状态

适合：

- Agent loop
- Retry
- Query rewrite
- Checkpoint 恢复
- Prompt repair loop

#### 16. Window Eviction

随着内容增加，旧内容逐渐被挤出可见范围。

适合：

- 对话上下文
- Token 限制
- Memory
- RAG Context
- Tool result accumulation

#### 17. Pipeline Gates

数据依次经过多个独立检查，每个门都给出不同失败原因。

适合：

- JSON 语法
- Zod Schema
- 业务规则
- 权限
- Human approval
- Citation verification

#### 18. Random Sampling / Repeated Runs

同一设置运行多次，用分布而不是单次输出展示概率性。

适合：

- Temperature
- LLM 分类波动
- Agent工具选择
- Prompt稳定性

---

### E. 贯穿课程的机制

#### 19. Live Bridge

原项目最重要的设计之一：上一课的输出不是截图，而是下一课的输入。

我们需要一个课程级 `ArtifactStore`：

```ts
type CourseArtifacts = {
  taskContract?: TaskContract;
  languageDecision?: LanguageDecision;
  tsSource?: string;
  messages?: BaseMessage[];
  promptV1?: PromptSpec;
  rules?: ClassificationRules;
  outputSchema?: string;
  fewShotExamples?: Example[];
  evaluationDataset?: TestCase[];
  promptV2?: PromptSpec;
};
```

#### 20. One Growing Project

前两专栏已经大量使用“邮件分类”场景，这是优势。  
问题是它现在只是主题重复，没有真正共享数据。

应该把它升级为同一个持续成长的项目：

```text
第1课：确定业务风险
第2课：选择TS路线
第3课：生成可运行骨架
第4课：构造Messages
第5课：产出Prompt v1
第6课：补齐规则与优先级
第7课：加入Zod Schema
第8课：加入Few-shot
第9课：用评估集产出Prompt v2
```

---

## 二、当前两专栏的重复性扫描

当前单文件中共有 9 节完整课程：

- 9 套预测门
- 9 套四章节结构
- 9 套课末选择题
- 27 个预测选项
- 30 个课末 Quiz 选项
- 32 张概念映射卡

这些共享结构本身没有问题，问题是第二专栏多节课都使用了相似节奏：

```text
先猜
→ 点击若干部件
→ 看一段预设结果
→ 四张总结卡
→ 再做选择题
```

学习者会逐渐从“探索”变成“猜页面作者希望我点什么”。

---

## 三、逐课优化建议

### 第 1 课：CRUD 与 AI 应用

**保留**：装配工作台，很适合建立系统层次。  
**增加**：

- 同一邮件连续运行 20 次
- 显示分类分布
- 打开业务规则后分布收敛
- 打开 Schema 后不是“更准确”，而是“格式更稳定”
- 设置过低置信度阈值，故意触发一次错误自动流转

这会把“概率性”从一句话变成可见分布。

### 第 2 课：为什么选 TS

**保留**：Java/Python/TS 按项目条件评分。  
**改造**：

- 固定的三个场景改成自由条件混合器
- 开关“已有Spring团队”“需要科学计算”“在线课程”“前后端共享类型”“MCP”
- 三种语言的匹配度实时变化
- 点击某一分数，展开具体理由和代价

### 第 3 课：最小 TypeScript

**当前最大问题**：仍然像第 1 课一样安装四个部件。  
**应替换为**：真实编译器/编辑器修复实验。

流程：

```text
红线：找不到import
→ 修package.json和ESM
→ 红线：Promise未await
→ 修async/await
→ 编译通过但运行返回错误字段
→ Zod在运行时挡住
```

这节课最适合做真实 WebContainer Demo。

### 第 4 课：一次模型请求

**当前问题**：继续使用装配式模块。  
**应替换为**：消息传送带 + 上下文行李箱。

学习者把 System、History、User、Reference 拖入有限窗口：

- 少了历史：“那个方案”无法理解
- 塞得太多：关键规则被淹没
- 内容超过预算：早期消息被挤出
- 输出预算太小：回答被截断

### 第 5 课：Prompt 组成

**保留**：Prompt 槽位。  
**增强**：反事实删除。

Prompt 完整后，学习者逐块删除：

- 删任务：模型不知道要做什么
- 删规则：边界摇摆
- 删输出：返回散文
- 删失败策略：开始猜

比“依次装上去”更能证明每一块为什么存在。

### 第 6 课：可执行指令

**应改成**：规则决策台。

屏幕持续进入邮件，学习者可以：

- 改类别定义
- 拖动优先级
- 设置多意图规则
- 设置 unknown 条件

每次规则变化，历史测试邮件重新路由，立刻看到误判。

### 第 7 课：结构化输出

**当前三道门值得保留。**  
需要增加真实编辑：

- 左侧编辑 JSON
- 中间显示 `JSON.parse`
- 再显示 Zod `safeParse`
- 最后显示业务校验
- 错在哪里，光标直接定位哪个字段

不要只让学习者从四个预设结果里选择。

### 第 8 课：Few-shot

**当前预算选择是正确方向。**  
建议加入语义地图：

- 当前邮件在中央
- 候选示例分布在周围
- 近例体现相关性
- 同类示例扎堆表示重复
- 边界例和失败例用不同形状
- 预算内同时兼顾相关性、覆盖和多样性

### 第 9 课：Prompt 评估

**保留**：v1/v2 同集比较。  
**增强**：

- 测试案例逐条流过两个版本
- 可以筛选“只看回归”
- 点击失败案例展开输入、预期、实际和原因
- 修改 Prompt 一行后重新运行
- 允许把新发现的边界例加入 Golden Dataset

---

## 四、推荐的组件架构

```text
CourseRuntime
├── ProgressStore
├── ArtifactStore
├── EventBus
├── PredictionGate
├── RetryableQuiz
├── ConceptLinker
├── HelpDrawer
├── LiveCodeRunner
└── BridgeBus

InteractionPrimitives
├── RangeLab
├── ToggleCompare
├── PresetExplorer
├── BudgetPicker
├── SpatialMap
├── BranchTree
├── StepSimulator
├── WindowEviction
├── PipelineGates
├── ErrorInjection
└── ExperimentMatrix

LessonSimulators
├── CrudVsAiDistributionLab
├── LanguageConstraintMixer
├── TypeScriptRepairLab
├── MessageWindowLab
├── PromptAnatomyLab
├── RuleRoutingLab
├── StructuredOutputLab
├── FewShotMapLab
└── PromptEvaluationLab
```

---

## 五、实施优先级

### P0：先修架构

1. 把每课的全局选择器改成课程作用域。
2. 建立 `ArtifactStore` 和 `LiveBridge`。
3. 把答错可重试固化为统一组件。
4. 抽离共享进度、导航和考试逻辑。

### P1：优先改造最重复的三课

1. 第 3 课 → 真实 TS 修复实验
2. 第 4 课 → 消息窗口/Token 行李箱
3. 第 6 课 → 规则决策台

这三课改完，整体“模板重复感”会明显下降。

### P2：增强第二专栏的高价值实验

1. 第 7 课加入真实 JSON/Zod 编辑
2. 第 8 课加入 Few-shot 语义地图
3. 第 9 课加入可重跑的评估矩阵

### P3：再统一产品化

1. 课程状态序列化
2. 自动保存与恢复
3. 教师模式
4. 每课数据埋点
5. 可访问性与 reduced-motion
6. 真正的 WebContainer 运行环境

---

## 六、版权与复用边界

目标仓库当前文件列表中没有看到 LICENSE。  
因此建议：

- 学习教学机制和交互思路
- 自己重写组件实现
- 不直接复制源码或样式
- 若要直接复用代码，先获得作者授权

本报告附带的交互目录与建议均为重新抽象和重新设计，不包含目标仓库源码。
