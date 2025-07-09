'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getReservations, updateReservationStatus, deleteReservation } from '@/services/reservationService';

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

export default function ReservationsPage() {
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
      const data = await getReservations();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las reservas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateReservationStatus(id, status);
      toast({
        title: 'Éxito',
        description: `Reserva ${status === 'APPROVED' ? 'aprobada' : 'rechazada'} correctamente.`, 
      });
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el estado de la reserva.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReservation = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      try {
        await deleteReservation(id);
        toast({
          title: 'Éxito',
          description: 'Reserva eliminada correctamente.',
        });
        fetchReservations();
      } catch (error) {
        console.error('Error deleting reservation:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar la reserva.',
          variant: 'destructive',
        });
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Reservas</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Área Común</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usuario</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propiedad</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inicio</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fin</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{reservation.commonAreaName}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{reservation.userName}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{reservation.unitNumber}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{reservation.title}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(reservation.startDateTime).toLocaleString()}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(reservation.endDateTime).toLocaleString()}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <Badge variant={reservation.status === 'APPROVED' ? 'default' : reservation.status === 'PENDING' ? 'secondary' : 'destructive'}>
                    {reservation.status}
                  </Badge>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <Link href={`/admin/services/reservations/${reservation.id}/view`}>
                    <Button variant="ghost" size="sm" className="mr-2">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {reservation.status === 'PENDING' && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(reservation.id, 'APPROVED')} className="mr-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(reservation.id, 'REJECTED')} className="mr-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteReservation(reservation.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                No hay reservas registradas.
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
