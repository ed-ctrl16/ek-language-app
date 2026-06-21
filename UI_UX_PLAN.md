# Habla — V4 UI/UX Plan

_Companion to `habla_v4_scope.md` and `BUILD_PLAN.md`._

This plan is built from three inputs in `ux research/`:
1. **`SKILL.md`** — the Habla design system (the visual law: deep-green immersive canvas, white poster cards, hard black offset shadows, Oswald, skewed buttons). **This is the source of truth for how everything looks.**
2. **The two reference screenshots** — education/dashboard layouts. We borrow their *composition and information architecture*, not their soft pastel styling.
3. **`ux-audit.skill` + `ux-redesign.skill`** — the *method*: audit before changing, then change in strict layers **structure → interaction → data → responsive → visual**.

---

## 1. How we apply the two skills (we're greenfield, so adapt them)

The audit/redesign skills assume an existing app. We have none yet, so:

- **`ux-audit` becomes a design brief.** We can't audit code that doesn't exist, but we apply its *evaluation dimensions* as build-time acceptance criteria (IA, primary-action prominence, click depth, data density, feedback/status, consistency, visual hierarchy, mobile). Each screen is checked against these before it's "done." A real `UX_AUDIT.md` gets written at the **end of Iteration 5**, run against the built MVP, to drive a polish pass.
- **`ux-redesign`'s layer order is how we build every screen.** Structure first, visual styling last. Concretely, in each iteration's UI work: lay out the boxes (structure) → wire the interactions → present the data → make it responsive → *then* apply the design-system styling. The skill's prime directive — "do not jump to colours and fonts" — is our rule too. (Note: the skill references `rich-aesthetics`/`modern-ux-components`; we substitute **our own** design system in `ux research/SKILL.md`, which is more specific.)

---

## 2. The design system in one paragraph (the law)

Single immersive **deep-green (`#00592B`) canvas** across the whole app — never alternate section backgrounds. Content lives on **crisp white cards: 4px solid black border, 20px radius, 8px outer + 24px inner padding, hard offset block shadow (no blur, ever)**. Type is **Oswald** — oversized uppercase bold headings, smaller cream body. Primary buttons are **white blocks, `skewX(-15deg)`, counter-skewed labels, hard black shadow that grows on hover**. Accents: **cobalt `#0023D1`** (informational / secondary) and **hot-pink `#E374C7`** (playful highlights, decorative blocks, the gap visual's "to-close" segment). Decorative geometric blocks layer *behind* cards for depth. Dark mode is automatic via CSS custom properties. Full token tables live in `ux research/SKILL.md` — **read the relevant module before writing any component.**

### Implementation approach
- Generate a **`tokens.css`** of CSS custom properties from `SKILL.md`'s `colors.md` / `shadows.md` / `radius.md` / `borders.md`. All components reference tokens — **no raw hex in component code.**
- **Hand-build** the component set against the spec (Button, Card, Input, Badge, Tabs, Modal, GapBar, ExerciseShell). The signature gestures (skew + hard shadow) are easier to author directly than to wrestle out of a generic component theme.
- Copy `SKILL.md` into the repo as the design source of truth and point CLAUDE.md at it.

---

## 3. Information architecture (borrowed from the screenshots, simplified hard)

The reference dashboards show: a **left icon rail**, a **hero/heading area**, a **content grid of cards**, and a **right context panel** (profile, activity, leaderboard). We keep the *skeleton*, drop the clutter (no leaderboard, no revenue, no course catalogue), and bend it to the one job: **start today's session.**

```
┌──────┬─────────────────────────────────────┬──────────────────┐
│ left │  HERO: greeting + the gap headline  │  right panel     │
│ rail │                                     │  • profile/level │
│      │  ┌───────────────────────────────┐  │  • streak        │
│ Home │  │  TODAY'S SESSION  (~17 min)    │  │  • recent        │
│ Prog.│  │  [ START ]   ← primary action  │  │    corrections   │
│ Set. │  └───────────────────────────────┘  │                  │
│      │  GAP BAR (receptive vs productive)  │                  │
│      │                                     │                  │
└──────┴─────────────────────────────────────┴──────────────────┘
```

**MVP screens (only these):**
1. **Onboarding** — full-screen, single-question-at-a-time flow; ends in first-win conversation.
2. **Dashboard** — the home above.
3. **Session player** — focused, full-bleed, one exercise block at a time (chrome minimised so the user concentrates on producing).
4. **Recap** — the post-session card: gap delta, what-you-said-well, capped corrections, tomorrow's pattern, streak.
5. **Settings** — light: correction intensity, voice on/off, level adjust.

Left rail = **Home · Progress · Settings**. Three items. That's the whole nav. (Audit dimension: navigation logical, active state always visible.)

---

## 4. Screen-by-screen intent (acceptance criteria, from the audit dimensions)

### Dashboard
- **Primary action prominence:** "Start today's session" is the single largest interactive element, top of content, unmissable. Nothing competes with it visually.
- **Data at the right altitude:** the gap is visible without scrolling or drilling — it's the hero. Streak and recent corrections are glanceable in the right panel.
- **Click depth:** session start = **one tap** from app open.

### Session player
- One exercise block fills the screen. A slim progress indicator shows block N of 3 + recap. No nav rail distractions during a session.
- **Stuck protocol** surfaces as gentle, escalating on-screen help (cue → choices → model → change-one-word), never as a failure state.
- **Feedback/status:** every async AI turn shows a loading state (the speech/turn is "thinking"); errors appear in context, not as a buried toast.
- **Voice + text parity:** the text-fallback input is always one tap away (a "type instead" affordance), and is the path the E2E tests drive.

### Recap
- "What you said well" is at least as visually prominent as corrections (retention guardrail from scope §4).
- Corrections capped (≤3) per the correction-intensity setting.
- The gap bar re-renders with its delta animated — the reward moment.

### Onboarding
- Progressive disclosure: one decision per screen, big tappable cards (matches design-system card spec).
- First win arrives fast; no dashboard tour before the user has spoken/typed Spanish once.

---

## 5. Mobile & responsive (this matters — Ed will test on his phone)

Per `ux-audit` Phase 3b (phone support is in scope):

- **Single column at ≤640px.** The three-column dashboard collapses: hero + gap + session CTA stack; right-panel items move below.
- **Touch targets ≥44×44px**, ≥8px apart. The skewed buttons must keep a real 44px tap area including the offset-shadow clearance (min 16px clearance so shadows aren't clipped — design-system rule).
- **Bottom-reachable primary action.** During a session on mobile, the primary "speak / next / type instead" controls sit in the lower half (thumb zone).
- **Nav on mobile:** the 3-item rail becomes a **bottom tab bar** (Home · Progress · Settings) — within the design system (white, black-bordered, active = brand-green fill).
- **Body text ≥16px** on mobile (design system body is 18px — fine).
- **Voice on mobile:** mic permission prompt handled gracefully; if denied or unsupported (iOS Safari quirks), the **text fallback is automatic**, never a dead end.
- Tables aren't really used in MVP; the gap-over-time chart must reflow / scroll, not overflow.

---

## 6. Motion (gamified, tactile — but purposeful)

The design system wants a "digital exhibit" feel. Use it where it reinforces hierarchy or rewards effort, not for decoration:
- Buttons/cards: press-out on hover/tap (translate −2px,−2px while the hard shadow grows).
- Recap: the gap bar animating its delta = the core reward.
- Session block transitions: quick slide/stagger between exercises so the session feels like a guided journey.
- Loading/thinking states for AI turns: a branded indicator, not a generic spinner where avoidable.
- Respect `prefers-reduced-motion`.

---

## 7. Build-order reminder (same as `ux-redesign` layers)

For every screen, in this order — **never skip ahead to styling:**
1. **Structure** — boxes, regions, nav placement.
2. **Interaction** — what each control does, click depth, stuck protocol, fallbacks.
3. **Data** — what's shown where, at the right altitude, capped/curated.
4. **Responsive** — phone reflow, touch targets, thumb zones, bottom tabs.
5. **Visual** — apply `SKILL.md` tokens and component specs. Now and only now do colours, Oswald, skew, and shadows go on.

---

## 8. Visual-QA loop for Claude

Because E2E (`npm run e2e`) captures screenshots into `e2e/__screenshots__`, Claude can self-check the visual layer against the design system without Ed:
- Canvas is the single deep green everywhere (no stray neutrals).
- Every card: white, 4px black border, 20px radius, hard offset shadow (no soft blur).
- Buttons skewed with counter-skewed upright labels; shadow grows on hover state.
- Oswald throughout; headings oversized/uppercase; body cream.
- Gap visual reads instantly as "this much understood, this much to close."
- Mobile screenshot: single column, no clipped shadows, reachable primary action.

Any deviation is a visual-layer bug to fix before the iteration goes to Ed.
