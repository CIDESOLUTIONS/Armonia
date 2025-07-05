"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Eye, Trash2, Clock, MessagesSquare } from 'lucide-react';

export type PQRType = 'PETITION' | 'COMPLAINT' | 'CLAIM';
export type PQRPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PQRStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';

export interface PQR {
  id: number;
  title: string;
  description: string;
  type: PQRType;
  status: PQRStatus;
  priority: PQRPriority;
  createdAt: string;
  propertyUnit?: string;
  residentName?: string;
  assignedTo?: string;
  responseTime?: string;
  category?: string;
}

interface PQRListProps {
  pqrs: PQR[];
  onView: (pqr: PQR) => void;
  onEdit: (pqr: PQR) => void;
  onDelete: (id: number) => void;
  language: string;
}

export default function PQRList({ pqrs, onView, onEdit, onDelete, language }: PQRListProps) {
  // Helper to render appropriate status badge
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

  // Helper to render appropriate priority badge
  const renderPriorityBadge = (priority: PQRPriority) => {
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

  // Helper to render appropriate type badge
  const renderTypeBadge = (type: PQRType) => {
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

  if (pqrs.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
        <MessagesSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
          {language === 'Español' ? 'No hay solicitudes' : 'No requests'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {language === 'Español'
            ? 'No se encontraron peticiones, quejas o reclamos'
            : 'No petitions, complaints or claims found'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{language === 'Español' ? 'Título' : 'Title'}</TableHead>
            <TableHead>{language === 'Español' ? 'Tipo' : 'Type'}</TableHead>
            <TableHead>{language === 'Español' ? 'Estado' : 'Status'}</TableHead>
            <TableHead>{language === 'Español' ? 'Prioridad' : 'Priority'}</TableHead>
            <TableHead>{language === 'Español' ? 'Unidad' : 'Unit'}</TableHead>
            <TableHead>{language === 'Español' ? 'Residente' : 'Resident'}</TableHead>
            <TableHead>{language === 'Español' ? 'Asignado' : 'Assigned'}</TableHead>
            <TableHead>{language === 'Español' ? 'Fecha' : 'Date'}</TableHead>
            <TableHead className="text-right">{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pqrs.map((pqr) => (
            <TableRow key={pqr.id}>
              <TableCell className="font-medium">{pqr.id}</TableCell>
              <TableCell className="max-w-[150px] truncate" title={pqr.title}>
                {pqr.title}
              </TableCell>
              <TableCell>{renderTypeBadge(pqr.type)}</TableCell>
              <TableCell>{renderStatusBadge(pqr.status)}</TableCell>
              <TableCell>{renderPriorityBadge(pqr.priority)}</TableCell>
              <TableCell>{pqr.propertyUnit || '-'}</TableCell>
              <TableCell>{pqr.residentName || '-'}</TableCell>
              <TableCell>{pqr.assignedTo || (
                <span className="text-gray-500 italic">
                  {language === 'Español' ? 'Sin asignar' : 'Unassigned'}
                </span>
              )}</TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1 text-gray-500" />
                  <span>{new Date(pqr.createdAt).toLocaleDateString()}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(pqr)}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(pqr)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(pqr.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}