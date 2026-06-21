# Habla — V4 MVP Scope

_Revision of v3.0 PRD · 2026-06-21 · supersedes `app research/habla_app_summary_v3.docx` for build purposes_

> This document defines **what we are building first**. It is deliberately narrower than the v3 PRD.
> The v3 PRD and its strategy review (`app research/`) remain the long-term vision. This is the proof build.

---

## 0. What changed from V3 → V4 (read this first)

| Decision | V3 | V4 (this build) | Why |
|---|---|---|---|
| **Personas** | Returner **and** Absorber, two pathways | **Returner only** | The builder/tester (Ed) is a Returner. One persona = half the surface area, and we can dogfood every change. Absorber pathway is deferred, not deleted — the data model stays persona-aware. |
| **Sales / payments** | Stripe, free/premium tiers | **Removed entirely** | Goal is a simple running proof. No billing, no tiers, no paywall logic. |
| **Daily commitment** | 3× 10–15 min sessions/day | **One 15–20 min session/day** | Provide value for time spent. We are not building an app that demands hours. One focused session, several exercise types, maximum exposure. |
| **Voice** | Audio-first, voice-only in places | **Voice from the start, with a mandatory text fallback on every voice interaction** | Keeps the speaking premise, but the text path means Claude can self-test the entire app end-to-end with no microphone. |
| **Bridge Drills** | Phase 4, Absorber-critical | **Core MVP exercise (Iteration 3)** | It is the app's unique IP. The strategy review is explicit: move it earlier. Returners benefit too. |
| **Scope** | Full platform (SRS, Q&A, phonetics, curriculum, custom plans, analytics) | **Daily session loop only** (4 exercise types + recap) | Build less platform, more proof. Everything else is deferred. |
| **Persistence** | Supabase + full auth | **Supabase, single-user simplified** | Real persistence that grows later, minimal auth friction now. |

**Deferred to post-MVP (explicitly NOT in this build):** Absorber pathway · payments/tiers · phonetics module · standalone Q&A module · curriculum tracker · custom plans · deep analytics dashboards · native/React Native app · PWA install polish · premium TTS voices.

---

## 1. The one-sentence product

> **Habla turns the Spanish a Returner already understands back into Spanish they can say — in one 15–20 minute daily session built from a few short, varied exercises.**

Everything in this scope serves that sentence. If a feature does not help a lapsed learner *produce* Spanish they used to know, it is out of the MVP.

---

## 2. North-star metric (unchanged — this is the IP)

Every user has two tracked levels:

- **Receptive level** — what they can understand.
- **Productive level** — what they can say under pressure.

The **gap between them** is the single headline number the app exists to shrink. It is the most prominent element on the dashboard. All other numbers (streak, items reactivated, conversation minutes) are secondary.

> Framing rule (from strategy review): show level **bands + trend + confidence**, never false-precision exact CEFR labels. "You understand around B1–B2; you speak closer to A2; the gap is closing" — not "B2.0 / A2.0".

---

## 3. The Returner, condensed

- Reached B1–C1 once; hasn't used it in years. Reading mostly retained, **speaking worst-affected**, vocabulary most attrition-prone, grammar knowledge persists.
- Has explicit metalinguistic awareness — knows tense names, comfortable with grammar terms. **Grammar terminology is welcome and efficient** for this persona.
- Embarrassed by the decline, high motivation / low confidence on re-engagement.
- **What kills them:** being treated like an A1 beginner; vocab lists they already know; cartoon gamification.
- **The lever (savings paradigm):** previously-learned material is recovered 3–5× faster than new material is acquired. The MVP leans on this — week one is *reactivation of old knowledge*, not acquisition of new.

---

## 4. The daily session — the entire product loop

One session per day. Target **15–20 minutes**. Built from a rotating set of short exercise blocks, **interleaved** (never two of the same type back-to-back) for variety and retention. The session orchestrator picks 3 exercise blocks + a recap each day.

### The exercise types (the "few different exercises" for maximum exposure)

| # | Exercise | ~Time | What it does | Unique-IP weight |
|---|---|---|---|---|
| A | **Reactivation Warm-up** (SRS cloze) | ~4 min | Old vocabulary/patterns surfaced as spoken/typed cloze. Savings effect kicks in fast. "I already know this" fast-forward. | Returner savings shortcut |
| B | **Bridge Drill** | ~5 min | Hear it → Repeat it → Mod it → Make it. Converts comprehension into production. | ★ The signature IP |
| C | **Guided Conversation Mission** | ~6 min | A short (≤6-turn) scenario with a target pattern and a clear win. Voice in/out, text fallback. Form-focused corrections. | Structured production |
| D | **Recap** | ~2 min | Gap update, "what you said well", up to 3 corrections (capped), one pattern flagged for tomorrow, streak (days, not minutes). | Gap-as-product |

> **Exercise registry design:** exercises are pluggable. Each is a self-contained module implementing a common `Exercise` contract (see `BUILD_PLAN.md`). Adding a new type (or the Absorber audio-cloze later) is a new module, not a rewrite. This is what makes feature-at-a-time iteration cheap.

### The unit of practice = "conversation moves" / production patterns, not just words

Per the strategy review, the SRS and bridge content schedule **reusable speaking moves and patterns**, not only vocabulary:

- "Tell someone what you usually do on Sundays."
- "Explain that you're running late."
- "Say what you used to do when you lived somewhere."
- "Ask a follow-up question."

Vocabulary is tracked where useful, but a *pattern the user can redeploy in a new context* is the headline unit.

### The "stuck" protocol (must be explicit in prompts + UI)

When the user freezes in a drill or conversation, the app climbs a ladder rather than failing them:
1. Wait. 2. First-word cue. 3. Two choices. 4. Repeat a model answer. 5. Change one word. 6. Mark the pattern for tomorrow.

### Correction discipline (retention guardrail)

- **Returner style = form-focused**: name the error + give the rule, briefly. ("You said X — try Y. Imperfect, because it's a habitual past action.")
- **Cap corrections per session** (default 3 surfaced) and **always show "what you said well"** as prominently as fixes. Embarrassed learners churn under a feed of mistakes.
- Live recasts in conversation are separate from the after-session coaching summary.
- Correction intensity is a user-adjustable setting (minimal / standard / detailed) — also our first A/B-style test lever.

---

## 5. Onboarding (minimal, Returner-only)

The goal: confirm niche, set the two levels, and deliver a **first win within ~90 seconds**.

1. **Niche check** — single question. "I formally studied Spanish but haven't kept it up" → in. Anyone selecting "never had exposure" or "around Spanish but never studied" gets a friendly "not yet / waitlist" screen (Absorber is a *deferred pathway*, not a rejection). No hard dismissal.
2. **Background** — peak level reached, years since active use, learning context, whether they still read Spanish. Drives savings-seeding.
3. **Light self-placement + short diagnostic** — a handful of cloze items (A2–C1) + a 5-turn voice/text conversation. Claude returns a structured estimate: receptive band, productive band, confidence, observed gaps. **Framed as an adaptive estimate, recalibrated as you speak more** — not an exam.
4. **Goals & topics** — travel / work / family / culture / living abroad. Weights content.
5. **First win** — a 60-second guided micro-conversation about *why they originally learned Spanish*. Ends on: "You just said that in Spanish. That's the gap closing." No dashboard tour first.

---

## 6. Dashboard (the home screen)

Pathway-aware but, for MVP, Returner-only. Layout follows the reference screenshots' composition (left rail, hero, content cards, right context panel) rendered in the Habla design system (see `UI_UX_PLAN.md`). Contents:

- **Today's session** — one prominent card: "Start today's session (~17 min)". This is the primary action; it must dominate.
- **The gap** — two-number receptive/productive display + a gap bar. The headline visual. Trend arrow.
- **Streak** — days, not minutes.
- **Recent corrections** — last few from conversation/drills.
- **(Deferred behind the above)** pattern review queue count, recent wins.

The dashboard does **one job**: get the user into today's session in one tap. Everything else is secondary.

---

## 7. Data model (durable primitives only)

Keep the schema small; learning products change shape under real use. Start with:

- **`users`** — profile, `pathway` (enum, defaults `returner`), `receptive_level`, `productive_level`, `peak_level`, `years_since_active_use`, `reads_spanish`, `goals[]`, `topics[]`, `correction_intensity`, `streak_count`, `last_active_date`.
- **`practice_items`** — the SRS/pattern bank. `item_type` (vocab | pattern | move), `prompt`, `target`, `topic`, `level`, dual interval state (`recognition_*`, `production_*`), `source` (seeded | generated | from_conversation), `is_savings` (Returner "I already know this" flag).
- **`sessions`** — one row per daily session; which exercise blocks ran, duration, completion.
- **`attempts`** — **first-class** (per strategy review). Each: prompt shown/played, expected pattern/target, user transcript, latency, completion status, LLM assessment, correction/recast, `should_reappear`. This is the most valuable data we collect; it powers adaptation and proof-of-gap-closure.
- **`assessments`** — diagnostic + ongoing level estimates over time (for the gap-over-time chart).
- **`events`** — analytics-lite (session started/completed, drop-off points). No third-party analytics in MVP; just rows.

Deferred tables: curriculum progress, bridge-completion, custom plans.

---

## 8. AI behaviour = product behaviour

Prompts are pedagogy, not implementation detail. The MVP treats them as versioned, testable artifacts:

- All Claude calls go through a single typed **`AIClient`** seam (mockable — see `BUILD_PLAN.md` §Self-testing).
- A **prompt eval set** ships with the app: Returner correction examples, level-calibration examples, stuck-user examples, overcorrection examples, mixed English/Spanish examples. Each prompt is checked against its fixtures so we can change a prompt and instantly see if behaviour regressed.
- Not every turn needs full LLM reasoning. Deterministic checks (cloze match, repeat match, pattern substitution) run without a model call — cheaper, faster, and trivially unit-testable.

Model selection (conversation, assessment, generation) is set at build time — **consult the `claude-api` skill before wiring any Anthropic call** rather than hard-coding a model from memory.

---

## 9. Out of scope for V4 (so we don't drift)

Payments · tiers · Absorber pathway · phonetics · standalone Q&A · curriculum tracker · custom plans · analytics dashboards · native app · PWA install · premium TTS · multi-language. Each is a post-proof addition. The data model leaves room for them; the build does not implement them.

---

## 10. Definition of done for the MVP

The MVP has succeeded as a *proof* when, with Ed as the tester:

1. A Returner can onboard and get a first win in under ~2 minutes.
2. They can complete a full ~15–20 min daily session built from ≥3 varied exercise types, including at least one Bridge Drill and one guided conversation.
3. The dashboard shows their receptive/productive gap and it visibly updates as they practise.
4. They can produce, at the end of a session, a pattern they could not produce at the start.
5. The whole loop is reachable and testable via the **text-fallback path** with zero microphone use (so Claude can regression-test it).
6. It is worth opening again tomorrow.

See `BUILD_PLAN.md` for how we get there, iteration by iteration, and `UI_UX_PLAN.md` for how it looks.
