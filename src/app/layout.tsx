import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  weight: ["500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Miora — Ближе к красоте",
  description: "Платформа, которая соединяет мастеров бьюти-индустрии и клиентов: портфолио, отзывы и запись без переписки.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Miora",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon-light-48.png", media: "(prefers-color-scheme: light)", sizes: "48x48", type: "image/png" },
      { url: "/icons/favicon-dark-48.png", media: "(prefers-color-scheme: dark)", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon-dark.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2ECE3" },
    { media: "(prefers-color-scheme: dark)", color: "#16110E" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${playfair.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
