"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import QuorumVerification from '@/components/assemblies/QuorumVerification';
import RealTimeVoting from '@/components/assemblies/RealTimeVoting';

interface AgendaItem {
  numeral: number;
  topic: string;
  time: string;
}

interface Assembly {
  id: number;
  title: string;
  date: string;
  agenda: AgendaItem[];
  totalUnits: number;
  quorumPercentage: number;
}

interface Document {
  id: number;
  fileName: string;
  createdAt: string;
  isFinal: boolean;
}

export default function ResidentAssembliesPage() {
  const _router = useRouter();
  const { isLoggedIn, _token  } = useAuth();
  const [language, _setLanguageUnused] = useState('Español');
  const [isClient, setIsClient] = useState(false);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [documents, setDocuments] = useState<{ [key: number]: Document[] }>({});
  const [isSubmitting, setIsSubmitting] = useState<{ [key: number]: number | null }>({});
  const [error, _setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAssembly, setSelectedAssembly] = useState<number | null>(null);
  const [userVotes, setUserVotes] = useState<{ [key: string]: 'YES' | 'NO' | null }>({});

  useEffect(() => {
    setIsClient(true);
    if (!isLoggedIn || !token) {
      router.push('/login');
    } else {
      fetchAssemblies();
    }
  }, [isLoggedIn, token, router]);

  const fetchAssemblies = async () => {
    try {
      // Variable response eliminada por lint
      const _data = await response.json();
      if (response.ok) {
        setAssemblies(data.assemblies || []);
        data.assemblies.forEach((assembly: Assembly) => {
          fetchDocuments(assembly.id);
          fetchUserVotes(assembly.id);
        });
      } else {
        console.error('[Resident Assemblies] Error al cargar asambleas:', data.message);
      }
    } catch (err) {
      console.error('[Resident Assemblies] Error al cargar asambleas:', err);
    }
  };

  const fetchDocuments = async (assemblyId: number) => {
    try {
      // Variable response eliminada por lint
      const _data = await response.json();
      if (response.ok) {
        setDocuments(prev => ({ ...prev, [assemblyId]: data.documents || [] }));
      } else {
        console.error('[Resident Assemblies] Error al cargar documentos:', data.message);
      }
    } catch (err) {
      console.error('[Resident Assemblies] Error al cargar documentos:', err);
    }
  };

  const fetchUserVotes = async (assemblyId: number) => {
    try {
      // Variable response eliminada por lint
      const _data = await response.json();
      if (response.ok) {
        const newUserVotes = { ...userVotes };
        (data.votes || []).forEach((vote: { agendaNumeral: number, vote: 'YES' | 'NO' }) => {
          const key = `${assemblyId}-${vote.agendaNumeral}`;
          newUserVotes[key] = vote.vote;
        });
        setUserVotes(newUserVotes);
      } else {
        console.error('[Resident Assemblies] Error al cargar votos del usuario:', data.message);
      }
    } catch (err) {
      console.error('[Resident Assemblies] Error al cargar votos del usuario:', err);
    }
  };

  const handleConfirmAttendance = async (assemblyId: number) => {
    setIsSubmitting(prev => ({ ...prev, [assemblyId]: 0 }));
    setError(null);
    setSuccess(null);

    try {
      // Variable response eliminada por lint

      const _data = await response.json();
      console.log('[Resident Assemblies] Respuesta de /api/assemblies/attendance/confirm:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al confirmar asistencia');
      }

      setSuccess(language === 'Español' ? 'Asistencia confirmada con éxito.' : 'Attendance confirmed successfully.');
    } catch (err) {
      console.error('[Resident Assemblies] Error al confirmar asistencia:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [assemblyId]: null }));
    }
  };

  const handleVote = async (assemblyId: number, numeral: number, vote: 'YES' | 'NO') => {
    setIsSubmitting(prev => ({ ...prev, [assemblyId]: numeral }));
    setError(null);
    setSuccess(null);

    try {
      // Variable response eliminada por lint

      const _data = await response.json();
      console.log('[Resident Assemblies] Respuesta de /api/assemblies/voting/vote:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar voto');
      }

      // Actualizar el voto del usuario localmente
      setUserVotes(prev => ({
        ...prev,
        [`${assemblyId}-${numeral}`]: vote
      }));

      setSuccess(language === 'Español' ? 'Voto registrado con éxito.' : 'Vote registered successfully.');
    } catch (err) {
      console.error('[Resident Assemblies] Error al registrar voto:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(prev => ({ ...prev, [assemblyId]: null }));
    }
  };

  const handleDownloadDocument = async (documentId: number) => {
    try {
      // Variable response eliminada por lint
      if (!response.ok) throw new Error('Error al descargar documento');

      const blob = await response.blob();
      const _url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documents[selectedAssembly || 0]?.find(d => d.id === documentId)?.fileName || 'document.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Resident Assemblies] Error al descargar documento:', err);
      setError(err.message);
    }
  };

  if (!isClient || !isLoggedIn || !token) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{uage === 'Español' ? 'Asambleas Disponibles' : 'Available Assemblies'}</h2>
      <div className="space-y-6">
        {assemblies.map(assembly => (
          <div key={assembly.id} className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">{assembly.title}</h3>
            <p className="text-gray-600 mb-4">{new Date(assembly.date).toLocaleString()}</p>
            
            {/* Componente de verificación de quórum */}
            <QuorumVerification 
              assemblyId={assembly.id}
              token={token}
              language={uage}
              totalUnits={assembly.totalUnits}
              quorumPercentage={assembly.quorumPercentage}
            />
            
            <Button
              onClick={() => handleConfirmAttendance(assembly.id)}
              disabled={isSubmitting[assembly.id] === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white mr-2"
            >
              {isSubmitting[assembly.id] === 0 ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {uage === 'Español' ? 'Confirmar Asistencia' : 'Confirm Attendance'}
            </Button>
            
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">{uage === 'Español' ? 'Votaciones' : 'Voting'}</h4>
              <div className="space-y-4">
                {assembly.agenda.map(item => (
                  <div key={item.numeral} className="bg-gray-50 p-4 rounded-md">
                    {/* Componente de votación en tiempo real */}
                    <RealTimeVoting
                      assemblyId={assembly.id}
                      agendaNumeral={item.numeral}
                      topic={item.topic}
                      token={token}
                      language={uage}
                      userVote={userVotes[`${assembly.id}-${item.numeral}`] || null}
                      onVoteSubmitted={() => fetchUserVotes(assembly.id)}
                    />
                    
                    <div className="flex space-x-3 mt-3">
                      <Button
                        onClick={() => handleVote(assembly.id, item.numeral, 'YES')}
                        disabled={isSubmitting[assembly.id] === item.numeral}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        {isSubmitting[assembly.id] === item.numeral ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {uage === 'Español' ? 'Aprobar' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleVote(assembly.id, item.numeral, 'NO')}
                        disabled={isSubmitting[assembly.id] === item.numeral}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        {isSubmitting[assembly.id] === item.numeral ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {uage === 'Español' ? 'Rechazar' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">{uage === 'Español' ? 'Documentos' : 'Documents'}</h4>
              <div className="space-y-2">
                {(documents[assembly.id] || []).length > 0 ? (
                  documents[assembly.id].map(doc => (
                    <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div>
                        <p className="font-medium">{doc.fileName}</p>
                        <p className="text-sm text-gray-500">{new Date(doc.createdAt).toLocaleString()}</p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedAssembly(assembly.id);
                          handleDownloadDocument(doc.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        {uage === 'Español' ? 'Descargar' : 'Download'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">{uage === 'Español' ? 'No hay documentos disponibles' : 'No documents available'}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {assemblies.length === 0 && (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500">
              {uage === 'Español' 
                ? 'No hay asambleas programadas en este momento.' 
                : 'No assemblies scheduled at this time.'}
            </p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
