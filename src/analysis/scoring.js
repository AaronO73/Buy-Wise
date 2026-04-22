function confidenceFromData(product) {
  const qualitySignals = [product.currentPrice, product.rating, product.reviewCount].filter((v) => v !== null).length;
  if (qualitySignals >= 3) return 'High';
  if (qualitySignals === 2) return 'Medium';
  return 'Low';
}

function buildPriceIntelligence(product) {
  if (product.currentPrice === null) {
    return 'Price is unavailable. Consider checking again later for stronger timing guidance.';
  }

  return 'Current price was captured successfully. This product may fluctuate in price, so consider monitoring for better timing.';
}

export function buildAnalysis(product) {
  const confidence = confidenceFromData(product);
  const signals = [];
  let score = 0;

  if (product.rating !== null) {
    if (product.rating >= 4.3) {
      score += 2;
      signals.push('Strong user rating signal.');
    } else if (product.rating >= 3.7) {
      score += 1;
      signals.push('Mixed but acceptable user rating.');
    } else {
      score -= 2;
      signals.push('Low rating is a risk signal.');
    }
  }

  if (product.reviewCount !== null) {
    if (product.reviewCount > 1000) {
      score += 1;
      signals.push('Large review volume improves confidence.');
    } else if (product.reviewCount < 40) {
      score -= 1;
      signals.push('Limited review volume increases uncertainty.');
    }
  }

  if (product.currentPrice !== null && product.currentPrice > 500) {
    score -= 1;
    signals.push('Higher-ticket purchase: consider waiting if not urgent.');
  }

  let verdict = 'WAIT';
  if (score >= 2) verdict = 'BUY NOW';
  if (score <= -1) verdict = 'SKIP';

  const strengthMessage = confidence === 'High'
    ? 'Based on strong product signals.'
    : 'This is a general estimate based on available data.';

  return {
    verdict,
    confidence,
    strengthMessage,
    priceIntelligence: buildPriceIntelligence(product),
    regretSignals: signals.filter((s) => s.toLowerCase().includes('risk') || s.toLowerCase().includes('uncertainty')),
    alternatives: [
      {
        name: 'Compare similar listings with higher ratings before checkout.',
        scoreHint: 'Value check'
      }
    ],
    savingsInsight: verdict === 'WAIT'
      ? 'Waiting may improve value if a promotion appears.'
      : verdict === 'SKIP'
        ? 'Skipping now can prevent a low-value purchase.'
        : 'Current product signals support purchasing now if you need it.',
    actions: ['Track item', 'Save product', 'View full analysis', 'Dismiss'],
    disclaimerMicro: 'AI-powered insights. Results may vary.',
    disclaimerFull: 'BuyWise analyzes pricing trends and product signals to help guide smarter purchases. While often accurate, prices and conditions change. Always verify before purchasing.'
  };
}
