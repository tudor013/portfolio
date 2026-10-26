# CLAUDE.md — Portofoliu personal (CV / competențe)

## Scopul site-ului
Un angajator care stă 30–60 de secunde pe site trebuie să înțeleagă:
1. **Cine sunt și ce rol caut** (o propoziție, deasupra fold-ului).
2. **De ce merit poziția** — dovezi, nu adjective: proiecte cu problemă → rolul meu → proces → rezultat măsurabil.
3. **Cum mă contactează / descarcă CV-ul** — maximum un click de oriunde.

Competențele sunt grupate în 3 categorii:
- `design` — UI/UX & Graphic Design
- `dev` — Software Development
- `data` — Data Science

## Stack (nu schimba fără să întrebi)
- **Astro** (site static, rapid, ușor de citit pentru un începător)
- **TypeScript** doar acolo unde ajută; fără framework UI (React etc.) decât dacă e nevoie reală
- **CSS simplu cu variabile** (`src/styles/tokens.css`), fără Tailwind — codul trebuie să fie ușor de înțeles
- **GSAP + ScrollTrigger** pentru video scrubbing (GSAP e gratuit, inclusiv pluginurile)
- **Content Collections** Astro pentru proiecte: un fișier `.md` per proiect în `src/content/projects/`
- **Hosting:** Cloudflare Workers (static assets), deploy cu `wrangler`

## Structura de foldere (țintă)
```
src/
  content/projects/      # un .md per proiect, cu frontmatter (category, role, stack, results…)
  components/            # Hero, SkillCategory, ProjectCard, ScrollVideo, Contact…
  layouts/               # BaseLayout.astro
  pages/                 # index.astro, projects/[slug].astro, cv.astro
  scripts/scroll-video.ts# logica video scrubbing (o singură sursă)
  styles/                # tokens.css, global.css
public/
  cv/                    # CV-ul PDF descărcabil
  media/scrub/           # cadre/video pentru fundaluri animate
docs/
  ARHITECTURA.md         # explicația codului, actualizată pe parcurs
```

## Reguli de lucru
- **Explică pe parcurs.** După fiecare fază, actualizează `docs/ARHITECTURA.md`: ce fișier face ce, cum curg datele, de ce am ales așa. Scris în română, pentru un începător. Din el se generează la final PDF-ul explicativ.
- **Cod și comentarii în engleză** (repo-ul va fi văzut de angajatori); comentariile explică *de ce*, nu *ce*.
- **Pași mici.** O fază = un commit sau câteva commituri clare. Nu începe faza următoare fără să-mi arăți rezultatul.
- **Nu inventa conținut.** Unde lipsesc texte reale, pune placeholder vizibil `TODO(conținut): …`.
- **Folosește skill-ul `frontend-design`** pentru orice decizie vizuală (tipografie, layout, culori, componente).

## Limba
- **Interfața și conținutul sunt în engleză.** Tudor are IELTS C1; engleza deschide și piața
  internațională, și pe cea locală (recrutorii tech din București citesc engleză), pe când româna
  o închide pe prima. `<html lang="en">` — un cititor de ecran își ia pronunția de acolo.
- `docs/ARHITECTURA.md` rămâne în **română**, fiind explicația pentru Tudor.
- Marcajele `TODO(conținut)` rămân în română: sunt note către Tudor, nu conținut de site.
- Subsetul de font `latin-ext` se păstrează chiar dacă site-ul e în engleză — se descarcă doar
  dacă pagina conține caractere din el, deci nu costă nimic, și acoperă numele românești.

## Date personale — nu negociabil
- **Numărul de telefon nu ajunge niciodată pe site, în repo sau în CV-ul descărcabil.** Repo-ul și
  site-ul sunt publice; un număr publicat e indexat de Google și recoltat de boți în câteva săptămâni.
- Contactul public = **email + LinkedIn**, atât. Versiunea de CV cu telefon se trimite direct la
  aplicare, nu se găzduiește.
- Regula se aplică și când numărul apare într-un fișier sursă (CV, document trimis în chat):
  se omite la generare, nu se copiază.

## Video scrubbing — DOAR pentru fundaluri decorative
Video scrubbing = animația de fundal avansează/derulează înapoi în funcție de scroll. Se aplică **numai** elementelor de fundal ale paginii, **niciodată** proiectelor prezentate (acelea rămân exact cum sunt).

Implementare (componenta `ScrollVideo` + `scripts/scroll-video.ts`):
- **Metoda implicită: secvență de imagini pe `<canvas>`** (cadre WebP/AVIF), cel mai fluid și sigur pe Safari/iOS.
- **Alternativă: `<video>` muted + playsinline** codat cu keyframe la fiecare cadru (`ffmpeg … -g 1`), altfel derularea sacadează.
- Scroll legat de cadru prin GSAP ScrollTrigger (`scrub: true`).
- **`prefers-reduced-motion`** → se afișează doar o imagine statică (poster).
- Pe mobil: mai puține cadre și rezoluție mai mică.
- Primul cadru/poster se încarcă imediat (pentru LCP); restul cadrelor lazy.
- Buget: fiecare fișier < 25 MiB (limita Cloudflare per fișier), ideal tot fundalul animat < 5–8 MB. Dacă trece, mutăm media pe Cloudflare R2.
- Textul de deasupra trebuie să rămână lizibil (contrast verificat, overlay dacă e nevoie).

## Calitate (verifică înainte de fiecare deploy)
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95 pe mobil
- Navigare completă din tastatură, `alt` pe toate imaginile, contrast WCAG AA
- Meta tags + Open Graph (preview frumos când linkul e trimis pe LinkedIn)
- Site funcțional și fără JavaScript (fără animații, dar cu tot conținutul)
