# Project Kit — drop-in files for any team repo

Copy what you need into the root of your project. Everything here is plain Markdown/YAML.

| File | What it gives you |
|---|---|
| [`README-template.md`](README-template.md) | A project README that recruiters and examiners can scan in 30 seconds |
| [`TEAM-CHARTER.md`](TEAM-CHARTER.md) | Week-one agreement: roles, meetings, decisions, what happens when things slip |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Branch names, commit messages, pull request rules |
| [`AGENTS.md`](AGENTS.md) | Instructions for AI coding tools (Claude Code, Cursor, Copilot…) working in your repo |
| [`.github/pull_request_template.md`](.github/pull_request_template.md) | PR checklist shown automatically on every pull request |
| [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE) | Bug report and feature/task templates |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | GitHub Actions: install → lint → typecheck → test → build on every PR |

Grab the whole kit into an existing repo:

```bash
npx giget@latest gh:avishkaindula/student-launchpad/project-kit . --force
```

(`--force` lets it write into a non-empty folder — commit your work first so you can review the changes.)

**Recommended GitHub settings** (Settings → Branches → Add rule for `main`):
require a pull request before merging, require 1 approval, require status checks (CI) to pass.
