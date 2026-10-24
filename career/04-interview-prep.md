# Interview Prep for SE Internships & Junior Roles

Most internship interviews have three parts: **you** (behavioural), **what you know** (technical
questions / coding), and **what you've built** (project deep dive). Prepare all three.

---

## 1. Behavioural questions — use STAR

**S**ituation (1–2 sentences) → **T**ask (your responsibility) → **A**ction (what *you* did — the
longest part) → **R**esult (outcome, ideally a number, plus what you learned).

Prepare **5 stories** you can adapt. Most questions map onto one of them:

| Story to prepare | Answers questions like |
|---|---|
| A project you're proud of | "Tell me about a project", "What are you passionate about?" |
| A hard technical problem | "Most difficult bug?", "A time you learned something fast" |
| A team conflict or a quiet teammate | "Disagreement with a teammate?", "Working with difficult people" |
| A failure or a missed deadline | "A time you failed", "What would you do differently?" |
| Leading or taking initiative | "A time you led", "Went beyond what was asked" |

**Question bank**
1. Tell me about yourself. → [one-minute intro](03-one-minute-intro.md)
2. Why do you want to work here?
3. Tell me about a time you disagreed with a teammate. How did you resolve it?
4. Describe a time you had too much to do. How did you prioritise?
5. Tell me about a mistake you made and what you learned.
6. A time you had to learn a new technology quickly.
7. How do you handle feedback on your code?
8. Where do you see yourself in 2–3 years?

## 2. Technical questions (junior level)

Know the *why*, not just the definition. Practise explaining each in 2–3 sentences with an example.

**Programming & OOP**
- Value vs reference; mutability. `==` vs `===` in JavaScript.
- The four OOP pillars, with an example from your own code.
- Interfaces vs abstract classes. Composition vs inheritance.
- What is a closure? What is a promise / `async`/`await`? The event loop at a high level.

**Data structures & algorithms**
- Arrays vs linked lists vs hash maps — when to use each. Big-O of common operations.
- Stacks, queues, trees, graphs; BFS vs DFS.
- Sorting basics; binary search. Practise ~30 easy/medium problems (two pointers, hashing, sliding window).

**Web & APIs**
- What happens when you type a URL and press Enter?
- REST: methods, status codes (200, 201, 400, 401, 403, 404, 500), idempotency.
- Cookies vs localStorage vs sessions; how JWT authentication works.
- CORS — what it is and why it exists.
- SSR vs CSR vs static generation (e.g. in Next.js).

**Databases**
- SQL vs NoSQL — trade-offs. Primary/foreign keys, joins, indexes (and when indexes hurt).
- Transactions and ACID. What is normalisation?
- How would you prevent two users booking the same slot? (Constraints, transactions, locking.)

**Tools & practice**
- Git: branching, merge vs rebase, resolving a conflict, what a pull request is for.
- Testing: unit vs integration vs end-to-end. What would you test in your project?
- Basic security: SQL injection, XSS, hashing passwords, never committing secrets.

**AI / LLM (increasingly common)**
- What is an LLM, a token, a context window? Why do models hallucinate?
- What is RAG and why use it? What is tool calling / an agent?
- How would you test or evaluate an AI feature? How do you control cost?

## 3. Project deep dive

Interviewers will pick a project from your CV and keep asking "why?". Prepare this outline for your top 2 projects:

```
1. Problem & users — why it mattered
2. Architecture — draw it in 30 seconds (frontend, backend, DB, external services)
3. My part — exactly what I built
4. Hardest problem — what broke, what I tried, what worked, why
5. Trade-offs — what we chose not to do, and why
6. Results — users, numbers, feedback, awards
7. Next — what I'd change or add
```

**Example "hardest problem" answer (shape to copy):**
> "In our booking system, two users could request the same lab at the same moment. Checking for
> conflicts in application code had a race condition. I moved the rule into PostgreSQL with an
> exclusion constraint, so overlapping bookings are physically impossible, and used a per-resource
> lock so the higher-priority request wins instead of whichever packet arrives first. We wrote tests
> that fire concurrent requests to prove it."

## 4. Questions to ask them (always have 2–3)

- What does a typical week look like for an intern on this team?
- How do you review code and give feedback to juniors?
- What's a recent project interns contributed to?
- What would make someone stand out in this role after three months?

## 5. Mock interview rubric

Score each area 1–4. Give one "keep doing" and one "try next time" for each.

| Area | 1 — needs work | 4 — strong |
|---|---|---|
| **Clarity** | Rambling, unclear point | Answers the question first, then explains |
| **Structure** | No order; story has no result | STAR / Present-Past-Future; clear ending |
| **Technical depth** | Buzzwords; can't explain "why" | Explains trade-offs with own examples |
| **Communication** | Too fast or quiet; no eye contact | Calm pace; checks understanding; thinks aloud |
| **Honesty & ownership** | Vague "we did everything" | Clear about own contribution and limits |

## On the day

- Test your camera, mic and internet 30 minutes early (online), or arrive 10 minutes early (in person).
- Have your CV, a glass of water and a notepad nearby.
- In coding questions, **think aloud**: clarify the problem, state a simple solution first, then improve it.
- It's fine to say "I don't know, but here's how I'd find out."
- Send a short thank-you message the same day.
