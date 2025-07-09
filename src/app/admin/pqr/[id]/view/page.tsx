'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Edit, Trash2, MessageSquare, User, Tag, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getPQRById, updatePQR, deletePQR, addPQRComment, assignPQR } from '@/services/pqrService';

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
  comments: PQRComment[];
}

interface PQRComment {
  id: number;
  pqrId: number;
  authorId: number;
  authorName: string;
  comment: string;
  createdAt: string;
}

export default function ViewPQRPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const pqrId = params.id ? parseInt(params.id as string) : null;

  const [pqr, setPqr] = useState<PQR | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PQR['status'] | ''>('');
  const [selectedAssignee, setSelectedAssignee] = useState<string | number>(''); // Assuming assignee ID or name

  useEffect(() => {
    if (!authLoading && user && pqrId) {
      fetchPQR();
    }
  }, [authLoading, user, pqrId]);

  const fetchPQR = async () => {
    setLoading(true);
    try {
      const data = await getPQRById(pqrId as number);
      setPqr(data);
      setSelectedStatus(data.status);
      setSelectedAssignee(data.assignedToId || '');
    } catch (error) {
      console.error('Error fetching PQR:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la PQR.',
        variant: 'destructive',
      });
      router.push('/admin/pqr/list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!pqrId || !newComment.trim()) return;
    try {
      await addPQRComment(pqrId, newComment);
      setNewComment('');
      toast({
        title: 'Éxito',
        description: 'Comentario añadido correctamente.',
      });
      fetchPQR();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Error al añadir comentario.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!pqrId || !selectedStatus) return;
    try {
      await updatePQR(pqrId, { status: selectedStatus });
      toast({
        title: 'Éxito',
        description: 'Estado de PQR actualizado correctamente.',
      });
      fetchPQR();
    } catch (error) {
      console.error('Error updating PQR status:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar estado.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignPQR = async () => {
    if (!pqrId || !selectedAssignee) return;
    try {
      await assignPQR(pqrId, selectedAssignee as number); // Assuming selectedAssignee is ID
      toast({
        title: 'Éxito',
        description: 'PQR asignada correctamente.',
      });
      fetchPQR();
    } catch (error) {
      console.error('Error assigning PQR:', error);
      toast({
        title: 'Error',
        description: 'Error al asignar PQR.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePQR = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta PQR?')) {
      try {
        await deletePQR(pqrId as number);
        toast({
          title: 'Éxito',
          description: 'PQR eliminada correctamente.',
        });
        router.push('/admin/pqr/list');
      } catch (error) {
        console.error('Error deleting PQR:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar la PQR.',
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

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN' && user.role !== 'STAFF' && user.role !== 'RESIDENT')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (!pqr) {
    return null; // Should not happen due to redirects above
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Detalles de PQR: {pqr.subject}</h1>
        <div className="flex space-x-2">
          <Link href={`/admin/pqr/${pqr.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Editar PQR
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeletePQR}>
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar PQR
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p><strong>Descripción:</strong> {pqr.description}</p>
          <p><strong>Reportado por:</strong> {pqr.reportedByName}</p>
          <p><strong>Categoría:</strong> {pqr.category}</p>
          <p><strong>Prioridad:</strong> 
            <Badge variant={pqr.priority === 'HIGH' ? 'destructive' : pqr.priority === 'MEDIUM' ? 'secondary' : 'default'}>
              {pqr.priority}
            </Badge>
          </p>
          <p><strong>Estado:</strong> 
            <Badge variant={pqr.status === 'OPEN' ? 'destructive' : pqr.status === 'IN_PROGRESS' ? 'secondary' : 'default'}>
              {pqr.status}
            </Badge>
          </p>
          <p><strong>Asignado a:</strong> {pqr.assignedToName || 'N/A'}</p>
          <p><strong>Fecha de Creación:</strong> {new Date(pqr.createdAt).toLocaleString()}</p>
          <p><strong>Última Actualización:</strong> {new Date(pqr.updatedAt).toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Gestión de Estado y Asignación */}
      {(user?.role === 'ADMIN' || user?.role === 'COMPLEX_ADMIN' || user?.role === 'STAFF') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gestión de PQR</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="status-select">Cambiar Estado</Label>
              <Select value={selectedStatus} onValueChange={(value: PQR['status']) => setSelectedStatus(value)}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Abierta</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="CLOSED">Cerrada</SelectItem>
                  <SelectItem value="REJECTED">Rechazada</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} className="mt-2">Actualizar Estado</Button>
            </div>
            <div>
              <Label htmlFor="assignee-select">Asignar a</Label>
              <Select value={selectedAssignee} onValueChange={(value: string) => setSelectedAssignee(parseInt(value))}>
                <SelectTrigger id="assignee-select">
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  {/* Aquí se cargarían dinámicamente los usuarios STAFF/ADMIN/COMPLEX_ADMIN */}
                  <SelectItem value={user?.id || ''}>{user?.name || 'Yo'}</SelectItem>
                  {/* Ejemplo: <SelectItem value="2">Juan Pérez (Mantenimiento)</SelectItem> */}
                </SelectContent>
              </Select>
              <Button onClick={handleAssignPQR} className="mt-2">Asignar PQR</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comentarios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" /> Comentarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            {pqr.comments.length > 0 ? (
              pqr.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-2">
                  <p className="text-sm font-semibold">{comment.authorName} <span className="text-gray-500 text-xs">({new Date(comment.createdAt).toLocaleString()})</span></p>
                  <p className="text-gray-700">{comment.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay comentarios aún.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Textarea 
              placeholder="Añadir un comentario..." 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              rows={3}
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Añadir Comentario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
