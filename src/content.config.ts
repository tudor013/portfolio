import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The three skill categories the site is organised around. `dev` is the primary
 * one — Tudor is positioning as a software developer — and the order here is the
 * order sections appear on the page.
 */
export const CATEGORIES = ['dev', 'design', 'data'] as const;

/** Human-readable headings, kept next to the ids so they cannot drift apart. */
export const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  dev: 'Software Development',
  design: 'UI/UX & Graphic Design',
  data: 'Data Science',
};

/** Short names for navigation, where the full heading would crowd the bar. */
export const CATEGORY_SHORT: Record<(typeof CATEGORIES)[number], string> = {
  dev: 'Software',
  design: 'Design',
  data: 'Data',
};

/** The URL segment each category lives at, kept here so links cannot drift. */
export const CATEGORY_SLUGS: Record<(typeof CATEGORIES)[number], string> = {
  dev: 'software',
  design: 'design',
  data: 'data',
};

/** One line per category, in Tudor's own words. Used on the landing page and
 *  at the top of each category page, so the two cannot disagree. */
export const CATEGORY_BLURBS: Record<(typeof CATEGORIES)[number], string> = {
  dev: 'Mostly C and C++, C#, Python, MariaDB and Oracle SQL, with AI tooling in the loop. I build software that is pleasant to use and solves a problem someone actually has.',
  design: 'Brand design, UI/UX and interface work in Figma, Illustrator, Photoshop and Spline, with motion in Premiere Pro and DaVinci Resolve. I design interfaces around the person using them.',
  data: 'Inferential and macroeconomic statistics, and the economic cybernetics I study: resource allocation, correlation between series, and models whose results have to survive being checked.',
};

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),

  // Every field an employer needs to judge the work is required. A project with
  // a missing `role` or `results` fails the build instead of shipping as a
  // vague card nobody can evaluate.
  schema: ({ image }) =>
    z.object({
    title: z.string(),
    category: z.enum(CATEGORIES),
    year: z.number().int().min(2000).max(2100),

    /** What Tudor personally did — not what the team delivered. */
    role: z.string(),
    stack: z.array(z.string()).min(1),

    /** The kind of work in a few words, for the ledger on the landing page. */
    kind: z.string(),

    /** The problem, in one or two sentences. */
    problem: z.string(),

    /** A concrete outcome: a number, a decision it drove, feedback received. */
    results: z.string(),

    /**
     * Screenshots of the finished product, shown on the case study page as
     * "Inside the …". Taken from the live site, with nothing personal in
     * them (no account, no customer data).
     */
    screens: z
      .array(
        z.object({
          src: image(),
          alt: z.string(),
          caption: z.string(),
        }),
      )
      .default([]),

    /** A still of the work itself, shown beside its row in the ledger. */
    cover: z
      .object({
        src: image(),
        alt: z.string(),
      })
      .optional(),

    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        }),
      )
      .default([]),

    /** Lower numbers first within a category; ties fall back to newest year. */
    order: z.number().int().default(100),

    /** Keep an unfinished project out of the build without deleting the file. */
    draft: z.boolean().default(false),

    /**
     * Interactive 3D scenes shown on the case study page.
     *
     * `poster` is required and `url` is not: a still always renders, and the
     * live scene is an optional upgrade. `url` must be a PUBLISHED Spline
     * link (https://my.spline.design/...) — an app.spline.design/file/... link
     * is the editor, and asks the viewer to sign in.
     */
    scenes: z
      .array(
        z.object({
          poster: image(),
          alt: z.string(),
          title: z.string(),
          url: z.url().optional(),
          /**
           * The width, in CSS pixels, the live scene is laid out at before it
           * is scaled down into its frame. A scene framed for a full browser
           * window shows only a corner when it gets a 700px iframe; laying it
           * out at its own width and shrinking the result shows all of it.
           */
          viewport: z.number().int().min(320).optional(),
          /**
           * The scene animates with the wheel, so the page must stand still
           * while the pointer is over it, or the page scrolls away instead.
           */
          holdScroll: z.boolean().default(false),
        }),
      )
      .default([]),
    }),
});

export const collections = { projects };
