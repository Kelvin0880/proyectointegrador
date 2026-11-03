import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: {
    default: 'UNPHU Inventario',
    template: '%s | UNPHU Inventario',
  },
  description: 'Sistema de inventario y préstamo de equipos de la Universidad Nacional Pedro Henríquez Ureña',
};

export const viewport = {
  themeColor: '#175232',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
