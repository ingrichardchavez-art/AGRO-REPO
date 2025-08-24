// Tipos unificados para la aplicación AGRO Logistics
// Compatibles con la API local del servidor

export interface Vehicle {
  id: string;
  plate: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle';
  capacity: number;
  fuel_type: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  fuel_level: number;
  status: 'active' | 'maintenance' | 'inactive' | 'idle' | 'warning';
  driver_id?: string;
  driver_name?: string;
  location_lat?: number;
  location_lng?: number;
  last_maintenance?: string;
  next_maintenance?: string;
  insurance_expiry?: string;
  registration_expiry?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  license_number: string;
  license_class: 'A' | 'B' | 'C';
  license_expiry?: string;
  medical_cert_expiry?: string;
  status: 'active' | 'inactive' | 'suspended' | 'on_leave';
  hire_date?: string;
  salary?: number;
  address?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  type: 'retail' | 'wholesale' | 'industrial' | 'supplier' | 'distributor';
  credit_limit?: number;
  payment_terms?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  created_at: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  client_id: string;
  client_name: string;
  pickup_address: string;
  delivery_address: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  vehicle_id?: string;
  driver_id?: string;
  pickup_date?: string;
  delivery_date?: string;
  weight?: number;
  volume?: number;
  special_instructions?: string;
  products?: string;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  vehicle_id?: string;
  driver_id?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  start_location?: string;
  end_location?: string;
  estimated_duration?: number;
  distance?: number;
  waypoints?: string;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  supplier?: string;
  expiry_date?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  cost?: number;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  mechanic?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  driver_id?: string;
  liters: number;
  cost_per_liter?: number;
  total_cost: number;
  odometer?: number;
  fuel_station?: string;
  receipt_number?: string;
  filled_at: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: 'fuel' | 'maintenance' | 'tolls' | 'parking' | 'other';
  amount: number;
  description: string;
  date: string;
  vehicle_id?: string;
  driver_id?: string;
  status?: 'pending' | 'paid' | 'approved';
  receipt_number?: string;
  created_at: string;
  updated_at?: string;
}

export interface Alert {
  id: string;
  type: 'maintenance' | 'fuel' | 'delivery' | 'safety' | 'system' | 'delay' | 'temperature' | 'capacity' | 'traffic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  message: string;
  vehicle_id?: string;
  route_id?: string;
  order_id?: string;
  read?: boolean;
  resolved?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DashboardMetrics {
  activeVehicles: number;
  dailyDeliveries: number;
  totalRevenue: number;
  pendingOrders: number;
}

// Tipos para inserción (sin campos autogenerados)
export type InsertVehicle = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
export type InsertDriver = Omit<Driver, 'id' | 'created_at' | 'updated_at'>;
export type InsertClient = Omit<Client, 'id' | 'created_at' | 'updated_at'>;
export type InsertOrder = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type InsertRoute = Omit<Route, 'id' | 'created_at' | 'updated_at'>;
export type InsertInventory = Omit<Inventory, 'id' | 'created_at' | 'updated_at'>;
export type InsertMaintenance = Omit<Maintenance, 'id' | 'created_at' | 'updated_at'>;
export type InsertFuelLog = Omit<FuelLog, 'id' | 'created_at'>;
export type InsertExpense = Omit<Expense, 'id' | 'created_at'>;
export type InsertAlert = Omit<Alert, 'id' | 'created_at' | 'updated_at'>;
