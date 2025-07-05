// src/components/ui/pagination/pagination.tsx
"use client";

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxButtons = 5
}: PaginationProps) {
  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null;
  }

  // Calcular el rango de páginas a mostrar
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  // Ajustar si estamos muy cerca del final
  if (endPage - startPage + 1 < maxButtons && startPage > 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  
  // Crear array de páginas a mostrar
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
  
  return (
    <div className="flex justify-center items-center gap-1">
      {/* Botones para ir al inicio */}
      {startPage > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8"
            title="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </>
      )}
      
      {/* Números de página */}
      {pages.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className={`h-8 w-8 ${page === currentPage ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white" : ""}`}
        >
          {page}
        </Button>
      ))}
      
      {/* Botones para ir al final */}
      {endPage < totalPages && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8"
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8"
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
