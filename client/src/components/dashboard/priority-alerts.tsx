import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert } from "@shared/schema";

export default function PriorityAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
  });

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Prioritarias</h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const priorityAlerts = Array.isArray(alerts) ? alerts.filter((alert: Alert) => 
    alert.severity === "high" || alert.severity === "critical"
  ).slice(0, 3) : [];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "delay":
        return Clock;
      case "temperature":
        return Thermometer;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "alert-red";
      case "high":
        return "alert-red";
      case "medium":
        return "warning-amber";
      default:
        return "warning-amber";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    }
    const diffHours = Math.floor(diffMins / 60);
    return `Hace ${diffHours} h`;
  };

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Prioritarias</h3>
        
        {priorityAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay alertas prioritarias</p>
          </div>
        ) : (
          <div className="space-y-3">
            {priorityAlerts.map((alert: Alert) => {
              const Icon = getAlertIcon(alert.type);
              const colorClass = getAlertColor(alert.severity);
              
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border",
                    `bg-${colorClass} bg-opacity-5 border-${colorClass} border-opacity-20`
                  )}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className={`w-2 h-2 bg-${colorClass} rounded-full mt-2`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.createdAt ? formatTimeAgo(alert.createdAt) : 'Hace un momento'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-logistics-blue hover:text-blue-700 p-1"
                    data-testid={`button-view-alert-${alert.id}`}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
