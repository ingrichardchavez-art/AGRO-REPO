import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@shared/schema";
import { Truck, Fuel, Package, User, Save, X } from "lucide-react";

interface VehicleEditDialogProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Partial<Vehicle>) => void;
}

export default function VehicleEditDialog({ 
  vehicle, 
  isOpen, 
  onClose, 
  onSave 
}: VehicleEditDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plate: "",
    type: "truck",
    capacity: 0,
    currentLoad: 0,
    status: "idle",
    driverName: "",
    fuelLevel: 100,
    fuelType: "diesel",
    maintenanceStatus: "good",
    location: "",
    lastMaintenance: "",
    nextMaintenance: "",
    insuranceExpiry: "",
    registrationExpiry: "",
    notes: ""
  });

  // Actualizar formulario cuando cambie el vehículo
  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate || "",
        type: vehicle.type || "truck",
        capacity: vehicle.capacity || 0,
        currentLoad: vehicle.currentLoad || 0,
        status: vehicle.status || "idle",
        driverName: vehicle.driverName || "",
        fuelLevel: vehicle.fuelLevel || 100,
        fuelType: vehicle.fuelType || "diesel",
        maintenanceStatus: vehicle.maintenanceStatus || "good",
        location: vehicle.location || "",
        lastMaintenance: vehicle.lastMaintenance || "",
        nextMaintenance: vehicle.nextMaintenance || "",
        insuranceExpiry: vehicle.insuranceExpiry || "",
        registrationExpiry: vehicle.registrationExpiry || "",
        notes: vehicle.notes || ""
      });
    }
  }, [vehicle]);

  const handleInputChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!vehicle) return;

    setIsLoading(true);
    try {
      console.log("Guardando cambios del vehículo:", formData);
      
      // Llamar a onSave con los datos del formulario
      onSave(formData);
      
      // Cerrar el diálogo después de guardar
      onClose();
    } catch (error) {
      console.error("Error en el formulario:", error);
      toast({
        title: "Error",
        description: "Error en el formulario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (vehicle) {
      setFormData({
        plate: vehicle.plate || "",
        type: vehicle.type || "truck",
        capacity: vehicle.capacity || 0,
        currentLoad: vehicle.currentLoad || 0,
        status: vehicle.status || "idle",
        driverName: vehicle.driverName || "",
        fuelLevel: vehicle.fuelLevel || 100,
        fuelType: vehicle.fuelType || "diesel",
        maintenanceStatus: vehicle.maintenanceStatus || "good",
        location: vehicle.location || "",
        lastMaintenance: vehicle.lastMaintenance || "",
        nextMaintenance: vehicle.nextMaintenance || "",
        insuranceExpiry: vehicle.insuranceExpiry || "",
        registrationExpiry: vehicle.registrationExpiry || "",
        notes: vehicle.notes || ""
      });
    }
    onClose();
  };

  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Editar Vehículo - {vehicle.plate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  value={formData.plate || ""}
                  onChange={(e) => handleInputChange("plate", e.target.value)}
                  placeholder="ABC-123"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo de Vehículo</Label>
                <Select 
                  value={formData.type || "truck"} 
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Camión</SelectItem>
                    <SelectItem value="van">Furgoneta</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="trailer">Remolque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Capacidad y carga */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Capacidad y Carga
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacidad Máxima (kg)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity || ""}
                  onChange={(e) => handleInputChange("capacity", Number(e.target.value))}
                  placeholder="8000"
                />
              </div>
              
              <div>
                <Label htmlFor="currentLoad">Carga Actual (kg)</Label>
                <Input
                  id="currentLoad"
                  type="number"
                  value={formData.currentLoad || ""}
                  onChange={(e) => handleInputChange("currentLoad", Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Estado y conductor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4" />
              Estado y Conductor
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status || "idle"} 
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="idle">Inactivo</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="maintenance">En Mantenimiento</SelectItem>
                    <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="driverName">Conductor Asignado</Label>
                <Input
                  id="driverName"
                  value={formData.driverName || ""}
                  onChange={(e) => handleInputChange("driverName", e.target.value)}
                  placeholder="Nombre del conductor"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Combustible */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Combustible
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuelType">Tipo de Combustible</Label>
                <Select 
                  value={formData.fuelType || "diesel"} 
                  onValueChange={(value) => handleInputChange("fuelType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasolina">Gasolina</SelectItem>
                    <SelectItem value="electrico">Eléctrico</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="fuelLevel">Nivel de Combustible (%)</Label>
                <Input
                  id="fuelLevel"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fuelLevel || ""}
                  onChange={(e) => handleInputChange("fuelLevel", Number(e.target.value))}
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Mantenimiento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Mantenimiento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maintenanceStatus">Estado de Mantenimiento</Label>
                <Select 
                  value={formData.maintenanceStatus || "good"} 
                  onValueChange={(value) => handleInputChange("maintenanceStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excelente</SelectItem>
                    <SelectItem value="good">Bueno</SelectItem>
                    <SelectItem value="fair">Regular</SelectItem>
                    <SelectItem value="poor">Malo</SelectItem>
                    <SelectItem value="critical">Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="nextMaintenance">Próximo Mantenimiento</Label>
                <Input
                  id="nextMaintenance"
                  type="date"
                  value={formData.nextMaintenance || ""}
                  onChange={(e) => handleInputChange("nextMaintenance", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Fechas importantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Fechas Importantes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceExpiry">Vencimiento Seguro</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={formData.insuranceExpiry || ""}
                  onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="registrationExpiry">Vencimiento Registro</Label>
                <Input
                  id="registrationExpiry"
                  type="date"
                  value={formData.registrationExpiry || ""}
                  onChange={(e) => handleInputChange("registrationExpiry", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Notas */}
          <div className="space-y-4">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <textarea
              id="notes"
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Información adicional sobre el vehículo..."
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
