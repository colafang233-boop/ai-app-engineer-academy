export const enterpriseResearchBaseline = {
  asOf: '2026-07-23',
  product: 'NovaTech Enterprise AI Service Desk',
  referenceModels: [
    'NIST AI RMF 1.0 + NIST AI 600-1 Generative AI Profile',
    'NIST SP 800-162 ABAC',
    'OWASP Top 10 for Agentic Applications',
    'Google SRE SLO and Incident Response practices',
    'AWS Transactional Outbox pattern',
    'OpenTelemetry semantic conventions',
  ],
  teachingPosition: [
    'Business boundary before agent architecture',
    'Modular monolith before unjustified microservices',
    'Deterministic policy and transaction rules around probabilistic AI',
    'Evaluation, security, observability and rollback are product capabilities',
  ],
};

export const novaTechEnterprise = {
  id: 'novatech-group',
  name: 'NovaTech Group · 云启科技集团',
  employeeCount: 800,
  tenants: [
    { id: 'novatech-cloud', name: 'NovaTech Cloud', business: '云平台与开发者产品' },
    { id: 'novatech-labs', name: 'NovaTech Labs', business: '应用 AI 与内部孵化' },
  ],
  departments: ['engineering', 'it-support', 'security', 'sales', 'finance', 'human-resources'],
  environments: ['development', 'staging', 'production'],
  classifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
};

export const enterpriseRoles = [
  { id: 'employee', label: '普通员工', responsibilities: ['ask_question', 'create_request', 'view_own_request'] },
  { id: 'developer', label: '开发工程师', responsibilities: ['diagnose_project', 'request_technical_access'] },
  { id: 'manager', label: '部门经理', responsibilities: ['approve_business_need', 'approve_duration'] },
  { id: 'support-agent', label: '支持工程师', responsibilities: ['resolve_ticket', 'suggest_knowledge_update'] },
  { id: 'security-approver', label: '安全审批人', responsibilities: ['approve_sensitive_access', 'review_security_evidence'] },
  { id: 'knowledge-owner', label: '知识负责人', responsibilities: ['publish_knowledge', 'retire_knowledge', 'manage_acl'] },
  { id: 'auditor', label: '审计员', responsibilities: ['read_audit_evidence'] },
  { id: 'platform-admin', label: '平台管理员', responsibilities: ['operate_platform', 'manage_release'], caveat: 'Does not automatically gain business-data access.' },
];

export const enterpriseRequestTypes = [
  {
    id: 'POLICY_QUESTION',
    label: '企业制度咨询',
    defaultRisk: 'medium',
    requiredCapabilities: ['identity-context', 'permission-aware-rag', 'evidence', 'citation', 'abstention'],
  },
  {
    id: 'IT_INCIDENT',
    label: 'IT 故障排查',
    defaultRisk: 'medium',
    requiredCapabilities: ['deterministic-troubleshooting', 'checkpoint', 'elicitation', 'human-handoff'],
  },
  {
    id: 'ACCESS_REQUEST',
    label: '权限访问申请',
    defaultRisk: 'high',
    requiredCapabilities: ['abac', 'approval', 'transaction', 'outbox', 'mcp-write', 'expiry', 'audit'],
  },
  {
    id: 'DEPLOYMENT_FAILURE',
    label: '研发发布故障',
    defaultRisk: 'high',
    requiredCapabilities: ['multi-mcp', 'untrusted-log-handling', 'task-status', 'approval', 'trace'],
  },
];

export const enterprisePolicyDecision = {
  inputs: ['subjectAttributes', 'resourceAttributes', 'action', 'environmentAttributes', 'policyVersion'],
  decisions: ['PERMIT', 'DENY', 'NOT_APPLICABLE', 'INDETERMINATE'],
  obligations: ['requireApproval', 'redactFields', 'maxDuration', 'stepUpAuthentication', 'recordAudit', 'forceHumanReview'],
};

export const enterpriseMetricDefaults = {
  business: {
    selfServiceResolutionRate: { direction: 'higher', unit: 'ratio' },
    ticketDeflectionRate: { direction: 'higher', unit: 'ratio' },
    medianTimeToResolution: { direction: 'lower', unit: 'minutes' },
    accessApprovalCycleTime: { direction: 'lower', unit: 'minutes' },
    deploymentDiagnosisTime: { direction: 'lower', unit: 'minutes' },
    knowledgeGapClosureRate: { direction: 'higher', unit: 'ratio' },
    costPerResolvedRequest: { direction: 'lower', unit: 'currency' },
  },
  safetyInvariants: {
    unauthorizedKnowledgeDisclosure: 0,
    unauthorizedToolExecution: 0,
    expiredAccessPastRevocationWindow: 0,
    privilegedWritesWithoutAudit: 0,
    highRiskAnswersWithoutCitations: 0,
  },
  serviceTargets: {
    readOnlyFirstUsefulUpdateP95Ms: 2500,
    policyAnswerP95Ms: 8000,
    troubleshootingNextStepP95Ms: 5000,
    accessRequestAckP95Ms: 3000,
    externalGrantVisibleP95Ms: 60000,
    monthlyAvailability: 0.999,
  },
  note: 'Scenario defaults for teaching; learners must change and defend them rather than treating them as universal best practices.',
};

export const enterpriseDomainObjects = [
  'SupportRequest',
  'Ticket',
  'AccessRequest',
  'KnowledgeAsset',
  'ApprovalCase',
  'IntegrationExecution',
  'ReleaseCandidate',
  'AuditEvent',
  'EvaluationCase',
  'IncidentRecord',
];

export const enterpriseDeploymentUnits = [
  { id: 'service-desk-web', reason: 'Independent UI delivery and static assets.' },
  { id: 'service-desk-api', reason: 'Modular application and relational transaction boundary.' },
  { id: 'service-desk-agent-worker', reason: 'Long-running LangGraph workflows and checkpoints.' },
  { id: 'service-desk-knowledge-worker', reason: 'Asynchronous ingestion, indexing and ACL synchronization.' },
  { id: 'service-desk-mcp-gateway', reason: 'External integration, identity and security boundary.' },
  { id: 'evaluation-worker', reason: 'Offline experiments and sampled online evaluation.' },
];

export const enterpriseFailureCatalog = [
  'cross-tenant-retrieval-leakage',
  'stale-policy-answer',
  'conflicting-evidence',
  'workflow-disconnect-before-checkpoint',
  'database-commit-event-publish-failure',
  'duplicate-mcp-write-after-timeout',
  'approval-timeout',
  'access-granted-response-lost',
  'access-revocation-failed',
  'malicious-ci-log-prompt-injection',
  'mcp-server-unavailable',
  'model-provider-outage',
  'queue-backlog',
  'cost-runaway-loop',
  'canary-quality-regression',
  'audit-secret-leakage',
];

export const enterpriseFinalArtifacts = [
  'enterpriseReadinessModel',
  'serviceDeskProductCharter',
  'aiDeterministicBoundaryMap',
  'enterpriseDomainModel',
  'enterpriseArchitectureDecisionPack',
  'deliveryFoundationContract',
  'enterpriseAuthorizationPolicy',
  'transactionAuditContract',
  'knowledgeLifecycleContract',
  'modelGatewayPolicy',
  'enterpriseAiUxContract',
  'policyQuestionRelease',
  'itTroubleshootingWorkflow',
  'supportHandoffContract',
  'accessApprovalWorkflow',
  'privilegedAccessExecutionContract',
  'deploymentDiagnosisWorkflow',
  'boundedAgencyPolicy',
  'offlineEvaluationReleaseGate',
  'continuousEvaluationLoop',
  'observabilitySloContract',
  'enterpriseAiThreatModel',
  'resilienceRecoveryPlan',
  'enterpriseReleaseStrategy',
  'enterpriseServiceDeskProductionBlueprint',
];
