# Antigravity Agent Rules — THE_WEBSITE

## On Every Session START (do this first, always):
1. Read `PROJECT_BRAIN.md` — this is your map of the entire project
2. Read `AGENT_LOG.md` — see what was done in previous sessions
3. Do NOT re-read all source files from scratch
4. Do NOT re-read chat history — the brain file has everything you need

## On Every Session END (do this last, always):
1. Open `AGENT_LOG.md`
2. Add a new entry at the TOP (below the first horizontal rule) in this format:

```
## Session N — [Short title of what was done]
**Date:** [Today's date]
**What was done:**
- [bullet list of changes]

**Files changed:**
- [list every file touched]

**Issues / blockers:**
- [anything unresolved or to watch out for]

---
```

## Golden Rules:
- Keep changes **minimal and targeted** — don't rewrite working code
- Always **explain what you're about to do** before doing it
- If something is unclear, **ask first** — don't assume
- Never edit `package-lock.json`, `node_modules/`, or `server.js` directly
- All TypeScript types go in `src/types.ts` — check there before creating new ones
- Backend logic goes in `src/server/` — never put API keys in frontend files
- When in doubt about project structure, re-read `PROJECT_BRAIN.md`
