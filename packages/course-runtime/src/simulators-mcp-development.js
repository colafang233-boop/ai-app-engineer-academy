import { mountChecklistLab, mountClassificationLab } from './mcp-lab-utils.js';

export function mountMcpStdioWorkbench(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-stdio-lab',
    title: '本地 stdio Server 修理厂',
    subtitle: '进程、协议流、环境变量和关闭信号',
    artifactName: 'localStdioServerContract',
    artifactNote: 'stdout 只承载协议，日志写 stderr，凭证由 Host 环境注入。',
    completeText: 'Academy 本地 stdio Server 已能被 Codex 安全启动。',
    lede: 'Codex 报错：Server disconnected before initialized',
    detail: '项目同时存在 stdout 日志、错误 cwd、硬编码 Token 和未处理退出信号。',
    checks: [
      { id: 'command', label: '固定 command / args / cwd', description: 'Host 能在正确目录启动入口' },
      { id: 'stderr', label: '日志全部写 stderr', description: 'stdout 保持纯 JSON-RPC 协议流' },
      { id: 'env', label: '凭证由 env 注入', description: '不写 Tool 参数和源码' },
      { id: 'errors', label: '处理未捕获异常', description: '记录错误并干净退出' },
      { id: 'signal', label: '处理 SIGTERM / EOF', description: '释放连接和资源' },
      { id: 'version', label: 'Server name/version/instructions', description: '初始化返回清晰元数据' },
    ],
    selects: [
      { id: 'transport', label: '本地 Transport', correct: 'stdio', options: [{ value: 'http', label: 'HTTP localhost' }, { value: 'stdio', label: 'StdioServerTransport' }] },
      { id: 'log', label: '日志输出', correct: 'stderr', options: [{ value: 'stdout', label: 'console.log' }, { value: 'stderr', label: 'console.error / stderr' }] },
    ],
    successCode: `const transport = new StdioServerTransport();\nawait server.connect(transport);\n// protocol → stdout\n// diagnostics → stderr`,
  }});
}

export function mountMcpToolContract(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-tool-contract-lab',
    title: '生产级 Tool Contract 工作台',
    subtitle: '少量、目标化、结构化、幂等、可审批',
    artifactName: 'mcpToolRegistry',
    artifactNote: '读写 Tool 分离，输出可验证，副作用可幂等，Host 可理解风险。',
    completeText: 'Academy MCP Tool Registry 已达到生产契约。',
    lede: '设计 search_lessons、save_quality_finding、trigger_preview_build',
    detail: '不能把 GitHub 和内部 API 的所有端点原样暴露。',
    checks: [
      { id: 'goals', label: '围绕用户目标合并 Tool', description: '避免数百个细碎 Endpoint' },
      { id: 'input', label: 'Zod inputSchema 含约束与描述', description: '模型知道格式与边界' },
      { id: 'output', label: 'outputSchema + structuredContent', description: 'Host 稳定读取结果' },
      { id: 'errors', label: '协议错误与业务失败分层', description: '可恢复失败不伪装异常' },
      { id: 'idempotency', label: '写 Tool 要求 idempotencyKey', description: '断线重试不重复副作用' },
      { id: 'audit', label: '返回 auditId 与状态', description: '可查调用结果' },
      { id: 'annotations', label: '声明只读/破坏性/幂等提示', description: '供 Host 做审批辅助，不当作唯一安全控制' },
    ],
    selects: [
      { id: 'approval', label: '生产部署 Tool', correct: 'always', options: [{ value: 'never', label: '永不审批' }, { value: 'always', label: '强制审批/门禁' }] },
      { id: 'token', label: '下游凭证来源', correct: 'server', options: [{ value: 'model', label: '模型参数' }, { value: 'server', label: 'Server 可信上下文/Secret' }] },
    ],
    successCode: `server.registerTool("save_quality_finding", {\n  inputSchema,\n  outputSchema,\n  annotations: { readOnlyHint: false, idempotentHint: true }\n}, handler);`,
  }});
}

export function mountMcpResourceWorkbench(args) {
  return mountClassificationLab({ ...args, definition: {
    className: 'mcp-resource-lab',
    title: 'Resource URI 与 Template 设计台',
    subtitle: '固定资源、资源族、订阅和版本',
    artifactName: 'mcpResourceContract',
    artifactNote: '课程内容以稳定 URI、MIME、版本和权限元数据暴露。',
    completeText: 'Academy Resource 与 Template 契约已完成。',
    categories: [
      { value: 'direct', label: 'Direct Resource' },
      { value: 'template', label: 'Resource Template' },
      { value: 'subscribe', label: 'Subscription / change notification' },
      { value: 'tool', label: 'Dynamic Tool' },
    ],
    items: [
      { id: 'columns', label: 'academy://columns', description: '专栏目录', answer: 'direct', why: '固定 URI' },
      { id: 'lesson', label: 'academy://lessons/{lessonId}', description: '课程内容族', answer: 'template', why: '参数化 URI' },
      { id: 'rubric', label: 'academy://quality-rubric', description: '固定质量标准', answer: 'direct', why: '固定只读内容' },
      { id: 'artifact', label: 'academy://artifacts/{name}', description: '项目成果族', answer: 'template', why: '参数化资源' },
      { id: 'changes', label: '课程版本变化', description: 'Client 已缓存内容', answer: 'subscribe', why: '通知重新读取' },
      { id: 'semantic', label: '按语义搜索 58 节课程', description: '动态查询和排序', answer: 'tool', why: '执行动态检索' },
      { id: 'progress', label: '实时 CI 运行状态', description: '动态外部状态', answer: 'tool', why: '查询实时系统' },
      { id: 'lesson-update', label: '订阅 lesson-26 变化', description: '资源更新', answer: 'subscribe', why: 'Resource subscription' },
    ],
  }});
}

export function mountMcpPromptNotification(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-prompt-lab',
    title: 'Prompts、Completion 与通知工作台',
    subtitle: '用户选择模板，Server 提供权威参数和进度',
    artifactName: 'mcpPromptNotificationContract',
    artifactNote: 'Prompt、Completion、Logging、Progress 和变更通知各司其职。',
    completeText: '课程审查 Prompt Library 与通知契约已完成。',
    lede: 'review_lesson_clarity / compare_two_lessons / prepare_column_release',
    detail: '模板参数需要可发现、可补全，长任务需要进度与取消。',
    checks: [
      { id: 'arguments', label: 'Prompt 参数有 Schema 与说明', description: 'lessonId、rubric、strictness' },
      { id: 'completion', label: 'lessonId 使用 completion/complete', description: '从真实目录返回候选' },
      { id: 'messages', label: 'Prompt 返回标准 Messages', description: '不直接执行写操作' },
      { id: 'progress', label: '长审查使用 Progress Token', description: 'Host 显示阶段进度' },
      { id: 'logging', label: '日志脱敏并分级', description: '不记录 Token 与私有课程全文' },
      { id: 'changed', label: 'Prompt 列表变化发送 notification', description: 'Client 失效发现缓存' },
      { id: 'cancel', label: '响应取消并释放资源', description: '用户可停止长任务' },
    ],
    selects: [
      { id: 'control', label: 'Prompt 主要控制者', correct: 'user', options: [{ value: 'model', label: '模型自动决定' }, { value: 'user', label: '用户显式选择' }] },
    ],
    successCode: `prompts/list → prompts/get\ncompletion/complete(lessonId)\nnotifications/prompts/list_changed`,
  }});
}

export function mountMcpClientWorkbench(args) {
  return mountChecklistLab({ ...args, definition: {
    className: 'mcp-client-lab',
    title: 'TypeScript MCP Client 可靠性控制台',
    subtitle: '发现、缓存、Server 请求、取消、重连与错误',
    artifactName: 'mcpClientAdapter',
    artifactNote: '业务 Agent 不直接拼 JSON-RPC；统一 Client Adapter 管理协议。',
    completeText: '完整 MCP Client Adapter 已可接入 LangGraph。',
    lede: '同时连接 Academy、GitHub 和 Docs Server',
    detail: '要求一个 Server 失败时其余仍可用，能力变化后可刷新。',
    checks: [
      { id: 'initialize', label: '初始化并核对 protocolVersion/capabilities', description: '拒绝不兼容组合' },
      { id: 'discover', label: '发现 Tools/Resources/Prompts', description: '保存 Server 来源' },
      { id: 'handlers', label: '注册 Sampling/Elicitation/Roots 处理器', description: '仅声明实际支持能力' },
      { id: 'cache', label: '缓存发现结果并订阅变更', description: '减少远程延迟' },
      { id: 'timeout', label: '请求超时和 AbortController', description: '取消长请求' },
      { id: 'reconnect', label: '重连失败 Server', description: '不破坏健康连接' },
      { id: 'errors', label: '区分 transport/protocol/business failure', description: '给 Agent 明确恢复路径' },
      { id: 'trace', label: '记录 server/tool/requestId', description: '跨 Server 可观察' },
    ],
    selects: [
      { id: 'failure', label: '一个 Server 初始化失败', correct: 'degraded', options: [{ value: 'all', label: '全部崩溃' }, { value: 'degraded', label: '降级并保留健康 Server' }] },
      { id: 'collision', label: '同名 Tool', correct: 'prefix', options: [{ value: 'prompt', label: '让模型猜' }, { value: 'prefix', label: 'Server 前缀 + Filter' }] },
    ],
    successCode: `const manager = await connectMcpServers({\n  connectInParallel: true,\n  dropFailedServers: true,\n});`,
  }});
}

export const mcpDevelopmentSimulators = {
  'mcp-stdio-workbench': mountMcpStdioWorkbench,
  'mcp-tool-contract': mountMcpToolContract,
  'mcp-resource-workbench': mountMcpResourceWorkbench,
  'mcp-prompt-notification': mountMcpPromptNotification,
  'mcp-client-workbench': mountMcpClientWorkbench,
};
