# Ghid pentru Claude: cum construim site-uri frumoase, accesibile și rapide

> **Pentru cine e:** pentru o sesiune Claude Code care lucrează la un alt site (existent sau pornit de la zero) și pentru Tudor, care o pornește.
> **De unde vine:** din munca la frontend-ul Energy Intelligence (ITFest 2026, repo `EdenIBD/proiect_ITFest`), 24–27 octombrie 2026. Tot ce scrie aici a fost folosit și verificat acolo. Unde o unealtă există, dar n-am rulat-o, scrie explicit.
> **Cum îl citești:** secțiunile 1–3 sunt de făcut înainte de prima linie de cod. Secțiunile 4–10 sunt meseria propriu-zisă. Secțiunea 11 conține greșelile pe care le-am făcut deja, ca să nu le repeți.

---

## 0. Pe scurt: cele 12 reguli care au contat cel mai mult

1. **Întâi decizi direcția, apoi scrii cod.** Briefs, referințe, skill-uri, apoi tokeni. Abia la final componentele.
2. **Totul trece prin tokeni.** Nicio culoare hex în componente. Paleta, fonturile, razele și curbele de mișcare sunt definite o singură dată în CSS.
3. **Bugetul de culoare e mic.** Culoarea de brand plină apare doar pe semne mici. Tentele ei pale fac munca de suprafață, în 3–10 % din ecran (stilul „accent ladder").
4. **O idee pe secțiune.** Aceeași structură de cap peste tot (kicker, titlu, text), aceeași lățime de conținut, ritm vertical generos și fundaluri care alternează intenționat.
5. **Animăm doar `transform`, `opacity` și `filter`.** Scroll-ul se citește într-un singur loc (un `requestAnimationFrame`) și ajunge în CSS ca variabile. Nicio librărie de animație.
6. **Mișcarea depinde de frecvență.** Ce se întâmplă rar poate fi expresiv. Ce se întâmplă des (navbar) e rapid. Ce pornește de la tastatură nu alunecă niciodată.
7. **Mișcarea redusă e o versiune completă a paginii, nu una moartă.** Scoatem ce se deplasează (parallax, alunecări), dar păstrăm buclele lente pe loc și fade-urile.
8. **Doar conținut real.** Nicio cifră, testimonial, partener sau economie inventată. Textul trebuie să spună exact ce face codul.
9. **Accesibilitatea face parte din design:**
   - contrast numeric verificat;
   - focus vizibil;
   - ținte de minimum 44 px;
   - etichete vizibile pe câmpuri;
   - erorile sub câmpul lor;
   - `aria-hidden` pe decor;
   - pagina funcționează și fără JavaScript pentru decor.
10. **Încărcăm doar ce trebuie, când trebuie.** Paginile grele, harta și SDK-ul de autentificare se încarcă lazy. Fonturile au `preconnect` și `display=swap`.
11. **Verificăm cu ochii, nu doar cu teste:**
    - capturi la 1440×900, 1366×768, 390×844 și 360×740;
    - zero scroll orizontal;
    - consolă curată;
    - o verificare separată cu mișcarea redusă.
12. **Lucrăm pe etape bifate, cu backup înainte de orice redesign și cu dovezi la fiecare pas.** Spunem ce a rulat, ce nu a rulat și ce nu e verificat.

---

## 1. Skill-urile: ce sunt, de unde vin, cum le instalezi

Un *skill* e un folder cu instrucțiuni (și uneori scripturi și date) pe care Claude Code îl încarcă atunci când lucrarea o cere. Skill-urile personale stau în `~/.claude/skills/` (pe Windows: `C:\Users\Lenovo\.claude\skills\`). Sunt disponibile **în orice proiect de pe acest calculator**, dar doar în sesiunile pornite după instalare.

### 1.1 Ce am instalat (25.10.2026)

| Folder | Sursa (GitHub) | Commit | La ce folosește | Ce cere |
|---|---|---|---|---|
| `ui-ux-pro-max` | `nextlevelbuilder/ui-ux-pro-max-skill`, subfolderul `.claude/skills/ui-ux-pro-max` | `d14efff` | O bază de date căutabilă: 119 reguli UX, palete, perechi de fonturi, stiluri, grafice și reguli pe stack. Prioritatea regulilor: accesibilitate → atingere → performanță → stil → layout → tipografie → animație → formulare → navigație → grafice. | Python 3 |
| `taste-skill` (numele intern `design-taste-frontend`) | `Leonxlnx/taste-skill`, subfolderul `skills/taste-skill` | `6010f91` | Direcție artistică anti-„slop", extrasă din 247 de site-uri premiate. Scripturi care propun direcții (`draw.mjs`), un inspector în browser (`inspect.mjs`), un linter (`lint.mjs`) și căutare de poze (`assets.mjs`). | Node 22+, Chrome / Edge / Chromium; `assets.mjs` cere și internet |
| `design-motion-principles` | `kylezantos/design-motion-principles`, subfolderul `skills/design-motion-principles` | `4a9ca87` | Mișcare după trei „lentile": Emil Kowalski (reținere, viteză), Jakub Krehel (finisaj de producție), Jhey Tompkins (joacă, CSS creativ). Are două moduri: Create (construiești) și Audit (verifici). | — |
| `awesome-design-claude` (stilul „claude") | `bergside/awesome-design-skills`, subfolderul `skills/claude` | `f631a09` | Un stil editorial: fundal ivoriu cald (niciodată alb pur), cerneală aproape neagră, un singur accent folosit cu zgârcenie, accent prin tipografie, nu prin strălucire. Celelalte 66 de stiluri din repo **nu** sunt instalate. | — |

Lista e salvată și în `~/.claude/skills/SOURCES.md`.

### 1.2 Pe acest calculator: nu trebuie făcut nimic

Skill-urile sunt deja în `~/.claude/skills/`, deci orice sesiune **nouă** le vede, în orice proiect.

Verificare: în sesiunea nouă scrii `/` și trebuie să apară `ui-ux-pro-max`, `taste-skill`, `design-motion-principles` și `awesome-design-claude`. Dacă nu apar, sesiunea a fost pornită înainte de instalare: închide-o și pornește alta.

### 1.3 Pe alt calculator: reinstalare

Rulezi în Git Bash, câte o comandă pe rând:

```bash
mkdir -p ~/skills-src ~/.claude/skills
```

```bash
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill ~/skills-src/ui-ux-pro-max-skill && git -C ~/skills-src/ui-ux-pro-max-skill checkout d14efff && cp -r ~/skills-src/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max ~/.claude/skills/
```

```bash
git clone https://github.com/Leonxlnx/taste-skill ~/skills-src/taste-skill && git -C ~/skills-src/taste-skill checkout 6010f91 && cp -r ~/skills-src/taste-skill/skills/taste-skill ~/.claude/skills/
```

```bash
git clone https://github.com/kylezantos/design-motion-principles ~/skills-src/design-motion-principles && git -C ~/skills-src/design-motion-principles checkout 4a9ca87 && cp -r ~/skills-src/design-motion-principles/skills/design-motion-principles ~/.claude/skills/
```

```bash
git clone https://github.com/bergside/awesome-design-skills ~/skills-src/awesome-design-skills && git -C ~/skills-src/awesome-design-skills checkout f631a09 && cp -r ~/skills-src/awesome-design-skills/skills/claude ~/.claude/skills/awesome-design-claude
```

Regula de siguranță pe care am urmat-o:
- **Citește skill-ul înainte să-l instalezi.** `SKILL.md`, scripturile și URL-urile pe care le apelează (`grep -ohE "https?://..." scripts/*.mjs`).
- **Nu rula nimic la instalare.**

Dezinstalarea înseamnă să ștergi folderul.

Verifici uneltele de care depind:

```bash
python --version && node --version
```

### 1.4 Cum se folosesc (cum le-am folosit eu)

**`/ui-ux-pro-max`: întrebări mici și precise**

O interogare are **o singură intenție**, din 2–5 termeni, cu domeniul explicit. Dacă rezultatul e gol sau nu se potrivește, reîncerci **o singură dată**, cu termeni mai înguști. Dacă nici atunci nu găsește nimic, spui deschis că folosești regula generală, nu un rezultat din bază.

Interogări reale pe care le-am rulat:

```bash
python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "inline validation error near field" --domain ux
```

```bash
python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "icon button accessible label" --domain icons -n 2
```

Alte interogări din aceeași serie: `"map location picker pin drag"`, `"profile avatar menu navigation"`, `"back navigation predictable deep link"` (toate cu `--domain ux`), plus `"energy monitoring kpi summary" --domain chart`. Pentru harta React n-a găsit nimic nici după reîncercare, iar asta am scris-o în nota de feature.

Ce am preluat din rezultate:
- o alternativă la tragere, cu un singur pointer și cu tastatura (WCAG 2.2);
- erorile sub câmp, legate prin `aria-describedby`;
- nume accesibil pentru butonul doar cu iconiță (avatarul);
- rute cu adresă proprie (deep link).

Pentru un site nou se pornește cu `--design-system`, care propune paleta, fonturile și stilul împreună:

```bash
python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<tip produs> <industrie> <cuvinte cheie>" --design-system -p "Nume proiect"
```

Regula de aur: rezultatul e o **recomandare**, nu o comandă. Îl verifici că se potrivește produsului înainte să-l aplici.

**`/taste-skill`: direcția artistică**

Întâi decizi tipul lucrării:
- **pagină** (landing, prezentare, portofoliu): rulezi `draw.mjs` simplu;
- **ecran de aplicație** (dashboard, liste, setări): citești întâi `references/app-screens.md`, apoi rulezi `draw.mjs --app`.

Pentru tema aplicației (FEAT-018) am rulat:

```bash
node ~/.claude/skills/taste-skill/scripts/draw.mjs --app --kind analytics --brief "solar PV and battery monitoring for prosumers and O&M teams: energy home, portfolio triage, incident evidence and technician decision" --options
```

Comanda reală avea și `--screens` cu lista ecranelor (overview, list…).

Scriptul a propus trei stiluri: `framed-sheet`, `accent-ladder` și `achromatic-ledger`. Am ales **`accent-ladder`**, pentru că o singură nuanță de brand (galbenul solar) se potrivea cu produsul. Apoi am rulat aceeași comandă fără `--options`, cu `--style accent-ladder`, ca să obțin „foaia de stil" completă.

Regula ei a devenit regula temei noastre: nuanța plină doar pe semne mici (butonul principal, seria din grafic, iconița activă). Tentele 50–200 fac suprafețele (rândul activ, insignele, pistele). Bugetul de culoare e de 3–10 %.

**Ce n-am rulat (și recomand la un site nou):**
- `draw.mjs` pentru pagini, adică direcția pentru landing;
- `inspect.mjs`, care măsoară regulile casei în browser;
- `lint.mjs`;
- `assets.mjs`, care caută poze reale.

Landing-ul l-am construit din brief-ul lui Tudor și din prototipul lui. Pentru un site de la zero, rulează procesul complet al skill-ului: alegi o direcție → construiești → capturi la trei lățimi → critică după rubrica din `references/critique.md` → corectezi → te uiți din nou.

**`/design-motion-principles`: mișcarea**

Întâi decizi modul: **Create** (construiești) sau **Audit** (verifici ce există). Apoi citești `workflows/create.md` și `references/creation-gotchas.md`. După tipul proiectului se adaugă:
- `jakub-krehel.md`, `jhey-tompkins.md` sau `emil-kowalski.md`;
- `motion-cookbook.md`;
- `performance.md`;
- **mereu** `accessibility.md`.

Ponderea pe care am folosit-o, dintr-un tabel al skill-ului:

| Unde | Lentila principală | Secundară | Motiv |
|---|---|---|---|
| Landing | Jakub (finisaj) | Jhey (scroll, joacă) | pagină de marketing, vizitată rar |
| Navbar | Emil (viteză, reținere) | — | folosit de sute de ori, deci rapid |
| Pinul de pe hartă | Jakub | Emil | interacțiune de produs, frecventă |

**`awesome-design-claude`: referința de rafinament**

N-am copiat stilul (are colțuri de 0 px și zero umbre, pe când noi avem sticlă și colțuri rotunde). Am păstrat principiile lui:
- ivoriu cald în loc de alb pur;
- cerneală aproape neagră;
- un singur accent, folosit cu zgârcenie;
- accentul vine din tipografie, nu din strălucire.

**Skill-ul proiectului `energy-frontend`** (în `.claude/skills/` din repo, nu e personal) a dat regulile de onestitate a datelor:
- lipsa datelor nu e zero;
- măsuratul și modelatul se desenează diferit;
- vocabular fix pentru stări;
- fiecare ecran are 4 stări (se încarcă, eroare, gol, date vechi).

---

## 2. Ce îi spui noului Claude: promptul de pornire și procesul pe etape bifate

### 2.1 Cum funcționează lista bifată

Lista de pași pe care o vezi sub mesajele mele (un cerc gol, apoi unul care se încarcă, apoi bifă) e lista de sarcini a aplicației Claude (tab-ul Code). Orice sesiune nouă din această aplicație o are deja.

Comportamentul pe care îl ceri explicit:
- lista **întreagă** e scrisă la început;
- **un singur** pas e în lucru;
- un pas e bifat **doar după ce e verificat**;
- la sfârșit vine o recapitulare cu ce s-a schimbat, ce a rulat și ce nu e verificat.

În Claude Code din terminal (CLI) e aceeași idee, prin lista de „todo-uri".

### 2.2 Promptul de pornire (îl trimiți ca prim mesaj în sesiunea nouă)

```text
Lucrezi la frontend-ul site-ului <NUME> (<stack, de ex. React + Vite + Tailwind 4>, sau „de la zero").
Citește întâi ghidul atașat: ghid-claude/GHID-SITE-URI.md, integral. E felul în care lucrăm; respectă-l.

Skill-uri: folosește ui-ux-pro-max, taste-skill, design-motion-principles și awesome-design-claude, cum scrie în
secțiunea 1.4 a ghidului. Spune-mi la fiecare decizie de design din ce skill sau sursă vine; dacă o căutare nu găsește
nimic după o reîncercare, spune că folosești regula generală.

Proces (obligatoriu):
1. Înainte de orice cod, scrie lista completă de pași în lista de sarcini (task list) și ține-o la zi: un singur pas
   în lucru, bifează un pas doar după ce l-ai verificat (comandă rulată, test, captură în browser). Dacă planul se
   schimbă, rescrie lista întreagă.
2. Pasul 1 e mereu: citește regulile proiectului (CLAUDE.md / AGENTS.md / README), brief-ul și referințele mele, apoi
   spune-mi în 3–5 rânduri ce ai înțeles și ce presupui.
3. Înainte de orice redesign, fă un backup (folder + tag git local) și spune-mi unde e.
4. Scrie direcția (paletă, fonturi, ritm, mișcare) și tokenii ÎNAINTE de componente.
5. Doar conținut real: nu inventa cifre, clienți, testimoniale sau economii. Unde lipsește ceva, pune [__] și spune-mi.
6. Verifică în browser la 1440×900, 1366×768, 390×844 și 360×740, plus o dată cu mișcare redusă: zero scroll
   orizontal, consolă fără erori.
7. Dacă aceeași reparație eșuează de două ori, oprește-te și arată-mi dovezile.
8. La final: ce s-a schimbat, ce a rulat (cu rezultatul), ce NU e verificat și ce trebuie să mă uit eu.

Prima sarcină: <descrie ce vrei>.
```

### 2.3 Ca regulile să rămână în toate sesiunile proiectului nou

Pune un `CLAUDE.md` în rădăcina proiectului nou. Claude Code îl citește singur la fiecare sesiune:

```markdown
# CLAUDE.md
- Ghidul de frontend: ghid-claude/GHID-SITE-URI.md. Citește-l înainte de orice lucru de UI.
- Lucrează pe etape în lista de sarcini; bifează doar după verificare; recapitulare la final.
- Tokenii sunt în src/index.css; nicio culoare hex în componente.
- Doar conținut real; textul de pe ecran trebuie să spună exact ce face codul.
- Verificare vizuală obligatorie: 1440×900, 1366×768, 390×844, 360×740 și mișcare redusă.
```

Copiază și fișierul acesta în proiectul nou, la `ghid-claude/GHID-SITE-URI.md`.

---

## 3. Procesul de lucru, etapă cu etapă

Așa a arătat fiecare feature (FEAT-008, 010, 017, 018, 021, 027, 029). Pașii din lista de sarcini au fost mereu aceștia sau o parte din ei:

| # | Etapa | Ce faci concret | Dovada că e gata |
|---|---|---|---|
| 1 | **Context** | Citești regulile repo-ului, ghidul de frontend, brief-ul, nota de feature și codul atins. Verifici `git status` și ramura. | Un rezumat în 3–5 rânduri, cu presupunerile spuse |
| 2 | **Backup** (înainte de redesign) | Un folder `backup/pre-<nume>-<data>/` cu sursele (fără `node_modules`, `dist`, `.env`), plus un tag git local cu același nume | Numărul de fișiere și tag-ul raportate |
| 3 | **Specificație** | Scopul, ce nu intră, criterii de acceptare măsurabile (AC-001…), matricea de teste, decizii numerotate (D-1, D-2…) cu autorul și data | Nota de feature scrisă |
| 4 | **Direcție** | Skill-urile (secțiunea 1.4): stilul ales și de ce, ponderea lentilelor de mișcare | Decizia scrisă în notă |
| 5 | **Tokeni** | Paleta, fonturile, scara tipografică, razele, curbele de mișcare, în CSS | Contrastul calculat pentru fiecare pereche text / fundal |
| 6 | **Structură** | Ordinea secțiunilor, lățimea conținutului, ritmul vertical, alternanța fundalurilor | Pagina „în gri", fără mișcare, citibilă |
| 7 | **Componente** | Construiești din tokeni. Fiecare ecran are stările încărcare, eroare, gol și date vechi. | Teste unitare pentru comportament |
| 8 | **Mișcare** | Secțiunea 7. Varianta redusă e scrisă în același timp, nu după. | Variabilele CSS eșantionate în browser la jumătatea animației |
| 9 | **Teste** | Typecheck, lint, teste, build, linterul de afirmații | Toate trec; erorile vechi, care nu țin de tine, raportate separat |
| 10 | **Browser** | Cele 4 dimensiuni, mișcarea redusă, consola, scroll-ul orizontal | Capturi și cifrele măsurate |
| 11 | **Livrare** | Commit cu scop clar, push pe ramura feature, PR cu ce a rulat și ce nu, nota de feature actualizată cu dovezile | Linkul PR-ului |

Stările unui lucru au nume fixe, ca să nu se umfle afirmațiile:

| Stare | Ce înseamnă |
|---|---|
| `PROPOSED` | propus, neînceput |
| `IN_PROGRESS` | în lucru |
| `IMPLEMENTED` | scris, neverificat |
| `AUTOMATED_VERIFIED` | testele au trecut |
| `MANUALLY_VERIFIED` | verificat de om |
| `DEPLOYED_VERIFIED` | verificat pe site-ul public; **nu** doar pentru că CI-ul a trecut |
| `BLOCKED` | blocat, cu motivul |

---

## 4. De unde vin cunoștințele de estetică

Ordinea în care am cântărit sursele, de la cea mai puternică la cea mai slabă:

1. **Cuvintele și referințele lui Tudor.** Au întâietate față de orice skill.
   - `ghid_frontend_site.md`, adus în repo ca `docs/wiki/07-Frontend-Guide.md`;
   - prototipul `prototip_landing.html` (în `docs/frontend/`), portat în React;
   - stylesheet-ul de referință `referinta_index.css`, copiat ca bază pentru `index.css`, apoi transformat în tokeni;
   - brief-ul de redesign `brief-claude-redesign-energy-intelligence.md`, pentru look-ul solar, scena 2.5D, conținutul real și backup.
   - Fiecare cerere a lui a devenit o decizie numerotată în nota de feature (de exemplu D-19: ce texte se scot; D-22: mișcarea urmează setarea sistemului, cu un buton de comutare).
2. **Regulile de produs:**
   - onestitatea datelor;
   - vocabularul fix („alertă", nu „defect", până la confirmare);
   - nicio economie fără tarif.
3. **Skill-urile de design** (secțiunea 1.4), pentru stil, mișcare și reguli UX.
4. **Ce am văzut în browser.** Capturile au corectat de multe ori ce părea bine în cod (secțiunea 11).

Cum transformi o referință în sistem:
- **Nu copia valori la întâmplare.** Extragi un **rol**: „fundalul paginii", „textul secundar", „tenta de stare". Apoi îi dai un token cu nume semantic.
- **Fiecare token de text are contrastul scris în comentariu** (de exemplu `--c-muted: #545b6b; /* 6,4:1 pe fundal */`).
- **Când o referință contrazice accesibilitatea, câștigă accesibilitatea.** Spui asta în notă.

---

## 5. Sistemul vizual: convenții respectate de la început

### 5.1 Tokeni (în `src/index.css`, Tailwind 4)

- **Primitivele de culoare**, ca variabile pe `:root` (`--c-ivory`, `--c-ink`, `--c-sun`…).
- **Rolurile semantice**, peste primitive (`--background`, `--foreground`, `--primary`, `--muted-foreground`, `--ring`…). Componentele folosesc **doar** rolurile, prin clasele Tailwind generate cu `@theme inline` (`bg-background`, `text-muted-foreground`, `text-sun-ink`).
- **Clasele de componentă** (`.glass`, `.field`, `.link`, `.toggle-track`) stau în `@layer components`. Așa le pot suprascrie utilitarele Tailwind (`hidden`, `max-[860px]:…`).
- **O regulă testată automat:** un test (UT-101) pică dacă apare un hex în componente. Asta m-a prins de două ori cu valori de rezervă de tipul `var(--x, #abc)`. Folosește doar tokeni, fără valori de rezervă.

Paleta din Energy Intelligence, ca model de structură:

| Rol | Token | Valoare | Notă |
|---|---|---|---|
| Fundal pagină | `--c-ivory` | `#fbf8f2` | ivoriu cald, nu alb pur |
| Panouri | `--c-surface` | `#ffffff` | albul doar pe carduri |
| Suprafață ridicată | `--c-raised` | `#f6f1e7` | |
| Linii | `--c-line`, `--c-rule` | `#ebe4d6`, `#f2ece0` | |
| Cerneală | `--c-ink` | `#171c28` | aproape negru, nu `#000` |
| Text secundar | `--c-muted` | `#545b6b` | 6,4:1 |
| Cel mai deschis text | `--c-faint` | `#666d7c` | 4,9:1, doar metadate |
| Contrast închis | `--c-navy` | `#0f1a2e` | inelul de focus, secțiunile închise |
| Brand plin | `--c-sun` | `#ffc21a` | **doar pe semne mici** |
| Text pe tente solare | `--c-sun-ink` | `#7a5200` | 6,3:1 |
| Tente | `--c-sun-50/100/200` | `#fff8e3` / `#fff0c4` / `#ffe08a` | fac suprafețele |
| Stări | `--c-warn-bg` + `--c-warn-ink`, `--c-ok-bg` + `--c-ok`, `--c-crit-bg` + `--c-crit` | | **tentă pală + text închis din aceeași nuanță** |
| Serii în grafice | `--chart-pv`, `--chart-load`, `--chart-battery`… | | aceeași culoare înseamnă același lucru peste tot |

Reguli de culoare:
- Galbenul solar nu e niciodată text pe alb: are contrast prea mic. Pentru text pe galben se folosește navy.
- Culoarea nu e niciodată singurul semnal. Fiecare stare are și iconiță, și cuvânt (de exemplu „Necesită verificare").
- Gradientul cald (auriu → portocaliu) e **lumină**, nu decor: soarele, linia de progres, butonul solar.

### 5.2 Tipografie

| Rol | Font | Unde |
|---|---|---|
| Display | **Unbounded** (Google Fonts), 200–500 | titluri pe landing, titluri de pagină |
| Text | **Onest** (Google Fonts), 300–600 | tot restul |

Scara folosită:

| Element | Dimensiune |
|---|---|
| h1 hero | `clamp(2.6rem, 6.6vw, 6.25rem)` |
| h2 secțiune | `clamp(1.8rem, 3.4vw, 2.9rem)` |
| Text de secțiune | `clamp(1.02rem, 1.25vw, 1.18rem)` |
| Text în aplicație | 15 px |
| Etichete | 13 px |

Reguli:
- `letter-spacing` negativ (−0,025em) pe titluri mari.
- `text-wrap: balance` pe titluri, `pretty` pe paragrafe.
- Rânduri de 34–40 de caractere pe landing și de ~70 în aplicație.
- `font-feature-settings: "tnum"` sau `tabular-nums` pe cifre, ca să se alinieze în tabele și KPI-uri.
- Diacritice corecte, cu virgulă: **ș ț**, nu ş ţ.
- Fără ALL CAPS. Majusculă doar la început de propoziție.
- Accentul vine din greutate și culoare, nu din încă o mărime de font.

### 5.3 Forme, spațiu, stări

- **Raze:** butoanele și pastilele `999px`, cardurile `16px`, câmpurile `12px`.
- **Gutter lateral:** `clamp(16px, 4vw, 48–56px)`.
- **Lățimea conținutului:** `width: min(1200px, 100% - 2 * clamp(16px, 4vw, 48px)); margin-inline: auto;` (`.lp-wrap`). Toate secțiunile o folosesc, deci marginile se aliniază de sus până jos.
- **Ținte de atingere:** minimum 44 px (`.glass { min-height: 44px }`).
- **Focus:** `:focus-visible { outline: 2px solid var(--c-navy); outline-offset: 3px; }` peste tot. Nu se scoate niciodată.
- **Formulare:**
  - etichetă vizibilă deasupra câmpului;
  - eroarea sub câmp, cu `aria-describedby` și `aria-invalid`;
  - câmp gol înseamnă „necunoscut", nu 0.
- **Patru stări pe fiecare ecran:**
  - *se încarcă*: schelet cu forma conținutului;
  - *eroare*: mesajul și butonul „Reîncearcă";
  - *gol*: ce poți face;
  - *date vechi*: ora ultimei măsurători.
- **„Liquid glass"** doar pe butoane, navbar și comutatoare, niciodată pe carduri sau rânduri. Cel mult 6–8 elemente de sticlă vizibile simultan, pentru că `backdrop-filter` e scump.

### 5.4 Textul

- **Ton:** direct, cald, la „tu". Verbe active. Fără superlative („revoluționar").
- **Confirmările** sunt impersonale („Salvat", nu „Am salvat").
- **Glosar fix:** un concept are un singur nume peste tot (de exemplu „incident", nu „tichet" într-un loc și „caz" în altul).
- **Fără afirmații pe care codul nu le susține.** Un linter (`claims`) respinge cuvinte ca „defect confirmat", „% șanse" sau economii fără tarif. Excepțiile intenționate sunt marcate `claims-ok`.
- **Textul trebuie să descrie exact formula.** Am greșit aici o dată: vezi secțiunea 11, punctul 9.

---

## 6. Secțiuni care se îmbină armonios

Ce am învățat construind landing-ul și paginile de informații:

1. **Un singur șablon de cap de secțiune:** kicker mic și colorat (`.lp-kicker`, 0,92rem, 600, portocaliu) → h2 display → paragraf de 34–40 de caractere. Când toate secțiunile încep la fel, ochiul citește pagina ca un tot.
2. **O singură lățime și un singur gutter** (`.lp-wrap`). Marginile stângi ale titlurilor cad pe aceeași verticală de sus până jos.
3. **Ritm vertical generos și elastic:**
   - secțiunile mari: `padding-block: clamp(104px, 13–14vw, 184–200px)`;
   - benzile de legătură (de exemplu sursele de date): `clamp(2.6rem, 4vw, 3.6rem)`.
   - Tudor a cerut explicit „mai mult spațiu între secțiuni" (D-23). Spațiul e cel care face pagina să pară matură.
4. **Fundalurile alternează intenționat:** ivoriu (pagina) → bandă albă cu linii fine sus și jos (`border-block: 1px solid`) → ivoriu → **navy cu o lumină caldă într-un colț** (`radial-gradient(50rem 30rem at 100% 0%, rgb(255 178 26 / .18), transparent 60%), var(--lp-navy)`) → ivoriu → final navy. Secțiunea închisă dintre două luminoase dă respirație și marchează schimbarea de perspectivă.
5. **Treceri care se topesc, nu tăieturi.** Scena parcului solar se termină cu un gradient spre culoarea paginii (`.lp-park::after { background: linear-gradient(rgb(255 249 238 / 0), var(--lp-ivory) 90%) }`), iar textul secțiunii stă pe prim-planul ei. Padding-ul de sus al secțiunii e calculat din înălțimea scenei: `calc(var(--park-h) - clamp(24px, 3vw, 56px))`.
6. **Un fir care leagă pașii.** „Cum funcționează" are o linie de energie verticală (gradient solar → portocaliu) care unește cei patru pași și **se umple odată cu scroll-ul** (`transform: scaleY(calc(var(--sp) / 4))`).
7. **Scenă lipită, text care curge.** În povestea pe pași, ilustrația stă lipită (`position: sticky`), iar pașii trec pe lângă ea. Pasul citit e cel care trece de 55 % din înălțimea ecranului (72 % sub 960 px).
8. **Ordinea secțiunilor spune o poveste:** hero (promisiunea) → surse de date reale (încredere) → cum funcționează (mecanismul) → două perspective, fiecare cu intrarea ei → un exemplu concret de produs → principiile („cifre în care poți avea încredere") → apel final → footer cu paginile de informații.
9. **Elementele care apar în cascadă au întârzieri mici și egale** (`transitionDelay: k * 80ms`, cardurile `k * 100ms`). Nimic nu sare.
10. **Același navbar peste tot** (`GlassNav`). Pe landing e transparent sus și primește bara ivorie translucidă abia când pagina trece pe sub el (`data-scrolled`). Pe mobil (sub 860 px) linkurile intră într-un meniu de sticlă.
11. **`overflow-x: clip`, nu `hidden`**, pe containerul paginii. Umbrele și luminile mari nu mai creează scroll orizontal, iar `position: sticky` continuă să funcționeze.

---

## 7. Animația: principii și tehnici

### 7.1 Principii

- **Frecvența decide:**
  - rar (hero, poveste) → expresiv;
  - zilnic (hover pe butoane) → subtil, 200–450 ms;
  - de sute de ori (navbar) → rapid;
  - tastatură → instant.
- **Animăm doar `transform`, `opacity` și `filter`.** Niciodată `width`, `height`, `top` sau `left`.
- **Curbe ca tokeni:**

| Token | Valoare | Folosire |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | intrări |
| `--ease-in-soft` | `cubic-bezier(0.4, 0, 0.7, 0.2)` | ieșiri: start blând, final rapid |
| `--ease-lichid` | `cubic-bezier(0.34, 1.45, 0.64, 1)` | sticla: mic overshoot elastic |
| `--ease-drop` | `cubic-bezier(0.3, 1.22, 0.42, 1)` | o margine care rămâne în urmă și se așază |

- **Ieșirea e mai rapidă decât intrarea** (pastila navbar-ului: 160 ms la ieșire, 240 ms la intrare).
- **Tranzițiile se pot întrerupe.** Folosim tranziții pe stare, nu keyframe-uri, acolo unde utilizatorul poate schimba direcția (pinul hărții, pastila din navbar).
- **Fără librării de animație.** CSS, SVG și un singur `requestAnimationFrame`.

### 7.2 Tehnicile concrete (toate în repo)

**1. Un singur cititor de scroll → variabile CSS** (`Landing.tsx`)

```ts
let raf = 0;
const read = () => {
  raf = 0;
  // calculează o dată pe cadru, scrie variabile:
  hero.style.setProperty("--hero", clamp01(scrollY / (heroHeight * 0.9)).toFixed(4)); // 0→1 cât iese hero-ul
  park.style.setProperty("--park", clamp01((vh - rect.top) / (rect.height * 0.85)).toFixed(4));
  story.style.setProperty("--sp", sumaProgresuluiPașilor.toFixed(3));                 // 0→4
};
const onScroll = () => { if (!raf) raf = requestAnimationFrame(read); };
addEventListener("scroll", onScroll, { passive: true });
```

CSS-ul face restul:
- `transform: translateY(calc(var(--hero) * -56px)); opacity: calc(1 - var(--hero) * .85); filter: blur(calc(var(--hero) * 6px));`
- Fazele unei povești se derivă **în CSS**, din aceeași variabilă, cu `clamp()`:

```css
--d1:    clamp(0, calc(var(--sp) - 1), 1);          /* referința se desenează în pasul 2 */
--d2:    clamp(0, calc((var(--sp) - 2) * 1.25), 1); /* producția măsurată */
--alert: clamp(0, calc((var(--sp) - 2.6) * 4), 1);  /* alerta apare scurt și ferm */
--dec:   clamp(0, calc((var(--sp) - 3.2) * 2.5), 1);/* decizia */
```

Parcul solar a folosit aceeași tehnică: `--rows`, `--scan`, `--flag` și `--van` sunt derivate din `--park`. Rândurile de panouri se așază, o scanare traversează câmpul, un string e marcat, iar duba O&M merge la el.

**2. Apariții la intrarea în ecran** (`IntersectionObserver`, `rootMargin: "0px 0px -10% 0px"`, `threshold: 0.12`)

Elementele `[data-reveal]` pornesc cu `opacity: 0; translateY(18px)` și primesc `.is-in` **o singură dată** (apoi `unobserve`). Durata e de 0,7 s pe `--ease-out`. Fără `IntersectionObserver`, totul e vizibil din start.

**3. Scena 2.5D în SVG pur** (`SolarScene.tsx`)

- **Proiecție izometrică dintr-o funcție:**

```ts
const P = (i, j, h = 0) => [C[0] + (i - j) * S, C[1] + ((i + j) * S) / 2 - h]; // punct pe grilă, ridicat cu h
```

- Placa, panourile, casa, bateria și stâlpul sunt poligoane calculate.
- **Straturi** (`lp-layer--far`, `lp-layer--mid`) pentru parallax.
- **Gradiente în `<defs>`** pentru lumină.
- **Bucle lente pe loc:**

| Animație | Ce face | Durată |
|---|---|---|
| `lp-breathe` | respirația strălucirii soarelui | 6 s |
| `lp-spin` | rotirea razelor | 40 s |
| `lp-flow` | energia care curge pe trasee, `stroke-dashoffset` | 1,1–1,6 s |
| `lp-sweep` | reflexia care trece peste panouri, cu `clipPath` | 4,2 s |
| `lp-charge` | barele bateriei | 3,2 s |

- Întârzieri decalate (`animationDelay: k * 0.35s`).
- Totul e `aria-hidden`. Scena se desenează fără JavaScript și nu are nevoie de imagine de rezervă.

**4. Parallax după pointer**

`pointermove` → un `requestAnimationFrame` → `--px` / `--py` între −1 și 1 → `transform: translate(calc(var(--px) * -10px), …)` pe straturi, cu amplitudini diferite. Funcționează doar cu mouse (`pointerType === "mouse"`) și doar cu mișcare completă.

**5. Lumină care urmărește pointerul și o ușoară înclinare** (cardurile de cont, caseta finală)

`--mx` / `--my` în procente → `radial-gradient(420px circle at var(--mx) var(--my), …)` pe `::before`, plus `perspective(1000px) rotateX(calc(var(--ty) * -3deg)) rotateY(calc(var(--tx) * 3deg))`. La revenire, 500 ms pe `--ease-out`.

**6. Sticla lichidă a butoanelor** (`.glass` în `index.css`)

Straturile:
- un gradient alb translucid;
- `backdrop-filter: blur(14px) saturate(170%)`;
- o margine luminoasă făcută cu `mask-composite: exclude` pe `::before`;
- o strălucire care urmărește cursorul pe `::after`, pusă de **un singur listener delegat** pe document (`trackGlassHighlight`).

Comportamentul:
- hover: `translateY(-1px) scale(1.02)`;
- apăsare: `scaleX(1.03) scaleY(0.95)` în 120 ms, adică „se turtește";
- refracție reală (un filtru SVG `feTurbulence` + `feDisplacementMap`) **doar pe Chromium**, prin clasa `html.refractie` pusă în `main.tsx`.

**7. Pastila din navbar care „curge" între linkuri** (`GlassNav.tsx` + `index.css`)

- Marginile stânga și dreapta sunt variabile **tipate** cu `@property --pl / --pr { syntax: "<length>" }`. Fără tipare, ar sări în loc să se interpoleze.
- Pastila e desenată cu `clip-path: inset(5px var(--pr) 5px var(--pl) round 999px)`.
- **Marginea din direcția mișcării ajunge prima** (260 ms, `--ease-out`). **Cealaltă vine din urmă** (460 ms, `--ease-drop`, cu un mic overshoot). Asta dă senzația de lichid care se întinde.
- La focus din tastatură sau cu mișcare redusă: `data-instant`, cu durata 0.
- La plecarea mouse-ului, pastila se estompează pe loc.

**8. „Sticla se condensează"** (`.apare` / `.vizibil`)

Butoanele nu apar brusc:
- de la `opacity 0; translateY(16px) scale(.94); blur(10px)`;
- la starea normală, în 0,55–0,8 s, cu overshoot;
- în cascadă: `calc(var(--i) * 90ms)`.

Pragurile au **histerezis**: în prototipul inițial (FEAT-008), butoanele finale apăreau la 6,22 și dispăreau la 6,10. Așa nu pâlpâie când utilizatorul se oprește exact la limită.

**9. Scroll lin doar pentru rotița cu treceri** (`smoothWheel.ts`)

- Se preiau doar rotițele „cu treceri" (`deltaMode === 1` sau pași întregi de cel puțin 50 px).
- Trackpad-ul, tastatura și atingerea rămân native.
- 14 % din distanța rămasă pe cadru, corectat pentru rata de cadre.
- Doar cu mișcare completă.

**10. Pinul de pe hartă** (`location.css`)

Ca la Bolt sau Uber:
- pinul e fix în centru;
- se ridică în 160 ms cât timp harta se mișcă;
- se așază în 220 ms cu `cubic-bezier(0.34, 1.4, 0.64, 1)`, adică un mic overshoot;
- tranziții pe stare, ca o nouă tragere să întrerupă așezarea.

**11. Grafice care răspund la pointer**

Ce nu e sub pointer se estompează (`[data-dim]`). Ziua de sub cursor își arată golul de date. Liniile se desenează o dată (`clip-path`), nu la fiecare scroll.

### 7.3 Mișcarea redusă (cum am făcut-o corect)

- **Preferința stă pe `<html data-motion="full|reduced">`** (`hooks/motion.ts`). Implicit vine din setarea sistemului (`prefers-reduced-motion`). Pe landing există un buton „Animații" care o comută, iar alegerea se ține în `localStorage` (cheia `ei-motion`). E aplicată **înainte de primul paint** (`applyMotion()` în `main.tsx`).
- **CSS-ul citește un singur selector** (`html[data-motion="reduced"] …`). În modul redus:
  - dispar parallax-ul, ridicările, blur-urile legate de scroll, înclinarea, scroll-ul lin și alunecarea pastilei;
  - povestea înaintează **în pași întregi**: `--sp` primește valori întregi, iar fiecare stare apare printr-un fade;
  - aparițiile devin doar opacitate.
- **Lecția importantă:** prima variantă oprea *tot*. Pe Windows-ul lui Tudor (cu efectele de animație oprite) pagina părea moartă. Corect: **buclele lente, pe loc**, ale scenei (lumina, razele, curgerea energiei) **rămân**, pentru că nu deplasează nimic în câmpul vizual. Rămân și fade-urile.
- **Efectele care decid o singură dată dacă pornesc** (parallax-ul) verifică `motionReduced()` în JavaScript.

---

## 8. Resurse: cum le-am obținut

- **Ilustrații:** nicio imagine de stoc. Scena solară, parcul solar, marca (un soare în SVG) și diagramele sunt **desenate în cod** (SVG calculat). Ce câștigăm: zero kilobytes de imagini, claritate la orice rezoluție, culori din tokeni, animabile cu CSS, funcționează fără JavaScript.
- **Iconițe:** `lucide-react` (SVG, cu `aria-hidden` când sunt decorative; butoanele care au doar iconiță primesc `aria-label`). Niciodată emoji ca iconițe.
- **Fonturi:** Google Fonts. În `index.html` stau `preconnect` la `fonts.googleapis.com` și `fonts.gstatic.com` (`crossorigin`), apoi un singur `<link>` cu ambele familii, ca intervale de greutate (`wght@300..600`) și cu `display=swap`.
- **Hărți:** Leaflet și plăcile OpenStreetMap, cu atribuirea vizibilă (o cere politica lor). Lângă hartă scrie ce vede OSM: zona vizualizată, nu datele contului.
- **Date și texte:** doar din proiect (seturi de date publice numite, incidentul demo din seed). Unde lipsește o cifră, `[__]`, niciodată o valoare inventată.
- **Referințele lui Tudor:**
  - `referinta_index.css` copiat ca bază pentru `index.css` (`cp …/Downloads/referinta_index.css frontend/src/index.css`), apoi rescris pe tokeni;
  - prototipul HTML portat în React secțiune cu secțiune;
  - brief-ul păstrat ca sursă de decizii.
- **Capturi pentru prezentări:** din panoul de browser al aplicației Claude (`preview_start` pe serverul de dev, `resize_window` la 1440×900, `screenshot`), apoi încărcate în deck.
- **Poze reale, când un site are nevoie** (n-a fost cazul aici): `taste-skill/scripts/assets.mjs` caută fotografii fără chei de API. Verifici mereu licența și o notezi.

---

## 9. Optimizare

| Ce | Cum | Unde |
|---|---|---|
| Pagini grele încărcate la nevoie | `lazy(() => import(...))` + `Suspense` pentru vederea instalației și a incidentului (cu graficele) | `App.tsx` |
| SDK de autentificare | `import("@supabase/supabase-js")` doar când e nevoie de el | `auth/supabase.ts` |
| Hartă | Leaflet încărcat lazy, doar pe cele două pagini cu formularul de locație | `LocationPicker.tsx` |
| O singură cerere pentru aceleași date | cererile simultane către același portofoliu împart un `Promise` (o hartă `pending` după scope) | `App.tsx` |
| Scroll | un singur listener `passive`, un `requestAnimationFrame` pe cadru, valorile scrise ca variabile CSS (fără re-render React) | `Landing.tsx` |
| Pointer | un singur listener delegat pe document pentru toate butoanele de sticlă | `glass.tsx` |
| Compoziție GPU | doar `transform`, `opacity`, `filter`; `isolation: isolate` pe elementele cu straturi | CSS |
| `backdrop-filter` | cel mult 6–8 elemente de sticlă vizibile simultan; refracția SVG doar pe Chromium | `index.css`, `main.tsx` |
| Fără layout shift | scheletele au forma conținutului; harta are înălțime fixă (`clamp(260px, 42vh, 380px)`) | componente |
| Imagini | niciuna raster pe landing: SVG inline | `SolarScene.tsx`, `SolarPark.tsx` |
| Fonturi | `preconnect`, `display=swap`, intervale de greutate, doar 2 familii | `index.html` |
| Buclele infinite | lungi și ieftine (rotiri de 40 s, opacitate), doar pe elemente mici | `landing.css` |
| Siguranța bundle-ului | `verify.sh` caută secrete în `dist/` după build | scripturi |

Ce aș măsura la un site nou, dacă am timp:
- ~60 fps timp de 2 secunde, cu `requestAnimationFrame`, în timpul scroll-ului (ghidul prototipului a avut 60 fps la 1440×900);
- Lighthouse pentru LCP și CLS.

---

## 10. Verificare: ce am rulat de fiecare dată

**Automat** (în `frontend/`):

```bash
npx tsc --noEmit
```

```bash
npx eslint src
```

```bash
npx vitest run
```

```bash
npx vite build
```

Plus scriptul complet al repo-ului (`bash scripts/verify.sh`), care adaugă linterul de afirmații și scanarea de secrete.

Testele sunt scrise pe ce **vede și face utilizatorul** (Testing Library: roluri, etichete, texte), nu pe detalii interne. Exemple:
- „avatarul se numește «Contul meu, Nume» și duce la `#/cont`";
- „cuvântul «defect» nu apare nicăieri";
- „nicio culoare hex în componente".

**În browser** (panoul de browser al aplicației sau Playwright):

1. Pornești serverul de dev în modul cu date mock (ca să nu depinzi de backend).
2. Verifici cele patru dimensiuni: 1440×900, 1366×768, 390×844, 360×740.
3. Scroll orizontal: `document.documentElement.scrollWidth === innerWidth`, la mai multe poziții de scroll.
4. Consola: zero erori.
5. Mișcarea: eșantionezi variabilele CSS la jumătatea animației (de exemplu `--pl` / `--pr` în timp ce pastila alunecă, `--sp` în timpul scroll-ului).
6. Mișcarea redusă: animațiile rămase sunt doar cele permise, iar `transform` pe straturile de parallax e `none`.
7. Tastatura: Tab prin navbar, focus vizibil, Escape închide meniurile.
8. Iei capturi și te **uiți** la ele: suprapuneri, texte care se lovesc de ilustrații, butoane care cad pe al doilea rând.

**Ce raportezi:** comanda, rezultatul exact (de exemplu „134/134 PASS"), erorile vechi separat de ale tale și ce nu ai putut verifica (de exemplu: geolocația reală, serverul de producție).

---

## 11. Greșeli pe care le-am făcut deja (nu le repeta)

1. **Mișcarea redusă oprea tot**, iar pagina părea statică. Soluția e în secțiunea 7.3: buclele lente pe loc rămân, dispare doar ce se deplasează.
2. **Valori hex de rezervă** (`var(--x, #abc)`) au picat testul de tokeni. Folosește doar tokeni.
3. **`overflow-x: hidden`** a stricat `position: sticky`. Se folosește `clip`.
4. **Umbrele difuze mari** au creat 36 px de scroll orizontal la 360 px. Verifică `scrollWidth` la fiecare lățime.
5. **Butonul „Meniu" cădea pe al doilea rând** pe mobil. Sub breakpoint ascunzi complet navigarea de desktop, nu o micșorezi.
6. **Ilustrația concura cu titlul:** textul hero se suprapunea peste case și razele soarelui peste panouri. Le muți și le redimensionezi după captură, nu după intuiție.
7. **Etichete pe care utilizatorul nu le voia** („Date simulate", „demo", insigne, note sub butoane). Când Tudor cere să dispară, dispar din toate locurile, inclusiv din teste, iar decizia se scrie în notă.
8. **ID-uri de feature duplicate** între ramuri. Înainte să numerotezi, verifici toate ramurile, nu doar pe a ta.
9. **Textul nu spunea exact ce face codul.** Am scris „scorul crește cu energia pierdută, cu zilele și cu acoperirea", dar formula reală era „deficitul relativ în %" (sau „100 − acoperirea" pentru datele lipsă). **Înainte să explici ceva în interfață, citește codul care calculează.**
10. **Pe Windows:** heredoc-urile cu backtick-uri și diacriticele în consolă (`cp1252`) au stricat comenzi. Pentru editări complexe scrii un mic script Python cu `encoding="utf-8"`. Pentru afișare setezi `PYTHONIOENCODING=utf-8`.
11. **Testele „reci"** au depășit timpul la prima rulare. Mărești `asyncUtilTimeout` în setup și raportezi onest că au trecut la a doua rulare.
12. **Am presupus în loc să întreb**, de exemplu numerotarea sau ce înseamnă „push" când totul era deja pe GitHub. Verifici întâi starea reală (`git status`, PR-ul, CI-ul), apoi răspunzi.

---

## 12. Pornind de la zero: rețeta minimă

Stack-ul care a mers bine:
- React 19, Vite 8, TypeScript;
- Tailwind 4 (cu `@tailwindcss/vite` și tokenii în `@theme inline`);
- `lucide-react`;
- Recharts pentru grafice;
- Vitest și Testing Library;
- rutare prin hash (adrese care pot fi trimise, butonul „Înapoi" funcționează, fără configurare de server).

Ordinea de lucru:

1. **Brief și conținut:**
   - ce e produsul;
   - pentru cine;
   - ce trebuie să simtă vizitatorul în primele 5 secunde;
   - ce conținut real există (texte, cifre, imagini).
2. **Direcția** (secțiunea 1.4):
   - `taste-skill`: `draw.mjs` pentru pagini, `--app` pentru ecrane de aplicație;
   - `ui-ux-pro-max --design-system`;
   - alegi și spui de ce.
3. **`index.html`:**
   - `lang` corect;
   - `viewport`, `theme-color`, titlu, descriere;
   - fonturile cu `preconnect` și `display=swap`.
4. **`index.css`:**
   - primitive pe `:root`;
   - roluri semantice;
   - `@theme inline`;
   - focus, selecție, `text-wrap`, cifre tabulare;
   - clasele de componentă în `@layer components`;
   - curbele de mișcare;
   - blocul de mișcare redusă.
5. **Shell-ul:** navbar (un singur component peste tot), layout, rutare, starea de mișcare pe `<html>`.
6. **Pagina „în gri":** secțiunile în ordinea poveștii, cu lățimea și ritmul din secțiunea 6, fără animație. Trebuie să arate bine deja așa.
7. **Ilustrația principală:** SVG calculat, cu straturi, `aria-hidden`.
8. **Mișcarea:**
   - cititorul de scroll;
   - aparițiile;
   - buclele scenei;
   - interacțiunile;
   - varianta redusă scrisă în același timp.
9. **Teste și browser** (secțiunea 10). Apoi bucla „te uiți → corectezi → te uiți din nou" până când capturile arată bine la toate lățimile.
10. **PR-ul:** ce a rulat, ce nu a rulat, capturi, decizii.

---

## 13. „Gata" înseamnă

- [ ] doar tokeni, nicio culoare hex în componente;
- [ ] stările încărcare, eroare, gol și date vechi pe fiecare ecran cu date;
- [ ] contrast AA pe tot textul și focus vizibil peste tot;
- [ ] ținte de minimum 44 px;
- [ ] `lang` setat;
- [ ] decorul are `aria-hidden`;
- [ ] zero scroll orizontal la 360 px;
- [ ] consolă curată;
- [ ] mișcarea redusă verificată: pagina e vie, dar nimic nu se deplasează;
- [ ] niciun text care promite ce codul nu face; nicio cifră inventată;
- [ ] typecheck, lint, teste și build trec, iar rezultatul e raportat exact;
- [ ] capturi la 1440×900, 1366×768, 390×844 și 360×740;
- [ ] backup făcut înainte de redesign;
- [ ] notă cu deciziile și dovezile;
- [ ] recapitulare: ce s-a schimbat, ce a rulat, ce nu e verificat.
