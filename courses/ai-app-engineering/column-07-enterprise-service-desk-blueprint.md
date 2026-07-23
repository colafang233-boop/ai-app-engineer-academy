# Column 07 · Enterprise AI Service Desk

> Status: curriculum and product blueprint  
> Research baseline: 2026-07-23  
> Planned lessons: 84–108 (25 lessons)  
> Product: NovaTech Enterprise AI Service Desk

## 1. Why this scenario

The final column needs one bounded business system that naturally requires:

- multiple roles and approval responsibilities;
- private enterprise knowledge with row/document permissions;
- both deterministic business rules and probabilistic AI decisions;
- read-only and side-effecting tools;
- human handoff and long-running workflows;
- external GitHub, CI, IAM and ticket integrations;
- offline and online evaluation;
- audit, incident response, SLOs, cost controls and rollback.

A generic “enterprise assistant” is rejected because it has no stable task boundary, no objective completion criteria and no defensible permission model.

## 2. Virtual enterprise

### NovaTech Group

A technology group with approximately 800 employees and two business tenants:

- `novatech-cloud`: cloud platform and developer products;
- `novatech-labs`: applied AI and internal incubation.

Departments:

- Engineering
- IT Support
- Security
- Sales
- Finance
- Human Resources

Environments:

- development
- staging
- production

Data classifications:

- PUBLIC
- INTERNAL
- CONFIDENTIAL
- RESTRICTED

### User roles

| Role | Main responsibility | Typical access |
|---|---|---|
| Employee | Ask questions and create requests | Own requests and authorized knowledge |
| Developer | Diagnose systems and request technical access | Project-scoped engineering data |
| Manager | Approve business need and duration | Department and project requests |
| Support Agent | Resolve incidents and improve knowledge | Assigned tickets and support knowledge |
| Security Approver | Approve sensitive access | Security policy and high-risk requests |
| Knowledge Owner | Publish and retire enterprise knowledge | Owned document collections |
| Auditor | Review actions and evidence | Read-only audit views |
| Platform Admin | Operate the service | Platform configuration, not unrestricted business data |

## 3. Four core business loops

### Flow A · Enterprise policy question

Example:

> “Can customer data be downloaded to a personal computer for analysis?”

Flow:

1. authenticate user and resolve tenant/department/project attributes;
2. classify the question and risk level;
3. apply document and chunk ACL filters before retrieval;
4. run lexical/dense retrieval and reranking;
5. assemble evidence and check freshness/conflicts;
6. answer with citations, abstain or escalate;
7. capture feedback and potential knowledge gaps.

Enterprise responsibilities taught:

- tenant isolation;
- RBAC + ABAC + data ACL;
- permission-aware RAG;
- evidence, citations and abstention;
- knowledge ownership and versioning;
- retrieval and answer evaluation.

### Flow B · IT troubleshooting and ticket handoff

Example:

> “VPN reports error 691. It worked yesterday.”

Flow:

1. extract exact error code, operating system and network context;
2. choose deterministic troubleshooting tree, retrieval or both;
3. stream one diagnostic step at a time;
4. checkpoint each user observation;
5. detect resolution, uncertainty or risk;
6. create a structured ticket when unresolved;
7. transfer the full evidence and attempted steps to a support agent.

Enterprise responsibilities taught:

- deterministic/AI boundary;
- stateful workflow and checkpointing;
- elicitation and human handoff;
- ticket lifecycle and SLA;
- task completion evaluation.

### Flow C · Privileged access request

Example:

> “Request read-only production database access for Project A to investigate slow queries.”

Flow:

1. identify target resource, project, environment, requested role and duration;
2. evaluate policy using user/resource/action/environment attributes;
3. collect missing fields;
4. create the access request atomically with its first audit/outbox event;
5. request manager approval;
6. request security approval when required;
7. call IAM through an authorized MCP integration;
8. verify the actual grant;
9. schedule expiry and revoke automatically;
10. preserve complete audit evidence.

Enterprise responsibilities taught:

- authentication, RBAC, ABAC and step-up approval;
- transactions, idempotency and transactional outbox;
- durable workflows and compensation;
- OAuth, machine identity and MCP write tools;
- expiry, revocation and audit.

### Flow D · Deployment failure diagnosis

Example:

> “Why did the latest main-branch deployment fail?”

Flow:

1. identify repository, branch, deployment and user scope;
2. query GitHub and CI through separate MCP servers;
3. read failed jobs and selected logs;
4. retrieve internal release guidance;
5. build a cited diagnosis and confidence score;
6. propose a repair, issue or preview rerun;
7. require approval before any write action;
8. track the long-running job and recover from disconnects.

Enterprise responsibilities taught:

- multiple MCP clients and tool filtering;
- agentic retrieval and evidence synthesis;
- untrusted logs and prompt injection;
- long-running tasks, status queries and idempotent retries;
- release controls and incident evidence.

## 4. Product surfaces

### Employee portal

- Ask enterprise questions
- Guided IT troubleshooting
- Create and track access requests
- View own tickets and approvals
- Provide feedback

### Support workspace

- Assigned ticket queue
- AI diagnosis, evidence and attempted-step timeline
- Human takeover
- Suggested knowledge updates
- SLA and escalation view

### Governance console

- Tenants, users, roles and policy attributes
- Knowledge sources, owners, ACLs and freshness
- Prompt/model/graph/tool versions
- MCP integrations and authorization scopes
- Evaluation datasets and release comparisons
- Traces, SLOs, cost and security findings
- Releases, incidents, audit and runbooks

## 5. Architecture position

The first production shape is deliberately not “microservices everywhere”.

### Deployment units

1. `service-desk-web`
   - employee, support and governance UI;
   - static assets and API client.

2. `service-desk-api`
   - modular application core;
   - identity context, requests, tickets, approvals and policy decisions;
   - REST/streaming endpoints;
   - relational database transaction boundary.

3. `service-desk-agent-worker`
   - LangGraph workflows;
   - long-running tasks and queues;
   - checkpoint and resume.

4. `service-desk-knowledge-worker`
   - parsing, chunking, embedding, indexing and ACL synchronization;
   - incremental updates and deletion.

5. `service-desk-mcp-gateway`
   - GitHub, CI, IAM and ticket integrations;
   - OAuth/resource scopes, machine identities and tool policies;
   - independent release and security boundary.

6. `evaluation-worker`
   - offline experiment execution;
   - sampled online evaluators;
   - production failure → dataset pipeline.

### Core stores

- PostgreSQL: systems of record, approval state, audit metadata and outbox;
- object storage: source documents and attachments;
- vector/search index: permission-aware retrieval index;
- checkpoint store: durable workflow state;
- queue: ingestion, evaluation, notifications and external operations;
- telemetry backend: traces, metrics and logs.

## 6. Domain model

### Core aggregates

#### SupportRequest

- id
- tenantId
- requesterId
- type: POLICY_QUESTION | IT_INCIDENT | ACCESS_REQUEST | DEPLOYMENT_FAILURE
- status
- riskLevel
- currentOwner
- createdAt / updatedAt

#### Ticket

- supportRequestId
- category
- severity
- SLA policy
- assignedQueue / assignee
- attemptedSteps
- resolution

#### AccessRequest

- requester
- resource
- requestedRole
- environment
- justification
- duration
- policyDecision
- approvalSteps
- grantStatus
- expiresAt

#### KnowledgeAsset

- source
- owner
- tenant
- classification
- accessPolicy
- version
- effectiveFrom / expiresAt
- ingestionState

#### ApprovalCase

- policy
- ordered/parallel steps
- approver identity or group
- decision
- reason
- deadline
- escalation

#### IntegrationExecution

- server
- tool
- subject
- scopes
- idempotencyKey
- requestHash
- status
- externalReference
- auditId

#### ReleaseCandidate

- applicationVersion
- promptVersion
- modelPolicyVersion
- graphVersion
- knowledgeSnapshot
- toolSchemaVersions
- featureFlags
- evaluationResults
- rolloutState

## 7. Policy model

Authorization is the intersection of:

```text
subject attributes
× resource attributes
× requested action
× environment attributes
× explicit policy
```

Examples:

- a developer may read Project A staging diagnostics when `projectMembership=A`;
- production database access requires manager approval and security approval;
- RESTRICTED knowledge is never included in retrieval unless the subject and purpose both satisfy policy;
- platform administrators may operate indexes but do not automatically gain permission to read document content;
- auditors can read immutable audit evidence but cannot execute write tools.

The policy decision returns:

- `PERMIT`
- `DENY`
- `NOT_APPLICABLE`
- `INDETERMINATE`
- obligations: approval, redaction, maximum duration, logging and step-up requirements.

## 8. Default business metrics and SLOs

These are scenario defaults for teaching, not universal recommendations. Learners will change them in the control room.

### Business outcomes

- self-service resolution rate;
- ticket deflection rate;
- median time to resolution;
- access approval cycle time;
- deployment diagnosis time;
- knowledge-gap closure rate;
- user satisfaction;
- cost per resolved request.

### Safety and quality invariants

- unauthorized knowledge disclosure: `0`;
- unauthorized tool execution: `0`;
- expired access remaining active after revocation window: `0`;
- audit events missing for privileged writes: `0`;
- high-risk answers without citations: `0`.

### Initial service targets

- read-only question first useful update: P95 ≤ 2.5 s;
- completed policy answer: P95 ≤ 8 s;
- guided troubleshooting next step: P95 ≤ 5 s;
- access-request acknowledgement: P95 ≤ 3 s;
- external grant status visible: P95 ≤ 60 s;
- monthly API availability target: 99.9%;
- all long-running writes expose durable status and idempotency keys.

## 9. Evaluation contract

### Offline datasets

- policy questions and expected evidence;
- IT diagnostic trajectories;
- access policy decisions and approval requirements;
- deployment failures, relevant logs and permitted actions;
- cross-tenant leakage tests;
- adversarial prompt-injection and tool-misuse tests.

### Evaluation layers

1. deterministic contract checks;
2. retrieval relevance/recall;
3. groundedness, citation correctness and abstention;
4. policy-decision correctness;
5. tool choice and argument correctness;
6. agent trajectory and stopping behavior;
7. task completion and business outcomes;
8. latency, reliability and cost.

### Continuous loop

```text
production trace
→ sampled online evaluator / human review
→ confirmed failure
→ versioned dataset case
→ offline experiment
→ release comparison
→ canary
→ production monitoring
```

## 10. Threat model baseline

The course must inject and mitigate:

- cross-tenant retrieval leakage;
- indirect prompt injection in policies, tickets and CI logs;
- tool overexposure;
- excessive agency;
- identity and privilege abuse;
- memory/checkpoint poisoning;
- SSRF and malicious URLs;
- token passthrough and confused deputy;
- insecure long-running task replay;
- cascading external-service failures;
- audit tampering and secret leakage in traces.

## 11. Teaching method

Each lesson delivers one production increment and one failure exercise.

Fixed lesson structure:

1. business situation;
2. prerequisite concepts and terminology;
3. architecture decision;
4. interactive control-room experiment;
5. TypeScript implementation contract;
6. production acceptance gate;
7. cumulative project artifact.

The final column does not introduce a new orchestration framework. It teaches complete system responsibility.

## 12. Planned curriculum · Lessons 84–108

| Lesson | Topic | Product increment | Failure/decision experiment | Artifact |
|---:|---|---|---|---|
| 84 | What makes an AI project enterprise-grade? | Enterprise readiness model | Compare demo, internal tool and production system | `enterpriseReadinessModel` |
| 85 | Product charter, stakeholders and risk appetite | NovaTech product charter | Trade business value against unacceptable outcomes | `serviceDeskProductCharter` |
| 86 | Process discovery and AI/deterministic boundary | Four bounded workflows | Move steps between deterministic code, AI and human responsibility | `aiDeterministicBoundaryMap` |
| 87 | Domain model and business invariants | Aggregates and state transitions | Reject invalid transitions and missing invariants | `enterpriseDomainModel` |
| 88 | Architecture, deployment units and ADRs | Modular production architecture | Resist premature microservice decomposition | `enterpriseArchitectureDecisionPack` |
| 89 | Monorepo, environments, configuration, secrets and feature flags | Delivery foundation | Detect config drift and leaked secrets | `deliveryFoundationContract` |
| 90 | Identity, tenants, RBAC, ABAC and data ACL | Policy enforcement layer | Attempt cross-tenant and cross-project access | `enterpriseAuthorizationPolicy` |
| 91 | Transactions, idempotency, outbox and audit | Reliable request writes | Inject DB-success/event-failure dual write | `transactionAuditContract` |
| 92 | Knowledge lifecycle and permission synchronization | Governed ingestion pipeline | Update, delete, expire and revoke document access | `knowledgeLifecycleContract` |
| 93 | Model gateway, prompt/schema versions and provider fallback | AI execution gateway | Switch providers without changing business contracts | `modelGatewayPolicy` |
| 94 | Enterprise AI UX, streaming, explanations and human takeover | Shared interaction shell | Handle delays, uncertainty and takeover | `enterpriseAiUxContract` |
| 95 | Permission-aware policy Q&A | First complete read-only flow | Leak attempt, stale policy and conflicting evidence | `policyQuestionRelease` |
| 96 | Stateful IT troubleshooting | Guided diagnosis flow | Disconnect, resume and contradictory user observations | `itTroubleshootingWorkflow` |
| 97 | Ticket creation and support collaboration | Human handoff workspace | Preserve attempted steps and evidence during transfer | `supportHandoffContract` |
| 98 | Access-request intake and approval orchestration | Privileged request workflow | Missing fields, approval timeout and separation of duties | `accessApprovalWorkflow` |
| 99 | IAM execution, verification, expiry and revocation | Authorized write integration | Timeout after grant, duplicate retry and failed revocation | `privilegedAccessExecutionContract` |
| 100 | Deployment failure diagnosis with GitHub and CI MCP | Multi-server engineering flow | Malicious logs, unavailable server and unknown task state | `deploymentDiagnosisWorkflow` |
| 101 | Cross-flow routing, budgets and bounded agency | Unified service-desk router | Prevent wrong workflow, infinite loops and cost runaway | `boundedAgencyPolicy` |
| 102 | Golden sets and offline evaluation | Versioned evaluation suite | Compare prompt/model/graph/retrieval versions | `offlineEvaluationReleaseGate` |
| 103 | Online evaluation, feedback and failure-data flywheel | Production learning loop | Convert confirmed production failures into regression cases | `continuousEvaluationLoop` |
| 104 | Traces, metrics, logs, SLOs and cost | Enterprise control room | Debug one request across RAG, Graph and MCP | `observabilitySloContract` |
| 105 | Security threat model and agentic red team | Security gate | Run tenant leakage, injection, tool and identity attacks | `enterpriseAiThreatModel` |
| 106 | Queues, timeouts, retries, degradation and recovery | Reliability patterns | Provider outage, queue backlog and partial external success | `resilienceRecoveryPlan` |
| 107 | CI/CD, schema migration, canary and rollback | Release pipeline | Detect regression during canary and roll back safely | `enterpriseReleaseStrategy` |
| 108 | Incident game day, architecture defense and production release | Final release | Coordinate a multi-failure incident and defend decisions | `enterpriseServiceDeskProductionBlueprint` |

## 13. Cross-column reuse

- Columns 1–2: TypeScript contracts, Prompt design, structured output and evaluation basics;
- Column 3: model/tool/message adapters, not the business architecture;
- Column 4: permission-aware retrieval, evidence and citation evaluation;
- Column 5: durable workflows, checkpoints, interrupts, streaming, subgraphs and bounded loops;
- Column 6: MCP integrations, OAuth, machine identity, tool approval, Cloudflare deployment and security;
- Column 7: product, domain, data, identity, reliability, governance, delivery and incident ownership.

## 14. New interactive capabilities

Existing CourseRuntime primitives remain the default. Only four enterprise-specific capabilities are justified:

1. `EnterpriseControlRoom`
   - tenant, user, role, environment, model, prompt, graph, knowledge snapshot and flags;
   - persistent state across the final column.

2. `PolicyDecisionWorkbench`
   - subject/resource/action/environment attributes;
   - decision, obligations and evidence.

3. `IncidentCommandCenter`
   - incident roles, timeline, hypotheses, mitigations, communication and recovery.

4. `ReleaseGateBoard`
   - business, AI quality, security, reliability, cost, migration, canary and rollback evidence.

Topology, trace, fault injection, approval, parameter controls, evaluation matrices and project artifacts should reuse existing components.

## 15. Graduation definition

The learner passes only when the system demonstrates:

- valid business value and bounded scope;
- tenant and data isolation;
- permission-aware RAG with correct citations and abstention;
- durable troubleshooting and human handoff;
- approved, idempotent and auditable privileged writes;
- secure multi-MCP integration;
- offline and online evaluation loops;
- end-to-end telemetry, SLOs and cost controls;
- recovery from injected production failures;
- canary, migration and rollback evidence;
- a tested runbook and architecture defense.

## 16. Research sources

Primary references include:

- NIST AI RMF 1.0 and NIST AI 600-1 Generative AI Profile;
- NIST SP 800-162 Attribute Based Access Control;
- OWASP Top 10 for Agentic Applications and Agentic Threats Navigator;
- Google SRE Workbook chapters on SLOs and Incident Response;
- AWS Prescriptive Guidance: Transactional Outbox and reliability patterns;
- OpenTelemetry semantic conventions, including GenAI and feature-flag telemetry;
- official LangSmith evaluation concepts for offline/online feedback loops;
- official MCP, LangGraph, OpenAI, Cloudflare and provider documentation already used in previous columns.
