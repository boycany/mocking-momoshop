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

### 第 6 輪：上傳 GitHub、確立「ok go」工作節奏

- **人類指令**：將專案上傳至 GitHub（boycany）。
- **Agent 處理**：雲端環境沒有可用的 GitHub 憑證；內建瀏覽器未登入，Agent 不代輸密碼。改為提供指令，由人類以自己的身分建立 repo 並 push。
- **人類決策**：之後每一步，Agent 必須先描述要做什麼，人類回覆「ok go」才可寫程式碼。已寫入 `AGENTS.md`。

### 第 7 輪：data-access 層

- **Agent 提案**：models、`CatalogApi`（回傳 Promise）、mock 實作與 fixtures、單元測試。
- **人類提問**：「用 RxJS 會不會比用 Promise 方便，比較容易做到更多元的功能？」
- **Agent 重新評估**：同意改用 Observable，理由為 HttpClient 一致性、搜尋建議的 debounce/switchMap、重試與輪詢等擴充性；同時劃清界線，Observable 只在資料邊界，狀態仍用 signal。記錄為 ADR 0007。人類回覆「ok go」後動工。
- **Agent 產出**：
  - `data-access/models`：Product、Category、HomeSection（discriminated union）、SearchQuery/Result、AppLink。
  - `CatalogApi` 抽象與錯誤型別（`ProductNotFoundError`、`CatalogNetworkError`）。
  - `search-products.ts`：搜尋的純函式（關鍵字 AND 比對、全形半形正規化、分類、排序、分頁與頁碼夾限），與 mock 解耦以便單獨測試。
  - `MockCatalogApi`：`timer` 模擬延遲，`?mockError=1` 觸發錯誤；設定抽成 `MOCK_CATALOG_CONFIG` token，測試可設 0 延遲並強制失敗。
  - `src/mocks`：mulberry32 固定 seed 產生器、SVG placeholder、12 個分類 × 5 = 60 筆商品、依真站截圖文案建立的首頁版面。
- **實作中的調整**：「今日大牌」在真站緊鄰主視覺輪播，故併入 `hero-carousel` 而非獨立 section，已同步更新 ADR 0004 與計劃書。
- **Agent 自我修正**：更新文件的腳本因 `plan.md` 表格已被 Prettier 重新對齊而比對失敗、中途停止；確認已完成與未完成的部分後補齊，未重複套用。
- **驗證**：lint 通過；20 個單元測試通過（搜尋 8、mock API 6、fixtures 4、預設 2）；build 通過，fixtures 確認拆為獨立 lazy chunk（約 14 kB）。

### 第 8 輪：外框 layout、主題與路由

- **Agent 提案**：品牌色 token、三條 lazy route 與 404、utility bar / header / category nav / footer，App 換成 layout 外框。人類回覆「ok go」。
- **Agent 產出**：
  - `styles.scss`：momo 品牌 token（`--momo-primary` 等），以 `mat.theme-overrides` 把 Material 的 M3 primary 固定為 `#e4007f`；`.page-container` 固定 1200px 寬。
  - 路由：`/`、`/goods/:id`、`/search`、`**`，全部 `loadComponent` lazy load，並設定頁面 title。頁面內容先放殼。
  - `core/routing/injectQueryParam()`：layout 元件不在路由元件樹內，`withComponentInputBinding()` 用不到，因此從 Router 事件讀 query param 轉成 signal。header 搜尋框用 `linkedSignal` 跟 URL 的 keyword 同步，但仍可自由輸入。
  - `category-nav` 以 `rxResource` 從 `CatalogApi` 讀分類，依 URL 的 `categoryId` 標示目前分類。
  - footer 註明「前端面試作品，非 momo 官方網站，資料皆為模擬」，避免被誤認為真站。
- **刻意簡化**：工具列上會員、訂單等連結以純文字呈現（不在範圍內）；購物車數量暫時寫死為 0，待 CartStore 完成後接上；熱搜字暫時寫在 header 內。
- **驗證**：lint 通過；23 個測試通過（新增 header 3、category-nav 1，並把 Angular 預設的 app.spec 改為驗證 layout 外框）；production build 無 budget 警告，首頁初始傳輸約 69 kB，各頁面與 fixtures 皆為獨立 lazy chunk。

### 第 9 輪：人類從真站觀察到無限捲動商品牆

- **人類觀察**：真站首頁底部的商品牆會隨捲動自動載入，約捲動數次後出現「看更多」按鈕。人類提議實作。
- **Agent 回應**：坦承原計劃只有橫向商品列，沒注意到這個互動；同意實作，並從人類截圖補齊商品卡細節（紅字促銷文案、【品牌】前綴、星等、「速 最快今日」標記、總銷量）。提案新增 `getRecommendations({ offset, limit })`，理由是推薦牆與搜尋在真實系統是不同服務；並建議把第 3 步拆成 3a、3b 各自 commit，讓 3b 超時時 3a 仍是可交付版本。
- **人類修正規格**：點「看更多」後不是一次載入全部，而是重複上一輪：載入 10 筆後再自動載入兩次，再出現按鈕；商品載完時按鈕 disabled，顯示「已經沒有新商品了」。同意拆成 3a、3b。

### 第 10 輪（3a）：共用元件與首頁區塊

- **Agent 產出**：
  - `Product` 新增 `promoText`；商品名改為真站的【品牌】格式。
  - `shared/ui`：`Price`（折扣以台灣「5.7折」表示，計算抽成純函式）、`ProductCard`（依截圖補齊細節）、`ProductCardSkeleton`、`LoadError`（含重試）、`Carousel`（原生捲動 + 箭頭）。
  - `features/home`：首頁以 `rxResource` 讀版面；前兩個區塊立即渲染，其餘 `@defer (on viewport)`；`HomeSectionHost` 以 `@switch` 分派，未知類型略過並在開發模式 `console.error`；四種區塊元件；每條商品列自行取商品並有骨架與錯誤重試。
- **Agent 自我修正**：
  - 輪播的子元素是投影內容，emulated 樣式封裝下 `> *` 選不到，改用 grid `grid-auto-flow: column` 排版，子元素不需額外樣式。
  - 首頁測試第一次編譯失敗：`DeferBlockBehavior` 應從 `@angular/core/testing` 匯入，修正後通過。
- **驗證**：lint 通過；31 個測試通過（新增 price 2、product-card 工具 1、product-card 3、home-page 2）；production build 無 budget 警告，首頁初始傳輸約 77 kB。

### 第 11 輪：工具列固定在頂端

- **人類回報**：往下捲動後頂部工具列會消失，真站是固定在頂端的。
- **Agent 處理**：以 `position: sticky` 而非 `fixed` 實作，工具列維持在正常版面流中，下方 header 不需另外補位移；`z-index` 高於輪播箭頭。純樣式修改，jsdom 無法驗證捲動行為，未補單元測試，由人類在瀏覽器確認。

### 第 12 輪（3b）：無限捲動商品牆

- **Agent 產出**：
  - `CatalogApi.getRecommendations({ offset, limit })` 回傳 `{ items, total }`；mock 以固定 seed 的 Fisher-Yates 打亂商品，模擬推薦排序。
  - 新增 `product-feed` 區塊類型，`pageSize`、`autoLoadPerRound` 由版面設定決定。
  - `shared/ui/InViewport` directive：IntersectionObserver 在 `afterNextRender` 建立、銷毀時斷開，維持 SSR-ready。
  - `ProductFeed`：所有載入請求進同一個 `Subject`，以 `exhaustMap` 確保同時只有一個請求、`takeUntilDestroyed` 確保銷毀時取消。一個 `effect` 負責決定何時自動載入：首批、以及偵測元素可見且本輪還有額度時；每批載完後會重新判斷，所以偵測元素持續在畫面內時會連續載入。點「看更多」視為新一輪，計數歸零。失敗時顯示重試，重試沿用上一次的觸發類型。
- **Agent 自我修正**：修改 `home-section.model.ts` 時，又因檔案已被 Prettier 改成多行而比對失敗（與第 7 輪同類問題），只有第一處修改生效。確認各檔實際狀態後，改以不受排版影響的 regex 比對補齊。之後修改既有檔案前，先讀取實際內容再比對。
- **驗證**：lint 通過；37 個測試通過（新增 product-feed 5：首批不需捲動、自動載入兩次後出現按鈕、點擊開始新一輪、載完後按鈕 disabled 且不再請求、載入中不會重複請求；mock API 新增 offset 分頁 1）。jsdom 沒有 IntersectionObserver，測試以假的 observer 主動觸發可見狀態。production build 無 budget 警告。

### 第 13 輪：「看更多」文字與箭頭垂直對齊

- **人類回報**：「看更多」的文字和向下箭頭沒有垂直置中。
- **原因**：`⌄` 字元的字形本身畫在字框偏下的位置，靠調整字型或行高難以穩定對齊。
- **Agent 處理**：改用 inline SVG 箭頭（`aria-hidden`），按鈕改為 `inline-flex` + `align-items: center`，以幾何中心對齊、不依賴字型。未採用 Material Icons 字型的 `expand_more`，因為字型載入前會短暫顯示英文字。測試改為比對按鈕文字「看更多」。

### 第 14 輪：商品頁與 CartStore

- **Agent 產出**：
  - `BrowserStorage`：localStorage 的 JSON 封裝，沒有 window、儲存被封鎖或空間已滿時都不會丟例外。
  - `CartStore`（signalStore）：同商品同規格合併數量、不同規格分開；數量限制在 1–99；`totalQuantity`、`subtotal`；啟動時從 localStorage 還原並略過格式不符的資料，之後以 `effect` 持續寫回。
  - 商品頁：麵包屑、圖片與縮圖切換、促銷文案、價格（含「X折」）、標籤、規格按鈕、數量、加入購物車與直接購買。選中的圖片、規格、數量用 `linkedSignal` 以商品 id 為來源，換商品時自動重置。商品不存在與網路錯誤分開處理。頁面標題改為商品名。
  - 頂部工具列的購物車數量接上 `CartStore`。
- **測試抓到的真實 bug**：商品不存在與網路錯誤的兩個測試失敗。原因是 Angular resource 在錯誤狀態下讀 `value()` 會丟出例外，而 Agent 在多個 `computed` 和設定標題的 `effect` 中直接讀取，導致錯誤畫面不會出現、頁面直接壞掉。修正為先以 `hasValue()` 判斷的 `loadedProduct` computed，其他地方一律經由它讀取；並檢查首頁、商品列、分類 tab 皆已正確判斷。
- **規範更新**：這類錯誤 Agent 容易重複，因此在 `AGENTS.md` 新增「`value()` 只能在 `hasValue()` 之後讀」。
- **驗證**：lint 通過；48 個測試通過（新增 CartStore 6、商品頁 5）。

### 第 15 輪：右側浮動欄、瀏覽紀錄與購物清單頁

- **人類觀察**：真站每一頁右側都有浮動欄（瀏覽紀錄、購物車、TOP）。人類指定：顯示購物車件數並可進入購物清單頁；瀏覽紀錄保留最新兩筆（之後改為三筆）；不做「簽到賺 mo 點」；加入「^ TOP」。
- **Agent 提案並經人類同意**：瀏覽紀錄在商品頁「成功載入」時寫入，而非點擊商品卡當下。理由：涵蓋所有進入商品頁的路徑（商品卡、搜尋、瀏覽紀錄、直接貼網址），且已下架的商品不會留下點不開的紀錄。
- **Agent 產出**：
  - `RecentlyViewedStore`：上限常數 `RECENTLY_VIEWED_LIMIT = 3`；最新在前，重複商品移到最前；只存 id、名稱、圖片快照，浮動欄不需再呼叫 API；以 `BrowserStorage` 持久化。
  - 商品頁以 `effect` 寫入瀏覽紀錄，`record()` 包在 `untracked` 內，避免 store 的讀寫成為 effect 的依賴而無限循環。
  - `FloatingSidebar`：固定在 1200px 內容區右外側、窄視窗時不超出畫面；TOP 以 `ViewportScroller` 平滑捲動。
  - `/cart` 購物清單頁（新增 `features/cart`，同步加入 ESLint feature 邊界清單）：數量、刪除、總金額、空購物車畫面；結帳以 snackbar 說明不在範圍內。工具列的購物車改為連到 `/cart`。
- **測試抓到的畫面 bug**：購物清單頁金額顯示成 `\$2,500`。Agent 把 inline template（TS 反引號字串內需寫 `\$`）的寫法帶進外部 `.html` 檔，反斜線被原樣輸出。已移除，並確認其他 `.html` 沒有同樣問題。
- **驗證**：lint 通過；59 個測試通過（新增 RecentlyViewedStore 4、浮動欄 3、購物清單頁 3、商品頁寫入瀏覽紀錄 1）；production build 無 budget 警告。

### 第 16 輪：搜尋頁

- **Agent 產出**：
  - `search-params.ts`：`parseSort`、`parsePage` 把網址上不合法的值修正為預設值；`pageWindow` 產生以目前頁為中心的頁碼範圍。皆為純函式並各自測試。
  - 搜尋頁的 `keyword`、`categoryId`、`sort`、`page` 全部由 query params 綁定成 input（`sort`、`page` 以 input transform 修正），組成 `computed` 查詢條件後交給 `rxResource`；網址一變就重新查詢，並取消上一個請求。
  - 排序與頁碼都是帶 `queryParamsHandling="merge"` 的 `routerLink`，是真正的連結，可另開分頁或分享；換排序時把 `page` 設為 null 以回到第 1 頁，選「綜合排序」時也移除 `sort`，讓預設狀態的網址保持乾淨。
  - 頁碼採數字頁碼而非 Material paginator，因為後者的「1–20 of 60」樣式與真站差異大（ADR 0001 的取捨）。
  - 查無結果時提供建議關鍵字；載入中顯示骨架卡，失敗時可重試。
  - 全站開啟 `withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })`：修正從首頁底部點進商品頁時仍停在原捲動位置的問題，上一頁則回到原位置。
- **驗證**：lint 通過；69 個測試通過（新增 search params 4、搜尋頁 6）；production build 無 budget 警告。

### 第 17 輪：README

- **Agent 提案**：在剩約 38 分鐘時先寫 README，確保可交付；之後的時間建議做 observability，而非 header 即時搜尋建議，理由是考題加分項明確列出 Validation / Observability。人類回覆「ok go」。
- **Agent 產出**：英文 README，包含：非官方聲明、啟動指令（含 `?mockError=1`）、與真站逐區塊對照表、架構與依賴方向、Mermaid 資料流圖、ADR 索引、品質關卡與各模組測試數量、Agent 協作方式（含測試抓到的 Agent 錯誤與人類主導的方向調整）、刻意不做與後續方向。
- **做法**：測試數量與 commit 歷史先從實際執行結果取得（18 個測試檔、69 個測試、10 個 commit），不憑記憶撰寫。

### 第 18 輪：Observability

- **Agent 提案**：依序做全域錯誤處理、資料驗證、行為追蹤，每完成一項都維持可 commit 的狀態，時間不足就停在完成的項目。人類回覆「ok go」。
- **分層判斷**：mock API 需要回報壞資料，但 data-access 不應反向依賴 core，因此 `LOG_SINK` 與 `TrackingService` 放在 `shared/observability`，只有 `GlobalErrorHandler` 放在 `core/observability`。
- **Agent 產出**：
  - `GlobalErrorHandler`：結構化錯誤紀錄送到可替換的 `LOG_SINK`；sink 本身出錯也不會讓 app 崩潰。
  - `productProblems()` 驗證；`MockCatalogApi` 載入時剔除壞商品並回報（ADR 0008）。fixtures 載入方式抽成 `MOCK_FIXTURES_LOADER` token，測試才能注入壞資料。
  - `TrackingService` 與型別安全的事件 union。`ProductCard` 維持純 UI，只發出 `impression`（首次可見一次）與 `opened`，由商品列、商品牆、搜尋頁決定追蹤內容；商品頁送出 `add_to_cart`。
  - `InViewport` 在不支援 IntersectionObserver 的環境直接略過，避免舊瀏覽器與 jsdom 出錯。
- **連帶修正**：每張商品卡都有自己的 observer 後，商品牆測試「最後建立的 observer 就是偵測元素」的假設不再成立，改為依元素找出偵測元素。
- **Agent 自我修正**：新的「點擊發出 opened」測試點了 `routerLink`，在空路由下導頁失敗，錯誤在測試結束後才非同步拋出，造成 unhandled error。屬於測試寫法問題，改為在該測試中 stub `navigateByUrl`。
- **驗證**：lint 通過；77 個測試通過、無 unhandled error（新增錯誤處理 3、驗證 2、mock 剔除壞資料 1、商品卡事件 2，商品頁測試加上 `add_to_cart` 斷言）。README 新增 Observability 章節並更新測試數量與後續方向。
- **Agent 自我修正（文件）**：更新 README 時，兩處 regex 取代因 Prettier 已替表格補上對齊空格而沒有命中，且那兩處未檢查取代次數，導致 ADR 0008 列與三個模組的測試數量沒有更新。事後以 grep 核對時發現，改為逐列解析表格儲存格並斷言每一處都已修改，最後驗證表格加總等於實際的 77 個測試。這是同類問題的第三次（第 7、12 輪），教訓是：每一處自動修改都必須斷言有命中。

### 第 19 輪：已處理的 API 失敗也寫進 LOG_SINK

- **人類提問**：「要怎麼驗證 Observability？如何產生錯誤讓它記錄到 LOG_SINK？」
- **Agent 回答時發現缺口**：`?mockError=1` 造成的 API 錯誤被 `rxResource` 接住、轉成畫面上的錯誤與重試，從未成為未處理錯誤，因此不會經過 `GlobalErrorHandler`。結果是使用者看得到錯誤，維運端卻沒有任何紀錄。Agent 主動指出並提案補上，人類回覆「ok go」。
- **Agent 產出**：`MockCatalogApi.respond()` 多帶 API 名稱參數，以 `tap({ error })` 統一回報失敗為 `CatalogRequestFailed`（附 `operation` 與錯誤類型）；改一處即涵蓋全部 6 支 API。`ProductNotFoundError` 屬預期中的業務結果（例如舊連結），刻意不記錄以免雜訊蓋過真正的故障。錯誤照常往下傳，畫面行為不變。
- **做法改進**：吸取第 18 輪的教訓，這次每一處自動修改都加上斷言。測試檔的修改因 Prettier 排版不同而在斷言處停下，且因為檔案是全部比對成功後才寫入，沒有留下半套修改；改用不受排版影響的錨點後重新套用。
- **驗證**：lint 通過；79 個測試通過（新增：失敗請求會帶 API 名稱寫入 sink、商品不存在不寫入）。README 補上這個行為並更新測試數量，表格加總與實際數量一致。

### 第 20 輪：文件與實作一致性稽核

- **人類指令**：確認 README 與 `docs/` 底下所有文件是否準確記載目前的實作。
- **Agent 做法**：逐份閱讀文件，並以實際程式碼、build 結果、git log 核對，而非憑記憶判斷。
- **發現並修正**：
  - README：錯誤與空狀態說得過滿（分類 tab 失敗時只是不顯示）；lint 邊界說得過滿（只涵蓋 features、core、shared）；把人類的 RxJS 提問誤列為「觀察真站後的方向調整」，並補上 observability 缺口是人類提問時發現的。
  - `AGENTS.md`：資料夾結構補上 `cart` 與 `shared/observability`；Material 實際只用 `MatSnackBar` 與主題 tokens。
  - ADR 0001、0002、0004、0007：補記實作結果，修正與實作不符的描述（未使用的 Material 元件、`routerLink` 而非 `router.navigate`、section 為攤平物件、未知 section 在正式環境不會記錄、搜尋建議未實作）。
  - `plan.md`：保留原始計劃以呈現演變，新增「實作結果與計劃的差異」與取自 git log 的實際時間軸。
- **核對無誤的項目**：測試總數與各模組數字、測試檔數、初始傳輸約 86 kB、Node 版本、真站對照表各列，以及 ADR 0003、0005、0006、0008。

### 第 21 輪：部署設定（時限後）

- **時間**：本輪於 16:55 進行，已超過第一個 commit（14:53）起算的 120 分鐘，屬時限後的部署設定，未新增任何功能。
- **人類提問**：是否部署到 Vercel 讓面試官直接瀏覽？能否只讓知道連結的人看到？
- **Agent 建議**：部署，讓面試官不必 clone 與安裝即可比對真站。查證 Vercel 文件後說明：Hobby 方案可用 Vercel Authentication 保護包含 production 在內的所有部署，並以一條 Shareable Link 讓外部人員透過網址參數存取；密碼保護在 Hobby 不提供。文件未明確說明 Shareable Link 是否涵蓋 production，因此請人類以無痕視窗分別驗證「不帶參數被擋、帶參數可看」。建議連結放在提交信件而非 README，人類決定 README 不另加說明。
- **Agent 產出**：
  - `vercel.json`：所有路徑 rewrite 到 `index.html`，否則直接開啟或重新整理 `/goods/...`、`/search`、`/cart` 會得到 404；實際存在的靜態檔仍會優先回傳。
  - `index.html`：加上 `noindex, nofollow`。網站外觀與真實品牌相似，即使已有存取保護，仍避免被搜尋引擎收錄。
- **人類待辦**：在 Vercel 匯入 repo 並部署、開啟 Deployment Protection（All Deployments）、建立 Shareable Link 並驗證。
