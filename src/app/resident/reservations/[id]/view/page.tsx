'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Calendar, MapPin, Users, DollarSign, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function ViewResidentReservationPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id ? parseInt(params.id as string) : null;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && reservationId) {
      fetchReservation();
    }
  }, [authLoading, user, reservationId]);

  const fetchReservation = async () => {
    setLoading(true);
    try {
      // For simplicity, fetching all and filtering. In a real app, you'd have a getReservationById endpoint.
      const data = await getReservations(); 
      const foundReservation = data.find(r => r.id === reservationId);
      if (foundReservation) {
        setReservation(foundReservation);
      } else {
        toast({
          title: 'Error',
          description: 'Reserva no encontrada.',
          variant: 'destructive',
        });
        router.push('/resident/reservations');
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la reserva.',
        variant: 'destructive',
      });
      router.push('/resident/reservations');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
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

  if (!reservation) {
    return null; // Should not happen due to redirects above
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Detalles de la Reserva: {reservation.title}</h1>
        <div className="flex space-x-2">
          {reservation.status === 'PENDING' && (
            <Link href={`/resident/reservations/${reservation.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Editar Reserva
              </Button>
            </Link>
          )}
          {reservation.requiresPayment && reservation.paymentStatus !== 'PAID' && (
            <Link href={`/resident/reservations/${reservation.id}/pay`}>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" /> Realizar Pago
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información de la Reserva</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p><strong>Área Común:</strong> {reservation.commonAreaName}</p>
          <p><strong>Descripción:</strong> {reservation.description || 'N/A'}</p>
          <p><strong>Inicio:</strong> {new Date(reservation.startDateTime).toLocaleString()}</p>
          <p><strong>Fin:</strong> {new Date(reservation.endDateTime).toLocaleString()}</p>
          <p><strong>Asistentes:</strong> {reservation.attendees}</p>
          <p><strong>Estado:</strong> 
            <Badge variant={reservation.status === 'APPROVED' ? 'default' : reservation.status === 'PENDING' ? 'secondary' : 'destructive'}>
              {reservation.status}
            </Badge>
          </p>
          {reservation.requiresPayment && (
            <p><strong>Monto a Pagar:</strong> {formatCurrency(reservation.paymentAmount || 0)}</p>
          )}
          {reservation.requiresPayment && (
            <p><strong>Estado del Pago:</strong> 
              <Badge variant={reservation.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                {reservation.paymentStatus || 'PENDING'}
              </Badge>
            </p>
          )}
          {reservation.rejectionReason && (
            <p><strong>Razón de Rechazo:</strong> {reservation.rejectionReason}</p>
          )}
          {reservation.cancellationReason && (
            <p><strong>Razón de Cancelación:</strong> {reservation.cancellationReason}</p>
          )}
          <p><strong>Reservado por:</strong> {reservation.userName} (Propiedad: {reservation.unitNumber})</p>
          <p><strong>Fecha de Creación:</strong> {new Date(reservation.createdAt).toLocaleString()}</p>
          <p><strong>Última Actualización:</strong> {new Date(reservation.updatedAt).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
