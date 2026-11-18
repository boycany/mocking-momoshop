# 0002. 搜尋條件以 URL query params 為唯一來源

- 狀態：已採用
- 日期：2026-11-18

## 背景

搜尋頁有 keyword、排序、分頁、篩選等條件。如果放在 store，重新整理、上一頁、分享連結時都要另外做同步，容易出現 URL 與畫面不一致。

## 決策

- 搜尋條件只存在 URL：`/search?keyword=&sort=&page=`。
- 透過 `withComponentInputBinding()` 將 query params 綁定為元件 `input()`，再以 `computed()` / `resource` 衍生結果。
- 變更條件一律透過 `router.navigate(..., { queryParamsHandling: 'merge' })`。

## 影響

- 好處：單一來源，瀏覽器歷史紀錄天然正確，可分享、可書籤。
- 代價：條件需序列化為字串，型別轉換集中在頁面元件的 input transform 處理。
