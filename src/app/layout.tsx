import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/modules/authentication/context/AuthContext";
import { CartProvider } from "@/modules/payment-processing/context/CartContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import ToastContainer from "@/modules/shared-common/components/shared/ToastContainer";
import CookieConsentBanner from "@/modules/compliance/components/CookieConsentBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'PulsarFlow — Discover & Create Unforgettable Events',
    template: '%s | PulsarFlow',
  },
  description:
    'PulsarFlow is the modern event management and ticketing platform. Discover concerts, conferences, workshops and more — or create your own event in minutes.',
  keywords: [
    'events',
    'ticketing',
    'event management',
    'concerts',
    'conferences',
    'workshops',
    'PulsarFlow',
  ],
  openGraph: {
    title: 'PulsarFlow — Discover & Create Unforgettable Events',
    description:
      'The modern event management and ticketing platform. Find your next experience or host your own.',
    siteName: 'PulsarFlow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulsarFlow — Discover & Create Unforgettable Events',
    description:
      'The modern event management and ticketing platform. Find your next experience or host your own.',
  },
  robots: { index: true, follow: true },
};

const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('theme') || 'system';
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
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
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <ToastContainer>
                <div id="main-content" tabIndex={-1}>
                  {children}
                </div>
                <CookieConsentBanner />
              </ToastContainer>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

