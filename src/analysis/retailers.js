const RETAILERS = {
  amazon: {
    key: 'amazon',
    name: 'Amazon',
    domains: ['amazon.com'],
    productPathPatterns: [/\/dp\//i, /\/gp\/product\//i]
  },
  ebay: {
    key: 'ebay',
    name: 'eBay',
    domains: ['ebay.com'],
    productPathPatterns: [/\/itm\//i]
  },
  walmart: {
    key: 'walmart',
    name: 'Walmart',
    domains: ['walmart.com'],
    productPathPatterns: [/\/ip\//i]
  },
  target: {
    key: 'target',
    name: 'Target',
    domains: ['target.com'],
    productPathPatterns: [/\/p\//i]
  },
  bestbuy: {
    key: 'bestbuy',
    name: 'Best Buy',
    domains: ['bestbuy.com'],
    productPathPatterns: [/\/site\//i]
  }
};

export function detectRetailer(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

    for (const retailer of Object.values(RETAILERS)) {
      const hasDomain = retailer.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
      if (!hasDomain) continue;

      const isProductPath = retailer.productPathPatterns.some((pattern) => pattern.test(url.pathname));
      return {
        supported: isProductPath,
        retailer: retailer,
        reason: isProductPath ? null : 'This link is not recognized as a product page for this retailer.'
      };
    }

    return {
      supported: false,
      retailer: null,
      reason: 'This retailer is not supported yet.'
    };
  } catch {
    return {
      supported: false,
      retailer: null,
      reason: 'Invalid URL. Please paste a full product link.'
    };
  }
}

export { RETAILERS };
