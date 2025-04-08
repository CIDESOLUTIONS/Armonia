"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, FileDown, Plus, Search, Download, FilePlus, Calendar, Printer, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Datos mock para pruebas
const mockCertificates = [
  { id: 1, propertyUnit: "A-101", owner: "Juan Pérez", type: "annual", year: 2024, status: "emitted", emittedDate: "2024-01-15" },
  { id: 2, propertyUnit: "A-102", owner: "María Rodríguez", type: "monthly", month: "Marzo", year: 2024, status: "pending", emittedDate: null },
  { id: 3, propertyUnit: "B-201", owner: "Carlos López", type: "custom", startDate: "2023-06-01", endDate: "2023-12-31", status: "downloaded", emittedDate: "2023-12-15" },
  { id: 4, propertyUnit: "A-103", owner: "Ana Martínez", type: "annual", year: 2023, status: "emitted", emittedDate: "2023-02-10" },
];

// Propiedades para el selector
const mockProperties = [
  { id: 1, unitNumber: "A-101", ownerName: "Juan Pérez" },
  { id: 2, unitNumber: "A-102", ownerName: "María Rodríguez" },
  { id: 3, unitNumber: "A-103", ownerName: "Ana Martínez" },
  { id: 4, unitNumber: "B-201", ownerName: "Carlos López" },
];

interface Certificate {
  id: number;
  propertyUnit: string;
  owner: string;
  type: "annual" | "monthly" | "custom";
  year: number;
  month?: string;
  startDate?: string;
  endDate?: string;
  status: "pending" | "emitted" | "downloaded";
  emittedDate: string | null;
}

export default function CertificatesPage() {
  const router = useRouter();
  const { token, complexId, schemaName } = useAuth();
  const { toast } = useToast();
  
  // Estado
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [properties, setProperties] = useState(mockProperties);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    propertyUnit: "",
    type: "annual",
    year: new Date().getFullYear(),
    month: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      setCertificates(mockCertificates);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrar certificados según búsqueda y tab activo
  const filteredCertificates = certificates
    .filter(cert => 
      cert.propertyUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.owner.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(cert => {
      if (activeTab === "all") return true;
      if (activeTab === "annual") return cert.type === "annual";
      if (activeTab === "monthly") return cert.type === "monthly";
      if (activeTab === "custom") return cert.type === "custom";
      return true;
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerateCertificate = () => {
    setIsLoading(true);
    
    // Simular proceso de generación
    setTimeout(() => {
      const newCertificate: Certificate = {
        id: Math.max(0, ...certificates.map(c => c.id)) + 1,
        propertyUnit: formData.propertyUnit,
        owner: mockProperties.find(p => p.unitNumber === formData.propertyUnit)?.ownerName || "Propietario",
        type: formData.type as "annual" | "monthly" | "custom",
        year: formData.year,
        ...(formData.type === "monthly" && { month: formData.month }),
        ...(formData.type === "custom" && { 
          startDate: formData.startDate,
          endDate: formData.endDate
        }),
        status: "emitted",
        emittedDate: new Date().toISOString().split("T")[0]
      };
      
      setCertificates([...certificates, newCertificate]);
      setShowDialog(false);
      setIsLoading(false);
      
      toast({
        title: "Certificado generado",
        description: `Se ha generado el certificado para la unidad ${formData.propertyUnit}`,
        variant: "default"
      });
    }, 1500);
  };

  const handleDownloadCertificate = (id: number) => {
    setIsLoading(true);
    
    // Simulación de descarga
    setTimeout(() => {
      setCertificates(certificates.map(cert => 
        cert.id === id ? { ...cert, status: "downloaded" } : cert
      ));
      
      setIsLoading(false);
      
      toast({
        title: "Certificado descargado",
        description: "El certificado ha sido descargado correctamente",
        variant: "default"
      });
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case "emitted":
        return <Badge className="bg-green-100 text-green-800">Emitido</Badge>;
      case "downloaded":
        return <Badge className="bg-blue-100 text-blue-800">Descargado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getCertificateTypeLabel = (cert: Certificate) => {
    switch (cert.type) {
      case "annual":
        return `Anual ${cert.year}`;
      case "monthly":
        return `Mensual ${cert.month} ${cert.year}`;
      case "custom":
        return `Personalizado ${cert.startDate} a ${cert.endDate}`;
      default:
        return "Desconocido";
    }
  };

  if (isLoading && certificates.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg text-gray-700">Cargando certificados...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Certificados de Pago</h1>
          <p className="text-gray-500">Genere y administre certificados para propiedades</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setShowDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Nuevo Certificado
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Buscar Certificados</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                type="search" 
                placeholder="Buscar por unidad o propietario..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="annual">Anuales</TabsTrigger>
          <TabsTrigger value="monthly">Mensuales</TabsTrigger>
          <TabsTrigger value="custom">Personalizados</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tabla de certificados */}
      {filteredCertificates.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hay certificados</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron certificados según los filtros actuales
          </p>
          <div className="mt-6">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowDialog(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo Certificado
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidad</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell className="font-medium">{certificate.propertyUnit}</TableCell>
                  <TableCell>{certificate.owner}</TableCell>
                  <TableCell>{getCertificateTypeLabel(certificate)}</TableCell>
                  <TableCell>{certificate.emittedDate || "Pendiente"}</TableCell>
                  <TableCell>{getStatusBadge(certificate.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadCertificate(certificate.id)}
                      className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                      disabled={certificate.status === "pending"}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.print()}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50 ml-1"
                      disabled={certificate.status === "pending"}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo para crear certificado */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Nuevo Certificado</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="propertyUnit">Unidad</Label>
              <Select
                value={formData.propertyUnit}
                onValueChange={(value) => handleSelectChange('propertyUnit', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.unitNumber}>
                      {property.unitNumber} - {property.ownerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">Tipo de Certificado</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Anual</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.type === "annual" && (
              <div>
                <Label htmlFor="year">Año</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleInputChange}
                />
              </div>
            )}
            
            {formData.type === "monthly" && (
              <>
                <div>
                  <Label htmlFor="month">Mes</Label>
                  <Select
                    value={formData.month}
                    onValueChange={(value) => handleSelectChange('month', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Enero">Enero</SelectItem>
                      <SelectItem value="Febrero">Febrero</SelectItem>
                      <SelectItem value="Marzo">Marzo</SelectItem>
                      <SelectItem value="Abril">Abril</SelectItem>
                      <SelectItem value="Mayo">Mayo</SelectItem>
                      <SelectItem value="Junio">Junio</SelectItem>
                      <SelectItem value="Julio">Julio</SelectItem>
                      <SelectItem value="Agosto">Agosto</SelectItem>
                      <SelectItem value="Septiembre">Septiembre</SelectItem>
                      <SelectItem value="Octubre">Octubre</SelectItem>
                      <SelectItem value="Noviembre">Noviembre</SelectItem>
                      <SelectItem value="Diciembre">Diciembre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Año</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            
            {formData.type === "custom" && (
              <>
                <div>
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700" 
              onClick={handleGenerateCertificate} 
              disabled={isLoading || !formData.propertyUnit || (formData.type === "monthly" && !formData.month) || (formData.type === "custom" && (!formData.startDate || !formData.endDate))}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Generar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}