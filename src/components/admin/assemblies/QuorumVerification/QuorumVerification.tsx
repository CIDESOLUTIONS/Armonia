import React from 'react';
import { Users, CheckCircle } from 'lucide-react';
import Button from '@/components/common/Button';

interface Participant {
  id: string;
  nombre: string;
  unidad: string;
  poder?: string;  // Para votos por poder
  confirmado: boolean;
}

interface QuorumVerificationProps {
  participants: Participant[];
  totalUnits: number;
  requiredQuorum: number;  // Porcentaje requerido
  onConfirmParticipant: (participantId: string) => void;
  onRegisterProxy: (participantId: string, proxyDetails: string) => void;
}

const QuorumVerification: React.FC<QuorumVerificationProps> = ({
  participants,
  totalUnits,
  requiredQuorum,
  onConfirmParticipant,
  onRegisterProxy
}) => {
  const confirmedCount = participants.filter(p => p.confirmado).length;
  const currentPercentage = (confirmedCount / totalUnits) * 100;
  const quorumReached = currentPercentage >= requiredQuorum;

  return (
    <div className="space-y-6">
      {/* Resumen del Quórum */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Verificación de Quórum
          </h3>
          {quorumReached ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Quórum Alcanzado</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <Users className="w-5 h-5 mr-2" />
              <span>Esperando Quórum</span>
            </div>
          )}
        </div>

        {/* Barra de Progreso */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-blue-600">
                {currentPercentage.toFixed(1)}% Confirmado
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {requiredQuorum}% Requerido
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
            <div
              style={{ width: `${currentPercentage}%` }}
              className={`
                shadow-none flex flex-col text-center whitespace-nowrap text-white 
                justify-center transition-all duration-500
                ${quorumReached ? 'bg-green-500' : 'bg-blue-500'}
              `}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>Unidades Confirmadas: {confirmedCount}</div>
          <div>Total Unidades: {totalUnits}</div>
        </div>
      </div>

      {/* Lista de Participantes */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">
            Participantes
          </h4>
        </div>
        <div className="divide-y divide-gray-200">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="px-4 py-3 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {participant.nombre}
                </p>
                <p className="text-sm text-gray-500">
                  Unidad: {participant.unidad}
                  {participant.poder && ` (Poder: ${participant.poder})`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {participant.confirmado ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmado
                  </span>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRegisterProxy(participant.id, '')}
                    >
                      Registrar Poder
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onConfirmParticipant(participant.id)}
                    >
                      Confirmar
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuorumVerification;