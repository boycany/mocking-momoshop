# 0007. 資料邊界用 Observable，元件狀態用 signal

- 狀態：已採用（取代原計劃的 Promise 方案）
- 日期：2026-11-18

## 背景

原計劃讓 `CatalogApi` 回傳 Promise，頁面用 `resource()` 取資料。人類在實作前提問：「用 RxJS 會不會比較方便，比較容易做到更多元的功能？」重新評估後改變決策。

## 決策

- `CatalogApi` 所有方法回傳 **cold Observable**。
- 頁面以 `rxResource()` 取資料，取得 `isLoading` / `error` / `value` 等 signal。
- 元件內部狀態與 store 一律使用 signal。
- RxJS 與 signal 只在頁面層轉換（`rxResource()`、`toSignal()`、`toObservable()`），不在 shared/ui 或 store 內混用。

## 理由

1. Angular `HttpClient` 原生回傳 Observable，日後 `HttpCatalogApi` 可直接回傳 `http.get()`，介面不變。
2. 搜尋建議需要 `debounceTime` / `distinctUntilChanged` / `switchMap`（取消舊請求）。
3. 日後的重試（`retry`）、輪詢（限時搶購庫存、倒數）、多來源合併（`combineLatest`）都更自然。
4. mock 可用 `timer` + `throwError` 簡潔地模擬延遲與錯誤。

## 影響

- 好處：邊界與正式 HTTP 實作一致；非同步組合能力強；退訂即取消請求。
- 代價：專案同時存在兩種反應式模型，需在 `AGENTS.md` 明確劃分使用範圍。
