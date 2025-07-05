// src/app/layout.tsx
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

// Eliminamos la fuente Inter para resolver el conflicto con Babel
// const inter = Inter({ subsets: ['latin'] });

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
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}