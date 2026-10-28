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
  In progress: the schema and its integrity rules are designed; the project
  has not been graded yet.
cover:
  src: '../../assets/landing/airline-schema.webp'
  alt: >-
    Part of the airline schema in white on blueprint blue: models, aircraft, airports, routes, flights, employees and crew, joined by their foreign keys.
order: 30
draft: false
links: []
todo:
  - >-
    (secțiunea „What was hard” e ascunsă până o scrii)
  - >-
    TODO(conținut): vezi nota din chat despre exportul SQL — e exact genul de problemă care merită povestită aici.
---

## Constraints that carry the rules

Three of the rules are the ones that keep the data honest, because each one
stops a mistake the tables alone would allow:

- `uq_bilet_loc_zbor` on (flight, seat): a seat can be sold only once on a
  flight. Without it, two bookings made at the same moment could both end up
  in seat 12A. The rule lives in the table, so no part of an application can
  get around it.
- `uq_bilet_pas_zbor` on (flight, passenger): a passenger can hold only one
  ticket for a flight, so a retried payment or a double click cannot book the
  same person twice.
- `fk_ang_manager`: an employee's manager is another employee, so the key
  points back into the same table. A manager who does not exist cannot be
  assigned, and the whole hierarchy can be read with one query.
