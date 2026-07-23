import assert from 'node:assert/strict';
import fs from 'node:fs';

const dashboard = fs.readFileSync('packages/course-runtime/src/formal-dashboard.js', 'utf8');
const skillCards = fs.readFileSync('packages/course-runtime/src/dashboard-skill-cards.js', 'utf8');
const css = fs.readFileSync('apps/runtime-academy/formal-dashboard.css', 'utf8');
const skillCss = fs.readFileSync('apps/runtime-academy/dashboard-skill-cards.css', 'utf8');
const main = fs.readFileSync('apps/runtime-academy/main.js', 'utf8');
const html = fs.readFileSync('apps/runtime-academy/index.html', 'utf8');

// One selected column is rendered at a time and remains switchable from the seven-card path.
assert.match(dashboard, /data-column-select/);
assert.match(dashboard, /data-selected-column/);
assert.match(dashboard, /dashboardSelectedColumnId/);
assert.match(dashboard, /renderSelectedColumn/);
assert.match(dashboard, /formal-column-path/);
assert.match(dashboard, /QUALITY REVIEW MODE/);
assert.doesNotMatch(dashboard, /review-column-stack|futureColumns/);

// The overview cards retain compact learner-facing skills for all seven columns.
assert.match(skillCards, /const compactColumnSkills/);
assert.match(skillCards, /const columnSkills/);
assert.match(skillCards, /技能 GET/);
assert.match(skillCards, /installDashboardSkillCards/);
assert.equal((skillCards.match(/'column-0[1-7]':/g) ?? []).length, 14);

// Current visual treatment: seven-column cards stay interactive, while redundant expanded metadata is hidden.
assert.match(css, /formal-column-card:hover/);
assert.match(css, /formal-column-card\.selected/);
assert.match(css, /selected-column-panel/);
assert.match(skillCss, /column-skill-block/);
assert.match(skillCss, /column-skill-item/);
assert.match(skillCss, /selected-column-intro\{display:none!important\}/);
assert.match(skillCss, /enterprise-baseline-banner/);
assert.match(skillCss, /selected-column-lock-note/);
assert.match(skillCss, /formal-section-head h2:focus\{outline:none!important\}/);
assert.doesNotMatch(skillCss, /column-skill-block\.expanded/);

// Runtime and styles are installed in the learner application.
assert.match(main, /installFormalDashboard\(app\)/);
assert.match(main, /installDashboardSkillCards\(app\)/);
assert.match(main, /installEnterpriseColumnProduct/);
assert.match(main, /installQualityReviewMode/);
assert.match(html, /formal-dashboard\.css/);
assert.match(html, /dashboard-skill-cards\.css/);
assert.match(html, /enterprise\.css/);

console.log('Formal dashboard current-state checks passed.');
