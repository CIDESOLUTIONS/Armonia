"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, X, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface ResidentVote {
  residentId: number;
  number: string;
  name: string;
  dni: string;
  vote: string | null;
}

interface Question {
  id: number;
  text: string;
  yesVotes: number;
  noVotes: number;
  nrVotes: number;
  isOpen: boolean;
  votingEndTime: number | null;
  showResidents: boolean;
  votes: ResidentVote[];
}

interface AgendaItem {
  id: number;
  numeral: string;
  topic: string;
  time: string;
  completed: boolean;
  notes: string;
}

interface Assembly {
  id: number;
  title: string;
  date: string;
  agenda: AgendaItem[];
  status: string;
}

// Datos simulados para pruebas
const mockAssemblies: Assembly[] = [
  {
    id: 1,
    title: "Asamblea General Ordinaria 2024",
    date: "2024-05-15T18:00:00",
    agenda: [
      { id: 1, numeral: "1", topic: "Verificación de quórum", time: "00:15:00", completed: true, notes: "Se verificó el quórum reglamentario" },
      { id: 2, numeral: "2", topic: "Lectura y aprobación del orden del día", time: "00:10:00", completed: true, notes: "Aprobado por unanimidad" },
      { id: 3, numeral: "3", topic: "Presentación de estados financieros", time: "00:30:00", completed: false, notes: "" }
    ],
    status: "IN_PROGRESS"
  }
];

const mockResidents: ResidentVote[] = [
  {
    residentId: 1,
    number: "A-101",
    name: "Carlos Rodríguez",
    dni: "1023456789",
    vote: null
  },
  {
    residentId: 2,
    number: "A-102",
    name: "María López",
    dni: "1087654321",
    vote: null
  },
  {
    residentId: 3,
    number: "B-201",
    name: "Juan Pérez",
    dni: "1076543210",
    vote: null
  }
];

export default function VotingPage() {
  const _router = useRouter();
  const { user, isLoggedIn, _token  } = useAuth();
  const [language, _setLanguage] = useState('Español');
  const [assemblies, setAssemblies] = useState<Assembly[]>(mockAssemblies);
  const [selectedAssembly, setSelectedAssembly] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulamos la carga de datos
    setLoading(true);
    setTimeout(() => {
      setAssemblies(mockAssemblies);
      // Si hay una sola asamblea en progreso, seleccionarla automáticamente
      const inProgressAssembly = mockAssemblies.find(a => a.status === "IN_PROGRESS");
      if (inProgressAssembly) {
        setSelectedAssembly(inProgressAssembly.id);
        handleAssemblySelect(inProgressAssembly.id);
      }
      setLoading(false);
    }, 500);
  }, []);

  // Función para manejar cuando se selecciona una asamblea
  const handleAssemblySelect = (assemblyId: number) => {
    setSelectedAssembly(assemblyId);
    // Simulación de carga de preguntas existentes
    setLoading(true);
    setTimeout(() => {
      setQuestions([
        {
          id: 1,
          text: "¿Aprueba los estados financieros presentados?",
          yesVotes: 0,
          noVotes: 0,
          nrVotes: mockResidents.length,
          isOpen: false,
          votingEndTime: null,
          showResidents: false,
          votes: mockResidents.map(r => ({ ...r }))
        }
      ]);
      setLoading(false);
    }, 500);
  };

  // Función para agregar una nueva pregunta
  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !selectedAssembly) return;
    
    setIsSubmitting(true);
    try {
      // Simulación de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
      
      setQuestions([...questions, {
        id: newId,
        text: newQuestion,
        yesVotes: 0,
        noVotes: 0,
        nrVotes: mockResidents.length,
        isOpen: false,
        votingEndTime: null,
        showResidents: false,
        votes: mockResidents.map(r => ({ ...r }))
      }]);
      
      setNewQuestion('');
      setSuccess('Pregunta agregada correctamente.');
    } catch (err) {
      setError('Error al agregar pregunta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para habilitar votación
  const handleEnableVoting = (index: number) => {
    setQuestions(questions.map((q, i) =>
      i === index ? { 
        ...q, 
        isOpen: true, 
        votingEndTime: Date.now() + 3 * 60 * 1000, // 3 minutos para votar
        showResidents: true 
      } : q
    ));
  };

  // Función para registrar voto
  const handleVoteChange = (questionIndex: number, residentId: number, vote: 'Sí' | 'No' | null) => {
    if (!questions[questionIndex].isOpen) return;
    
    setQuestions(prev => {
      const newQuestions = [...prev];
      const q = newQuestions[questionIndex];
      const residentVote = q.votes.find(v => v.residentId === residentId);
      
      if (residentVote) {
        // Actualizar contadores primero
        if (residentVote.vote === 'Sí') q.yesVotes--;
        else if (residentVote.vote === 'No') q.noVotes--;
        else q.nrVotes--;
        
        // Establecer nuevo voto
        residentVote.vote = vote;
        
        // Actualizar contadores con nuevo voto
        if (vote === 'Sí') q.yesVotes++;
        else if (vote === 'No') q.noVotes++;
        else q.nrVotes++;
      }
      
      return newQuestions;
    });
  };

  // Función para guardar resultados de votación
  const saveQuestionVotes = async (questionId: number) => {
    try {
      setIsSubmitting(true);
      
      // Simulación de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, isOpen: false } : q
      ));
      
      setSuccess('Votación finalizada y resultados guardados.');
    } catch (err) {
      setError('Error al guardar votos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para actualizar notas de un punto de agenda
  const handleUpdateAgendaNotes = async (agendaId: number, notes: string) => {
    try {
      setIsSubmitting(true);
      
      // Simulación de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar localmente
      setAssemblies(prevAssemblies => 
        prevAssemblies.map(assembly => ({
          ...assembly,
          agenda: assembly.agenda.map(item => 
            item.id === agendaId ? { ...item, notes, completed: true } : item
          )
        }))
      );
      
      setSuccess('Notas de agenda actualizadas.');
    } catch (err) {
      setError('Error al actualizar notas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para mostrar/ocultar los residentes de una pregunta
  const toggleShowResidents = (index: number) => {
    setQuestions(questions.map((q, i) =>
      i === index ? { ...q, showResidents: !q.showResidents } : q
    ));
  };

  const selectedAssemblyData = assemblies.find(a => a.id === selectedAssembly);

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        <span className="ml-3 text-lg">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'Español' ? 'Control de Votación' : 'Voting Control'}
          </h1>
        </header>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'Español' ? 'Seleccionar Asamblea' : 'Select Assembly'}
            </label>
            <select
              value={selectedAssembly || ''}
              onChange={(e) => {
                const id = parseInt(e.target.value);
                if (id) handleAssemblySelect(id);
                else setSelectedAssembly(null);
              }}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">{language === 'Español' ? 'Selecciona una asamblea' : 'Select an assembly'}</option>
              {assemblies.map(assembly => (
                <option key={assembly.id} value={assembly.id}>
                  {assembly.title} ({new Date(assembly.date).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {selectedAssembly && selectedAssemblyData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{language === 'Español' ? 'Agenda' : 'Agenda'}</h2>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">#</th>
                      <th className="px-6 py-3">{language === 'Español' ? 'Tema' : 'Topic'}</th>
                      <th className="px-6 py-3">{language === 'Español' ? 'Hora' : 'Time'}</th>
                      <th className="px-6 py-3">{language === 'Español' ? 'Observaciones' : 'Notes'}</th>
                      <th className="px-6 py-3">{language === 'Español' ? 'Estado' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAssemblyData.agenda.map(item => (
                      <tr key={item.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4">{item.numeral}</td>
                        <td className="px-6 py-4">{item.topic}</td>
                        <td className="px-6 py-4">{item.time}</td>
                        <td className="px-6 py-4">
                          <Textarea
                            value={item.notes}
                            onChange={(e) => handleUpdateAgendaNotes(item.id, e.target.value)}
                            disabled={isSubmitting || item.completed}
                            className="w-full"
                          />
                        </td>
                        <td className="px-6 py-4">{item.completed ? 'Completado' : 'Pendiente'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{language === 'Español' ? 'Preguntas' : 'Questions'}</h2>
                <div className="flex space-x-2 mb-4">
                  <Input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder={language === 'Español' ? 'Nueva pregunta' : 'New question'}
                    className="flex-1"
                  />
                  <Button onClick={handleAddQuestion} disabled={isSubmitting || questions.length >= 10}>
                    {language === 'Español' ? 'Agregar' : 'Add'}
                  </Button>
                </div>
                {questions.map((q, index) => (
                  <div key={q.id} className="border p-4 rounded-md bg-gray-50 dark:bg-gray-700 mb-4">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th className="px-6 py-3">#</th>
                          <th className="px-6 py-3">{language === 'Español' ? 'Pregunta' : 'Question'}</th>
                          <th className="px-6 py-3">{language === 'Español' ? 'Sí' : 'Yes'}</th>
                          <th className="px-6 py-3">{language === 'Español' ? 'No' : 'No'}</th>
                          <th className="px-6 py-3">{language === 'Español' ? 'NR' : 'NR'}</th>
                          <th className="px-6 py-3">{language === 'Español' ? 'Resultado' : 'Result'}</th>
                          <th className="px-6 py-3">{language === 'Español' ? 'Acciones' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4">{index + 1}</td>
                          <td className="px-6 py-4">{q.text}</td>
                          <td className="px-6 py-4">{q.yesVotes}</td>
                          <td className="px-6 py-4">{q.noVotes}</td>
                          <td className="px-6 py-4">{q.nrVotes}</td>
                          <td className="px-6 py-4">
                            {q.yesVotes > (q.votes.length / 2) ? (
                              <span className="text-green-500 flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Aprobado</span>
                            ) : (
                              <span className="text-red-500 flex items-center"><X className="w-4 h-4 mr-1" /> No Aprobado</span>
                            )}
                          </td>
                          <td className="px-6 py-4 flex space-x-2">
                            <Button
                              onClick={() => handleEnableVoting(index)}
                              disabled={isSubmitting || q.isOpen || q.votingEndTime}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                            >
                              {q.isOpen ? `${Math.max(0, Math.floor((q.votingEndTime! - Date.now()) / 1000))}s` : 'Habilitar'}
                            </Button>
                            <Button
                              onClick={() => toggleShowResidents(index)}
                              className="bg-gray-500 hover:bg-gray-600 text-white p-2"
                            >
                              <ChevronRight className={`w-4 h-4 ${q.showResidents ? 'rotate-90' : ''}`} />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {q.showResidents && (
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold">{language === 'Español' ? `Votos para "${q.text}"` : `Votes for "${q.text}"`}</h3>
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 mt-2">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                              <th className="px-6 py-3">{language === 'Español' ? '# Inmueble' : 'Property #'}</th>
                              <th className="px-6 py-3">{language === 'Español' ? 'Nombre' : 'Name'}</th>
                              <th className="px-6 py-3">{language === 'Español' ? 'DNI' : 'DNI'}</th>
                              <th className="px-6 py-3">{language === 'Español' ? 'Voto' : 'Vote'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {q.votes.map((r) => (
                              <tr key={r.residentId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4">{r.number}</td>
                                <td className="px-6 py-4">{r.name}</td>
                                <td className="px-6 py-4">{r.dni}</td>
                                <td className="px-6 py-4 flex space-x-2">
                                  <Button
                                    onClick={() => handleVoteChange(index, r.residentId, 'Sí')}
                                    disabled={!q.isOpen}
                                    className={`p-2 ${r.vote === 'Sí' ? 'bg-blue-500' : 'bg-gray-300'} hover:bg-blue-600 text-white`}
                                  >
                                    Sí
                                  </Button>
                                  <Button
                                    onClick={() => handleVoteChange(index, r.residentId, 'No')}
                                    disabled={!q.isOpen}
                                    className={`p-2 ${r.vote === 'No' ? 'bg-red-500' : 'bg-gray-300'} hover:bg-red-600 text-white`}
                                  >
                                    No
                                  </Button>
                                  <Button
                                    onClick={() => handleVoteChange(index, r.residentId, null)}
                                    disabled={!q.isOpen}
                                    className={`p-2 ${r.vote === null ? 'bg-gray-500' : 'bg-gray-300'} hover:bg-gray-600 text-white`}
                                  >
                                    Nulo
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}