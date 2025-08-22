import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para las tablas de Supabase
export interface Vehicle {
  id: string
  plate: string
  type: 'truck' | 'van' | 'car' | 'motorcycle'
  capacity: number
  fuel_type: 'diesel' | 'gasoline' | 'electric' | 'hybrid'
  status: 'active' | 'maintenance' | 'inactive'
  current_location: {
    lat: number
    lng: number
  }
  driver_id?: string
  fuel_level: number
  last_maintenance: string
  next_maintenance: string
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  name: string
  license_number: string
  license_type: string
  phone: string
  email: string
  status: 'active' | 'inactive' | 'on_trip'
  current_vehicle_id?: string
  rating: number
  total_trips: number
  created_at: string
}

export interface Order {
  id: string
  client_id: string
  client_name: string
  pickup_address: string
  delivery_address: string
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  vehicle_id?: string
  driver_id?: string
  pickup_date: string
  delivery_date?: string
  weight: number
  volume: number
  special_instructions?: string
  tracking_number: string
  created_at: string
}

export interface Route {
  id: string
  name: string
  start_location: string
  end_location: string
  waypoints: string[]
  estimated_duration: number
  distance: number
  vehicle_id?: string
  driver_id?: string
  status: 'planned' | 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  type: 'retail' | 'wholesale' | 'industrial'
  credit_limit: number
  payment_terms: string
  created_at: string
}

export interface Inventory {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  unit: string
  location: string
  supplier_id?: string
  reorder_level: number
  cost_per_unit: number
  created_at: string
}

export interface Maintenance {
  id: string
  vehicle_id: string
  type: 'preventive' | 'corrective' | 'emergency'
  description: string
  cost: number
  date: string
  next_maintenance?: string
  mechanic: string
  status: 'scheduled' | 'in_progress' | 'completed'
  created_at: string
}

export interface Fuel {
  id: string
  vehicle_id: string
  quantity: number
  cost_per_liter: number
  total_cost: number
  date: string
  location: string
  fuel_type: 'diesel' | 'gasoline'
  created_at: string
}

export interface Expense {
  id: string
  category: 'fuel' | 'maintenance' | 'tolls' | 'insurance' | 'other'
  amount: number
  description: string
  date: string
  vehicle_id?: string
  driver_id?: string
  receipt_url?: string
  created_at: string
}

export interface Alert {
  id: string
  type: 'maintenance' | 'fuel' | 'delivery' | 'safety' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  vehicle_id?: string
  driver_id?: string
  order_id?: string
  status: 'active' | 'resolved'
  created_at: string
}
