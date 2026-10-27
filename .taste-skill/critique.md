# Landing page critique — taste-skill §4 format

Direction dealt: **The quiet instrument**, seed 1940305872 (`.taste-skill/direction.json`),
sector personal-portfolio, tone technical, palette kept from the brand (Blueprint).

## ROUND 1 (27.10.2026, after inspect.mjs: 0 FAIL, 3 WARN)

Seen in one second: a large serif name, a white ID badge hanging on a blue strap beside it, and a
band of blueprint blue along the bottom edge that says the page goes on.

Idea (one sentence): On this page, Tudor's own models and drawings become scenes that run as you
scroll.

Live thing: his NetLogo market, rebuilt rule for rule, with his four sliders and a re-run button.

Layout words by section: hero=column on one line + hanging object / schema=held blueprint drawing
with a title block in its empty corner / intro=lead over four columns / market=split live demo /
aruna=held crossfade beside a text column / work=quiet ledger with side preview / about=centred
letter / contact=sentence and two links / footer=single quiet line.

Scores: design 7.5 · usability 8 · creativity 8 · content 7.5 → overall 7.8.

Caps applied: none by the meter. A strict juror could apply the "shadow on a resting element" cap
(6.5) to the badge: it carries the page's only shadow because it is a physical object that hangs
in front of the page and can be dragged. Tudor asked for a realistic badge twice; the shadow is
kept on purpose and marked `taste-skill-ignore` in the source.

Top three problems (most visible first):
1. The market chart reads as a dense band before it reads as a line (desktop-film, screen 9):
   with 350 identical fundamentalists the price jumps about 17 points nearly every day. This is the
   model, not a bug. Fixed as far as honesty allows: the price is a hairline underneath, the value
   a heavy blue line on top, and the legend tells them apart by weight as well as colour.
2. The ledger shows three previews at once when nothing is hovered (desktop-page-03): it fills the
   right half, as the frame rule asks, but is busier than the hovered state. Kept for now; the
   alternative was an empty half-screen.
3. On a phone the schema cannot be held (the drawing is 2.3:1), so it scrolls sideways inside its
   own box with a note saying so (mobile-page-01). Readable, but the scene's build is a desktop
   experience only, in line with Tudor's desktop-first decision.

## ROUND 2 (after the ChatGPT drafting-sheet patch; inspect.mjs: 0 FAIL, 3 WARN)

What changed on screen: a faint drafting sheet (grid, an elevation, dimension ticks) behind the
badge, a "Motion" toggle top right, and the four links in one group in the header.

New finding, kept but noted: the elevation drawn in the sheet is a house. It is decorative and
says nothing about Tudor's work, and a reader may take it for architecture. A drawing made from
his own material (the schema's outline, for instance) would carry the idea further. Left as
the patch drew it, because Tudor asked for that work to go in as made.

### Warnings defended
- `no-footage`: no honest clip exists. The Spline scenes cannot be recorded from here, and stock
  footage would show someone else's world. The moving pictures are the live market and the Aruna
  stills pushing in with the scroll.
- `pinned-over-picture` ("A seat sold once"): the title block sits in the drawing's own empty
  bottom-right corner, where a real blueprint keeps its title block. No table or line passes under
  it at any point of the scene.
- `long-pin` (3 screens): a held stage with a two-screen hold is three screens by construction
  (slide in, hold, let go). The caption and the drawing change on every screen of it.
