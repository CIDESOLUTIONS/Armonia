"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Search, Edit, Trash2, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import toast from "react-hot-toast";

// Tipos para los datos de personal de seguridad
interface SecurityStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  licenseNumber: string;
  licenseExpiry: string;
  zone: string;
  status: "active" | "inactive" | "onLeave";
  company: string;
}

export default function SecurityStaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [securityStaff, setSecurityStaff] = useState<SecurityStaff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<SecurityStaff | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "guard",
    licenseNumber: "",
    licenseExpiry: "",
    zone: "entrance",
    status: "active",
    company: "Internal",
  });

  // Datos simulados para la demostración
  useEffect(() => {
    // En un caso real, esto sería una llamada a la API
    const mockData: SecurityStaff[] = [
      {
        id: "sec1",
        name: "Carlos Martínez",
        email: "cmartinez@armonia.com",
        phone: "3001234567",
        position: "supervisor",
        licenseNumber: "SV-12345",
        licenseExpiry: "2025-06-30",
        zone: "entrance",
        status: "active",
        company: "Seguridad Total S.A.",
      },
      {
        id: "sec2",
        name: "Ana López",
        email: "alopez@armonia.com",
        phone: "3009876543",
        position: "guard",
        licenseNumber: "SV-67890",
        licenseExpiry: "2024-12-15",
        zone: "perimeter",
        status: "active",
        company: "Seguridad Total S.A.",
      },
      {
        id: "sec3",
        name: "Javier Rojas",
        email: "jrojas@armonia.com",
        phone: "3004567890",
        position: "guard",
        licenseNumber: "SV-45678",
        licenseExpiry: "2025-03-22",
        zone: "towers",
        status: "onLeave",
        company: "Internal",
      },
      {
        id: "sec4",
        name: "Diana Vargas",
        email: "dvargas@armonia.com",
        phone: "3007654321",
        position: "guard",
        licenseNumber: "SV-23456",
        licenseExpiry: "2025-08-10",
        zone: "parking",
        status: "active",
        company: "Internal",
      },
    ];
    setSecurityStaff(mockData);
  }, []);

  // Filtrar personal de seguridad por término de búsqueda y zona
  const filteredStaff = securityStaff.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone.includes(searchTerm);
    
    const matchesZone = selectedZone === "all" || staff.zone === selectedZone;
    
    return matchesSearch && matchesZone;
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en los selects
  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Añadir nuevo personal de seguridad
  const handleAddStaff = () => {
    const newStaff: SecurityStaff = {
      id: `sec${securityStaff.length + 1}`,
      ...formData,
    } as SecurityStaff;

    setSecurityStaff((prev) => [...prev, newStaff]);
    setIsAddDialogOpen(false);
    toast.success("Personal de seguridad añadido con éxito");
    
    // Resetear formulario
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "guard",
      licenseNumber: "",
      licenseExpiry: "",
      zone: "entrance",
      status: "active",
      company: "Internal",
    });
  };

  // Actualizar personal de seguridad
  const handleUpdateStaff = () => {
    if (!selectedStaff) return;

    const updatedStaff = securityStaff.map((staff) =>
      staff.id === selectedStaff.id ? { ...staff, ...formData } : staff
    );

    setSecurityStaff(updatedStaff);
    setIsEditDialogOpen(false);
    toast.success("Información de personal actualizada con éxito");
  };

  // Eliminar personal de seguridad
  const handleDeleteStaff = () => {
    if (!selectedStaff) return;

    const updatedStaff = securityStaff.filter(
      (staff) => staff.id !== selectedStaff.id
    );

    setSecurityStaff(updatedStaff);
    setIsDeleteDialogOpen(false);
    toast.success("Personal de seguridad eliminado con éxito");
  };

  // Preparar edición de personal
  const handleEditClick = (staff: SecurityStaff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      position: staff.position,
      licenseNumber: staff.licenseNumber,
      licenseExpiry: staff.licenseExpiry,
      zone: staff.zone,
      status: staff.status,
      company: staff.company,
    });
    setIsEditDialogOpen(true);
  };

  // Preparar vista detallada
  const handleViewClick = (staff: SecurityStaff) => {
    setSelectedStaff(staff);
    setIsViewDialogOpen(true);
  };

  // Preparar eliminación
  const handleDeleteClick = (staff: SecurityStaff) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  };

  // Función para mostrar el estado con el color correcto
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Activo</Badge>;
      case "inactive":
        return <Badge className="bg-red-500">Inactivo</Badge>;
      case "onLeave":
        return <Badge className="bg-yellow-500">Ausente</Badge>;
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>;
    }
  };

  // Traducir zona para mostrar
  const translateZone = (zone: string) => {
    const zoneMap: { [key: string]: string } = {
      entrance: "Entrada",
      perimeter: "Perímetro",
      towers: "Torres",
      parking: "Estacionamiento",
    };
    return zoneMap[zone] || zone;
  };

  // Traducir posición para mostrar
  const translatePosition = (position: string) => {
    const positionMap: { [key: string]: string } = {
      supervisor: "Supervisor",
      guard: "Vigilante",
    };
    return positionMap[position] || position;
  };

  return (
    <div className="container mx-auto py-8">
      <DashboardPageHeader
        heading="Personal de Seguridad"
        text="Gestión del personal de seguridad y vigilancia del conjunto residencial"
        icon={Shield}
      />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Lista de Personal de Seguridad</CardTitle>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-60"
                />
              </div>
              <Select
                value={selectedZone}
                onValueChange={(value) => setSelectedZone(value)}
              >
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filtrar por zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las zonas</SelectItem>
                  <SelectItem value="entrance">Entrada</SelectItem>
                  <SelectItem value="perimeter">Perímetro</SelectItem>
                  <SelectItem value="towers">Torres</SelectItem>
                  <SelectItem value="parking">Estacionamiento</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="flex items-center gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusCircle className="w-4 h-4" />
                Añadir Personal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Zona Asignada</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{translatePosition(staff.position)}</TableCell>
                      <TableCell>{translateZone(staff.zone)}</TableCell>
                      <TableCell>{staff.company}</TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewClick(staff)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(staff)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDeleteClick(staff)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para añadir personal */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Añadir Personal de Seguridad</DialogTitle>
            <DialogDescription>
              Complete el formulario para añadir un nuevo miembro al personal de seguridad.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Información Personal</TabsTrigger>
              <TabsTrigger value="work">Información Laboral</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@correo.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange(value, "status")}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="onLeave">Ausente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="work" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleSelectChange(value, "position")}
                  >
                    <SelectTrigger id="position">
                      <SelectValue placeholder="Seleccionar cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="guard">Vigilante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone">Zona Asignada</Label>
                  <Select
                    value={formData.zone}
                    onValueChange={(value) => handleSelectChange(value, "zone")}
                  >
                    <SelectTrigger id="zone">
                      <SelectValue placeholder="Seleccionar zona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrance">Entrada</SelectItem>
                      <SelectItem value="perimeter">Perímetro</SelectItem>
                      <SelectItem value="towers">Torres</SelectItem>
                      <SelectItem value="parking">Estacionamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Número de Licencia</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="Número de licencia de seguridad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">Fecha de Vencimiento</Label>
                  <Input
                    id="licenseExpiry"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddStaff}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar personal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Personal de Seguridad</DialogTitle>
            <DialogDescription>
              Actualice la información del miembro del personal de seguridad.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Información Personal</TabsTrigger>
              <TabsTrigger value="work">Información Laboral</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre Completo</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Correo Electrónico</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@correo.com"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange(value, "status")}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="onLeave">Ausente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="work" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Cargo</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => handleSelectChange(value, "position")}
                  >
                    <SelectTrigger id="edit-position">
                      <SelectValue placeholder="Seleccionar cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="guard">Vigilante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-zone">Zona Asignada</Label>
                  <Select
                    value={formData.zone}
                    onValueChange={(value) => handleSelectChange(value, "zone")}
                  >
                    <SelectTrigger id="edit-zone">
                      <SelectValue placeholder="Seleccionar zona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrance">Entrada</SelectItem>
                      <SelectItem value="perimeter">Perímetro</SelectItem>
                      <SelectItem value="towers">Torres</SelectItem>
                      <SelectItem value="parking">Estacionamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-licenseNumber">Número de Licencia</Label>
                  <Input
                    id="edit-licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    placeholder="Número de licencia de seguridad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-licenseExpiry">Fecha de Vencimiento</Label>
                  <Input
                    id="edit-licenseExpiry"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Empresa</Label>
                  <Input
                    id="edit-company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStaff}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver detalles */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Personal de Seguridad</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">Nombre:</div>
                <div>{selectedStaff.name}</div>
                <div className="font-semibold">Email:</div>
                <div>{selectedStaff.email}</div>
                <div className="font-semibold">Teléfono:</div>
                <div>{selectedStaff.phone}</div>
                <div className="font-semibold">Cargo:</div>
                <div>{translatePosition(selectedStaff.position)}</div>
                <div className="font-semibold">Licencia:</div>
                <div>{selectedStaff.licenseNumber}</div>
                <div className="font-semibold">Vencimiento:</div>
                <div>{selectedStaff.licenseExpiry}</div>
                <div className="font-semibold">Zona:</div>
                <div>{translateZone(selectedStaff.zone)}</div>
                <div className="font-semibold">Empresa:</div>
                <div>{selectedStaff.company}</div>
                <div className="font-semibold">Estado:</div>
                <div>{getStatusBadge(selectedStaff.status)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar a este miembro del personal de seguridad? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="py-4">
              <p>
                <span className="font-semibold">Nombre:</span> {selectedStaff.name}
              </p>
              <p>
                <span className="font-semibold">Cargo:</span> {translatePosition(selectedStaff.position)}
              </p>
              <p>
                <span className="font-semibold">Zona:</span> {translateZone(selectedStaff.zone)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteStaff}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
