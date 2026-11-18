# 0003. 以 CatalogApi 抽象作為資料邊界

- 狀態：已採用
- 日期：2026-11-18

## 背景

題目要求純前端、無真實 API 呼叫，但正式環境終究要接後端。如果頁面直接 import mock JSON，日後替換時要改動所有 feature。

## 決策

- 定義 `abstract class CatalogApi`，作為 DI token。
- 本專案提供 `MockCatalogApi`：讀取 `src/mocks/fixtures`，模擬 200–400ms 延遲，並支援以 query flag（例如 `?mockError=1`）觸發錯誤。
- 在 `app.config.ts` 以 `{ provide: CatalogApi, useClass: MockCatalogApi }` 注入。
- `AGENTS.md` 規定 feature 不得直接 import fixtures。

## 影響

- 好處：接後端時只要新增 `HttpCatalogApi` 並換 provider；loading / error 狀態可被實際驗證。
- 代價：多一層抽象，對兩小時的專案略有成本，但換來的可維護性值得。
