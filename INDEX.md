# INDEX.md — Habla context map

Purpose: **load the least context needed to do the task.** Find the task below, open only the files it points to. Do not bulk-read the repo. Update this file whenever structure changes or an iteration is frozen.

---

## Planning docs (read on demand, not all at once)

| File | Read it when… |
|---|---|
| `CLAUDE.md` | Always, first. The operating rules + non-negotiables. |
| `INDEX.md` (this file) | Always second, to decide what else to open. |
| `habla_v4_scope.md` | You need *what* we're building / what's in or out of MVP / the daily-session design / data model. |
| `BUILD_PLAN.md` | You're starting or finishing an iteration, or need the self-testing architecture / Exercise contract / iteration scopes. |
| `UI_UX_PLAN.md` | You're building any screen or component, or doing the visual-QA pass. |
| `ux research/SKILL.md` | You're writing a component — read the **specific module** (buttons/cards/etc.), not the whole file. |
| `app research/habla_app_summary_v3_strategy_review.md` | You need the *why* behind a product decision (deep rationale). Reference, not build-spec. |
| `app research/habla_app_summary_v3.docx` | Long-term vision only. **`habla_v4_scope.md` overrides it for the build.** |

---

## Code map (populated as we build — keep one line per module)

> Status legend: ⬜ not started · 🚧 in progress · ✅ frozen

### Seams (Iteration 0)
- ⬜ `/lib/ai/AIClient.ts` — interface for all Claude calls (conversation, assess, generate, correct).
- ⬜ `/lib/ai/AnthropicAIClient.ts` — real impl. (model choice via `claude-api` skill).
- ⬜ `/lib/ai/MockAIClient.ts` — fixture-backed double for tests.
- ⬜ `/lib/voice/VoiceClient.ts` — interface for STT/TTS.
- ⬜ `/lib/voice/WebVoiceClient.ts` / `TextVoiceClient.ts` — real / text-fallback doubles.
- ⬜ `/lib/testkit/` — fixed clock, seeded RNG, seed Returner profile, fixtures, `HABLA_TEST_MODE` wiring.

### Pure logic
- ⬜ `/lib/srs/scheduler.ts` — expanding intervals, dual recognition/production state, savings fast-forward.
- ⬜ `/lib/srs/interleaver.ts` — no two same exercise types adjacent.
- ⬜ `/lib/levels/gap.ts` — receptive/productive bands, gap, trend, confidence framing.
- ⬜ `/lib/session/orchestrator.ts` — pick 3 blocks + recap, time-budget to ~17 min.
- ⬜ `/lib/session/registry.ts` — Exercise registry.

### Exercises (`Exercise` contract — see BUILD_PLAN Part C)
- ⬜ `/lib/exercises/reactivation/` — Iteration 2 (SRS cloze, savings).
- ⬜ `/lib/exercises/bridge/` — Iteration 3 (★ Hear→Repeat→Mod→Make + stuck protocol).
- ⬜ `/lib/exercises/conversation/` — Iteration 4 (guided mission + corrections).
- ⬜ `/lib/exercises/recap/` — Iteration 4 (gap delta, wins, capped corrections, tomorrow's pattern).

### Routes / UI
- ⬜ `/app/onboarding/` — Iteration 1 (niche → background → diagnostic → first win).
- ⬜ `/app/dashboard/` — Iteration 1 (gap headline + session CTA + streak + corrections).
- ⬜ `/app/session/` — Iteration 5 (the daily-session player).
- ⬜ `/app/recap/` — Iteration 4.
- ⬜ `/app/settings/` — correction intensity, voice on/off, level adjust.
- ⬜ `/components/` — design-system primitives (Button, Card, Input, Badge, Tabs, Modal, GapBar, ExerciseShell).

### Data
- ⬜ `/supabase/migrations/` — `users`, `practice_items`, `sessions`, `attempts`, `assessments`, `events` (scope §7).
- ⬜ `/lib/db/` — typed Supabase client + queries.

### Tests
- ⬜ `/eval/` — prompt fixtures (correction style, level calibration, stuck-user, overcorrection, mixed-language) + runner.
- ⬜ `/e2e/` — Playwright specs (text-mode) + `__screenshots__`.

---

## Commands

| Command | What |
|---|---|
| `npm run dev` | local dev server |
| `npm run test` | unit (pure logic) |
| `npm run test:int` | integration (mocked AI/voice) |
| `npm run eval` | prompt evals vs fixtures |
| `npm run e2e` | Playwright text-mode E2E + screenshots |

(Wired in Iteration 0; keep this table accurate.)

---

## Iteration status

| # | Iteration | Status |
|---|---|---|
| 0 | Foundation & test harness | ⬜ |
| 1 | Onboarding + dual-level + dashboard gap | ⬜ |
| 2 | Reactivation Warm-up (SRS cloze) | ⬜ |
| 3 | Bridge Drills (★ unique IP) | ⬜ |
| 4 | Guided Conversation + corrections + recap | ⬜ |
| 5 | Daily session orchestration + progress | ⬜ |

Post-MVP (not scheduled): voice polish · Absorber pathway · phonetics · Q&A · curriculum · analytics · deploy hardening.
