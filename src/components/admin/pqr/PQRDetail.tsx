"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, User, Home, CheckCircle, XCircle, SendHorizontal, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import type { PQR, PQRStatus } from './PQRList';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  createdBy: string;
  isInternal: boolean;
}

interface PQRDetailProps {
  pqr: PQR;
  comments: Comment[];
  onBack: () => void;
  onUpdateStatus: (id: number, status: PQRStatus) => void;
  onAssign: (id: number, userId: string) => void;
  onAddComment: (content: string, isInternal: boolean) => void;
  users: { id: number; name: string }[];
  language: string;
}

export default function PQRDetail({
  pqr,
  comments,
  onBack,
  onUpdateStatus,
  onAssign,
  onAddComment,
  users,
  language
}: PQRDetailProps) {
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [selectedUser, setSelectedUser] = useState(pqr.assignedTo || '');

  // Helper functions to render badges with appropriate colors
  const renderStatusBadge = (status: PQRStatus) => {
    let bgColor = '';
    let textColor = '';
    let label = '';

    switch (status) {
      case 'NEW':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        label = language === 'Español' ? 'Nuevo' : 'New';
        break;
      case 'IN_PROGRESS':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        label = language === 'Español' ? 'En Progreso' : 'In Progress';
        break;
      case 'RESOLVED':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        label = language === 'Español' ? 'Resuelto' : 'Resolved';
        break;
      case 'CLOSED':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        label = language === 'Español' ? 'Cerrado' : 'Closed';
        break;
      case 'CANCELLED':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        label = language === 'Español' ? 'Cancelado' : 'Cancelled';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        label = status;
    }

    return <Badge className={`${bgColor} ${textColor}`}>{label}</Badge>;
  };

  const renderPriorityBadge = (priority: string) => {
    let bgColor = '';
    let textColor = '';
    let label = '';

    switch (priority) {
      case 'LOW':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        label = language === 'Español' ? 'Baja' : 'Low';
        break;
      case 'MEDIUM':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        label = language === 'Español' ? 'Media' : 'Medium';
        break;
      case 'HIGH':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        label = language === 'Español' ? 'Alta' : 'High';
        break;
      case 'URGENT':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        label = language === 'Español' ? 'Urgente' : 'Urgent';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        label = priority;
    }

    return <Badge className={`${bgColor} ${textColor}`}>{label}</Badge>;
  };

  const renderTypeBadge = (type: string) => {
    let bgColor = '';
    let textColor = '';
    let label = '';

    switch (type) {
      case 'PETITION':
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-800';
        label = language === 'Español' ? 'Petición' : 'Petition';
        break;
      case 'COMPLAINT':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        label = language === 'Español' ? 'Queja' : 'Complaint';
        break;
      case 'CLAIM':
        bgColor = 'bg-pink-100';
        textColor = 'text-pink-800';
        label = language === 'Español' ? 'Reclamo' : 'Claim';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        label = type;
    }

    return <Badge className={`${bgColor} ${textColor}`}>{label}</Badge>;
  };

  // Handler for changing PQR status
  const handleStatusChange = (status: string) => {
    onUpdateStatus(pqr.id, status as PQRStatus);
  };

  // Handler for changing assignment
  const handleAssignmentChange = (userId: string) => {
    setSelectedUser(userId);
    onAssign(pqr.id, userId);
  };

  // Handler for adding a comment
  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment, isInternalComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'Español' ? 'Volver' : 'Back'}
        </Button>

        <div className="space-x-2">
          {pqr.status !== 'CLOSED' && pqr.status !== 'CANCELLED' && (
            <>
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                onClick={() => handleStatusChange(pqr.status === 'NEW' ? 'IN_PROGRESS' : 'NEW')}
              >
                {pqr.status === 'NEW'
                  ? language === 'Español' ? 'Iniciar' : 'Start'
                  : language === 'Español' ? 'Marcar como nuevo' : 'Mark as new'}
              </Button>
              <Button
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => handleStatusChange('RESOLVED')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {language === 'Español' ? 'Resolver' : 'Resolve'}
              </Button>
              <Button
                variant="outline"
                className="border-gray-500 text-gray-600 hover:bg-gray-50"
                onClick={() => handleStatusChange('CLOSED')}
              >
                {language === 'Español' ? 'Cerrar' : 'Close'}
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => handleStatusChange('CANCELLED')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {language === 'Español' ? 'Cancelar' : 'Cancel'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex space-x-2 mb-2">
                {renderTypeBadge(pqr.type)}
                {renderStatusBadge(pqr.status)}
                {renderPriorityBadge(pqr.priority)}
              </div>
              <CardTitle className="text-2xl">{pqr.title}</CardTitle>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center justify-end mb-1">
                <Clock className="mr-1 h-4 w-4" />
                <span>{new Date(pqr.createdAt).toLocaleString()}</span>
              </div>
              {pqr.propertyUnit && (
                <div className="flex items-center justify-end mb-1">
                  <Home className="mr-1 h-4 w-4" />
                  <span>{pqr.propertyUnit}</span>
                </div>
              )}
              {pqr.residentName && (
                <div className="flex items-center justify-end">
                  <User className="mr-1 h-4 w-4" />
                  <span>{pqr.residentName}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="whitespace-pre-line">{pqr.description}</p>
          </div>

          {/* Assignment Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {language === 'Español' ? 'Asignación' : 'Assignment'}
            </h3>
            <div className="flex items-center">
              <Select
                value={selectedUser}
                onValueChange={handleAssignmentChange}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder={language === 'Español' ? 'Seleccionar responsable' : 'Select assignee'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    {language === 'Español' ? '-- Sin asignar --' : '-- Unassigned --'}
                  </SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.name}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-2">
                {pqr.assignedTo ? (
                  <span className="text-green-600">
                    {language === 'Español' 
                      ? `Asignado a ${pqr.assignedTo}` 
                      : `Assigned to ${pqr.assignedTo}`}
                  </span>
                ) : (
                  <span className="text-gray-500 italic">
                    {language === 'Español' 
                      ? 'Esta solicitud no está asignada' 
                      : 'This request is not assigned'}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {language === 'Español' ? 'Comentarios' : 'Comments'}
            </h3>
            
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-gray-500 italic">
                  {language === 'Español' 
                    ? 'No hay comentarios aún' 
                    : 'No comments yet'}
                </p>
              ) : (
                comments.map(comment => (
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-lg ${
                      comment.isInternal 
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{comment.createdBy}</span>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-500" />
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                        {comment.isInternal && (
                          <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                            {language === 'Español' ? 'Interno' : 'Internal'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="whitespace-pre-line">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            
            {/* Add Comment Form */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="newComment">
                  {language === 'Español' ? 'Agregar comentario' : 'Add comment'}
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="internalComment"
                    checked={isInternalComment}
                    onCheckedChange={setIsInternalComment}
                  />
                  <Label htmlFor="internalComment" className="cursor-pointer">
                    {language === 'Español' ? 'Comentario interno' : 'Internal comment'}
                  </Label>
                  {isInternalComment && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              <Textarea
                id="newComment"
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                placeholder={language === 'Español' 
                  ? 'Escribe tu comentario aquí...' 
                  : 'Write your comment here...'}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={!newComment.trim()}
                >
                  <SendHorizontal className="mr-2 h-4 w-4" />
                  {language === 'Español' ? 'Enviar' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}