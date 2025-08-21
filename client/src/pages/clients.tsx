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
import { Users, Plus, Search, Filter, Mail, Phone, MapPin, Building, Star, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client, InsertClient } from "@shared/schema";
import { insertClientSchema } from "@shared/schema";

export default function Clients() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => apiRequest("/api/clients", "POST", data),
    onSuccess: () => {
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado exitosamente",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      clientType: "customer",
      priority: "normal",
    },
  });

  const onSubmit = (data: InsertClient) => {
    createClientMutation.mutate(data);
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case "supplier":
        return "bg-logistics-blue text-white";
      case "customer":
        return "bg-success-green text-white";
      case "distributor":
        return "bg-warning-amber text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case "supplier":
        return "Proveedor";
      case "customer":
        return "Cliente";
      case "distributor":
        return "Distribuidor";
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
      case "normal":
        return "text-gray-500";
      case "low":
        return "text-gray-400";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "critical":
        return "Crítica";
      case "high":
        return "Alta";
      case "normal":
        return "Normal";
      case "low":
        return "Baja";
      default:
        return "Normal";
    }
  };

  const getPriorityStars = (priority: string) => {
    const stars = {
      critical: 4,
      high: 3,
      normal: 2,
      low: 1,
    };
    return stars[priority as keyof typeof stars] || 2;
  };

  const filteredClients = Array.isArray(clients) ? clients.filter((client: Client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || client.clientType === typeFilter;
    const matchesPriority = priorityFilter === "all" || client.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  }) : [];

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    form.reset({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address,
      clientType: client.clientType,
      priority: client.priority || "normal",
    });
  };

  const resetForm = () => {
    form.reset();
    setEditingClient(null);
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
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
              <p className="text-gray-600">Administra proveedores, clientes y distribuidores</p>
            </div>
            <Dialog open={isCreateDialogOpen || !!editingClient} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) setEditingClient(null);
            }}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-agro-primary hover:bg-agro-primary/90"
                  data-testid="button-add-client"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Supermercado Central" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Cliente</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-client-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="customer">Cliente</SelectItem>
                              <SelectItem value="supplier">Proveedor</SelectItem>
                              <SelectItem value="distributor">Distribuidor</SelectItem>
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contacto@empresa.com" {...field} data-testid="input-email" />
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
                              <Input placeholder="+54 11 1234-5678" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Dirección completa..." {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingClient ? "Actualizar" : "Crear"}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
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
                placeholder="Buscar por nombre, email o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-clients"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-type">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="supplier">Proveedor</SelectItem>
                <SelectItem value="distributor">Distribuidor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-priority">
                <Star className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clients Grid */}
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
              filteredClients.map((client: Client) => (
                <Card key={client.id} className="rounded-xl shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid={`client-name-${client.id}`}>
                            {client.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={getClientTypeColor(client.clientType)} data-testid={`client-type-${client.id}`}>
                              {getClientTypeLabel(client.clientType)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <Star className={`w-4 h-4 mr-1 ${getPriorityColor(client.priority || "normal")}`} />
                      <span className={`text-sm font-medium ${getPriorityColor(client.priority || "normal")}`}>
                        Prioridad: {getPriorityLabel(client.priority || "normal")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Contact Information */}
                      {client.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                        <span className="text-gray-600 truncate">{client.address}</span>
                      </div>

                      {/* Priority Stars */}
                      <div className="flex items-center pt-2">
                        {[...Array(4)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 mr-1 ${
                              i < getPriorityStars(client.priority || "normal")
                                ? "text-warning-amber fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditDialog(client)}
                          data-testid={`button-edit-client-${client.id}`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-logistics-blue hover:text-blue-700"
                          data-testid={`button-contact-client-${client.id}`}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contactar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {filteredClients.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay clientes</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || typeFilter !== "all" || priorityFilter !== "all" 
                  ? "No se encontraron clientes con los filtros aplicados" 
                  : "Comienza agregando tu primer cliente"}
              </p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-agro-primary hover:bg-agro-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Cliente
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