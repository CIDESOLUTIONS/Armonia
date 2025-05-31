"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface RealTimeVotingProps {
  assemblyId: number;
  agendaNumeral: number;
  topic: string;
  token: string;
  language: string;
  userVote: 'YES' | 'NO' | null;
  onVoteSubmitted: () => void;
}

interface VotingStats {
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  yesPercentage: number;
  noPercentage: number;
  isOpen: boolean;
  endTime: string | null;
}

export default function RealTimeVoting({
  assemblyId,
  agendaNumeral,
  topic,
  token,
  language,
  userVote,
  onVoteSubmitted
}: RealTimeVotingProps) {
  const [stats, setStats] = useState<VotingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchVotingStats = async () => {
    try {
      // Variable response eliminada por lint
      
      if (!response.ok) {
        throw new Error(language === 'Español' ? 'Error al cargar estadísticas de votación' : 'Error loading voting statistics');
      }
      
      const _data = await response.json();
      setStats(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('[RealTimeVoting] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Efecto inicial para cargar datos
  useEffect(() => {
    fetchVotingStats();
    
    // Configurar actualización en tiempo real cada 15 segundos
    const intervalId = setInterval(() => {
      fetchVotingStats();
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [assemblyId, agendaNumeral, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
        <span className="text-sm">{language === 'Español' ? 'Cargando resultados...' : 'Loading results...'}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 p-2">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="p-4 mb-2">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-sm">#{agendaNumeral}: {topic}</h4>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'Español' ? 'Votos totales:' : 'Total votes:'} {stats.totalVotes}
          </p>
        </div>
        <Badge variant={stats.isOpen ? "outline" : "secondary"}>
          {stats.isOpen 
            ? (language === 'Español' ? 'Votación Abierta' : 'Voting Open') 
            : (language === 'Español' ? 'Votación Cerrada' : 'Voting Closed')}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className={`p-3 rounded-md flex items-center justify-between ${userVote === 'YES' ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
          <div className="flex items-center">
            <CheckCircle2 className={`w-4 h-4 mr-2 ${userVote === 'YES' ? 'text-green-600' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">{language === 'Español' ? 'A favor' : 'In favor'}</span>
          </div>
          <div>
            <span className="text-sm font-bold">{stats.yesPercentage}%</span>
            <span className="text-xs text-gray-500 ml-1">({stats.yesVotes})</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-md flex items-center justify-between ${userVote === 'NO' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
          <div className="flex items-center">
            <XCircle className={`w-4 h-4 mr-2 ${userVote === 'NO' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">{language === 'Español' ? 'En contra' : 'Against'}</span>
          </div>
          <div>
            <span className="text-sm font-bold">{stats.noPercentage}%</span>
            <span className="text-xs text-gray-500 ml-1">({stats.noVotes})</span>
          </div>
        </div>
      </div>
      
      {stats.endTime && !stats.isOpen && (
        <div className="text-xs text-gray-500">
          {language === 'Español' 
            ? `Votación cerrada el ${new Date(stats.endTime).toLocaleString()}` 
            : `Voting closed on ${new Date(stats.endTime).toLocaleString()}`}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500 text-right">
        {language === 'Español' 
          ? `Última actualización: ${lastUpdate.toLocaleTimeString()}` 
          : `Last update: ${lastUpdate.toLocaleTimeString()}`}
      </div>
    </Card>
  );
}
