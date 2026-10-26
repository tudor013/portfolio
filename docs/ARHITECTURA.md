# Cum funcționează codul

Document scris pe parcurs, pentru cineva care începe. Din el se generează la
final PDF-ul explicativ (Faza 8). Fiecare fază adaugă o secțiune aici.

---

## Faza 1 — Scheletul

### Ce face Astro, pe scurt

Astro ia fișierele din `src/` și, **la build**, le transformă în fișiere HTML
gata făcute, pe care le pune în `dist/`. Nu există un server care calculează
pagina când o cere vizitatorul: pagina e deja scrisă pe disc.

Consecința practică: site-ul e foarte rapid, poate fi găzduit gratuit oriunde,
și funcționează chiar dacă vizitatorul are JavaScript dezactivat. Am verificat
că build-ul nostru nu trimite **niciun** fișier `.js` către browser.

### Harta fișierelor

| Fișier | Ce face |
|---|---|
| `astro.config.mjs` | Setările Astro. `output: 'static'` = generează HTML, nu server. |
| `src/content.config.ts` | **Regulile** pentru proiecte: ce câmpuri trebuie să aibă fiecare. |
| `src/content/projects/*.md` | Un fișier = un proiect. Aici scrii conținutul. |
| `src/layouts/BaseLayout.astro` | Scheletul comun oricărei pagini: `<head>`, meta tags, skip link. |
| `src/pages/index.astro` | Pagina principală. |
| `src/pages/projects/[...slug].astro` | **Un singur fișier** care produce câte o pagină pentru fiecare proiect. |
| `src/styles/tokens.css` | Culori, fonturi, spațieri — ca variabile, într-un singur loc. |
| `src/styles/global.css` | Stilurile de bază care se aplică peste tot. |

### Cum curg datele: de la un `.md` la o pagină

```
src/content/projects/proiect.md
          │
          │  1. glob() din src/content.config.ts găsește fișierul
          ▼
   schema Zod verifică frontmatter-ul
          │     ├─ lipsește `role`?  → BUILD EȘUEAZĂ
          │     └─ `category: 'xyz'`? → BUILD EȘUEAZĂ
          ▼
   2. getCollection('projects') întoarce datele, deja validate
          │
          ├──► index.astro          → le grupează pe 3 categorii, face lista
          │
          └──► [...slug].astro      → getStaticPaths() cere o pagină per proiect
                     │
                     ▼
            dist/projects/proiect/index.html
```

**Partea importantă:** schema din `src/content.config.ts` nu e decorativă. Dacă
un proiect n-are `results`, **build-ul se oprește cu eroare**. Asta e intenționat
— un proiect pe jumătate completat nu poate ajunge pe site fără să observi.

### De ce `[...slug].astro` are paranteze pătrate în nume

Numele în paranteze pătrate îi spune Astro: „acesta nu e o pagină, e un
**șablon** de pagină". Funcția `getStaticPaths()` din el întoarce lista
proiectelor, iar Astro execută șablonul o dată pentru fiecare. Trei proiecte →
trei fișiere HTML, dintr-un singur fișier sursă.

### Două lucruri reparate la Faza 1

1. **`Astro.props` era `unknown`.** În Astro, `Astro.props` capătă tipuri doar
   dacă declari `type Props = {...}` în fișier. Fără declarație, TypeScript nu
   știa ce e `project`, iar eroarea se propaga în toate cele 5 locuri unde îl
   foloseam. O singură declarație le-a rezolvat pe toate.
2. **`z.string().url()` e deprecat** în versiunea de Zod din Astro 7. Forma
   corectă acum e `z.url()`.

### Ce NU e decis încă

`src/styles/tokens.css` conține valori **provizorii**. Culorile de acolo nu sunt
o decizie de design — sunt un fundal întunecat neutru care trece WCAG, ca
primele capturi de ecran să nu te inducă în eroare. Paleta, tipografia și
tokenii de mișcare se decid la Faza 3.

### Comenzi

```bash
npm run dev      # server local cu reîncărcare automată
npm run build    # generează dist/
npm run preview  # servește dist/, ca să vezi exact ce ajunge online
npm run check    # verifică tipurile (trebuie 0 errors înainte de commit)
```
