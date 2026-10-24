/**
 * The agent's knowledge base.
 *
 * Replace these notes with your own content (course notes, product docs,
 * FAQs...). Keeping them in a TypeScript module means they are bundled with
 * the app, so `searchDocs` works the same locally and when deployed — no
 * database or vector store needed until you outgrow keyword search.
 */

export type KnowledgeDoc = {
  id: string;
  title: string;
  tags: string[];
  body: string;
};

export const knowledgeDocs: KnowledgeDoc[] = [
  {
    id: "problem-statement",
    title: "Writing a real problem statement",
    tags: ["problem", "idea", "research", "proposal"],
    body: `A good problem statement names WHO has the problem, WHAT the problem is, and WHY it matters now — without mentioning your solution.
Template: "<user group> struggle to <task> because <root cause>, which leads to <cost: time, money, risk>."
Red flags: the statement contains a technology ("an AI app that..."), the user group is "everyone", or nobody you have spoken to actually has the problem.
Test it: can you name three real people who have this problem? If not, go talk to people before writing code.`,
  },
  {
    id: "user-research",
    title: "Talking to users before building",
    tags: ["users", "interviews", "research", "validation"],
    body: `Interview 5–8 people from your target group before you design features.
Ask about past behaviour, not hypothetical futures: "Tell me about the last time you..." beats "Would you use an app that...".
Listen for workarounds (spreadsheets, WhatsApp groups, paper notes) — a workaround proves the pain is real.
Write down exact quotes; use them in your proposal and viva. Five honest interviews beat a 200-response Google Form full of leading questions.`,
  },
  {
    id: "feasibility",
    title: "Checking feasibility early",
    tags: ["feasibility", "data", "ml", "technical", "risk"],
    body: `Check three things in week one: data, skills, and time.
Data: if your project needs a trained model, do you already HAVE a labelled dataset you are allowed to use? Finding data is the #1 reason ML projects stall.
Skills: list the technologies, and who on the team has shipped something with each. Unknown tech is fine — but budget a spike (1–3 days) to prove it works.
Time: students rarely have more than ~50% of their week for a group project once other modules, coursework and exams are counted.
Build a throwaway prototype of the riskiest part first.`,
  },
  {
    id: "risk-register",
    title: "Keeping a simple risk register",
    tags: ["risk", "planning", "management", "team"],
    body: `List each risk with likelihood (low/med/high), impact, an owner, and a mitigation.
Common student-project risks: a teammate drops out or goes quiet, the dataset is unusable, a third-party API changes pricing or rate-limits you, scope creep before the demo, and integration happening only in the final week.
Mitigations: integrate weekly (not at the end), keep a working demo branch at all times, pick boring well-documented tech for core features, and agree on a "cut list" of features you will drop first.`,
  },
  {
    id: "mvp-scoping",
    title: "Scoping a realistic first version (MVP)",
    tags: ["mvp", "scope", "features", "prioritisation"],
    body: `Your MVP is the smallest thing that lets a real user complete the core job end-to-end once.
Use MoSCoW: Must / Should / Could / Won't. Keep "Must" to 3–5 features. Everything else goes on a later list.
Prefer one polished end-to-end flow over five half-built screens — examiners and users judge what works in the demo.
Auth, admin panels, notifications and payments are rarely the core job: use a template or a managed service for them.`,
  },
  {
    id: "teamwork",
    title: "Working well as a student team",
    tags: ["team", "git", "collaboration", "roles", "communication"],
    body: `Agree on a team charter in week one: meeting times, response-time expectations, how decisions are made, and what happens when someone misses deadlines.
Use GitHub properly: protected main branch, feature branches, small pull requests, at least one reviewer, and issues for every task. Your commit history is evidence of individual contribution.
Rotate the demo driver so everyone can explain every part of the system.
Raise problems early and kindly — silence is the most expensive failure mode in group projects.`,
  },
  {
    id: "demo-viva",
    title: "Preparing the demo and viva",
    tags: ["demo", "viva", "presentation", "testing"],
    body: `Structure the demo as a story: the user, their problem, the flow that solves it, and the evidence it works (test results, user feedback).
Record a backup video of the demo in case the Wi-Fi or a third-party API fails on the day.
Every member should be able to answer: why this architecture, what alternatives you considered, what you would do differently, and how you tested it.
Seed realistic demo data — empty screens make strong projects look weak.`,
  },
];
