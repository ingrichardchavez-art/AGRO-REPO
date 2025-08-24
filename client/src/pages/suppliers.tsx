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
import { Building2, Plus, Search, Filter, Phone, Mail, MapPin, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Supplier, InsertSupplier } from "@shared/schema";
import { insertSupplierSchema } from "@shared/schema";

export default function SuppliersPage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertSupplier) => apiRequest("POST", "/api/suppliers", data),
    onSuccess: () => {
      toast({
        title: "Proveedor agregado",
        description: "El proveedor ha sido agregado exitosamente",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el proveedor",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertSupplier>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      type: "parts",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
      rating: 5,
      paymentTerms: "30 días",
    },
  });

  const onSubmit = (data: InsertSupplier) => {
    createSupplierMutation.mutate(data);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fuel":
        return "bg-warning-amber text-white";
      case "parts":
        return "bg-logistics-blue text-white";
      case "maintenance":
        return "bg-success-green text-white";
      case "insurance":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "fuel":
        return "Combustible";
      case "parts":
        return "Repuestos";
      case "maintenance":
        return "Mantenimiento";
      case "insurance":
        return "Seguros";
      default:
        return "Otro";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-green text-white";
      case "inactive":
        return "bg-gray-400 text-white";
      case "suspended":
        return "bg-alert-red text-white";
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
      default:
        return "Desconocido";
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter((supplier: Supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || supplier.type === typeFilter;
    return matchesSearch && matchesType;
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
              <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
              <p className="text-gray-600">Gestión de proveedores de servicios y suministros</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-agro-primary hover:bg-agro-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nuevo Proveedor</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de la Empresa</FormLabel>
                            <FormControl>
                              <Input placeholder="Talleres García SRL" {...field} />
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
                            <FormLabel>Tipo de Proveedor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="fuel">Combustible</SelectItem>
                                <SelectItem value="parts">Repuestos</SelectItem>
                                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                                <SelectItem value="insurance">Seguros</SelectItem>
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
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Persona de Contacto</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan García" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calificación (1-5)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">⭐ 1 Estrella</SelectItem>
                                <SelectItem value="2">⭐⭐ 2 Estrellas</SelectItem>
                                <SelectItem value="3">⭐⭐⭐ 3 Estrellas</SelectItem>
                                <SelectItem value="4">⭐⭐⭐⭐ 4 Estrellas</SelectItem>
                                <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Estrellas</SelectItem>
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contacto@talleresgarcia.com" {...field} />
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

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Av. Libertador 1234, Capital Federal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentTerms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Términos de Pago</FormLabel>
                            <FormControl>
                              <Input placeholder="30 días" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contractStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inicio de Contrato (opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field}
                                value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                                onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contractEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fin de Contrato (opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field}
                                value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                                onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">Agregar Proveedor</Button>
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
                placeholder="Buscar por nombre o contacto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="fuel">Combustible</SelectItem>
                <SelectItem value="parts">Repuestos</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="insurance">Seguros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Suppliers Grid */}
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
              filteredSuppliers.map((supplier: Supplier) => (
                <Card key={supplier.id} className="rounded-xl shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{supplier.name}</CardTitle>
                          <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
                        </div>
                      </div>
                      <Badge className={getTypeColor(supplier.type)}>
                        {getTypeLabel(supplier.type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {renderStars(supplier.rating || 5)}
                        </div>
                        <span className="text-sm text-gray-500">({supplier.rating || 5}/5)</span>
                      </div>

                      {/* Contact Information */}
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{supplier.address}</span>
                        </div>
                      )}

                      {/* Status and Payment Terms */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Estado:</span>
                          <Badge className={getStatusColor(supplier.status)}>
                            {getStatusLabel(supplier.status)}
                          </Badge>
                        </div>
                        {supplier.paymentTerms && (
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Pago:</span>
                            <span>{supplier.paymentTerms}</span>
                          </div>
                        )}
                      </div>

                      {/* Contract Information */}
                      {(supplier.contractStart || supplier.contractEnd) && (
                        <div className="text-sm text-gray-500">
                          <p>Contrato:</p>
                          <p>
                            {supplier.contractStart ? format(new Date(supplier.contractStart), "dd/MM/yyyy", { locale: es }) : "Sin inicio"} - 
                            {supplier.contractEnd ? format(new Date(supplier.contractEnd), "dd/MM/yyyy", { locale: es }) : "Sin fin"}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-logistics-blue hover:text-blue-700">
                          Contactar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {filteredSuppliers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay proveedores</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || typeFilter !== "all" ? "No se encontraron proveedores con los filtros aplicados" : "Comienza agregando tu primer proveedor"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-agro-primary hover:bg-agro-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Proveedor
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