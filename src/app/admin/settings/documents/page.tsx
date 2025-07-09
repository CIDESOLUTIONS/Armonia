'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface Document {
  id: number;
  name: string;
  url: string;
  uploadedAt: string;
}

export default function DocumentsSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([
    // Mock data
    { id: 1, name: 'Certificado de Existencia y Representación Legal', url: '/docs/cert_legal.pdf', uploadedAt: '2024-01-15' },
    { id: 2, name: 'Reglamento de Propiedad Horizontal', url: '/docs/reglamento.pdf', uploadedAt: '2023-11-01' },
  ]);
  const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocumentFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocumentFile || !newDocumentName.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, seleccione un archivo y escriba un nombre para el documento.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Placeholder for API call to upload document
      console.log('Uploading document:', newDocumentName, newDocumentFile.name);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      const newDoc: Document = {
        id: documents.length + 1,
        name: newDocumentName,
        url: '/docs/' + newDocumentFile.name, // Mock URL
        uploadedAt: new Date().toISOString().split('T')[0],
      };
      setDocuments(prev => [...prev, newDoc]);
      setNewDocumentFile(null);
      setNewDocumentName('');
      toast({
        title: 'Éxito',
        description: 'Documento subido correctamente (simulado).',
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Error al subir el documento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      setLoading(true);
      try {
        // Placeholder for API call to delete document
        console.log('Deleting document with ID:', id);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        setDocuments(prev => prev.filter(doc => doc.id !== id));
        toast({
          title: 'Éxito',
          description: 'Documento eliminado correctamente (simulado).',
        });
      } catch (error) {
        console.error('Error deleting document:', error);
        toast({
          title: 'Error',
          description: 'Error al eliminar el documento.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Documentos Legales</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Subir Nuevo Documento</h2>
        <form onSubmit={handleUploadDocument} className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="documentName">Nombre del Documento</Label>
            <Input id="documentName" value={newDocumentName} onChange={(e) => setNewDocumentName(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="documentFile">Archivo</Label>
            <Input id="documentFile" type="file" onChange={handleFileChange} required />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Subir Documento
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Documentos Existentes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha de Subida</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                        <FileText className="mr-2 h-4 w-4" /> {doc.name}
                      </a>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{doc.uploadedAt}</td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                    No hay documentos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
