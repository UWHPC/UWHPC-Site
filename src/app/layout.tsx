import type { Metadata } from "next";
import { Archivo, Fragment_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://uwhpc.com"),
  title: "UWHPC - University of Waterloo High Performance Computing",
  description:
    "A student design team at the University of Waterloo pushing the boundaries of parallel and high-performance computing.",
  keywords: [
    "HPC",
    "high performance computing",
    "University of Waterloo",
    "student team",
    "parallel computing",
    "cluster computing",
    "UWHPC",
    "student cluster competition",
  ],
  openGraph: {
    title: "UWHPC - University of Waterloo High Performance Computing",
    description:
      "A student design team at the University of Waterloo pushing the boundaries of parallel and high-performance computing.",
    siteName: "UWHPC",
    type: "website",
    locale: "en_CA",
    url: "https://uwhpc.com",
    images: [{ url: "/banner-dark.png", alt: "UWHPC Banner" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UWHPC - University of Waterloo High Performance Computing",
    description:
      "A student design team at the University of Waterloo pushing the boundaries of parallel and high-performance computing.",
    images: ["/banner-dark.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
