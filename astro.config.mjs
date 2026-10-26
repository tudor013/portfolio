// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Unicode ranges copied from Fontsource's own stylesheets, so each subset is
// downloaded only when the page actually contains characters from it.
// Romanian's comma-below letters (ș U+0219, ț U+021B, ă U+0103) live in
// latin-ext, which is why that subset is not optional here.
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

const FONT_DIR = './src/assets/fonts';

/**
 * One @font-face per weight per subset. The tuple casts are what the Variant
 * type requires: `src` and `unicodeRange` are non-empty tuples, which a plain
 * array literal widens away from.
 *
 * @param {400 | 500 | 600} weight
 * @param {'latin' | 'latin-ext'} subset
 * @param {string} range
 */
const sansVariant = (weight, subset, range) => ({
  weight,
  style: /** @type {const} */ ('normal'),
  src: /** @type {[string]} */ ([
    `${FONT_DIR}/ibm-plex-sans-${subset}-${weight}-normal.woff2`,
  ]),
  unicodeRange: /** @type {[string]} */ ([range]),
});

export default defineConfig({
  // Static output: every page is a plain HTML file, so the site works with
  // JavaScript disabled and can be served by any host for free.
  output: 'static',

  // The deployed origin. Astro builds canonical and Open Graph URLs from
  // this, so a wrong value silently produces broken link previews rather
  // than a build error.
  site: 'https://portfolio.tudorifrim606.workers.dev',

  // Fonts are committed to the repo rather than fetched from Google at build
  // time. The build then has no network dependency, so it cannot fail or stall
  // because a third-party font host is slow — and the browser makes no
  // cross-origin request, which keeps the Performance budget intact.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-sans',
      options: {
        variants: [
          sansVariant(400, 'latin', LATIN),
          sansVariant(400, 'latin-ext', LATIN_EXT),
          sansVariant(500, 'latin', LATIN),
          sansVariant(500, 'latin-ext', LATIN_EXT),
          sansVariant(600, 'latin', LATIN),
          sansVariant(600, 'latin-ext', LATIN_EXT),
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-mono',
      options: {
        variants: [
          {
            weight: /** @type {const} */ (400),
            style: /** @type {const} */ ('normal'),
            src: /** @type {[string]} */ ([
              `${FONT_DIR}/ibm-plex-mono-latin-400-normal.woff2`,
            ]),
            unicodeRange: /** @type {[string]} */ ([LATIN]),
          },
          {
            weight: /** @type {const} */ (400),
            style: /** @type {const} */ ('normal'),
            src: /** @type {[string]} */ ([
              `${FONT_DIR}/ibm-plex-mono-latin-ext-400-normal.woff2`,
            ]),
            unicodeRange: /** @type {[string]} */ ([LATIN_EXT]),
          },
        ],
      },
    },
  ],
});
