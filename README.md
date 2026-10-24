# Student Launchpad 🚀

**Starter templates and playbooks to go from idea → shipped project → interview.**

Everything I wish I'd had as a CS undergrad: production-grade templates so you can skip the
boilerplate and spend your time on the actual problem, plus the playbooks I use for group projects,
hackathons, CVs and interviews. Originally put together for mentees at **IEEE WIE IIT SyncUp 2.0** —
free for anyone to use.

<p align="center"><img src="assets/qr-student-launchpad.png" alt="QR code linking to this repository" width="160"></p>

---

## ⚡ Spin up a project in one command

Each template is a standalone app in [`templates/`](templates). Copy one into a new folder — no
git history, no clutter — with [`giget`](https://github.com/unjs/giget):

```bash
npx giget@latest gh:avishkaindula/student-launchpad/templates/<template> my-app
```

| Template | Use it for | Stack | Get it |
|---|---|---|---|
| [**nextjs-supabase-saas**](templates/nextjs-supabase-saas) | Any web app with accounts, roles (user/mod/admin), a database and file uploads | Next.js 16, Supabase (Postgres + RLS + Auth + Storage), shadcn/ui, Zustand | `npx giget@latest gh:avishkaindula/student-launchpad/templates/nextjs-supabase-saas my-app` |
| [**ai-agent-app**](templates/ai-agent-app) | AI features done properly: agents with tools, RAG, structured output, tests without an API key | Next.js 16, AI SDK 7, AI Gateway, zod, Vitest | `npx giget@latest gh:avishkaindula/student-launchpad/templates/ai-agent-app my-app` |
| [**fastapi-ml-service**](templates/fastapi-ml-service) | Data science projects (DSGP): train a model, serve it as an API, test it, ship it | Python 3.12, uv, FastAPI, scikit-learn, pytest, Docker | `npx giget@latest gh:avishkaindula/student-launchpad/templates/fastapi-ml-service my-api` |
| [**expo-supabase-mobile**](templates/expo-supabase-mobile) | iOS + Android apps with sign-in and a database | Expo (React Native), expo-router, Supabase | `npx giget@latest gh:avishkaindula/student-launchpad/templates/expo-supabase-mobile my-mobile-app` |

Every template has its own README with a 5-minute quick start. Combine them freely —
e.g. a Next.js web app + the FastAPI model service for a DSGP, or the mobile app + the SaaS admin dashboard.

---

## 📘 Playbooks

| Guide | What's inside |
|---|---|
| [Group project playbook](playbooks/01-group-project-playbook.md) | SDGP/DSGP: real problems, user interviews, feasibility, risk register, MVP scoping, teamwork, demo & viva — with copy-paste templates |
| [Hackathon playbook](playbooks/02-hackathon-playbook.md) | Rubric-first planning, the hero flow, cut lists, "live but ugly first", pitching |
| [Study system](playbooks/03-study-system.md) | Managing several modules, assessment planning, studying so it sticks |
| [Building with AI tools](playbooks/04-building-with-ai-tools.md) | Using AI coding assistants responsibly — and building safe AI features |

## 💼 Career kit

| Guide | What's inside |
|---|---|
| [CV guide](career/01-cv-guide.md) | Structure, the bullet-point formula, project descriptions, ATS tips, a template and a review checklist |
| [LinkedIn checklist](career/02-linkedin-checklist.md) | Headline, About, Featured, activity, and a message template for reaching out |
| [One-minute intro](career/03-one-minute-intro.md) | The Present → Past → Future pitch, with an example and a feedback checklist |
| [Interview prep](career/04-interview-prep.md) | STAR stories, a junior technical question bank, project deep dives, a mock-interview rubric |
| [GitHub profile](career/05-github-profile.md) | Make your profile and pinned repos recruiter-ready, plus a profile README template |
| [Mentoring session worksheet](career/06-mentoring-session-worksheet.md) | One page to get the most out of a mentoring session |

## 🧰 Project kit — drop into any repo

[`project-kit/`](project-kit) has a README template, team charter, contributing guide, `AGENTS.md` for AI
coding tools, PR and issue templates, and a GitHub Actions CI workflow:

```bash
npx giget@latest gh:avishkaindula/student-launchpad/project-kit . --force
```

---

## Prerequisites

- **Node.js 22+** and **pnpm** (`npm i -g pnpm`) for the JavaScript templates
- **[uv](https://docs.astral.sh/uv/)** for the Python template
- **Docker** + the **[Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)** if you want to run Supabase locally (or use a free hosted project)
- **Git** and a **GitHub** account (the [GitHub Student Developer Pack](https://education.github.com/pack) is free and very worth it)

## Found a problem? Want to add something?

Open an [issue](../../issues) or a pull request — improvements from students are very welcome.

## About

Made by **Avishka Indula** — software engineer (AI & full-stack) and CS undergraduate.
[avishka.net](https://avishka.net) · [LinkedIn](https://linkedin.com/in/avishkaindula) · [GitHub](https://github.com/avishkaindula)

Licensed under [MIT](LICENSE) — use it for coursework, hackathons, side projects, anything.
Please follow your university's academic-integrity rules when using templates in assessed work.
