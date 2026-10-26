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

---

## Faza 3 — Direcția vizuală

### Direcția aleasă: „Control Surface"

Pagina trebuie să se citească ca un instrument, nu ca un dashboard de SaaS.
Alegerea pornește de la firul comun al proiectelor tale: sisteme cu părți care
interacționează (simularea cu agenți, robotica, telemetria PV). Restricția e
ideea — un singur element duce accentul, restul stă liniștit.

### Fișierele adăugate

| Fișier | Ce face |
|---|---|
| `.ux-profile.md` | **Contractul vizual.** Toate skillurile VectorLab îl citesc automat înainte să atingă layout, culoare sau tipografie. |
| `src/styles/tokens.css` | Implementarea contractului: culori, tipografie, spațieri, mișcare. |
| `src/assets/fonts/*.woff2` | Fonturile, în repo. 8 fișiere, 160 KB. |

### De ce tokenii sunt pe două niveluri

```
PRIMITIVE   --ink-900: #0e1413      ← valoarea brută, numită după ce ESTE
                 │
SEMANTIC    --surface-canvas        ← numită după ce FACE
                 │
COMPONENTĂ  background: var(--surface-canvas)
```

O componentă nu atinge niciodată un primitiv. Când schimbi paleta, modifici
un singur nivel și nimic altceva.

### Contrastele — măsurate, nu estimate

Toate perechile calculate cu formula WCAG 2.1, nu aproximate din ochi:

| Pereche | Raport | Prag AA |
|---|---|---|
| text pe canvas | 14.60 | 4.5 |
| text pe panou | 11.75 | 4.5 |
| muted pe canvas | 6.34 | 4.5 |
| muted pe panou | **5.10** ← cea mai slabă | 4.5 |
| accent pe canvas | 7.89 | 4.5 |
| accent pe panou | 6.35 | 4.5 |

**Două probleme găsite și reparate pe parcurs:**

1. Prima variantă avea bordura la 10% opacitate → contrast **1.29**, sub pragul
   de 3:1 cerut de WCAG 1.4.11 pentru limite de componente. Soluția: *două*
   tokenuri. `--border-subtle` (14%) pentru decor, `--border-strong` (44%,
   raport 3.48) pentru orice mărginește un control interactiv.
2. Saltul dintre canvas și panou era **1.09** — panourile erau invizibile.
   Suprafața a urcat la `#1e2927`, salt 1.24.

### Fonturile: de ce sunt în repo și nu luate de la Google

Prima variantă folosea `fontProviders.google()`. Funcționa, dar înseamnă că
build-ul depinde de o rețea: dacă Google Fonts e lent sau pică, build-ul
Cloudflare pică. Acum fișierele `.woff2` sunt în `src/assets/fonts/`, iar
build-ul nu atinge internetul deloc.

Fiecare font are **două** declarații per greutate — una `latin`, una
`latin-ext` — fiecare cu propriul `unicode-range`. Fără `latin-ext`, literele
românești `ș`, `ț` și `ă` ar fi afișate din alt font, vizibil diferit în
mijlocul cuvântului.

**Preload-ul a fost scos intenționat.** `<Font preload />` încarcă prioritar
*toate* variantele familiei — aici 6 fișiere, ~120 KB care concurează cu
textul ce determină LCP-ul. Astro generează automat un fallback cu metrici
potrivite, deci fontul real intră fără să miște layout-ul.

### Ce NU e făcut încă

Pagina actuală e doar tokeni aplicați pe HTML semantic. Nu există panouri,
deci regula 60-30-10 (60% fundal / 30% suprafețe structurale / 10% accent)
**nu e respectată** — suprafața structurală e 0%. Se rezolvă la Faza 4, când
apar componentele.

### Verificat

- `npx astro check` → 0 erori, 0 warnings
- build → 4 pagini, 8 fișiere woff2 emise, 0 cereri către domenii externe
- captură Playwright la 1440px și 375px → **0px overflow orizontal** pe ambele
- fontul calculat în browser e IBM Plex Sans, nu un fallback
