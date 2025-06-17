// src/app/(admin)/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administración - Armonía',
  description: 'Portal de administración para complejos residenciales'
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-portal">
      {children}
    </div>
  );
}
