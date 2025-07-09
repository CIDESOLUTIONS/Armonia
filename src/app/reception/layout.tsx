// src/app/(reception)/layout.tsx
import { Metadata } from 'next';
import ReceptionSidebar from '@/components/reception/layout/ReceptionSidebar';

export const metadata: Metadata = {
  title: 'Recepción - Armonía',
  description: 'Portal de recepción y control de accesos'
};

export default function ReceptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <ReceptionSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
