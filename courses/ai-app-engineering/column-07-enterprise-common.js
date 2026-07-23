export const enterpriseVersion = 'Enterprise AI Service Desk baseline · 2026-07-23';

export const enterpriseSources = {
  aiRmf: { label: 'NIST AI Risk Management Framework', url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  genAiProfile: { label: 'NIST AI 600-1 · Generative AI Profile', url: 'https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence' },
  abac: { label: 'NIST SP 800-162 · Attribute Based Access Control', url: 'https://csrc.nist.gov/pubs/sp/800/162/upd2/final' },
  owaspAgentic: { label: 'OWASP Top 10 for Agentic Applications', url: 'https://genai.owasp.org/2025/12/09/owasp-genai-security-project-releases-top-10-risks-and-mitigations-for-agentic-ai-security/' },
  owaspNavigator: { label: 'OWASP Agentic Threats Navigator', url: 'https://genai.owasp.org/resource/owasp-gen-ai-security-project-agentic-threats-navigator/' },
  slo: { label: 'Google SRE Workbook · Implementing SLOs', url: 'https://sre.google/workbook/implementing-slos/' },
  incident: { label: 'Google SRE Workbook · Incident Response', url: 'https://sre.google/workbook/incident-response/' },
  outbox: { label: 'AWS Prescriptive Guidance · Transactional Outbox', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html' },
  cloudPatterns: { label: 'AWS Cloud Design Patterns', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/introduction.html' },
  otel: { label: 'OpenTelemetry Semantic Conventions', url: 'https://opentelemetry.io/docs/specs/semconv/' },
  otelFlags: { label: 'OpenTelemetry Feature Flag Conventions', url: 'https://opentelemetry.io/docs/specs/semconv/feature-flags/' },
  openFeature: { label: 'OpenFeature Evaluation Context', url: 'https://openfeature.dev/specification/sections/evaluation-context/' },
  evals: { label: 'LangSmith Evaluation Concepts', url: 'https://docs.langchain.com/langsmith/evaluation-concepts' },
  langGraph: { label: 'LangGraph Overview', url: 'https://docs.langchain.com/oss/javascript/langgraph/overview' },
  langGraphInterrupts: { label: 'LangGraph Interrupts', url: 'https://docs.langchain.com/oss/javascript/langgraph/interrupts' },
  langGraphPersistence: { label: 'LangGraph Persistence', url: 'https://docs.langchain.com/oss/javascript/langgraph/persistence' },
  mcpSpec: { label: 'MCP Specification 2025-11-25', url: 'https://modelcontextprotocol.io/specification/2025-11-25' },
  mcpTools: { label: 'MCP Tools', url: 'https://modelcontextprotocol.io/specification/2025-11-25/server/tools' },
  mcpAuthorization: { label: 'MCP Authorization', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization' },
  mcpSecurity: { label: 'MCP Security Best Practices', url: 'https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices' },
  agentGuide: { label: 'OpenAI · A Practical Guide to Building AI Agents', url: 'https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/' },
};

export const enterprisePrediction = (title, description, correctValue, options, correctText, incorrectText = '保留这个判断，下面用企业场景验证它。') => ({
  id: 'prediction',
  type: 'prediction',
  title,
  description,
  correctValue,
  options,
  correctText,
  incorrectText,
});

export const enterpriseReveal = (title, description, html) => ({
  id: 'reveal',
  type: 'content',
  title,
  description,
  html,
});

export const enterpriseTransfer = (title, description, correctValue, options, correctText) => ({
  id: 'transfer',
  type: 'quiz',
  title,
  description,
  correctValue,
  options,
  correctText,
});

export const enterpriseOfficial = (...links) => ({
  appliesTo: enterpriseVersion,
  links,
  note: '本课使用官方风险、权限、可靠性和安全资料建立企业工程边界。具体架构与指标仍须根据业务风险、规模和组织能力做出可解释决策。',
});

export const enterpriseTerm = (name, definition) => ({ name, definition });
