---
title: 'Airline reservations database'
category: dev
year: 2026
role: >-
  Designed the relational schema: ten tables covering airports, routes,
  aircraft models and tail numbers, flights, crew assignments, passengers,
  bookings and tickets, with the integrity rules written into the schema
  rather than left to application code.
stack:
  - 'Oracle SQL'
  - drawDB
kind: 'Schema design'
problem: >-
  An airline's data is a web of constraints that a table layout alone does not
  enforce: a seat cannot be sold twice on the same flight, a passenger cannot
  hold two tickets for it, and an employee reports to another employee.
results: >-
  TODO(conținut): nota primită, sau ce a mers/nu a mers la verificare.
cover:
  src: '../../assets/landing/airline-schema.webp'
  alt: >-
    Part of the airline schema in white on blueprint blue: models, aircraft, airports, routes, flights, employees and crew, joined by their foreign keys.
order: 30
draft: false
links: []
---

## Constraints that carry the rules

TODO(conținut): explică de ce ai pus fiecare constrângere. Trei merită
numite, pentru că arată că te-ai gândit la ce poate strica datele:

- `uq_bilet_loc_zbor` pe (zbor, loc) — același scaun nu poate fi vândut de
  două ori pe același zbor.
- `uq_bilet_pas_zbor` pe (zbor, pasager) — același pasager nu poate avea două
  bilete pe același zbor.
- `fk_ang_manager` — un angajat trimite spre alt angajat, în aceeași tabelă.
  Ierarhia e modelată, nu presupusă.

## What was hard

TODO(conținut): vezi nota din chat despre exportul SQL — e exact genul de
problemă care merită povestită aici.
