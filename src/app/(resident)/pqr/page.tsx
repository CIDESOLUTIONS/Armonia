'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, PlusCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { getPQRs } from '@/services/pqrService';

interface PQR {
  id: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  category: string;
  reportedById: number;
  reportedByName: string;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ResidentPQRPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [pqrs, setPqrs] = useState<PQR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPQRs();
    }
  }, [authLoading, user]);

  const fetchPQRs = async () => {
    setLoading(true);
    try {
      const data = await getPQRs({ reportedById: user?.id }); // Fetch PQRs reported by current user
      setPqrs(data);
    } catch (error) {
      console.error('Error fetching resident PQRs:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus PQRs.',
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Peticiones, Quejas y Reclamos</h1>
      
      <div className="flex justify-end mb-4">
        <Link href="/resident/pqr/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva PQR
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asunto</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prioridad</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Creación</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {pqrs.length > 0 ? (
              pqrs.map((pqr) => (
                <tr key={pqr.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{pqr.subject}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Badge variant={pqr.status === 'OPEN' ? 'destructive' : pqr.status === 'IN_PROGRESS' ? 'secondary' : 'default'}>
                      {pqr.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Badge variant={pqr.priority === 'HIGH' ? 'destructive' : pqr.priority === 'MEDIUM' ? 'secondary' : 'default'}>
                      {pqr.priority}
                    </Badge>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{new Date(pqr.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Link href={`/resident/pqr/${pqr.id}/view`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                  No has reportado ninguna PQR.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}