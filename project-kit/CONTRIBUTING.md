# Contributing

## Workflow

1. Pick (or create) an issue and assign yourself.
2. Create a branch from `main`, named after the issue:
   `feat/42-login-form`, `fix/57-empty-search-crash`, `chore/ci-cache`
3. Commit small, focused changes (see messages below).
4. Push and open a pull request. Fill in the template and link the issue (`Closes #42`).
5. At least **one** teammate reviews. CI must pass.
6. Squash-merge, delete the branch, and pull `main`.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add booking conflict check
fix: handle empty search results
docs: add setup steps for Windows
refactor: extract price calculation into lib/pricing
test: cover expired-token case
chore: bump dependencies
```

## Pull requests

- Keep PRs small (ideally under ~400 changed lines). Big PRs get rubber-stamped, not reviewed.
- Include screenshots or a short clip for UI changes.
- Don't merge your own PR without a review (except agreed emergencies).

## Reviewing

- Review within one working day.
- Be kind and specific: *"This query runs once per item — could we fetch them in one call?"*
  beats *"This is slow."*
- Approve when it's good enough and safe, not when it's how you would have written it.

## Never commit

- Secrets: `.env`, API keys, service-account files. Use `.env.example` with placeholder values.
- Large datasets or model files (use cloud storage or Git LFS and document where they live).
- `node_modules`, build output, `.venv`.
