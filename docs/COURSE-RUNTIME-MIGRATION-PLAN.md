# Course Runtime Migration Plan

## Current status

The first two columns are now available through a complete configuration-driven Runtime experience:

- 9 lessons
- 9 concept-specific simulators
- 2 column examinations
- sequential unlocking
- experience mode
- ArtifactStore ledger
- progress restoration
- responsive mobile layout

The original V3 single-file academy remains untouched for comparison and rollback.

## Runtime lesson coverage

| Lesson | Simulator | Output artifact |
|---|---|---|
| 01 | repeated-run distribution lab | `businessRisk` |
| 02 | language constraint mixer | `languageDecision` |
| 03 | TypeScript code repair lab | `tsSource` |
| 04 | Messages context window | `messages` |
| 05 | Prompt counterfactual anatomy lab | `promptV1` |
| 06 | rule routing table | `classificationRules` |
| 07 | JSON / Schema / business gates | `outputSchema` |
| 08 | Few-shot semantic map | `fewShotExamples` |
| 09 | Prompt evaluation matrix | `promptV2`, `evaluationReport` |

## Experience entry

```text
apps/runtime-academy/index.html
```

Run locally:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/apps/runtime-academy/
```

## Validation

- All JavaScript modules pass `node --check`.
- All nine lesson configurations have the required four-stage teaching grammar.
- Every lesson references an installed simulator.
- ArtifactStore, ProgressStore, exam state, Lesson 3 repair rules, Lesson 6 routing rules and Lesson 7 validators have automated checks.
- Browser end-to-end validation completed the nine lessons and two column exams to 100% progress.
- Wrong quiz answers remain retryable.
- Desktop and 390px mobile routes have no horizontal overflow.
- No browser console errors were observed in the end-to-end run.

## Next migration work

1. Merge the Runtime foundation PR after review.
2. Make `apps/runtime-academy/` the main academy entry after final content review.
3. Remove duplicated Lesson 3 preview code after the complete entry is accepted.
4. Add the third column through the same Runtime rather than returning to lesson-specific HTML.
5. Add Playwright installation to CI when browser dependencies are standardized.
