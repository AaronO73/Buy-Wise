(function () {
  const chip = document.createElement('button');
  chip.id = 'buywise-chip';
  chip.textContent = 'BuyWise Verdict';

  const panel = document.createElement('div');
  panel.id = 'buywise-panel';
  panel.className = 'hidden';
  panel.innerHTML = '<div>Ready to analyze this product page.</div><div class="muted">Estimates based on trends. Not guaranteed.</div>';

  chip.addEventListener('click', async () => {
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      panel.innerHTML = '<div>Analyzing current page from real visible product signals…</div>';
      try {
        const response = await fetch('http://localhost:8787/api/analyze-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: location.href })
        });
        const payload = await response.json();
        panel.innerHTML = response.ok
          ? `<strong style="font-size:1.1rem">${payload.analysis.verdict}</strong><div>Confidence: ${payload.analysis.confidence}</div><div>${payload.analysis.strengthMessage}</div><div class="muted">${payload.analysis.priceIntelligence}</div><div class="muted">${payload.analysis.disclaimerMicro}</div><div class="muted">Was this helpful? 👍 / 👎</div>`
          : `<div>${payload.message}</div>`;
      } catch {
        panel.innerHTML = '<div>Connection issue. Start BuyWise web app server to analyze links.</div>';
      }
    }
  });

  document.body.append(chip, panel);
})();
