---
title: 'Agent-based market simulation'
category: data
year: 2026
role: >-
  Built the model in NetLogo: a market where two populations of agents meet.
  Fundamentalists price against an underlying value; technical traders join
  in with a set probability and then buy or sell at random. Both trade in the
  same market, so the two can be compared under identical conditions. Grounded in Chen,
  Zheng and Tan's agent-based model of asymmetric trading and herding
  (PLOS One, 2013), reviewed as part of the same course.
stack:
  - NetLogo
kind: 'Agent-based model'
problem: >-
  Fundamentals-based analysis and herd behaviour are usually argued about
  rather than measured. A simulation lets both run against the same sequence
  of events and be compared directly.
results: >-
  TODO(conținut): ce a ieșit. Care strategie, în ce condiții, cu ce diferență?
  Un rezultat negativ sau surprinzător e la fel de bun — contează că l-ai
  măsurat.
cover:
  src: '../../assets/landing/market-run.webp'
  alt: >-
    A run of the market model: the price as a thin black line swinging around the fundamental value, a heavy blue line, over 500 days.
order: 10
draft: false
links:
  - label: 'Chen, Zheng & Tan (2013) — the paper the model follows'
    url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0079531'
---

## How the market is modelled

Every agent starts with 10,000 in cash and 50 shares, and the price and the
fundamental value both start at 100. Each tick:

- **News** moves the fundamental value by a random amount, up to the news
  impact in either direction.
- **Fundamentalists** buy one share when the price is below the value and
  they can afford it, and sell one when it is above and they hold any.
- **Technical traders** act only with the herding probability; when they do,
  a coin flip decides whether they buy or sell.
- **The price** moves by 0.05 for every unit of excess demand, and never
  falls below 1.

The run stops after 500 ticks. Four sliders set the market: the number of
agents (10–500), the share of fundamentalists, the herding probability and the
news impact (0–10).

TODO(conținut): ce ai ținut constant între rulări și de ce.

## What the comparison showed

TODO(conținut): aici pui cifra. Și spune față de ce — o strategie e bună doar
în comparație cu o alternativă.
