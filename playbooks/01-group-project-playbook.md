# Group Project Playbook (SDGP / DSGP / any team project)

From "we have an idea" to a demo that works — in the order that saves the most pain.
Each section ends with a **template you can copy into your team's docs**.

1. [Define a real problem](#1-define-a-real-problem)
2. [Understand your users](#2-understand-your-users)
3. [Check feasibility early](#3-check-feasibility-early)
4. [Manage risks](#4-manage-risks)
5. [Scope a realistic first version](#5-scope-a-realistic-first-version)
6. [Run the team like a small startup](#6-run-the-team-like-a-small-startup)
7. [Demo, report and viva](#7-demo-report-and-viva)

---

## 1. Define a real problem

Most weak projects start from a technology ("let's do something with AI and blockchain")
instead of a problem. Examiners — and users — care about the problem.

A strong problem statement names **who** struggles, **what** they struggle with, **why** it happens
and **what it costs them** — without mentioning your solution.

> **Example — describe symptoms, not solutions.** For a university room-booking system, the
> problem isn't "we need a booking app". It's four concrete failures of first-come-first-served:
> double bookings, urgent needs blocked by early bookers, a few people hogging resources, and
> nobody understanding why they were denied. Each symptom then maps to exactly one feature —
> which makes the design easy to defend.

**Red flags**
- The statement contains a technology name.
- The user group is "everyone" or "people".
- Nobody on the team has spoken to someone who has this problem.
- You can't say what people do *today* instead (if they do nothing, it may not hurt enough).

**Template**
```
<User group> struggle to <task> because <root cause>.
Today they <current workaround>, which costs them <time / money / risk>.
We will know we've helped if <measurable outcome>.
```

## 2. Understand your users

Talk to **5–8 real people** from your target group before designing screens.
Five honest conversations beat a 200-response Google Form full of leading questions.

**Rules for useful interviews**
- Ask about the past, not hypotheticals: *"Tell me about the last time you…"* beats *"Would you use an app that…?"* (everyone says yes to the second).
- Look for **workarounds** — spreadsheets, WhatsApp groups, notebooks. A workaround proves the pain is real.
- Write down exact quotes. They make your proposal and viva far more convincing.
- Don't pitch your idea during the interview. You're there to learn, not to sell.

**Interview script (15 minutes)**
```
1. What's your role / context? (1 min)
2. Walk me through the last time you <did the task>. What happened step by step?
3. What was the hardest or most annoying part? Why?
4. What do you use today to handle it? What do you like/dislike about it?
5. Have you tried anything else? Why did you stop?
6. If you could wave a magic wand, what would change?
7. Who else should I talk to about this?
```

Also understand your **other** users: the people who will judge or approve the project.
Read the marking rubric like a requirements document. If 50% of the marks are for the demo and
user experience, one polished end-to-end flow is worth more than five half-built features.

## 3. Check feasibility early

Check three things in **week one**: data, skills and time.

| Check | Question | If the answer is "no" or "not sure" |
|---|---|---|
| **Data** | If you need a trained model, do you already *have* a dataset you're allowed to use? | Find or collect data **before** committing. This is the #1 reason ML projects stall. |
| **Access** | Does a third-party API you rely on allow your use (pricing, approvals, legal agreements)? | Design a fallback (manual step, mock, alternative provider). |
| **Skills** | Who on the team has shipped something with each core technology? | Budget a 1–3 day *spike* to prove the risky part works. |
| **Time** | Realistically, how many hours a week can each person give? | Assume ~50% of your week once other modules and exams count. |
| **Legal/ethical** | Personal data? Medical, financial or legal advice? | Add human review, consent and data minimisation to the design. |

> **Example — let feasibility reshape the scope (and write it down).** A finance project planned
> fully automated tax filing. Legal liability, and the need for formal agreements to use the official
> filing API, made that unrealistic for a student team. The team changed it to "prepare everything,
> a human reviews and submits", and documented *why* in the report. Examiners reward that kind of
> judgement far more than an unfinished "fully automated" claim.

**Build a throwaway prototype of the riskiest part first.** If the whole idea depends on an ML model
reaching useful accuracy, train a quick baseline in week two — not week ten.

## 4. Manage risks

Keep a simple risk register and review it every two weeks.

| Risk | Likelihood | Impact | Owner | Mitigation |
|---|---|---|---|---|
| A teammate goes quiet | Med | High | Team lead | Weekly check-ins; tasks small enough to reassign |
| Dataset unusable | Med | High | ML lead | Baseline model by week 2; backup public dataset |
| API pricing / rate limits | Low | Med | Backend | Cache responses; mock mode for demos |
| Integration only in the last week | High | High | Everyone | Merge to `main` weekly; keep a demo branch green |
| Scope creep before the demo | High | Med | Product owner | A written **cut list** (see below) |

**Kill the biggest risk first.** Get the core flow working live but ugly — real data in,
real result out — before you spend time on styling. Polish is cheap once the hard part works.

## 5. Scope a realistic first version

Your MVP is **the smallest thing that lets a real user complete the core job end-to-end once.**

**MoSCoW the feature list**
- **Must** (3–5 items): without these the core job is impossible.
- **Should**: important, but there's a workaround.
- **Could**: nice to have.
- **Won't (this time)**: write them down so people stop arguing about them.

**Plan your cuts before you need them.** Rank features P0, P1, P2… and agree on a drop order
plus a floor that can never be cut. When you fall behind (you will), you cut in order instead of
arguing at 2 a.m.

**Don't build what isn't your product.** Auth, admin panels, payments and email are rarely the
core job — use a template or managed service (see [`/templates`](../templates)).

**Quick capacity check**
```
available = team size × weeks × ~0.5 (other modules)        → person-weeks
needed    ≈ must-have features × ~1.5 person-weeks (+3 if training an ML model)
needed > available? → cut, don't hope.
```
(The [AI agent template](../templates/ai-agent-app) includes this as a tool.)

## 6. Run the team like a small startup

**Week one: write a [team charter](../project-kit/TEAM-CHARTER.md).** Agree on meeting times, response
times, how you make decisions, and what happens when someone misses a deadline.

**Use GitHub properly** — your history is evidence of individual contribution:
- Protected `main`, feature branches, small pull requests, at least one reviewer.
- Every task is an issue (or a Jira/Linear ticket) and branches are named after it: `FT-42-login-form`.
- Each person *owns* an area (e.g. one module or CRUD feature end-to-end) so work doesn't collide.
- Commit shared types/interfaces first so everyone codes against the same contracts.
- Drop-in templates for all of this: [`/project-kit`](../project-kit).

**Rhythm that works**
- 10-minute stand-up 2–3 times a week: done / doing / blocked.
- A weekly integration day: everything merged, the app runs from a clean clone.
- A fortnightly demo to someone outside the team (a friend, a mentor, a potential user).

**Raise problems early and kindly.** Silence is the most expensive failure in group projects.

## 7. Demo, report and viva

**Demo as a story:** the user → their problem → the flow that solves it → evidence it works
(test results, user feedback, before/after numbers).

- Seed realistic demo data. Empty screens make strong projects look weak.
- Record a backup video of the full demo in case Wi-Fi or an API fails on the day.
- Rotate who drives the demo so everyone can explain every part.

**Everyone should be able to answer:**
1. Why this problem, and how do you know it's real?
2. Why this architecture? What alternatives did you consider?
3. What did you cut, and why?
4. How did you test it? What are its honest limitations?
5. What would you do differently / next?

> An **"Honest limitations"** section in your README and report is a strength, not a weakness. It shows
> you understand your system better than someone who claims it does everything.
