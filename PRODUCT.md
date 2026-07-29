# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two roles, same trip:

- **Travelers** — mostly older/retired group-tour travelers, on guided multi-day tours abroad (e.g. an 11-day Hokkaido bus tour). Often unfamiliar with the destination, sometimes without reading glasses or tech fluency, and under real stress the moment they're separated from the group: crowded malls, airports, subways — exactly where cell signal is worst. They need one obvious answer, one obvious action, no menu-hunting.
- **Guides** — run the group logistically (departure times, meeting points, headcounts, announcements) and currently do this by staying constantly, personally vigilant: repeating the same info, manually counting heads, answering "what terminal again?" forty times. The product's job is to do quietly what they currently do by hand.

## Product Purpose

Tethered keeps a guided tour group coordinated — everyone always knows what's happening next, when and where to be, and how to find the group again if they wander off — so no one gets left behind and the guide stops being a human PA system. It remains fully functional with no signal, because the moments coordination matters most (a foreign mall, an airport, a subway) are exactly where phones lose connectivity.

## Positioning

The durable value is coordination structure, not connectivity. A group chat (WhatsApp, etc.) cannot take a live headcount, cannot run a departure countdown tied to the day's plan, and buries the guide's one important announcement under forty replies. Tethered replaces that ad hoc chat with a shared source of truth: next departure, current announcement, meeting point, roll call, and — its signature capability — "Find the bus," a GPS bearing/distance/breadcrumb tool that works with zero network connectivity because it never depends on live maps or a live connection. Offline capability is why the product is trustworthy, not the headline claim: connectivity keeps improving industry-wide, so a product whose whole identity is "works without wifi" ages badly. A product whose identity is "the group stays together" only gets stronger.

## Operating Context

- Multi-day guided group tours (proven scenario: 18 travelers, 2 guides, 11 days, 7 hotels, Hokkaido, Japan).
- On-bus / in-transit coordination, currently handled with a whiteboard, verbal announcements, and a group chat.
- Free-wander periods where the group scatters (malls, city blocks, restaurants) and needs to reconverge at a bus or meeting point.
- International airport transfers with multiple legs, terminal/gate changes, and specific wayfinding instructions (e.g. "take the elevator, not the escalator").
- Joining a trip happens by short code read aloud by the guide — no accounts, no logins.
- Core "Find the bus" flow must work fully offline: a pin (GPS coordinates + note) is saved while connected, GPS position and device compass keep working with no signal, and a breadcrumb trail is logged as the traveler walks away.

## Capabilities and Constraints

**In scope:**
- Join-by-code, two roles (traveler, guide), no accounts.
- Traveler home: live departure countdown, current announcement banner, one always-present "Find the bus" button.
- Find the bus: saved pin (coords + note), GPS bearing + distance + plain-language direction, breadcrumb trail, retrace-my-steps, works with no cached map tiles and no network.
- Today / day-pack (offline-cached): next departure countdown, hotel card (bilingual name/address), airport card (terminal/gate/flight legs/instructions), meeting-point wayfinding with countdown.
- Roll-call: guide-initiated, one-tap "I'm here" for travelers, live count + missing names for the guide.
- One-way announcements from guide to travelers (banner + chime). No two-way chat.
- Guide mode: set/move pin, set departure times and meeting points, post announcements, run roll-call.
- Offline-first PWA (installable, service worker) — the core loop must never depend on a network call.
- Demo/simulation toggle to fake "walking away from the bus" for indoor pitching, alongside real Geolocation API use.

**Out of scope:**
- Booking, payments, itinerary authoring beyond simple day/departure/meeting-point setup.
- Two-way chat of any kind.
- Accounts or logins.
- Map-tile dependency for the core find-the-bus loop (cached map is a bonus layer only).

**Terminology:** "Find the bus" (not "navigate to waypoint"); "roll-call" and "I'm here"; "meeting point"; "today" / day-pack for the offline info card.

## Brand Commitments

- Name: **Tethered**.
- Voice: a calm, steady friend who knows the way — warm and reassuring, not cold-tech. Plain, specific, human language; no AI-slop ("seamless," "elevate," "unlock," "revolutionize"). Microcopy examples already confirmed: "You're not lost. The bus is this way." / "You've got 40 minutes. Plenty of time."
- Marketing surface and in-app surface deliberately have opposite personalities: the marketing page is cinematic and expressive; the app itself is quiet, restrained, near-invisible chrome.
- A shared directional / breadcrumb / compass motif may tie both surfaces together visually.

## Evidence on Hand

- Real story (the founding case, to be used directly in marketing copy, not genericized): 18-person tour group, mostly retired travelers, 2 guides, 11 days across Hokkaido, 7 hotels. On-bus coordination was a whiteboard plus verbal announcements plus group chat — until the group split up. The Sapporo free-wander scattered people across malls and restaurants with no signal the instant they left the bus. A traveler was lost in a mall when half the group stayed at the hotel and the other half walked 30 minutes to a shopping center. The Hokkaido→Tokyo→Honolulu airport transfer produced repeated-question chaos ("what terminal again," "which gate") and someone got separated by taking an escalator instead of an elevator. The originating wish, stated by a real traveler: "I wish I could save a waypoint while I still had internet on the bus, so I'd know where I went and how to get back with no connection."
- No other customer quotes, logos, press, pricing, or case studies exist. Do not fabricate testimonials, customer names, or metrics beyond this one real story. A placeholder trust line referencing "tested on a real 11-day Hokkaido tour" is real evidence, not fabricated.

## Product Principles

1. Coordination is the product; offline is why it's trustworthy. Lead every pitch with "the group stays together," never with "works without wifi."
2. One screen, one obvious action. The traveler using this is stressed, possibly elderly, one-thumbed, in bright light — never make them hunt or decide.
3. The core loop (find the bus, know the plan, regroup, roll-call) must work with zero network. If a feature breaks offline, it's broken, full stop.
4. Ship the real story, not invented scenarios — Hokkaido, Sapporo, the airport — because specificity is what makes the marketing page true instead of generic.
5. Two surfaces, one identity, opposite philosophies: the marketing page earns attention with flair; the app earns trust by getting out of the way.

## Accessibility & Inclusion

Primary traveler audience skews older and may have low vision, reduced dexterity, or be using the app under acute stress without reading glasses. Confirmed floor: base font size ≥18px (primary actions larger), tap targets ≥64px with generous spacing, high contrast / sunlight-readable (no thin gray-on-white), one primary action per screen, no jargon.
