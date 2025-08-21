import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Package, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: "Vehículos Activos",
      value: metrics?.activeVehicles ?? 0,
      change: "+12%",
      trend: "up",
      icon: Truck,
      color: "agro-primary",
    },
    {
      title: "Entregas Hoy",
      value: metrics?.dailyDeliveries ?? 0,
      change: "+8%",
      trend: "up",
      icon: Package,
      color: "logistics-blue",
    },
    {
      title: "Pedidos Pendientes",
      value: metrics?.pendingOrders ?? 0,
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "warning-amber",
    },
    {
      title: "% Cumplimiento",
      value: `${metrics?.compliance ?? 0}%`,
      change: "+2.1%",
      trend: "up",
      icon: TrendingUp,
      color: "success-green",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
        
        return (
          <Card key={metric.title} className="rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1" data-testid={`metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className={`w-3 h-3 mr-1 ${metric.trend === "up" ? "text-success-green" : "text-alert-red"}`} />
                    <span className={`text-xs font-medium ${metric.trend === "up" ? "text-success-green" : "text-alert-red"}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs ayer</span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-${metric.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
