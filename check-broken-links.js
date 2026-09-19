/**
 * check-broken-links.js
 *
 * Crawls https://www.rankivo.co/sitemap.xml, fetches every page listed,
 * extracts all internal <a href> links on each page, and checks each
 * unique internal link for a broken status (404 or other error).
 *
 * Outputs a report showing:
 *   - which page contains the broken link
 *   - the broken URL itself
 *   - the status code returned
 *
 * USAGE (PowerShell):
 *   node check-broken-links.js
 *
 * REQUIREMENTS:
 *   Node 18+ (built-in fetch). If you're on an older Node version, run:
 *   npm install node-fetch
 *   and uncomment the import line below.
 */

// Uncomment if on Node <18:
// import fetch from 'node-fetch';

const SITE_ORIGIN = 'https://www.rankivo.co';
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;
const CONCURRENCY = 5; // how many requests to run in parallel
const REQUEST_TIMEOUT_MS = 15000;

// ---------- helpers ----------

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);
}

async function fetchText(url) {
  const res = await withTimeout(fetch(url), REQUEST_TIMEOUT_MS);
  const text = await res.text();
  return { status: res.status, text };
}

async function fetchStatus(url) {
  try {
    // HEAD first (cheaper); fall back to GET if HEAD isn't supported
    let res = await withTimeout(fetch(url, { method: 'HEAD', redirect: 'follow' }), REQUEST_TIMEOUT_MS);
    if (res.status === 405 || res.status === 501) {
      res = await withTimeout(fetch(url, { method: 'GET', redirect: 'follow' }), REQUEST_TIMEOUT_MS);
    }
    return res.status;
  } catch (e) {
    return `ERROR: ${e.message}`;
  }
}

function extractSitemapUrls(xml) {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map(m => m[1].trim());
}

function extractInternalLinks(html, pageUrl) {
  const links = new Set();
  const hrefMatches = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)];

  for (const match of hrefMatches) {
    let href = match[1].trim();

    // Skip anchors, mailto, tel, javascript
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:')
    ) {
      continue;
    }

    // Resolve relative URLs
    let absolute;
    try {
      absolute = new URL(href, pageUrl).toString();
    } catch {
      continue;
    }

    // Only keep internal links (same origin)
    if (absolute.startsWith(SITE_ORIGIN)) {
      // Strip hash fragments for checking purposes
      absolute = absolute.split('#')[0];
      links.add(absolute);
    }
  }

  return [...links];
}

async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, next);
  await Promise.all(workers);
  return results;
}

// ---------- main ----------

async function main() {
  console.log(`Fetching sitemap: ${SITEMAP_URL}`);
  const { text: sitemapXml } = await fetchText(SITEMAP_URL);
  const pageUrls = extractSitemapUrls(sitemapXml);
  console.log(`Found ${pageUrls.length} pages in sitemap.\n`);

  // Step 1: fetch every page's HTML and extract internal links
  console.log('Crawling pages and extracting internal links...');
  const pageLinkMap = {}; // { pageUrl: [link1, link2, ...] }
  const allLinksSet = new Set();

  await runWithConcurrency(pageUrls, CONCURRENCY, async (pageUrl) => {
    try {
      const { status, text } = await fetchText(pageUrl);
      if (status >= 400) {
        console.log(`  [PAGE ERROR] ${pageUrl} -> ${status}`);
        pageLinkMap[pageUrl] = { error: status, links: [] };
        return;
      }
      const links = extractInternalLinks(text, pageUrl);
      pageLinkMap[pageUrl] = { error: null, links };
      links.forEach(l => allLinksSet.add(l));
    } catch (e) {
      console.log(`  [FETCH FAILED] ${pageUrl} -> ${e.message}`);
      pageLinkMap[pageUrl] = { error: e.message, links: [] };
    }
  });

  const allLinks = [...allLinksSet];
  console.log(`\nFound ${allLinks.length} unique internal links to check.\n`);

  // Step 2: check status of every unique internal link
  console.log('Checking link statuses...');
  const statusMap = {}; // { link: status }

  await runWithConcurrency(allLinks, CONCURRENCY, async (link) => {
    const status = await fetchStatus(link);
    statusMap[link] = status;
    if (typeof status === 'number' && status >= 400) {
      console.log(`  [BROKEN] ${link} -> ${status}`);
    } else if (typeof status === 'string') {
      console.log(`  [ERROR] ${link} -> ${status}`);
    }
  });

  // Step 3: build report of broken links + which pages link to them
  const brokenLinks = allLinks.filter(link => {
    const s = statusMap[link];
    return (typeof s === 'number' && s >= 400) || typeof s === 'string';
  });

  console.log('\n========================================');
  console.log('REPORT: Broken Internal Links');
  console.log('========================================\n');

  if (brokenLinks.length === 0) {
    console.log('No broken internal links found. ✅');
  } else {
    for (const brokenLink of brokenLinks) {
      const status = statusMap[brokenLink];
      const sourcePages = Object.entries(pageLinkMap)
        .filter(([, data]) => data.links.includes(brokenLink))
        .map(([pageUrl]) => pageUrl);

      console.log(`Broken URL: ${brokenLink}`);
      console.log(`Status: ${status}`);
      console.log(`Linked from:`);
      sourcePages.forEach(p => console.log(`  - ${p}`));
      console.log('');
    }
  }

  // Also report pages that themselves failed to load
  const failedPages = Object.entries(pageLinkMap).filter(([, data]) => data.error);
  if (failedPages.length > 0) {
    console.log('========================================');
    console.log('REPORT: Sitemap Pages That Failed to Load');
    console.log('========================================\n');
    failedPages.forEach(([url, data]) => {
      console.log(`${url} -> ${data.error}`);
    });
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
