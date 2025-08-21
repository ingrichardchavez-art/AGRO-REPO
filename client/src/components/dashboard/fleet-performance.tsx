import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import type { Vehicle } from "@shared/schema";

export default function FleetPerformance() {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Flota</h3>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Calculate fleet performance metrics
  const totalVehicles = Array.isArray(vehicles) ? vehicles.length : 0;
  const optimalVehicles = Array.isArray(vehicles) ? vehicles.filter((v: Vehicle) => v.status === "active").length : 0;
  const warningVehicles = Array.isArray(vehicles) ? vehicles.filter((v: Vehicle) => v.status === "warning").length : 0;
  const criticalVehicles = Array.isArray(vehicles) ? vehicles.filter((v: Vehicle) => v.status === "maintenance").length : 0;

  const optimalPercentage = totalVehicles > 0 ? Math.round((optimalVehicles / totalVehicles) * 100) : 0;
  const warningPercentage = totalVehicles > 0 ? Math.round((warningVehicles / totalVehicles) * 100) : 0;
  const criticalPercentage = totalVehicles > 0 ? Math.round((criticalVehicles / totalVehicles) * 100) : 0;

  const overallEfficiency = totalVehicles > 0 ? Math.round(((optimalVehicles * 1 + warningVehicles * 0.6) / totalVehicles) * 100) : 0;

  // Calculate stroke offsets for the pie chart
  const circumference = 2 * Math.PI * 40; // radius = 40
  const optimalStrokeDasharray = (optimalPercentage / 100) * circumference;
  const warningStrokeDasharray = (warningPercentage / 100) * circumference;
  const criticalStrokeDasharray = (criticalPercentage / 100) * circumference;

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento de Flota</h3>
        
        <div className="relative h-64 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#f3f4f6" 
                strokeWidth="8"
              />
              
              {/* Success segment */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="var(--success-green)" 
                strokeWidth="8"
                strokeDasharray={`${optimalStrokeDasharray} ${circumference - optimalStrokeDasharray}`}
                strokeDashoffset="0"
                className="transition-all duration-300"
              />
              
              {/* Warning segment */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="var(--warning-amber)" 
                strokeWidth="8"
                strokeDasharray={`${warningStrokeDasharray} ${circumference - warningStrokeDasharray}`}
                strokeDashoffset={-optimalStrokeDasharray}
                className="transition-all duration-300"
              />
              
              {/* Critical segment */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="var(--alert-red)" 
                strokeWidth="8"
                strokeDasharray={`${criticalStrokeDasharray} ${circumference - criticalStrokeDasharray}`}
                strokeDashoffset={-(optimalStrokeDasharray + warningStrokeDasharray)}
                className="transition-all duration-300"
              />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-900" data-testid="fleet-efficiency">
                  {overallEfficiency}%
                </p>
                <p className="text-xs text-gray-600">Eficiencia</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-success-green rounded-full" />
              <span className="text-sm font-medium" data-testid="optimal-percentage">
                {optimalPercentage}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Óptimo</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-warning-amber rounded-full" />
              <span className="text-sm font-medium" data-testid="warning-percentage">
                {warningPercentage}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Regular</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-alert-red rounded-full" />
              <span className="text-sm font-medium" data-testid="critical-percentage">
                {criticalPercentage}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Crítico</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
