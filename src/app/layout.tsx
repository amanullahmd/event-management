import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Management & Ticketing System",
  description: "A comprehensive event management and ticketing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950`}
      >
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="skip-link sr-only-focusable"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <CartProvider>
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
