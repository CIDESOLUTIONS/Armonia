import React from "react";
import { PQR } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

// Interfaces para los diálogos
interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pqr: PQR | null;
  assignedUser: string;
  users: Array<{id: number, name: string, role: string}>;
  onAssignUser: (value: string) => void;
  onSubmit: () => void;
}

interface DetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pqr: PQR | null;
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onAddComment: () => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getCategoryLabel: (category: string) => string;
  handleUpdateStatus: (id: number, status: string) => void;
  getStatusLabel: (status: string) => string;
}

interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bulkAction: string;
  bulkAssignee: string;
  selectedCount: number;
  users: Array<{id: number, name: string, role: string}>;
  onBulkActionChange: (value: string) => void;
  onBulkAssigneeChange: (value: string) => void;
  onApply: () => void;
  isLoading: boolean;
}

// Componente para el diálogo de asignación
export function AssignDialog({
  open, 
  onOpenChange, 
  pqr, 
  assignedUser, 
  users, 
  onAssignUser, 
  onSubmit
}: AssignDialogProps) {
  if (!pqr) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar PQR</DialogTitle>
          <DialogDescription>
            Seleccione la persona responsable para gestionar esta solicitud.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <p className="mb-2 font-medium text-sm">{pqr.title}</p>
          
          <Label htmlFor="assignee">Asignar a</Label>
          <Select value={assignedUser} onValueChange={onAssignUser}>
            <SelectTrigger id="assignee" className="mt-1">
              <SelectValue placeholder="Seleccionar responsable" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.name}>
                  {user.name} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={!assignedUser}>
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente para el diálogo de detalles
export function DetailsDialog({ 
  open, 
  onOpenChange, 
  pqr, 
  newComment, 
  onNewCommentChange, 
  onAddComment,
  getStatusBadge,
  getPriorityBadge,
  getCategoryLabel,
  handleUpdateStatus,
  getStatusLabel
}: DetailsDialogProps) {
  if (!pqr) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{pqr.title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-500">Unidad</h3>
            <p>{pqr.property}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Reportado por</h3>
            <p>{pqr.reporter}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Categoría</h3>
            <p>{getCategoryLabel(pqr.category)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Prioridad</h3>
            <p>{getPriorityBadge(pqr.priority)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Estado</h3>
            <p>{getStatusBadge(pqr.status)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Fecha</h3>
            <p>{pqr.createdAt}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Asignado a</h3>
            <p>{pqr.assignedTo || "No asignado"}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Última actualización</h3>
            <p>{pqr.updatedAt}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-medium text-gray-500">Descripción</h3>
          <p className="mt-1 text-gray-800 whitespace-pre-line">{pqr.description}</p>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-gray-500 mb-2">Comentarios</h3>
          
          {pqr.comments.length === 0 ? (
            <p className="text-gray-500 italic">No hay comentarios</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {pqr.comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <p className="font-medium text-indigo-600">{comment.author}</p>
                    <p className="text-xs text-gray-500">{comment.createdAt}</p>
                  </div>
                  <p className="mt-1 text-gray-800">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <Label htmlFor="newComment">Agregar comentario</Label>
            <Textarea
              id="newComment"
              value={newComment}
              onChange={(e) => onNewCommentChange(e.target.value)}
              placeholder="Escribir un comentario..."
              className="mt-1"
              rows={3}
            />
            <Button
              className="mt-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={onAddComment}
              disabled={!newComment.trim()}
            >
              Agregar comentario
            </Button>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-2 justify-end">
          {pqr.status === "open" && (
            <>
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                onClick={() => handleUpdateStatus(pqr.id, "inProcess")}
              >
                En Proceso
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => handleUpdateStatus(pqr.id, "rejected")}
              >
                Rechazar
              </Button>
            </>
          )}
          
          {pqr.status === "inProcess" && (
            <Button
              variant="outline"
              className="border-green-500 text-green-500 hover:bg-green-50"
              onClick={() => handleUpdateStatus(pqr.id, "closed")}
            >
              Completado
            </Button>
          )}
          
          {(pqr.status === "closed" || pqr.status === "rejected") && (
            <Button
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={() => handleUpdateStatus(pqr.id, "open")}
            >
              Reabrir
            </Button>
          )}
          
          <Button
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para el diálogo de acciones masivas
export function BulkActionDialog({
  open,
  onOpenChange,
  bulkAction,
  bulkAssignee,
  selectedCount,
  users,
  onBulkActionChange,
  onBulkAssigneeChange,
  onApply,
  isLoading
}: BulkActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Acciones Masivas</DialogTitle>
          <DialogDescription>
            Aplique una acción a {selectedCount} PQRs seleccionados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="bulkAction">Acción</Label>
            <Select value={bulkAction} onValueChange={onBulkActionChange}>
              <SelectTrigger id="bulkAction" className="mt-1">
                <SelectValue placeholder="Seleccionar acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assign">Asignar a</SelectItem>
                <SelectItem value="open">Marcar como abierto</SelectItem>
                <SelectItem value="inProcess">Marcar en proceso</SelectItem>
                <SelectItem value="closed">Marcar como cerrado</SelectItem>
                <SelectItem value="rejected">Marcar como rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {bulkAction === "assign" && (
            <div>
              <Label htmlFor="bulkAssignee">Asignar a</Label>
              <Select value={bulkAssignee} onValueChange={onBulkAssigneeChange}>
                <SelectTrigger id="bulkAssignee" className="mt-1">
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onApply} 
            disabled={!bulkAction || (bulkAction === "assign" && !bulkAssignee) || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aplicando...
              </>
            ) : (
              "Aplicar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}