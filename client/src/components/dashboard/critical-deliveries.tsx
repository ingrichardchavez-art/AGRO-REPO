import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, Package } from "lucide-react";
import type { Order } from "@shared/schema";

export default function CriticalDeliveries() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Entregas Críticas</h3>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter orders that have delivery within next 2 hours
  const now = new Date();
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  const criticalDeliveries = Array.isArray(orders) ? orders.filter((order: Order) => {
    if (!order.scheduledDelivery) return false;
    const deliveryTime = new Date(order.scheduledDelivery);
    return deliveryTime <= twoHoursFromNow && deliveryTime > now && order.status === "in_transit";
  }).slice(0, 3) : [];

  const getTimeRemaining = (scheduledDelivery: Date) => {
    const now = new Date();
    const diffMs = new Date(scheduledDelivery).getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}min`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}min`;
  };

  const getProductsDescription = (products: any[]) => {
    if (!products || products.length === 0) return "Sin productos";
    if (products.length === 1) return products[0].name;
    return `${products[0].name} +${products.length - 1} más`;
  };

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Entregas Críticas</h3>
        
        {criticalDeliveries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay entregas críticas</p>
            <p className="text-xs">próximas 2 horas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalDeliveries.map((delivery: Order) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid={`critical-delivery-${delivery.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {delivery.clientName}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {getProductsDescription(delivery.products as any[])}
                  </p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-warning-amber mr-1" />
                    <span className="text-xs text-warning-amber font-medium">
                      {delivery.scheduledDelivery && getTimeRemaining(delivery.scheduledDelivery)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-logistics-blue hover:text-blue-700 p-2"
                  data-testid={`button-view-delivery-${delivery.id}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
