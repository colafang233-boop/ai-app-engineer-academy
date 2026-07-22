# AI 应用开发学院 · 前两专栏 QA 审查报告

审查对象：`index.html`  
审查日期：2026-07-22

## 1. 第三课卡死问题

### 根因一：错误答案被当成“作答结束”

第三课的迁移题和最终过关题在答错后，会把所有选项永久设为 `disabled`。由于课程完成条件要求这两题答对，用户一旦答错就无法再次作答，考试按钮永远无法解锁。

### 根因二：第一课监听器作用范围过大

第一课使用了全局选择器：

- `.prediction-option`
- `.multi-option`
- `.quiz-option`
- `.mapping-card`

当后续课程加入同名组件后，第一课监听器也会响应第三课和第二专栏的按钮，造成跨课程禁用和状态污染。

### 修复

- 第三课答错后只显示反馈，不禁用选项，允许立即重选。
- 答对后才锁定答案并写入完成状态。
- 第一课监听器全部限制在第一课容器内，不再影响后续课程。
- 使用浏览器真实验证：先故意答错，再重选正确答案，第三课考试按钮正常解锁。

---

## 2. 第二专栏课程结构

### 第 5 课：Prompt 里到底应该放什么？

依次补齐：

1. 任务与允许结果
2. 业务上下文
3. 判断规则
4. 输出要求
5. 信息不足时的失败方式

本课不讲 LangChain PromptTemplate API，先建立与具体框架无关的输入设计认知。

### 第 6 课：怎样把模糊要求写成可执行指令？

集中处理四类常见问题：

1. 类别定义含糊
2. 指令互相冲突
3. 多意图没有优先级
4. 信息不足没有合法出口

本课强调“减少模型需要自行脑补的地方”，不教授万能 Prompt 公式。

### 第 7 课：结构化输出与 Zod

明确拆成三层：

1. JSON 语法是否可解析
2. Zod Schema 是否满足字段、类型、枚举和范围
3. 跨字段业务规则是否合理

避免错误说法：“返回 JSON 就等于类型安全”或“Zod 通过就等于业务正确”。

### 第 8 课：Few-shot 行为编程

只讲：

- 典型正例
- 边界例
- 对比例
- 信息不足的失败例
- 有限 Token 预算下的示例选择

明确说明 Few-shot 把示例放进上下文，不会修改模型权重，也不替代规则和 Schema。

### 第 9 课：Prompt 评估、版本与回归

采用最小评估闭环：

1. 固定测试集
2. 被测试的 Prompt / 函数版本
3. 任务匹配的 Evaluator
4. 对比实验
5. 定位具体回归案例

强调平均分可能掩盖关键业务或安全案例的退化。

---

## 3. 循序渐进审查

第二专栏的前置知识仅为第一专栏内容：

- 模型不是普通确定性 Service
- TypeScript 最小异步和运行时校验知识
- Message、上下文和 Token 基础

第二专栏明确不提前教授：

- LangChain Agent / `createAgent`
- Tool Calling
- RAG 与向量数据库
- LangGraph State / Node / Edge
- MCP Server / Client API
- Prompt 自动优化算法
- 复杂 LLM-as-judge 校准
- 线上观测系统部署

结构化输出课只说明 LangChain 可以用 Zod Schema 请求结构化结果，不要求学员在本专栏掌握供应商策略或 Agent 响应格式；具体 API 留到 LangChain 专栏。

---

## 4. 直白性检查

采用以下写作规则：

- 先展示失败现象，再给技术名称。
- 每个术语首次出现时立即解释它解决什么问题。
- 避免“赋能、心智模型、范式升级、全链路闭环”等产品化表达。
- 用客服邮件、合同抽取等具体业务场景代替抽象定义。
- 答错后提供原因并允许重试，不使用只有红叉的惩罚式反馈。

页面中出现的关键术语均有就地说明：Prompt、Context、Structured Output、Schema、Business Validation、Few-shot、Dataset、Target、Evaluator、Regression。

---

## 5. 知识正确性依据

### Structured Output

LangChain JS 官方说明 Structured Output 用于返回特定且可预测的格式，而不是解析自然语言；模型层支持 Zod、JSON Schema 和 Standard Schema。课程因此使用 Zod 解释字段与类型验证，同时保留业务规则检查。

- https://docs.langchain.com/oss/javascript/langchain/structured-output
- https://docs.langchain.com/oss/javascript/langchain/models

### Few-shot

LangChain 官方将 Few-shot 描述为通过输入—输出示例更新 Prompt 来“编程”模型行为，并指出实际难点常在于根据当前输入选择最相关示例。课程因此强调边界例、对比例和示例选择，而不是堆数量。

- https://docs.langchain.com/oss/javascript/concepts/memory
- https://reference.langchain.com/javascript/langchain-core/prompts/FewShotPromptTemplate

### Evaluation

LangSmith 官方评估流程包含 Dataset、Evaluator 和 Experiment；Quickstart 将 Dataset、Target function 和 Evaluators 作为基本组成。课程据此设计 Prompt v1/v2 固定数据集对比，并展示具体回归案例。

- https://docs.langchain.com/langsmith/evaluation
- https://docs.langchain.com/langsmith/evaluation-quickstart
- https://docs.langchain.com/langsmith/evaluation-concepts
- https://docs.langchain.com/langsmith/prompt-engineering-concepts

---

## 6. 浏览器与交互测试

测试环境：Chromium Headless，桌面 1440×950，移动端 390×844。

通过项目：

- 第三课迁移题答错后仍可重选
- 第三课过关题答错后仍可重选
- 第三课最终可正常解锁考试
- 第 5～9 课全部可以完成并解锁各自考试
- Few-shot 选择错误后可以重置并重新选择
- 第二专栏综合考试入口按顺序开放
- 综合考试达到 80% 后显示第三专栏已解锁
- 第 5～9 课在 390px 宽度无页面级横向溢出
- 所有内联 JavaScript 通过 `node --check`
- 页面无重复 HTML ID
- 测试过程无 JavaScript page error 或 console error

详细机器结果：`test-results.json`

---

## 7. 加载与资源检查

- 单 HTML 文件运行。
- CSS 和 JavaScript 全部内联。
- 不依赖外部字体、图片、CSS 或脚本。
- 图示由 HTML、CSS 和内联 SVG 组成。
- 外部官方文档仅作为可点击参考链接，不影响页面加载和交互。
