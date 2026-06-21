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

> Status legend: ⬜ not started · 🚧 in progress / built, pending Ed sign-off · ✅ frozen

### Seams (Iteration 0) — ✅ frozen
- ✅ `/lib/ai/AIClient.ts` — interface for all Claude calls (starts with `complete`; grows per iteration).
- ✅ `/lib/ai/AnthropicAIClient.ts` — real impl, `claude-opus-4-8` + adaptive thinking (lazy-loaded; not run in test mode).
- ✅ `/lib/ai/MockAIClient.ts` — fixture-backed double; throws on unstubbed prompts.
- ✅ `/lib/ai/index.ts` — `getAIClient()` factory (mock in test mode, real otherwise).
- ✅ `/lib/voice/VoiceClient.ts` — interface for STT/TTS.
- ✅ `/lib/voice/WebVoiceClient.ts` (browser, iOS-safe) / `TextVoiceClient.ts` (text-fallback double).
- ✅ `/lib/time/Clock.ts` — `SystemClock` + `FixedClock` (unit-tested).
- ✅ `/lib/random/Random.ts` — `SystemRandom` + seeded `SeededRandom` mulberry32 (unit-tested).
- ✅ `/lib/testkit/` — `testMode.ts` (`HABLA_TEST_MODE`/`?test=1`), `seed.ts` (Returner profile + items), `fixtures.ts`.

### Levels & assessment (Iteration 1) — ✅ frozen
- ✅ `/lib/levels/cefr.ts` — levels, `computeGap`, `levelPercent`, `toBandLabel` (confidence framing). Unit-tested.
- ✅ `/lib/levels/assess.ts` — `assessReturner(ai, input)` → validated `LevelEstimate` (zod); `cefrEnum`. Integration-tested.
- ✅ `/lib/onboarding/content.ts` — static diagnostic/goal/topic content + first-win opener.

### Persistence seam (Iteration 1) — ✅ frozen
- ✅ `/lib/store/Store.ts` — `Store` interface + `HablaUser`/`Assessment` types.
- ✅ `/lib/store/InMemoryStore.ts` — default (test mode + Supabase-less local dev). Integration-tested.
- ✅ `/lib/store/SupabaseStore.ts` — used when Supabase env is set (maps to snake_case schema).
- ✅ `/lib/store/index.ts` — `getStore()`; in-memory singleton pinned on `globalThis` (shared across action/page bundles).
- ✅ `/lib/session/currentUser.ts` — single-user cookie identity (`getCurrentUserId` / `setCurrentUserId`).
- ✅ `/lib/voice/*` — voice input surfaces live status + errors (verified working in Chrome). Full cross-browser stack: Iter 4.

### Pure logic (Iterations 2–5 — not yet built)
- ⬜ `/lib/srs/scheduler.ts` — expanding intervals, dual recognition/production state, savings fast-forward.
- ⬜ `/lib/srs/interleaver.ts` — no two same exercise types adjacent.
- ⬜ `/lib/session/orchestrator.ts` — pick 3 blocks + recap, time-budget to ~17 min.
- ⬜ `/lib/session/registry.ts` — Exercise registry.

### Exercises (`Exercise` contract — see BUILD_PLAN Part C)
- ⬜ `/lib/exercises/reactivation/` — Iteration 2 (SRS cloze, savings).
- ⬜ `/lib/exercises/bridge/` — Iteration 3 (★ Hear→Repeat→Mod→Make + stuck protocol).
- ⬜ `/lib/exercises/conversation/` — Iteration 4 (guided mission + corrections).
- ⬜ `/lib/exercises/recap/` — Iteration 4 (gap delta, wins, capped corrections, tomorrow's pattern).

### Routes / UI
- 🚧 `/app/layout.tsx` — root layout, Oswald via link, globals. `/app/globals.css` + `/app/tokens.css` — design tokens.
- 🚧 `/app/page.tsx` — dashboard: reads current user from store (→ onboarding if none); renders stored gap + bands + step count. Session CTA still a disabled stub (Iter 5).
- 🚧 `/app/onboarding/` — niche → background → diagnostic → goals → first win; `OnboardingWizard.tsx` (client) + `actions.ts` (`completeOnboarding`, `getFirstWinReply`).
- ⬜ `/app/session/` — Iteration 5 (the daily-session player).
- ⬜ `/app/recap/` — Iteration 4.
- ⬜ `/app/settings/` — correction intensity, voice on/off, level adjust.
- 🚧 `/components/AppShell.tsx` — left rail + main + right panel; mobile bottom tab bar.
- 🚧 `/components/VoiceTextInput.tsx` — text input always; mic button when speech supported (text fallback).
- 🚧 `/components/ui/` — `Button` (variant brand/secondary/tertiary), `Card` (+`CardHeading`), `Input`, `GapBar`. (Badge/Tabs/Modal/ExerciseShell: later.)

### Data
- 🚧 `/supabase/migrations/0001_init.sql` — `users`, `practice_items`, `sessions`, `attempts`, `assessments`, `events` (authored; not yet applied to a project).
- 🚧 `/lib/db/supabase.ts` — lazy single-user client (`getSupabase()`). Typed queries: later.

### Tests
- 🚧 `/eval/` — `runner.ts` + `cases.ts` (smoke + assess-calibration + first-win warmth; more pedagogy fixtures per iteration).
- 🚧 `/e2e/smoke.spec.ts` — full onboard→dashboard journey in `?test=1` (text path), screenshots to `__screenshots__/`.
- 🚧 unit: `lib/random/*.test.ts`, `lib/time/*.test.ts`, `lib/levels/cefr.test.ts`.
- 🚧 integration: `lib/ai/*.int.test.ts`, `lib/levels/assess.int.test.ts`, `lib/store/*.int.test.ts`.

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
| 0 | Foundation & test harness | ✅ frozen (Ed signed off 2026-06-21) |
| 1 | Onboarding + dual-level + dashboard gap | ✅ frozen (Ed signed off 2026-06-21; voice verified in Chrome) |
| 2 | Reactivation Warm-up (SRS cloze) | 🚧 in progress |
| 3 | Bridge Drills (★ unique IP) | ⬜ |
| 4 | Guided Conversation + corrections + recap | ⬜ |
| 5 | Daily session orchestration + progress | ⬜ |

Post-MVP (not scheduled): voice polish · Absorber pathway · phonetics · Q&A · curriculum · analytics · deploy hardening.
