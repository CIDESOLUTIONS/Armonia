"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Mail, 
  UserPlus,
  ShieldAlert,
  UserCog,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { Loading } from '@/components/Loading';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';

// System user types
enum UserRole {
  ADMIN = 'ADMIN',  // Complex administrator
  MANAGER = 'MANAGER',  // Staff with administrative privileges
  STAFF = 'STAFF',  // Reception/security
  RESIDENT = 'RESIDENT',  // Resident/owner
}

// User status
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  BLOCKED = 'BLOCKED',
}

// User interface
interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  properties: string[];  // Property unit codes this user is associated with
  lastLogin?: string;
  createdAt: string;
  phone?: string;
}

export default function UsersPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { token, complexId } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.RESIDENT,
    status: UserStatus.ACTIVE,
    password: '',
    confirmPassword: '',
  });

  // Translations
  const t = {
    title: language === 'Español' ? 'Gestión de Usuarios' : 'User Management',
    description: language === 'Español' 
      ? 'Administre los usuarios del sistema y sus permisos' 
      : 'Manage system users and their permissions',
    allUsers: language === 'Español' ? 'Todos los Usuarios' : 'All Users',
    admins: language === 'Español' ? 'Administradores' : 'Administrators',
    staff: language === 'Español' ? 'Personal' : 'Staff',
    residents: language === 'Español' ? 'Residentes' : 'Residents',
    addUser: language === 'Español' ? 'Agregar Usuario' : 'Add User',
    editUser: language === 'Español' ? 'Editar Usuario' : 'Edit User',
    deleteUser: language === 'Español' ? 'Eliminar Usuario' : 'Delete User',
    name: language === 'Español' ? 'Nombre' : 'Name',
    email: language === 'Español' ? 'Correo Electrónico' : 'Email',
    phone: language === 'Español' ? 'Teléfono' : 'Phone',
    role: language === 'Español' ? 'Rol' : 'Role',
    status: language === 'Español' ? 'Estado' : 'Status',
    lastLogin: language === 'Español' ? 'Último Acceso' : 'Last Login',
    createdAt: language === 'Español' ? 'Creado El' : 'Created At',
    actions: language === 'Español' ? 'Acciones' : 'Actions',
    properties: language === 'Español' ? 'Propiedades' : 'Properties',
    password: language === 'Español' ? 'Contraseña' : 'Password',
    confirmPassword: language === 'Español' ? 'Confirmar Contraseña' : 'Confirm Password',
    active: language === 'Español' ? 'Activo' : 'Active',
    inactive: language === 'Español' ? 'Inactivo' : 'Inactive',
    pending: language === 'Español' ? 'Pendiente' : 'Pending',
    blocked: language === 'Español' ? 'Bloqueado' : 'Blocked',
    admin: language === 'Español' ? 'Administrador' : 'Administrator',
    manager: language === 'Español' ? 'Gerente' : 'Manager',
    staffRole: language === 'Español' ? 'Personal' : 'Staff',
    resident: language === 'Español' ? 'Residente' : 'Resident',
    save: language === 'Español' ? 'Guardar' : 'Save',
    cancel: language === 'Español' ? 'Cancelar' : 'Cancel',
    search: language === 'Español' ? 'Buscar usuarios...' : 'Search users...',
    filter: language === 'Español' ? 'Filtrar por rol' : 'Filter by role',
    all: language === 'Español' ? 'Todos' : 'All',
    noUsersFound: language === 'Español' ? 'No se encontraron usuarios' : 'No users found',
    searchAgain: language === 'Español' 
      ? 'Intente buscar con otros términos o agregue un nuevo usuario' 
      : 'Try searching with different terms or add a new user',
    userDetails: language === 'Español' ? 'Detalles del Usuario' : 'User Details',
    passwordHelp: language === 'Español' 
      ? 'Deje en blanco para mantener la contraseña actual' 
      : 'Leave blank to keep current password',
    passwordMismatch: language === 'Español' 
      ? 'Las contraseñas no coinciden' 
      : 'Passwords do not match',
    emailRequired: language === 'Español' 
      ? 'El correo electrónico es obligatorio' 
      : 'Email is required',
    nameRequired: language === 'Español' 
      ? 'El nombre es obligatorio' 
      : 'Name is required',
    passwordMin: language === 'Español' 
      ? 'La contraseña debe tener al menos 8 caracteres' 
      : 'Password must be at least 8 characters',
    createSuccess: language === 'Español' 
      ? 'Usuario creado exitosamente' 
      : 'User created successfully',
    updateSuccess: language === 'Español' 
      ? 'Usuario actualizado exitosamente' 
      : 'User updated successfully',
    deleteSuccess: language === 'Español' 
      ? 'Usuario eliminado exitosamente' 
      : 'User deleted successfully',
    error: language === 'Español' ? 'Error' : 'Error',
    confirmDelete: language === 'Español' 
      ? '¿Está seguro que desea eliminar este usuario?' 
      : 'Are you sure you want to delete this user?',
    showPassword: language === 'Español' ? 'Mostrar contraseña' : 'Show password',
    hidePassword: language === 'Español' ? 'Ocultar contraseña' : 'Hide password',
  };

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        
        // Simulated data loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock users data
        const mockUsers: UserData[] = [
          {
            id: '1',
            name: 'Juan Pérez',
            email: 'juan.perez@example.com',
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            properties: ['A-101'],
            lastLogin: '2025-04-01T08:30:00Z',
            createdAt: '2024-01-15T10:00:00Z',
            phone: '+573001234567',
          },
          {
            id: '2',
            name: 'María González',
            email: 'maria.gonzalez@example.com',
            role: UserRole.MANAGER,
            status: UserStatus.ACTIVE,
            properties: [],
            lastLogin: '2025-03-28T14:20:00Z',
            createdAt: '2024-02-20T11:30:00Z',
            phone: '+573009876543',
          },
          {
            id: '3',
            name: 'Carlos Rodríguez',
            email: 'carlos.rodriguez@example.com',
            role: UserRole.STAFF,
            status: UserStatus.ACTIVE,
            properties: [],
            lastLogin: '2025-04-02T09:45:00Z',
            createdAt: '2024-01-20T08:15:00Z',
            phone: '+573005551234',
          },
          {
            id: '4',
            name: 'Ana Martínez',
            email: 'ana.martinez@example.com',
            role: UserRole.RESIDENT,
            status: UserStatus.ACTIVE,
            properties: ['A-102'],
            lastLogin: '2025-03-25T16:10:00Z',
            createdAt: '2024-03-05T14:20:00Z',
            phone: '+573007778899',
          },
          {
            id: '5',
            name: 'Pedro Sánchez',
            email: 'pedro.sanchez@example.com',
            role: UserRole.RESIDENT,
            status: UserStatus.PENDING,
            properties: ['B-201'],
            createdAt: '2024-04-01T09:15:00Z',
          },
        ];
        
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({ 
          title: t.error, 
          description: language === 'Español' 
            ? 'Error al cargar los usuarios' 
            : 'Error loading users', 
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUsers();
  }, [toast, language, t.error]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return '-';
    }
  };

  // Get role badge
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge className="bg-red-100 text-red-800">{t.admin}</Badge>;
      case UserRole.MANAGER:
        return <Badge className="bg-blue-100 text-blue-800">{t.manager}</Badge>;
      case UserRole.STAFF:
        return <Badge className="bg-green-100 text-green-800">{t.staffRole}</Badge>;
      case UserRole.RESIDENT:
        return <Badge className="bg-purple-100 text-purple-800">{t.resident}</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800">{t.active}</Badge>;
      case UserStatus.INACTIVE:
        return <Badge className="bg-gray-100 text-gray-800">{t.inactive}</Badge>;
      case UserStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">{t.pending}</Badge>;
      case UserStatus.BLOCKED:
        return <Badge className="bg-red-100 text-red-800">{t.blocked}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: any) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add user
  const handleAddUser = () => {
    setIsEditing(false);
    setCurrentUser(null);
    setShowPassword(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: UserRole.RESIDENT,
      status: UserStatus.ACTIVE,
      password: '',
      confirmPassword: '',
    });
    setIsDialogOpen(true);
  };

  // Edit user
  const handleEditUser = (user: UserData) => {
    setIsEditing(true);
    setCurrentUser(user);
    setShowPassword(false);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: '',
    });
    setIsDialogOpen(true);
  };

  // Delete user
  const handleDeleteUser = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      setUsers(users.filter(user => user.id !== id));
      toast({
        title: t.deleteSuccess,
      });
    }
  };

  // Save user
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.email.trim()) {
        toast({
          title: t.error,
          description: t.emailRequired,
          variant: 'destructive'
        });
        return;
      }
      
      if (!formData.name.trim()) {
        toast({
          title: t.error,
          description: t.nameRequired,
          variant: 'destructive'
        });
        return;
      }
      
      if (
        (!isEditing && !formData.password) || 
        (formData.password && formData.password.length < 8)
      ) {
        toast({
          title: t.error,
          description: t.passwordMin,
          variant: 'destructive'
        });
        return;
      }
      
      if (
        formData.password && 
        formData.password !== formData.confirmPassword
      ) {
        toast({
          title: t.error,
          description: t.passwordMismatch,
          variant: 'destructive'
        });
        return;
      }
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditing && currentUser) {
        // Update existing user
        setUsers(users.map(user => 
          user.id === currentUser.id ? {
            ...user,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            status: formData.status,
          } : user
        ));
        
        toast({
          title: t.updateSuccess,
        });
      } else {
        // Create new user
        const newUser: UserData = {
          id: (Math.max(0, ...users.map(u => parseInt(u.id))) + 1).toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          status: formData.status,
          properties: [],
          createdAt: new Date().toISOString(),
        };
        
        setUsers([...users, newUser]);
        
        toast({
          title: t.createSuccess,
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: t.error,
        description: language === 'Español' ? 'Error al guardar el usuario' : 'Error saving user',
        variant: 'destructive'
      });
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Filter users based on active tab and search query
  const filteredUsers = users.filter(user => {
    // Filter by tab
    if (activeTab === 'admins' && user.role !== UserRole.ADMIN) return false;
    if (activeTab === 'staff' && user.role !== UserRole.STAFF && user.role !== UserRole.MANAGER) return false;
    if (activeTab === 'residents' && user.role !== UserRole.RESIDENT) return false;
    
    // Filter by role if filter is active
    if (filterRole && user.role !== filterRole) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.includes(query))
      );
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <DashboardPageHeader title={t.title} description={t.description} />
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader title={t.title} description={t.description} />

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="flex flex-col sm:flex-row items-center w-full gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filterRole}
            onValueChange={setFilterRole}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t.filter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.all}</SelectItem>
              <SelectItem value={UserRole.ADMIN}>{t.admin}</SelectItem>
              <SelectItem value={UserRole.MANAGER}>{t.manager}</SelectItem>
              <SelectItem value={UserRole.STAFF}>{t.staffRole}</SelectItem>
              <SelectItem value={UserRole.RESIDENT}>{t.resident}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t.addUser}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-4 max-w-xl mx-auto">
          <TabsTrigger value="all">{t.allUsers}</TabsTrigger>
          <TabsTrigger value="admins">{t.admins}</TabsTrigger>
          <TabsTrigger value="staff">{t.staff}</TabsTrigger>
          <TabsTrigger value="residents">{t.residents}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {renderUsersTable(filteredUsers)}
        </TabsContent>
        
        <TabsContent value="admins" className="mt-6">
          {renderUsersTable(filteredUsers)}
        </TabsContent>
        
        <TabsContent value="staff" className="mt-6">
          {renderUsersTable(filteredUsers)}
        </TabsContent>
        
        <TabsContent value="residents" className="mt-6">
          {renderUsersTable(filteredUsers)}
        </TabsContent>
      </Tabs>

      {/* User form dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? t.editUser : t.addUser}</DialogTitle>
            <DialogDescription>{t.userDetails}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+573001234567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">{t.role}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder={t.role} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>{t.admin}</SelectItem>
                    <SelectItem value={UserRole.MANAGER}>{t.manager}</SelectItem>
                    <SelectItem value={UserRole.STAFF}>{t.staffRole}</SelectItem>
                    <SelectItem value={UserRole.RESIDENT}>{t.resident}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">{t.status}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={t.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserStatus.ACTIVE}>{t.active}</SelectItem>
                  <SelectItem value={UserStatus.INACTIVE}>{t.inactive}</SelectItem>
                  <SelectItem value={UserStatus.PENDING}>{t.pending}</SelectItem>
                  <SelectItem value={UserStatus.BLOCKED}>{t.blocked}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isEditing ? '••••••••' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">{t.passwordHelp}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder={isEditing ? '••••••••' : ''}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  // Helper function to render users table
  function renderUsersTable(users: UserData[]) {
    if (users.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{t.noUsersFound}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t.searchAgain}
          </p>
          <Button className="mt-4" onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            {t.addUser}
          </Button>
        </div>
      );
    }
    
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.name}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead>{t.role}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.lastLogin}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{formatDate(user.lastLogin)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }
}