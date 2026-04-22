const form = document.getElementById('analyze-form');
const resultEl = document.getElementById('analysis-result');

function verdictClass(verdict) {
  if (verdict === 'BUY NOW') return 'buy';
  if (verdict === 'SKIP') return 'skip';
  return 'wait';
}

function actionPills(actions) {
  return `<div class="actions">${actions.map((a) => `<span class="pill">${a}</span>`).join('')}</div>`;
}

function renderResult(payload) {
  const { product, analysis, limitedData, missingFields, retailer, feedback } = payload;
  resultEl.innerHTML = `
    <div class="result">
      <div class="verdict ${verdictClass(analysis.verdict)}">${analysis.verdict}</div>
      <div><strong>${product.title || 'Unknown title'}</strong></div>
      <div class="meta">${retailer} · ${product.currentPrice ? `$${product.currentPrice.toFixed(2)}` : 'Price unavailable'} · Rating: ${product.rating ?? 'N/A'} · Reviews: ${product.reviewCount ?? 'N/A'}</div>
      <p>${analysis.strengthMessage}</p>
      <p><strong>Confidence:</strong> ${analysis.confidence}</p>
      <p><strong>Price Intelligence:</strong> ${analysis.priceIntelligence}</p>
      <p><strong>Savings Insight:</strong> ${analysis.savingsInsight}</p>
      ${analysis.regretSignals.length ? `<p><strong>Regret Signals:</strong> ${analysis.regretSignals.join(' ')}</p>` : ''}
      <p><strong>Alternatives:</strong> ${analysis.alternatives.map((a) => `${a.name} (${a.scoreHint})`).join(' ')}</p>
      ${actionPills(analysis.actions)}
      ${limitedData ? `<p class="meta">Limited data available for this product. Missing: ${missingFields.join(', ')}</p>` : ''}
      <details><summary>Expanded disclaimer</summary><p>${analysis.disclaimerFull}</p></details>
      <p class="micro">${analysis.disclaimerMicro}</p>
      <div class="meta">${feedback.question} ${feedback.options.join(' ')}</div>
    </div>
  `;
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const productUrl = document.getElementById('product-url').value;
  resultEl.innerHTML = '<p class="meta">Analyzing… extracting real page signals.</p>';

  const response = await fetch('/api/analyze-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: productUrl })
  });

  const payload = await response.json();
  if (!response.ok) {
    resultEl.innerHTML = `<p class="meta">${payload.message || 'Unable to analyze this link.'}</p>`;
    return;
  }

  renderResult(payload);
});
