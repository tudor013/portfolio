/**
 * The hero's ID badge: the React Bits lanyard (scripts/lanyard.ts) in full
 * motion mode, the static DOM card everywhere else.
 *
 * Why three.js is loaded only in full mode: it is about 150 KB compressed, and
 * the Performance threshold is measured in reduced mode. The DOM card is the
 * same object standing still, so reduced mode and no-script readers lose the
 * swing, not the content.
 *
 * The 3D card's faces are painted here from the DOM card's own text and
 * photo, so there is one source for what the badge says.
 */
import { motionIsFull, onMotionChange } from './motion';
import type { Lanyard } from './lanyard';

/** The card's face in pixels; the lanyard's portrait card is 1.6 × 2.25. */
const FACE_WIDTH = 1024;
const FACE_HEIGHT = 1440;

/**
 * The LinkedIn button on the back, as fractions of the face from the top
 * left. Painted from this and hit-tested against it (lanyard.ts, backLink),
 * so the drawing and the tap area cannot drift apart. 200px of 1440 is about
 * 48 CSS px on the card as it hangs on a laptop.
 */
const LINK_RECT: [number, number, number, number] = [180 / 1024, 800 / 1440, 844 / 1024, 1000 / 1440];

function token(root: HTMLElement, name: string): string {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function surface(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d')! };
}

interface Faces {
  front: string;
  back: string;
  strap: string;
}

async function paintFaces(root: HTMLElement): Promise<Faces> {
  const text = (selector: string) => root.querySelector(selector)?.textContent?.trim() ?? '';
  const name = text('.name');
  const role = text('.role');
  const id = text('.id');

  const card = token(root, '--badge-card');
  const ink = token(root, '--ink');
  const muted = token(root, '--muted');
  const strap = token(root, '--badge-strap');
  const family = getComputedStyle(root.querySelector('.name')!).fontFamily;

  // The canvas draws with whatever font is ready; without this the name
  // would be painted once in the fallback serif and stay that way.
  // Only the first family is asked for: the generated metric fallback face
  // after it has no file, and asking for it rejects the whole load.
  const first = family.split(',')[0];
  await Promise.all(
    ['600 76px', '400 52px', '500 52px'].map((spec) => document.fonts.load(`${spec} ${first}`).catch(() => [])),
  );
  const portrait = await loadImage(root.dataset.portrait!);

  // ---- Front: the DOM card's layout at five times the size ---------------
  // The top 160px stay clear: the lanyard punches its strap slot there.
  const front = surface(FACE_WIDTH, FACE_HEIGHT);
  {
    const { ctx } = front;
    ctx.fillStyle = card;
    ctx.fillRect(0, 0, FACE_WIDTH, FACE_HEIGHT);

    const side = 560;
    const x = (FACE_WIDTH - side) / 2;
    const y = 220;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, side, side, 20);
    ctx.clip();
    const scale = Math.max(side / portrait.width, side / portrait.height);
    const w = portrait.width * scale;
    const h = portrait.height * scale;
    ctx.drawImage(portrait, x + (side - w) / 2, y + (side - h) / 2, w, h);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = ink;
    ctx.font = `600 76px ${family}`;
    ctx.fillText(name, FACE_WIDTH / 2, 920, FACE_WIDTH - 120);
    ctx.fillStyle = muted;
    ctx.font = `400 52px ${family}`;
    ctx.fillText(role, FACE_WIDTH / 2, 1004, FACE_WIDTH - 120);

    // The strap's colour printed across the card, as on the DOM card.
    ctx.fillStyle = strap;
    ctx.fillRect(80, 1130, FACE_WIDTH - 160, 14);
    ctx.font = `500 52px ${family}`;
    ctx.fillText(id, FACE_WIDTH / 2, 1250);

    // Says the card has a back: the LinkedIn button is there.
    ctx.fillStyle = muted;
    ctx.font = `400 40px ${family}`;
    ctx.fillText('Tap to turn it over', FACE_WIDTH / 2, 1360);
  }

  // ---- Back: the strap's blue, the name, the ID and the LinkedIn button ---
  const back = surface(FACE_WIDTH, FACE_HEIGHT);
  {
    const { ctx } = back;
    ctx.fillStyle = strap;
    ctx.fillRect(0, 0, FACE_WIDTH, FACE_HEIGHT);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = card;
    ctx.font = `600 76px ${family}`;
    ctx.fillText(name, FACE_WIDTH / 2, 600, FACE_WIDTH - 120);
    ctx.font = `500 52px ${family}`;
    ctx.fillText(id, FACE_WIDTH / 2, 690);

    // A solid button in the card's white, so it reads as something to press.
    const [x0, y0, x1, y1] = LINK_RECT;
    ctx.beginPath();
    ctx.roundRect(x0 * FACE_WIDTH, y0 * FACE_HEIGHT, (x1 - x0) * FACE_WIDTH, (y1 - y0) * FACE_HEIGHT, 24);
    ctx.fill();
    ctx.fillStyle = strap;
    ctx.font = `600 68px ${family}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('LinkedIn ↗', FACE_WIDTH / 2, ((y0 + y1) / 2) * FACE_HEIGHT + 4);
  }

  // ---- Strap: the name woven in, along its length ------------------------
  // The lanyard lays the image's width along the strap and its height across.
  const across = 192;
  const along = 1400;
  const band = surface(along, across);
  {
    const { ctx } = band;
    ctx.fillStyle = strap;
    ctx.fillRect(0, 0, along, across);
    ctx.fillStyle = card;
    ctx.font = `500 80px ${family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, along / 2, across / 2 + 4);
  }

  return {
    front: front.canvas.toDataURL('image/png'),
    back: back.canvas.toDataURL('image/png'),
    strap: band.canvas.toDataURL('image/png'),
  };
}

export function initBadge(root: HTMLElement): void {
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const link = root.querySelector<HTMLAnchorElement>('[data-linkedin]')!;
  let lanyard: Lanyard | null = null;
  let faces: Promise<Faces> | null = null;
  // Each sync supersedes the one before; a slow import must not start a
  // lanyard after the reader has switched motion off again.
  let generation = 0;

  async function sync(): Promise<void> {
    const mine = ++generation;

    if (!motionIsFull()) {
      lanyard?.destroy();
      lanyard = null;
      root.removeAttribute('data-live');
      link.removeAttribute('tabindex');
      return;
    }
    if (lanyard) return;

    faces ??= paintFaces(root);
    const [{ initLanyard }, painted] = await Promise.all([import('./lanyard'), faces]);
    if (mine !== generation || lanyard) return;

    lanyard = initLanyard(stage, {
      frontImage: painted.front,
      backImage: painted.back,
      strapImage: painted.strap,
      strapColor: token(root, '--badge-strap'),
      cardColor: token(root, '--badge-card'),
      finish: 'glossy',
      metal: 'silver',
      size: 0.42,
      strapLength: 0.42,
      strapWidth: 0.8,
      cornerRadius: 0.25,
      backLink: { href: link.href, rect: LINK_RECT },
    });
    // No WebGL: the DOM card simply stays.
    if (lanyard) {
      root.dataset.live = '';
      // The DOM card is off screen now, so its link must not take a keyboard
      // stop that shows nothing; LinkedIn stays in the contact section.
      link.tabIndex = -1;
    }
  }

  onMotionChange(() => void sync());
  void sync();
}
