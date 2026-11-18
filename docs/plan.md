# Phase 1：設計與實作計劃

> 題目：A. Mocking momoshop（純前端，無任何真實 API 呼叫）
> 撰寫日期：2026-11-18
> 實作時限：第一個 commit 起約 120 分鐘

## 1. 目標與評估重點的對應

| 考核項目                                  | 本專案的回應方式                                                                    |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| 實作結果與真實網站的差異                  | 優先重現首頁與商品頁這兩個辨識度最高的頁面；品牌視覺自寫 SCSS，不套用 Material 外觀 |
| 開發流程規劃與 Agent 協作效率             | 本文件的時間表、`AGENTS.md` 規範、一任務一 commit、`docs/agent-log.md`              |
| Bonus：Human-Agent Iteration Architecture | `AGENTS.md` 為多 Agent 共用規範、ADR 記錄決策、人類審核關卡                         |
| Bonus：Validation / Observability         | fixtures 執行期驗證、`GlobalErrorHandler`、`TrackingService`                        |

## 2. 範圍取捨

| 優先 | 路由 / 功能                                     | 理由                                                 |
| ---- | ----------------------------------------------- | ---------------------------------------------------- |
| P0   | `/` 首頁                                        | 與真站差異最容易被看出，元素最完整                   |
| P0   | `/goods/:id` 商品頁                             | 電商核心頁，能展示價格、規格選擇、加入購物車的狀態流 |
| P1   | `/search?keyword=&sort=&page=`                  | 以 URL 為狀態來源，展示路由與狀態設計                |
| P2   | 購物車抽屜、右側浮動欄（瀏覽紀錄、購物車、TOP） | 共用 store 的成果，成本低                            |

**刻意不做**：`/live`、`/discover`、登入／會員、結帳流程、RWD 與手機版、SSR。

- RWD：momo 桌機版本身是固定寬度，手機另有 m 站，桌機優先反而更接近真站。
- SSR：電商 SEO 需要它，但兩小時內不是最高價值；程式碼保持 SSR-ready（不直接碰 `window`），列為後續演進。

## 3. 技術選型

| 項目       | 選擇                               | 理由                                               |
| ---------- | ---------------------------------- | -------------------------------------------------- |
| 框架       | Angular 22（standalone、zoneless） | 個人最熟悉；signals 與 zoneless 是目前官方主推方向 |
| UI 元件    | Angular Material / CDK，只取行為   | 見 ADR 0001                                        |
| 狀態       | `@ngrx/signals` signalStore        | 輕量、與 signals 原生整合，適合購物車這類跨頁狀態  |
| 非同步資料 | RxJS Observable + `rxResource()`   | 見 ADR 0007                                        |
| 測試       | Vitest（Angular CLI 預設）         | 速度快，聚焦純邏輯                                 |
| 圖片       | 本地 SVG placeholder               | 見 ADR 0005                                        |

## 4. 架構

```
src/app/
├─ core/
│  ├─ layout/              # utility-bar、header、category-nav、floating-sidebar、footer
│  └─ observability/       # GlobalErrorHandler、TrackingService
├─ data-access/
│  ├─ models/              # Product、Category、HomeSection、Banner
│  ├─ catalog.api.ts       # abstract class CatalogApi
│  ├─ mock-catalog.api.ts  # 讀本地 fixtures，模擬延遲與錯誤
│  └─ stores/              # cart.store.ts、recently-viewed.store.ts
├─ features/
│  ├─ home/                # home page + sections/*
│  ├─ goods/               # goods page、gallery、spec-selector
│  └─ search/              # search page、filter-bar、result-grid
└─ shared/ui/              # product-card、price、carousel、section-title
src/mocks/
├─ fixtures/               # products、home-layout、categories
└─ generate.ts             # 固定 seed 的資料產生器
```

### 4.1 關鍵設計

1. **CatalogApi 資料邊界**（ADR 0003、0007）：頁面只依賴抽象類別，方法回傳 Observable，頁面以 `rxResource()` 轉成 signal；`MockCatalogApi` 由 provider 注入，fixtures 以 dynamic import 拆成獨立 chunk。mock 模擬 200–400ms 延遲，並可用 query flag 觸發錯誤，讓 loading / error / empty 狀態都是真的走得到的路徑。
2. **Section-driven 首頁**（ADR 0004）：`home-layout` 是一串 `{ type, data }`，首頁以 `@switch` 對應 section 元件，模擬電商首頁由 CMS 營運排版的真實情境。
3. **搜尋狀態以 URL 為唯一來源**（ADR 0002）：重新整理、上一頁、分享連結都不會遺失狀態。
4. **Rendering strategy**：首頁下半部與長清單使用 `@defer (on viewport)`，降低首屏成本。

### 4.2 狀態

| 狀態                               | 存放位置              | 持久化       |
| ---------------------------------- | --------------------- | ------------ |
| 購物車                             | `CartStore`           | localStorage |
| 瀏覽紀錄                           | `RecentlyViewedStore` | localStorage |
| 搜尋條件                           | URL query params      | URL 本身     |
| 元件 UI 狀態（輪播索引、選中規格） | component `signal()`  | 無           |

### 4.3 Mock 資料

- 約 60 筆商品，涵蓋家電、3C、美妝、生鮮、服飾等首頁可見分類。
- 主要欄位：`id`、`name`、`brand`、`price`、`originalPrice`、`tags`（折價券、mo幣回饋…）、`specs`、`images`、`categoryId`、`rating`。
- 產生器使用固定 seed，確保每次結果一致、可重現。

### 4.4 首頁區塊（對照真站截圖）

| 真站區塊                                  | 對應元件                                   |
| ----------------------------------------- | ------------------------------------------ |
| 頂部工具列（回首頁、登入、購物車…）       | `core/layout/utility-bar`                  |
| Logo、搜尋框與熱搜字、右上促銷徽章        | `core/layout/header`                       |
| 分類 tab（首頁、限時搶購、直播、家電…）   | `core/layout/category-nav`                 |
| 主視覺輪播 + 「今日大牌」四宮格           | `hero-carousel` section（含 `todayBrand`） |
| 圓形快捷入口（日用婦幼、休閒旅遊…）       | `quick-entry` section                      |
| 「今日限定」活動橫幅                      | `promo-banner` section                     |
| 商品橫向列表                              | `product-rail` section                     |
| 右側浮動欄（瀏覽紀錄、購物車、簽到、TOP） | `core/layout/floating-sidebar`             |

## 5. Validation / Observability

- **資料驗證**：fixtures 載入時以 type guard 驗證，格式錯誤直接拋錯，不讓 UI 默默壞掉。
- **錯誤收斂**：`GlobalErrorHandler` 集中處理，目前輸出到 console sink。
- **行為追蹤**：`TrackingService` 記錄商品卡曝光（IntersectionObserver）、點擊、加入購物車；目前寫入 console，介面設計成日後可替換為 GA 或內部 log 服務。

## 6. Human-Agent 協作設計

- **規範單一來源**：`AGENTS.md`（`CLAUDE.md` 僅引用它），確保換用不同 Agent 時規則一致。
- **官方 skills**：`.claude/skills/` 內含 Angular 官方 skills；`.mcp.json` 接上 Angular CLI MCP（含 devserver 工具），讓 Agent 能查詢官方最佳實踐並自行啟動、驗證 dev server。
- **決策紀錄**：`docs/decisions/` 以 ADR 記錄關鍵取捨。
- **協作紀錄**：`docs/agent-log.md` 記錄每輪「人類指令 → Agent 產出 → 人類修正與原因」。
- **審核關卡**：新增套件、違反依賴方向、或與真站版面不確定時，Agent 必須停下來詢問。
- **Commit 粒度**：一任務一 commit，Conventional Commits，帶 `Co-Authored-By`。

## 7. 時間表（120 分鐘）

| 時間    | 內容                                                            | 預計 commit         |
| ------- | --------------------------------------------------------------- | ------------------- |
| 0–15    | 骨架、規範文件、theme tokens、路由                              | `chore: scaffold`   |
| 15–30   | models、fixtures 產生器、CatalogApi 與 mock                     | `feat(data-access)` |
| 30–60   | layout（工具列、header、分類 nav）、首頁 sections、product-card | 2–3 個 commit       |
| 60–80   | `/goods/:id`：圖庫、價格、規格、加入購物車                      | `feat(goods)`       |
| 80–95   | `/search`：URL 狀態、排序、分頁、空結果                         | `feat(search)`      |
| 95–105  | CartStore、購物車抽屜、右側浮動欄、瀏覽紀錄                     | `feat(cart)`        |
| 105–115 | Vitest、ErrorHandler、Tracking                                  | `test`、`feat(obs)` |
| 115–120 | README：架構、取捨、刻意不做、演進方向                          | `docs`              |

**時間不足時的砍除順序**：tracking → 搜尋分頁 → 瀏覽紀錄。首頁與商品頁必須守住。

## 8. 後續演進方向（不在本次範圍）

- Angular SSR + 首頁、商品頁 prerender（SEO 與 LCP）
- 以 `HttpCatalogApi` 取代 mock，接上 BFF
- `/live`、`/discover`、結帳流程
- 手機版（獨立 layout 或 RWD，視產品策略而定）
- Playwright 視覺回歸測試，量化「與真站差異」
- Web Vitals 實際上報
