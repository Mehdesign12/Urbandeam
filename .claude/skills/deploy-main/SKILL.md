---
name: deploy-main
description: Deploy the current claude/* branch to main by creating a pull request and squash-merging it via the GitHub MCP tools.
---

# /deploy-main

Deploy the current working branch to `main` on `Mehdesign12/Urbandeam` by creating a PR and squash-merging it immediately.

## Steps

1. Make sure every local change is committed and pushed to origin. Run:
   - `git status` to check for uncommitted changes
   - `git rev-parse --abbrev-ref HEAD` to get the current branch name
   - `git push -u origin <branch>` if the branch is not yet on origin or is behind

2. Load the GitHub MCP tools via ToolSearch with:
   `select:mcp__github__list_pull_requests,mcp__github__create_pull_request,mcp__github__merge_pull_request`

3. Check if an open PR already targets `main` from the current branch using
   `mcp__github__list_pull_requests` (state: open, head: the current branch).
   - If one exists, reuse its `number`.
   - Otherwise, create a new PR with `mcp__github__create_pull_request`:
     - `owner`: `Mehdesign12`
     - `repo`: `Urbandeam`
     - `base`: `main`
     - `head`: current branch name
     - `title`: short summary of the changes on the branch (infer from the latest commit message)
     - `body`: 1-3 bullet points summarizing what changed, based on `git log main..HEAD`

4. Squash-merge the PR with `mcp__github__merge_pull_request`:
   - `merge_method`: `squash`
   - `commit_title`: same as the PR title

5. Report the merge SHA and PR URL to the user.

## Guardrails

- Only use this skill when the current branch starts with `claude/`. If not, stop and ask for confirmation before proceeding.
- Never force-push, never delete `main`, never bypass required checks.
- Repository scope is strictly `Mehdesign12/Urbandeam`.
