---
title: 'Depth and pressure: a regression from first principles'
category: data
year: 2026
role: >-
  Wrote this as an exercise for the students who came to Soft Tehnica for
  their internship. It generates 25 depth readings with a
  known pressure gradient and noise, fits a linear regression, and draws the
  points, the fitted line and the axes by hand on a turtle canvas rather than
  handing the plot to a charting library.
stack:
  - Python
  - SciPy
  - turtle
kind: 'Regression from first principles'
problem: >-
  An exercise had to teach linear regression in a setting the students would
  recognise: pressure rising with depth, as in petroleum and gas engineering.
  It also had to show that a regression always returns a line, right or not,
  and that only data with a known answer lets you check it.
results: >-
  The estimated gradient was 0.6004 psi per metre, against the 0.6 written
  into the data: 0.06% off, with depth explaining 97.8% of the variation in
  pressure.
order: 30
draft: false
links: []
---

## Data with a known answer

The 25 readings are generated, not measured. Each depth is drawn between 500
and 4,000 metres, and its pressure is 0.6 psi per metre of depth plus random
noise of up to 150 psi either way. The random generator is seeded, so every
run produces the same data and the same result. Knowing the true gradient
before estimating it turns the exercise from "I ran a regression" into "I
checked that the regression gives the right answer".

## The result

SciPy's `linregress` fitted the line:

- **Slope:** 0.6004 psi per metre, against the true 0.6. Its standard error
  is 0.019, so the true value lies well inside the estimate's uncertainty.
- **Intercept:** 25 psi, against a true 0. That is well within the ±150 psi
  of noise.
- **Correlation:** r = 0.989, so R² = 0.978. The p-value is about 10⁻²⁰.

## The plot, drawn by hand

The graph is drawn with Python's turtle, with no charting library. One small
function maps a value from the data's range onto the screen's range. It
places a dot for each reading and the fitted line between the smallest and
the largest depth, inside two axes drawn along the edges. Writing the scaling
by hand shows what a charting library usually hides: where each value lands,
and why.
