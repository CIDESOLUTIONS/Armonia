// src/app/(reception)/layout.tsx
import { Metadata } from 'next';
import { RealTimeCommunicationProvider } from '@/lib/communications/real-time-context';

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
    <RealTimeCommunicationProvider>
      <div className="reception-portal">
        {children}
      </div>
    </RealTimeCommunicationProvider>
  );
}
