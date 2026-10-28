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
  Fundamentalists ended richer than technical traders in 93 to 100% of runs,
  whichever setting was changed. The settings changed the size of the gap,
  never the winner.
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

## How the comparison was run

Each setting was changed on its own, starting from the model's defaults (500
agents, 70% fundamentalists, 20% herding probability, news impact 8), with
everything else held fixed. Each combination ran 40 times, every time on a
different random sequence of news, so that one lucky sequence could not
decide the result. A group's result is its average wealth after 500 days:
cash plus shares at the final price, against the 15,000 every agent starts
with.

The runs used the model as rebuilt on this site, which follows the NetLogo
code rule for rule. NetLogo draws its own random numbers, so its runs will not
match these number for number.

## What the comparison showed

I expected the winning strategy to depend on the settings. In this model it
does not. At the defaults, fundamentalists ended **22.8% richer** on average
and technical traders **2.6% poorer**, and fundamentalists finished ahead in
all 40 runs. Changing the share of fundamentalists, the herding probability
or the news impact moved the average gap between about 12 and 34 percentage
points, but never reversed it.

The reason is in the rules. A fundamentalist buys only below the value and
sells only above it. A technical trader's direction is a coin flip, with no
information behind it.
