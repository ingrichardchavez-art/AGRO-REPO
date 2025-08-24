import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserCog, Plus, Search, Filter, Calendar as CalendarIcon, Phone, Mail, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { LogisticsAPI } from "@/lib/api";
import type { Driver } from "@/lib/types";

// Esquema de validación para conductores usando Zod
const insertDriverSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.preprocess(
    (val) => val === "" ? undefined : val,
    z.string().email("Email inválido").optional()
  ),
  phone: z.string().optional(),
  licenseNumber: z.string().min(1, "El número de licencia es requerido"),
  licenseClass: z.enum(["A", "B", "C"]),
  status: z.enum(["active", "inactive", "suspended", "on_leave"]),
  address: z.string().optional(),
  licenseExpiry: z.date().optional(),
  hireDate: z.date().optional(),
});

type InsertDriverForm = z.infer<typeof insertDriverSchema>;

// Tipo para la API que espera snake_case
interface DriverAPIRequest {
  name: string;
  email: string;
  phone: string;
  license_number: string;
  license_class: string;
  status: string;
  address: string;
  license_expiry: string | null;
  hire_date: string | null;
}

export default function DriversPage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: LogisticsAPI.getDrivers,
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: InsertDriverForm) => {
      // Mapear los datos del formulario a la estructura esperada por la API
      const driverData: DriverAPIRequest = {
        name: data.name,
        email: data.email || "",
        phone: data.phone || "",
        license_number: data.licenseNumber,
        license_class: data.licenseClass,
        status: data.status,
        address: data.address || "",
        license_expiry: data.licenseExpiry ? data.licenseExpiry.toISOString() : null,
        hire_date: data.hireDate ? data.hireDate.toISOString() : null,
      };
      
      return LogisticsAPI.createDriver(driverData);
    },
    onSuccess: () => {
      toast({
        title: "Conductor agregado",
        description: "El conductor ha sido agregado exitosamente",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
    onError: (error: any) => {
      console.error("Error creating driver:", error);
      toast({
        title: "Error",
        description: `No se pudo agregar el conductor: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertDriverForm>({
    resolver: zodResolver(insertDriverSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      licenseNumber: "",
      licenseClass: "B",
      status: "active",
      address: "",
      licenseExpiry: undefined,
      hireDate: undefined,
    },
  });

  // Resetear el formulario cuando se abre el diálogo
  useEffect(() => {
    if (isCreateDialogOpen) {
      form.reset();
    }
  }, [isCreateDialogOpen, form]);

  const onSubmit = (data: InsertDriverForm) => {
    createDriverMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-green text-white";
      case "inactive":
        return "bg-gray-400 text-white";
      case "suspended":
        return "bg-alert-red text-white";
      case "on_leave":
        return "bg-blue-400 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "suspended":
        return "Suspendido";
      case "on_leave":
        return "De Licencia";
      default:
        return "Desconocido";
    }
  };

  const getLicenseStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: "expired", label: "Expirada", color: "text-alert-red", icon: AlertTriangle };
    } else if (daysUntilExpiry <= 30) {
      return { status: "expiring", label: "Por expirar", color: "text-warning-amber", icon: Clock };
    } else {
      return { status: "valid", label: "Vigente", color: "text-success-green", icon: CheckCircle };
    }
  };

  const filteredDrivers = Array.isArray(drivers) ? drivers.filter((driver: Driver) => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.license_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const expiringLicenses = Array.isArray(drivers) ? drivers.filter((driver: Driver) => {
    if (!driver.license_expiry) return false;
    const expiry = new Date(driver.license_expiry);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }) : [];

  return (
    <div className="h-full flex bg-neutral-bg">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex w-64 flex-col bg-white h-full">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Header 
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <main className="p-4 lg:p-6 space-y-6 pb-20 lg:pb-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Conductores</h1>
              <p className="text-gray-600">Gestión de licencias, certificados médicos y asignaciones</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-agro-primary hover:bg-agro-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Conductor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nuevo Conductor</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan Pérez García" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Licencia</FormLabel>
                            <FormControl>
                              <Input placeholder="B1234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="conductor@empresa.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="+54 11 1234-5678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="licenseClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clase de Licencia</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A">Clase A (Motocicletas)</SelectItem>
                                <SelectItem value="B">Clase B (Automóviles)</SelectItem>
                                <SelectItem value="C">Clase C (Camiones)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="inactive">Inactivo</SelectItem>
                                <SelectItem value="suspended">Suspendido</SelectItem>
                                <SelectItem value="on_leave">De Licencia</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="licenseExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Expiración de Licencia</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: es }) : "Seleccionar fecha"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => field.onChange(date)}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hireDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Contratación</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: es }) : "Seleccionar fecha"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => field.onChange(date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección</FormLabel>
                            <FormControl>
                              <Input placeholder="Av. San Martín 1234, Buenos Aires" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1" disabled={createDriverMutation.isPending}>
                        {createDriverMutation.isPending ? "Agregando..." : "Agregar Conductor"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateDialogOpen(false);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* License Expiry Alert */}
          {expiringLicenses.length > 0 && (
            <Card className="rounded-xl shadow-sm border border-warning-amber bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-warning-amber mr-3" />
                  <div>
                    <h3 className="font-semibold text-warning-amber">Licencias por Expirar</h3>
                    <p className="text-sm text-yellow-700">
                      {expiringLicenses.length} licencia{expiringLicenses.length > 1 ? 's' : ''} expira{expiringLicenses.length === 1 ? '' : 'n'} en los próximos 30 días
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o número de licencia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
                <SelectItem value="suspended">Suspendido</SelectItem>
                <SelectItem value="on_leave">De Licencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Drivers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredDrivers.map((driver: Driver) => {
                const licenseStatus = driver.license_expiry ? getLicenseStatus(driver.license_expiry) : null;
                
                return (
                  <Card key={driver.id} className="rounded-xl shadow-sm border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <UserCog className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{driver.name}</CardTitle>
                            <p className="text-sm text-gray-500">Licencia {driver.license_class}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(driver.status)}>
                          {getStatusLabel(driver.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Contact Information */}
                        {driver.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="truncate">{driver.email}</span>
                          </div>
                        )}
                        {driver.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{driver.phone}</span>
                          </div>
                        )}

                        {/* License Information */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Licencia:</span>
                            <span>{driver.license_number}</span>
                          </div>
                          {licenseStatus && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">Estado:</span>
                              <div className="flex items-center">
                                <licenseStatus.icon className={`w-3 h-3 mr-1 ${licenseStatus.color}`} />
                                <span className={licenseStatus.color}>{licenseStatus.label}</span>
                              </div>
                            </div>
                          )}
                          {driver.license_expiry && (
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Expira:</span>
                              <span>{format(new Date(driver.license_expiry), "dd/MM/yyyy", { locale: es })}</span>
                            </div>
                          )}
                        </div>

                        {/* Hire Date */}
                        {driver.hire_date && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Contratado:</span>
                            <span>{format(new Date(driver.hire_date), "dd/MM/yyyy", { locale: es })}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="text-logistics-blue hover:text-blue-700">
                            Asignar Vehículo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {filteredDrivers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <UserCog className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay conductores</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" ? "No se encontraron conductores con los filtros aplicados" : "Comienza agregando tu primer conductor"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-agro-primary hover:bg-agro-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Conductor
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}