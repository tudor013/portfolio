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

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),

  // Every field an employer needs to judge the work is required. A project with
  // a missing `role` or `results` fails the build instead of shipping as a
  // vague card nobody can evaluate.
  schema: z.object({
    title: z.string(),
    category: z.enum(CATEGORIES),
    year: z.number().int().min(2000).max(2100),

    /** What Tudor personally did — not what the team delivered. */
    role: z.string(),
    stack: z.array(z.string()).min(1),

    /** The problem, in one or two sentences. */
    problem: z.string(),

    /** A concrete outcome: a number, a decision it drove, feedback received. */
    results: z.string(),

    cover: z
      .object({
        src: z.string(),
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
  }),
});

export const collections = { projects };
