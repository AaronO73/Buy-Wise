const button = document.getElementById('analyze');
const input = document.getElementById('url');
const result = document.getElementById('result');

button.addEventListener('click', async () => {
  result.textContent = 'Analyzing…';
  const response = await fetch('http://localhost:8787/api/analyze-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: input.value })
  });
  const payload = await response.json();
  if (!response.ok) {
    result.textContent = payload.message || 'Unable to analyze.';
    return;
  }
  result.textContent = `${payload.analysis.verdict} · Confidence ${payload.analysis.confidence}`;
});
