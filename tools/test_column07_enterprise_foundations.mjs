import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  enterpriseDeploymentUnits,
  enterpriseFailureCatalog,
  enterpriseFinalArtifacts,
  enterpriseMetricDefaults,
  enterprisePolicyDecision,
  enterpriseRequestTypes,
  enterpriseResearchBaseline,
  enterpriseRoles,
  novaTechEnterprise,
} from '../courses/ai-app-engineering/column-07-enterprise-baseline.js';
import { enterpriseLessons84To88 } from '../courses/ai-app-engineering/column-07-enterprise-lessons-84-88.js';
import { enterpriseSimulators } from '../packages/course-runtime/src/simulators-enterprise.js';

assert.equal(enterpriseResearchBaseline.asOf, '2026-07-23');
assert.equal(novaTechEnterprise.tenants.length, 2);
assert.equal(novaTechEnterprise.departments.length, 6);
assert.equal(novaTechEnterprise.classifications.length, 4);
assert.equal(enterpriseRoles.length, 8);
assert.equal(enterpriseRequestTypes.length, 4);
assert.deepEqual(enterprisePolicyDecision.decisions, ['PERMIT', 'DENY', 'NOT_APPLICABLE', 'INDETERMINATE']);
assert.equal(enterpriseMetricDefaults.safetyInvariants.unauthorizedKnowledgeDisclosure, 0);
assert.equal(enterpriseDeploymentUnits.length, 6);
assert.ok(enterpriseFailureCatalog.length >= 16);
assert.equal(enterpriseFinalArtifacts.length, 25);

assert.equal(enterpriseLessons84To88.length, 5);
assert.deepEqual(enterpriseLessons84To88.map((lesson) => lesson.number), [84, 85, 86, 87, 88]);

const simulatorNames = [];
const allowedHosts = new Set([
  'www.nist.gov',
  'csrc.nist.gov',
  'genai.owasp.org',
  'sre.google',
  'docs.aws.amazon.com',
  'opentelemetry.io',
  'openfeature.dev',
  'docs.langchain.com',
]);

for (const lesson of enterpriseLessons84To88) {
  assert.equal(lesson.columnId, 'column-07');
  assert.ok(lesson.prerequisites.length >= 3, `${lesson.id} needs explicit prerequisites`);
  assert.ok(lesson.terms.length >= 4, `${lesson.id} needs enterprise terminology`);
  assert.equal(lesson.stages.length, 4);
  assert.equal(lesson.stages[0].type, 'prediction');
  assert.equal(lesson.stages[1].type, 'simulator');
  assert.equal(lesson.stages[2].type, 'content');
  assert.equal(lesson.stages[3].type, 'quiz');
  assert.ok(lesson.officialReference.links.length >= 3, `${lesson.id} needs multiple official sources`);
  for (const link of lesson.officialReference.links) {
    const url = new URL(link.url);
    assert.ok(allowedHosts.has(url.hostname), `${lesson.id} source must be official/primary: ${url.hostname}`);
  }
  simulatorNames.push(lesson.stages[1].simulator);
}

assert.equal(new Set(simulatorNames).size, 5);
for (const simulator of simulatorNames) assert.equal(typeof enterpriseSimulators[simulator], 'function', `Missing simulator ${simulator}`);

const blueprint = fs.readFileSync('courses/ai-app-engineering/column-07-enterprise-service-desk-blueprint.md', 'utf8');
assert.match(blueprint, /NovaTech Enterprise AI Service Desk/);
assert.match(blueprint, /Lessons 84–108/);
assert.match(blueprint, /Modular production architecture/);
assert.match(blueprint, /permission-aware RAG/);
assert.match(blueprint, /transactional outbox/i);
assert.match(blueprint, /IncidentCommandCenter/);
assert.match(blueprint, /enterpriseServiceDeskProductionBlueprint/);

console.log('Enterprise Service Desk blueprint and Lessons 84-88 foundation checks passed.');
