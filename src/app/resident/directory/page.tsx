'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getResidents } from '@/services/residentService';

interface Resident {
  id: number;
  name: string;
  email: string;
  phone: string;
  unitNumber: string;
}

export default function ResidentDirectoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      fetchResidents();
    }
  }, [authLoading, user]);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      // Fetch all residents, then filter on client-side for simplicity
      // In a large application, filtering would be done on the server
      const data = await getResidents();
      setResidents(data);
    } catch (error) {
      console.error('Error fetching residents for directory:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el directorio de residentes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(resident =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by AuthLayout
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Directorio de Residentes</h1>
      
      <div className="mb-6">
        <Input 
          type="text" 
          placeholder="Buscar residente por nombre, unidad o email..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full md:w-1/2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.length > 0 ? (
          filteredResidents.map(resident => (
            <Card key={resident.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" /> {resident.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600"><strong>Unidad:</strong> {resident.unitNumber}</p>
                <p className="text-sm text-gray-600"><strong>Email:</strong> {resident.email}</p>
                <p className="text-sm text-gray-600"><strong>Teléfono:</strong> {resident.phone || 'N/A'}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No se encontraron residentes.</p>
        )}
      </div>
    </div>
  );
}
