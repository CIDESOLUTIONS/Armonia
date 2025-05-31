"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Resident {
  id: number;
  number: string;
  name: string;
  dni: string;
  email: string;
  attendance: 'Sí' | 'No' | 'Delegado';
  delegateName: string | null;
  confirmed: boolean;
  isMainResident: boolean;
}

interface Assembly {
  id: number;
  title: string;
  type: string;
  date: string;
  description: string | null;
  agenda: { numeral: string; topic: string; time: string; completed: boolean; notes: string }[];
  status: string;
}

// Datos simulados para pruebas
const mockAssemblies: Assembly[] = [
  {
    id: 1,
    title: "Asamblea General Ordinaria 2024",
    type: "GENERAL",
    date: "2024-05-15T18:00:00",
    description: "Aprobación de presupuesto anual y elección de comités",
    agenda: [
      { numeral: "1", topic: "Verificación de quórum", time: "00:15:00", completed: false, notes: "" },
      { numeral: "2", topic: "Lectura y aprobación del orden del día", time: "00:10:00", completed: false, notes: "" },
      { numeral: "3", topic: "Presentación de estados financieros", time: "00:30:00", completed: false, notes: "" }
    ],
    status: "PENDING"
  },
  {
    id: 2,
    title: "Asamblea Extraordinaria - Proyecto de Seguridad",
    type: "EXTRAORDINARY",
    date: "2024-05-25T19:00:00",
    description: "Discusión y aprobación del proyecto de mejora de seguridad",
    agenda: [
      { numeral: "1", topic: "Verificación de quórum", time: "00:15:00", completed: false, notes: "" },
      { numeral: "2", topic: "Presentación del proyecto", time: "00:25:00", completed: false, notes: "" },
      { numeral: "3", topic: "Votación", time: "00:20:00", completed: false, notes: "" }
    ],
    status: "PENDING"
  }
];

const mockResidents: Resident[] = [
  {
    id: 1,
    number: "A-101",
    name: "Carlos Rodríguez",
    dni: "1023456789",
    email: "carlos@example.com",
    attendance: 'No',
    delegateName: null,
    confirmed: false,
    isMainResident: true
  },
  {
    id: 2,
    number: "A-102",
    name: "María López",
    dni: "1087654321",
    email: "maria@example.com",
    attendance: 'No',
    delegateName: null,
    confirmed: false,
    isMainResident: true
  },
  {
    id: 3,
    number: "B-201",
    name: "Juan Pérez",
    dni: "1076543210",
    email: "juan@example.com",
    attendance: 'No',
    delegateName: null,
    confirmed: false,
    isMainResident: true
  }
];

export default function AttendancePage() {
  const _router = useRouter();
  const { schemaName, user, isLoggedIn, _token  } = useAuth();
  const { toast } = useToast();
  const [language, _setLanguage] = useState('Español');
  const [residents, setResidents] = useState<Resident[]>(mockResidents);
  const [assemblies, setAssemblies] = useState<Assembly[]>(mockAssemblies);
  const [selectedAssembly, setSelectedAssembly] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalUnits, setTotalUnits] = useState<number>(50); // Valor simulado
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulamos un breve tiempo de carga de datos
    setLoading(true);
    setTimeout(() => {
      setAssemblies(mockAssemblies);
      setLoading(false);
    }, 500);
  }, []);

  const fetchResidents = async (assemblyId: number) => {
    setLoading(true);
    // Simulando la obtención de datos de la API
    setTimeout(() => {
      setResidents(mockResidents);
      setLoading(false);
    }, 500);
  };

  const sendEmailInvitations = async () => {
    if (!selectedAssembly) return;
    setIsSubmitting(true);
    try {
      // Simulando envío de correos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Invitaciones enviadas con éxito.');
      toast({
        title: "Envío exitoso",
        description: "Invitaciones enviadas a todos los propietarios",
      });
    } catch (err) {
      setError('Error al enviar invitaciones');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttendanceChange = (index: number, value: 'Sí' | 'No' | 'Delegado') => {
    const newResidents = [...residents];
    newResidents[index].attendance = value;
    if (value !== 'Delegado') newResidents[index].delegateName = null;
    setResidents(newResidents);
  };

  const handleDelegateNameChange = (index: number, value: string) => {
    const newResidents = [...residents];
    newResidents[index].delegateName = value;
    setResidents(newResidents);
  };

  const calculateQuorum = () => {
    const confirmedResidents = residents.filter(r => r.attendance === 'Sí' || r.attendance === 'Delegado').length;
    const quorumPercentage = totalUnits > 0 ? (confirmedResidents / totalUnits) * 100 : 0;
    return { count: confirmedResidents, percentage: quorumPercentage, achieved: quorumPercentage > 50 };
  };

  const handleSaveAttendance = async () => {
    if (!selectedAssembly) {
      setError('Por favor, selecciona una asamblea.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Marcar como confirmados los residentes que asisten
      const updatedResidents = residents.map(r => ({
        ...r,
        confirmed: r.attendance === 'Sí' || r.attendance === 'Delegado'
      }));
      
      setResidents(updatedResidents);
      setSuccess('Asistencia guardada con éxito.');
      toast({
        title: "Guardado exitoso",
        description: "La asistencia ha sido registrada correctamente",
      });
    } catch (err) {
      setError('Error al guardar asistencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartAssembly = async () => {
    if (!selectedAssembly || !calculateQuorum().achieved) return;
    
    setIsSubmitting(true);
    try {
      // Simulación de inicio de asamblea
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar estado de la asamblea localmente
      setAssemblies(assemblies.map(a => 
        a.id === selectedAssembly ? { ...a, status: 'IN_PROGRESS' } : a
      ));
      
      setSuccess('Asamblea iniciada.');
      toast({
        title: "Asamblea iniciada",
        description: "La asamblea ha sido iniciada correctamente",
      });
    } catch (err) {
      setError('Error al iniciar asamblea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAssembly) return;
    setIsSubmitting(true);
    try {
      const assembly = assemblies.find(a => a.id === selectedAssembly);
      const newDate = prompt(language === 'Español' ? 'Ingresa nueva fecha y hora (YYYY-MM-DDTHH:MM):' : 'Enter new date and time (YYYY-MM-DDTHH:MM):');
      if (!newDate) {
        setIsSubmitting(false);
        return;
      }

      // Simulación de reprogramación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar fecha de la asamblea localmente
      setAssemblies(assemblies.map(a => 
        a.id === selectedAssembly ? { ...a, date: newDate } : a
      ));
      
      setSuccess('Asamblea reprogramada.');
      toast({
        title: "Asamblea reprogramada",
        description: "La asamblea ha sido reprogramada correctamente",
      });
    } catch (err) {
      setError('Error al reprogramar asamblea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quorum = calculateQuorum();

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
            {language === 'Español' ? 'Control de Asistencia' : 'Attendance Control'}
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
                setSelectedAssembly(id || null);
                if (id) fetchResidents(id);
                else setResidents([]);
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

          {selectedAssembly && (
            <div className="space-y-4">
              <Button onClick={sendEmailInvitations} disabled={isSubmitting}>
                {language === 'Español' ? 'Enviar Invitaciones' : 'Send Invitations'}
              </Button>
              {residents.length === 0 ? (
                <p className="text-gray-500">{language === 'Español' ? 'No hay residentes disponibles.' : 'No residents available.'}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-3">{language === 'Español' ? '# Inmueble' : 'Property #'}</th>
                        <th className="px-6 py-3">{language === 'Español' ? 'Nombre' : 'Name'}</th>
                        <th className="px-6 py-3">{language === 'Español' ? 'DNI' : 'DNI'}</th>
                        <th className="px-6 py-3">{language === 'Español' ? 'Asistencia' : 'Attendance'}</th>
                        <th className="px-6 py-3">{language === 'Español' ? 'Delegado' : 'Delegate'}</th>
                        <th className="px-6 py-3">{language === 'Español' ? 'Confirmado' : 'Confirmed'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {residents.map((resident, index) => (
                        <tr key={resident.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4">{resident.number}</td>
                          <td className="px-6 py-4">{resident.name}</td>
                          <td className="px-6 py-4">{resident.dni}</td>
                          <td className="px-6 py-4">
                            <select
                              value={resident.attendance}
                              onChange={(e) => handleAttendanceChange(index, e.target.value as 'Sí' | 'No' | 'Delegado')}
                              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            >
                              <option value="No">{language === 'Español' ? 'No' : 'No'}</option>
                              <option value="Sí">{language === 'Español' ? 'Sí' : 'Yes'}</option>
                              <option value="Delegado">{language === 'Español' ? 'Delegado' : 'Delegate'}</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              value={resident.delegateName || ''}
                              onChange={(e) => handleDelegateNameChange(index, e.target.value)}
                              placeholder={language === 'Español' ? 'Nombre del delegado' : 'Delegate Name'}
                              disabled={resident.attendance !== 'Delegado'}
                              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                            />
                          </td>
                          <td className="px-6 py-4">{resident.confirmed ? <Check className="text-green-500" /> : <X className="text-red-500" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4">
                <p className="text-gray-700 dark:text-white">
                  {language === 'Español' ? 'Quorum: ' : 'Quorum: '}
                  {`${quorum.count} de ${totalUnits} (${quorum.percentage.toFixed(2)}%) - ${quorum.achieved ? 'Sí hay quorum' : 'No hay quorum'}`}
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button onClick={handleSaveAttendance} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {language === 'Español' ? 'Guardar' : 'Save'}
                  </Button>
                  {quorum.achieved && (
                    <Button onClick={handleStartAssembly} disabled={isSubmitting} className="bg-green-500 hover:bg-green-600">
                      {language === 'Español' ? 'Iniciar Asamblea' : 'Start Assembly'}
                    </Button>
                  )}
                  {!quorum.achieved && (
                    <Button onClick={handleReschedule} disabled={isSubmitting} className="bg-yellow-500 hover:bg-yellow-600">
                      {language === 'Español' ? 'Reprogramar' : 'Reschedule'}
                    </Button>
                  )}
                </div>
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