# 0001. Angular Material 只取行為，不取外觀

- 狀態：已採用
- 日期：2026-11-18

## 背景

考核重點之一是「實作結果與真實網站的差異」。momo 的視覺語言是高飽和桃紅、密集資訊與大量促銷標籤，跟 Material Design 的留白與陰影風格差很多。但 Material / CDK 提供的無障礙、鍵盤操作、overlay 定位等行為，自己重寫並不划算。

## 決策

- 使用 Material / CDK 提供行為：sidenav（購物車抽屜）、menu、snackbar、badge、autocomplete（搜尋建議）、paginator。
- 以 Material 3 system tokens 將主色調整為接近 momo 桃紅，讓上述元件不至於突兀。
- 品牌辨識度高的區塊（header、主視覺、分類 nav、商品卡、促銷標籤）自寫 SCSS。

## 實作結果（實作後補記）

- 實際只用到 `MatSnackBar`（加入購物車、結帳不在範圍內的提示）與 M3 主題 tokens（`mat.theme-overrides` 固定主色為 `#e4007f`）。
- 原列的 paginator 刻意不用：搜尋頁改用自製數字頁碼，因為 Material paginator 的「1–20 of 60」樣式與真站差異太大。
- 原規劃的購物車抽屜（sidenav）改為 `/cart` 購物清單頁，由右側浮動欄與工具列進入。
- menu、badge、autocomplete 因相關功能未實作而未使用。

## 影響

- 好處：保留無障礙與互動品質，視覺仍能貼近真站。
- 代價：兩套樣式來源並存，需要在 `AGENTS.md` 明確規範哪些區塊用哪一套。
