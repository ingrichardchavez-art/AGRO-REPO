import { useQuery } from "@tanstack/react-query";
import VehicleCard from "@/components/vehicle/vehicle-card";
import type { Vehicle } from "@shared/schema";

export default function VehicleCards() {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Vehículos Destacados</h3>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Show featured vehicles (active and warning status)
  const featuredVehicles = Array.isArray(vehicles) ? vehicles.filter((vehicle: Vehicle) => 
    vehicle.status === "active" || vehicle.status === "warning"
  ).slice(0, 2) : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Vehículos Destacados</h3>
      
      <div className="space-y-4">
        {featuredVehicles.map((vehicle: Vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
      
      {featuredVehicles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay vehículos destacados</p>
        </div>
      )}
    </div>
  );
}
