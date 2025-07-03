// src/app/(reception)/layout.tsx
import { Metadata } from 'next';

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
    <div className="reception-portal">
      {children}
    </div>
  );
}
