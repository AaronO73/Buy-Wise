# BuyWise

BuyWise is a premium AI-powered anti-impulse shopping assistant built as:

- **Chrome extension** for in-page verdicts on supported retailers.
- **Web app + dashboard** for link analysis, account overview, and monetization surfaces.

## Supported retailers

- Amazon
- eBay
- Walmart
- Target
- Best Buy

Unsupported links return: **"This retailer is not supported yet."**

## Core product features delivered

- BUY NOW / WAIT / SKIP verdict system.
- Real link retailer detection.
- Structured extraction (title, price, image, rating, reviews) from fetched product pages.
- Honest fallback behavior when data is missing.
- Confidence system (High / Medium / Low).
- Subtle disclaimer microcopy and expanded disclosure.
- Helpful feedback loop prompt (👍 / 👎).
- Free/Pro monetization framing with premium, non-aggressive paywall copy.
- Settings/account/dashboard foundation and cloud-sync-ready architecture.

## Run locally

```bash
npm start
```

Then open `http://localhost:8787`.

## Test

```bash
npm test
```

## Chrome extension

Load the `/extension` directory as an unpacked extension in Chrome DevTools.
