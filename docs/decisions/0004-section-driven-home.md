# 0004. 首頁採 section-driven 設定

- 狀態：已採用
- 日期：2026-11-18

## 背景

真實電商首頁由營運人員透過 CMS 調整區塊順序與內容，且活動頻繁更換。若首頁模板寫死，每次活動都要改程式。

## 決策

- 首頁內容由 `home-layout` fixture 描述：一串攤平的 section 物件 `{ type, id, ...欄位 }`，type 包含 `hero-carousel`、`quick-entry`、`promo-banner`、`product-rail`。
- 真站的「今日大牌」四宮格緊鄰主視覺輪播，因此併入 `hero-carousel` 的 `todayBrand` 欄位，而非獨立 section（實作時調整）。
- 連結以 `AppLink { commands, queryParams }` 描述，資料指向站內路由而非寫死網址。
- `HomeSection` 使用 discriminated union，首頁元件以 `@switch (section.type)` 對應各 section 元件。
- 首屏以下的 section 以 `@defer (on viewport)` 延遲載入；`product-rail` 自行以 `getProductsByIds` 取商品，因此延遲的區塊在捲動到之前不會發出請求。
- 首頁最下方新增 `product-feed`（無限捲動商品牆），由人類觀察真站互動後提出，見第 3b 步。

## 影響

- 好處：新增區塊類型只需新增元件與 union 成員；版面調整只動資料；型別安全。
- 代價：未知 type 需有 fallback。目前實作是一律略過，開發模式下另以 `console.error` 報錯；正式環境不會記錄，日後應改送 `LOG_SINK`。
