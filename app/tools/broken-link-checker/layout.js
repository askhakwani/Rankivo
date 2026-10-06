// app/tools/broken-link-checker/layout.js
// page.js is a client component ('use client'), so the SEO metadata has to live here.
// If your root layout already adds " | Rankivo" to every title, remove it from the title below.

export const metadata = {
  title: 'Free Broken Link Checker: Find Dead Links Fast | Rankivo',
  description:
    'Scan any webpage for broken links, redirects and dead URLs. See anchor text, status codes and rel attributes, then export the results to CSV. Free to use.',
  alternates: {
    canonical: 'https://www.rankivo.co/tools/broken-link-checker',
  },
  openGraph: {
    title: 'Free Broken Link Checker: Find Dead Links Fast',
    description:
      'Scan any webpage for broken links, redirects and dead URLs. See anchor text, status codes and rel attributes, then export the results to CSV.',
    url: 'https://www.rankivo.co/tools/broken-link-checker',
    type: 'website',
  },
}

export default function BrokenLinkCheckerLayout({ children }) {
  return children
}
