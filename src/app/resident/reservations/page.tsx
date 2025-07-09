'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Eye, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getReservations } from '@/services/reservationService';

interface Reservation {
  id: number;
  commonAreaId: number;
  commonAreaName: string; // Para mostrar en la tabla
  userId: number;
  userName: string; // Para mostrar en la tabla
  propertyId: number;
  unitNumber: string; // Para mostrar en la tabla
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  attendees: number;
  requiresPayment: boolean;
  paymentAmount?: number;
  paymentStatus?: string;
  rejectionReason?: string;
  approvedById?: number;
  approvedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ResidentReservationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchReservations();
    }
  }, [authLoading, user]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await getReservations(); // This will fetch only resident's reservations due to authMiddleware
      setReservations(data);
    } catch (error) {
      console.error('Error fetching resident reservations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus reservas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by AuthLayout
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Reservas de Áreas Comunes</h1>
      
      <div className="flex justify-end mb-4">
        <Link href="/resident/reservations/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Reserva
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Área Común</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inicio</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fin</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{reservation.commonAreaName}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{reservation.title}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(reservation.startDateTime).toLocaleString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(reservation.endDateTime).toLocaleString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Badge variant={reservation.status === 'APPROVED' ? 'default' : reservation.status === 'PENDING' ? 'secondary' : 'destructive'}>
                      {reservation.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Link href={`/resident/reservations/${reservation.id}/view`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {reservation.requiresPayment && reservation.paymentStatus !== 'PAID' && (
                      <Link href={`/resident/reservations/${reservation.id}/pay`}>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No tienes reservas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}