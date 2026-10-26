# portfolio

Personal portfolio and CV site. Static, no framework runtime, deployed on every push to `main`.

Skills are presented in three categories:

- **design** — UI/UX & graphic design
- **dev** — software development
- **data** — data science

## Stack

| Layer | Choice | Why |
|---|---|---|
| Site | [Astro](https://astro.build) (static output) | Ships zero JavaScript by default; pages are plain files that are easy to read. |
| Types | TypeScript, where it earns its place | — |
| Styles | Plain CSS with custom properties | No build-time class soup; the stylesheet is readable on its own. |
| Content | Astro content collections | One Markdown file per project, validated against a schema. |
| Motion | GSAP ScrollTrigger | Scroll-linked background animation only. |
| Hosting | Cloudflare | Git-connected, automatic deploy, free TLS. |

## Running it locally

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # production build into dist/
npm run preview  # serve the production build
```

## Layout

```
src/
  content/projects/   one .md per project (title, category, role, stack, results…)
  components/         Hero, SkillCategory, ProjectCard, ScrollVideo, Contact
  layouts/            BaseLayout.astro
  pages/              index.astro, projects/[slug].astro, cv.astro
  scripts/            scroll-video.ts — the scroll-to-frame logic
  styles/             tokens.css, global.css
public/
  cv/                 downloadable CV
  media/scrub/        frames for the animated background
docs/
  ARHITECTURA.md      how the code works, written up as the site is built
```

## Adding a project

Drop a Markdown file into `src/content/projects/`. The schema in
`src/content/config.ts` defines the required frontmatter; the build fails if a
field is missing, so a half-filled project cannot ship silently.

## Notes

`CLAUDE.md` and `PLAN.md` hold the brief and the build plan.
`docs/ARHITECTURA.md` is the written explanation of the code.
