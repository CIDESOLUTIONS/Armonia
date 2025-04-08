"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusIcon, Trash2Icon, PencilIcon, UserIcon, Search, UsersIcon, PhoneIcon, MailIcon, HomeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Loading } from '@/components/Loading';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';

// Types
interface Property {id: string, unitCode: string, unitType: string, area: number, address: string, floor: string | null, tower: string | null, ownerId: string, ownerName: string, ownerEmail: string, ownerPhone: string}
interface Resident {id: string, propertyId: string, propertyUnitCode: string, name: string, documentType: 'ID' | 'PASSPORT' | 'OTHER', documentNumber: string, email: string, phone: string, birthDate: Date | null, isOwner: boolean, relationship: 'OWNER' | 'FAMILY' | 'TENANT' | 'OTHER', status: 'ACTIVE' | 'INACTIVE', createdAt: Date}

// Mock data
const mockData = {
  properties: [
    {id:'1',unitCode:'A-101',unitType:'APARTMENT',area:85,address:'Torre A, Apto 101',floor:'1',tower:'A',ownerId:'o1',ownerName:'Juan Pérez',ownerEmail:'juan@example.com',ownerPhone:'3001234567'},
    {id:'2',unitCode:'A-102',unitType:'APARTMENT',area:90,address:'Torre A, Apto 102',floor:'1',tower:'A',ownerId:'o2',ownerName:'María Rodríguez',ownerEmail:'maria@example.com',ownerPhone:'3009876543'},
    {id:'3',unitCode:'B-201',unitType:'APARTMENT',area:95,address:'Torre B, Apto 201',floor:'2',tower:'B',ownerId:'o3',ownerName:'Carlos Gómez',ownerEmail:'carlos@example.com',ownerPhone:'3005551234'},
    {id:'4',unitCode:'C-301',unitType:'PENTHOUSE',area:120,address:'Torre C, PH 301',floor:'3',tower:'C',ownerId:'o4',ownerName:'Laura Martínez',ownerEmail:'laura@example.com',ownerPhone:'3007778899'}
  ],
  residents: [
    {id:'1',propertyId:'1',propertyUnitCode:'A-101',name:'Juan Pérez',documentType:'ID',documentNumber:'123456789',email:'juan@example.com',phone:'3001234567',birthDate:new Date(1980,5,15),isOwner:true,relationship:'OWNER',status:'ACTIVE',createdAt:new Date(2023,0,10)},
    {id:'2',propertyId:'1',propertyUnitCode:'A-101',name:'Ana Pérez',documentType:'ID',documentNumber:'987654321',email:'ana@example.com',phone:'3001234568',birthDate:new Date(1982,8,20),isOwner:false,relationship:'FAMILY',status:'ACTIVE',createdAt:new Date(2023,0,10)},
    {id:'3',propertyId:'1',propertyUnitCode:'A-101',name:'Luis Pérez',documentType:'ID',documentNumber:'456789123',email:'luis@example.com',phone:'3001234569',birthDate:new Date(2005,3,10),isOwner:false,relationship:'FAMILY',status:'ACTIVE',createdAt:new Date(2023,0,10)},
    {id:'4',propertyId:'2',propertyUnitCode:'A-102',name:'María Rodríguez',documentType:'ID',documentNumber:'789456123',email:'maria@example.com',phone:'3009876543',birthDate:new Date(1975,10,5),isOwner:true,relationship:'OWNER',status:'ACTIVE',createdAt:new Date(2023,1,15)},
    {id:'5',propertyId:'3',propertyUnitCode:'B-201',name:'Carlos Gómez',documentType:'ID',documentNumber:'321654987',email:'carlos@example.com',phone:'3005551234',birthDate:new Date(1978,7,25),isOwner:true,relationship:'OWNER',status:'ACTIVE',createdAt:new Date(2023,2,20)},
    {id:'6',propertyId:'3',propertyUnitCode:'B-201',name:'Sofía Gómez',documentType:'ID',documentNumber:'654987321',email:'sofia@example.com',phone:'3005551235',birthDate:new Date(1980,4,15),isOwner:false,relationship:'FAMILY',status:'ACTIVE',createdAt:new Date(2023,2,20)}
  ]
};

// Default form state
const defaultFormState = {
  propertyId: '',
  name: '',
  documentType: 'ID' as 'ID' | 'PASSPORT' | 'OTHER',
  documentNumber: '',
  email: '',
  phone: '',
  birthDate: null as Date | null,
  isOwner: false,
  relationship: 'FAMILY' as 'OWNER' | 'FAMILY' | 'TENANT' | 'OTHER',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
};

export default function ResidentsRegistryPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { token, complexId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingResidentId, setEditingResidentId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(defaultFormState);

  // Translations
  const t = {
    title: language === 'Español' ? 'Registro de Residentes' : 'Residents Registry',
    description: language === 'Español' ? 'Administre los residentes de cada propiedad' : 'Manage residents of each property',
    search: language === 'Español' ? 'Buscar residente...' : 'Search resident...',
    allProperties: language === 'Español' ? 'Todas las propiedades' : 'All properties',
    addResident: language === 'Español' ? 'Agregar Residente' : 'Add Resident',
    editResident: language === 'Español' ? 'Editar Residente' : 'Edit Resident',
    formInfo: language === 'Español' ? 'Complete la información del residente' : 'Fill in the resident information',
    property: language === 'Español' ? 'Propiedad' : 'Property',
    selectProperty: language === 'Español' ? 'Seleccionar propiedad' : 'Select property',
    fullName: language === 'Español' ? 'Nombre completo' : 'Full name',
    birthDate: language === 'Español' ? 'Fecha de nacimiento' : 'Birth date',
    selectDate: language === 'Español' ? 'Seleccionar fecha' : 'Select date',
    documentType: language === 'Español' ? 'Tipo de documento' : 'Document type',
    selectType: language === 'Español' ? 'Seleccionar tipo' : 'Select type',
    idCard: language === 'Español' ? 'Cédula' : 'ID',
    passport: language === 'Español' ? 'Pasaporte' : 'Passport',
    other: language === 'Español' ? 'Otro' : 'Other',
    documentNumber: language === 'Español' ? 'Número de documento' : 'Document number',
    email: language === 'Español' ? 'Correo electrónico' : 'Email',
    phone: language === 'Español' ? 'Teléfono' : 'Phone',
    isOwner: language === 'Español' ? 'Es propietario' : 'Is owner',
    relationship: language === 'Español' ? 'Relación' : 'Relationship',
    status: language === 'Español' ? 'Estado' : 'Status',
    active: language === 'Español' ? 'Activo' : 'Active',
    inactive: language === 'Español' ? 'Inactivo' : 'Inactive',
    cancel: language === 'Español' ? 'Cancelar' : 'Cancel',
    save: language === 'Español' ? 'Guardar' : 'Save',
    update: language === 'Español' ? 'Actualizar' : 'Update',
    owner: language === 'Español' ? 'Propietario' : 'Owner',
    family: language === 'Español' ? 'Familiar' : 'Family',
    tenant: language === 'Español' ? 'Arrendatario' : 'Tenant',
    noResidents: language === 'Español' ? 'No hay residentes' : 'No residents',
    startAdd: language === 'Español' ? 'Comience agregando un residente' : 'Start by adding a resident',
    deleteConfirm: language === 'Español' ? '¿Eliminar este residente?' : 'Delete this resident?',
    success: language === 'Español' ? 'Éxito' : 'Success',
    error: language === 'Español' ? 'Error' : 'Error',
    createSuccess: language === 'Español' ? 'Residente creado' : 'Resident created',
    updateSuccess: language === 'Español' ? 'Residente actualizado' : 'Resident updated',
    deleteSuccess: language === 'Español' ? 'Residente eliminado' : 'Resident deleted',
    createError: language === 'Español' ? 'Error al crear' : 'Error creating',
    updateError: language === 'Español' ? 'Error al actualizar' : 'Error updating',
    deleteError: language === 'Español' ? 'Error al eliminar' : 'Error deleting',
    requiredFields: language === 'Español' ? 'Complete campos obligatorios' : 'Fill required fields',
  };

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setProperties(mockData.properties);
        setResidents(mockData.residents);
        if (mockData.properties.length > 0) setSelectedPropertyId(mockData.properties[0].id);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({ title: t.error, description: 'Error loading data', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [toast]);

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData({ ...formData, birthDate: date || null });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      isOwner: checked,
      relationship: checked ? 'OWNER' : 'FAMILY',
    });
  };

  // Actions
  const handleAddResident = () => {
    setFormData({ ...defaultFormState, propertyId: selectedPropertyId || '' });
    setIsEditMode(false);
    setEditingResidentId(null);
    setIsDialogOpen(true);
  };

  const handleEditResident = (resident: Resident) => {
    setFormData({ ...resident });
    setIsEditMode(true);
    setEditingResidentId(resident.id);
    setIsDialogOpen(true);
  };

  const handleDeleteResident = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      setIsLoading(true);
      setResidents(residents.filter(resident => resident.id !== id));
      toast({ title: t.success, description: t.deleteSuccess });
    } catch (error) {
      console.error('Error deleting resident:', error);
      toast({ title: t.error, description: t.deleteError, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (!formData.name || !formData.documentNumber || !formData.propertyId) {
        toast({ title: t.error, description: t.requiredFields, variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      
      const property = properties.find(p => p.id === formData.propertyId);
      if (!property) throw new Error('Property not found');
      
      if (isEditMode && editingResidentId) {
        setResidents(residents.map(resident => 
          resident.id === editingResidentId ? {
            ...resident, ...formData, propertyUnitCode: property.unitCode,
          } : resident
        ));
        toast({ title: t.success, description: t.updateSuccess });
      } else {
        const newResident: Resident = {
          id: (residents.length + 1).toString(),
          propertyId: formData.propertyId,
          propertyUnitCode: property.unitCode,
          name: formData.name,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          email: formData.email,
          phone: formData.phone,
          birthDate: formData.birthDate,
          isOwner: formData.isOwner,
          relationship: formData.relationship,
          status: formData.status,
          createdAt: new Date(),
        };
        setResidents([...residents, newResident]);
        toast({ title: t.success, description: t.createSuccess });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving resident:', error);
      toast({ 
        title: t.error, 
        description: isEditMode ? t.updateError : t.createError, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter residents
  const filteredResidents = residents.filter(resident => {
    const matchesProperty = !selectedPropertyId || resident.propertyId === selectedPropertyId;
    const matchesSearch = searchTerm === '' || 
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.documentNumber.includes(searchTerm) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProperty && matchesSearch;
  });

  // Helper functions
  const getRelationshipText = (relationship: string) => {
    const texts: {[key: string]: string} = {
      'OWNER': t.owner, 'FAMILY': t.family, 
      'TENANT': t.tenant, 'OTHER': t.other
    };
    return texts[relationship] || relationship;
  };

  const getDocumentTypeText = (documentType: string) => {
    const texts: {[key: string]: string} = {
      'ID': t.idCard, 'PASSPORT': t.passport, 'OTHER': t.other
    };
    return texts[documentType] || documentType;
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader title={t.title} description={t.description} />

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center w-full sm:w-72">
          <Search className="h-4 w-4 absolute ml-3 text-gray-400" />
          <Input placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <HomeIcon className="h-4 w-4 text-gray-500" />
            <Select value={selectedPropertyId || 'all'} onValueChange={(value) => setSelectedPropertyId(value === 'all' ? null : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t.allProperties || 'All properties'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allProperties || 'All properties'}</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.unitCode} - {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleAddResident}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {t.addResident}
          </Button>
        </div>
      </div>

      {/* Residents table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedPropertyId 
              ? `${language === 'Español' ? 'Residentes de' : 'Residents of'} ${properties.find(p => p.id === selectedPropertyId)?.unitCode || ''}`
              : language === 'Español' ? 'Todos los Residentes' : 'All Residents'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : filteredResidents.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">{t.noResidents}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.startAdd}</p>
              <div className="mt-6">
                <Button onClick={handleAddResident}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  {t.addResident}
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'Español' ? 'Nombre' : 'Name'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Documento' : 'Document'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Propiedad' : 'Property'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Relación' : 'Relationship'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Contacto' : 'Contact'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{resident.name}</span>
                        {resident.isOwner && (
                          <Badge className="ml-2 bg-indigo-100 text-indigo-800">{t.owner}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{getDocumentTypeText(resident.documentType)}</div>
                        <div className="text-gray-500">{resident.documentNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{resident.propertyUnitCode}</TableCell>
                    <TableCell>{getRelationshipText(resident.relationship)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1 text-sm">
                        <div className="flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{resident.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <MailIcon className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{resident.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditResident(resident)} title={language === 'Español' ? 'Editar' : 'Edit'}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDeleteResident(resident.id)} title={language === 'Español' ? 'Eliminar' : 'Delete'}>
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing resident */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? t.editResident : t.addResident}</DialogTitle>
            <DialogDescription>{t.formInfo}</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="propertyId">{t.property}</Label>
                <Select value={formData.propertyId} onValueChange={(v) => handleSelectChange('propertyId', v)}>
                  <SelectTrigger><SelectValue placeholder={t.selectProperty || 'Select property'} /></SelectTrigger>
                  <SelectContent>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.unitCode} - {p.address}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="name">{t.fullName}</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="birthDate">{t.birthDate}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.birthDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.birthDate ? format(formData.birthDate, "dd/MM/yyyy") : <span>{t.selectDate}</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={formData.birthDate || undefined} onSelect={handleDateChange} initialFocus disabled={(date) => date > new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="documentType">{t.documentType}</Label>
                  <Select value={formData.documentType} onValueChange={(v) => handleSelectChange('documentType', v)}>
                    <SelectTrigger><SelectValue placeholder={t.selectType || 'Select'} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ID">{t.idCard}</SelectItem>
                      <SelectItem value="PASSPORT">{t.passport}</SelectItem>
                      <SelectItem value="OTHER">{t.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="documentNumber">{t.documentNumber}</Label>
                  <Input id="documentNumber" name="documentNumber" value={formData.documentNumber} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="phone">{t.phone}</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="isOwner" checked={formData.isOwner} onCheckedChange={handleCheckboxChange} />
                  <Label htmlFor="isOwner">{t.isOwner}</Label>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="relationship">{t.relationship}</Label>
                  <Select value={formData.relationship} onValueChange={(v) => handleSelectChange('relationship', v)} disabled={formData.isOwner}>
                    <SelectTrigger><SelectValue placeholder={t.selectType || 'Select type'} /></SelectTrigger>
                    <SelectContent>
                      {formData.isOwner ? (
                        <SelectItem value="OWNER">{t.owner}</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="FAMILY">{t.family}</SelectItem>
                          <SelectItem value="TENANT">{t.tenant}</SelectItem>
                          <SelectItem value="OTHER">{t.other}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="status">{t.status}</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                  <SelectTrigger><SelectValue placeholder={t.selectType || 'Select status'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{t.active}</SelectItem>
                    <SelectItem value="INACTIVE">{t.inactive}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>{t.cancel}</Button>
              <Button type="submit">{isEditMode ? t.update : t.save}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
