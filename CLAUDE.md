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
- **Nu inventa conținut.** Unde lipsesc texte reale, pune placeholder `TODO(conținut): …`.
  Din 28.10.2026 (Tudor trimite linkul angajatorilor) TODO-urile **nu apar pe site-ul publicat**:
  câmpurile din antet care încep cu `TODO(conținut)` sunt omise (`src/lib/todo.ts`, vizibile doar
  în `astro dev`), secțiunile nescrise stau în câmpul `todo:` din antet, iar un proiect fără
  rol și rezultat stă pe `draft: true`.
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

## Landing page — experiență immersivă (cerut explicit de Tudor)
Tudor a cerut de două ori, explicit, să nu se piardă:
1. **Badge de corporație cu lanyard**, în dreapta landing page-ului, vizibil la intrarea pe site,
   cu poza lui, arătând ca un ecuson autentic, **interactiv** (de tras/legănat).
2. **Scroll immersiv** cu animații prin video scrubbing pe fundaluri, care te duc treptat prin pagină.
3. Părerea lui despre starea actuală: „site-ul arată destul de urât" — restrângerea vizuală e
   corectă ca direcție, dar fără conținut și fără momentul immersiv citește ca gol.

### Conflictul care trebuie rezolvat, nu ignorat
Aceste trei cerințe se bat cap în cap cu pragurile din secțiunea „Calitate" de mai jos
(**Performance ≥ 90 pe mobil**, **site funcțional fără JavaScript**):

| Element | Cost tipic | Efect |
|---|---|---|
| Badge cu fizică (react-three-fiber + three + rapier) | ~500 KB JS gzipped | singur poate coborî Performance sub 90 pe mobil |
| Cadre pentru video scrubbing | 5–8 MB imagini | consum de date și decodare pe telefon |
| Embed Spline | câțiva MB runtime | același efect |

**Regula de implementare:** cât mai ușor posibil (canvas 2D sau Three.js vanilla înainte de
orice stivă React), măsurat cu Lighthouse **înainte și după**, decizia pe cifre.

Regula „un singur moment curajos pe pagină" a fost **retrasă** la cererea lui Tudor
(27.10.2026): îl reținea creativ. Vezi secțiunea „Libertate creativă" de mai jos.

### Decizia lui Tudor asupra conflictului (desktop-first, două moduri)
- **Ne axăm pe desktop.** Versiunea de mobil se regândește separat, mai târziu.
- **Două moduri de rulare:** unul cu animații complete, unul redus, pentru când e prea solicitant.
  Comutatorul se leagă de `prefers-reduced-motion` **și** de o alegere explicită a vizitatorului,
  memorată local.
- **Constrângerea care rămâne:** „desktop-first" înseamnă că *animațiile* sunt opționale pe mobil,
  **nu** că mobilul are voie să fie rupt. Conținutul, navigarea și lizibilitatea rămân complete la
  375px — asta e deja valabil și nu costă nimic de menținut. Recrutorii deschid linkuri de pe
  telefon; un site rupt acolo nu mai ajunge la varianta de desktop.
- Pragul Performance ≥ 90 se măsoară în **modul redus**. Modul complet are buget separat, iar dacă
  nu îl atinge, asta e o alegere asumată, nu o scăpare.

Fără JavaScript, badge-ul se degradează la o imagine statică — conținutul rămâne complet.

## Libertate creativă — ce e liber și ce nu (27.10.2026)

Tudor a cerut ca acest fișier să nu mai frâneze partea creativă. Regulile se împart în două,
și distincția contează:

### Liber — experimentează fără să întrebi
- **Câte momente vizuale vrei pe pagină.** Regula „unul singur" e retrasă.
- **Lista de interdicții estetice** din `.ux-profile.md` (glassmorphism, gradienți, carduri
  rotunjite, ALL-CAPS) devine **listă de valori implicite, nu lege.** Se calcă deliberat, nu din
  neatenție. Dacă o calci, spune în commit de ce.
- **JavaScript pentru efecte.** Cerința „site funcțional fără JS" se relaxează la:
  **conținutul și navigarea trebuie citibile fără JS; efectele nu trebuie să funcționeze.**
  Asta deblochează scroll immersiv, WebGL, scrubbing.
- **Bugetul de performanță în modul complet.** Pragul ≥ 90 se măsoară în modul redus. Modul
  complet poate costa mai mult, conștient.

### Nu se negociază — și nu astea te rețineau
- **Contrast WCAG AA, navigare din tastatură, `alt` pe imagini.** Astea nu fac designul plictisitor,
  fac site-ul utilizabil. Un angajator care îl deschide pe telefon, în soare, pe un ecran prost
  calibrat, e exact cazul pe care îl protejează. Un design spectaculos pe care nu-l poate citi
  nu e un design mai curajos, e unul care a eșuat.
- **Nu inventa conținut.** Pe un portofoliu, o afirmație umflată se sparge la primul interviu
  care sapă în ea. Asta e protecție pentru Tudor, nu constrângere estetică.
- **Datele personale** (secțiunea de mai sus).

**Cum se procedează de acum:** propune varianta curajoasă, verific dacă trece podeaua de
accesibilitate, și dacă nu trece caut o cale să obțin același efect fără să cadă — nu renunț
la efect. Dacă nu există cale, spun clar ce se pierde și decide Tudor.

## Landing-ul din 27.10.2026 — ce s-a decis și nu se reface fără Tudor

- **Direcția:** taste-skill „The quiet instrument” (seed 1940305872, `.taste-skill/direction.json`)
  pe paleta Blueprint. Un singur font, Literata, cu cinci mărimi. Fără liquid glass și fără
  lumina care urmărea scroll-ul: le-a scos Tudor. Gradientele sunt permise de el, dar nu s-a
  folosit niciunul.
- **Ideea:** modelele și desenele lui Tudor devin scene care rulează la scroll: schema bazei de
  date (`SchemaScene`), modelul NetLogo (`MarketScene`), cadrele Spline Aruna (`ArunaScene`).
- **Modelul de piață e portat fidel** (`scripts/market-model.ts`). Nu îl „repara”: traderii
  tehnici chiar tranzacționează pe baza unei monede aruncate.
- **Scenele de scroll nu folosesc GSAP.** Un singur cititor de scroll (`scripts/scenes.ts`) dă
  fiecărei scene un număr 0–1. Motivul e explicat în `docs/ARHITECTURA.md`, faza 11.
- **GSAP rulează arborele binar din hero, iar Lenis face scroll-ul lin** (faza 13, la cererea lui
  Tudor). Amândouă se încarcă doar în modul cu animații. Lenis nu pornește pe touch.
- **Badge-ul** e singurul obiect cu umbră și singurul alb pur. Excepția e deliberată și marcată
  `taste-skill-ignore`.
- **Badge-ul e Lanyard din React Bits** (faza 16, la cererea lui Tudor), portat în
  `scripts/lanyard.ts`. Three.js se încarcă **doar în modul cu animații**. În modul redus și fără
  JS rămâne cardul HTML din `IdBadge.astro`, care e și sursa textului pictat pe cardul 3D.
- **Pagina Software e pe negru, cu text albastru deschis** (`theme="night"` în `BaseLayout`,
  tokenii din `:root[data-theme='night']`). **Titlul paginii Design e TechText** (React Bits,
  `scripts/tech-text.ts`). Pe ambele, h1-ul rămâne text real.
- **Verificare înainte de commit:** `taste-skill lint` și `inspect` cu 0 FAIL. Critica rundei
  se scrie în `.taste-skill/critique.md`.
- **Cele două moduri de rulare există** (faza 12): butonul „Motion” din header,
  `scripts/motion.ts`, starea pe `<html data-motion>`, alegerea în `localStorage`
  (`portfolio-motion`). Orice animație nouă citește `motionIsFull()` și ascultă
  `onMotionChange()`, nu direct `prefers-reduced-motion`.
- **Foaia de desen din hero** (grila din patch-ul ChatGPT) e singura excepție de la „fără linii
  decorative” și e limitată la hero. **Casa a fost scoasă** la cererea lui Tudor („nu are niciun
  sens”). În locul ei e arborele binar de căutare (`SearchTree`), care se construiește singur cu
  algoritmul real de inserare.
- **Primul ecran conține doar numele, propoziția, butoanele, arborele și badge-ul** („lăsăm loc
  să mai animăm”). Rândul cu disponibilitatea a fost scos din hero (faza 14); îl spun coloana
  „Where” și secțiunea de contact.
- **Regula lui Tudor: o singură secțiune a landing-ului pe ecran.** Fiecare secțiune are cel
  puțin înălțimea unui ecran (`.screen`) și conținut centrat pe orizontală (`.centred`,
  `--content`). Secțiunile noi o respectă și ele. Asta înlocuiește, la cererea lui, coloana
  „quiet instrument” plasată la 22% din stânga.
- **Fiecare pagină de direcție are o bandă React Bits sus** (faza 17): Software → Topography
  (`scripts/topography.ts`), Design → DriftWall cu cadrele Aruna ale lui Tudor
  (`components/DriftWall.astro`, fără poze stock), Data → GradientASCII. Toate sunt decorative.
- **Pagina Data are fundalul GradientASCII** (React Bits, portat în `scripts/gradient-ascii.ts`,
  licență MIT + Commons Clause, cu notița păstrată în fișier).

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

## Ghidul de frontend — `ghid-claude/GHID-SITE-URI.md`

Distilarea muncii de la Energy Intelligence (ITFest 2026). **Se citește înainte de orice lucru de
UI.** Secțiunea 11 („greșeli deja făcute") merită citită prima: ne-a prins deja un gol real aici.

### Ce NU am făcut, și de ce

Secțiunea 2.3 a ghidului propune un `CLAUDE.md` scurt, de 5 rânduri, pentru un proiect nou.
**Nu l-am pus în locul acestuia.** Fișierul de față conține decizii luate în timp — regula
telefonului, limba, libertatea creativă, cerințele pentru badge, rezolvarea conflictului
performanță/animație. Înlocuit cu varianta de 5 rânduri, toate s-ar fi pierdut tăcut, iar o
sesiune viitoare ar fi refăcut greșeli deja rezolvate. Ghidul e **adăugat**, nu substituit.

### Unde ghidul descrie alt proiect

Ghidul a fost scris pentru **React + Vite + Tailwind 4**. Aici avem **Astro + CSS simplu**, iar
secțiunea „Stack" de mai sus interzice explicit Tailwind. Deci:

| Ghidul spune | Aici |
|---|---|
| tokenii în `src/index.css`, cu `@theme inline` | `src/styles/tokens.css`, CSS pur |
| clase Tailwind (`bg-background`) | clase proprii + variabile CSS |
| `lazy()` + `Suspense` pentru pagini grele | Astro livrează pagini statice; nu se aplică |
| `lucide-react` pentru iconițe | nu folosim librărie de iconițe |

Principiile din ghid (tokeni, buget de culoare, ritm, mișcare, verificare) se aplică integral.
Implementarea lor nu.

### Skill-uri: ce există efectiv

Ghidul listează patru skilluri instalate pe laptopul lui Tudor. În cloud, `ui-ux-pro-max` vine
ca plugin. Pe 27.10.2026, `taste-skill`, `design-motion-principles` și `awesome-design-claude`
au fost instalate în sesiune în `/root/.claude/skills/`, de la commit-urile fixate în ghid.
Containerul e efemer, deci **o sesiune nouă nu le mai are** până nu sunt reinstalate. Verifică
înainte să le revendici. Nu rula `taste-skill/scripts/assets.mjs`: descarcă imagini de pe
internet, iar aici nu folosim poze stock.

### Ce am verificat din ghid la integrare (27.10.2026)

| Regula ghidului | Starea aici |
|---|---|
| nicio culoare hex în componente | **respectată** — zero apariții în afara `tokens.css` |
| doar `transform` / `opacity` / `filter` animate | respectată |
| un singur cititor de scroll → variabile CSS | respectată (`scripts/scenes.ts`) |
| `overflow-x: clip`, nu `hidden` | respectată |
| mișcarea redusă lasă pagina vie, nu moartă | respectată — **aceeași greșeală o făcusem la badge** (greșeala 1 din ghid) |
| contrast măsurat numeric | respectată |
| **ținte de minimum 44px** | **era încălcată peste tot** — reparată la integrare |
| verificare la 4 lățimi | adăugată: 1440×900, 1366×768, 390×844, 360×740 |
| 4 stări pe ecranele cu date | nu se aplică încă — site-ul n-are ecrane cu date live |
| backup înainte de redesign | nu se aplică — istoricul git acoperă asta |

**Excepție documentată la 44px:** linkul din footer („Source on GitHub") stă în mijlocul unei
propoziții. WCAG 2.5.8 exceptează linkurile inline din text curent, iar mărirea lui ar rupe
rândul. Toate celelalte controale au fost ridicate la 44px.

## Calitate (verifică înainte de fiecare deploy)
- Lighthouse: Performance ≥ 90, Accessibility ≥ 95 pe mobil
- Navigare completă din tastatură, `alt` pe toate imaginile, contrast WCAG AA
- **Ținte de atingere ≥ 44px** pe controale de sine stătătoare (linkurile inline din text sunt exceptate)
- **Verificare la patru lățimi:** 1440×900, 1366×768, 390×844, 360×740 — zero scroll orizontal, consolă curată
- Meta tags + Open Graph (preview frumos când linkul e trimis pe LinkedIn)
- Site funcțional și fără JavaScript (fără animații, dar cu tot conținutul)
