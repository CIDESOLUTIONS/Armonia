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
import { Search, UserPlus, Trash2Icon, PencilIcon, UserIcon, MailIcon, CalendarIcon, PhoneIcon, Briefcase } from 'lucide-react';
import { Loading } from '@/components/Loading';
import { format } from 'date-fns';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Textarea } from '@/components/ui/textarea';

// Tipos e interfaces
interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: 'MAINTENANCE' | 'GARDENER' | 'CLEANING' | 'GENERAL';
  status: 'ACTIVE' | 'INACTIVE';
  startDate: Date;
  skills: string[];
  notes: string;
}

// Datos de ejemplo
const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Luis Gutiérrez',
    email: 'luis.gutierrez@example.com',
    phone: '3123456789',
    position: 'MAINTENANCE',
    status: 'ACTIVE',
    startDate: new Date(2023, 2, 15),
    skills: ['Plomería', 'Electricidad'],
    notes: 'Experiencia en reparaciones generales'
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria.lopez@example.com',
    phone: '3209876543',
    position: 'CLEANING',
    status: 'ACTIVE',
    startDate: new Date(2023, 5, 10),
    skills: ['Limpieza profunda'],
    notes: ''
  },
  {
    id: '3',
    name: 'José Torres',
    email: 'jose.torres@example.com',
    phone: '3157894561',
    position: 'GARDENER',
    status: 'ACTIVE',
    startDate: new Date(2023, 4, 5),
    skills: ['Paisajismo', 'Poda'],
    notes: 'Especialista en jardinería vertical'
  },
  {
    id: '4',
    name: 'Carmen Díaz',
    email: 'carmen.diaz@example.com',
    phone: '3001234567',
    position: 'GENERAL',
    status: 'INACTIVE',
    startDate: new Date(2022, 10, 15),
    skills: ['Administración', 'Atención al cliente'],
    notes: 'Apoyo en diversas áreas'
  }
];

export default function StaffPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'GENERAL' as 'MAINTENANCE' | 'GARDENER' | 'CLEANING' | 'GENERAL',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    skills: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Traducciones
  const t = {
    title: language === 'Español' ? 'Personal de Servicios Generales' : 'General Services Staff',
    description: language === 'Español' ? 'Gestione el personal de servicios generales del conjunto' : 'Manage general services staff for the complex',
    search: language === 'Español' ? 'Buscar personal...' : 'Search staff...',
    allPositions: language === 'Español' ? 'Todas las posiciones' : 'All positions',
    addStaff: language === 'Español' ? 'Agregar Personal' : 'Add Staff',
    editStaff: language === 'Español' ? 'Editar Personal' : 'Edit Staff',
    formInfo: language === 'Español' ? 'Complete la información del personal' : 'Fill in staff information',
    fullName: language === 'Español' ? 'Nombre completo' : 'Full name',
    email: language === 'Español' ? 'Correo electrónico' : 'Email',
    phone: language === 'Español' ? 'Teléfono' : 'Phone',
    position: language === 'Español' ? 'Cargo' : 'Position',
    selectPosition: language === 'Español' ? 'Seleccionar cargo' : 'Select position',
    maintenance: language === 'Español' ? 'Mantenimiento' : 'Maintenance',
    gardener: language === 'Español' ? 'Jardinero' : 'Gardener',
    cleaning: language === 'Español' ? 'Limpieza' : 'Cleaning',
    general: language === 'Español' ? 'General' : 'General',
    status: language === 'Español' ? 'Estado' : 'Status',
    active: language === 'Español' ? 'Activo' : 'Active',
    inactive: language === 'Español' ? 'Inactivo' : 'Inactive',
    skills: language === 'Español' ? 'Habilidades' : 'Skills',
    skillsPlaceholder: language === 'Español' ? 'Ingrese habilidades separadas por comas' : 'Enter skills separated by commas',
    notes: language === 'Español' ? 'Notas' : 'Notes',
    cancel: language === 'Español' ? 'Cancelar' : 'Cancel',
    save: language === 'Español' ? 'Guardar' : 'Save',
    update: language === 'Español' ? 'Actualizar' : 'Update',
    noStaff: language === 'Español' ? 'No hay personal de servicios' : 'No staff members',
    startAdd: language === 'Español' ? 'Comience agregando personal' : 'Start by adding staff',
    deleteConfirm: language === 'Español' ? '¿Eliminar este personal?' : 'Delete this staff member?',
    success: language === 'Español' ? 'Éxito' : 'Success',
    error: language === 'Español' ? 'Error' : 'Error',
    contactInfo: language === 'Español' ? 'Información de contacto' : 'Contact information',
    startDate: language === 'Español' ? 'Fecha de inicio' : 'Start date',
  };

  // Cargar datos
  useEffect(() => {
    setTimeout(() => {
      setStaff(mockStaff);
      setIsLoading(false);
    }, 500);
  }, []);

  // Manejadores de eventos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  // Acciones
  const handleAddStaff = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: 'GENERAL',
      status: 'ACTIVE',
      skills: '',
      notes: ''
    });
    setFormErrors({});
    setIsEditMode(false);
    setEditingStaffId(null);
    setIsDialogOpen(true);
  };

  const handleEditStaff = (staffMember: StaffMember) => {
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      position: staffMember.position,
      status: staffMember.status,
      skills: staffMember.skills.join(', '),
      notes: staffMember.notes
    });
    setFormErrors({});
    setIsEditMode(true);
    setEditingStaffId(staffMember.id);
    setIsDialogOpen(true);
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setIsLoading(true);
    setTimeout(() => {
      setStaff(staff.filter(s => s.id !== id));
      toast({ title: t.success, description: language === 'Español' ? 'Personal eliminado' : 'Staff deleted' });
      setIsLoading(false);
    }, 500);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Campos requeridos
    if (!formData.name.trim()) errors.name = language === 'Español' ? 'Campo requerido' : 'Field required';
    if (!formData.email.trim()) errors.email = language === 'Español' ? 'Campo requerido' : 'Field required';
    if (!formData.phone.trim()) errors.phone = language === 'Español' ? 'Campo requerido' : 'Field required';
    
    // Formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = language === 'Español' ? 'Correo electrónico inválido' : 'Invalid email';
    }
    
    // Formato de teléfono
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
    
    // Procesar habilidades
    const skillsArray = formData.skills.split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
    
    setTimeout(() => {
      if (isEditMode && editingStaffId) {
        setStaff(staff.map(s => 
          s.id === editingStaffId ? {
            ...s,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            position: formData.position,
            status: formData.status,
            skills: skillsArray,
            notes: formData.notes
          } : s
        ));
        toast({ title: t.success, description: language === 'Español' ? 'Personal actualizado' : 'Staff updated' });
      } else {
        const newStaff: StaffMember = {
          id: (Math.max(...staff.map(s => parseInt(s.id))) + 1).toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          status: formData.status,
          skills: skillsArray,
          startDate: new Date(),
          notes: formData.notes
        };
        setStaff([...staff, newStaff]);
        toast({ title: t.success, description: language === 'Español' ? 'Personal creado' : 'Staff created' });
      }
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };

  // Filtrar personal
  const filteredStaff = staff.filter(s => {
    const matchesSearch = searchTerm === '' || 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPosition = positionFilter === '' || s.position === positionFilter;
    
    return matchesSearch && matchesPosition;
  });

  // Funciones helper
  const getPositionBadge = (position: string) => {
    const classes = {
      'MAINTENANCE': 'bg-blue-100 text-blue-800',
      'GARDENER': 'bg-green-100 text-green-800',
      'CLEANING': 'bg-purple-100 text-purple-800',
      'GENERAL': 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      'MAINTENANCE': t.maintenance,
      'GARDENER': t.gardener,
      'CLEANING': t.cleaning,
      'GENERAL': t.general
    };
    
    return (
      <Badge className={classes[position as keyof typeof classes] || 'bg-gray-100 text-gray-800'}>
        {labels[position as keyof typeof labels] || position}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' 
      ? <Badge className="bg-green-100 text-green-800">{t.active}</Badge>
      : <Badge className="bg-gray-100 text-gray-800">{t.inactive}</Badge>;
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader title={t.title} description={t.description} />

      {/* Búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex items-center w-full sm:w-72">
          <Search className="h-4 w-4 absolute ml-3 text-gray-400" />
          <Input placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder={t.allPositions || "All positions"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t.allPositions}</SelectItem>
                <SelectItem value="MAINTENANCE">{t.maintenance}</SelectItem>
                <SelectItem value="GARDENER">{t.gardener}</SelectItem>
                <SelectItem value="CLEANING">{t.cleaning}</SelectItem>
                <SelectItem value="GENERAL">{t.general}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleAddStaff}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t.addStaff}
          </Button>
        </div>
      </div>

      {/* Tabla de personal */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'Español' ? 'Personal de Servicios' : 'Services Staff'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
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
                  <TableHead>{t.position}</TableHead>
                  <TableHead>{t.skills}</TableHead>
                  <TableHead>{t.startDate}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{staffMember.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <div className="flex items-center">
                          <MailIcon className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{staffMember.email}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <PhoneIcon className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{staffMember.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPositionBadge(staffMember.position)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {staffMember.skills.map((skill, index) => (
                          <Badge key={index} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-3 w-3 mr-1 text-gray-500" />
                        <span>{formatDate(staffMember.startDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(staffMember.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditStaff(staffMember)}
                          title={language === 'Español' ? 'Editar' : 'Edit'}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteStaff(staffMember.id)}
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

      {/* Diálogo para agregar/editar personal */}
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
                  <Label htmlFor="position">{t.position}</Label>
                  <Select value={formData.position} onValueChange={(v) => handleSelectChange('position', v)}>
                    <SelectTrigger><SelectValue placeholder={t.selectPosition || "Select position"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAINTENANCE">{t.maintenance}</SelectItem>
                      <SelectItem value="GARDENER">{t.gardener}</SelectItem>
                      <SelectItem value="CLEANING">{t.cleaning}</SelectItem>
                      <SelectItem value="GENERAL">{t.general}</SelectItem>
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
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="skills">{t.skills}</Label>
                <Input 
                  id="skills" 
                  name="skills" 
                  value={formData.skills} 
                  onChange={handleInputChange}
                  placeholder={t.skillsPlaceholder}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditMode ? t.update : t.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
