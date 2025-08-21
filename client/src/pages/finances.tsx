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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, Search, Filter, TrendingUp, TrendingDown, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Expense, InsertExpense, Approval, InsertApproval } from "@shared/schema";
import { insertExpenseSchema, insertApprovalSchema } from "@shared/schema";

export default function FinancesPage() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
  });

  const { data: approvals = [], isLoading: approvalsLoading } = useQuery({
    queryKey: ["/api/approvals"],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: InsertExpense) => apiRequest("/api/expenses", "POST", data),
    onSuccess: () => {
      toast({
        title: "Gasto registrado",
        description: "El gasto ha sido agregado exitosamente",
      });
      setIsExpenseDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar el gasto",
        variant: "destructive",
      });
    },
  });

  const createApprovalMutation = useMutation({
    mutationFn: async (data: InsertApproval) => apiRequest("/api/approvals", "POST", data),
    onSuccess: () => {
      toast({
        title: "Solicitud de aprobación enviada",
        description: "La solicitud ha sido enviada para revisión",
      });
      setIsApprovalDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    },
  });

  const expenseForm = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      type: "fuel",
      amount: "0",
      description: "",
      category: "operational",
      expenseDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const approvalForm = useForm<InsertApproval>({
    resolver: zodResolver(insertApprovalSchema),
    defaultValues: {
      type: "expense",
      entityId: "",
      requestedBy: "Usuario Actual",
      description: "",
      status: "pending",
      priority: "normal",
    },
  });

  const onExpenseSubmit = (data: InsertExpense) => {
    createExpenseMutation.mutate(data);
  };

  const onApprovalSubmit = (data: InsertApproval) => {
    createApprovalMutation.mutate(data);
  };

  const getExpenseTypeColor = (type: string) => {
    switch (type) {
      case "fuel":
        return "bg-warning-amber text-white";
      case "maintenance":
        return "bg-success-green text-white";
      case "tolls":
        return "bg-logistics-blue text-white";
      case "parking":
        return "bg-purple-500 text-white";
      case "other":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getExpenseTypeLabel = (type: string) => {
    switch (type) {
      case "fuel":
        return "Combustible";
      case "maintenance":
        return "Mantenimiento";
      case "tolls":
        return "Peajes";
      case "parking":
        return "Estacionamiento";
      case "other":
        return "Otros";
      default:
        return "Desconocido";
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success-green text-white";
      case "pending":
        return "bg-warning-amber text-white";
      case "rejected":
        return "bg-alert-red text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getApprovalStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return "Desconocido";
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return CheckCircle;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const filteredExpenses = Array.isArray(expenses) ? expenses.filter((expense: Expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || expense.type === typeFilter;
    return matchesSearch && matchesType;
  }) : [];

  const filteredApprovals = Array.isArray(approvals) ? approvals.filter((approval: Approval) => {
    const matchesSearch = approval.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  // Calculate totals
  const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum: number, expense: Expense) => 
    sum + (parseFloat(expense.amount) || 0), 0
  ) : 0;

  const monthlyExpenses = Array.isArray(expenses) ? expenses
    .filter((expense: Expense) => {
      const expenseDate = new Date(expense.expenseDate);
      const now = new Date();
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, expense: Expense) => sum + (parseFloat(expense.amount) || 0), 0) : 0;

  const pendingApprovals = Array.isArray(approvals) ? approvals.filter((approval: Approval) => approval.status === "pending") : [];

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
              <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
              <p className="text-gray-600">Control de gastos y sistema de aprobaciones</p>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Gasto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nuevo Gasto</DialogTitle>
                  </DialogHeader>
                  <Form {...expenseForm}>
                    <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={expenseForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Gasto</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="fuel">Combustible</SelectItem>
                                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                                  <SelectItem value="tolls">Peajes</SelectItem>
                                  <SelectItem value="parking">Estacionamiento</SelectItem>
                                  <SelectItem value="other">Otros</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expenseForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monto</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={expenseForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descripción del gasto..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={expenseForm.control}
                          name="vehicleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehículo (opcional)</FormLabel>
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
                          control={expenseForm.control}
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
                                  <SelectItem value="operational">Operacional</SelectItem>
                                  <SelectItem value="administrative">Administrativo</SelectItem>
                                  <SelectItem value="capital">Capital</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={expenseForm.control}
                          name="expenseDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha del Gasto</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={expenseForm.control}
                          name="receiptNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Recibo</FormLabel>
                              <FormControl>
                                <Input placeholder="R001234567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button type="submit" className="flex-1">Registrar Gasto</Button>
                        <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-agro-primary hover:bg-agro-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Solicitar Aprobación
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Nueva Solicitud de Aprobación</DialogTitle>
                  </DialogHeader>
                  <Form {...approvalForm}>
                    <form onSubmit={approvalForm.handleSubmit(onApprovalSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={approvalForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Solicitud</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="expense">Gasto</SelectItem>
                                  <SelectItem value="purchase">Compra</SelectItem>
                                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                                  <SelectItem value="route_change">Cambio de Ruta</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={approvalForm.control}
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

                      <FormField
                        control={approvalForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descripción detallada de la solicitud..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={approvalForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monto (opcional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00" 
                                  {...field}
                                  onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={approvalForm.control}
                          name="entityId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID de Referencia</FormLabel>
                              <FormControl>
                                <Input placeholder="ID del elemento relacionado" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button type="submit" className="flex-1">Enviar Solicitud</Button>
                        <Button type="button" variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Gastos Totales</p>
                    <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Este Mes</p>
                    <p className="text-2xl font-bold text-gray-900">${monthlyExpenses.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Aprobaciones Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingApprovals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="expenses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expenses">Gastos</TabsTrigger>
              <TabsTrigger value="approvals">Aprobaciones</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar gastos..."
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
                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    <SelectItem value="tolls">Peajes</SelectItem>
                    <SelectItem value="parking">Estacionamiento</SelectItem>
                    <SelectItem value="other">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expenses List */}
              <div className="space-y-4">
                {expensesLoading ? (
                  [...Array(5)].map((_, i) => (
                    <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
                      <CardContent className="p-6">
                        <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredExpenses.map((expense: Expense) => (
                    <Card key={expense.id} className="rounded-xl shadow-sm border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Badge className={getExpenseTypeColor(expense.type)}>
                                  {getExpenseTypeLabel(expense.type)}
                                </Badge>
                                <span>•</span>
                                <span>{format(new Date(expense.expenseDate), "dd/MM/yyyy", { locale: es })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${expense.amount}</p>
                            <p className="text-sm text-gray-500 capitalize">{expense.category}</p>
                          </div>
                        </div>
                        {expense.receiptNumber && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                              Recibo: <span className="font-medium">{expense.receiptNumber}</span>
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="approvals" className="space-y-6">
              {/* Approvals List */}
              <div className="space-y-4">
                {approvalsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
                      <CardContent className="p-6">
                        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredApprovals.map((approval: Approval) => {
                    const StatusIcon = getApprovalStatusIcon(approval.status);
                    
                    return (
                      <Card key={approval.id} className="rounded-xl shadow-sm border border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <StatusIcon className="w-6 h-6 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{approval.description}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                  <span className="capitalize">{approval.type.replace('_', ' ')}</span>
                                  <span>•</span>
                                  <span>Por {approval.requestedBy}</span>
                                  <span>•</span>
                                  <span>{format(new Date(approval.requestedAt), "dd/MM/yyyy", { locale: es })}</span>
                                </div>
                                {approval.amount && (
                                  <p className="text-lg font-semibold text-gray-900 mt-2">
                                    Monto: ${approval.amount}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Badge className={getApprovalStatusColor(approval.status)}>
                                {getApprovalStatusLabel(approval.status)}
                              </Badge>
                              <Badge variant="outline" className={`text-${approval.priority === 'critical' ? 'red' : approval.priority === 'high' ? 'orange' : approval.priority === 'low' ? 'green' : 'gray'}-600`}>
                                {approval.priority === 'critical' ? 'Crítica' : 
                                 approval.priority === 'high' ? 'Alta' : 
                                 approval.priority === 'low' ? 'Baja' : 'Normal'}
                              </Badge>
                            </div>
                          </div>
                          {approval.comments && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Comentarios:</span> {approval.comments}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Empty States */}
          {filteredExpenses.length === 0 && !expensesLoading && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay gastos registrados</h3>
              <p className="text-gray-600 mb-4">
                Comienza registrando tu primer gasto
              </p>
              <Button onClick={() => setIsExpenseDialogOpen(true)} className="bg-agro-primary hover:bg-agro-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Gasto
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