// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
;
import { Providers } from '@/components/providers';
;
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Armonía - Gestión de Conjuntos Residenciales',
  description: 'Sistema de gestión para conjuntos residenciales',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}