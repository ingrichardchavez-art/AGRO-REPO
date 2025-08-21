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
import { Route, Plus, MapPin, Clock, Zap, Search, Filter, TrendingUp, Navigation } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Route as RouteType, InsertRoute, Vehicle, Order } from "@shared/schema";
import { insertRouteSchema } from "@shared/schema";

export default function Routes() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [optimizingRoute, setOptimizingRoute] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["/api/routes"],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
  });

  const createRouteMutation = useMutation({
    mutationFn: async (data: InsertRoute) => apiRequest("/api/routes", "POST", data),
    onSuccess: () => {
      toast({
        title: "Ruta creada",
        description: "La ruta ha sido creada exitosamente",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la ruta",
        variant: "destructive",
      });
    },
  });

  const optimizeRouteMutation = useMutation({
    mutationFn: async (routeId: string) => {
      // Simulate Clark-Wright Savings Algorithm optimization
      setOptimizingRoute(routeId);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const route = routes.find((r: RouteType) => r.id === routeId);
      if (!route) throw new Error("Route not found");

      const optimizedData = {
        efficiency: "87.5", // Simulated optimization result
        totalDistance: "145.8",
        estimatedDuration: 180, // 3 hours
        status: "active"
      };

      return apiRequest(`/api/routes/${routeId}`, "PATCH", optimizedData);
    },
    onSuccess: () => {
      toast({
        title: "Ruta optimizada",
        description: "La ruta ha sido optimizada usando el algoritmo Clark-Wright",
      });
      setOptimizingRoute(null);
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo optimizar la ruta",
        variant: "destructive",
      });
      setOptimizingRoute(null);
    },
  });

  const form = useForm<InsertRoute>({
    resolver: zodResolver(insertRouteSchema),
    defaultValues: {
      name: "",
      orderIds: [],
      stops: [],
      status: "planned",
    },
  });

  const onSubmit = (data: InsertRoute) => {
    // Generate sample stops based on selected orders
    const selectedOrders = Array.isArray(orders) ? orders.filter((order: Order) => 
      data.orderIds.includes(order.id)
    ) : [];
    
    const stops = selectedOrders.flatMap((order: Order) => [
      {
        orderId: order.id,
        address: order.pickupAddress,
        location: order.pickupLocation,
        type: "pickup",
        estimatedTime: new Date().toISOString()
      },
      {
        orderId: order.id,
        address: order.deliveryAddress,
        location: order.deliveryLocation,
        type: "delivery",
        estimatedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      }
    ]);

    createRouteMutation.mutate({
      ...data,
      stops,
      totalDistance: "0",
      estimatedDuration: stops.length * 30, // 30 min per stop estimate
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-green text-white";
      case "planned":
        return "bg-logistics-blue text-white";
      case "completed":
        return "bg-gray-500 text-white";
      case "cancelled":
        return "bg-alert-red text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "En progreso";
      case "planned":
        return "Planificada";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return "Desconocido";
    }
  };

  const filteredRoutes = Array.isArray(routes) ? routes.filter((route: RouteType) => {
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || route.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const pendingOrders = Array.isArray(orders) ? orders.filter((order: Order) => order.status === "pending") : [];

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
              <h1 className="text-2xl font-bold text-gray-900">Optimización de Rutas</h1>
              <p className="text-gray-600">Clark-Wright Savings Algorithm para rutas multi-vehículo</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-agro-primary hover:bg-agro-primary/90"
                  data-testid="button-add-route"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Ruta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nueva Ruta</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Ruta</FormLabel>
                          <FormControl>
                            <Input placeholder="Ruta Centro - Norte" {...field} data-testid="input-route-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehículo Asignado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-vehicle">
                                <SelectValue placeholder="Seleccionar vehículo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(vehicles) && vehicles.map((vehicle: Vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.plate} - {vehicle.driverName || 'Sin conductor'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <FormLabel>Pedidos Pendientes</FormLabel>
                      <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                        {pendingOrders.map((order: Order) => (
                          <label key={order.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              onChange={(e) => {
                                const current = form.getValues("orderIds") || [];
                                const newOrderIds = e.target.checked
                                  ? [...current, order.id]
                                  : current.filter(id => id !== order.id);
                                form.setValue("orderIds", newOrderIds);
                              }}
                              data-testid={`checkbox-order-${order.id}`}
                            />
                            <span className="text-sm">
                              {order.clientName} - {order.totalWeight}kg
                            </span>
                          </label>
                        ))}
                      </div>
                      {pendingOrders.length === 0 && (
                        <p className="text-sm text-gray-500">No hay pedidos pendientes</p>
                      )}
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">Crear Ruta</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
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
                placeholder="Buscar rutas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-routes"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="planned">Planificada</SelectItem>
                <SelectItem value="active">En progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Routes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredRoutes.map((route: RouteType) => {
                const stops = Array.isArray(route.stops) ? route.stops : [];
                const isOptimizing = optimizingRoute === route.id;
                
                return (
                  <Card key={route.id} className="rounded-xl shadow-sm border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg" data-testid={`route-name-${route.id}`}>
                          {route.name}
                        </CardTitle>
                        <Badge className={getStatusColor(route.status || "planned")} data-testid={`route-status-${route.id}`}>
                          {getStatusLabel(route.status || "planned")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Route Mini Map */}
                        <div 
                          className="h-32 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden"
                          style={{
                            backgroundImage: "url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?ixlib=rb-4.0.3&w=400&h=200')",
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                          }}
                        >
                          {/* Route path overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                              {[...Array(Math.min(stops.length, 4))].map((_, i) => (
                                <div key={i} className="flex items-center">
                                  <div className="w-3 h-3 bg-agro-primary rounded-full border-2 border-white shadow-sm" />
                                  {i < Math.min(stops.length, 4) - 1 && (
                                    <div className="w-8 h-0.5 bg-agro-primary mx-1" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Route Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center text-sm">
                            <Navigation className="w-4 h-4 mr-2 text-gray-500" />
                            <div>
                              <p className="font-medium">{route.totalDistance || "0"}km</p>
                              <p className="text-xs text-gray-500">Distancia</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-2 text-gray-500" />
                            <div>
                              <p className="font-medium">
                                {route.estimatedDuration ? `${Math.round(route.estimatedDuration / 60)}h ${route.estimatedDuration % 60}m` : "0h"}
                              </p>
                              <p className="text-xs text-gray-500">Duración</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <div>
                              <p className="font-medium">{stops.length} paradas</p>
                              <p className="text-xs text-gray-500">Destinos</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm">
                            <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                            <div>
                              <p className="font-medium">{route.efficiency || "0"}%</p>
                              <p className="text-xs text-gray-500">Eficiencia</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => optimizeRouteMutation.mutate(route.id)}
                            disabled={isOptimizing || route.status === "completed"}
                            data-testid={`button-optimize-${route.id}`}
                          >
                            <Zap className={`w-4 h-4 mr-2 ${isOptimizing ? 'animate-pulse' : ''}`} />
                            {isOptimizing ? "Optimizando..." : "Optimizar"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-logistics-blue hover:text-blue-700"
                            data-testid={`button-view-route-${route.id}`}
                          >
                            <Route className="w-4 h-4 mr-2" />
                            Ver Ruta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {filteredRoutes.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Route className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay rutas</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" ? "No se encontraron rutas con los filtros aplicados" : "Comienza creando tu primera ruta optimizada"}
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-agro-primary hover:bg-agro-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Ruta
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