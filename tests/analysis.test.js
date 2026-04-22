import test from 'node:test';
import assert from 'node:assert/strict';
import { detectRetailer } from '../src/analysis/retailers.js';
import { buildAnalysis } from '../src/analysis/scoring.js';

test('detects supported amazon product url', () => {
  const result = detectRetailer('https://www.amazon.com/dp/B000TEST');
  assert.equal(result.supported, true);
  assert.equal(result.retailer.name, 'Amazon');
});

test('rejects unsupported retailer', () => {
  const result = detectRetailer('https://www.costco.com/abc');
  assert.equal(result.supported, false);
  assert.equal(result.reason, 'This retailer is not supported yet.');
});

test('confidence high when complete signals available', () => {
  const analysis = buildAnalysis({ currentPrice: 49.99, rating: 4.5, reviewCount: 2100 });
  assert.equal(analysis.confidence, 'High');
});
