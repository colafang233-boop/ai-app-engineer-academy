# Course Runtime Architecture

## Goal

Replace lesson-specific HTML and state machines with a shared Runtime plus concept-specific simulators:

```text
LessonConfig
    ↓
CourseRuntime
    ↓
Interaction Primitive / Simulator
    ↓
ArtifactStore + ProgressStore
```

“Course generation” here does not mean asking an LLM to invent a course. It means the Runtime renders known lesson configuration, manages state, mounts the requested simulator and writes artifacts.

## Complete first-two-column implementation

The Runtime now covers nine lessons and two column exams through one app shell:

```text
apps/runtime-academy/
```

### Shared Runtime responsibilities

- dashboard and routing
- sequential lesson unlocking
- column exam unlocking
- experience mode
- prediction gates
- retryable transfer quizzes
- lesson completion state
- exam attempts and pass state
- ArtifactStore ledger
- responsive layout

### Concept-specific simulators

```text
distribution-lab
constraint-mixer
code-repair
context-window
prompt-anatomy
rule-routing
structured-output
few-shot-map
evaluation-matrix
```

The visual system stays consistent while the experimental mechanism changes for each concept.

## Stores

### ArtifactStore

Uses the V3-compatible key:

```text
ai-academy-artifacts-v3
```

Artifact flow:

```text
businessRisk
→ languageDecision
→ tsSource
→ messages
→ promptV1
→ classificationRules
→ outputSchema
→ fewShotExamples
→ promptV2 + evaluationReport
```

### ProgressStore

Stores lesson stages, lesson completion, exam attempts and exam pass state independently from lesson artifacts.

## EventBus

Current events:

```text
artifact:change
artifact:reset
progress:change
progress:reset
stage:complete
lesson:complete
```

Dashboard, artifact drawer and future analytics can subscribe without being coupled to individual simulators.

## Course configuration

All first-two-column lesson content is declared in:

```text
courses/ai-app-engineering/course-config.js
```

A lesson describes:

- metadata
- prediction stage
- simulator name and configuration
- reveal content
- retryable transfer quiz

The Runtime is unaware of Prompt, RAG, LangChain or TypeScript semantics. Those live in the configuration and simulator.

## Compatibility strategy

- `apps/academy/index.html` remains untouched as the V3 fallback.
- `apps/runtime-preview/` remains as the Lesson 3 migration reference.
- `apps/runtime-academy/` is the complete Runtime experience entry.
- Existing V3 artifacts remain readable.

## Validation

- Node syntax checks for Runtime, course and app modules.
- Automated configuration and store tests.
- Browser end-to-end completion of all 9 lessons and 2 exams.
- Wrong-answer retry paths.
- Desktop and 390px mobile overflow checks.
- No browser console errors during the full run.

## Next architecture step

The third column should be added directly through this Runtime. New reusable simulators expected for LangChain include:

```text
model-invocation-lab
prompt-template-lab
runnable-pipeline-lab
streaming-event-lab
retry-fallback-lab
trace-inspector
```

A real WebContainer runner can later replace the simulated TypeScript compiler diagnostics without changing the LessonConfig contract.
