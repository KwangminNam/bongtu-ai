Git commit & push workflow.

1. Run `git status` to see all changed files (never use `-uall` flag).
2. Run `git diff` and `git diff --staged` to review all changes.
3. Run `git log --oneline -5` to check recent commit message style.
4. Analyze the changes and draft a concise commit message in Korean that describes the "why" not the "what".
5. Stage relevant files (use specific file names, avoid `git add .` or `git add -A`).
6. Commit with the drafted message. End the message with:
   `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
7. Push to the current remote branch with `git push`. If no upstream is set, use `git push -u origin <branch>`.
8. Report the result (commit hash and pushed branch).

Do NOT commit files that may contain secrets (.env, credentials, etc).
Do NOT amend existing commits — always create new ones.
Do NOT use `--no-verify` or skip hooks.
