---
title: 'Teaching a network the Mandelbrot set'
category: data
year: 2026
role: >-
  Sampled 200 points from the Mandelbrot domain, labelled each by escape-time
  iteration, trained a small neural network on them, then rendered the real
  fractal and the network's prediction side by side on a 30×30 grid.
stack:
  - Python
  - NumPy
  - Matplotlib
kind: 'Neural network'
problem: >-
  The Mandelbrot set has a boundary of infinite detail, which makes it a hard
  and honest test of what a small network can and cannot learn: a model that
  only memorises the training points will produce a smooth blob where the real
  boundary is intricate.
results: >-
  TODO(conținut): cât de aproape a ajuns predicția? Pune imaginea reală lângă
  cea prezisă — comparația vizuală e rezultatul, și e mai convingătoare decât
  orice cifră de loss.
order: 20
draft: false
links: []
todo:
  - >-
    (secțiunea „What the comparison showed” e ascunsă până o scrii)
  - >-
    (secțiunea „Why this is a good test” e ascunsă până o scrii)
  - >-
    TODO(conținut): un set de date obișnuit nu îți spune dacă modelul a învățat structura sau doar punctele. Aici se vede cu ochiul liber.
  - >-
    TODO(conținut): unde a greșit rețeaua? Dacă a ratat exact detaliul de pe frontieră, spune asta — e cel mai interesant rezultat posibil.
---
