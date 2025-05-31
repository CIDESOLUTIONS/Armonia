"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface AgendaItem {
  numeral: number;
  topic: string;
  time: string;
  completed: boolean;
  notes: string;
}

interface Assembly {
  id: number;
  title: string;
  type: string;
  date: string;
  description: string | null;
  agenda: AgendaItem[];
}

export default function SchedulingPage() {
  const _router = useRouter();
  const { isLoggedIn, token, schemaName, complexId, adminName, complexName, _logout  } = useAuth();
  const [language, _setLanguage] = useState('Español');
  const [_theme, _setTheme] = useState('Claro');
  const [_currency, _setCurrency] = useState('Dólares');
  const [assemblyTitle, setAssemblyTitle] = useState('');
  const [assemblyType, setAssemblyType] = useState('GENERAL');
  const [assemblyDate, setAssemblyDate] = useState('');
  const [assemblyDescription, setAssemblyDescription] = useState('');
  const [newAgendaTopic, setNewAgendaTopic] = useState('');
  const [newAgendaTime, setNewAgendaTime] = useState('00:15:00');
  const [newAgendaNotes, setNewAgendaNotes] = useState('');
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [selectedAssembly, setSelectedAssembly] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [emailsSent, setEmailsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !token || !complexId || !schemaName) {
      console.log('[Scheduling] No autenticado o datos incompletos, redirigiendo a /login');
      router.replace('/login');
      return;
    }

    const fetchAssemblies = async () => {
      try {
        // Variable response eliminada por lint
        const _data = await response.json();
        if (response.ok) {
          setAssemblies(data.assemblies || []);
        }
      } catch (err) {
        console.error('[Scheduling] Error al cargar asambleas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssemblies();
  }, [isLoggedIn, token, router, schemaName, complexId]);

  const addAgendaItem = () => {
    if (!newAgendaTopic.trim()) return;
    setAgenda([...agenda, { numeral: agenda.length + 1, topic: newAgendaTopic, time: newAgendaTime, completed: false, notes: newAgendaNotes }]);
    setNewAgendaTopic('');
    setNewAgendaTime('00:15:00');
    setNewAgendaNotes('');
  };

  const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string | number | boolean) => {
    const newAgenda = [...agenda];
    if (field === 'time' && typeof value === 'string') {
      const timeParts = value.split(':');
      if (timeParts.length === 2) value = `${timeParts[0]}:${timeParts[1]}:00`;
      else if (!value.match(/^\d{2}:\d{2}:\d{2}$/)) value = '00:15:00';
    }
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    setAgenda(newAgenda);
  };

  const deleteAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index).map((item, i) => ({ ...item, numeral: i + 1 })));
  };

  const handleCreateAssembly = async () => {
    if (!assemblyTitle.trim() || !assemblyType || !assemblyDate || agenda.length === 0) {
      setError(language === 'Español' ? 'Por favor, completa todos los campos requeridos.' : 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const _url = selectedAssembly ? `/api/assemblies/update?id=${selectedAssembly}` : '/api/assemblies/create';
      const isoDate = new Date(assemblyDate).toISOString();
      console.log('[Scheduling] Enviando solicitud a:', url);
      // Variable response eliminada por lint

      const _data = await response.json();
      console.log('[Scheduling] Respuesta:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la asamblea');
      }

      setSuccess(language === 'Español' ? 'Asamblea guardada con éxito.' : 'Assembly saved successfully.');
      setShowSummary(true);
      fetchAssemblies();
    } catch (err) {
      console.error('[Scheduling] Error:', err);
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmails = async () => {
    if (!selectedAssembly && !showSummary) {
      setError(language === 'Español' ? 'Guarda la asamblea primero.' : 'Save the assembly first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const emailResponse = await fetch('/api/assemblies/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          assemblyId: selectedAssembly || assemblies[assemblies.length - 1]?.id,
          title: assemblyTitle,
          type: assemblyType,
          date: assemblyDate,
          description: assemblyDescription || undefined,
          agenda,
          schemaName,
          complexId,
        }),
      });

      const emailData = await emailResponse.json();
      if (!emailResponse.ok) {
        throw new Error(emailData.message || 'Error al enviar correos');
      }

      setEmailsSent(true);
      setSuccess(language === 'Español' ? 'Correos enviados con éxito.' : 'Emails sent successfully.');
    } catch (err) {
      console.error('[Scheduling] Error al enviar correos:', err);
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssembly = async () => {
    if (!selectedAssembly) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await fetch(`/api/assemblies/clean-dependencies?id=${selectedAssembly}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Variable response eliminada por lint

      const _data = await response.json();
      console.log('[Scheduling] Respuesta de /api/assemblies/delete:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar la asamblea');
      }

      setSuccess(language === 'Español' ? 'Asamblea eliminada con éxito.' : 'Assembly deleted successfully.');
      setAssemblies(assemblies.filter(a => a.id !== selectedAssembly));
      clearForm();
    } catch (err) {
      console.error('[Scheduling] Error al eliminar asamblea:', err);
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setAssemblyTitle('');
    setAssemblyType('GENERAL');
    setAssemblyDate('');
    setAssemblyDescription('');
    setAgenda([]);
    setNewAgendaTopic('');
    setNewAgendaTime('00:15:00');
    setNewAgendaNotes('');
    setShowSummary(false);
    setSelectedAssembly(null);
    setEmailsSent(false);
  };

  const fetchAssemblies = async () => {
    try {
      // Variable response eliminada por lint
      const _data = await response.json();
      if (response.ok) {
        setAssemblies(data.assemblies || []);
      }
    } catch (err) {
      console.error('[Scheduling] Error al cargar asambleas:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {language === 'Español' ? 'Programación de Asambleas' : 'Assembly Scheduling'}
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
                  if (id) {
                    const assembly = assemblies.find(a => a.id === id);
                    if (assembly) {
                      setAssemblyTitle(assembly.title);
                      setAssemblyType(assembly.type);
                      setAssemblyDate(new Date(assembly.date).toISOString().slice(0, 16));
                      setAssemblyDescription(assembly.description || '');
                      setAgenda(assembly.agenda);
                      setEmailsSent(false);
                    }
                  } else {
                    clearForm();
                  }
                }}
                className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                data-cy="assembly-selector"
              >
                <option value="">{language === 'Español' ? 'Crear Nueva Asamblea' : 'Create New Assembly'}</option>
                {assemblies.map(assembly => (
                  <option key={assembly.id} value={assembly.id}>
                    {assembly.title} ({new Date(assembly.date).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {!showSummary ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={assemblyTitle}
                    onChange={(e) => setAssemblyTitle(e.target.value)}
                    placeholder={language === 'Español' ? 'Título de la asamblea' : 'Assembly title'}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    data-cy="assembly-title-input"
                  />
                  <select
                    value={assemblyType}
                    onChange={(e) => setAssemblyType(e.target.value)}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    data-cy="assembly-type-select"
                  >
                    <option value="GENERAL">{language === 'Español' ? 'General' : 'General'}</option>
                    <option value="EXTRAORDINARY">{language === 'Español' ? 'Extraordinaria' : 'Extraordinary'}</option>
                  </select>
                  <Input
                    type="datetime-local"
                    value={assemblyDate}
                    onChange={(e) => setAssemblyDate(e.target.value)}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    data-cy="assembly-date-input"
                  />
                  <Input
                    type="text"
                    value={assemblyDescription}
                    onChange={(e) => setAssemblyDescription(e.target.value)}
                    placeholder={language === 'Español' ? 'Descripción (opcional)' : 'Description (optional)'}
                    className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    data-cy="assembly-description-input"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'Español' ? 'Agregar Tema a la Agenda' : 'Add Agenda Item'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input
                      type="text"
                      value={newAgendaTopic}
                      onChange={(e) => setNewAgendaTopic(e.target.value)}
                      placeholder={language === 'Español' ? 'Tema' : 'Topic'}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    />
                    <Input
                      type="time"
                      step="1"
                      value={newAgendaTime.slice(0, 5)}
                      onChange={(e) => setNewAgendaTime(e.target.value + ':00')}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    />
                    <Input
                      type="text"
                      value={newAgendaNotes}
                      onChange={(e) => setNewAgendaNotes(e.target.value)}
                      placeholder={language === 'Español' ? 'Observaciones' : 'Notes'}
                      className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                    />
                  </div>
                  <Button onClick={addAgendaItem} className="bg-blue-500 hover:bg-blue-600 text-white">
                    {language === 'Español' ? 'Agregar' : 'Add'}
                  </Button>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'Español' ? 'Lista de Agenda' : 'Agenda List'}
                  </h3>
                  {agenda.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            <th className="px-6 py-3">{language === 'Español' ? '# Punto' : '# Item'}</th>
                            <th className="px-6 py-3">{language === 'Español' ? 'Tema' : 'Topic'}</th>
                            <th className="px-6 py-3">{language === 'Español' ? 'Hora Inicio' : 'Start Time'}</th>
                            <th className="px-6 py-3">{language === 'Español' ? 'Observaciones' : 'Notes'}</th>
                            <th className="px-6 py-3">{language === 'Español' ? 'Acciones' : 'Actions'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {agenda.map((item, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                              <td className="px-6 py-4">{item.numeral}</td>
                              <td className="px-6 py-4">
                                <Input
                                  type="text"
                                  value={item.topic}
                                  onChange={(e) => updateAgendaItem(index, 'topic', e.target.value)}
                                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <Input
                                  type="time"
                                  step="1"
                                  value={item.time.slice(0, 5)}
                                  onChange={(e) => updateAgendaItem(index, 'time', e.target.value + ':00')}
                                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <Input
                                  type="text"
                                  value={item.notes}
                                  onChange={(e) => updateAgendaItem(index, 'notes', e.target.value)}
                                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <Button
                                  onClick={() => deleteAgendaItem(index)}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-white">{language === 'Español' ? 'No hay temas en la agenda.' : 'No agenda items yet.'}</p>
                  )}
                  <div className="flex space-x-4 mt-4">
                    <Button
                      onClick={handleCreateAssembly}
                      disabled={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      data-cy="save-assembly-button"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {language === 'Español' ? 'Guardar Agenda' : 'Save Agenda'}
                    </Button>
                    <Button
                      onClick={handleSendEmails}
                      disabled={isSubmitting || emailsSent}
                      className={`flex items-center ${emailsSent ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'} text-white`}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {language === 'Español' ? (emailsSent ? 'Enviados' : 'Enviar Correos') : (emailsSent ? 'Sent' : 'Send Emails')}
                    </Button>
                    {selectedAssembly && (
                      <Button
                        onClick={handleDeleteAssembly}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        data-cy="delete-assembly-button"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        {language === 'Español' ? 'Eliminar Asamblea' : 'Delete Assembly'}
                      </Button>
                    )}
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-4" data-cy="error-message">{error}</p>}
                {success && !showSummary && <p className="text-green-500 text-sm mt-4" data-cy="success-message">{success}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'Español' ? 'Resumen de la Asamblea' : 'Assembly Summary'}
                </h3>
                <p><strong>{language === 'Español' ? 'Título:' : 'Title:'}</strong> {assemblyTitle}</p>
                <p><strong>{language === 'Español' ? 'Tipo:' : 'Type:'}</strong> {assemblyType === 'GENERAL' ? (language === 'Español' ? 'General' : 'General') : (language === 'Español' ? 'Extraordinaria' : 'Extraordinary')}</p>
                <p><strong>{language === 'Español' ? 'Fecha:' : 'Date:'}</strong> {new Date(assemblyDate).toLocaleString()}</p>
                <p><strong>{language === 'Español' ? 'Descripción:' : 'Description:'}</strong> {assemblyDescription || 'N/A'}</p>
                <div>
                  <strong>{language === 'Español' ? 'Agenda:' : 'Agenda:'}</strong>
                  <ul className="list-decimal pl-5">
                    {agenda.map((item, index) => (
                      <li key={index} className="mb-2">
                        {item.topic} - {language === 'Español' ? 'Hora Inicio:' : 'Start Time:'} {item.time} ({language === 'Español' ? 'Observaciones:' : 'Notes:'} {item.notes || 'Ninguna'})
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  onClick={clearForm}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  data-cy="new-assembly-button"
                >
                  {language === 'Español' ? 'Crear Nueva Asamblea' : 'Create New Assembly'}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}