# 0001. Angular Material 只取行為，不取外觀

- 狀態：已採用
- 日期：2026-11-18

## 背景

考核重點之一是「實作結果與真實網站的差異」。momo 的視覺語言是高飽和桃紅、密集資訊與大量促銷標籤，跟 Material Design 的留白與陰影風格差很多。但 Material / CDK 提供的無障礙、鍵盤操作、overlay 定位等行為，自己重寫並不划算。

## 決策

- 使用 Material / CDK 提供行為：sidenav（購物車抽屜）、menu、snackbar、badge、autocomplete（搜尋建議）、paginator。
- 以 Material 3 system tokens 將主色調整為接近 momo 桃紅，讓上述元件不至於突兀。
- 品牌辨識度高的區塊（header、主視覺、分類 nav、商品卡、促銷標籤）自寫 SCSS。

## 影響

- 好處：保留無障礙與互動品質，視覺仍能貼近真站。
- 代價：兩套樣式來源並存，需要在 `AGENTS.md` 明確規範哪些區塊用哪一套。
