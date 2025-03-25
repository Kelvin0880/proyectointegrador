'use client';
import { SessionProvider } from 'next-auth/react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <SessionProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-green-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
}