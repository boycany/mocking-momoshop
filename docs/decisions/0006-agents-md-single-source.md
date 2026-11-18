# 0006. AGENTS.md 作為 Agent 規範的唯一來源

- 狀態：已採用
- 日期：2026-11-18

## 背景

考題允許並鼓勵使用多種 AI 工具（Codex、Claude、Gemini、Cursor、Copilot）。各工具讀取的設定檔不同，例如 Claude Code 讀 `CLAUDE.md`，多數工具則支援 `AGENTS.md`。若各寫一份，規則很快就會不同步。

## 決策

- 規範只寫在 `AGENTS.md`。
- `CLAUDE.md` 只有一行 `@AGENTS.md`，引用而不複製。
- Angular 官方 skills 放在 `.claude/skills/`，版本鎖於 `skills-lock.json`；`.mcp.json` 接上 Angular CLI MCP。

## 影響

- 好處：換 Agent 不需要改規範，規範的修改歷史也集中在一個檔案的 git log。
- 代價：若某工具不支援 `AGENTS.md`，需要額外加一個引用檔。
