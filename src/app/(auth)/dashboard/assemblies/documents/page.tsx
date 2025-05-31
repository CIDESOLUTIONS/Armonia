"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

interface Assembly {
  id: number;
  title: string;
  date: string;
  agenda: { numeral: string; topic: string; time: string; completed: boolean; notes: string }[];
  status: string;
}

interface Document {
  id: number;
  fileName: string;
  createdAt: string;
}

// Datos simulados para pruebas
const mockAssemblies: Assembly[] = [
  {
    id: 1,
    title: "Asamblea General Ordinaria 2023",
    date: "2023-05-15T18:00:00",
    agenda: [],
    status: "COMPLETED"
  },
  {
    id: 2,
    title: "Asamblea Extraordinaria - Renovación de Fachada",
    date: "2023-10-20T19:00:00",
    agenda: [],
    status: "COMPLETED"
  },
  {
    id: 3,
    title: "Asamblea General Ordinaria 2024",
    date: "2024-05-15T18:00:00",
    agenda: [],
    status: "PENDING"
  }
];

const mockDocuments: Document[] = [
  {
    id: 1,
    fileName: "Acta_Asamblea_General_2023.pdf",
    createdAt: "2023-05-17T10:30:00"
  },
  {
    id: 2,
    fileName: "Acta_Asamblea_Extraordinaria_Fachada.pdf",
    createdAt: "2023-10-22T14:45:00"
  }
];

export default function DocumentsPage() {
  const _router = useRouter();
  const { user, isLoggedIn, _token  } = useAuth();
  const [assemblies, setAssemblies] = useState<Assembly[]>(mockAssemblies);
  const [selectedAssembly, setSelectedAssembly] = useState<number | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, _setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulación de carga de datos
    setLoading(true);
    setTimeout(() => {
      setAssemblies(mockAssemblies);
      setLoading(false);
    }, 500);
  }, []);

  const fetchDocuments = async (assemblyId: number) => {
    setLoading(true);
    
    // Simulación de API
    setTimeout(() => {
      // Filtrar documentos para la asamblea seleccionada
      const filteredDocs = mockDocuments.filter(doc => {
        const assembly = mockAssemblies.find(a => a.id === assemblyId);
        if (!assembly) return false;
        
        // Verificar si el nombre del documento contiene el título de la asamblea
        return doc.fileName.includes(assembly.title.split(' ')[0]) || 
               doc.fileName.includes(assembly.title.split(' ')[1]) ||
               doc.fileName.includes(assembly.title.split(' ')[2]);
      });
      
      setDocuments(filteredDocs);
      setLoading(false);
    }, 500);
  };

  const handleCreateDocument = async () => {
    if (!selectedAssembly) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulación de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Crear un nuevo documento simulado
      const assembly = assemblies.find(a => a.id === selectedAssembly);
      if (!assembly) throw new Error('Asamblea no encontrada');
      
      const newDoc: Document = {
        id: documents.length > 0 ? Math.max(...documents.map(d => d.id)) + 1 : 1,
        fileName: `Acta_${assembly.title.replace(/\s+/g, '_')}.pdf`,
        createdAt: new Date().toISOString()
      };
      
      setDocuments([...documents, newDoc]);
      setSuccess('Acta generada con éxito.');
    } catch (err) {
      setError('Error al generar el acta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDocument = async (documentId: number) => {
    setIsSubmitting(true);
    
    try {
      // Simulación de descarga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En una implementación real, aquí se realizaría la descarga del archivo
      alert('Descarga iniciada (simulación)');
      
      setSuccess('Descarga iniciada.');
    } catch (err) {
      setError('Error al descargar el documento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 rounded-full border-t-transparent"></div>
        <span className="ml-3 text-lg">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Actas y Documentos
          </h1>
        </header>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Seleccionar Asamblea
            </label>
            <select
              value={selectedAssembly || ''}
              onChange={(e) => {
                const id = parseInt(e.target.value) || null;
                setSelectedAssembly(id);
                if (id) fetchDocuments(id);
                else setDocuments([]);
              }}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Seleccione una asamblea</option>
              {assemblies.map(assembly => (
                <option key={assembly.id} value={assembly.id}>
                  {assembly.title} ({new Date(assembly.date).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {selectedAssembly && (
            <div className="space-y-4">
              <Button onClick={handleCreateDocument} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Generar Acta
              </Button>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th className="px-6 py-3">Nombre del Archivo</th>
                      <th className="px-6 py-3">Creado</th>
                      <th className="px-6 py-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center">No se encontraron documentos</td>
                      </tr>
                    ) : (
                      documents.map(doc => (
                        <tr key={doc.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4">{doc.fileName}</td>
                          <td className="px-6 py-4">{new Date(doc.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <Button 
                              onClick={() => handleDownloadDocument(doc.id)} 
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={isSubmitting}
                            >
                              Descargar
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}