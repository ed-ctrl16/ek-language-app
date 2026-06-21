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

### Auth (post-MVP) — Supabase login/logout
- 🚧 `/lib/db/supabase.ts` — `getServerSupabase()` (cookie/session-aware) + `isSupabaseConfigured()`.
- 🚧 `/lib/db/supabaseBrowser.ts` + `/middleware.ts` — browser client + session refresh (no-op without Supabase).
- 🚧 `/lib/session/currentUser.ts` — async `getCurrentUserId()`: Supabase auth user (real) or `habla_uid` cookie (test/local); `authRedirectPath()`.
- 🚧 `/app/login/` (form + page), `/app/auth/actions.ts` (`logout`), logout in Settings.
- 🚧 `/supabase/migrations/0002_auth_rls.sql` — per-user RLS policies (`auth.uid()`).

### Content variety (post-MVP) — fresh content on repeat sessions
- 🚧 `/lib/exercises/bridge/patterns.ts` — `patternForRotation(level, n)`; expanded bank.
- 🚧 `/lib/exercises/conversation/missions.ts` — `missionForRotation(level, n)`.
- 🚧 `/lib/exercises/reactivation/generate.ts` — `generateWarmupItems` (AI cloze) + `prepare.ts` (`prepareWarmupItems`: due + top-up).
- session/exercise pages rotate by sessions-completed; warm-up generates fresh items as the queue empties.
- 🚧 Store extended (Iter 2): `listItems`/`saveItems`/`updateItem`/`saveAttempt`/`listAttempts` + `Attempt`/`PracticeItem` types, across InMemory + Supabase.
- ✅ `/lib/session/currentUser.ts` — single-user cookie identity (`getCurrentUserId` / `setCurrentUserId`).
- ✅ `/lib/voice/*` — voice input surfaces live status + errors (verified working in Chrome). Full cross-browser stack: Iter 4.

### SRS & reactivation (Iteration 2) — ✅ frozen
- ✅ `/lib/srs/scheduler.ts` — expanding intervals (1→3→7→14→30→90), `reviewState`, `markKnownState` (savings→day-7), `isDue`, `freshState`. Unit-tested.
- ✅ `/lib/srs/matcher.ts` — `matchesCloze`/`normalizeAnswer` (case/accent/punct-insensitive; rejects wrong words). Unit-tested.
- ✅ `/lib/srs/seedBank.ts` — `seedItemsForPeak` (savings paradigm: items at/below peak, due now). Unit-tested.
- ✅ `/lib/srs/types.ts` — `PracticeItem`, `SrsState`.
- ✅ `/lib/exercises/reactivation/warmup.ts` — `buildWarmupBlock` (due-first, never empty). Unit + integration-tested.

### Bridge Drills (Iteration 3, ★ unique IP) — ✅ frozen
- 🚧 `/lib/exercises/bridge/types.ts` — `BridgeDrill`, `BridgeStep`, `MakeAssessment`.
- 🚧 `/lib/exercises/bridge/steps.ts` — pure step machine (Hear→Repeat→Mod→**Mix**→Make→done). Unit-tested.
- 🚧 `/lib/exercises/bridge/mix.ts` — `buildMix` (deterministic chunk scramble) + `isMixCorrect`. Unit-tested.
- 🚧 `/lib/exercises/bridge/stuck.ts` — the stuck-protocol ladder (wait→first-word→choices→model→change-one-word→flag). Unit-tested.
- 🚧 `/lib/exercises/bridge/generate.ts` — `generateBridgeDrill` + `assessMake` via AI seam (zod-validated). Integration-tested.
- 🚧 `/lib/exercises/bridge/patterns.ts` — bridge-able patterns by level (`patternForLevel`).
- 🚧 `/lib/srs/matcher.ts` extended: `matchesRepeat`/`sentenceMatchRatio` for the Repeat step. Unit-tested.

### Guided Conversation (Iteration 4) — built + self-tested
- 🚧 `/lib/exercises/conversation/types.ts` — mission, turn, correction, recap types.
- 🚧 `/lib/exercises/conversation/recap.ts` — turn cap (≤6) + correction caps by intensity (minimal 1 / standard 3 / detailed 5). Unit-tested.
- 🚧 `/lib/exercises/conversation/missions.ts` — seeded scenario missions; `pickMission`. Unit-tested.
- 🚧 `/lib/exercises/conversation/converse.ts` — `converseTurn` (reply + capped correction) + `summarizeConversation` via AI seam (zod). Integration-tested.

### Daily session & progress (Iteration 5) — built + self-tested
- 🚧 `/lib/srs/interleaver.ts` — `interleave` (no two same types adjacent). Unit-tested.
- 🚧 `/lib/session/registry.ts` — exercise specs (`EXERCISES`, estimated minutes).
- 🚧 `/lib/session/orchestrator.ts` — `planDailySession` (budgeted + interleaved). Unit-tested.
- 🚧 `/lib/session/streak.ts` — `computeStreak` (days, not minutes). Unit-tested.
- 🚧 `/lib/levels/gapSeries.ts` — `gapOverTime` for the progress trend. Unit-tested.
- 🚧 Store extended: `saveSession`/`listSessions` + `Session` type; `HablaUser.lastActiveDate`.

### Exercises (`Exercise` contract — see BUILD_PLAN Part C)
- ⬜ `/lib/exercises/reactivation/` — Iteration 2 (SRS cloze, savings).
- ⬜ `/lib/exercises/bridge/` — Iteration 3 (★ Hear→Repeat→Mod→Make + stuck protocol).
- ⬜ `/lib/exercises/conversation/` — Iteration 4 (guided mission + corrections).
- ⬜ `/lib/exercises/recap/` — Iteration 4 (gap delta, wins, capped corrections, tomorrow's pattern).

### Routes / UI
- 🚧 `/app/layout.tsx` — root layout, Oswald via link, globals. `/app/globals.css` + `/app/tokens.css` — design tokens.
- 🚧 `/app/page.tsx` — dashboard: stored gap + bands + observed-gaps transparency ("What we noticed") + recalibrate note; "Start warm-up" links to /warmup (full session = Iter 5 stub).
- 🚧 `/app/onboarding/` — niche → background → diagnostic → goals → first win; `OnboardingWizard.tsx` (client) + `actions.ts` (`completeOnboarding`, `getFirstWinReply`).
- 🚧 `/app/warmup/` — Reactivation Warm-up: `page.tsx` (seeds + serves a due block) + `WarmupExercise.tsx` (client) + `actions.ts` (`recordWarmupAttempt`).
- 🚧 `/app/bridge/` — Bridge Drill: `page.tsx` + `BridgeDrillExercise.tsx` (5 steps + stuck ladder) + `actions.ts`.
- 🚧 `/app/conversation/` — Guided mission: `page.tsx` (`pickMission`) + `ConversationMissionUI.tsx` (chat + live Notes panel + recap) + `actions.ts` (`converseTurnAction`, `finishConversationAction`).
- 🚧 `/app/settings/` — correction intensity (`SettingsForm.tsx` + `actions.ts`). Voice/level-adjust: later.
- 🚧 `/app/session/` — daily session: `page.tsx` (plans + fetches all blocks) + `SessionPlayer.tsx` (runs blocks via onComplete, recap + streak) + `actions.ts` (`completeSessionAction`).
- 🚧 `/app/progress/` — gap-over-time trend + streak + session/attempt counts.
- exercise components now accept `onComplete` so they run standalone or inside the session.
- 🚧 `/components/AppShell.tsx` — left rail + main + right panel; mobile bottom tab bar.
- 🚧 `/components/VoiceTextInput.tsx` — text input always; mic button when speech supported (text fallback).
- 🚧 `/components/ui/` — `Button` (variant brand/secondary/tertiary), `Card` (+`CardHeading`), `Input`, `GapBar`. (Badge/Tabs/Modal/ExerciseShell: later.)

### Data
- 🚧 `/supabase/migrations/0001_init.sql` — `users`, `practice_items`, `sessions`, `attempts`, `assessments`, `events` (authored; not yet applied to a project).
- 🚧 `/lib/db/supabase.ts` — lazy single-user client (`getSupabase()`). Typed queries: later.

### Tests
- 🚧 `/eval/` — `runner.ts` + `cases.ts` (smoke + assess-calibration + first-win warmth; more pedagogy fixtures per iteration).
- 🚧 `/e2e/helpers.ts` — `onboardReturner(page)` shared helper. `onboarding.spec.ts` + `warmup.spec.ts` (text-path journeys, screenshots to `__screenshots__/`).
- 🚧 unit: `lib/random`, `lib/time`, `lib/levels/cefr`, `lib/srs/{scheduler,matcher,seedBank}`, `lib/exercises/reactivation/warmup`, `lib/exercises/bridge/{steps,stuck}`.
- 🚧 integration: `lib/ai`, `lib/levels/assess`, `lib/store/InMemoryStore`, `lib/exercises/reactivation/warmup.int`, `lib/exercises/bridge/bridge.int`.
- 🚧 e2e: `onboarding.spec`, `warmup.spec`, `bridge.spec` (+ `helpers.ts`).

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
| 2 | Reactivation Warm-up (SRS cloze) | ✅ frozen (Ed concluded testing 2026-06-21; assessment made more transparent + conservative on speaking) |
| 3 | Bridge Drills (★ unique IP) | ✅ frozen (Hear→Repeat→Mod→Mix→Make + stuck protocol; Ed approved continuing) |
| 4 | Guided Conversation + corrections + recap | 🚧 built + self-tested (4 layers + typecheck green); pending Ed review |
| 5 | Daily session orchestration + progress | 🚧 built + self-tested (4 layers + typecheck green); pending Ed review |

**MVP feature-complete** (all 6 iterations built): onboarding → dual-level gap → daily session of interleaved exercises (Reactivation · Bridge · Conversation) → recap + streak + progress. Full loop passes e2e in test mode.

Post-MVP (not scheduled): voice polish (iOS Whisper) · Absorber pathway · phonetics · Q&A · curriculum · custom plans · analytics · payments · deploy hardening.
