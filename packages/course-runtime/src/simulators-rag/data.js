export const ragScenarios = [
  {
    id: 'support',
    label: '技术支持错误码',
    query: 'OMEN 16 出现 NVML driver/library version mismatch 怎么处理？',
    language: 'zh-mixed',
    queryType: 'exact+diagnostic',
    corpusType: 'manual+logs',
    risk: 'medium',
    sla: 800,
    relevantIds: ['d-nvml', 'd-driver-clean'],
  },
  {
    id: 'policy',
    label: '中英文企业制度',
    query: '试用期员工可以申请 remote work allowance 吗？',
    language: 'cross-lingual',
    queryType: 'policy-lookup',
    corpusType: 'bilingual-policy',
    risk: 'high',
    sla: 1800,
    relevantIds: ['d-remote-allowance', 'd-probation'],
  },
  {
    id: 'legal',
    label: '法律合同',
    query: 'Supplier 迟延交付时，违约金上限是多少？',
    language: 'zh-en',
    queryType: 'clause+definition',
    corpusType: 'contract',
    risk: 'very-high',
    sla: 2500,
    relevantIds: ['d-liquidated-damages', 'd-definition-delay'],
  },
  {
    id: 'code',
    label: '代码库',
    query: 'Where is tenant_id injected before refund lookup?',
    language: 'en-code',
    queryType: 'symbol+flow',
    corpusType: 'typescript',
    risk: 'medium',
    sla: 1200,
    relevantIds: ['d-runtime-context', 'd-refund-tool'],
  },
];

export const corpusDocuments = [
  { id: 'd-nvml', title: 'NVIDIA 驱动故障手册 · NVML', text: '当 nvidia-smi 报 driver/library version mismatch，先确认内核模块与用户态库版本是否一致，再重启或重装对应驱动。', language: 'zh', source: 'manual', acl: 'public', version: 4, relevance: { support: 3 } },
  { id: 'd-driver-clean', title: 'Ubuntu 驱动清理 SOP', text: '彻底清理旧 NVIDIA 包、检查 DKMS、重新安装并重启。适用于驱动残留导致的版本不一致。', language: 'zh', source: 'runbook', acl: 'engineering', version: 7, relevance: { support: 2 } },
  { id: 'd-omen-audio', title: 'OMEN 音频排障', text: '扬声器无声时检查 PipeWire 与内核音频设备。', language: 'zh', source: 'manual', acl: 'public', version: 2, relevance: { support: 0 } },
  { id: 'd-remote-allowance', title: 'Remote Work Allowance Policy', text: 'Eligible full-time employees may claim a monthly remote work allowance after completing probation.', language: 'en', source: 'policy', acl: 'employee', version: 6, relevance: { policy: 3 } },
  { id: 'd-probation', title: '试用期员工管理办法', text: '员工在试用期内不享受仅面向转正员工的专项补贴；法律规定的基本福利除外。', language: 'zh', source: 'policy', acl: 'employee', version: 3, relevance: { policy: 2 } },
  { id: 'd-hybrid-work', title: 'Hybrid Work Guideline', text: 'Teams may agree on office attendance schedules with manager approval.', language: 'en', source: 'guide', acl: 'employee', version: 4, relevance: { policy: 0 } },
  { id: 'd-liquidated-damages', title: 'Supply Agreement §12.4', text: 'For Delay, liquidated damages shall not exceed ten percent (10%) of the delayed Deliverables fees.', language: 'en', source: 'contract', acl: 'legal', version: 9, relevance: { legal: 3 } },
  { id: 'd-definition-delay', title: 'Supply Agreement §1.8 Definitions', text: 'Delay means failure to deliver an accepted Deliverable by the contractual milestone, excluding Customer-caused delay.', language: 'en', source: 'contract', acl: 'legal', version: 9, relevance: { legal: 2 } },
  { id: 'd-general-cap', title: 'Supply Agreement §15 Liability Cap', text: 'Aggregate liability is capped at fees paid in the preceding twelve months, subject to exclusions.', language: 'en', source: 'contract', acl: 'legal', version: 9, relevance: { legal: 1 } },
  { id: 'd-runtime-context', title: 'middleware/runtime-context.ts', text: 'beforeModel injects runtime.context.tenant_id from the authenticated request and removes tenant_id from model-controlled arguments.', language: 'code', source: 'repository', acl: 'engineering', version: 12, relevance: { code: 3 } },
  { id: 'd-refund-tool', title: 'tools/lookup-refund.ts', text: 'lookup_refund reads tenant_id from runtime.context and accepts only order_id from the model tool call.', language: 'code', source: 'repository', acl: 'engineering', version: 12, relevance: { code: 2 } },
  { id: 'd-order-service', title: 'services/order-service.ts', text: 'OrderService queries orders by primary key and tenant partition.', language: 'code', source: 'repository', acl: 'engineering', version: 11, relevance: { code: 1 } },
];

export const lexicalRanks = {
  support: ['d-nvml', 'd-driver-clean', 'd-omen-audio', 'd-order-service'],
  policy: ['d-probation', 'd-hybrid-work', 'd-remote-allowance', 'd-general-cap'],
  legal: ['d-definition-delay', 'd-liquidated-damages', 'd-general-cap', 'd-probation'],
  code: ['d-runtime-context', 'd-refund-tool', 'd-order-service', 'd-remote-allowance'],
};

export const denseRanks = {
  support: ['d-driver-clean', 'd-nvml', 'd-omen-audio', 'd-runtime-context'],
  policy: ['d-remote-allowance', 'd-hybrid-work', 'd-probation', 'd-liquidated-damages'],
  legal: ['d-liquidated-damages', 'd-general-cap', 'd-definition-delay', 'd-remote-allowance'],
  code: ['d-refund-tool', 'd-runtime-context', 'd-order-service', 'd-nvml'],
};

export const sparseRanks = {
  support: ['d-nvml', 'd-driver-clean', 'd-runtime-context', 'd-omen-audio'],
  policy: ['d-remote-allowance', 'd-probation', 'd-hybrid-work', 'd-general-cap'],
  legal: ['d-liquidated-damages', 'd-definition-delay', 'd-general-cap', 'd-probation'],
  code: ['d-runtime-context', 'd-refund-tool', 'd-order-service', 'd-nvml'],
};

export const rerankScores = {
  support: { 'd-nvml': 0.96, 'd-driver-clean': 0.88, 'd-omen-audio': 0.19, 'd-runtime-context': 0.08 },
  policy: { 'd-remote-allowance': 0.97, 'd-probation': 0.91, 'd-hybrid-work': 0.35, 'd-general-cap': 0.02 },
  legal: { 'd-liquidated-damages': 0.98, 'd-definition-delay': 0.89, 'd-general-cap': 0.52, 'd-probation': 0.01 },
  code: { 'd-runtime-context': 0.99, 'd-refund-tool': 0.94, 'd-order-service': 0.61, 'd-nvml': 0.01 },
};

export const embeddingCandidates = [
  { id: 'mono-small', label: 'Monolingual Small', languages: ['zh'], crossLingual: 0.42, zh: 0.88, en: 0.61, mixed: 0.55, latency: 18, memory: 1.1, dimension: 768 },
  { id: 'multi-balanced', label: 'Multilingual Balanced', languages: ['zh', 'en', '100+'], crossLingual: 0.82, zh: 0.84, en: 0.83, mixed: 0.80, latency: 42, memory: 2.4, dimension: 1024 },
  { id: 'multi-large', label: 'Multilingual Large', languages: ['zh', 'en', '100+'], crossLingual: 0.90, zh: 0.89, en: 0.91, mixed: 0.88, latency: 115, memory: 8.2, dimension: 4096 },
  { id: 'api-premium', label: 'Hosted Multilingual API', languages: ['zh', 'en', '100+'], crossLingual: 0.87, zh: 0.86, en: 0.90, mixed: 0.84, latency: 170, memory: 0, dimension: 1536, cost: 0.12 },
];

export const chunkBlocks = {
  contract: [
    { label: '§1.8 Definition', kind: 'definition', text: 'Delay means failure to deliver an accepted Deliverable by the milestone, excluding Customer-caused delay.' },
    { label: '§12.4 Remedy', kind: 'rule', text: 'For Delay, liquidated damages accrue at 0.5% per week.' },
    { label: '§12.4 Cap', kind: 'rule', text: 'Liquidated damages shall not exceed ten percent of delayed Deliverables fees.' },
    { label: '§12.5 Notice', kind: 'procedure', text: 'Customer must send written notice before claiming damages.' },
  ],
  support: [
    { label: 'Symptom', kind: 'heading', text: 'nvidia-smi: Failed to initialize NVML: Driver/library version mismatch.' },
    { label: 'Cause', kind: 'paragraph', text: 'Kernel module and user-space NVIDIA libraries are from different package versions.' },
    { label: 'Check', kind: 'code', text: 'cat /proc/driver/nvidia/version && dpkg -l | grep nvidia' },
    { label: 'Fix', kind: 'procedure', text: 'Remove stale packages, rebuild DKMS if needed, reinstall a matching driver, and reboot.' },
  ],
};

export function documentsByIds(ids, scoreMap = {}) {
  return ids.map((id, index) => {
    const document = corpusDocuments.find((item) => item.id === id);
    return { ...document, score: Number(scoreMap[id] ?? (1 - index * 0.12)) };
  }).filter(Boolean);
}

export function relevanceMap(scenarioId) {
  return Object.fromEntries(corpusDocuments.map((document) => [document.id, document.relevance?.[scenarioId] ?? 0]));
}
