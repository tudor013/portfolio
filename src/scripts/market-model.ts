/**
 * Tudor's NetLogo market, rebuilt rule for rule. The original's procedure,
 * variable names translated:
 *
 *   each tick (500 of them):
 *     fundamental value += (random-float 2 - 1) * news impact
 *     fundamentalists: if price < value and cash > price → buy one share
 *                      else if price > value and shares > 0 → sell one
 *     technical traders: with the herding probability, flip a coin:
 *                      heads and cash > price → buy, otherwise if shares > 0 → sell
 *     price += (demand - supply) * 0.05, and never below 1
 *
 * Every agent starts with 10,000 in cash and 50 shares; price and value both
 * start at 100. Nothing here is "fixed" or tuned: technical traders really do
 * trade on a coin flip, because that is what the model says.
 *
 * NetLogo draws its random numbers from its own generator, so a run here will
 * not match a run there number for number. The rules are the same; the news
 * is different. A seeded generator makes every run here repeatable, which is
 * what lets scrolling scrub back and forth through one run.
 */

export interface MarketSettings {
  /** numar-total-agenti, 10–500 */
  agents: number;
  /** procent-fundamentalisti, 0–100 */
  fundamentalists: number;
  /** probabilitate-herding, 0–100 */
  herding: number;
  /** impact-stiri, 0–10 */
  news: number;
}

export const DEFAULTS: MarketSettings = { agents: 500, fundamentalists: 70, herding: 20, news: 8 };

export const DAYS = 500;

export interface MarketRun {
  /** Index 0 is the starting state; index d is the end of day d. */
  price: Float64Array;
  value: Float64Array;
}

/** mulberry32: a small, fast, seedable generator, good enough for a model. */
function generator(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function runMarket(settings: MarketSettings, seed: number): MarketRun {
  const random = generator(seed);

  // create-fundamentalisti (N * pct / 100); NetLogo rounds the count down.
  const fundamentalistCount = Math.floor((settings.agents * settings.fundamentalists) / 100);
  const technicalCount = Math.floor((settings.agents * (100 - settings.fundamentalists)) / 100);

  const fundamentalists = {
    cash: new Float64Array(fundamentalistCount).fill(10000),
    shares: new Int32Array(fundamentalistCount).fill(50),
  };
  const technicals = {
    cash: new Float64Array(technicalCount).fill(10000),
    shares: new Int32Array(technicalCount).fill(50),
  };

  const price = new Float64Array(DAYS + 1);
  const value = new Float64Array(DAYS + 1);
  let currentPrice = 100;
  let currentValue = 100;
  price[0] = currentPrice;
  value[0] = currentValue;

  for (let day = 1; day <= DAYS; day++) {
    currentValue += (random() * 2 - 1) * settings.news;

    let demand = 0;
    let supply = 0;

    for (let i = 0; i < fundamentalistCount; i++) {
      if (currentPrice < currentValue && fundamentalists.cash[i] > currentPrice) {
        fundamentalists.cash[i] -= currentPrice;
        fundamentalists.shares[i] += 1;
        demand += 1;
      } else if (currentPrice > currentValue && fundamentalists.shares[i] > 0) {
        fundamentalists.cash[i] += currentPrice;
        fundamentalists.shares[i] -= 1;
        supply += 1;
      }
    }

    for (let i = 0; i < technicalCount; i++) {
      if (random() * 100 < settings.herding) {
        const heads = Math.floor(random() * 2) === 0;
        if (heads && technicals.cash[i] > currentPrice) {
          technicals.cash[i] -= currentPrice;
          technicals.shares[i] += 1;
          demand += 1;
        } else if (technicals.shares[i] > 0) {
          technicals.cash[i] += currentPrice;
          technicals.shares[i] -= 1;
          supply += 1;
        }
      }
    }

    currentPrice += (demand - supply) * 0.05;
    if (currentPrice < 1) currentPrice = 1;

    price[day] = currentPrice;
    value[day] = currentValue;
  }

  return { price, value };
}
