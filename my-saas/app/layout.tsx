import type { Metadata, Viewport } from "next"; // Added Viewport for Next.js 15
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Theme and Mobile Settings (Next.js 15 uses 'viewport' export)
export const viewport: Viewport = {
  themeColor: "#3b82f6", // Your brand color (Blue)
  width: "device-width",
  initialScale: 1,
};

// 2. SEO and LinkedIn Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://saas-invoice-generator-pi.vercel.app"),
  title: {
    default: "InvoiceGen - Professional SaaS Invoice Generator",
    template: "%s | InvoiceGen", // Dynamic titles for other pages
  },
  description:
    "Create, manage, and track professional invoices in seconds. Secure payments via Paystack.",
  keywords: ["SaaS", "Invoicing", "Paystack", "Business Tools"],

  // Open Graph (LinkedIn, Facebook, Discord)
  openGraph: {
    title: "InvoiceGen - Smart Invoicing for Modern Businesses",
    description:
      "The fastest way to get paid. Integrated with Paystack for seamless transactions.",
    url: "https://saas-invoice-generator-pi.vercel.app",
    siteName: "InvoiceGen",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "InvoiceGen App Screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter/X Card
  twitter: {
    card: "summary_large_image",
    title: "InvoiceGen - Professional Invoicing",
    description: "Generate professional invoices and get paid via Paystack.",
    images: ["/og-image.png"],
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
