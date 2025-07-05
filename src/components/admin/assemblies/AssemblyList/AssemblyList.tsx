import React from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

interface Assembly {
  id: string;
  tipo: 'ordinaria' | 'extraordinaria';
  fecha: string;
  hora: string;
  estado: 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
  quorum: number;
  participantes: number;
}

interface AssemblyListProps {
  assemblies: Assembly[];
  onViewDetails: (assembly: Assembly) => void;
  onCreateNew: () => void;
}

const AssemblyList: React.FC<AssemblyListProps> = ({
  assemblies,
  onViewDetails,
  onCreateNew
}) => {
  const getStatusColor = (status: Assembly['estado']) => {
    switch (status) {
      case 'programada': return 'warning';
      case 'en_curso': return 'info';
      case 'finalizada': return 'success';
      case 'cancelada': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: Assembly['estado']) => {
    switch (status) {
      case 'programada': return 'Programada';
      case 'en_curso': return 'En Curso';
      case 'finalizada': return 'Finalizada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const columns = [
    { 
      key: 'tipo',
      title: 'Tipo',
      render: (value: Assembly['tipo']) => (
        <span className="capitalize">{value}</span>
      )
    },
    {
      key: 'fecha',
      title: 'Fecha',
      render: (value: string, record: Assembly) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{value}</span>
          <Clock className="w-4 h-4 text-gray-500 ml-2" />
          <span>{record.hora}</span>
        </div>
      )
    },
    {
      key: 'estado',
      title: 'Estado',
      render: (value: Assembly['estado']) => (
        <Badge variant={getStatusColor(value)}>
          {getStatusText(value)}
        </Badge>
      )
    },
    {
      key: 'quorum',
      title: 'Quórum',
      render: (value: number, record: Assembly) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span>{record.participantes}/{value} ({Math.round(record.participantes/value * 100)}%)</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Asambleas
        </h2>
        <Button
          variant="primary"
          onClick={onCreateNew}
        >
          Nueva Asamblea
        </Button>
      </div>

      <Table
        columns={columns}
        data={assemblies}
        onRowClick={onViewDetails}
      />
    </div>
  );
};

export default AssemblyList;