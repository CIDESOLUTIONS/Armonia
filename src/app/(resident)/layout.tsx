// src/app/(resident)/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Residente - Armonía',
  description: 'Portal para residentes de complejos habitacionales'
};

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="resident-portal">
      {children}
    </div>
  );
}
