# Building With AI Coding Tools (Responsibly)

AI coding assistants (Claude Code, Cursor, Copilot, ChatGPT…) can make a student team much faster —
or produce a project nobody on the team understands. These habits keep you on the right side.

## Ground rules

1. **Follow your module's AI policy.** Policies differ between modules and assessments. If AI help is
   allowed, declare it the way the module asks. If it isn't, don't use it.
2. **You must be able to explain every line you submit.** Your viva will check this.
3. **Never paste secrets** (API keys, passwords, `.env` files) or other people's personal data into an AI tool.
4. **AI output is a draft from a confident junior.** Read it, run it, test it.

## Habits that make AI tools work well

- **Give the tool a project brief.** Add an [`AGENTS.md`](../project-kit/AGENTS.md) file to your repo
  describing the stack, conventions, commands and "don't do this" rules. Most AI coding tools read it.
- **Plan before you generate.** Ask for a plan, review it, *then* ask for code — one small step at a time.
- **Keep changes small and reviewable.** One feature per prompt, one pull request per feature.
- **Ask for tests with the code**, and run them yourself.
- **Use current docs.** Libraries change faster than models' training data. Point the tool at the
  installed docs (many packages ship docs in `node_modules`) or the official site.
- **Ask "why"**: "Explain this function line by line" and "what are the edge cases?" are great prompts for learning.

## Using AI in your product

If your project *contains* an AI feature, the [AI agent template](../templates/ai-agent-app) shows the
safe patterns. In short:

| Do | Don't |
|---|---|
| Keep maths, rules and permissions in code; let the model explain | Let the model calculate grades, prices or taxes |
| Ground answers in your own data (retrieval) and show sources | Present model guesses as facts |
| Validate model output against a schema | `eval()` model output — ever |
| Put a human confirmation before irreversible actions | Let an agent pay, email or delete on its own |
| Cap agent steps and track token costs | Run unbounded loops on a credit card |
| Test with mock models | Burn API credits in CI |
