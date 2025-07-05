import React, { useState } from 'react';
import { PieChart, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import Button from '@/components/common/Button';

interface Vote {
  id: string;
  participantId: string;
  value: 'favor' | 'contra' | 'abstencion';
  timestamp: string;
}

interface VotingTopic {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_curso' | 'finalizado';
  votos: Vote[];
  quorum: number;
}

interface VotingSystemProps {
  topic: VotingTopic;
  onStartVoting: () => void;
  onEndVoting: () => void;
  onVote: (participantId: string, value: Vote['value']) => void;
}

const VotingSystem: React.FC<VotingSystemProps> = ({
  topic,
  onStartVoting,
  onEndVoting,
  onVote
}) => {
  const [selectedVote, setSelectedVote] = useState<Vote['value'] | null>(null);

  // Calcular resultados
  const totalVotes = topic.votos.length;
  const results = {
    favor: topic.votos.filter(v => v.value === 'favor').length,
    contra: topic.votos.filter(v => v.value === 'contra').length,
    abstencion: topic.votos.filter(v => v.value === 'abstencion').length
  };

  return (
    <div className="space-y-6">
      {/* Información del Tema */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {topic.titulo}
        </h3>
        <p className="text-gray-600 mb-4">
          {topic.descripcion}
        </p>

        {/* Estado de la Votación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Estado:
            </span>
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${topic.estado === 'en_curso' ? 'bg-blue-100 text-blue-800' :
                topic.estado === 'finalizado' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {topic.estado === 'en_curso' ? 'Votación en Curso' :
               topic.estado === 'finalizado' ? 'Votación Finalizada' :
               'Pendiente'}
            </span>
          </div>
          {topic.estado === 'pendiente' && (
            <Button onClick={onStartVoting}>
              Iniciar Votación
            </Button>
          )}
          {topic.estado === 'en_curso' && (
            <Button variant="danger" onClick={onEndVoting}>
              Finalizar Votación
            </Button>
          )}
        </div>
      </div>

      {/* Sistema de Votación */}
      {topic.estado === 'en_curso' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Emitir Voto
          </h4>
          <div className="flex space-x-4">
            <Button
              variant={selectedVote === 'favor' ? 'primary' : 'outline'}
              onClick={() => setSelectedVote('favor')}
              icon={<CheckCircle2 />}
            >
              A Favor
            </Button>
            <Button
              variant={selectedVote === 'contra' ? 'primary' : 'outline'}
              onClick={() => setSelectedVote('contra')}
              icon={<XCircle />}
            >
              En Contra
            </Button>
            <Button
              variant={selectedVote === 'abstencion' ? 'primary' : 'outline'}
              onClick={() => setSelectedVote('abstencion')}
              icon={<HelpCircle />}
            >
              Abstención
            </Button>
          </div>
        </div>
      )}

      {/* Resultados */}
      {(topic.estado === 'en_curso' || topic.estado === 'finalizado') && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">
              Resultados Parciales
            </h4>
            <div className="flex items-center text-sm text-gray-500">
              <PieChart className="w-4 h-4 mr-1" />
              Total Votos: {totalVotes}
            </div>
          </div>

          <div className="space-y-4">
            {/* A Favor */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">A Favor</span>
                <span className="text-sm font-medium text-gray-700">
                  {((results.favor / totalVotes) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(results.favor / totalVotes) * 100}%` }}
                />
              </div>
            </div>

            {/* En Contra */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">En Contra</span>
                <span className="text-sm font-medium text-gray-700">
                  {((results.contra / totalVotes) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(results.contra / totalVotes) * 100}%` }}
                />
              </div>
            </div>

            {/* Abstención */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Abstención</span>
                <span className="text-sm font-medium text-gray-700">
                  {((results.abstencion / totalVotes) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: `${(results.abstencion / totalVotes) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingSystem;