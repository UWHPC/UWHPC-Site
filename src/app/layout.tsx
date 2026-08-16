import type { Metadata } from "next";
import { Archivo, Fragment_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/JsonLd";
import {
  SITE_FULL_NAME,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment-mono",
  subsets: ["latin"],
  weight: "400",
});

const HOME_TITLE = `${SITE_NAME} — ${SITE_FULL_NAME}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    // Child pages set only their own name; the suffix is appended here so
    // every title stays consistent without being retyped per page.
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  keywords: [
    "UWHPC",
    "UW HPC",
    "UW High Performance Computing",
    "University of Waterloo design team",
    "Sedra Student Design Centre",
    "student design team",
    "high performance computing",
    "scientific computing",
    "machine learning infrastructure",
    "compilers",
    "distributed systems",
    "performance engineering",
    "parallel computing",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: SITE_TAGLINE,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    images: [
      {
        url: "/banner-dark.png",
        width: 1200,
        height: 630,
        alt: HOME_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: SITE_TAGLINE,
    images: ["/banner-dark.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${fragmentMono.variable} antialiased`}>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
