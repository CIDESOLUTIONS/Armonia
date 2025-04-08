"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, UserPlus, Trash2Icon, PencilIcon, 
  UserIcon, MailIcon, CalendarIcon, PhoneIcon, ClockIcon 
} from 'lucide-react';
import { Loading } from '@/components/Loading';
import { format } from 'date-fns';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

// Types and Mock Data
interface ReceptionStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'FULL_DAY';
  createdAt: Date;
  lastActivity: Date | null;
  availableForEmergencies: boolean;
}

// Mock data
const mockReceptionStaff: ReceptionStaff[] = [
  {
    id: '1',
    name: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    phone: '3123456789',
    status: 'ACTIVE',
    shift: 'MORNING',
    createdAt: new Date(2023, 3, 15),
    lastActivity: new Date(2024, 3, 5),
    availableForEmergencies: true
  },
  {
    id: '2',
    name: 'Carlos Jiménez',
    email: 'carlos.jimenez@example.com',
    phone: '3209876543',
    status: 'ACTIVE',
    shift: 'AFTERNOON',
    createdAt: new Date(2023, 5, 20),
    lastActivity: new Date(2024, 3, 6),
    availableForEmergencies: false
  },
  {
    id: '3',
    name: 'Luisa Fernández',
    email: 'luisa.fernandez@example.com',
    phone: '3154567890',
    status: 'INACTIVE',
    shift: 'NIGHT',
    createdAt: new Date(2023, 8, 10),
    lastActivity: new Date(2024, 2, 15),
    availableForEmergencies: true
  },
  {
    id: '4',
    name: 'Roberto Sánchez',
    email: 'roberto.sanchez@example.com',
    phone: '3001234567',
    status: 'ACTIVE',
    shift: 'FULL_DAY',
    createdAt: new Date(2023, 10, 5),
    lastActivity: new Date(2024, 3, 7),
    availableForEmergencies: true
  }
];

export default function ReceptionStaffPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [receptionStaff, setReceptionStaff] = useState<ReceptionStaff[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shift: 'MORNING' as 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'FULL_DAY',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    availableForEmergencies: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Translations
  const t = {
    title: language === 'Español' ? 'Personal de Recepción' : 'Reception Staff',
    description: language === 'Español' ? 'Gestione el personal de recepción del conjunto' : 'Manage reception staff for the complex',
    search: language === 'Español' ? 'Buscar personal...' : 'Search staff...',
    allShifts: language === 'Español' ? 'Todos los turnos' : 'All shifts',
    addStaff: language === 'Español' ? 'Agregar Personal' : 'Add Staff',
    editStaff: language === 'Español' ? 'Editar Personal' : 'Edit Staff',
    formInfo: language === 'Español' ? 'Complete la información del personal' : 'Fill in staff information',
    fullName: language === 'Español' ? 'Nombre completo' : 'Full name',
    email: language === 'Español' ? 'Correo electrónico' : 'Email',
    phone: language === 'Español' ? 'Teléfono' : 'Phone',
    shift: language === 'Español' ? 'Turno' : 'Shift',
    selectShift: language === 'Español' ? 'Seleccionar turno' : 'Select shift',
    morning: language === 'Español' ? 'Mañana' : 'Morning',
    afternoon: language === 'Español' ? 'Tarde' : 'Afternoon',
    night: language === 'Español' ? 'Noche' : 'Night',
    fullDay: language === 'Español' ? 'Día completo' : 'Full day',
    status: language === 'Español' ? 'Estado' : 'Status',
    active: language === 'Español' ? 'Activo' : 'Active',
    inactive: language === 'Español' ? 'Inactivo' : 'Inactive',
    availableEmergencies: language === 'Español' ? 'Disponible para emergencias' : 'Available for emergencies',
    cancel: language === 'Español' ? 'Cancelar' : 'Cancel',
    save: language === 'Español' ? 'Guardar' : 'Save',
    update: language === 'Español' ? 'Actualizar' : 'Update',
    noStaff: language === 'Español' ? 'No hay personal de recepción' : 'No reception staff',
    startAdd: language === 'Español' ? 'Comience agregando personal' : 'Start by adding staff',
    deleteConfirm: language === 'Español' ? '¿Eliminar este personal?' : 'Delete this staff member?',
    success: language === 'Español' ? 'Éxito' : 'Success',
    error: language === 'Español' ? 'Error' : 'Error',
    lastActivity: language === 'Español' ? 'Última actividad' : 'Last activity',
    never: language === 'Español' ? 'Nunca' : 'Never',
    contactInfo: language === 'Español' ? 'Información de contacto' : 'Contact information',
  };

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setReceptionStaff(mockReceptionStaff);
      setIsLoading(false);
    }, 500);
  }, []);

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, availableForEmergencies: checked });
  };

  // Actions
  const handleAddStaff = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      shift: 'MORNING',
      status: 'ACTIVE',
      availableForEmergencies: false
    });
    setFormErrors({});
    setIsEditMode(false);
    setEditingStaffId(null);
    setIsDialogOpen(true);
  };

  const handleEditStaff = (staff: ReceptionStaff) => {
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      shift: staff.shift,
      status: staff.status,
      availableForEmergencies: staff.availableForEmergencies
    });
    setFormErrors({});
    setIsEditMode(true);
    setEditingStaffId(staff.id);
    setIsDialogOpen(true);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setIsLoading(true);
    setTimeout(() => {
      setReceptionStaff(receptionStaff.filter(staff => staff.id !== id));
      toast({ title: t.success, description: language === 'Español' ? 'Personal eliminado' : 'Staff deleted' });
      setIsLoading(false);
    }, 500);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required fields
    if (!formData.name.trim()) errors.name = language === 'Español' ? 'Campo requerido' : 'Field required';
    if (!formData.email.trim()) errors.email = language === 'Español' ? 'Campo requerido' : 'Field required';
    if (!formData.phone.trim()) errors.phone = language === 'Español' ? 'Campo requerido' : 'Field required';
    
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = language === 'Español' ? 'Correo electrónico inválido' : 'Invalid email';
    }
    
    // Phone format
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = language === 'Español' ? 'Teléfono inválido (10 dígitos)' : 'Invalid phone (10 digits)';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      if (isEditMode && editingStaffId) {
        setReceptionStaff(receptionStaff.map(staff => 
          staff.id === editingStaffId ? {
            ...staff,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            shift: formData.shift,
            status: formData.status,
            availableForEmergencies: formData.availableForEmergencies
          } : staff
        ));
        toast({ title: t.success, description: language === 'Español' ? 'Personal actualizado' : 'Staff updated' });
      } else {
        const newStaff: ReceptionStaff = {
          id: (Math.max(...receptionStaff.map(s => parseInt(s.id))) + 1).toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          shift: formData.shift,
          status: formData.status,
          availableForEmergencies: formData.availableForEmergencies,
          createdAt: new Date(),
          lastActivity: null
        };
        setReceptionStaff([...receptionStaff, newStaff]);
        toast({ title: t.success, description: language === 'Español' ? 'Personal creado' : 'Staff created' });
      }
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };

  // Filter staff
  const filteredStaff = receptionStaff.filter(staff => {
    const matchesSearch = searchTerm === '' || 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm);
    
    const matchesShift = shiftFilter === 'all' || staff.shift === shiftFilter;
    
    return matchesSearch && matchesShift;
  });

  // Helper functions
  const getShiftBadge = (shift: string) => {
    const classes = {
      'MORNING': 'bg-blue-100 text-blue-800',
      'AFTERNOON': 'bg-amber-100 text-amber-800',
      'NIGHT': 'bg-purple-100 text-purple-800',
      'FULL_DAY': 'bg-green-100 text-green-800'
    };
    
    const labels = {
      'MORNING': t.morning,
      'AFTERNOON': t.afternoon,
      'NIGHT': t.night,
      'FULL_DAY': t.fullDay
    };
    
    return (
      <Badge className={classes[shift as keyof typeof classes] || 'bg-gray-100 text-gray-800'}>
        {labels[shift as keyof typeof labels] || shift}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' 
      ? <Badge className="bg-green-100 text-green-800">{t.active}</Badge>
      : <Badge className="bg-gray-100 text-gray-800">{t.inactive}</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return t.never;
    return format(date, 'dd/MM/yyyy HH:mm');
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
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t.allShifts || "All shifts"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allShifts}</SelectItem>
                <SelectItem value="MORNING">{t.morning}</SelectItem>
                <SelectItem value="AFTERNOON">{t.afternoon}</SelectItem>
                <SelectItem value="NIGHT">{t.night}</SelectItem>
                <SelectItem value="FULL_DAY">{t.fullDay}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleAddStaff}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t.addStaff}
          </Button>
        </div>
      </div>

      {/* Staff table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'Español' ? 'Personal de Recepción' : 'Reception Staff'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">{t.noStaff}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.startAdd}</p>
              <div className="mt-6">
                <Button onClick={handleAddStaff}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t.addStaff}
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'Español' ? 'Nombre' : 'Name'}</TableHead>
                  <TableHead>{t.contactInfo}</TableHead>
                  <TableHead>{t.shift}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.lastActivity}</TableHead>
                  <TableHead className="text-right">{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{staff.name}</span>
                        {staff.availableForEmergencies && (
                          <Badge className="ml-2 bg-red-100 text-red-800">
                            {language === 'Español' ? 'Emergencias' : 'Emergencies'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <div className="flex items-center">
                          <MailIcon className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{staff.email}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <PhoneIcon className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{staff.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getShiftBadge(staff.shift)}</TableCell>
                    <TableCell>{getStatusBadge(staff.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-500 text-sm">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>{formatDate(staff.lastActivity)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditStaff(staff)}
                          title={language === 'Español' ? 'Editar' : 'Edit'}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteStaff(staff.id)}
                          title={language === 'Español' ? 'Eliminar' : 'Delete'}
                        >
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

      {/* Dialog for adding/editing staff */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? t.editStaff : t.addStaff}</DialogTitle>
            <DialogDescription>{t.formInfo}</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="name">{t.fullName} *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="email">{t.email} *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="phone">{t.phone} *</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />
                  {formErrors.phone && (
                    <p className="text-sm text-red-500">{formErrors.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="shift">{t.shift}</Label>
                  <Select value={formData.shift} onValueChange={(v) => handleSelectChange('shift', v)}>
                    <SelectTrigger><SelectValue placeholder={t.selectShift || "Select shift"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORNING">{t.morning}</SelectItem>
                      <SelectItem value="AFTERNOON">{t.afternoon}</SelectItem>
                      <SelectItem value="NIGHT">{t.night}</SelectItem>
                      <SelectItem value="FULL_DAY">{t.fullDay}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="status">{t.status}</Label>
                  <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                    <SelectTrigger><SelectValue placeholder={t.status || "Status"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">{t.active}</SelectItem>
                      <SelectItem value="INACTIVE">{t.inactive}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="availableForEmergencies" 
                  checked={formData.availableForEmergencies}
                  onCheckedChange={(checked) => handleCheckboxChange(checked === true)}
                />
                <Label 
                  htmlFor="availableForEmergencies"
                  className="font-normal"
                >
                  {t.availableEmergencies}
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    {language === 'Español' ? 'Procesando...' : 'Processing...'}
                  </div>
                ) : isEditMode ? t.update : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
