import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

import AiAssistant from "@/components/chat/AiAssistant";

export const metadata: Metadata = {
  title: "FJ Store | Premium Luxury eCommerce",
  description: "Exclusive cosmetics, delicacies, and luxury jewelry",
  icons: {
    icon: [
      { url: '/logo-of-OS.png', media: '(prefers-color-scheme: light)' },
      { url: '/logo-of-OS.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/logo-of-OS.png',
  },
  openGraph: {
    title: "FJ Store | Premium Luxury eCommerce",
    description: "Exclusive cosmetics, delicacies, and luxury jewelry",
    images: [
      {
        url: "/logo-of-OS.png",
        width: 1200,
        height: 630,
        alt: "FJ Store Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FJ Store | Premium Luxury eCommerce",
    description: "Exclusive cosmetics, delicacies, and luxury jewelry",
    images: ["/logo-of-OS.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col text-foreground selection:bg-accent-gold selection:text-black">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pt-24">{children}</main>
            <Footer />
            <AiAssistant />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
