---
title: 'Aruna Coffee'
category: dev
year: 2025
role: >-
  Co-founder. Directed the build rather than hand-writing it: designed the
  interface in Illustrator and used those drawings as the brief an AI builder
  worked from, chose and modelled the Supabase backend, added Google sign-in,
  and built the interactive landing page in Spline.
stack:
  - Supabase
  - Lovable
  - Spline
  - Illustrator
  - 'Google OAuth'
kind: 'Online shop'
problem: >-
  Specialty coffee in Romania is mostly sold through cafés and a handful of
  roasteries, so buying it at home means knowing where to look. Aruna sells it
  directly online, by single order or by subscription, with delivery to the
  door.
results: >-
  The business sold over 100 kg of coffee a month through the online shop I
  built.
cover:
  src: '../../assets/landing/aruna-4-product.webp'
  alt: >-
    The shop's lit product scene: a paper cup beside the line about sugar, on dark brown.
screens:
  - src: '../../assets/aruna-shop/1-storefront.webp'
    alt: >-
      The Aruna Coffee home page on black: the headline "Cafea de
      Specialitate. Prăjită în România." beside a photo of the Black Cream
      bag, with its price, rating and an add-to-cart button.
    caption: >-
      The storefront. The bestseller is on the first screen with its price
      and an add-to-cart button: one click puts it in the cart.
  - src: '../../assets/aruna-shop/2-collection.webp'
    alt: >-
      Three coffee cards in the shop, each with origin, altitude, tasting
      notes and bars for acidity, body and sweetness; the weights of two
      coffees are crossed out as out of stock.
    caption: >-
      The collection. Every coffee shows its taste profile as bars instead
      of adjectives, and a sold-out weight stays visible, crossed out.
  - src: '../../assets/aruna-shop/3-cart.webp'
    alt: >-
      The cart open as a panel on the right, holding one bag of Black Cream,
      with a free-delivery note, the subtotal and a checkout button.
    caption: >-
      The cart opens as a panel over the page instead of leaving it, and
      says when the order has reached free delivery.
  - src: '../../assets/aruna-shop/4-club.webp'
    alt: >-
      The Aruna Club page: an invitation to create an account, and three
      steps for the loyalty points (order, collect, spend).
    caption: >-
      Aruna Club, the loyalty programme: one point for every 10 lei spent,
      redeemed as a discount on later orders.
  - src: '../../assets/aruna-shop/5-login.webp'
    alt: >-
      The sign-in form with email and password fields and, under "sau
      continuă cu", a Google button.
    caption: >-
      Sign-in with email or with Google. The Google sign-in is the part I
      added myself.
  - src: '../../assets/aruna-shop/6-business.webp'
    alt: >-
      The business page, "Cafea premium pentru echipa ta", offering a monthly
      office subscription, with a button to ask for a personal offer.
    caption: >-
      A separate page for companies: a monthly office subscription, with a
      request for a personal offer instead of a cart.
order: 10
draft: false
links: []
---

## What I decided

The priority was to have the shop live quickly, and to keep it easy to update
through the AI agents in my workflow. That is why the backend is Supabase. It
holds what the shop runs on: customer accounts, subscriptions, the cart and
the product inventory. I added Google sign-in so that a new customer can
create an account without filling in a registration form.

## What the sketches changed

I drew the interface in Illustrator before any code was generated, and the
AI builder worked from those drawings. That made every request specific. The
fine details of an interface, such as spacing, alignment and how one element
sits against the next, lose their point when you try to describe them in
words. A drawing keeps them.

## What was hard

Order tracking. Connecting the shop to the courier's tracking system did not
work at first. I got it working by following the documentation the courier
company provides for its integration.

## What I would change

I would split the work across several AI agents, each one dedicated to a
single kind of task, and use the agent skills I have discovered since. I
would also debug more. I have written much more code by hand since then, and
I now know where to look when something breaks.
