"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
;
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, UserPlus, UserCog, Trash2Icon, PencilIcon, UserIcon, MailIcon, CalendarIcon } from 'lucide-react';
import { Loading } from '@/components/Loading';
import { format } from 'date-fns';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

// Types and Mock Data
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'RECEPTION';
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: Date | null;
  createdAt: Date;
  permissions: string[];
}

const PERMISSIONS = [
  { id: 'manage_users', label: { es: 'Gestionar Usuarios', en: 'Manage Users' } },
  { id: 'manage_residents', label: { es: 'Gestionar Residentes', en: 'Manage Residents' } },
  { id: 'manage_properties', label: { es: 'Gestionar Propiedades', en: 'Manage Properties' } },
  { id: 'manage_finances', label: { es: 'Gestionar Finanzas', en: 'Manage Finances' } },
  { id: 'manage_assemblies', label: { es: 'Gestionar Asambleas', en: 'Manage Assemblies' } },
  { id: 'manage_services', label: { es: 'Gestionar Servicios', en: 'Manage Services' } },
  { id: 'manage_pqr', label: { es: 'Gestionar PQR', en: 'Manage PQR' } },
  { id: 'view_reports', label: { es: 'Ver Reportes', en: 'View Reports' } },
  { id: 'export_data', label: { es: 'Exportar Datos', en: 'Export Data' } },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Mario Cifuentes',
    email: 'Admin001@prueba.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: new Date(),
    createdAt: new Date(2023, 0, 15),
    permissions: PERMISSIONS.map(p => p.id)
  },
  {
    id: '2',
    name: 'Laura Rodríguez',
    email: 'laura.rodriguez@example.com',
    role: 'MANAGER',
    status: 'ACTIVE',
    lastLogin: new Date(2023, 11, 20),
    createdAt: new Date(2023, 1, 20),
    permissions: ['manage_residents', 'manage_properties', 'manage_services', 'manage_pqr', 'view_reports']
  },
  {
    id: '3',
    name: 'Carlos Gómez',
    email: 'carlos.gomez@example.com',
    role: 'STAFF',
    status: 'ACTIVE',
    lastLogin: new Date(2023, 11, 15),
    createdAt: new Date(2023, 2, 10),
    permissions: ['manage_services', 'manage_pqr']
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana.martinez@example.com',
    role: 'RECEPTION',
    status: 'ACTIVE',
    lastLogin: new Date(2023, 11, 28),
    createdAt: new Date(2023, 3, 5),
    permissions: ['manage_pqr']
  },
  {
    id: '5',
    name: 'Juan Perez',
    email: 'juan.perez@example.com',
    role: 'MANAGER',
    status: 'INACTIVE',
    lastLogin: new Date(2023, 6, 10),
    createdAt: new Date(2023, 4, 12),
    permissions: ['manage_residents', 'manage_properties', 'view_reports']
  }
];

export default function UsersRegistryPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [users, _setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [_searchTerm, _setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [_formData, _setFormData] = useState({
    name: '',
    email: '',
    role: 'STAFF' as 'ADMIN' | 'MANAGER' | 'STAFF' | 'RECEPTION',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    permissions: [] as string[],
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Translations
  const t = {
    title: language === 'Español' ? 'Registro de Usuarios' : 'User Registry',
    description: language === 'Español' ? 'Administre los usuarios del sistema' : 'Manage system users',
    search: language === 'Español' ? 'Buscar usuario...' : 'Search user...',
    allRoles: language === 'Español' ? 'Todos los roles' : 'All roles',
    addUser: language === 'Español' ? 'Agregar Usuario' : 'Add User',
    editUser: language === 'Español' ? 'Editar Usuario' : 'Edit User',
    formInfo: language === 'Español' ? 'Complete la información del usuario' : 'Fill in the user information',
    fullName: language === 'Español' ? 'Nombre completo' : 'Full name',
    email: language === 'Español' ? 'Correo electrónico' : 'Email',
    role: language === 'Español' ? 'Rol' : 'Role',
    selectRole: language === 'Español' ? 'Seleccionar rol' : 'Select role',
    admin: language === 'Español' ? 'Administrador' : 'Administrator',
    manager: language === 'Español' ? 'Gerente' : 'Manager',
    staff: language === 'Español' ? 'Personal' : 'Staff',
    reception: language === 'Español' ? 'Recepción' : 'Reception',
    status: language === 'Español' ? 'Estado' : 'Status',
    active: language === 'Español' ? 'Activo' : 'Active',
    inactive: language === 'Español' ? 'Inactivo' : 'Inactive',
    password: language === 'Español' ? 'Contraseña' : 'Password',
    confirmPassword: language === 'Español' ? 'Confirmar contraseña' : 'Confirm password',
    permissions: language === 'Español' ? 'Permisos' : 'Permissions',
    cancel: language === 'Español' ? 'Cancelar' : 'Cancel',
    save: language === 'Español' ? 'Guardar' : 'Save',
    update: language === 'Español' ? 'Actualizar' : 'Update',
    noUsers: language === 'Español' ? 'No hay usuarios' : 'No users',
    startAdd: language === 'Español' ? 'Comience agregando un usuario' : 'Start by adding a user',
    deleteConfirm: language === 'Español' ? '¿Eliminar este usuario?' : 'Delete this user?',
    success: language === 'Español' ? 'Éxito' : 'Success',
    error: language === 'Español' ? 'Error' : 'Error',
    lastLogin: language === 'Español' ? 'Último acceso' : 'Last login',
    never: language === 'Español' ? 'Nunca' : 'Never',
  };

  // Load data
  useEffect(() => {
    setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 500);
  }, []);

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleSelectChange = (name: string, value: unknown) => {
    setFormData({ ...formData, [name]: value });
    
    // Set default permissions based on role
    if (name === 'role') {
      let defaultPermissions: string[] = [];
      switch (value) {
        case 'ADMIN': defaultPermissions = PERMISSIONS.map(p => p.id); break;
        case 'MANAGER': defaultPermissions = ['manage_residents', 'manage_properties', 'manage_services', 'manage_pqr', 'view_reports']; break;
        case 'STAFF': defaultPermissions = ['manage_services', 'manage_pqr']; break;
        case 'RECEPTION': defaultPermissions = ['manage_pqr']; break;
      }
      setFormData(prev => ({ ...prev, permissions: defaultPermissions }));
    }
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, permissions: [...formData.permissions, permission] });
    } else {
      setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission) });
    }
  };

  // Actions
  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      role: 'STAFF',
      status: 'ACTIVE',
      permissions: ['manage_services', 'manage_pqr'],
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setIsEditMode(false);
    setEditingUserId(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      permissions: user.permissions,
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setIsEditMode(true);
    setEditingUserId(user.id);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    setIsLoading(true);
    setTimeout(() => {
      setUsers(users.filter(user => user.id !== id));
      toast({ title: t.success, description: language === 'Español' ? 'Usuario eliminado' : 'User deleted' });
      setIsLoading(false);
    }, 500);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Required fields
    if (!formData.name.trim()) errors.name = language === 'Español' ? 'Campo requerido' : 'Field required';
    if (!formData.email.trim()) errors.email = language === 'Español' ? 'Campo requerido' : 'Field required';
    
    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = language === 'Español' ? 'Correo electrónico inválido' : 'Invalid email';
    }
    
    // Password validation
    if (!isEditMode) {
      if (!formData.password) {
        errors.password = language === 'Español' ? 'Campo requerido' : 'Field required';
      } else if (formData.password.length < 8) {
        errors.password = language === 'Español' ? 'Mínimo 8 caracteres' : 'Minimum 8 characters';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = language === 'Español' ? 'Campo requerido' : 'Field required';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = language === 'Español' ? 'Las contraseñas no coinciden' : 'Passwords do not match';
      }
    } else if (formData.password) {
      if (formData.password.length < 8) {
        errors.password = language === 'Español' ? 'Mínimo 8 caracteres' : 'Minimum 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = language === 'Español' ? 'Las contraseñas no coinciden' : 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      if (isEditMode && editingUserId) {
        setUsers(users.map(user => 
          user.id === editingUserId ? {
            ...user,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            permissions: formData.permissions
          } : user
        ));
        toast({ title: t.success, description: language === 'Español' ? 'Usuario actualizado' : 'User updated' });
      } else {
        const newUser: User = {
          id: (Math.max(...users.map(u => parseInt(u.id))) + 1).toString(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
          permissions: formData.permissions,
          lastLogin: null,
          createdAt: new Date()
        };
        setUsers([...users, newUser]);
        toast({ title: t.success, description: language === 'Español' ? 'Usuario creado' : 'User created' });
      }
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || roleFilter === '' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Helper functions
  const getRoleBadge = (role: string) => {
    const classes = {
      'ADMIN': 'bg-purple-100 text-purple-800',
      'MANAGER': 'bg-blue-100 text-blue-800',
      'STAFF': 'bg-green-100 text-green-800',
      'RECEPTION': 'bg-amber-100 text-amber-800'
    };
    
    const labels = {
      'ADMIN': t.admin,
      'MANAGER': t.manager,
      'STAFF': t.staff,
      'RECEPTION': t.reception
    };
    
    return (
      <Badge className={classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'}>
        {labels[role as keyof typeof labels] || role}
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
            <UserIcon className="h-4 w-4 text-gray-500" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t.allRoles || "All roles"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allRoles}</SelectItem>
                <SelectItem value="ADMIN">{t.admin}</SelectItem>
                <SelectItem value="MANAGER">{t.manager}</SelectItem>
                <SelectItem value="STAFF">{t.staff}</SelectItem>
                <SelectItem value="RECEPTION">{t.reception}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t.addUser}
          </Button>
        </div>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'Español' ? 'Usuarios del Sistema' : 'System Users'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserCog className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">{t.noUsers}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.startAdd}</p>
              <div className="mt-6">
                <Button onClick={handleAddUser}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t.addUser}
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'Español' ? 'Usuario' : 'User'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Correo' : 'Email'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Rol' : 'Role'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Estado' : 'Status'}</TableHead>
                  <TableHead>{t.lastLogin}</TableHead>
                  <TableHead className="text-right">{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MailIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-gray-500 text-sm">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>{formatDate(user.lastLogin)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditUser(user)}
                          title={language === 'Español' ? 'Editar' : 'Edit'}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        {user.email !== 'Admin001@prueba.com' && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            title={language === 'Español' ? 'Eliminar' : 'Delete'}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing user */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? t.editUser : t.addUser}</DialogTitle>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="role">{t.role}</Label>
                  <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                    <SelectTrigger><SelectValue placeholder={t.selectRole || "Select role"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">{t.admin}</SelectItem>
                      <SelectItem value="MANAGER">{t.manager}</SelectItem>
                      <SelectItem value="STAFF">{t.staff}</SelectItem>
                      <SelectItem value="RECEPTION">{t.reception}</SelectItem>
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
              
              {!isEditMode || formData.password || formData.confirmPassword ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="password">{t.password} {!isEditMode && '*'}</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-500">{formErrors.password}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="confirmPassword">{t.confirmPassword} {!isEditMode && '*'}</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={formData.confirmPassword} 
                      onChange={handleInputChange} 
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {language === 'Español' 
                    ? 'Deje los campos de contraseña en blanco para mantener la actual.' 
                    : 'Leave password fields blank to keep the current password.'}
                </div>
              )}
              
              <div>
                <Label htmlFor="permissions">{t.permissions}</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => 
                          handlePermissionToggle(permission.id, checked === true)
                        }
                      />
                      <Label 
                        htmlFor={permission.id}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {language === 'Español' ? permission.label.es : permission.label.en}
                      </Label>
                    </div>
                  ))}
                </div>
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