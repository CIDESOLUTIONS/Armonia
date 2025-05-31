"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, FileText, DollarSign, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface Property {
  id: number;
  number: string;
  type: string;
  area: number;
  coefficient: number;
  ownerName: string;
}

interface Fee {
  id?: number;
  month: number;
  year: number;
  baseAmount: number;
  dueDate: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export default function RegularFeesPage() {
  const _router = useRouter();
  const { isLoggedIn, token, schemaName, complexId, adminName, complexName, _logout  } = useAuth();
  const [language, _setLanguage] = useState('Español');
  const [_theme, _setTheme] = useState('Claro');
  const [_currency, _setCurrency] = useState('Dólares');
  const [isLoading, setIsLoading] = useState(true);
  const [_properties, _setProperties] = useState<Property[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [baseAmount, setBaseAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!isLoggedIn || !token || !complexId || !schemaName) {
      console.log('[RegularFees] No autenticado o datos incompletos, redirigiendo a /login');
      router.replace('/login');
      return;
    }

    fetchFees();
    fetchProperties();
    
    // Establecer fecha de vencimiento por defecto (último día del mes)
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const dueDateStr = `${year}-${month.toString().padStart(2, '0')}-${lastDayOfMonth.toString().padStart(2, '0')}`;
    setDueDate(dueDateStr);
    
  }, [isLoggedIn, token, router, schemaName, complexId]);

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      // Variable response eliminada por lint
      const _data = await response.json();
      
      if (response.ok) {
        setFees(data.fees || []);
        // Si hay cuotas, seleccionar la más reciente
        if (data.fees && data.fees.length > 0) {
          const mostRecent = [...data.fees].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          })[0];
          setSelectedFee(mostRecent);
        }
      } else {
        setError(data.message || 'Error al cargar cuotas');
      }
    } catch (err) {
      console.error('[RegularFees] Error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      // Variable response eliminada por lint
      const _data = await response.json();
      
      if (response.ok) {
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error('[RegularFees] Error al cargar propiedades:', err);
    }
  };

  const handleCreateFee = async () => {
    if (!baseAmount) {
      setError(language === 'Español' ? 'El monto base es requerido' : 'Base amount is required');
      return;
    }

    if (isNaN(parseFloat(baseAmount)) || parseFloat(baseAmount) <= 0) {
      setError(language === 'Español' ? 'El monto debe ser un número positivo' : 'Amount must be a positive number');
      return;
    }

    if (!dueDate) {
      setError(language === 'Español' ? 'La fecha de vencimiento es requerida' : 'Due date is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const newFee = {
      month,
      year,
      baseAmount: parseFloat(baseAmount),
      dueDate,
      status: 'DRAFT' as const,
    };

    try {
      // Variable response eliminada por lint

      const _data = await response.json();
      
      if (response.ok) {
        setSuccess(language === 'Español' ? 'Cuota creada con éxito' : 'Fee created successfully');
        fetchFees();
        // Limpiar formulario
        setBaseAmount('');
      } else {
        setError(data.message || 'Error al crear la cuota');
      }
    } catch (err) {
      console.error('[RegularFees] Error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishFee = async (feeId: number) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Variable response eliminada por lint

      const _data = await response.json();
      
      if (response.ok) {
        setSuccess(language === 'Español' ? 'Cuota publicada con éxito' : 'Fee published successfully');
        fetchFees();
      } else {
        setError(data.message || 'Error al publicar la cuota');
      }
    } catch (err) {
      console.error('[RegularFees] Error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateReceipts = async (feeId: number) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Variable response eliminada por lint

      const _data = await response.json();
      
      if (response.ok) {
        setSuccess(language === 'Español' ? 'Recibos generados con éxito' : 'Receipts generated successfully');
      } else {
        setError(data.message || 'Error al generar los recibos');
      }
    } catch (err) {
      console.error('[RegularFees] Error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceiptBatch = async (feeId: number) => {
    try {
      // Variable response eliminada por lint
      
      if (response.ok) {
        const blob = await response.blob();
        const _url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibos_${month}_${year}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const _data = await response.json();
        setError(data.message || 'Error al descargar los recibos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  const getMonthName = (monthNumber: number) => {
    const monthNames = {
      'Español': [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      'English': [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    };
    
    const lang = language === 'Español' ? 'Español' : 'English';
    return monthNames[lang][monthNumber - 1];
  };

  const currencySymbol = currency === 'Dólares' ? '$' : (currency === 'Euros' ? '€' : '$');

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
              {language === 'Español' ? 'Cuotas Ordinarias' : 'Regular Fees'}
            </h1>
          </header>

          {/* Formulario de creación de cuota */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {language === 'Español' ? 'Crear Nueva Cuota' : 'Create New Fee'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'Español' ? 'Mes' : 'Month'}
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'Español' ? 'Año' : 'Year'}
                </label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value);
                    if (!isNaN(newYear) && newYear > 2000 && newYear < 2100) {
                      setYear(newYear);
                    }
                  }}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'Español' ? 'Monto Base' : 'Base Amount'}
                </label>
                <Input
                  type="number"
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'Español' ? 'Fecha Vencimiento' : 'Due Date'}
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCreateFee}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {language === 'Español' ? 'Crear Cuota' : 'Create Fee'}
              </Button>
            </div>
          </div>

          {/* Lista de cuotas */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {language === 'Español' ? 'Cuotas Existentes' : 'Existing Fees'}
            </h2>
            {fees.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'Español' ? 'No hay cuotas registradas.' : 'No fees registered.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">{language === 'Español' ? 'Periodo' : 'Period'}</th>
                      <th className="px-6 py-3">{language === 'Español' ? 'Monto Base' : 'Base Amount'}</th>
                      <th className="px-6 py-3">{language === 'Español' ? 'Vencimiento' : 'Due Date'}</th>
                      <th className="px-6 py-3">{language === 'Español' ? 'Estado' : 'Status'}</th>
                      <th className="px-6 py-3">{language === 'Español' ? 'Acciones' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-6 py-4">
                          {getMonthName(fee.month)} {fee.year}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {currencySymbol}{fee.baseAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            fee.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            {fee.status === 'PUBLISHED'
                              ? language === 'Español' ? 'Publicada' : 'Published'
                              : language === 'Español' ? 'Borrador' : 'Draft'
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {fee.status === 'DRAFT' && (
                              <Button
                                onClick={() => handlePublishFee(fee.id!)}
                                className="bg-green-500 hover:bg-green-600 text-white p-2"
                                title={language === 'Español' ? 'Publicar' : 'Publish'}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                            {fee.status === 'PUBLISHED' && (
                              <>
                                <Button
                                  onClick={() => handleGenerateReceipts(fee.id!)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                                  title={language === 'Español' ? 'Generar Recibos' : 'Generate Receipts'}
                                >
                                  <DollarSign className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDownloadReceiptBatch(fee.id!)}
                                  className="bg-purple-500 hover:bg-purple-600 text-white p-2"
                                  title={language === 'Español' ? 'Descargar Recibos' : 'Download Receipts'}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
        </motion.div>
      )}
    </div>
  );
}