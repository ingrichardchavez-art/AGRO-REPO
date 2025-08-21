import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { FileText, Download, TrendingUp, TrendingDown, Truck, Package, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

export default function Reports() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  // Mock data - in a real app this would come from the API
  const { data: dashboardMetrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: routes = [] } = useQuery({
    queryKey: ["/api/routes"],
  });

  // Performance metrics (mocked)
  const performanceData = [
    { name: "Ene", deliveries: 145, efficiency: 87, cost: 12500 },
    { name: "Feb", deliveries: 167, efficiency: 91, cost: 11200 },
    { name: "Mar", deliveries: 189, efficiency: 85, cost: 13800 },
    { name: "Abr", deliveries: 156, efficiency: 93, cost: 10900 },
    { name: "May", deliveries: 203, efficiency: 89, cost: 12300 },
    { name: "Jun", deliveries: 178, efficiency: 96, cost: 9800 }
  ];

  const fleetUtilizationData = [
    { name: "En ruta", value: 65, color: "#388E3C" },
    { name: "Disponible", value: 25, color: "#1565C0" },
    { name: "Mantenimiento", value: 10, color: "#FFA000" }
  ];

  const routeEfficiencyData = [
    { route: "Ruta Norte", planned: 120, actual: 108, efficiency: 90 },
    { route: "Ruta Sur", planned: 95, actual: 87, efficiency: 92 },
    { route: "Ruta Centro", planned: 150, actual: 142, efficiency: 95 },
    { route: "Ruta Este", planned: 85, actual: 79, efficiency: 93 },
    { route: "Ruta Oeste", planned: 110, actual: 98, efficiency: 89 }
  ];

  const deliveryTrendsData = [
    { day: "Lun", deliveries: 45, onTime: 38, delayed: 7 },
    { day: "Mar", deliveries: 52, onTime: 47, delayed: 5 },
    { day: "Mié", deliveries: 48, onTime: 43, delayed: 5 },
    { day: "Jue", deliveries: 61, onTime: 56, delayed: 5 },
    { day: "Vie", deliveries: 55, onTime: 49, delayed: 6 },
    { day: "Sáb", deliveries: 38, onTime: 35, delayed: 3 },
    { day: "Dom", deliveries: 29, onTime: 27, delayed: 2 }
  ];

  // Calculate key metrics
  const totalVehicles = Array.isArray(vehicles) ? vehicles.length : 0;
  const activeVehicles = Array.isArray(vehicles) ? vehicles.filter(v => v.status === 'active').length : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const completedOrders = Array.isArray(orders) ? orders.filter(o => o.status === 'delivered').length : 0;
  const averageEfficiency = routeEfficiencyData.reduce((acc, route) => acc + route.efficiency, 0) / routeEfficiencyData.length;

  const generateReport = (type: string) => {
    // Mock report generation
    const reportTypes = {
      fleet: "Reporte de Flota",
      performance: "Reporte de Rendimiento",
      delivery: "Reporte de Entregas",
      financial: "Reporte Financiero"
    };
    
    const reportName = reportTypes[type as keyof typeof reportTypes] || "Reporte";
    
    // In a real app, this would generate and download a PDF or Excel file
    const blob = new Blob([`${reportName} - Generado el ${new Date().toLocaleDateString()}`], 
                         { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
              <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
              <p className="text-gray-600">Métricas de rendimiento y análisis de operaciones</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select onValueChange={(value) => generateReport(value)}>
                <SelectTrigger className="w-48" data-testid="select-report-type">
                  <Download className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Generar reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fleet">Reporte de Flota</SelectItem>
                  <SelectItem value="performance">Reporte de Rendimiento</SelectItem>
                  <SelectItem value="delivery">Reporte de Entregas</SelectItem>
                  <SelectItem value="financial">Reporte Financiero</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilización de Flota</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="metric-fleet-utilization">
                      {totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0}%
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-3 h-3 mr-1 text-success-green" />
                      <span className="text-xs text-success-green">+5.2% vs mes anterior</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-agro-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-agro-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Cumplimiento</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="metric-completion-rate">
                      {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-3 h-3 mr-1 text-success-green" />
                      <span className="text-xs text-success-green">+2.1% vs mes anterior</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-success-green bg-opacity-10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Eficiencia Promedio</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="metric-avg-efficiency">
                      {Math.round(averageEfficiency)}%
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-3 h-3 mr-1 text-success-green" />
                      <span className="text-xs text-success-green">+1.8% vs mes anterior</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-logistics-blue bg-opacity-10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-logistics-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ahorro de Costos</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="metric-cost-savings">
                      $18,500
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingDown className="w-3 h-3 mr-1 text-success-green" />
                      <span className="text-xs text-success-green">-12.3% en costos</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-warning-amber bg-opacity-10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-warning-amber" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Tabs */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance" data-testid="tab-performance">Rendimiento</TabsTrigger>
              <TabsTrigger value="fleet" data-testid="tab-fleet">Flota</TabsTrigger>
              <TabsTrigger value="routes" data-testid="tab-routes">Rutas</TabsTrigger>
              <TabsTrigger value="deliveries" data-testid="tab-deliveries">Entregas</TabsTrigger>
            </TabsList>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-xl shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Tendencia de Entregas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Area 
                            type="monotone" 
                            dataKey="deliveries" 
                            stroke="var(--agro-primary)" 
                            fill="var(--agro-primary)" 
                            fillOpacity={0.1}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Eficiencia vs Costos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="efficiency" 
                            stroke="var(--success-green)" 
                            strokeWidth={2}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="cost" 
                            stroke="var(--alert-red)" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Fleet Tab */}
            <TabsContent value="fleet" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-xl shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Utilización de Flota</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={fleetUtilizationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            dataKey="value"
                          >
                            {fleetUtilizationData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {fleetUtilizationData.map((item, index) => (
                        <div key={index} className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">{item.value}%</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{item.name}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Estado de Vehículos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(vehicles) && vehicles.slice(0, 5).map((vehicle: any) => {
                        const efficiency = Math.round(Math.random() * 30 + 70); // Mock efficiency
                        return (
                          <div key={vehicle.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Truck className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="font-medium">{vehicle.plate}</p>
                                <p className="text-sm text-gray-500">{vehicle.driverName || "Sin conductor"}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{efficiency}%</p>
                              <Progress value={efficiency} className="w-16 h-2" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Routes Tab */}
            <TabsContent value="routes" className="space-y-6">
              <Card className="rounded-xl shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Eficiencia por Ruta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={routeEfficiencyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="route" />
                        <YAxis />
                        <Bar dataKey="planned" fill="var(--logistics-blue)" fillOpacity={0.7} />
                        <Bar dataKey="actual" fill="var(--agro-primary)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {routeEfficiencyData.map((route, index) => (
                  <Card key={index} className="rounded-xl shadow-sm border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{route.route}</h3>
                        <Badge 
                          className={
                            route.efficiency >= 95 ? "bg-success-green text-white" :
                            route.efficiency >= 90 ? "bg-logistics-blue text-white" :
                            "bg-warning-amber text-white"
                          }
                        >
                          {route.efficiency}%
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Planificado:</span>
                          <span>{route.planned} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Real:</span>
                          <span>{route.actual} min</span>
                        </div>
                        <Progress value={route.efficiency} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Deliveries Tab */}
            <TabsContent value="deliveries" className="space-y-6">
              <Card className="rounded-xl shadow-sm border border-gray-200">
                <CardHeader>
                  <CardTitle>Tendencia de Entregas por Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deliveryTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Bar dataKey="onTime" stackId="a" fill="var(--success-green)" />
                        <Bar dataKey="delayed" stackId="a" fill="var(--alert-red)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-xl shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Resumen de Entregas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-success-green mr-2" />
                          <span>A tiempo</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">295</p>
                          <p className="text-sm text-gray-500">87.2%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-warning-amber mr-2" />
                          <span>Con retraso</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">31</p>
                          <p className="text-sm text-gray-500">9.2%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-alert-red mr-2" />
                          <span>Canceladas</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">12</p>
                          <p className="text-sm text-gray-500">3.6%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl shadow-sm border border-gray-200">
                  <CardHeader>
                    <CardTitle>Métricas de Tiempo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Tiempo Promedio de Entrega</span>
                          <span className="text-sm font-medium">2.4h</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Cumplimiento de Ventana</span>
                          <span className="text-sm font-medium">91.3%</span>
                        </div>
                        <Progress value={91} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Satisfacción del Cliente</span>
                          <span className="text-sm font-medium">4.6/5</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}