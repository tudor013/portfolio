---
title: 'Pergament AI demo site'
category: dev
year: 2026
role: >-
  Built a proof-of-concept site presenting AI agents, during the internship at
  Soft Tehnica: the front end in React, with a 3D statue in three.js that
  moves as the page scrolls.
stack:
  - React
  - Vite
  - 'three.js (React Three Fiber)'
  - GSAP
  - 'React Router'
kind: 'Proof of concept'
problem: >-
  The product idea was AI avatars of four Romanian rulers, from Tudor
  Vladimirescu to Vlad Țepeș, offered to museums, educational platforms and
  companies. It needed a site that could present the idea to those buyers.
results: >-
  It did its job as a proof of concept. From the demo, the team concluded
  where AI is worth using further and where it is not.
order: 40
draft: false
links:
  - label: 'Source on GitHub'
    url: 'https://github.com/tudor013/Demo-Website-Care-Prezinta-Agenti-AI'
---

## What the site does

The site presents the product. The avatars themselves are not part of it.

- **The home page is seven full-screen chapters** that snap into place as you
  scroll: an opening, a statement, one chapter for each ruler, and a closing
  call to action.
- **A 3D statue rises** with the opening chapter and sinks away as the reader
  moves on. Its position follows the scroll, read once per frame.
- **The background changes with the chapter.** Each ruler has his own colour
  and light, drawn on a canvas behind the text.
- **Each ruler has a page** with his period and what his avatar would cover.
  A pricing page shows the three plans offered to museums and companies.

## How it is built

React with React Router for the pages. The statue is a glTF model rendered
with React Three Fiber. GSAP animates the text as each chapter arrives.
