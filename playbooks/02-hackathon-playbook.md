# Hackathon Playbook

Hackathons reward a **clear problem, one working hero flow, and a sharp pitch** — not the most code.
This is the checklist I use.

## Before the event

- [ ] **Read the rubric like a spec.** Count where the points are. If half the score is polish and
      user experience, plan for polish. If judges will open it on a phone, design for a phone.
- [ ] **Know the sponsor's tech.** Sponsor tracks often have the easiest prizes to win — use their API properly.
- [ ] **Prepare your boring stack** so hour one goes into the idea, not setup:
      a [starter template](../templates), deploy pipeline (Vercel/Render), env vars, a UI kit.
- [ ] **Agree on roles**: who builds the frontend, the backend/AI, and who owns the pitch and demo video.
      Someone must own the pitch from the start — it's not an afterthought.

## The first hour

1. **Problem first (20 min).** Who has the problem? How do they deal with it today? Why now?
2. **Pick ONE hero flow (20 min)** a judge can complete in about 90 seconds.
3. **Write the cut list (10 min).** Rank features P0…P7 with a written drop order and a floor that
   can never be cut. The lowest priorities are "pitch it, don't build it".
4. **Split ownership by folder/module** to avoid merge conflicts, and commit shared types first.

## Building

- **Phase 0: prove the hero flow live but ugly.** A real round-trip — real API, real data — before any styling.
- **Remove infrastructure you don't need.** Do you really need auth and a database for the demo?
  Every piece you remove is an hour back for polish.
- **Deploy early, deploy often.** Get a live URL in the first few hours and keep it working.
- **Two-minute sync every hour:** done / next / blocked. Re-check the cut list.
- **Keep irreversible actions out of the AI's hands.** If your agent can pay, send emails or delete
  things, put a human confirmation button in between. Judges notice.
- **Seed demo data** that tells a story: realistic names, realistic numbers.

## Pivots happen

It's normal to sharpen or pivot the pitch a few hours in when you see what's actually impressive.
Pivot the **story** before you pivot the **code**: often the same build answers a better problem.

## The last 3 hours

- [ ] Feature freeze. Only fixes and polish.
- [ ] Record a backup demo video (screen + voiceover).
- [ ] README: problem, demo link/video, how it works (diagram), tech, team, honest limitations.
- [ ] Rehearse the pitch out loud, with a timer, at least twice.

## The pitch (3–5 minutes)

1. **Hook (20 s):** a real person with a real problem, ideally a number or a quote.
2. **Solution (20 s):** one sentence.
3. **Live demo (90–120 s):** the hero flow. No login screens, no settings pages.
4. **How it works (30 s):** one architecture diagram. Mention the clever part.
5. **Why it matters / what's next (20 s).**

Prepare answers for: *"What's the hardest part you built?"*, *"How is this different from X?"* and
*"What would you build next?"*

## After the event

- Polish the README while it's fresh and **make the repo public** if you can — a winning project
  that recruiters can't see doesn't help your CV.
- Add it to your CV with the result: *"1st place out of 40 teams — built X in 24h using Y."*
- Write a LinkedIn post: problem, what you built, one lesson, a thank-you to your team and the organisers.
