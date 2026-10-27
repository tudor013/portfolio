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

---

## Faza 4 — Componentele și paginile

### Tiparele, numite înainte de cod

Skill-ul `page-patterns` cere ca tiparul paginii să fie **numit explicit
înainte** de a scrie markup, ca să nu iasă pagini care amestecă trei lucruri.
Cele două rute ale noastre:

| Rută | Tipar | Structura |
|---|---|---|
| `/` | **Home / landing** | nav → hero → secțiuni de lucru → contact → footer |
| `/projects/<slug>` | **Case study** | nav → metadata → poveste → footer |

Pagina principală **nu** e „portfolio index", deși are o grilă de proiecte.
Treaba ei e „explică cine e Tudor și de ce merită angajat", nu „răsfoiește
lucrări" — iar tiparul se alege după treaba utilizatorului, nu după ce
componente conține.

### Componentele

| Componentă | Rolul |
|---|---|
| `SiteHeader` | Doar orientare: două destinații. Mai multe linkuri ar îngreuna găsirea celor care contează. |
| `Hero` | O promisiune, două acțiuni. Conține singurul moment „curajos" din pagină. |
| `SignalTrace` | Graficul din hero. **Primește date; nu le inventează.** |
| `SkillCategory` | O categorie: titlu, număr de proiecte, descriere, grilă. |
| `ProjectCard` | Un panou L1. Rezultatul e pus **primul**, pentru că asta caută un angajator. |
| `ContactCta` | Repetă acțiunea din hero la finalul paginii. |
| `SiteFooter` | Legal + sursa pe GitHub. Fără al treilea pitch. |

### De ce `SignalTrace` nu desenează nimic acum

Componenta e gata și funcțională, dar primește `points={[]}`, deci hero-ul nu
o afișează. Două motive, amândouă intenționate:

1. **Un grafic inventat ar fi o minciună.** Toată pagina argumentează „dovezi,
   nu adjective". O curbă decorativă care se preface că e un rezultat
   contrazice exact asta.
2. **O cutie goală arată ca un bug.** Ocupa cel mai valoros spațiu din pagină
   fără să spună nimic.

Când îmi dai seria reală — output-ul simulării bursiere sau ritmul tău de
commituri — se completează `TRACE` în `Hero.astro` și graficul apare singur.

### Regula 60-30-10, acum respectată

La Faza 3 suprafața structurală era 0% — doar text pe fundal. Acum panourile
(carduri, placa de date, blocul de contact) dau cei ~30%, fundalul ~60%, iar
chihlimbarul apare **doar** pe elemente interactive: linkuri, butoane,
inelul de focus. Niciodată ca fundal.

### Patru probleme găsite la captură și reparate

1. **Footer-ul scria „Built with Astro;source on GitHub"** — lipsea spațiul
   înainte de link.
2. **`**text**` din Markdown ieșea la greutate 700.** Browserele desenează
   `<strong>` la bold implicit, peste plafonul de 600 din contract. Rezolvat
   cu o regulă explicită în `global.css`.
3. **Hero-ul afișa o cutie goală** (vezi mai sus).
4. **Gaura dintre hero și prima secțiune** era prea mare.

### Verificat în browser, nu presupus

| Verificare | Rezultat |
|---|---|
| greutăți de font folosite | 400, 500, 600 — plafon respectat |
| cel mai mic text | 12px — podeaua respectată |
| `<strong>` calculat | 600 |
| `.figure` calculat | IBM Plex Mono |
| overflow orizontal la 1440px / 375px | 0px |
| inele de focus la navigare cu Tab | **13/13** |

Primul test de focus a dat 0/13 — dar testul era greșit, nu codul: al doilea
argument al lui `getComputedStyle` e pentru pseudo-*elemente* (`::before`), nu
pseudo-*clase* (`:focus-visible`). Corectat, citind outline-ul elementului
chiar focalizat.

---

## Faza 4b — URL-ul real și pagina 404

### Site-ul e live

`https://portfolio.tudorifrim606.workers.dev`

Deploy-ul automat din git funcționează: fiecare push pe `main` declanșează un
build pe Cloudflare, iar în dashboard apare „Build in progress".

### De ce `site:` din config conta

Astro construiește din el linkurile **canonice** (care îi spun Google care e
adresa oficială a paginii) și **Open Graph** (previzualizarea când trimiți
linkul pe LinkedIn). Un placeholder greșit nu dă eroare la build — eșuează
tăcut, și afli abia când cineva dă click pe un preview rupt.

### Pagina 404 lipsea, deși configul o cerea

`wrangler.jsonc` are `not_found_handling: "404-page"`, adică „pentru o adresă
necunoscută, servește `/404.html`". Dar Astro nu generează așa ceva automat —
fișierul trebuie să existe ca `src/pages/404.astro`. Nu exista, deci o adresă
greșită ar fi întors un răspuns gol.

Textul respectă regula din skill-ul `errors`: **nu dă vina pe cititor.**
„This page doesn't exist" descrie starea sistemului; „ai greșit adresa" ar fi
o acuzație. Și oferă o ieșire (două linkuri), nu doar un diagnostic.

---

## Faza 5 — Badge-ul cu lanyard

### De ce NU am folosit Three.js

Implementarea obișnuită a acestui efect (cea care circulă pe net) folosește
React + three.js + un motor de fizică rapier compilat în WebAssembly.
Înseamnă aproximativ **o jumătate de megabyte** descărcați înainte ca badge-ul
să deseneze un singur pixel — pe un site care are prag Performance ≥ 90.

Varianta de aici: **integrare Verlet pe elemente DOM**. Aproximativ 140 de
linii de TypeScript, **zero dependențe**.

### Cum funcționează fizica Verlet, pe scurt

Fizica clasică reține *poziția* și *viteza*. Verlet reține **poziția curentă
și cea anterioară**, iar viteza rezultă din diferența dintre ele:

```
viteză = poziție_curentă − poziție_anterioară
```

Pare un truc, dar are un avantaj mare: ca să „fixezi" un punct, îi muți pur și
simplu poziția. Viteza se ajustează singură. De asta trasul cu mouse-ul
funcționează fără cod special — doar așezi ultimul punct pe cursor.

Fiecare cadru face două lucruri:

1. **Inerție + gravitație** — fiecare punct își continuă mișcarea și cade.
2. **Relaxare** — de 8 ori la rând, fiecare segment e readus la lungimea lui
   corectă, împingând ambele capete câte jumătate din eroare. După 8 treceri,
   lanțul arată ca o bandă, nu ca un elastic.

Punctul de sus e fixat (clema din perete). Cardul atârnă de ultimul punct, iar
unghiul lui se ia din ultimul segment — de asta se înclină odată cu banda, în
loc să rămână drept.

### De ce cardul e HTML, nu desen

Numele, rolul și ID-ul sunt **text real**. Pot fi selectate, traduse de
browser și citite de un cititor de ecran. Pe o pânză `<canvas>` sau WebGL ar
fi fost pixeli — invizibile pentru oricine folosește tehnologii asistive.

### Cele trei stări

| Situație | Ce se întâmplă |
|---|---|
| Normal | Banda se leagănă, cardul se poate trage cu mouse-ul |
| `prefers-reduced-motion` | Simularea **nu pornește deloc** — card static, complet lizibil |
| Fără JavaScript | Identic cu cazul de mai sus: CSS-ul desenează banda și cardul |

Poziția statică e scrisă direct în CSS și în atributul `d` al traseului SVG,
iar simularea o suprascrie doar dacă pornește. Nu există moment în care
pagina arată ruptă.

### Verificat în browser

| Verificare | Rezultat |
|---|---|
| simularea pornește | da |
| traseul funiei se animă | da, 15 segmente |
| trasul mișcă efectiv cardul | da |
| reduced-motion: rămâne nemișcat | da |
| reduced-motion: rămâne vizibil | da |
| fără JS: textul cardului | „Tudor-Andrei Ifrim / Software Developer / ID 2028·CSIE" |
| fără JS: poza | vizibilă |

### De știut

Poza sursă e **200×200**. La dimensiunea afișată (110px) e în regulă, dar nu
suportă mărire. Dacă badge-ul crește, trebuie o versiune mai mare.

---

## Faza 6 — Schimbarea pe light theme („Blueprint")

### De ce albastrul ăsta și nu cel evident

„Light + albastru" e cea mai comună paletă corporate care există. Luată
de-a gata, face orice portofoliu să arate ca un template. Albastrul standard
de SaaS (`#2563EB`) a și picat la măsurători: **4.73** pe hârtia noastră —
trece AA la limită și devine inutilizabil pe suprafețe mai mari.

Ales: **`#1549A6`, albastru de blueprint — 7.57.** Ideea vine din felul în
care lucrezi: ai desenat interfața Aruna în Illustrator *înainte* să fie
construit ceva. Asta e gândire de planșă. Cyanotipia e albastru pe hârtie, iar
lumina care urmărește scroll-ul devine lampa de pe planșă.

### Lumina care reacționează la scroll

Un singur element fix, cu un gradient radial, mutat prin `transform`.

**De ce `transform` și nu `top`:** `transform` e singura proprietate pe care
compozitorul browserului o poate anima fără să recalculeze layout-ul și fără
să repicteze pagina. Mutarea prin `top` ar forța o recalculare la fiecare
cadru de scroll și ar sacada.

Scriptul scrie o singură variabilă CSS, cel mult o dată pe cadru
(`requestAnimationFrame`). Fără JS, lumina rămâne în poziția de sus — pagina e
completă, doar nu te urmărește.

### Capcana contrastului pe temă deschisă

Pe o temă întunecată, riscul e textul prea șters. Pe una deschisă cu glow,
riscul e **textul care stă sub lumină**: fundalul se întunecă local și
contrastul scade exact unde nu te uiți.

Prima paletă trecea testul plat (5.80) dar sub lumină cădea la **4.63** — la
0.13 peste pragul AA. Orice ajustare ulterioară a luminii l-ar fi rupt tăcut.
Textul secundar a fost întunecat la `#4C5668`: **5.40 sub lumină**, marjă
reală.

**Regula care rămâne:** contrastul se măsoară sub lumină, nu pe fundalul plat.

### Badge-ul: trei defecte reparate

1. **Nu se mișca.** Îl pornisem exact în poziția de echilibru, unde gravitația
   deja îl ținea. Testul meu zicea „se animă" pentru că măsura câțiva pixeli de
   așezare — adevărat tehnic, invizibil practic. Acum pornește deviat lateral și
   intră legănându-se, plus o oscilație lentă permanentă care îi spune
   vizitatorului că poate fi apucat.
2. **Nu era 3D.** Containerul a primit `perspective`, iar cardul se rotește pe
   `rotateY` proporțional cu viteza lui orizontală. Un ecuson real se întoarce
   pe muchie când se leagănă — asta e, de fapt, mare parte din ce îl face să
   pară obiect, nu poză.
3. **Ieșea din pagină.** Un element transformat extinde zona de scroll. Acum
   ultimul punct al funiei e limitat la cutia badge-ului, deci cardul nu poate
   ieși nici la pendulare liberă, nici tras cu mouse-ul.

### O lecție despre testare

Scriptul meu de capturi raporta 96px overflow pe mobil și 124px pe desktop.
Am „reparat" de două ori. **Testul era stricat, nu pagina:** măsuram overflow-ul
*după* o captură `fullPage`, iar Playwright redimensionează viewportul ca să
prindă toată pagina — deci măsuram un layout pe care niciun utilizator nu îl
vede.

Un diagnostic separat, care enumera elementele ieșite din viewport, a arătat
**zero**. Am mutat măsurătoarea înaintea capturii.

Morala: când un test raportează un bug, verifică întâi testul. Măsurătoarea
trebuie să spună care element și unde, nu doar un număr.

---

## Faza 6b — „Badge-ul nu se mișcă deloc"

Tudor a raportat că nu se mișcă la click. Măsurat local, se mișca mult
(110px legănare, 85° rotație), deci codul nu era mort. Două cauze reale, și
amândouă erau greșeli de design, nu de implementare:

### 1. `prefers-reduced-motion` îngheța tot

Codul verifica setarea și **nu pornea simularea deloc**. Dacă ai oprit
„Animation effects" în Windows (Setări → Accesibilitate → Efecte vizuale),
badge-ul era complet mort.

Asta era o înțelegere greșită a setării. „Reduced motion" înseamnă *fără
animație pe care n-am cerut-o* — nu *fără reacție la ce fac eu*. Acum
simularea pornește mereu; setarea doar oprește intrarea și legănarea de la
sine. Trasul și clickul funcționează oricum.

### 2. Un click nu făcea nimic

Apăsarea fixa funia exact unde era deja, deci un click fără mișcare nu
schimba nimic. Dar clickul e **primul lucru pe care îl încearcă oricine**.
Un element care nu răspunde la click pare stricat, indiferent cât de bine
funcționează trasul.

Acum, o apăsare care nu s-a deplasat mai mult de 4px e tratată ca un click și
primește un impuls lateral — în direcția opusă părții pe care ai apăsat, ca la
un ecuson real pe care îl plesnești cu degetul.

### Măsurat

| | mișcare normală | reduced motion |
|---|---|---|
| simularea pornește | da | **da** (înainte: nu) |
| legănare de la sine, 2.5s | 110px | 0px |
| deplasare după un **click** | 96px | **90px** |

### Lecția

Prima dată am „verificat" badge-ul măsurând dacă traseul funiei se schimbă
între două cadre. Răspunsul a fost „da" — pentru câțiva pixeli de așezare.
Testul trecea, produsul era mort.

Un test care întreabă *„s-a schimbat ceva?"* nu e același lucru cu unul care
întreabă *„se vede?"*. Acum se măsoară amplitudinea în pixeli, nu existența
schimbării.

---

## Faza 7 — Brieful de front-end

Brieful cerea structură nouă (profil, competențe, experiență), navigație
sticky cu scroll-spy, liquid glass, glow legat de scroll și microinteracțiuni.
Două puncte din el contraziceau decizii luate de Tudor cu o oră înainte —
tema întunecată și limba română. Le-a confirmat pe ale lui: **light + albastru,
engleză**. Restul brieful-ui s-a aplicat integral.

### Componente noi

| Fișier | Rol |
|---|---|
| `components/Profile.astro` | Paragraful „ce fel de probleme rezolv", pe panou de sticlă |
| `components/Skills.astro` | Competențe pe 4 grupe. **Fără bare de progres** — un procent lângă o competență e precizie inventată |
| `components/Experience.astro` | Cronologie: roluri + studii, direct din CV |
| `scripts/nav-spy.ts` | Marchează secțiunea curentă |
| `scripts/reveal.ts` | Animația de apariție |

### Scroll-spy: de ce `IntersectionObserver` și nu scroll

Varianta naivă ascultă `scroll` și recalculează pozițiile tuturor secțiunilor
la fiecare eveniment. `IntersectionObserver` lasă browserul să facă geometria
în afara firului principal și te anunță **doar când** o secțiune chiar trece
pragul. Între acele momente, citirea paginii costă zero.

### Liquid glass pe fundal deschis

Sticla e interzisă ca default de regulile de gust, tocmai pentru că e aplicată
de obicei peste tot. Aici e folosită în **trei locuri**: bara de navigație,
panoul de profil, blocul de contact — adică exact suprafețele peste care trece
lumina, ca să aibă ce refracta.

Fiecare are contur vizibil și **fallback opac** prin `@supports not
(backdrop-filter)`. Fără asta, pe un browser fără blur ar rămâne o bandă
translucidă cu text ilizibil peste ea.

### Animația de apariție: o greșeală gravă, prinsă prin măsurare

Prima implementare punea elementele la `opacity: 0` și le dezvăluia la
intrarea în viewport. Testul pe cinci scenarii:

| situație | conținut invizibil |
|---|---|
| la încărcare, fără scroll | **10/10** |
| derulare normală | 0/10 |
| link direct `#experience` | 0/10 |
| **salt instant la final** | **7/10** |
| fără JavaScript | 0/10 |

Un vizitator care dă un flick rapid până jos vedea **7 din 10 proiecte
goale**. Elementele care n-au avut niciun cadru în banda observatorului nu se
declanșau niciodată.

**Soluția: animația e aditivă.** Elementele sunt vizibile implicit; intrarea în
viewport doar *pornește* o animație care pleacă din transparent. Dacă
observatorul nu se declanșează niciodată, elementul era deja corect.

Modul de eșec a devenit „fără animație" în loc de „fără conținut". Pe un
portofoliu, diferența asta e totul.

După rescriere: **0/10 invizibil în toate cele cinci scenarii**, iar cele 10
elemente încă își joacă animația la derulare normală.

---

## Faza 8 — Pagini separate pe direcție, și materialele noi

### Arhitectura s-a schimbat

Înainte: o singură pagină lungă, navbarul sărea la secțiuni din ea.
Acum: **trei pagini dedicate**, una per direcție.

| Rută | Ce conține |
|---|---|
| `/` | hero, profil, cele trei direcții ca punți, competențe, experiență, contact |
| `/software` | toate proiectele `dev` |
| `/design` | toate proiectele `design` |
| `/data` | toate proiectele `data` |
| `/projects/<slug>` | studiul de caz al unui proiect |

Cele trei pagini vin dintr-un **singur fișier**, `src/pages/[category].astro`.
Parantezele pătrate îi spun Astro că e un șablon; `getStaticPaths()` îi dă
lista categoriilor, iar Astro îl rulează o dată pentru fiecare. O categorie
nouă înseamnă o linie în `CATEGORIES`, nu un fișier nou.

Etichetele, slug-urile și descrierile stau toate în `src/content.config.ts`.
Dacă ar fi scrise în două locuri, într-o zi ar începe să difere.

### Badge-ul: de ce se smucea

Tudor a raportat că se „glitchuiește" la orice mișcare de mouse. Cauza era în
felul în care trasul era implementat: **vârful funiei era fixat instantaneu pe
poziția cursorului**. Verlet deduce viteza din diferența dintre poziția
curentă și cea anterioară — deci o teleportare de 200px într-un cadru e citită
ca o viteză de 200px/cadru, iar funia pocnește ca un bici.

Trei corecții:

1. **Vârful se apropie de cursor treptat** (22% din distanță pe cadru), nu
   sare pe el. Badge-ul rămâne greu, mișcarea rămâne lizibilă.
2. **Mai multă amortizare** (0.985 → 0.955): energia se pierde mai repede.
3. **Zona de mișcare a crescut** de la 300×440 la 420×560. Înainte, limita
   laterală se activa aproape continuu, iar fiecare atingere a ei adăuga o
   smucitură.

Plus o corecție subtilă: când poziția e limitată la margine, se mută **și**
poziția anterioară acolo. Altfel Verlet vede o diferență mare între ele și
transformă peretele în trambulină.

Măsurat după: mișcare proprie **81px** (era 208px), **0px** cu reduced-motion.
