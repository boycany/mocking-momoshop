/** Mirrors the real site's rounded-down sales copy, e.g. "總銷量>5萬", "總銷量>8,000". */
export function soldCountLabel(count: number): string {
  if (count >= 10_000) {
    const tenThousands = Math.floor(count / 1_000) / 10;
    return `總銷量>${Number.isInteger(tenThousands) ? tenThousands : tenThousands.toFixed(1)}萬`;
  }
  if (count >= 1_000) {
    return `總銷量>${(Math.floor(count / 1_000) * 1_000).toLocaleString('en-US')}`;
  }
  if (count >= 100) {
    return `總銷量>${Math.floor(count / 100) * 100}`;
  }
  return `總銷量 ${count}`;
}
