# QA Report · CourseRuntime Columns 1–2

## Scope

- Complete Runtime dashboard
- 9 lessons
- 9 concept-specific simulators
- 2 column examinations
- ArtifactStore ledger
- sequential unlock and experience mode
- desktop and mobile layouts

## Automated module checks

```bash
find packages/course-runtime/src courses/ai-app-engineering apps/runtime-academy \
  -name '*.js' -print0 | xargs -0 -n1 node --check

node tools/test_course_runtime.mjs
node tools/test_runtime_full.mjs
```

## Browser end-to-end path

The browser test completed this path:

```text
Lesson 01 distribution lab
→ Lesson 02 constraint mixer
→ Lesson 03 code repair
→ Lesson 04 context window
→ Lesson 05 Prompt anatomy
→ Lesson 06 rule routing
→ Lesson 07 validation gates
→ Lesson 08 Few-shot map
→ Lesson 09 evaluation matrix
→ Column 01 exam
→ Column 02 exam
→ dashboard 100%
```

## Failure-path checks

- Prediction answers unlock the experiment even when the prediction is wrong.
- Transfer quiz answers remain retryable after a wrong answer.
- Lesson 03 repair applies one diagnostic at a time and cannot deadlock.
- Lesson 04 refuses to save a request without System, necessary history and User.
- Lesson 06 starts with an intentionally wrong rule order and passes after the priority is corrected.
- Lesson 07 distinguishes JSON syntax, Schema and business-rule failures.
- Lesson 08 rejects repeated or incomplete example sets.
- Lesson 09 exposes the regression created by the default Prompt and passes after the bad rule is removed.

## Responsive checks

At a 390px viewport, the dashboard, 9 lesson routes and 2 exam routes produced no document-level horizontal overflow.

## Browser console

No page errors or console errors were observed during the complete end-to-end run.

## Compatibility

The Runtime continues to use `ai-academy-artifacts-v3`, so artifacts from the V3 academy remain readable.

## Known limitations

- Lesson 03 currently simulates compiler diagnostics; the real WebContainer runner remains a later enhancement.
- Browser E2E is currently run locally. CI executes module and configuration checks without installing Playwright browsers.
- The original V3 academy remains in the repository until the Runtime version passes content review.
