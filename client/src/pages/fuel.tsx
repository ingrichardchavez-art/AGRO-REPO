import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Fuel, Plus, Search, TrendingUp, TrendingDown, BarChart3, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { FuelLog, InsertFuelLog } from "@shared/schema";
import { insertFuelLogSchema } from "@shared/schema";

export default function FuelPage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fuelLogs = [], isLoading } = useQuery({
    queryKey: ["/api/fuel"],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["/api/drivers"],
  });

  const createFuelLogMutation = useMutation({
    mutationFn: async (data: InsertFuelLog) => apiRequest("/api/fuel", "POST", data),
    onSuccess: () => {
      toast({
        title: "Carga de combustible registrada",
        description: "El registro de combustible ha sido agregado",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/fuel"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar la carga de combustible",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertFuelLog>({
    resolver: zodResolver(insertFuelLogSchema),
    defaultValues: {
      vehicleId: "",
      driverId: "",
      liters: "0",
      costPerLiter: "0",
      totalCost: "0",
      fuelStation: "",
      receiptNumber: "",
      filledAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const watchedLiters = form.watch("liters");
  const watchedCostPerLiter = form.watch("costPerLiter");

  // Calculate total cost automatically
  React.useEffect(() => {
    const liters = parseFloat(watchedLiters) || 0;
    const costPerLiter = parseFloat(watchedCostPerLiter) || 0;
    const totalCost = (liters * costPerLiter).toFixed(2);
    form.setValue("totalCost", totalCost);
  }, [watchedLiters, watchedCostPerLiter, form]);

  const onSubmit = (data: InsertFuelLog) => {
    createFuelLogMutation.mutate(data);
  };

  const filteredFuelLogs = Array.isArray(fuelLogs) ? fuelLogs.filter((log: FuelLog) => {
    const matchesSearch = log.fuelStation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVehicle = vehicleFilter === "all" || log.vehicleId === vehicleFilter;
    return matchesSearch && matchesVehicle;
  }) : [];

  // Calculate fuel analytics
  const totalSpent = Array.isArray(fuelLogs) ? fuelLogs.reduce((sum: number, log: FuelLog) => 
    sum + (parseFloat(log.totalCost) || 0), 0
  ) : 0;

  const totalLiters = Array.isArray(fuelLogs) ? fuelLogs.reduce((sum: number, log: FuelLog) => 
    sum + (parseFloat(log.liters) || 0), 0
  ) : 0;

  const averageCostPerLiter = totalLiters > 0 ? totalSpent / totalLiters : 0;

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
              <h1 className="text-2xl font-bold text-gray-900">Combustible</h1>
              <p className="text-gray-600">Registro y seguimiento de cargas de combustible</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-agro-primary hover:bg-agro-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Carga
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nueva Carga de Combustible</DialogTitle>
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
                        name="driverId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conductor</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar conductor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(drivers) && drivers.map((driver: any) => (
                                  <SelectItem key={driver.id} value={driver.id}>
                                    {driver.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="liters"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Litros</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="45.50" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="costPerLiter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio por Litro</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="1.45" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="totalCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="65.98" 
                                readOnly
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fuelStation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estación de Servicio</FormLabel>
                            <FormControl>
                              <Input placeholder="YPF - Ruta 9 Km 45" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="receiptNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Ticket</FormLabel>
                            <FormControl>
                              <Input placeholder="T001234567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="odometer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Odómetro (km)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="125000" 
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="filledAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha y Hora</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field}
                                value={field.value || ""}
                                onChange={e => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">Registrar Carga</Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Fuel className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Gastado</p>
                    <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Total Litros</p>
                    <p className="text-2xl font-bold text-gray-900">{totalLiters.toFixed(1)} L</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Precio Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">${averageCostPerLiter.toFixed(2)}/L</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por estación o número de ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vehículos</SelectItem>
                {Array.isArray(vehicles) && vehicles.map((vehicle: any) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fuel Log List */}
          <div className="space-y-4">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredFuelLogs.map((log: FuelLog) => (
                <Card key={log.id} className="rounded-xl shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Fuel className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{log.fuelStation || "Estación no especificada"}</h3>
                          <p className="text-sm text-gray-500">
                            {log.filledAt ? format(new Date(log.filledAt), "PPpp", { locale: es }) : "Fecha no especificada"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-6 text-right">
                        <div>
                          <p className="text-sm text-gray-500">Litros</p>
                          <p className="font-semibold">{log.liters} L</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Precio/L</p>
                          <p className="font-semibold">${log.costPerLiter}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-lg font-bold text-green-600">${log.totalCost}</p>
                        </div>
                      </div>
                    </div>
                    {log.receiptNumber && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          Ticket: <span className="font-medium">{log.receiptNumber}</span>
                          {log.odometer && <span className="ml-4">Odómetro: <span className="font-medium">{log.odometer.toLocaleString()} km</span></span>}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {filteredFuelLogs.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Fuel className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay registros de combustible</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || vehicleFilter !== "all" ? "No se encontraron registros con los filtros aplicados" : "Comienza registrando tu primera carga de combustible"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-agro-primary hover:bg-agro-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Carga
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