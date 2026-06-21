# Habla — V4 Build Plan

_Companion to `habla_v4_scope.md`. This is the how-we-build document._

The plan has two non-negotiable shapes:

1. **One big testable iteration at a time.** Each iteration ships one coherent feature, is self-tested by Claude, then user-tested by Ed, then frozen before the next begins. We do not build two features in parallel.
2. **Claude tests as much as possible without a human.** Every iteration must be verifiable end-to-end through a text path, with deterministic seeds and mockable AI. The microphone is the *last* thing a human needs to touch.

---

## Part A — The self-testing architecture (build this in Iteration 0, rely on it forever)

This is the most important section. The whole point of "simple build + heavy testing + Claude does the testing" is that the architecture has **seams** that let Claude exercise the real logic without real voice, real network, or real human judgement.

### A1. Three seams, mockable from day one

| Seam | Real implementation | Test double | Lets Claude test… |
|---|---|---|---|
| **`AIClient`** | Anthropic API (conversation, assessment, generation, correction) | `MockAIClient` returns recorded fixtures keyed by prompt+input | Every flow that calls Claude, offline & deterministically |
| **`VoiceClient`** | Web Speech / Whisper (STT) + speechSynthesis/TTS | `TextVoiceClient` — typing **is** the transcript; TTS is a no-op | The full session loop with no microphone |
| **`Clock` / `Random`** | real time, real RNG | injected fixed clock + seeded RNG | SRS scheduling, interleaving, "due today" logic |

Rule: **no component imports the Anthropic SDK, the Web Speech API, `Date.now()`, or `Math.random()` directly.** They take these via the seam. This single rule is what makes the app testable.

### A2. Deterministic test mode

A `HABLA_TEST_MODE=1` env flag (and a `?test=1` URL param for the browser) wires up: `MockAIClient`, `TextVoiceClient`, fixed clock, seeded RNG, and a known seeded Returner profile with a known `practice_items` queue. Any run in test mode is reproducible.

### A3. The four test layers Claude runs

| Layer | Tool | Command | What it covers |
|---|---|---|---|
| **Unit** | Vitest | `npm run test` | Pure logic: SRS scheduler, gap computation, interleaver, cloze/repeat matchers, the session orchestrator. No I/O. Fast. |
| **Integration** | Vitest + `MockAIClient` | `npm run test:int` | A whole exercise or the whole daily session run headless with mocked AI/voice. Asserts state transitions, attempt records, level updates. |
| **Prompt eval** | custom runner | `npm run eval` | Each prompt vs its fixture set (correction style, level calibration, stuck-user, overcorrection, mixed-language). Pass/fail per fixture; uses assertion checks where deterministic and an LLM-judge where qualitative. |
| **E2E (text mode)** | Playwright (headless) | `npm run e2e` | Drives the real UI in `?test=1`: onboard → dashboard → full session → recap, typing every "spoken" turn. Captures screenshots into `e2e/__screenshots__` for visual review against the design system. |

**Definition of "Claude tested an iteration":** all four commands pass, and Claude has reviewed the captured E2E screenshots against `UI_UX_PLAN.md`. Only then does it go to Ed.

### A4. What still needs Ed (the human-only surface, kept minimal)

- Real microphone STT accuracy and TTS quality (voice path only — logic is already proven via text).
- "Does this *feel* like it's made for me / worth opening tomorrow" — the judgement calls.
- Real-device feel (his phone).

Everything else, Claude proves before Ed sees it.

---

## Part B — Tech stack (chosen for simplicity + testability)

| Layer | Choice | Note |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | Server actions for AI calls; strict TS for the level/SRS domain. |
| Styling | **Tailwind + CSS custom-property token layer** generated from the design system | The design system (`ux research/SKILL.md`) is very specific (skewed poster buttons, hard offset shadows, Oswald). We **hand-build a small component set** to it rather than fight a generic theme. See `UI_UX_PLAN.md`. |
| AI | **Anthropic SDK** behind `AIClient` | Model per call decided via the `claude-api` skill at build time — do not hard-code from memory. |
| Voice | Web Speech API + Whisper (STT), speechSynthesis (TTS) behind `VoiceClient` | Always paired with a text fallback path. |
| DB / auth | **Supabase (Postgres), single-user simplified auth** | RLS-ready schema; auth friction minimised for the solo-tester phase. |
| Client state | **Zustand** | Session/queue/UI state. |
| Tests | **Vitest + Playwright + custom eval runner** | The four layers above. |
| Hosting | Local dev now; **Vercel** when we deploy | |

**Not in the stack for MVP:** Stripe, PostHog, Sentry, React Native. (Add later.)

---

## Part C — Repository shape

```
/                         CLAUDE.md, INDEX.md, *_scope.md, BUILD_PLAN.md, UI_UX_PLAN.md
/app                      Next.js routes (onboarding, dashboard, session, recap)
/components               design-system components (Button, Card, GapBar, …)
/lib
  /ai                     AIClient interface + AnthropicAIClient + MockAIClient + prompts/
  /voice                  VoiceClient interface + WebVoiceClient + TextVoiceClient
  /srs                    scheduler (pure), interleaver (pure)
  /levels                 gap + level-estimate logic (pure)
  /session                exercise registry + orchestrator (pure-ish)
  /exercises              one folder per exercise type, each implements Exercise contract
  /db                     supabase client + typed queries
  /testkit                fixed clock, seeded RNG, seed profile, fixtures
/prompts                  versioned prompt templates (the pedagogy)
/eval                     prompt eval fixtures + runner
/e2e                      Playwright specs + screenshots
/supabase                 migrations
```

### The `Exercise` contract (why iteration-at-a-time is cheap)

Every exercise type implements one interface so the orchestrator, the test harness, and the recap don't care which exercise they're running:

```ts
interface Exercise {
  id: string;                                  // 'reactivation' | 'bridge' | 'conversation'
  estimatedMinutes: number;
  generate(ctx: SessionContext, ai: AIClient): Promise<ExercisePlan>;   // deterministic under MockAIClient
  // UI consumes the plan; user actions produce Attempts:
  assess(attempt: RawAttempt, ai: AIClient): Promise<Attempt>;          // deterministic checks first, AI only when needed
}
```

Adding a new exercise (or the future Absorber audio-cloze) = a new folder under `/lib/exercises` + register it. No orchestrator rewrite.

---

## Part D — The iterations

Each iteration below lists: **scope · build · self-test (the 4 layers) · Ed-test · exit criteria**. An iteration is *frozen* before the next starts.

### Iteration 0 — Foundation & test harness
- **Scope:** a running skeleton that proves the seams, not features.
- **Build:** Next.js + TS + Tailwind token layer; design-system primitives (Button, Card, GapBar, Input — enough to render the shell); Supabase project + first migration (`users`, `practice_items`, `sessions`, `attempts`, `assessments`, `events`); the three seams with both real and mock implementations; `HABLA_TEST_MODE`; the four test commands wired and green on a trivial example; app shell (left rail + main + right panel) with placeholder content.
- **Self-test:** unit (clock/RNG/seed), integration (Mock seams resolve), eval (runner executes on one sample), e2e (app boots, shell renders, screenshot captured).
- **Ed-test:** app runs locally; design shell looks right.
- **Exit:** all four commands green; seams documented in CLAUDE.md; INDEX.md updated.

### Iteration 1 — Onboarding + dual-level model + dashboard gap
- **Scope:** a Returner can sign up, get placed, see their gap. No exercises yet.
- **Build:** niche check + background + light diagnostic (cloze + short conversation via `AIClient`); structured level-estimate → `assessments` + `users`; **first-win** micro-conversation; dashboard with the two-number gap + bar + streak placeholder + "today's session" CTA (disabled stub).
- **Self-test:** unit (level/gap math, band/confidence framing); integration (full onboarding with MockAIClient → correct `users`/`assessments` rows); eval (level-calibration + first-win warmth fixtures); e2e (onboard→dashboard in text mode, gap renders, screenshot).
- **Ed-test:** does placement feel fair? does first win land in <2 min? does the gap framing feel true (not false-precision)?
- **Exit:** four green; onboarding reproducible in test mode; gap visible and stored.

### Iteration 2 — Reactivation Warm-up (SRS cloze, savings paradigm)
- **Scope:** exercise type A, standalone (runnable on its own before the orchestrator exists).
- **Build:** SRS scheduler (pure, expanding intervals, dual recognition/production state); savings-seeding of `practice_items` from peak level; cloze UI (spoken via VoiceClient **or** typed); deterministic cloze matcher; **"I already know this"** fast-forward; attempts recorded; due-today logic via injected clock.
- **Self-test:** unit (scheduler intervals, savings fast-forward, matcher incl. accents/typos); integration (run a warm-up block end to end, assert interval advances + attempt rows); eval (only if AI generates items — fixture the generation); e2e (do a warm-up in text mode, screenshot).
- **Ed-test:** do the seeded items feel like "stuff I used to know"? is the savings shortcut satisfying, not tedious?
- **Exit:** four green; scheduler fully unit-covered (this is core logic — aim high coverage here).

### Iteration 3 — Bridge Drills (★ the unique IP)
- **Scope:** exercise type B, the signature mechanic. Highest-value iteration.
- **Build:** the four-step ladder Hear → Repeat → Mod → Make, each step with a text fallback (Hear = play + show transcript on fallback; Repeat = transcript match or type; Mod = spoken/typed cloze; Make = open production assessed by `AIClient`); the **stuck protocol** ladder wired into Mod/Make; AI generates the drill from a target pattern (deterministic under mock). Consider the review's "Mix it" step (arrange chunks) between Mod and Make if Make proves too big a leap — flag for Ed.
- **Self-test:** unit (step state machine, stuck-ladder transitions, transcript matcher); integration (full drill with MockAIClient, including a simulated "stuck" path → assert ladder climbs); eval (Make-step assessment + recast fixtures, overcorrection guard); e2e (complete a bridge drill in text mode incl. a stuck branch, screenshots of each step).
- **Ed-test:** does Hear→Make actually move a passive phrase into something he can say? is the Make leap too big (do we need Mix it)?
- **Exit:** four green; the stuck protocol demonstrably works in integration tests.

### Iteration 4 — Guided Conversation Mission + corrections + recap
- **Scope:** exercise type C + the recap (type D).
- **Build:** scenario + target pattern + ≤6-turn cap + clear win; voice in/out with text fallback; streamed Claude responses; **form-focused Returner corrections** in a side panel (capped count, never interrupting flow); live recast vs after-session coaching split; post-session **recap**: gap update, "what you said well", ≤3 corrections, one pattern flagged → tomorrow's queue, streak; correction-intensity setting (minimal/standard/detailed).
- **Self-test:** unit (turn cap, correction cap, recap assembly, pattern→queue handoff); integration (full conversation with MockAIClient, assert ≤3 corrections surfaced + recap + new `practice_items`); eval (Returner correction style, mixed-language nudge, stuck-in-conversation, overcorrection at each intensity); e2e (run a mission in text mode → recap, screenshots).
- **Ed-test:** do corrections build courage or sting? is the mission "structured pressure" not "just chat"? does recap feel like progress?
- **Exit:** four green; correction cap + intensity setting verified across fixtures.

### Iteration 5 — Daily session orchestration + progress
- **Scope:** stitch A/B/C/D into the one 15–20 min interleaved session; show progress over time.
- **Build:** session orchestrator picks 3 blocks + recap, interleaved (no two same types adjacent), budgeted to ~17 min via `estimatedMinutes`; session start/complete events; streak (days); gap-over-time from `assessments`; "resume if interrupted" handling.
- **Self-test:** unit (orchestrator selection + interleaving + time budget; streak rollover via fixed clock; gap-over-time series); integration (full daily session across all exercise types with mocks → one `sessions` row + N `attempts` + updated levels + streak); eval (n/a or regression-run all prior sets); e2e (the **whole** daily loop onboard→session→recap in text mode, screenshots of each block).
- **Ed-test:** the real thing — does ~17 min feel valuable and varied? worth coming back tomorrow? (This is the MVP's definition-of-done moment, scope §10.)
- **Exit:** four green; the full loop runs end-to-end in test mode in CI.

### Iteration 6+ (post-MVP, listed so we don't smuggle them early)
Voice quality polish (premium TTS, Whisper tuning) · Absorber pathway (new exercise modules + audio diagnostic) · phonetics · Q&A · curriculum tracker · analytics · deploy hardening. **None of these are MVP.**

---

## Part E — Working rhythm (every iteration)

1. **Plan** — restate the iteration's scope from this doc; list files to touch. Keep context lean by loading only what `INDEX.md` points to. **Re-read the "Coding conventions" section of `CLAUDE.md` before writing code — it is a required gate for every phase.**
2. **Build** — feature behind the seams; pure logic in `/lib`, UI consuming it, following the `CLAUDE.md` coding conventions.
3. **Self-test** — write/extend the 4 layers *as you build*, not after. Run all four. Fix until green. Review E2E screenshots vs the design system.
4. **Report to Ed** — summary + what to look at + the specific Ed-test questions for this iteration.
5. **Freeze** — once Ed signs off, update `INDEX.md` and the iteration's status; do not reopen it while building the next.

## Part F — Testing principles (carry through all iterations)

- **Pure logic has no excuse to be untested.** SRS, gap math, interleaving, matchers, orchestration → high unit coverage. These are the bug-prone core.
- **Every voice path has a text path, and the text path is the tested path.**
- **Prompts change → eval runs.** A prompt edit without an eval run is an untested change.
- **Test mode is reproducible or it's not test mode.** Fixed clock, seeded RNG, seeded data, mocked AI — always.
- **A feature isn't done until the four commands are green and the screenshots look right.**
