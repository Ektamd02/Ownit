/**
 * Brand settings — the single place to change the product name, tagline and palette.
 *
 * Every colour in the app comes from here. Palette values were sampled from the
 * brand reference (Onyx, Wisteria, Lemon Lime, Jordy Blue, Lilac, Peach Fuzz,
 * Floral White). Tints, borders and greys are blends of these with white, so no
 * new hues are introduced. applyBrandTheme() writes them onto :root as CSS variables.
 */
export const brand = {
  name: 'Ownit',
  tagline: 'I’ve got you.',
  /** Shown in the browser tab after the name. */
  titleSuffix: 'resume and LinkedIn helper',

  palette: {
    onyx: '#000000', // primary text
    wisteria: '#D597EC',
    lemonLime: '#EAFE5F', // primary actions
    jordyBlue: '#9BC3FF',
    lilac: '#F5E8FC',
    peachFuzz: '#FFBE98',
    floralWhite: '#FAF7EE', // quiet wells and surfaces
    white: '#FFFFFF', // main background
  },

  /** Functional colour for errors only (not part of the decorative palette). */
  status: {
    error: '#B3261E',
  },
} as const;

/** Writes the palette and the derived UI tokens onto :root. */
export function applyBrandTheme(root: HTMLElement = document.documentElement) {
  const p = brand.palette;
  const ink = (strength: number) => mix(p.onyx, p.white, strength);
  const tint = (c: string, strength: number) => mix(c, p.white, strength);

  const tokens: Record<string, string> = {
    // Base
    '--color-bg': p.white,
    '--color-surface': p.white,
    '--color-well': p.floralWhite,
    '--color-text': p.onyx,
    '--color-text-muted': ink(0.62), // ≈ #616161, 6.2:1 on white
    '--color-text-subtle': ink(0.55), // placeholders, ≈ 4.7:1
    '--color-border': ink(0.09),
    '--color-border-strong': ink(0.2),
    '--color-focus': p.onyx,

    // Actions
    '--color-primary': p.lemonLime,
    '--color-primary-hover': mix(p.lemonLime, p.onyx, 0.92),
    '--color-on-primary': p.onyx, // ≈ 19:1 on Lemon Lime

    // Accents
    '--color-wisteria': p.wisteria,
    '--color-lilac': p.lilac,
    '--color-peach': p.peachFuzz,
    '--color-blue': p.jordyBlue,
    '--color-lime': p.lemonLime,
    '--color-floral': p.floralWhite,
    '--color-wisteria-soft': tint(p.wisteria, 0.16),
    '--color-wisteria-line': tint(p.wisteria, 0.5),
    '--color-peach-soft': tint(p.peachFuzz, 0.2),
    '--color-peach-line': tint(p.peachFuzz, 0.55),
    '--color-blue-soft': tint(p.jordyBlue, 0.16),
    '--color-blue-line': tint(p.jordyBlue, 0.5),
    '--color-lime-soft': tint(p.lemonLime, 0.3),

    // Status
    '--color-error': brand.status.error,
    '--color-error-soft': tint(brand.status.error, 0.06),
    '--color-error-line': tint(brand.status.error, 0.3),

    // Channels for rgba() in shadows and corner gradients
    '--rgb-onyx': channels(p.onyx),
    '--rgb-white': channels(p.white),
    '--rgb-wisteria': channels(p.wisteria),
    '--rgb-peach': channels(p.peachFuzz),
    '--rgb-blue': channels(p.jordyBlue),
    '--rgb-lime': channels(p.lemonLime),
    '--rgb-lilac': channels(p.lilac),
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

function channels(hex: string) {
  return hexToRgb(hex).join(', ');
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
