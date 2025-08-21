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
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Edit, Plus, Truck, MapPin, Fuel, Thermometer, Search, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle, InsertVehicle } from "@shared/schema";
import { insertVehicleSchema } from "@shared/schema";

export default function Fleet() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: InsertVehicle) => apiRequest("/api/vehicles", "POST", data),
    onSuccess: () => {
      toast({
        title: "Vehículo creado",
        description: "El vehículo ha sido creado exitosamente",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el vehículo",
        variant: "destructive",
      });
    },
  });

  const updateVehicleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      apiRequest(`/api/vehicles/${id}`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Vehículo actualizado",
        description: "El vehículo ha sido actualizado exitosamente",
      });
      setEditingVehicle(null);
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el vehículo",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      plate: "",
      type: "truck",
      capacity: "0",
      currentLoad: "0",
      status: "idle",
      driverName: "",
      fuelLevel: "100",
    },
  });

  const onSubmit = (data: InsertVehicle) => {
    if (editingVehicle) {
      updateVehicleMutation.mutate({ id: editingVehicle.id, data });
    } else {
      createVehicleMutation.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-green text-white";
      case "warning":
        return "bg-warning-amber text-white";
      case "idle":
        return "bg-gray-400 text-white";
      case "maintenance":
        return "bg-alert-red text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "En ruta";
      case "warning":
        return "Retraso";
      case "idle":
        return "Inactivo";
      case "maintenance":
        return "Mantenimiento";
      default:
        return "Desconocido";
    }
  };

  const calculateCapacityPercentage = (vehicle: Vehicle) => {
    const capacity = parseFloat(vehicle.capacity || "0");
    const currentLoad = parseFloat(vehicle.currentLoad || "0");
    return capacity > 0 ? (currentLoad / capacity) * 100 : 0;
  };

  const filteredVehicles = Array.isArray(vehicles) ? vehicles.filter((vehicle: Vehicle) => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.driverName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      plate: vehicle.plate,
      type: vehicle.type,
      capacity: vehicle.capacity,
      currentLoad: vehicle.currentLoad || "0",
      status: vehicle.status,
      driverName: vehicle.driverName || "",
      fuelLevel: vehicle.fuelLevel || "100",
      temperature: vehicle.temperature || "",
    });
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Flota</h1>
              <p className="text-gray-600">CRUD completo de vehículos con validación de capacidades</p>
            </div>
            <Dialog open={isCreateDialogOpen || !!editingVehicle} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) setEditingVehicle(null);
            }}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-agro-primary hover:bg-agro-primary/90"
                  data-testid="button-add-vehicle"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Vehículo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingVehicle ? "Editar Vehículo" : "Nuevo Vehículo"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="plate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placa</FormLabel>
                          <FormControl>
                            <Input placeholder="ABC-123" {...field} data-testid="input-plate" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="truck">Camión</SelectItem>
                              <SelectItem value="van">Camioneta</SelectItem>
                              <SelectItem value="refrigerated">Refrigerado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidad (Ton)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} data-testid="input-capacity" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="driverName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conductor</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del conductor" {...field} data-testid="input-driver" />
                          </FormControl>
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
                              <SelectTrigger data-testid="select-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="idle">Inactivo</SelectItem>
                              <SelectItem value="active">En ruta</SelectItem>
                              <SelectItem value="warning">Retraso</SelectItem>
                              <SelectItem value="maintenance">Mantenimiento</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingVehicle ? "Actualizar" : "Crear"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          setEditingVehicle(null);
                        }}
                      >
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
                placeholder="Buscar por placa o conductor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-vehicles"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">En ruta</SelectItem>
                <SelectItem value="idle">Inactivo</SelectItem>
                <SelectItem value="warning">Retraso</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredVehicles.map((vehicle: Vehicle) => {
                const capacityPercentage = calculateCapacityPercentage(vehicle);
                const isOverCapacity = capacityPercentage > 100;
                
                return (
                  <Card key={vehicle.id} className="rounded-xl shadow-sm border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg" data-testid={`vehicle-plate-${vehicle.id}`}>
                              {vehicle.plate}
                            </CardTitle>
                            <p className="text-sm text-gray-500 capitalize">{vehicle.type}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(vehicle.status)} data-testid={`vehicle-status-${vehicle.id}`}>
                          {getStatusLabel(vehicle.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Driver */}
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">Conductor:</span>
                          <span className="ml-2">{vehicle.driverName || "Sin asignar"}</span>
                        </div>

                        {/* Capacity */}
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-gray-600">Capacidad</span>
                            <span data-testid={`vehicle-capacity-${vehicle.id}`}>
                              {vehicle.currentLoad}/{vehicle.capacity} Ton
                            </span>
                          </div>
                          <Progress value={Math.min(capacityPercentage, 100)} className="h-2" />
                          {isOverCapacity && (
                            <p className="text-xs text-alert-red mt-1">
                              Capacidad excedida ({capacityPercentage.toFixed(1)}%)
                            </p>
                          )}
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Fuel className="w-4 h-4 mr-2" />
                            <span>{vehicle.fuelLevel || 0}%</span>
                          </div>
                          {vehicle.temperature && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Thermometer className="w-4 h-4 mr-2" />
                              <span>{vehicle.temperature}°C</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditDialog(vehicle)}
                            data-testid={`button-edit-${vehicle.id}`}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-logistics-blue hover:text-blue-700"
                            data-testid={`button-location-${vehicle.id}`}
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Ubicación
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {filteredVehicles.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay vehículos</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" ? "No se encontraron vehículos con los filtros aplicados" : "Comienza agregando tu primer vehículo"}
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-agro-primary hover:bg-agro-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Vehículo
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