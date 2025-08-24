import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Wrench, Plus, Search, Filter, Calendar, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Maintenance, InsertMaintenance } from "@shared/schema";
import { insertMaintenanceSchema } from "@shared/schema";

export default function MaintenancePage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: maintenance = [], isLoading } = useQuery({
    queryKey: ["/api/maintenance"],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: InsertMaintenance) => apiRequest("POST", "/api/maintenance", data),
    onSuccess: () => {
      toast({
        title: "Mantenimiento programado",
        description: "La orden de mantenimiento ha sido creada",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la orden de mantenimiento",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertMaintenance>({
    resolver: zodResolver(insertMaintenanceSchema),
    defaultValues: {
      vehicleId: "",
      type: "preventive",
      description: "",
      scheduledDate: format(new Date(), "yyyy-MM-dd"),
      cost: "0",
      status: "scheduled",
      priority: "normal",
      serviceProvider: "",
    },
  });

  const onSubmit = (data: InsertMaintenance) => {
    createMaintenanceMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-logistics-blue text-white";
      case "in_progress":
        return "bg-warning-amber text-white";
      case "completed":
        return "bg-success-green text-white";
      case "cancelled":
        return "bg-gray-400 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programado";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-success-green";
      case "normal":
        return "text-gray-600";
      case "high":
        return "text-warning-amber";
      case "critical":
        return "text-alert-red";
      default:
        return "text-gray-600";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "preventive":
        return Clock;
      case "corrective":
        return Wrench;
      case "inspection":
        return CheckCircle;
      default:
        return Wrench;
    }
  };

  const filteredMaintenance = Array.isArray(maintenance) ? maintenance.filter((item: Maintenance) => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
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
              <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
              <p className="text-gray-600">Programación y seguimiento de mantenimientos preventivos y correctivos</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-agro-primary hover:bg-agro-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Programar Mantenimiento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nueva Orden de Mantenimiento</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="vehicleId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehículo</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar vehículo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(vehicles) && vehicles.map((vehicle: any) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    {vehicle.plate} - {vehicle.type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Mantenimiento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="preventive">Preventivo</SelectItem>
                                <SelectItem value="corrective">Correctivo</SelectItem>
                                <SelectItem value="inspection">Inspección</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Cambio de aceite y filtros, revisión de frenos..."
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha Programada</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridad</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Baja</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="critical">Crítica</SelectItem>
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
                        name="serviceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proveedor de Servicio</FormLabel>
                            <FormControl>
                              <Input placeholder="Taller Mecánico XYZ" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Costo Estimado</FormLabel>
                            <FormControl>
                              <Input placeholder="0.00" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">Programar Mantenimiento</Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por descripción..."
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
                <SelectItem value="scheduled">Programado</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Maintenance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredMaintenance.map((item: Maintenance) => {
                const TypeIcon = getTypeIcon(item.type);
                const priorityColor = getPriorityColor(item.priority);
                
                return (
                  <Card key={item.id} className="rounded-xl shadow-sm border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{item.type === 'preventive' ? 'Preventivo' : item.type === 'corrective' ? 'Correctivo' : 'Inspección'}</CardTitle>
                            <p className="text-sm text-gray-500">#{item.id.slice(-8)}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Description */}
                        <p className="text-sm text-gray-700 line-clamp-2">{item.description}</p>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Fecha:</span>
                            <p className="font-medium">
                              {item.scheduledDate ? format(new Date(item.scheduledDate), "dd/MM/yyyy", { locale: es }) : "No programada"}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Prioridad:</span>
                            <p className={`font-medium ${priorityColor}`}>
                              {item.priority === 'low' ? 'Baja' : 
                               item.priority === 'normal' ? 'Normal' : 
                               item.priority === 'high' ? 'Alta' : 'Crítica'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Costo:</span>
                            <p className="font-medium">${item.cost || "0.00"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Proveedor:</span>
                            <p className="font-medium text-xs truncate">{item.serviceProvider || "No asignado"}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            Ver Detalles
                          </Button>
                          {item.status === "scheduled" && (
                            <Button size="sm" className="bg-agro-primary hover:bg-agro-primary/90">
                              Iniciar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {filteredMaintenance.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay mantenimientos programados</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" ? "No se encontraron mantenimientos con los filtros aplicados" : "Comienza programando tu primer mantenimiento"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-agro-primary hover:bg-agro-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Programar Mantenimiento
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