import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { Vehicle } from "@shared/schema";

export default function FleetMap() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  
  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const toggleMapLayer = (layer: string) => {
    setActiveLayer(activeLayer === layer ? null : layer);
  };

  const getVehicleMarkerColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-green";
      case "warning":
        return "bg-warning-amber";
      case "idle":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Card className="rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Seguimiento en Tiempo Real</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={activeLayer === "traffic" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMapLayer("traffic")}
              data-testid="button-traffic-layer"
            >
              Tráfico
            </Button>
            <Button
              variant={activeLayer === "weather" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMapLayer("weather")}
              data-testid="button-weather-layer"
            >
              Clima
            </Button>
          </div>
        </div>
        
        {/* Map Container */}
        <div 
          className="relative h-96 bg-gray-100 rounded-lg overflow-hidden"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
          data-testid="map-container"
        >
          {/* Vehicle Markers */}
          <div className="absolute inset-0">
            {vehicles && vehicles.length > 0 && vehicles.map((vehicle: Vehicle, index: number) => {
              // Position vehicles in different locations on the map
              const positions = [
                { top: "25%", left: "33%" },
                { top: "50%", right: "25%" },
                { bottom: "33%", left: "50%" },
                { top: "75%", right: "33%" }
              ];
              
              const position = positions[index % positions.length];
              
              return (
                <div
                  key={vehicle.id}
                  className={`absolute w-4 h-4 ${getVehicleMarkerColor(vehicle.status)} rounded-full border-2 border-white shadow-lg ${vehicle.status === 'active' ? 'animate-pulse' : ''}`}
                  style={position}
                  title={`${vehicle.plate} - ${vehicle.status}`}
                  data-testid={`vehicle-marker-${vehicle.id}`}
                />
              );
            })}
          </div>
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="w-8 h-8 p-0"
              data-testid="button-zoom-in"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-8 h-8 p-0"
              data-testid="button-zoom-out"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-success-green rounded-full" />
              <span>En ruta</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-warning-amber rounded-full" />
              <span>Retraso</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span>Inactivo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
