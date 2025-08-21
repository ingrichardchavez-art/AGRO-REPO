import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, MapPin, Info, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-green text-white";
      case "warning":
        return "bg-warning-amber text-white";
      case "idle":
        return "bg-gray-400 text-white";
      case "maintenance":
        return "bg-alert-red text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "En ruta";
      case "warning":
        return "Retraso";
      case "idle":
        return "Inactivo";
      case "maintenance":
        return "Mantenimiento";
      default:
        return "Desconocido";
    }
  };

  const calculateCapacityPercentage = () => {
    const capacity = parseFloat(vehicle.capacity || "0");
    const currentLoad = parseFloat(vehicle.currentLoad || "0");
    return capacity > 0 ? (currentLoad / capacity) * 100 : 0;
  };

  const capacityPercentage = calculateCapacityPercentage();
  const isOverCapacity = capacityPercentage > 100;

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-gray-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-gray-900" data-testid={`vehicle-plate-${vehicle.id}`}>
                {vehicle.plate}
              </h4>
              <Badge 
                className={cn("text-xs", getStatusColor(vehicle.status))}
                data-testid={`vehicle-status-${vehicle.id}`}
              >
                {getStatusLabel(vehicle.status)}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 mb-2" data-testid={`vehicle-driver-${vehicle.id}`}>
              Conductor: {vehicle.driverName || "Sin asignar"}
            </p>
            
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Capacidad</span>
                <span data-testid={`vehicle-capacity-${vehicle.id}`}>
                  {vehicle.currentLoad}/{vehicle.capacity} Ton
                </span>
              </div>
              <Progress 
                value={Math.min(capacityPercentage, 100)} 
                className="h-2"
                data-testid={`vehicle-capacity-bar-${vehicle.id}`}
              />
              {isOverCapacity && (
                <p className="text-xs text-alert-red mt-1">
                  Capacidad excedida ({capacityPercentage.toFixed(1)}%)
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-logistics-blue hover:text-blue-700 p-1 h-auto"
                data-testid={`button-vehicle-location-${vehicle.id}`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Ubicación
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-logistics-blue hover:text-blue-700 p-1 h-auto"
                data-testid={`button-vehicle-details-${vehicle.id}`}
              >
                <Info className="w-3 h-3 mr-1" />
                Detalles
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-logistics-blue hover:text-blue-700 p-1 h-auto"
                data-testid={`button-vehicle-contact-${vehicle.id}`}
              >
                <Phone className="w-3 h-3 mr-1" />
                Contacto
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
