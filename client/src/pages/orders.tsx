import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Search, Filter, Calendar, MapPin, Package, User, Truck, Clock, AlertCircle } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LogisticsAPI } from "@/lib/api";
import { createOrderSchema, type CreateOrder } from "@/lib/schemas";

export default function Orders() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener pedidos
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => LogisticsAPI.getOrders(),
  });

  // Obtener clientes
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => LogisticsAPI.getClients(),
  });

  // Obtener vehículos
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => LogisticsAPI.getVehicles(),
  });

  // Obtener conductores
  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => LogisticsAPI.getDrivers(),
  });

  // Mutación para crear pedido
  const createOrderMutation = useMutation({
    mutationFn: async (data: CreateOrder) => {
      const orderData = {
        ...data,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return LogisticsAPI.createOrder(orderData);
    },
    onSuccess: () => {
      toast({
        title: "Pedido creado",
        description: "El pedido se ha creado exitosamente",
      });
      setIsCreateDialogOpen(false);
      setCreateStep(1);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el pedido. Intente nuevamente.",
        variant: "destructive",
      });
      console.error("Error creating order:", error);
    },
  });

  const form = useForm<CreateOrder>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      client_id: "",
      client_name: "",
      pickup_address: "",
      delivery_address: "",
      priority: "medium",
      pickup_date: new Date(),
      delivery_date: new Date(),
      weight: 0,
      volume: 0,
      special_instructions: "",
      products: [{ name: "", quantity: 1, unit: "kg" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const onSubmit = (data: CreateOrder) => {
    // Calcular peso y volumen total
    const totalWeight = data.products.reduce((sum, product) => sum + product.quantity, 0);
    const totalVolume = data.products.reduce((sum, product) => sum + (product.quantity * 0.1), 0); // Estimación simple

    createOrderMutation.mutate({
      ...data,
      weight: totalWeight,
      volume: totalVolume,
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.pickup_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.delivery_address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in_transit": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendiente";
      case "assigned": return "Asignado";
      case "in_transit": return "En Tránsito";
      case "delivered": return "Entregado";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent": return "Urgente";
      case "high": return "Alta";
      case "medium": return "Media";
      case "low": return "Baja";
      default: return priority;
    }
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
              <p className="text-muted-foreground">
                Gestiona todos los pedidos y entregas del sistema
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Pedido</DialogTitle>
                  <DialogDescription>
                    Complete la información del pedido paso a paso
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={createStep.toString()} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="1" disabled={createStep < 1}>Cliente</TabsTrigger>
                    <TabsTrigger value="2" disabled={createStep < 2}>Direcciones</TabsTrigger>
                    <TabsTrigger value="3" disabled={createStep < 3}>Productos</TabsTrigger>
                    <TabsTrigger value="4" disabled={createStep < 4}>Confirmar</TabsTrigger>
                  </TabsList>

                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Paso 1: Cliente */}
                    <TabsContent value="1" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="client_id">Cliente</Label>
                          <Select
                            onValueChange={(value) => {
                              form.setValue("client_id", value);
                              const client = clients.find(c => c.id === value);
                              if (client) {
                                form.setValue("client_name", client.name);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Prioridad</Label>
                          <Select onValueChange={(value) => form.setValue("priority", value as any)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pickup_date">Fecha de Recogida</Label>
                          <Input
                            type="date"
                            {...form.register("pickup_date", { valueAsDate: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery_date">Fecha de Entrega</Label>
                          <Input
                            type="date"
                            {...form.register("delivery_date", { valueAsDate: true })}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={() => setCreateStep(2)}>
                          Siguiente
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Paso 2: Direcciones */}
                    <TabsContent value="2" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pickup_address">Dirección de Recogida</Label>
                          <Textarea
                            placeholder="Ingrese la dirección completa de recogida"
                            {...form.register("pickup_address")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery_address">Dirección de Entrega</Label>
                          <Textarea
                            placeholder="Ingrese la dirección completa de entrega"
                            {...form.register("delivery_address")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="special_instructions">Instrucciones Especiales</Label>
                          <Textarea
                            placeholder="Instrucciones adicionales para la entrega"
                            {...form.register("special_instructions")}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setCreateStep(1)}>
                          Anterior
                        </Button>
                        <Button type="button" onClick={() => setCreateStep(3)}>
                          Siguiente
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Paso 3: Productos */}
                    <TabsContent value="3" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Productos</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ name: "", quantity: 1, unit: "kg" })}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Producto
                          </Button>
                        </div>
                        {fields.map((field, index) => (
                          <div key={field.id} className="grid grid-cols-4 gap-4 items-end">
                            <div className="space-y-2">
                              <Label>Nombre del Producto</Label>
                              <Input
                                placeholder="Nombre del producto"
                                {...form.register(`products.${index}.name`)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Cantidad</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                placeholder="0.0"
                                {...form.register(`products.${index}.quantity`, { valueAsNumber: true })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Unidad</Label>
                              <Select
                                onValueChange={(value) => form.setValue(`products.${index}.unit`, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Unidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">Kilogramos</SelectItem>
                                  <SelectItem value="g">Gramos</SelectItem>
                                  <SelectItem value="l">Litros</SelectItem>
                                  <SelectItem value="ml">Mililitros</SelectItem>
                                  <SelectItem value="pcs">Piezas</SelectItem>
                                  <SelectItem value="box">Cajas</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              Eliminar
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setCreateStep(2)}>
                          Anterior
                        </Button>
                        <Button type="button" onClick={() => setCreateStep(4)}>
                          Siguiente
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Paso 4: Confirmar */}
                    <TabsContent value="4" className="space-y-4">
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Resumen del Pedido</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Cliente:</Label>
                                <p>{form.watch("client_name")}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Prioridad:</Label>
                                <Badge className={getPriorityColor(form.watch("priority"))}>
                                  {getPriorityText(form.watch("priority"))}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Fecha de Recogida:</Label>
                                <p>{form.watch("pickup_date") ? format(form.watch("pickup_date"), "dd/MM/yyyy") : ""}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Fecha de Entrega:</Label>
                                <p>{form.watch("delivery_date") ? format(form.watch("delivery_date"), "dd/MM/yyyy") : ""}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="font-semibold">Dirección de Recogida:</Label>
                              <p>{form.watch("pickup_address")}</p>
                            </div>
                            <div>
                              <Label className="font-semibold">Dirección de Entrega:</Label>
                              <p>{form.watch("delivery_address")}</p>
                            </div>
                            <div>
                              <Label className="font-semibold">Productos:</Label>
                              <div className="mt-2 space-y-2">
                                {form.watch("products")?.map((product, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span>{product.name}</span>
                                    <span className="text-sm text-gray-600">
                                      {product.quantity} {product.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setCreateStep(3)}>
                          Anterior
                        </Button>
                        <Button type="submit" disabled={createOrderMutation.isPending}>
                          {createOrderMutation.isPending ? "Creando..." : "Crear Pedido"}
                        </Button>
                      </div>
                    </TabsContent>
                  </form>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="assigned">Asignado</SelectItem>
                <SelectItem value="in_transit">En Tránsito</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de pedidos */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando pedidos...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay pedidos</h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "No se encontraron pedidos con los filtros aplicados"
                    : "Comience creando su primer pedido"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Pedido
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Pedido #{order.id?.slice(-8)}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {order.client_name}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {getPriorityText(order.priority)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">Recogida:</span>
                          <span className="truncate">{order.pickup_address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">Entrega:</span>
                          <span className="truncate">{order.delivery_address}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Recogida:</span>
                          <span>{order.pickup_date ? format(new Date(order.pickup_date), "dd/MM/yyyy") : "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Entrega:</span>
                          <span>{order.delivery_date ? format(new Date(order.delivery_date), "dd/MM/yyyy") : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {order.special_instructions && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Instrucciones Especiales</p>
                            <p className="text-sm text-blue-700">{order.special_instructions}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {order.weight && (
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{order.weight} kg</span>
                          </div>
                        )}
                        {order.volume && (
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            <span>{order.volume} m³</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}