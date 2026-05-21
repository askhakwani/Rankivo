import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RANKIVO — Write Less. Rank More. Grow Faster.",
  description: "Rankivo is the AI platform that writes SEO-optimized content for your blog, social media, ads and more — then helps you rank for it. One tool. Total content + SEO.",
  metadataBase: new URL("https://www.rankivo.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RANKIVO — Write Less. Rank More. Grow Faster.",
    description: "Rankivo is the AI platform that writes SEO-optimized content for your blog, social media, ads and more — then helps you rank for it.",
    url: "https://rankivo.co",
    siteName: "RANKIVO",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RANKIVO — AI Content & SEO Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RANKIVO — Write Less. Rank More. Grow Faster.",
    description: "AI-powered content + SEO platform. Generate blogs, captions, scripts and more in seconds.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "RANKIVO",
              url: "https://rankivo.co",
              logo: "https://rankivo.co/favicon.ico",
              description: "AI-powered content and SEO platform for modern marketers.",
              sameAs: [],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}