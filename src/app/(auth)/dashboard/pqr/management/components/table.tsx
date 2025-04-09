import React from "react";
import { 
  MessageSquare, Check, Clock, X, UserPlus, ArrowDown, ArrowUp, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PQR } from "../types";

interface PQRTableProps {
  filteredPQRs: PQR[];
  selectedPQRs: number[];
  sortField: string | null;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
  handleSelectAll: (checked: boolean) => void;
  handleSelectPQR: (id: number, checked: boolean) => void;
  handleOpenAssignDialog: (pqr: PQR) => void;
  handleViewDetails: (pqr: PQR) => void;
  handleUpdateStatus: (id: number, status: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getCategoryLabel: (category: string) => string;
}

export default function PQRTable({
  filteredPQRs,
  selectedPQRs,
  sortField,
  sortDirection,
  handleSort,
  handleSelectAll,
  handleSelectPQR,
  handleOpenAssignDialog,
  handleViewDetails,
  handleUpdateStatus,
  getStatusBadge,
  getPriorityBadge,
  getCategoryLabel
}: PQRTableProps) {

  if (filteredPQRs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
                checked={selectedPQRs.length === filteredPQRs.length && filteredPQRs.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
              Título
              {sortField === "title" && (
                sortDirection === "asc" ? 
                <ArrowUp className="inline-block ml-1 w-4 h-4" /> : 
                <ArrowDown className="inline-block ml-1 w-4 h-4" />
              )}
            </TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
              Estado
              {sortField === "status" && (
                sortDirection === "asc" ? 
                <ArrowUp className="inline-block ml-1 w-4 h-4" /> : 
                <ArrowDown className="inline-block ml-1 w-4 h-4" />
              )}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("property")}>
              Unidad
              {sortField === "property" && (
                sortDirection === "asc" ? 
                <ArrowUp className="inline-block ml-1 w-4 h-4" /> : 
                <ArrowDown className="inline-block ml-1 w-4 h-4" />
              )}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
              Fecha
              {sortField === "createdAt" && (
                sortDirection === "asc" ? 
                <ArrowUp className="inline-block ml-1 w-4 h-4" /> : 
                <ArrowDown className="inline-block ml-1 w-4 h-4" />
              )}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("assignedTo")}>
              Asignado a
              {sortField === "assignedTo" && (
                sortDirection === "asc" ? 
                <ArrowUp className="inline-block ml-1 w-4 h-4" /> : 
                <ArrowDown className="inline-block ml-1 w-4 h-4" />
              )}
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPQRs.map((pqr) => (
            <TableRow key={pqr.id}>
              <TableCell>
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={selectedPQRs.includes(pqr.id)}
                  onChange={(e) => handleSelectPQR(pqr.id, e.target.checked)}
                />
              </TableCell>
              <TableCell className="font-medium">{pqr.title}</TableCell>
              <TableCell>{getCategoryLabel(pqr.category)}</TableCell>
              <TableCell>{getPriorityBadge(pqr.priority)}</TableCell>
              <TableCell>{getStatusBadge(pqr.status)}</TableCell>
              <TableCell>{pqr.property}</TableCell>
              <TableCell>{pqr.createdAt}</TableCell>
              <TableCell>
                {pqr.assignedTo || (
                  <Badge className="bg-red-100 text-red-800">No asignado</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleOpenAssignDialog(pqr)}
                    title="Asignar"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleViewDetails(pqr)}
                    title="Ver detalles"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  
                  {pqr.status === "open" && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleUpdateStatus(pqr.id, "inProcess")}
                      title="Marcar en proceso"
                      className="text-yellow-600"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {pqr.status === "inProcess" && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleUpdateStatus(pqr.id, "closed")}
                      title="Marcar como cerrado"
                      className="text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {pqr.status !== "rejected" && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleUpdateStatus(pqr.id, "rejected")}
                      title="Rechazar"
                      className="text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {(pqr.status === "closed" || pqr.status === "rejected") && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleUpdateStatus(pqr.id, "open")}
                      title="Reabrir"
                      className="text-blue-600"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}