'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle,  } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { PQRService } from '@/lib/pqr/pqr-service';
import { toast } from '@/components/ui/use-toast';

export function PQRDetailDialog({ pqr, isOpen, onOpenChange, onUpdate, currentUser }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [comment, setComment] = useState('');

  const canChangeStatus = currentUser?.role === 'ADMIN' || 
                          currentUser?.role === 'COMPLEX_ADMIN';
  
  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      await PQRService.updatePQRStatus(pqr.id, newStatus, currentUser);
      toast({
        title: "Estado Actualizado",
        description: `La PQR ha sido actualizada a estado ${newStatus}`,
        variant: "success"
      });
      onUpdate();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      setIsUpdating(true);
      await PQRService.addComment(pqr.id, comment, currentUser);
      toast({
        title: "Comentario Añadido",
        description: "Su comentario ha sido registrado exitosamente",
        variant: "success"
      });
      setComment('');
      onUpdate();
    } catch (error) {
      console.error('Error añadiendo comentario:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo añadir el comentario",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{pqr?.title || 'Detalle de PQR'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Tipo:</p>
              <p>{pqr?.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Estado:</p>
              <p>{pqr?.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Prioridad:</p>
              <p>{pqr?.priority}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Fecha:</p>
              <p>{pqr?.createdAt ? new Date(pqr.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Descripción:</p>
            <p className="whitespace-pre-wrap">{pqr?.description}</p>
          </div>

          {pqr?.attachments && pqr.attachments.length > 0 && (
            <div>
              <p className="text-sm font-medium">Adjuntos:</p>
              <ul className="list-disc list-inside">
                {pqr.attachments.map((attachment, index) => (
                  <li key={index}>
                    <a 
                      href={`/api/pqr/${pqr.id}/attachments/${attachment.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {attachment.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pqr?.comments && pqr.comments.length > 0 && (
            <div>
              <p className="text-sm font-medium">Comentarios:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                {pqr.comments.map((comment, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0">
                    <p className="text-sm font-medium">{comment.author} - {new Date(comment.date).toLocaleString()}</p>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Añadir Comentario:</p>
            <textarea
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
              placeholder="Escriba su comentario aquí..."
            />
            <Button 
              onClick={handleAddComment} 
              disabled={isUpdating || !comment.trim()} 
              className="mt-2"
            >
              Añadir Comentario
            </Button>
          </div>

          {canChangeStatus && (
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={isUpdating || pqr?.status === 'IN_PROGRESS'}
              >
                En Progreso
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('RESOLVED')}
                disabled={isUpdating || pqr?.status === 'RESOLVED'}
              >
                Resuelto
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('CLOSED')}
                disabled={isUpdating || pqr?.status === 'CLOSED'}
              >
                Cerrado
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}