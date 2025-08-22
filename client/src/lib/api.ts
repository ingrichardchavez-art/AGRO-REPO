import { supabase } from './supabase'
import type { 
  Vehicle, 
  Driver, 
  Order, 
  Route, 
  Client, 
  Inventory, 
  Maintenance, 
  Fuel, 
  Expense, 
  Alert 
} from './supabase'

// API Service para todas las operaciones de logística
export class LogisticsAPI {
  
  // ===== VEHICLES =====
  static async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getVehicle(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicle])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // ===== DRIVERS =====
  static async getDrivers(): Promise<Driver[]> {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getDriver(id: string): Promise<Driver | null> {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createDriver(driver: Omit<Driver, 'id' | 'created_at'>): Promise<Driver> {
    const { data, error } = await supabase
      .from('drivers')
      .insert([driver])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver> {
    const { data, error } = await supabase
      .from('drivers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== ORDERS =====
  static async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async getOrder(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== ROUTES =====
  static async getRoutes(): Promise<Route[]> {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async createRoute(route: Omit<Route, 'id' | 'created_at'>): Promise<Route> {
    const { data, error } = await supabase
      .from('routes')
      .insert([route])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== CLIENTS =====
  static async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== INVENTORY =====
  static async getInventory(): Promise<Inventory[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async updateInventory(id: string, updates: Partial<Inventory>): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== MAINTENANCE =====
  static async getMaintenance(): Promise<Maintenance[]> {
    const { data, error } = await supabase
      .from('maintenance')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async createMaintenance(maintenance: Omit<Maintenance, 'id' | 'created_at'>): Promise<Maintenance> {
    const { data, error } = await supabase
      .from('maintenance')
      .insert([maintenance])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== FUEL =====
  static async getFuel(): Promise<Fuel[]> {
    const { data, error } = await supabase
      .from('fuel')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async createFuel(fuel: Omit<Fuel, 'id' | 'created_at'>): Promise<Fuel> {
    const { data, error } = await supabase
      .from('fuel')
      .insert([fuel])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== EXPENSES =====
  static async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async createExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== ALERTS =====
  static async getAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .insert([alert])
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // ===== DASHBOARD METRICS =====
  static async getDashboardMetrics() {
    const [vehicles, orders, alerts, expenses] = await Promise.all([
      this.getVehicles(),
      this.getOrders(),
      this.getAlerts(),
      this.getExpenses()
    ])

    const activeVehicles = vehicles.filter(v => v.status === 'active').length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length
    const monthlyExpenses = expenses
      .filter(e => {
        const date = new Date(e.date)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      })
      .reduce((sum, e) => sum + e.amount, 0)

    return {
      activeVehicles,
      pendingOrders,
      criticalAlerts,
      monthlyExpenses,
      totalVehicles: vehicles.length,
      totalOrders: orders.length,
      totalDrivers: (await this.getDrivers()).length
    }
  }

  // ===== TRACKING & REAL-TIME =====
  static async updateVehicleLocation(vehicleId: string, lat: number, lng: number) {
    return this.updateVehicle(vehicleId, {
      current_location: { lat, lng },
      updated_at: new Date().toISOString()
    })
  }

  static async assignOrderToVehicle(orderId: string, vehicleId: string, driverId: string) {
    const [orderUpdate, vehicleUpdate] = await Promise.all([
      this.updateOrder(orderId, { 
        vehicle_id: vehicleId, 
        driver_id: driverId, 
        status: 'assigned' 
      }),
      this.updateVehicle(vehicleId, { 
        driver_id: driverId 
      })
    ])

    return { order: orderUpdate, vehicle: vehicleUpdate }
  }

  // ===== SUPPLY CHAIN TRACKING =====
  static async getSupplyChainStatus(orderId: string) {
    const order = await this.getOrder(orderId)
    if (!order) throw new Error('Order not found')

    const vehicle = order.vehicle_id ? await this.getVehicle(order.vehicle_id) : null
    const driver = order.driver_id ? await this.getDriver(order.driver_id) : null

    return {
      order,
      vehicle,
      driver,
      status: order.status,
      estimatedDelivery: order.delivery_date,
      currentLocation: vehicle?.current_location,
      trackingNumber: order.tracking_number
    }
  }
}
