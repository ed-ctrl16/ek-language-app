# Habla v3 Strategy Review

Source reviewed: `habla_app_summary_v3.docx`  
Date: 2026-04-27

## Executive Take

The Habla brief has a genuinely strong strategic center: it refuses beginners, focuses on people with latent Spanish, and defines success as closing the receptive-expressive gap. That is a sharper wedge than "AI language tutor" and it gives the product a reason to exist beyond novelty. The two personas, Returners and Absorbers, are credible, emotionally resonant, and underserved by broad-market language apps.

The biggest risk is not the idea. The biggest risk is trying to build the complete pedagogical vision before proving the narrowest behavior that makes the product special: "I understand Spanish, but I freeze when I speak; this app gets me speaking again." The current plan describes a broad learning platform with diagnostics, voice conversation, SRS, Q&A, Bridge Drills, phonetics, curriculum maps, analytics, custom plans, payments, PWA, and eventually native mobile. That may be the right long-term product, but it is too wide for a first serious build.

The best strategy is to treat Habla first as a production-reactivation engine, not a full language learning operating system. Conversation and Bridge Drills should be the core. SRS, curriculum tracking, phonetics, Q&A, and elaborate analytics should exist only insofar as they reinforce the production loop. The first version should prove that users return because they can feel dormant Spanish becoming speakable again.

## What Is Working

### The Niche Is Strong

"Bring back the Spanish you already have" is specific, emotionally loaded, and differentiated. It avoids the crowded beginner market and speaks to a user who already has motivation, prior investment, and shame/frustration around a visible gap.

This positioning also creates natural willingness to pay. A Returner planning travel, relocation, work, or family communication has a more urgent job than someone casually keeping a streak alive. An Absorber in a mixed-language family has a deeply personal reason to improve. That is a much stronger monetization base than generic vocabulary acquisition.

### The Receptive-Expressive Gap Is the Right Core Metric

The dual-level model is the most important strategic idea in the document. It translates the user's emotional pain into a measurable product concept. Users do not merely want "more Spanish"; they want the gap between what they understand and what they can say to shrink.

This should remain the product's north star. It is also a good way to differentiate the dashboard, onboarding, diagnostics, and marketing. Most language apps show streaks, lessons, XP, or vocabulary counts. Habla can show "you understand at B1, speak at A2; we are closing that gap."

### The Personas Are Meaningfully Different

Returners and Absorbers are not superficial marketing segments. They differ in prior knowledge, anxiety pattern, reading ability, response to grammar terminology, and likely interface needs. The brief is right that they can share infrastructure while needing different front doors and teaching styles.

The Absorber persona is especially promising because mainstream apps are structurally bad for them. If someone has heard Spanish for years but cannot produce it, beginner lessons feel insulting while grammar-first explanations feel alien. Bridge Drills map well to this gap.

### Bridge Drills Are the Best Candidate for Unique IP

The four-step ladder, Hear it -> Repeat it -> Mod it -> Make it, is the clearest product invention in the brief. It is concrete, testable, teachable, and directly tied to the core gap. It also creates a repeatable session format that is less open-ended than conversation and cheaper/more predictable than unrestricted LLM chat.

Bridge Drills should probably move from "Absorber-critical feature in Phase 4" to "core product loop in the first validation build."

## Strategic Risks

### Risk 1: The MVP Is Too Broad

The current 16-week roadmap tries to build most of a mature learning platform before market validation. The roadmap includes:

- Pathway onboarding
- Diagnostics
- Voice conversation
- Streaming LLM responses
- SRS
- Multiple drill types
- Q&A
- Bridge Drills
- Curriculum tracker
- Custom plans
- Phonetics module
- Progress analytics
- Stripe
- PWA
- Mobile polish
- Native app later

This is an impressive vision, but it creates multiple failure modes. If retention is weak, it will be hard to know why. Was the positioning wrong? Was the diagnostic too slow? Was the voice UX unreliable? Were drills not useful? Was SRS premature? Was the price wrong? A broad MVP creates noisy learning.

Recommendation: define a smaller "proof product" that validates one loop:

1. User identifies as Returner or Absorber.
2. User completes a short diagnostic or self-placement.
3. User does a guided production session.
4. User sees one concrete "you understood this, then you produced it" result.
5. User returns the next day to do it again.

Everything outside that loop should be suspect until the loop works.

### Risk 2: The Two-Persona Strategy May Be Too Much for V1

The case for both personas belonging in the same app is sound long-term. The question is whether both should be built equally at launch.

Returners and Absorbers require different diagnostics, content formats, correction styles, and emotional framing. Supporting both well from day one doubles product complexity. Worse, it may blur the marketing wedge if the landing page tries to speak equally to two motivations.

The document says the shared problem is the receptive-expressive gap. That is true, but the highest-intensity wedge appears to be the Absorber:

- The pain is unusually specific: "I understand my partner's/family's Spanish but cannot speak."
- The market is less directly served by existing apps.
- The Bridge Drill feature maps directly to the user's need.
- The audio-first interface creates defensible product differentiation.
- The emotional context supports paid conversion.

Returners are also valuable, but they have more substitutes: conversation tutors, italki, Lingoda, grammar refreshers, Anki decks, Babbel, SpanishDict, YouTube, and AI chatbots. Habla can serve them later, but they may not be the cleanest first wedge.

Recommendation: strongly consider launching with Absorbers first, while keeping Returners as a secondary pathway or waitlist segment. If both are kept, build one primary onboarding and one lightweight alternate, not two fully mature products.

### Risk 3: The Product May Over-Trust CEFR Precision

The brief uses CEFR levels heavily, including separate receptive and productive levels. This is useful as a mental model, but the app should be careful not to imply false precision. A quick LLM-driven diagnostic cannot reliably say a user is "B2 receptive / A2 productive" with exam-level validity.

That does not mean the dual-level model is wrong. It means the product language should frame levels as adaptive estimates, not authoritative certification.

Better wording:

- "You seem to understand around B1/B2 material."
- "Your speaking comfort is currently closer to A2."
- "We will recalibrate this as you speak more."

Recommendation: show level bands, confidence, and trend rather than fixed exact levels. The product should care more about whether the gap is shrinking than whether the absolute CEFR label is perfect.

### Risk 4: Audio-First Is Correct but Operationally Hard

The brief correctly identifies iOS Safari speech recognition as a critical constraint. However, voice is not just a technical checkbox. The product's success depends on low-latency, reliable, socially comfortable speech interaction on mobile.

Key risks:

- Browser microphone permissions are fragile.
- Background noise will hurt transcription.
- Users may be embarrassed speaking aloud in public.
- Server-side STT adds latency and cost.
- Browser TTS quality may make the app feel cheap.
- Voice sessions are harder to resume after interruptions.
- Speech scoring can become demotivating if inaccurate.

Recommendation: design the first version around short, controlled voice turns rather than long open-ended conversations. Bridge Drills, prompted responses, and 6-turn guided conversations are safer than free conversation as the first experience. They reduce latency surprises, limit token usage, make assessment easier, and give users clearer wins.

### Risk 5: Conversation Mode Is Described as the Heart, but It May Be Too Open-Ended

Open conversation is emotionally powerful, but it is hard to make consistently useful. Users often freeze when asked to "just talk." LLM conversations can drift, over-explain, under-correct, or become too easy. For a reactivation product, the user needs structured pressure, not only a friendly chat.

Recommendation: conversation should be framed as "guided conversation missions" rather than generic chat. Each session should have:

- A scenario
- A target pattern
- A few expected production moves
- A maximum length
- A post-session conversion into next drills

Example: "Tell your suegra you'll arrive 20 minutes late" is better than "Talk about family." It gives Absorbers a real-life use case and makes progress observable.

### Risk 6: SRS May Be Over-Central in the Architecture

SRS is useful, but it should not dominate the first product. For Habla, the key problem is not remembering that `venir` means "to come"; it is producing `viene`, `venimos`, or `voy a venir` under conversational pressure. A conventional item-based SRS system can pull the product back toward vocabulary learning, where differentiation is weaker.

The better unit of practice may be a "production pattern" or "conversation move," not a word.

Examples:

- "Tell someone what you usually do on Sundays."
- "Explain that you are running late."
- "Ask whether someone has already eaten."
- "Say what you used to do when you lived somewhere."

Recommendation: make SRS subordinate to production patterns. Track vocabulary where useful, but schedule reusable speaking moves and patterns, especially for Absorbers.

### Risk 7: The Roadmap Delays the Most Distinctive Feature

Bridge Drills appear in Phase 4, weeks 10-12. That is too late if they are the unique mechanism. The first validation version should include the thing that makes Habla feel different.

Recommendation: move Bridge Drills into Phase 1 or Phase 2. If technical scope must shrink, cut curriculum, phonetics, Q&A history, custom plans, and broad analytics before cutting Bridge Drills.

### Risk 8: The Marketing Positioning Is Strong but Needs Sharper Wedge Testing

The copy is good:

- "You used to speak Spanish. Get it back."
- "You understand more than you can say. Let's fix that."
- "For people who already have Spanish in them."

The third is the best umbrella line, but the second may be the strongest first wedge. It names the problem in the user's own words. The Returner line is compelling too, but Returners may interpret "get it back" as grammar/vocabulary refresh rather than speaking reactivation.

Recommendation: test separate landing pages before building both pathways deeply:

- Absorber page: "You understand Spanish. Speaking is the hard part."
- Returner page: "You used to speak Spanish. Your brain did not lose it."

Measure email signup conversion, willingness to pay, and which promised feature gets the most clicks: conversation, Bridge Drills, diagnostic, daily plan, or family/travel scenarios.

## Product Strategy Recommendations

### 1. Reframe the First Product Around "Speakable Spanish"

The strategic goal should be narrower than "reactivate Spanish." A better operational goal is:

> Habla turns Spanish you can understand into Spanish you can say.

This phrase works for both personas and keeps the product focused. It also protects the roadmap from drifting into passive content, grammar libraries, or generic tutoring.

Every major feature should answer: does this help the user say something they previously only understood?

### 2. Make the First Session the Product

The brief rightly emphasizes a "first win," but this should become the central product design constraint. The first session must prove the thesis before the user sees a complex dashboard.

Ideal first session:

1. Ask the user why Spanish matters to them.
2. Identify one real-life scenario.
3. Play or show one phrase they likely understand.
4. Guide them through Hear -> Repeat -> Mod -> Make.
5. End with: "You just turned a phrase you understood into something you can say."

The user should feel the core transformation immediately. The dashboard can come later.

### 3. Prioritize Scenarios Over Curriculum

CEFR curriculum is useful internally, but user motivation will come from scenarios:

- Talking with in-laws
- Rejoining a conversation at dinner
- Handling a trip
- Speaking to a child's teacher
- Ordering and making small talk
- Explaining work
- Telling stories about the past
- Asking follow-up questions

Recommendation: make scenario packs the visible curriculum. CEFR and grammar tags can exist underneath. This is especially important for Absorbers, but it also benefits Returners because it maps learning to real outcomes.

### 4. Design Around "Conversation Moves"

Habla should track whether users can perform conversation moves, not just whether they know words.

Possible move taxonomy:

- Greet and re-enter a conversation
- Ask someone to repeat or slow down
- Say what you mean when you lack a word
- Describe a routine
- Tell a short past story
- Explain a preference
- Decline politely
- Ask a follow-up question
- Repair a misunderstanding
- Express uncertainty
- Talk around a missing word

This is more aligned with fluency than vocabulary counts. It also creates a practical progression that feels adult and useful.

### 5. Treat Grammar as an Internal Engine, Not Always a User Surface

The brief already does this well for Absorbers. The same principle should apply more broadly: grammar is the indexing system, not necessarily the product experience.

For Returners, grammar terminology can be visible because it is motivating and efficient. For Absorbers, it should be revealed only after pattern familiarity. In both cases, grammar should serve production, not become the product's organizing promise.

### 6. Make Pathway Switching Rare but Graceful

The brief says pathway is sticky but switchable. That is right. However, the product should avoid making users feel classified incorrectly. Some users will be hybrids: a Returner who married into a Spanish-speaking family, or an Absorber who later studied formally.

Recommendation:

- Use pathway as a teaching preference, not an identity.
- Let users adjust explanation style: "grammar terms are helpful" vs "keep it practical."
- Let users adjust input mode: "audio-first" vs "text is fine."
- Keep the underlying model multidimensional instead of only `returner`/`absorber`.

This preserves the strategic clarity while avoiding brittle segmentation.

## Learning Design Recommendations

### 1. Use a Three-Part Skill Model

The current model has receptive and productive levels. That is strong, but it may need a third dimension: interactional confidence.

A user may know what to say but still freeze. For this niche, confidence is not a vanity metric; it is part of the bottleneck.

Suggested model:

- Receptive ability: what the user understands.
- Productive control: what the user can produce accurately.
- Interactional confidence: whether the user can produce under time/social pressure.

This third dimension can be inferred from hesitation time, turn completion, abandonment, self-reported comfort, and willingness to attempt open-ended responses.

### 2. Measure Speaking Progress Carefully

The brief proposes rate of speech as a fluency proxy. That is useful but incomplete. Faster speech is not always better, especially if the user is inaccurate or anxious.

Better progress signals:

- Response latency: how long before the user starts speaking.
- Completion rate: whether they attempt the turn.
- Repair ability: whether they can recover after an error.
- Utterance length: words or clauses per response.
- Pattern reuse: whether they use a practiced pattern in a new context.
- Self-correction: whether they catch errors without prompting.
- Comprehensibility: whether the intended meaning is clear.

Recommendation: use rate of speech internally, but avoid making it a headline user metric too early. It may create pressure and make users more self-conscious.

### 3. Be Careful With "Correction"

The correction styles are thoughtful, but correction volume is a retention risk. People who already feel embarrassed may churn if every session produces a feed of mistakes.

Recommendation:

- Separate "live recasts" from "after-session coaching."
- Limit corrections per session.
- Highlight one high-leverage pattern rather than every error.
- Track "what you successfully said" as prominently as "what to fix."
- Let users choose correction intensity.

For Absorbers especially, the app should feel like a speaking scaffold, not an examiner.

### 4. Build a "Stuck" Protocol

The document says Claude should be patient with pauses, but the product should define what happens when the user freezes.

Possible ladder:

1. Wait.
2. Offer a first-word cue.
3. Offer two choices.
4. Let them repeat a model answer.
5. Ask them to change one word.
6. Mark the pattern for later practice.

This ladder should be explicit in prompts and UI. It turns failure into a drill path.

### 5. Use Translanguaging Intentionally

The brief says if users lapse into English, Claude nudges them back. That is good, but for this audience mixed English/Spanish may be a useful bridge rather than a failure.

Recommendation: allow controlled mixed-language production early. For example:

- User: "Mi suegra is coming on Sunday."
- App: "Good. Now let's make one small switch: `Mi suegra viene el domingo.`"

This respects the reality of partial activation and helps users move toward full Spanish without shame.

## Technical Architecture Recommendations

### 1. Avoid Overbuilding the Database Before the Learning Loop Stabilizes

The proposed schema is reasonable as a destination, but early migrations should stay smaller. Learning products change shape when real users interact with them. If the initial schema encodes too many assumptions, iteration slows.

Start with durable primitives:

- Users
- Pathway/preferences
- Sessions
- Turns/responses
- Practice items
- Assessments
- Events

Defer detailed curriculum progress, bridge completion tables, and custom plans until product behavior proves they are needed.

### 2. Store Attempts as First-Class Data

The schema stores sessions and SRS items, but the most valuable data may be individual user attempts.

Each attempt should capture:

- Prompt shown/played
- Expected pattern or target move
- User transcript
- Audio metadata, if retained
- Latency
- Completion status
- LLM assessment
- Correction/recast
- Whether the item should reappear

This creates the foundation for adaptive practice, better diagnostics, and evidence that the product is closing the gap.

### 3. Treat Prompts as Product Logic With Evaluation

The brief rightly says prompts are code. It should go further: prompts need regression tests and qualitative eval sets.

Create small fixture sets:

- Returner grammar correction examples
- Absorber recast examples
- Stuck-user examples
- Overcorrection examples
- Level-calibration examples
- Mixed English/Spanish examples

For each prompt, test whether the response follows the desired style. This matters because the product's differentiation lives in the prompt behavior.

### 4. Be Conservative With Edge Runtime Claims

The brief proposes Edge runtime for low-latency Anthropic streaming. That may be fine, but many AI/audio workflows depend on SDKs, request sizes, file uploads, and provider behavior that are easier in a Node runtime. Do not prematurely force everything to Edge.

Recommendation:

- Use streaming where it improves perceived responsiveness.
- Keep audio transcription endpoints in a runtime that handles file uploads reliably.
- Optimize after measuring latency.

### 5. Use Server-Side STT Earlier Than Planned

If voice is central and iPhone users matter, relying on Web Speech API creates too much inconsistency. The brief suggests Whisper for iOS Safari, but a split STT stack creates inconsistent transcripts and debugging paths.

Recommendation: use server-side STT as the default for core voice interactions from the beginning, at least during the paid/beta experience. Browser STT can remain a low-cost fallback or experimental mode.

### 6. Separate Voice UX From AI Reasoning

Do not make every spoken turn require full LLM reasoning. Some drill steps can be deterministic or template-based:

- Repeat matching
- Cloze answer checking
- Pattern substitution
- Simple pronunciation transcript checks
- Known phrase variants

Use the LLM for scenario generation, recasts, coaching, and adaptive branching. This will reduce cost, latency, and unpredictability.

## Roadmap Revision

### Recommended Validation Sequence

#### Phase 0: Demand Validation

Before building the full app:

- Launch two landing pages, one Absorber-focused and one Returner-focused.
- Offer a paid or deposit-backed beta waitlist if possible.
- Interview 10-15 users from each segment.
- Test whether users describe the problem in the same language as the brief.
- Identify the top three scenarios users want to speak in.

Success criteria:

- Stronger-than-generic signup conversion.
- Users can clearly describe the pain.
- At least some users are willing to pay for early access.
- One segment shows a sharper pull.

#### Phase 1: Guided Speaking Prototype

Build only:

- Niche qualification
- Pathway or teaching-style preference
- Short self-placement
- 3-5 scenario packs
- Bridge Drill loop
- 6-turn guided conversation
- Post-session recap
- Basic account/session storage

Do not build full SRS, curriculum maps, phonetics, Q&A, Stripe, or detailed analytics yet.

Success criteria:

- Users complete first session.
- Users report "this felt made for me."
- Users return for a second session within 48 hours.
- Users can produce a phrase/pattern they could not produce at the start.

#### Phase 2: Retention Loop

Add:

- Lightweight scheduling of practiced patterns
- Daily reminders
- Saved corrections/recasts
- Scenario progression
- Basic receptive/productive estimate trends
- Payment experiment

Success criteria:

- D1, D3, D7 retention strong enough to justify more build.
- Users complete multiple short sessions instead of one novelty session.
- Users perceive progress without needing elaborate analytics.

#### Phase 3: Platform Expansion

Add:

- More robust diagnostics
- Full SRS
- Q&A
- Curriculum tracker
- Custom plans
- Phonetics
- PWA install flow
- Deeper analytics

Only build these once the core production loop has retention.

### What to Move Earlier

- Bridge Drills
- Scenario-based guided conversations
- Server-side STT for reliable mobile voice
- Prompt evaluations
- Attempt-level data model
- User interviews and landing page tests

### What to Move Later

- Full CEFR curriculum tracker
- Phonetics module
- Custom plans
- Q&A history and bookmark-to-SRS
- Native mobile app
- Fine-grained progress analytics
- Broad drill-type library

## Monetization Critique

The proposed $12-15/month subscription may work, but only if the product is perceived as closer to a speaking coach than a vocabulary app. Competing psychologically with Duolingo makes that price hard. Competing with tutors makes it cheap.

Recommendation: position pricing against conversation tutoring:

- "Daily speaking practice for less than one tutoring session."
- "Built for the moments you are too embarrassed to practice with real people."

Potential packaging:

- Free: diagnostic + limited first session or 2-3 guided drills.
- Starter: one guided speaking session per day.
- Premium: more sessions, custom scenarios, better voices, saved plans, deeper review.

Be careful with a free tier that gives one full session per day forever. If one session per day is the scientifically recommended minimum, the free tier may satisfy too many users while still incurring STT/LLM/TTS costs. A better free tier might be limited by number of starter sessions, not permanent daily usage.

## Positioning Improvements

### Stronger Core Message

Current:

> Habla isn't for learning Spanish. It's for getting back the Spanish you already have.

Suggested:

> Habla helps you turn the Spanish you understand into Spanish you can actually say.

This includes Returners and Absorbers, centers the core transformation, and avoids implying the product is only for people who once spoke well.

### Segment-Specific Messages

For Absorbers:

> You understand the conversation. Habla helps you join it.

For Returners:

> Your Spanish is not gone. It is just out of practice.

For mixed-family users:

> Stop sitting out the Spanish side of the conversation.

For travel/relocation:

> Practice the conversations you will actually need before you arrive.

### Avoid Overclaiming

Be cautious with claims like "AI conversation that adapts in real time" as the main differentiator. Many competitors can say that. The stronger claim is:

> Built specifically for people whose comprehension is ahead of their speaking.

That is harder to copy at the positioning level and more meaningful to the user.

## Key Open Questions

1. Which persona has the stronger immediate willingness to pay: Returners or Absorbers?
2. Are Absorbers willing to practice voice drills alone, or do they need privacy/social design considerations?
3. Do users trust an AI diagnostic, or does it feel arbitrary?
4. What is the minimum proof of progress users need after one session?
5. Is the core habit one daily session, three daily sessions, or event-based practice before real conversations?
6. Should the product visibly use CEFR, or should CEFR remain mostly internal?
7. Is Spanish-only the right initial language, or should the architecture avoid Spanish-specific assumptions while the content stays Spanish-only?
8. How much correction can embarrassed users tolerate before they churn?
9. Does better TTS materially affect retention, or is it mainly a polish upgrade?
10. Can Bridge Drills be generated safely and consistently without expert-authored content?

## Highest-Leverage Experiments

### Experiment 1: Persona Landing Page Test

Create two landing pages with separate messaging:

- Absorber: "You understand Spanish. Speaking is the hard part."
- Returner: "You used to speak Spanish. Get it back."

Measure signup conversion, paid beta interest, and qualitative responses.

### Experiment 2: Manual Concierge Prototype

Before building the full app, run 10 users through a semi-manual version using prepared prompts, human-observed sessions, and simple audio tools. Watch where they freeze, what feels magical, and what they ignore.

### Experiment 3: Bridge Drill Retention Test

Give users three daily Bridge Drill sessions around one scenario. Measure whether they return and whether they can produce the target pattern in a new prompt on day three.

### Experiment 4: Correction Intensity Test

Test three modes:

- Minimal recast only
- One correction per session
- Detailed correction feed

Measure user confidence, completion, and return intent.

### Experiment 5: CEFR vs Scenario Framing

Show users either:

- "Your productive level is A2."
- "You can handle basic family small talk; next we will practice telling short past stories."

Measure which motivates action and feels more accurate.

## Revised Product Principles

The original principles are good. I would sharpen them as follows:

1. Production over content: every feature must help users say more, not merely consume more.
2. Scenarios over syllabus: users buy real-life speaking outcomes, not curriculum coverage.
3. The gap is the product: receptive vs expressive asymmetry should drive onboarding, practice, and progress.
4. Audio-first where it matters: especially for Absorbers, but do not force voice when context makes it awkward.
5. Correction should build courage: feedback must increase the user's willingness to speak again.
6. Prompts are pedagogy: prompt behavior is not implementation detail; it is the teaching method.
7. Validate before platformizing: build the smallest loop that proves reactivation before building the full learning system.

## Recommended First Build

If building now, I would build this:

### Core

- Mobile-first Next.js app
- Supabase auth and simple user profile
- Onboarding with niche qualification and pathway/preference selection
- Self-assessed background plus short diagnostic, not a full adaptive CEFR test
- Scenario selection
- Bridge Drill engine
- Short guided conversation mission
- Post-session recap
- Basic session history

### Data

- User profile
- Teaching preferences
- Session records
- Turn/attempt records
- Practice patterns
- Simple due dates for pattern review

### AI

- Scenario generation
- Recasts/corrections
- Adaptive hints
- Session summary
- Pattern extraction from conversation

### Not Yet

- Full curriculum tracker
- Full SRS item bank
- Phonetics module
- Q&A module
- Custom plans
- Native app
- Complex analytics dashboard

This version would be smaller but more strategically honest. It would answer the only question that matters early: does Habla make users feel and become more able to speak the Spanish they already understand?

## Final Assessment

Habla has a strong thesis and a better-than-average chance of becoming a differentiated product because the niche is real and the emotional pain is specific. The best parts of the brief are the refusal to serve beginners, the receptive-expressive gap metric, the pathway distinction, and Bridge Drills.

The main improvement is focus. Build less platform and more proof. Move the unique speaking scaffold earlier, reduce reliance on precise CEFR diagnostics, treat conversation as structured missions, and validate the sharper Absorber wedge before fully committing to a two-pathway learning platform.

The strategy should evolve from:

> Build an AI-powered Spanish reactivation app with two pathways and a complete learning architecture.

to:

> Prove that people who understand more Spanish than they can say will pay for short, guided, voice-first sessions that turn passive understanding into usable speech.

If that proof holds, the rest of the architecture becomes much easier to justify.
