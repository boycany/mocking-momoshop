# Agent 協作紀錄

記錄每輪「人類指令 → Agent 產出 → 人類判斷與修正」。目的是讓審閱者看到 Agent 的產出如何被監督、哪些決策由人類做出。

使用工具：Claude（Opus），透過 Claude 桌面 App 連接本機專案資料夾。

---

## Phase 1：設計與規劃（2026-11-18）

### 第 1 輪：閱讀考題、提出計劃

- **人類指令**：閱讀考題 PDF，選 A 題；指定 Angular + Angular Material；要求規劃兩小時內最接近 momo 的架構，並附上 momo 首頁截圖。
- **Agent 產出**：範圍優先序（首頁、商品頁為 P0）、技術選型、資料夾架構、CatalogApi 邊界、section-driven 首頁、120 分鐘時間表、刻意不做清單。
- **Agent 提出的問題**：Node / CLI 版本、圖片來源、開發位置。
- **人類決策**：
  - 圖片採本地 SVG placeholder（不用 picsum），見 ADR 0005。
  - 專案在本機資料夾開發，名稱 `mocking-momoshop`。
  - 本機 Node v26.5.0，可用 nvm 切換。

### 第 2 輪：建立空白專案

- **人類指令**：安裝最新版 Angular、Angular Material、@ngrx/signals；執行 `npx skills add angular/skills`；建立指定內容的 `.mcp.json`。
- **Agent 產出**：
  - 確認最新版本：Angular CLI / Material 22.2.7、@ngrx/signals 22.0.1，Node 26 在支援範圍內。
  - `ng new mocking-momoshop --style=scss --routing --ssr=false --skip-install --skip-git`。
  - 依 `ng add @angular/material` schematic 的內容手動設定 M3 主題、字型、`mat-typography`。
  - 安裝 angular-developer、angular-new-app 兩個官方 skills 至 `.claude/skills/`。
  - 建立 `.mcp.json`。
- **Agent 判斷與偏離原指令之處**（已向人類說明）：
  - Agent 的 shell 跑在本機上的 Linux VM，若在其中 `npm install`，esbuild / rollup 會裝成 Linux 原生檔，Mac 上無法執行。因此改用 `--skip-install`，`npm install` 交由人類在 Mac 上執行；`ng add` 也因此改為手動設定。
  - 移除 `package.json` 的 `packageManager: npm@10.9.9`（來自 VM 的 npm 版本，可能在 Node 26 上被 corepack 擋下）。
  - 不初始化 git：計時從第一個 commit 起算，且 commit 應由人類身分建立。
- **驗證**：Agent 在 VM 暫存目錄複製專案、安裝並建置。development build 與預設 Vitest 測試通過；production build 因 VM 網路封鎖 Google Fonts（字型 inline）而失敗，判定為環境因素，非專案問題。暫存目錄驗證後刪除。
- **人類後續動作**：於 Mac 執行 `npm install`，刪除 skills 安裝殘留的 lock 檔（Agent 在該資料夾沒有刪除權限）。

### 第 3 輪：Phase 1 收尾文件

- **人類指令**：將計劃記錄成文件；並提問「為什麼用 AGENTS.md 而不是 CLAUDE.md？」
- **Agent 回答**：考題鼓勵多種 AI 工具，`AGENTS.md` 是跨工具的共通慣例；改以 `AGENTS.md` 為唯一規範來源，`CLAUDE.md` 只寫 `@AGENTS.md` 引用。人類同意，記錄為 ADR 0006。
- **Agent 產出**：`AGENTS.md`、`CLAUDE.md`、`docs/plan.md`、`docs/decisions/0001`–`0006`、本檔。

### 第 4 輪：英文化規範、導入 lint 與 commit 檢查

- **人類指令**：`AGENTS.md` 改用英文；安裝 lint-staged、husky、angular-eslint，確保每次 commit 都通過 lint；之後 Agent 每完成一個功能都必須跑 lint 與 unit test，有問題當場修正。
- **Agent 產出**：
  - 以 `ng add angular-eslint` 建立 `eslint.config.js` 與 `lint` target；husky `pre-commit` 執行 lint-staged（ts/html 跑 Prettier + ESLint，scss/json/md 跑 Prettier）；新增 `.prettierignore`，排除第三方的 `.claude/skills`。
  - **Agent 主動提議並經人類同意**：將 `AGENTS.md` 的架構規則改由 ESLint 強制，包括 feature 之間禁止互相 import、只有 data-access 可讀 mock fixtures、core/shared 不得依賴 features，並啟用 `prefer-signals`、`prefer-control-flow` 等規則。
  - `AGENTS.md` 新增 Definition of done：lint、test、build 皆通過才算完成，禁止為了讓檢查通過而關閉規則或使用 `--no-verify`。
- **驗證**：刻意寫入違規檔案，確認每條邊界規則都會報錯、lint-staged 會擋下有錯的 commit；驗證後刪除測試檔。
- **Agent 自我修正**：測試時發現 `prefer-on-push-component-change-detection` 沒有對測試元件報錯。查 `@angular/core` 型別定義後確認 **Angular 22 已將 OnPush 設為預設**，`Default` 更名為 `Eager` 並標示為 deprecated。原規範「元件要明確設定 OnPush」因此過時，改為「不要設定 `changeDetection`，禁止使用 `Eager`」。
- **驗證流程**：Agent 的 shell 在 Linux VM，無法使用 Mac 的 node_modules。因此在 VM 維護一份專案鏡像（自有 Linux node_modules），每次檢查前以 rsync 同步原始碼，再跑 lint、test 與 development build。

### 第 5 輪：語言規範

- **人類指令**：只有 `docs/` 用中文，README、程式碼註解等其餘內容一律英文。
- **Agent 產出**：`AGENTS.md` 新增 Language 章節。Agent 補充一個例外並寫明：畫面上的文案與 mock 資料要模擬 momo 真站，因此維持繁體中文；註解、commit 訊息、識別字、測試名稱一律英文。
- **檢查**：掃描 `docs/` 以外的檔案，確認沒有其他中文內容。

---

## Phase 2：實作

（待續）
