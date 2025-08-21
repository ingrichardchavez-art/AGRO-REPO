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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, Search, Filter, Calendar as CalendarIcon, Clock, MapPin, User, Thermometer, Weight } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Order, InsertOrder, Client } from "@shared/schema";
import { insertOrderSchema } from "@shared/schema";
import { es } from "date-fns/locale";

export default function Orders() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: InsertOrder) => apiRequest("/api/orders", "POST", data),
    onSuccess: () => {
      toast({
        title: "Pedido creado",
        description: "El pedido ha sido creado exitosamente",
      });
      setIsCreateDialogOpen(false);
      setCreateStep(1);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el pedido",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      clientId: "",
      clientName: "",
      products: [{ name: "", quantity: 1, unit: "kg" }],
      priority: "normal",
      status: "pending",
      pickupAddress: "",
      deliveryAddress: "",
      specialInstructions: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const onSubmit = (data: InsertOrder) => {
    // Calculate total weight
    const totalWeight = data.products.reduce((sum, product) => 
      sum + (typeof product.quantity === 'number' ? product.quantity : parseFloat(product.quantity.toString())), 0
    );

    createOrderMutation.mutate({
      ...data,
      totalWeight: totalWeight.toString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success-green text-white";
      case "in_transit":
        return "bg-logistics-blue text-white";
      case "pending":
        return "bg-warning-amber text-white";
      case "assigned":
        return "bg-gray-500 text-white";
      case "cancelled":
        return "bg-alert-red text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "in_transit":
        return "En tránsito";
      case "pending":
        return "Pendiente";
      case "assigned":
        return "Asignado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-alert-red";
      case "high":
        return "text-warning-amber";
      default:
        return "text-gray-500";
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter((order: Order) => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleStepNext = () => {
    if (createStep < 3) setCreateStep(createStep + 1);
  };

  const handleStepBack = () => {
    if (createStep > 1) setCreateStep(createStep - 1);
  };

  const resetForm = () => {
    form.reset();
    setCreateStep(1);
    setIsCreateDialogOpen(false);
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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
              <p className="text-gray-600">Formulario en 3 pasos: Información → Productos → Programación</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-agro-primary hover:bg-agro-primary/90"
                  data-testid="button-add-order"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Nuevo Pedido</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${createStep >= 1 ? 'bg-agro-primary' : 'bg-gray-300'}`} />
                      <div className={`w-2 h-2 rounded-full ${createStep >= 2 ? 'bg-agro-primary' : 'bg-gray-300'}`} />
                      <div className={`w-2 h-2 rounded-full ${createStep >= 3 ? 'bg-agro-primary' : 'bg-gray-300'}`} />
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Step 1: Información */}
                    {createStep === 1 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Paso 1: Información del Cliente</h3>
                        <FormField
                          control={form.control}
                          name="clientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cliente</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  const client = Array.isArray(clients) ? clients.find((c: Client) => c.id === value) : null;
                                  if (client) {
                                    form.setValue("clientName", client.name);
                                  }
                                }}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-client">
                                    <SelectValue placeholder="Seleccionar cliente" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Array.isArray(clients) && clients.map((client: Client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name} - {client.clientType}
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
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prioridad</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="pickupAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dirección de Recogida</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Dirección completa..." {...field} data-testid="input-pickup" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="deliveryAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dirección de Entrega</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Dirección completa..." {...field} data-testid="input-delivery" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button type="button" onClick={handleStepNext}>Siguiente</Button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Productos */}
                    {createStep === 2 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Paso 2: Productos</h3>
                        {fields.map((field, index) => (
                          <Card key={field.id} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name={`products.${index}.name`}
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Producto {index + 1}</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nombre del producto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`products.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cantidad</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`products.${index}.unit`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Unidad</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="kg">Kg</SelectItem>
                                        <SelectItem value="ton">Ton</SelectItem>
                                        <SelectItem value="units">Unidades</SelectItem>
                                        <SelectItem value="boxes">Cajas</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            {fields.length > 1 && (
                              <div className="mt-2 flex justify-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  className="text-alert-red"
                                >
                                  Eliminar
                                </Button>
                              </div>
                            )}
                          </Card>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => append({ name: "", quantity: 1, unit: "kg" })}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Producto
                        </Button>
                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={handleStepBack}>Atrás</Button>
                          <Button type="button" onClick={handleStepNext}>Siguiente</Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Programación */}
                    {createStep === 3 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Paso 3: Programación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="scheduledPickup"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha de Recogida</FormLabel>
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
                                      onSelect={field.onChange}
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
                            name="scheduledDelivery"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fecha de Entrega</FormLabel>
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
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="specialInstructions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instrucciones Especiales</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Instrucciones de manejo, temperatura, etc..." 
                                  {...field} 
                                  data-testid="input-instructions"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={handleStepBack}>Atrás</Button>
                          <div className="space-x-2">
                            <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                            <Button type="submit">Crear Pedido</Button>
                          </div>
                        </div>
                      </div>
                    )}
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
                placeholder="Buscar por cliente o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="assigned">Asignado</SelectItem>
                <SelectItem value="in_transit">En tránsito</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredOrders.map((order: Order) => {
                const products = Array.isArray(order.products) ? order.products : [];
                
                return (
                  <Card key={order.id} className="rounded-xl shadow-sm border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg" data-testid={`order-client-${order.id}`}>
                          {order.clientName}
                        </CardTitle>
                        <Badge className={getStatusColor(order.status)} data-testid={`order-status-${order.id}`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      {order.priority && order.priority !== "normal" && (
                        <div className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
                          Prioridad: {order.priority === "critical" ? "Crítica" : order.priority === "high" ? "Alta" : "Baja"}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Products Summary */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <Package className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium">Productos ({products.length})</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {products.slice(0, 2).map((product: any, index: number) => (
                              <div key={index} className="flex justify-between">
                                <span>{product.name}</span>
                                <span>{product.quantity} {product.unit}</span>
                              </div>
                            ))}
                            {products.length > 2 && (
                              <div className="text-gray-500 mt-1">+{products.length - 2} productos más</div>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">Entrega:</p>
                              <p className="text-gray-600 truncate">{order.deliveryAddress}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Weight className="w-4 h-4 mr-2 text-gray-500" />
                            <span>Peso total: {order.totalWeight || 0} kg</span>
                          </div>
                          {order.scheduledDelivery && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-gray-500" />
                              <span>Programado: {format(new Date(order.scheduledDelivery), "dd/MM/yyyy", { locale: es })}</span>
                            </div>
                          )}
                        </div>

                        {/* Special Instructions */}
                        {order.specialInstructions && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-start">
                              <Thermometer className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
                              <div className="text-sm">
                                <p className="font-medium text-blue-700">Instrucciones Especiales:</p>
                                <p className="text-blue-600">{order.specialInstructions}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            data-testid={`button-edit-order-${order.id}`}
                          >
                            Ver Detalles
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-logistics-blue hover:text-blue-700"
                            data-testid={`button-track-order-${order.id}`}
                          >
                            <MapPin className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {filteredOrders.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay pedidos</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== "all" ? "No se encontraron pedidos con los filtros aplicados" : "Comienza creando tu primer pedido"}
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-agro-primary hover:bg-agro-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Pedido
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