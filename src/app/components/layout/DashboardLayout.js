
'use client';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    redirect('/auth/login');
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-green-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-screen-xl 2xl:max-w-screen-2xl">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
