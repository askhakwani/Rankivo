export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private/app areas that should never appear in search results
      disallow: ['/dashboard', '/api/', '/auth'],
    },
    // Must match the canonical host. rankivo.co redirects to www.rankivo.co,
    // and every URL in sitemap.js already uses www.
    sitemap: 'https://www.rankivo.co/sitemap.xml',
  }
}
