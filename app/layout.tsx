import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "GadgetBroo - Your One-Stop Gadget Shop in Bangladesh",
    template: "%s | GadgetBroo"
  },
  description: "Buy the latest gadgets, electronics, and accessories at the best prices in Bangladesh. Fast delivery, genuine products, and excellent customer service.",
  keywords: ["gadgets", "electronics", "online shopping", "Bangladesh", "smartphones", "accessories", "tech", "GadgetBroo"],
  authors: [{ name: "GadgetBroo" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "GadgetBroo",
    title: "GadgetBroo - Your One-Stop Gadget Shop",
    description: "Buy the latest gadgets, electronics, and accessories at the best prices in Bangladesh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GadgetBroo - Your One-Stop Gadget Shop",
    description: "Buy the latest gadgets, electronics, and accessories at the best prices in Bangladesh.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
