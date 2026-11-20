# Ownit — *I’ve got you.*

A friendly, step-by-step helper that turns what someone has actually done into a truthful,
polished **resume** and **LinkedIn profile draft**. Built for people new to professional profiles.

> First MVP. Prices are sample values, checkout is a demo (no payment), and drafts are written
> by a local demo generator unless you connect your own AI backend.

## Run it locally

Requires Node.js 18+ (tested on Node 22).

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm test           # unit tests (pricing, fact checks, "never invent" generator rules)
npm run typecheck
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## The flow

1. **Welcome** – intro, tagline, “Get started” (or explore a clearly labelled sample).
2. **Goal and field** – first job / internship / career change / promotion / exploring, plus field.
3. **Target role** – optional, with field-specific ideas; can be skipped.
4. **What to create** – resume, LinkedIn, or “Help me decide” with reasons you can accept or change.
5. **Price** – what’s included, sample prices, bundle saving, discount code, one-time total, demo checkout.
6. **Your experience** – sections adapt to the person (students see education and projects first).
   Voice dictation is offered where the browser supports it; typing always works.
7. **Check the facts** – editable summary plus follow-up questions (missing dates, numbers to verify…).
   Generation is blocked until required gaps are fixed and the person confirms.
8. **Preview** – three ATS-friendly single-column resume styles and a LinkedIn preview.
9. **Edit and download** – edit everything, request changes (tone, length, emphasis, note), print / save as
   PDF, Word (.doc) or plain text download, copy each LinkedIn section, create a new version for another role.

Drafts autosave to `localStorage` in the browser only. “My drafts” lets people open, rename, version,
delete, or clear everything.

## Where to change things

| What | File |
| --- | --- |
| Product name, tagline, colour palette (every colour in the app) | `src/config/brand.ts` |
| Prices in ₹ (stored in paise), bundle saving, demo discount codes | `src/config/pricing.ts` (**sample values**) |
| All questions, options, examples, helper copy and step acknowledgement lines | `src/config/copy.ts` |
| Sample (fictional) person | `src/state/sample.ts` |
| Demo draft writer | `src/lib/generator/demoGenerator.ts` |
| Checkout hook-up point | `src/lib/checkout.ts` |

## External services still to configure

- **AI writing service** – not connected. Set `VITE_OWNIT_GENERATOR_URL` to *your own backend*;
  see [docs/connecting-ai.md](docs/connecting-ai.md). Never put a provider API key in the frontend.
- **Payments** – not connected. Replace `startCheckout` in `src/lib/checkout.ts` with a call to your backend
  (e.g. a Stripe Checkout session). Prices and codes must be validated server-side.
- **Voice input** uses the browser’s Web Speech API (Chrome, Edge, Safari; not Firefox). Some browsers send
  audio to their own speech service; the app tells people this before they start. It needs HTTPS or localhost.

## Stack

Vite + React 19 + TypeScript, plain CSS (`src/styles/global.css`) that reads colour tokens set from `src/config/brand.ts`, self-hosted Inter font,
Vitest. No backend, no accounts, no LinkedIn integration.
