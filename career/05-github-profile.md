# Make Your GitHub Work for You

Recruiters and interviewers click your GitHub link for about 30 seconds. Make those seconds count.

## Profile checklist

- [ ] Real name, photo and a one-line bio ("CS student building full-stack & AI apps").
- [ ] Links to your portfolio and LinkedIn.
- [ ] A **profile README** (create a public repo with the same name as your username) — template below.
- [ ] **Pin your best 4–6 repos.** Pinned repos are the only ones most people will see.
- [ ] Make sure your best work is **public**. A winning hackathon project in a private repo can't help your CV.
- [ ] Archive or make private the clutter (tutorial exercises, empty repos, forks you never changed).

## Every pinned repo needs

- [ ] A **description** and **topics** (e.g. `nextjs`, `supabase`, `hackathon`) — set them in the repo's About box.
- [ ] A **README** (use the [README template](../project-kit/README-template.md)) with:
      the problem, a screenshot or GIF, a live demo / video link, the tech stack, how to run it,
      your role, and honest limitations.
- [ ] No default boilerplate README from `create-next-app` or `create-expo-app`.
- [ ] No secrets committed (`.env` in `.gitignore`; check your history with `git log -p | grep -i key`).
      If you ever committed a key, **rotate it** — deleting the file doesn't remove it from history.
- [ ] A license (MIT is fine for most student projects).

## Profile README template

```markdown
### Hi, I'm <Name> 👋

CS undergraduate at <University> who likes building <what you build> for real users.

- 🔨 Currently building: <project + link>
- 🏆 <Best achievement: hackathon win / app with N users>
- 🌱 Learning: <what you're learning>
- 📫 <email> · [LinkedIn](https://linkedin.com/in/you) · [Portfolio](https://you.dev)

**Featured projects**
| Project | What it is | Stack |
|---|---|---|
| [Project One](https://github.com/you/one) | One-line problem + result | Next.js, Supabase |
| [Project Two](https://github.com/you/two) | One-line problem + result | React Native, FastAPI |

**Tech:** TypeScript · Python · React · Next.js · Node.js · PostgreSQL · Docker
```

## Commit habits that look professional

- Small, focused commits with clear messages: `feat: add booking conflict check`, `fix: handle empty search`.
- Work in branches and merge through pull requests, even on solo projects.
- Commit regularly — a project with a real history tells a better story than one giant "initial commit".
