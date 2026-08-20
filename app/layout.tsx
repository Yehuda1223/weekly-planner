import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "תכנון שבועי - ארוחות, כושר וסגנון חיים",
  description: "אפליקציה חכמה לתכנון שבועי מלא: ניהול ארוחות ומתכונים, אימונים וכושר, דייטים ורשימת קניות",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
