"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow,  } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,  } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  } from '@/components/ui/select';
import { format } from 'date-fns';
;
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger,  } from '@/components/ui/popover';
import { CalendarIcon, FileText, Download, Printer, Search, Filter, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { Loading } from '@/components/Loading';
import { Label } from '@/components/ui/label';
;
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

// Define interfaces
interface Property {
  id: string;
  unitCode: string;
  ownerName: string;
}

interface Certificate {
  id: string;
  type: 'PAYMENT' | 'PEACE_AND_SAVE' | 'TAX';
  propertyId: string;
  propertyUnitCode: string;
  referenceYear: number;
  referenceMonth?: number;
  issuedDate: Date;
  expirationDate?: Date;
  totalPaid: number;
  status: 'ISSUED' | 'EXPIRED' | 'REVOKED';
}

export default function CertificatesPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const { _token, complexId, schemaName  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [_properties, _setProperties] = useState<Property[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  const [_searchTerm, _setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  
  // Certificate form
  const [certForm, setCertForm] = useState({
    type: 'PAYMENT' as 'PAYMENT' | 'PEACE_AND_SAVE' | 'TAX',
    propertyId: '',
    referenceYear: new Date().getFullYear(),
    referenceMonth: undefined as number | undefined,
    issuedDate: new Date(),
    expirationDate: undefined as Date | undefined,
  });

  // Load properties and certificates
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API calls
        // Mock properties
        const mockProperties: Property[] = [
          { id: '1', unitCode: 'A-101', ownerName: 'Juan Pérez' },
          { id: '2', unitCode: 'A-102', ownerName: 'María Rodríguez' },
          { id: '3', unitCode: 'A-103', ownerName: 'Carlos Gómez' },
          { id: '4', unitCode: 'A-104', ownerName: 'Ana Martínez' },
          { id: '5', unitCode: 'B-201', ownerName: 'Luis Hernández' },
          { id: '6', unitCode: 'B-202', ownerName: 'Sofia Torres' },
        ];
        
        // Mock certificates
        const mockCertificates: Certificate[] = [
          {
            id: '1',
            type: 'PAYMENT',
            propertyId: '1',
            propertyUnitCode: 'A-101',
            referenceYear: 2024,
            referenceMonth: 3,
            issuedDate: new Date(2024, 3, 15),
            totalPaid: 150000,
            status: 'ISSUED',
          },
          {
            id: '2',
            type: 'PEACE_AND_SAVE',
            propertyId: '2',
            propertyUnitCode: 'A-102',
            referenceYear: 2024,
            issuedDate: new Date(2024, 3, 10),
            expirationDate: new Date(2024, 4, 10),
            totalPaid: 1800000,
            status: 'ISSUED',
          },
          {
            id: '3',
            type: 'TAX',
            propertyId: '1',
            propertyUnitCode: 'A-101',
            referenceYear: 2023,
            issuedDate: new Date(2024, 0, 20),
            totalPaid: 450000,
            status: 'EXPIRED',
          },
        ];
        
        setProperties(mockProperties);
        setCertificates(mockCertificates);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: language === 'Español' ? 'Error' : 'Error',
          description: language === 'Español' 
            ? 'Error al cargar los datos' 
            : 'Error loading data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [language, toast]);

  // Handle certificate creation
  const handleCreateCertificate = () => {
    // Reset form
    setCertForm({
      type: 'PAYMENT',
      propertyId: '',
      referenceYear: new Date().getFullYear(),
      referenceMonth: undefined,
      issuedDate: new Date(),
      expirationDate: undefined,
    });
    
    setIsDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: unknown) => {
    setCertForm({
      ...certForm,
      [field]: value,
    });
  };

  // Handle certificate submission
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validate form
      if (!certForm.propertyId) {
        toast({
          title: language === 'Español' ? 'Error' : 'Error',
          description: language === 'Español' 
            ? 'Debe seleccionar una propiedad' 
            : 'You must select a property',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      if (certForm.type === 'PAYMENT' && !certForm.referenceMonth) {
        toast({
          title: language === 'Español' ? 'Error' : 'Error',
          description: language === 'Español' 
            ? 'Debe seleccionar un mes para certificados de pago' 
            : 'You must select a month for payment certificates',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      
      // TODO: Replace with actual API call
      
      // For now, simulate creating a certificate
      const property = properties.find(p => p.id === certForm.propertyId);
      if (!property) {
        throw new Error('Property not found');
      }
      
      const newCertificate: Certificate = {
        id: (certificates.length + 1).toString(),
        type: certForm.type,
        propertyId: certForm.propertyId,
        propertyUnitCode: property.unitCode,
        referenceYear: certForm.referenceYear,
        referenceMonth: certForm.referenceMonth,
        issuedDate: certForm.issuedDate,
        expirationDate: certForm.expirationDate,
        totalPaid: Math.random() * 1000000 + 50000, // Random amount for demo
        status: 'ISSUED',
      };
      
      setCertificates([...certificates, newCertificate]);
      
      toast({
        title: language === 'Español' ? 'Éxito' : 'Success',
        description: language === 'Español' 
          ? 'Certificado generado correctamente' 
          : 'Certificate generated successfully',
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting certificate:', error);
      toast({
        title: language === 'Español' ? 'Error' : 'Error',
        description: language === 'Español' 
          ? 'Error al generar el certificado' 
          : 'Error generating certificate',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PDF certificate
  const handleDownloadCertificate = (certificate: Certificate) => {
    toast({
      title: language === 'Español' ? 'Descargando...' : 'Downloading...',
      description: language === 'Español' 
        ? 'El certificado se está generando' 
        : 'The certificate is being generated',
    });
    
    // TODO: Implement actual PDF generation and download
    setTimeout(() => {
      toast({
        title: language === 'Español' ? 'Listo' : 'Ready',
        description: language === 'Español' 
          ? 'Certificado descargado correctamente' 
          : 'Certificate downloaded successfully',
      });
    }, 1500);
  };

  // Print certificate
  const handlePrintCertificate = (certificate: Certificate) => {
    toast({
      title: language === 'Español' ? 'Imprimiendo...' : 'Printing...',
      description: language === 'Español' 
        ? 'Enviando a impresora' 
        : 'Sending to printer',
    });
    
    // TODO: Implement actual printing functionality
  };

  // Filter certificates based on search and tab
  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = certificate.propertyUnitCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'ALL' || certificate.type === activeTab;
    const matchesYear = certificate.referenceYear === yearFilter;
    
    return matchesSearch && matchesTab && matchesYear;
  });

  // Helper function to format certificate type
  const getCertificateTypeText = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return language === 'Español' ? 'Certificado de Pago' : 'Payment Certificate';
      case 'PEACE_AND_SAVE':
        return language === 'Español' ? 'Paz y Salvo' : 'Peace and Save Certificate';
      case 'TAX':
        return language === 'Español' ? 'Certificado Tributario' : 'Tax Certificate';
      default:
        return type;
    }
  };

  // Helper function to format status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return <Badge className="bg-green-100 text-green-800">{language === 'Español' ? 'Emitido' : 'Issued'}</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-amber-100 text-amber-800">{language === 'Español' ? 'Vencido' : 'Expired'}</Badge>;
      case 'REVOKED':
        return <Badge className="bg-red-100 text-red-800">{language === 'Español' ? 'Revocado' : 'Revoked'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get month names
  const getMonthName = (month: number) => {
    const months = language === 'Español' 
      ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] 
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return months[month];
  };

  return (
    <div className="container mx-auto p-4">
      <DashboardPageHeader 
        title={language === 'Español' ? 'Certificados Financieros' : 'Financial Certificates'} 
        description={language === 'Español' 
          ? 'Genere y administre certificados financieros para las propiedades del conjunto' 
          : 'Generate and manage financial certificates for properties in the complex'
        }
      />

      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center w-full sm:w-72">
            <Search className="h-4 w-4 absolute ml-3 text-gray-400" />
            <Input 
              placeholder={language === 'Español' ? 'Buscar por unidad...' : 'Search by unit...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={yearFilter.toString()}
                onValueChange={(value) => setYearFilter(parseInt(value))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={language === 'Español' ? 'Año' : 'Year'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleCreateCertificate}>
              <FileText className="mr-2 h-4 w-4" />
              {language === 'Español' ? 'Nuevo Certificado' : 'New Certificate'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ALL">
              {language === 'Español' ? 'Todos' : 'All'}
            </TabsTrigger>
            <TabsTrigger value="PAYMENT">
              {language === 'Español' ? 'Pagos' : 'Payments'}
            </TabsTrigger>
            <TabsTrigger value="PEACE_AND_SAVE">
              {language === 'Español' ? 'Paz y Salvo' : 'Peace & Save'}
            </TabsTrigger>
            <TabsTrigger value="TAX">
              {language === 'Español' ? 'Tributarios' : 'Tax'}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'Español' ? 'Certificados Generados' : 'Generated Certificates'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {language === 'Español' 
                  ? 'No hay certificados que coincidan con los criterios de búsqueda' 
                  : 'No certificates match the search criteria'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'Español' ? 'Unidad' : 'Unit'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Tipo' : 'Type'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Periodo' : 'Period'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Fecha Emisión' : 'Issue Date'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Estado' : 'Status'}</TableHead>
                  <TableHead>{language === 'Español' ? 'Acciones' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-medium">{certificate.propertyUnitCode}</TableCell>
                    <TableCell>{getCertificateTypeText(certificate.type)}</TableCell>
                    <TableCell>
                      {certificate.type === 'PAYMENT' && certificate.referenceMonth !== undefined
                        ? `${getMonthName(certificate.referenceMonth)} ${certificate.referenceYear}`
                        : certificate.referenceYear}
                    </TableCell>
                    <TableCell>
                      {certificate.issuedDate instanceof Date
                        ? format(certificate.issuedDate, 'dd/MM/yyyy')
                        : format(new Date(certificate.issuedDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(certificate.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDownloadCertificate(certificate)}
                          title={language === 'Español' ? 'Descargar' : 'Download'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handlePrintCertificate(certificate)}
                          title={language === 'Español' ? 'Imprimir' : 'Print'}
                        >
                          <Printer className="h-4 w-4" />
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

      {/* Dialog for creating a new certificate */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {language === 'Español' ? 'Generar Nuevo Certificado' : 'Generate New Certificate'}
            </DialogTitle>
            <DialogDescription>
              {language === 'Español' 
                ? 'Complete la información para generar un certificado financiero' 
                : 'Fill in the information to generate a financial certificate'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="type">
                {language === 'Español' ? 'Tipo de Certificado' : 'Certificate Type'}
              </Label>
              <Select
                value={certForm.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'Español' ? 'Seleccione un tipo' : 'Select a type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAYMENT">
                    {language === 'Español' ? 'Certificado de Pago' : 'Payment Certificate'}
                  </SelectItem>
                  <SelectItem value="PEACE_AND_SAVE">
                    {language === 'Español' ? 'Paz y Salvo' : 'Peace and Save Certificate'}
                  </SelectItem>
                  <SelectItem value="TAX">
                    {language === 'Español' ? 'Certificado Tributario' : 'Tax Certificate'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="propertyId">
                {language === 'Español' ? 'Propiedad' : 'Property'}
              </Label>
              <Select
                value={certForm.propertyId}
                onValueChange={(value) => handleInputChange('propertyId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'Español' ? 'Seleccione una propiedad' : 'Select a property'} />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.unitCode} - {property.ownerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="referenceYear">
                  {language === 'Español' ? 'Año' : 'Year'}
                </Label>
                <Select
                  value={certForm.referenceYear.toString()}
                  onValueChange={(value) => handleInputChange('referenceYear', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'Español' ? 'Seleccione un año' : 'Select a year'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {certForm.type === 'PAYMENT' && (
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="referenceMonth">
                    {language === 'Español' ? 'Mes' : 'Month'}
                  </Label>
                  <Select
                    value={certForm.referenceMonth?.toString() || ''}
                    onValueChange={(value) => handleInputChange('referenceMonth', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'Español' ? 'Seleccione un mes' : 'Select a month'} />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(12)].map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {getMonthName(index)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="issuedDate">
                {language === 'Español' ? 'Fecha de Emisión' : 'Issue Date'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !certForm.issuedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {certForm.issuedDate ? (
                      format(certForm.issuedDate, "dd/MM/yyyy")
                    ) : (
                      <span>
                        {language === 'Español' ? 'Seleccionar fecha' : 'Select date'}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={certForm.issuedDate}
                    onSelect={(date) => handleInputChange('issuedDate', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {certForm.type === 'PEACE_AND_SAVE' && (
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="expirationDate">
                  {language === 'Español' ? 'Fecha de Vencimiento' : 'Expiration Date'}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !certForm.expirationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {certForm.expirationDate ? (
                        format(certForm.expirationDate, "dd/MM/yyyy")
                      ) : (
                        <span>
                          {language === 'Español' ? 'Seleccionar fecha' : 'Select date'}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={certForm.expirationDate}
                      onSelect={(date) => handleInputChange('expirationDate', date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              {language === 'Español' ? 'Cancelar' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {language === 'Español' ? 'Generar Certificado' : 'Generate Certificate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
