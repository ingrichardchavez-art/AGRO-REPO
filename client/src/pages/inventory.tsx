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
import { AlertTriangle, Plus, Search, Filter, Package2, TrendingDown, TrendingUp, Edit, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Esquema para el formulario de creación
const createInventorySchema = z.object({
  product_name: z.string().min(1, "El nombre del producto es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  quantity: z.number().min(0, "La cantidad debe ser mayor o igual a 0"),
  unit: z.string().min(1, "La unidad es requerida"),
  price_per_unit: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  supplier: z.string().min(1, "El proveedor es requerido"),
  location: z.string().min(1, "La ubicación es requerida"),
});

type CreateInventoryData = z.infer<typeof createInventorySchema>;

// Interfaz para los items de inventario del servidor
interface InventoryItem {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  supplier: string;
  expiry_date: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export default function InventoryPage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: CreateInventoryData) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      toast({
        title: "Item agregado",
        description: "El item ha sido agregado al inventario",
      });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el item",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateInventoryData>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: {
      product_name: "",
      category: "frutas",
      quantity: 0,
      unit: "kg",
      price_per_unit: 0,
      supplier: "",
      location: "",
    },
  });

  const onSubmit = (data: CreateInventoryData) => {
    createItemMutation.mutate(data);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "frutas":
        return "bg-logistics-blue text-white";
      case "verduras":
        return "bg-success-green text-white";
      case "tuberculos":
        return "bg-warning-amber text-white";
      case "granos":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "frutas":
        return "Frutas";
      case "verduras":
        return "Verduras";
      case "tuberculos":
        return "Tubérculos";
      case "granos":
        return "Granos";
      default:
        return "Otro";
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    const quantity = item.quantity || 0;
    
    if (quantity <= 100) {
      return { status: "critical", label: "Crítico", color: "text-alert-red" };
    } else if (quantity <= 500) {
      return { status: "low", label: "Bajo", color: "text-warning-amber" };
    } else {
      return { status: "normal", label: "Normal", color: "text-success-green" };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredInventory = Array.isArray(inventory) ? inventory.filter((item: InventoryItem) => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) : [];

  const lowStockItems = Array.isArray(inventory) ? inventory.filter((item: InventoryItem) => 
    (item.quantity || 0) <= 100
  ) : [];

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
              <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
              <p className="text-gray-600">Gestión de productos agrícolas y suministros</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-agro-primary hover:bg-agro-primary/90"
                  data-testid="button-add-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuevo Producto de Inventario</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="product_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Producto</FormLabel>
                          <FormControl>
                            <Input placeholder="Banano Premium" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="frutas">Frutas</SelectItem>
                                <SelectItem value="verduras">Verduras</SelectItem>
                                <SelectItem value="tuberculos">Tubérculos</SelectItem>
                                <SelectItem value="granos">Granos</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unit"
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
                                <SelectItem value="kg">Kilogramos</SelectItem>
                                <SelectItem value="g">Gramos</SelectItem>
                                <SelectItem value="l">Litros</SelectItem>
                                <SelectItem value="un">Unidades</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price_per_unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio por Unidad</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proveedor</FormLabel>
                            <FormControl>
                              <Input placeholder="Finca La Esperanza" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ubicación</FormLabel>
                            <FormControl>
                              <Input placeholder="Bodega A - Sección 1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" className="flex-1">Agregar</Button>
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="rounded-xl shadow-sm border border-alert-red bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-alert-red mr-3" />
                  <div>
                    <h3 className="font-semibold text-alert-red">Alerta de Stock Bajo</h3>
                    <p className="text-sm text-red-700">
                      {lowStockItems.length} producto{lowStockItems.length > 1 ? 's' : ''} necesita{lowStockItems.length === 1 ? '' : 'n'} reposición
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
                placeholder="Buscar por nombre o proveedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="frutas">Frutas</SelectItem>
                <SelectItem value="verduras">Verduras</SelectItem>
                <SelectItem value="tuberculos">Tubérculos</SelectItem>
                <SelectItem value="granos">Granos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Grid */}
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
              filteredInventory.map((item: InventoryItem) => {
                const stockStatus = getStockStatus(item);
                const stockPercentage = Math.min((item.quantity / Math.max(item.quantity * 2, 1)) * 100, 100);
                
                return (
                  <Card key={item.id} className="rounded-xl shadow-sm border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package2 className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{item.product_name}</CardTitle>
                            <p className="text-sm text-gray-500">{item.supplier}</p>
                          </div>
                        </div>
                        <Badge className={getCategoryColor(item.category)}>
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Stock Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Stock</span>
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${stockStatus.color}`}>
                              {item.quantity} {item.unit}
                            </span>
                            {stockStatus.status === "low" && <TrendingDown className="w-3 h-3 ml-1 text-warning-amber" />}
                            {stockStatus.status === "critical" && <AlertTriangle className="w-3 h-3 ml-1 text-alert-red" />}
                          </div>
                        </div>

                        {/* Stock Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stockStatus.status === "critical" ? "bg-alert-red" :
                              stockStatus.status === "low" ? "bg-warning-amber" : "bg-success-green"
                            }`}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Precio:</span>
                            <p className="font-medium">${item.price_per_unit.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <p className="font-medium">${(item.quantity * item.price_per_unit).toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Ubicación:</span>
                            <p className="font-medium">{item.location || "No especificada"}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-500">Vencimiento:</span>
                            <p className="font-medium flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(item.expiry_date)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-2 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-agro-primary hover:text-green-700"
                          >
                            + Stock
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {filteredInventory.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos en inventario</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || categoryFilter !== "all" ? "No se encontraron productos con los filtros aplicados" : "Comienza agregando tu primer producto al inventario"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-agro-primary hover:bg-agro-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
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