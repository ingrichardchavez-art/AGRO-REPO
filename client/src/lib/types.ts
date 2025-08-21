// Additional type definitions for the AgroFlow application

export interface DashboardMetrics {
  activeVehicles: number;
  dailyDeliveries: number;
  pendingOrders: number;
  compliance: number;
}

export interface VehicleLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface Product {
  name: string;
  quantity: number;
  unit: string;
  temperature?: string;
}

export interface RouteStop {
  orderId: string;
  address: string;
  location: VehicleLocation;
  type: "pickup" | "delivery";
  estimatedTime: string;
}

export interface FleetPerformanceData {
  overall: number;
  optimal: number;
  warning: number;
  critical: number;
}

export type VehicleStatus = "idle" | "active" | "warning" | "maintenance";
export type OrderStatus = "pending" | "assigned" | "in_transit" | "delivered" | "cancelled";
export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertType = "delay" | "temperature" | "capacity" | "maintenance" | "traffic";
