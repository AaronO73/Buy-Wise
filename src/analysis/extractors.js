function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function pickFirst(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1].trim());
  }
  return null;
}

function parseMoney(raw) {
  if (!raw) return null;
  const normalized = raw.replace(/[,\s]/g, '').replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseReviews(raw) {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, '');
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRating(raw) {
  if (!raw) return null;
  const match = raw.match(/[0-5](?:\.[0-9])?/);
  return match ? Number.parseFloat(match[0]) : null;
}

export async function extractProductData(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 BuyWiseBot/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch product page (${response.status}).`);
  }

  const html = await response.text();

  const title = pickFirst(html, [
    /<meta\s+property="og:title"\s+content="([^"]+)"/i,
    /<meta\s+name="title"\s+content="([^"]+)"/i,
    /<title[^>]*>([^<]+)<\/title>/i
  ]);

  const image = pickFirst(html, [
    /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    /<img[^>]+id="landingImage"[^>]+src="([^"]+)"/i
  ]);

  const priceRaw = pickFirst(html, [
    /<meta\s+property="product:price:amount"\s+content="([^"]+)"/i,
    /"price"\s*:\s*"([0-9.,]+)"/i,
    /[$]\s?([0-9]{1,4}(?:,[0-9]{3})*(?:\.[0-9]{2})?)/i
  ]);

  const ratingRaw = pickFirst(html, [
    /<meta\s+property="og:rating"\s+content="([^"]+)"/i,
    /"ratingValue"\s*:\s*"([^"]+)"/i,
    /([0-5](?:\.[0-9])?)\s*out of\s*5/i
  ]);

  const reviewRaw = pickFirst(html, [
    /"reviewCount"\s*:\s*"([^"]+)"/i,
    /([0-9,]+)\s+ratings?/i,
    /([0-9,]+)\s+reviews?/i
  ]);

  const data = {
    title,
    currentPrice: parseMoney(priceRaw),
    image,
    rating: parseRating(ratingRaw),
    reviewCount: parseReviews(reviewRaw)
  };

  const missingFields = Object.entries(data)
    .filter(([, value]) => value === null || value === '')
    .map(([key]) => key);

  return {
    data,
    missingFields,
    limitedData: missingFields.length > 0
  };
}
