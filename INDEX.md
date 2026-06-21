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

### Seams (Iteration 0) — built + self-tested
- 🚧 `/lib/ai/AIClient.ts` — interface for all Claude calls (starts with `complete`; grows per iteration).
- 🚧 `/lib/ai/AnthropicAIClient.ts` — real impl, `claude-opus-4-8` + adaptive thinking (lazy-loaded; not run in test mode).
- 🚧 `/lib/ai/MockAIClient.ts` — fixture-backed double; throws on unstubbed prompts.
- 🚧 `/lib/ai/index.ts` — `getAIClient()` factory (mock in test mode, real otherwise).
- 🚧 `/lib/voice/VoiceClient.ts` — interface for STT/TTS.
- 🚧 `/lib/voice/WebVoiceClient.ts` (browser, iOS-safe) / `TextVoiceClient.ts` (text-fallback double).
- 🚧 `/lib/time/Clock.ts` — `SystemClock` + `FixedClock` (unit-tested).
- 🚧 `/lib/random/Random.ts` — `SystemRandom` + seeded `SeededRandom` mulberry32 (unit-tested).
- 🚧 `/lib/testkit/` — `testMode.ts` (`HABLA_TEST_MODE`/`?test=1`), `seed.ts` (Returner profile + items), `fixtures.ts`.

### Pure logic (Iterations 1–5 — not yet built)
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
- 🚧 `/app/layout.tsx` — root layout, Oswald via link, globals. `/app/globals.css` + `/app/tokens.css` — design tokens.
- 🚧 `/app/page.tsx` — Iteration 0 dashboard placeholder (shell + gap visual + disabled session CTA). Real wiring: Iter 1/5.
- ⬜ `/app/onboarding/` — Iteration 1 (niche → background → diagnostic → first win).
- ⬜ `/app/session/` — Iteration 5 (the daily-session player).
- ⬜ `/app/recap/` — Iteration 4.
- ⬜ `/app/settings/` — correction intensity, voice on/off, level adjust.
- 🚧 `/components/AppShell.tsx` — left rail + main + right panel; mobile bottom tab bar.
- 🚧 `/components/ui/` — `Button`, `Card` (+`CardHeading`), `Input`, `GapBar`. (Badge/Tabs/Modal/ExerciseShell: later.)

### Data
- 🚧 `/supabase/migrations/0001_init.sql` — `users`, `practice_items`, `sessions`, `attempts`, `assessments`, `events` (authored; not yet applied to a project).
- 🚧 `/lib/db/supabase.ts` — lazy single-user client (`getSupabase()`). Typed queries: later.

### Tests
- 🚧 `/eval/` — `runner.ts` + `cases.ts` (one smoke case; pedagogy fixtures arrive with their iterations).
- 🚧 `/e2e/smoke.spec.ts` — boots app in `?test=1`, asserts shell + gap, screenshots to `__screenshots__/`.
- 🚧 unit/int co-located: `lib/random/*.test.ts`, `lib/time/*.test.ts`, `lib/ai/*.int.test.ts`.

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
| 0 | Foundation & test harness | 🚧 built + self-tested (4 layers green); pending Ed review |
| 1 | Onboarding + dual-level + dashboard gap | ⬜ |
| 2 | Reactivation Warm-up (SRS cloze) | ⬜ |
| 3 | Bridge Drills (★ unique IP) | ⬜ |
| 4 | Guided Conversation + corrections + recap | ⬜ |
| 5 | Daily session orchestration + progress | ⬜ |

Post-MVP (not scheduled): voice polish · Absorber pathway · phonetics · Q&A · curriculum · analytics · deploy hardening.
