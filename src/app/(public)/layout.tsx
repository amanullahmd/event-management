import React from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

/**
 * Public pages layout (for unauthenticated users)
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
