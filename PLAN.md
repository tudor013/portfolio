# PLAN.md — Fazele construirii portofoliului

Fiecare fază are: **ce facem**, **skill/unealtă folosită**, **prompt de lipit în Claude Code**, **gata când…**.
Ține `CLAUDE.md` în rădăcina proiectului — Claude Code îl citește automat la fiecare sesiune.

---

## Faza 0 — Conținut și poziționare (în Claude chat, nu în Claude Code)
**Ce facem:** strângem materia primă: rolul țintă, propoziția de prezentare, lista de proiecte pe cele 3 categorii, CV-ul.
**Unealtă:** conversația din Claude (fără cod).
**De pregătit, per proiect:**
- titlu, categorie (`design` / `dev` / `data`), an
- problema în 1–2 propoziții
- rolul TĂU exact (ce ai făcut tu, nu echipa)
- tool-uri / stack
- rezultat concret (cifră, feedback, impact) — chiar și mic
- imagini / linkuri (Figma, GitHub, notebook, demo)
**Gata când:** ai minim 2 proiecte bune pe categorie și o propoziție-headline clară.

---

## Faza 1 — Direcție vizuală
**Skill:** `frontend-design`
**Prompt:**
> Citește CLAUDE.md. Folosind skill-ul frontend-design, propune 2 direcții vizuale pentru portofoliu (tipografie, paletă, ritm al layout-ului, stil al fundalurilor animate). Pentru fiecare: un moodboard descris în cuvinte și tokens CSS. Nu scrie încă pagini. Explică alegerile.
**Gata când:** alegi o direcție → se creează `src/styles/tokens.css`.

---

## Faza 2 — Scheletul proiectului
**Prompt:**
> Inițializează un proiect Astro + TypeScript conform structurii din CLAUDE.md. Configurează Content Collection `projects` cu schema: title, category (design|dev|data), year, role, stack[], problem, results, cover, links. Adaugă 1 proiect exemplu per categorie cu TODO-uri. Creează docs/ARHITECTURA.md cu prima secțiune: cum e organizat proiectul și ce face fiecare folder.
**Gata când:** `npm run dev` pornește, iar paginile de proiect se generează din fișierele `.md`.

---

## Faza 3 — Paginile și componentele
**Skill:** `frontend-design`
**Ordine:**
1. `Hero` — cine sunt + rol căutat + 2 butoane (Vezi proiecte / Descarcă CV)
2. `SkillCategory` ×3 — fiecare categorie cu competențe + proiectele ei
3. `ProjectCard` + pagina de proiect (`projects/[slug].astro`) în format studiu de caz
4. `Contact` + link CV + LinkedIn / GitHub
**Prompt (pe rând, câte o componentă):**
> Construiește componenta Hero conform CLAUDE.md și direcției din tokens.css. Mobile-first. Apoi actualizează docs/ARHITECTURA.md cu ce face componenta și de unde își ia datele.
**Gata când:** tot site-ul e navigabil, cu conținut real în loc de TODO-uri.

---

## Faza 4 — Fundaluri animate cu video scrubbing
**Unealtă:** ffmpeg (Claude Code îl rulează) + GSAP ScrollTrigger
**Prompt:**
> Implementează componenta ScrollVideo conform secțiunii „Video scrubbing” din CLAUDE.md. Pornește de la clipul din `raw/bg-hero.mp4`: extrage cadrele ca WebP (desktop și mobil, rezoluții diferite), scrie scroll-video.ts cu canvas + ScrollTrigger, fallback static pentru prefers-reduced-motion. Raportează dimensiunea totală a cadrelor. Explică în ARHITECTURA.md cum funcționează legătura scroll → cadru.
**Gata când:** animația e fluidă pe telefon, nu încetinește încărcarea, iar cu reduced-motion apare doar imaginea statică.

---

## Faza 5 — Testare și calitate
**Skill:** `webapp-testing` (Playwright) + Lighthouse
**Prompt:**
> Folosind skill-ul webapp-testing, verifică: toate linkurile, navigarea din tastatură, afișarea la 375px / 768px / 1440px, descărcarea CV-ului. Rulează Lighthouse pe mobil și repară tot ce e sub pragurile din CLAUDE.md.
**Gata când:** pragurile din CLAUDE.md sunt atinse.

---

## Faza 6 — Deploy pe Cloudflare
**Prompt:**
> Configurează deploy pe Cloudflare Workers cu static assets (wrangler.jsonc), conectat la repo-ul GitHub pentru deploy automat la fiecare push pe main. Explică-mi pașii pe care trebuie să-i fac eu în dashboard (cont, domeniu). Adaugă în ARHITECTURA.md secțiunea „Cum ajunge codul online”.
**Gata când:** site-ul e live pe domeniul tău, cu HTTPS.

---

## Faza 7 — PDF-ul explicativ al codului
**Skill:** `pdf`
**Cum:** `docs/ARHITECTURA.md` a crescut la fiecare fază. La final, îl aduci în Claude chat (sau rulezi skill-ul pdf în Claude Code) și se generează un PDF cu: harta fișierelor, fluxul datelor (de la `.md` la pagină), cum funcționează video scrubbing-ul, cum se face deploy, și **„Cum adaug un proiect nou”**.

---

## Bonus — Skill propriu „adaugă-proiect”
**Skill:** `skill-creator`
După ce site-ul e gata, creăm un skill care, primind descrierea unui proiect nou, scrie fișierul `.md`, optimizează imaginile și verifică build-ul — ca portofoliul să rămână ușor de actualizat.
