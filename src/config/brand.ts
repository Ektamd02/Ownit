/**
 * Brand settings — the single place to change the product name, tagline and palette.
 *
 * The palette is applied to the page as CSS custom properties (see applyBrandTheme),
 * so every component picks up changes made here automatically.
 *
 * Hex values approximate the named colours from the visual reference.
 * Adjust them here if the reference uses slightly different shades.
 */
export const brand = {
  name: 'Ownit',
  tagline: 'I’ve got you.',
  /** Shown in the browser tab after the name. */
  titleSuffix: 'resume and LinkedIn helper',

  palette: {
    floralWhite: '#FFFAF0', // main background
    onyx: '#141414', // primary text (near-black)
    lemonLime: '#E3FF00', // primary actions
    lemonLimeHover: '#D2EC00',
    wisteria: '#C9A0DC', // restrained accents
    lilac: '#C8A2C8',
    peachFuzz: '#FFBE98',
    jordyBlue: '#8AB9F1',
  },
} as const;

/** Writes the palette and the derived UI tokens onto :root. */
export function applyBrandTheme(root: HTMLElement = document.documentElement) {
  const p = brand.palette;
  const tokens: Record<string, string> = {
    '--color-bg': p.floralWhite,
    '--color-surface': '#FFFFFF',
    '--color-text': p.onyx,
    '--color-text-muted': '#55524C', // 7.4:1 on Floral White
    '--color-border': '#E6E0D4',
    '--color-border-strong': '#C9C2B4',
    '--color-primary': p.lemonLime,
    '--color-primary-hover': p.lemonLimeHover,
    '--color-on-primary': p.onyx, // ~17:1 on Lemon Lime
    '--color-accent-wisteria': p.wisteria,
    '--color-accent-lilac': p.lilac,
    '--color-accent-peach': p.peachFuzz,
    '--color-accent-blue': p.jordyBlue,
    '--color-wisteria-soft': mix(p.wisteria, p.floralWhite, 0.22),
    '--color-peach-soft': mix(p.peachFuzz, p.floralWhite, 0.3),
    '--color-blue-soft': mix(p.jordyBlue, p.floralWhite, 0.22),
    '--color-lime-soft': mix(p.lemonLime, p.floralWhite, 0.25),
    '--color-focus': p.onyx,
  };
  for (const [key, value] of Object.entries(tokens)) root.style.setProperty(key, value);
  document.title = `${brand.name} — ${brand.titleSuffix}`;
}

/** Blend `color` over `base` at the given strength (0–1). */
function mix(color: string, base: string, strength: number) {
  const a = hexToRgb(color);
  const b = hexToRgb(base);
  const c = a.map((v, i) => Math.round(v * strength + b[i] * (1 - strength)));
  return `rgb(${c.join(', ')})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
