# CLAUDE.md — Habla

Operating guide for any Claude session building this app. Read this, then read `INDEX.md` to load only the context you need. **Do not read the whole repo.**

---

## What Habla is (the 30-second version)

An AI Spanish **reactivation** app for **Returners** — people who once reached B1–C1 and have gone rusty. It turns Spanish they still *understand* back into Spanish they can *say*, in **one 15–20 minute daily session** built from a few short, varied exercises. The product's reason to exist is **closing the receptive-expressive gap** (what you understand vs. what you can produce). That gap is the north-star metric and the most prominent thing on screen.

Full scope: `habla_v4_scope.md`. How we build: `BUILD_PLAN.md`. How it looks: `UI_UX_PLAN.md`.

---

## Non-negotiables (violating these is a bug, not a style choice)

1. **Returner only.** No Absorber pathway in the MVP. The data model is persona-aware so it can grow, but build only the Returner experience.
2. **No sales.** No Stripe, no tiers, no paywall, no "upgrade" anything. Removed from MVP entirely.
3. **One ~15–20 min session/day.** We are not building an app that demands hours. Maximise *exposure and variety* within that budget, not time-on-app.
4. **The gap is the product.** Track receptive + productive levels separately; show the gap as the headline. Use **bands + trend + confidence**, never false-precision exact CEFR labels.
5. **Voice everywhere, text fallback everywhere.** Every voice interaction has a working text-equivalent path. The text path is the path our automated tests drive.

   **Auth modes (post-MVP):** real mode (Supabase configured) uses Supabase Auth — `getCurrentUserId()` returns the logged-in user, pages redirect to `/login`, and `SupabaseStore` runs under per-user RLS. Test/local mode (no Supabase env, or `HABLA_TEST_MODE=1`) uses a `habla_uid` cookie + `InMemoryStore` so the deterministic harness needs no backend. Keep both paths working — `getCurrentUserId()` is async.
6. **Build behind the seams.** No component imports the Anthropic SDK, Web Speech API, `Date.now()`, or `Math.random()` directly. They come through `AIClient`, `VoiceClient`, `Clock`, `Random`. This is what makes the app self-testable.
7. **Prompts are pedagogy.** A prompt change is a behaviour change → it requires an eval run (`npm run eval`).
8. **One iteration at a time.** Build, self-test (4 layers), hand to Ed, freeze. Don't start the next iteration mid-flight. Don't smuggle in deferred features.
9. **Structure before style.** Build every screen in layer order (structure → interaction → data → responsive → visual). Never jump to colours/fonts first.

---

## How to work an iteration

0. **Re-read the "Coding conventions" section below before writing any code for the phase.** It is a required gate, not optional reading — every iteration is built to those rules.
1. Open `BUILD_PLAN.md` → find the current iteration → restate its scope and the files it touches.
2. Load context narrowly using `INDEX.md`. Pull in only the modules you'll change.
3. Build the feature behind the seams: **pure logic in `/lib`**, UI consuming it, following the coding conventions.
4. Write/extend the four test layers **as you build**:
   - `npm run test` (unit — pure logic), `npm run test:int` (integration — mocked AI/voice), `npm run eval` (prompts vs fixtures), `npm run e2e` (Playwright text-mode, captures screenshots).
5. Run all four until green. Review `e2e/__screenshots__` against `UI_UX_PLAN.md` §8.
6. Report to Ed: what changed, what to look at, and the iteration's specific **Ed-test questions** from `BUILD_PLAN.md`.
7. After sign-off: update `INDEX.md` and mark the iteration frozen.

**"Done" = all four commands green + screenshots correct + Ed signed off.** Not before.

---

## The self-testing architecture (memorise this)

| Seam | Real | Mock (test mode) |
|---|---|---|
| `AIClient` | Anthropic API | `MockAIClient` (fixtures) |
| `VoiceClient` | Web Speech / Whisper / TTS | `TextVoiceClient` (typing = transcript) |
| `Clock` / `Random` | real | fixed clock / seeded RNG |

`HABLA_TEST_MODE=1` (and `?test=1` in the browser) wires all mocks + a seeded Returner profile + a known `practice_items` queue → fully reproducible runs. Claude proves every flow through the text path before Ed ever touches a microphone. The only human-only surface is real STT/TTS quality and the "does this feel right / worth returning to" judgement.

---

## Tech stack

Next.js 14 (App Router) + TypeScript · Tailwind + a `tokens.css` generated from the design system · Anthropic SDK (behind `AIClient`) · Web Speech/Whisper/speechSynthesis (behind `VoiceClient`) · Supabase Postgres + simplified single-user auth · Zustand · Vitest + Playwright + custom eval runner. **Not used in MVP:** Stripe, PostHog, Sentry, React Native.

### Choosing a Claude model
**Before wiring any Anthropic call, consult the `claude-api` skill** for current model IDs, pricing, and parameters. Do not hard-code a model name from memory. Default to the latest capable Claude model appropriate to the task (heavier reasoning for assessment/conversation, lighter for deterministic generation).

---

## Repo map (detail in `INDEX.md`)

```
/app          Next.js routes: onboarding, dashboard, session, recap, settings
/components   design-system components (Button, Card, GapBar, ExerciseShell, …)
/lib/ai       AIClient + AnthropicAIClient + MockAIClient + prompts
/lib/voice    VoiceClient + WebVoiceClient + TextVoiceClient
/lib/srs      SRS scheduler + interleaver (pure)
/lib/levels   gap + level-estimate logic (pure)
/lib/session  exercise registry + orchestrator
/lib/exercises  one folder per exercise type (implements the Exercise contract)
/lib/db       Supabase client + typed queries
/lib/testkit  fixed clock, seeded RNG, seed profile, fixtures
/prompts      versioned prompt templates (the pedagogy)
/eval         prompt eval fixtures + runner
/e2e          Playwright specs + __screenshots__
/supabase     migrations
```

The **`Exercise` contract** (`/lib/exercises`) is the extension point: new exercise types are new folders, not orchestrator rewrites. See `BUILD_PLAN.md` Part C.

---

## Design system

The visual law lives in `ux research/SKILL.md` (copied into the repo as the design source of truth). **Read the relevant module before writing a component.** In short: one deep-green canvas, white poster cards with 4px black borders + 20px radius + hard offset shadows (never soft/blurred), Oswald type, skewed white buttons with growing hard shadows, cobalt + hot-pink accents. No raw hex in components — use tokens. Dark mode is automatic. Full UI plan + IA + responsive rules: `UI_UX_PLAN.md`.

---

## Domain glossary

- **Receptive level / Productive level** — what the user understands vs. can produce (separate CEFR bands).
- **The gap** — productive subtracted from receptive; the thing the whole app shrinks.
- **Savings paradigm** — old knowledge is recovered far faster than new is learned; week-one is reactivation, not acquisition. Powers SRS seeding + the "I already know this" fast-forward.
- **Bridge Drill** — the signature exercise: Hear it → Repeat it → Mod it → Make it. The unique IP.
- **Conversation move / production pattern** — the headline unit of practice (a redeployable speaking move), more than individual vocab.
- **Stuck protocol** — the escalating help ladder when a user freezes (wait → cue → choices → model → change-one-word → flag for tomorrow).
- **Attempt** — first-class record of one user production try (prompt, target, transcript, latency, assessment, correction). Our most valuable data.

---

## Out of scope (do not build in MVP)

Payments/tiers · Absorber pathway · phonetics · standalone Q&A · curriculum tracker · custom plans · analytics dashboards · native app · PWA install · premium TTS · multi-language. The schema leaves room; the build does not implement them.

---

## Coding conventions

**Read this section before building each phase.** It is part of the per-iteration checklist (see "How to work an iteration", step 0). These are the rules that keep the build simple, testable, and consistent across sessions.

### TypeScript & types
- **Strict mode on** (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`). No implicit `any`; if a type is genuinely unknown use `unknown` and narrow.
- **Model the domain in types.** CEFR levels, `pathway`, SRS interval state, `Attempt` are types/enums — make illegal states unrepresentable and lean on the compiler instead of runtime checks.
- **No `as` casts to silence the compiler.** If you need a cast, you probably need a type guard or a better type. `as const` for literals is fine.
- **Validate at the edges.** Anything crossing a boundary (AI responses, form input, DB rows, env) is parsed/validated (e.g. Zod) into a typed value before entering the pure core. Trust types only *after* validation.

### Architecture & boundaries
- **Pure core, impure edges.** Domain logic in `/lib` (`srs`, `levels`, `session`, exercise logic) is pure: no I/O, no `fetch`, no SDK, no clock/RNG. Side effects live in routes, server actions, `/lib/db`, and the seam implementations.
- **Everything external goes through a seam.** No file imports the Anthropic SDK, Web Speech API, `Date.now()`/`new Date()`, or `Math.random()` directly — use `AIClient`, `VoiceClient`, `Clock`, `Random`. (This is non-negotiable #6 and the foundation of self-testing.)
- **Dependency direction points inward.** UI → session/exercises → pure domain. Pure domain never imports UI, db, or seams' concrete implementations — only their interfaces.
- **Small modules, single responsibility.** Prefer many small focused files over large ones. If a file passes ~300 lines or mixes concerns, split it.

### Naming & structure
- `camelCase` for variables/functions, `PascalCase` for types/components/classes, `UPPER_SNAKE` for true constants, `kebab-case` for file/route names (except React components which are `PascalCase.tsx`).
- Names say *what/why*, not *how*. Booleans read as predicates (`isStuck`, `hasSavingsFlag`). No abbreviations that aren't already domain terms (the glossary words are fine).
- Co-locate: an exercise's logic, types, and tests live in its `/lib/exercises/<name>/` folder.

### Error handling & async
- **No silent catches.** Catch only to add context or recover; never swallow. Surface user-facing errors *in context* (per UI plan), log the rest.
- **AI/voice/network calls can fail** — every seam call has a defined failure path. AI failure in a session must degrade gracefully (retry once, else fall back to a deterministic path or a friendly "let's try that again"), never crash the session.
- `async/await` only (no raw `.then` chains in app code). No floating promises — await or explicitly `void`.
- No `console.log` left in committed code; use a small logger and remove debug noise.

### Testing (ties to the four layers)
- **Pure logic is tested logic.** Every function in `/lib/srs`, `/lib/levels`, `/lib/session`, and each exercise's logic ships with unit tests. SRS scheduling, gap math, and interleaving are the bug-prone core — aim for high coverage there specifically.
- **Test behaviour, not implementation.** Assert on outputs/state transitions and recorded `Attempt`s, not internal calls.
- **Tests are deterministic.** Use the injected clock/RNG and `MockAIClient`/`TextVoiceClient` — never real time, randomness, or network in tests.
- **A prompt change requires an eval run** (`npm run eval`). A prompt edit without it is an untested change.
- Write/extend tests *as you build the feature*, not after.

### React / Next.js
- Server Components by default; `'use client'` only when interactivity needs it. AI calls run in server actions / route handlers (keys never reach the client).
- Components are presentational and consume domain output; **no domain logic, AI calls, or `Date.now()` inside components.**
- Client state in Zustand stores with typed selectors; don't reach across stores. Keep session/queue/UI state separate.
- Lists need stable keys; effects need correct deps; clean up subscriptions/timers.

### Styling
- **Tokens only — no raw hex/rgb or magic px** in component code; use the `tokens.css` custom properties and the spacing scale (see `UI_UX_PLAN.md` / `ux research/SKILL.md`).
- Read the specific design-system module before authoring a component. Build structure→interaction→data→responsive→visual; styling is last.

### Accessibility
- Semantic HTML (`<button>` for actions, `<a>` for nav, heading order). Labels tied to inputs. Visible focus states. Touch targets ≥44px. Respect `prefers-reduced-motion`. The text-fallback path must be keyboard-operable.

### Security & data
- **No secrets in the repo.** Keys in env vars only; `.env*` is git-ignored; provide `.env.example` with empty placeholders.
- Supabase RLS-ready: scope queries by user even in single-user mode so multi-user is a config change, not a rewrite.
- Never log transcripts/PII beyond what `attempts` intentionally stores. Don't send user data anywhere except Anthropic (for the turn) and Supabase.

### Tooling, comments, dependencies
- **ESLint + Prettier** run clean before an iteration is "done"; formatting is automated, not argued about.
- Match the surrounding file's comment density. Comment the *why* (especially the pedagogy/UX intent behind a structural choice), never narrate the *what*.
- **Be conservative adding dependencies.** Prefer the stack in `BUILD_PLAN.md` Part B. A new dependency needs a real justification; check for an existing utility first.
- Conventional, small DB migrations — durable primitives first (scope §7); defer speculative tables.

### Git hygiene
- Don't commit or push unless Ed asks. If asked, **branch first** — never commit directly to the default branch.
- Small, focused commits with clear messages (imperative mood). One iteration's work is reviewable on its own branch/PR.
