export interface PlaceholderOptions {
  readonly label: string;
  readonly sublabel?: string;
  /** HSL hue (0-360) used to give each category its own colour family. */
  readonly hue: number;
  readonly width?: number;
  readonly height?: number;
  /** Shifts lightness so several images of the same product look distinct. */
  readonly variant?: number;
}

const escapeXml = (text: string): string =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * Builds a local SVG data URI instead of loading external images. See ADR 0005.
 */
export function placeholderImage({
  label,
  sublabel,
  hue,
  width = 400,
  height = 400,
  variant = 0,
}: PlaceholderOptions): string {
  const lightness = 88 - (variant % 3) * 8;
  const fontSize = Math.round(Math.min(width, height) / 12);
  const lines = [label, sublabel].filter((line): line is string => Boolean(line));
  const text = lines
    .map((line, index) => {
      const y = height / 2 + (index - (lines.length - 1) / 2) * fontSize * 1.4;
      const size = index === 0 ? fontSize : Math.round(fontSize * 0.75);
      return `<text x="50%" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="middle" fill="hsl(${hue} 45% 28%)" font-family="sans-serif">${escapeXml(line)}</text>`;
    })
    .join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="hsl(${hue} 70% ${lightness}%)"/>` +
    `<circle cx="${width * 0.82}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.12}" fill="hsl(${hue} 70% ${lightness - 10}%)"/>` +
    text +
    `</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
