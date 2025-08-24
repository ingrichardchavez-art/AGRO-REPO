// API Service para todas las operaciones de logística usando el servidor local
export class LogisticsAPI {
  
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  private static async apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }
  
  // ===== VEHICLES =====
  static async getVehicles(): Promise<any[]> {
    return this.apiRequest('/api/vehicles');
  }

  static async getVehicle(id: string): Promise<any | null> {
    return this.apiRequest(`/api/vehicles/${id}`);
  }

  static async createVehicle(vehicle: any): Promise<any> {
    return this.apiRequest('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  }

  static async updateVehicle(id: string, updates: any): Promise<any> {
    return this.apiRequest(`/api/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async deleteVehicle(id: string): Promise<void> {
    await this.apiRequest(`/api/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== DRIVERS =====
  static async getDrivers(): Promise<any[]> {
    return this.apiRequest('/api/drivers');
  }

  static async getDriver(id: string): Promise<any | null> {
    return this.apiRequest(`/api/drivers/${id}`);
  }

  static async createDriver(driver: any): Promise<any> {
    return this.apiRequest('/api/drivers', {
      method: 'POST',
      body: JSON.stringify(driver),
    });
  }

  static async updateDriver(id: string, updates: any): Promise<any> {
    return this.apiRequest(`/api/drivers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ===== ORDERS =====
  static async getOrders(): Promise<any[]> {
    return this.apiRequest('/api/orders');
  }

  static async getOrder(id: string): Promise<any | null> {
    return this.apiRequest(`/api/orders/${id}`);
  }

  static async createOrder(order: any): Promise<any> {
    return this.apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  static async updateOrder(id: string, updates: any): Promise<any> {
    return this.apiRequest(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ===== ROUTES =====
  static async getRoutes(): Promise<any[]> {
    return this.apiRequest('/api/routes');
  }

  static async createRoute(route: any): Promise<any> {
    return this.apiRequest('/api/routes', {
      method: 'POST',
      body: JSON.stringify(route),
    });
  }

  // ===== CLIENTS =====
  static async getClients(): Promise<any[]> {
    return this.apiRequest('/api/clients');
  }

  static async createClient(client: any): Promise<any> {
    return this.apiRequest('/api/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  // ===== INVENTORY =====
  static async getInventory(): Promise<any[]> {
    return this.apiRequest('/api/inventory');
  }

  static async createInventoryItem(item: any): Promise<any> {
    return this.apiRequest('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  static async updateInventory(id: string, updates: any): Promise<any> {
    return this.apiRequest(`/api/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ===== MAINTENANCE =====
  static async getMaintenance(): Promise<any[]> {
    return this.apiRequest('/api/maintenance');
  }

  static async createMaintenance(maintenance: any): Promise<any> {
    return this.apiRequest('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify(maintenance),
    });
  }

  // ===== FUEL =====
  static async getFuel(): Promise<any[]> {
    return this.apiRequest('/api/fuel');
  }

  static async createFuel(fuel: any): Promise<any> {
    return this.apiRequest('/api/fuel', {
      method: 'POST',
      body: JSON.stringify(fuel),
    });
  }

  // ===== EXPENSES =====
  static async getExpenses(): Promise<any[]> {
    return this.apiRequest('/api/expenses');
  }

  static async createExpense(expense: any): Promise<any> {
    return this.apiRequest('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  // ===== ALERTS =====
  static async getAlerts(): Promise<any[]> {
    return this.apiRequest('/api/alerts');
  }

  static async createAlert(alert: any): Promise<any> {
    return this.apiRequest('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  // ===== DASHBOARD METRICS =====
  static async getDashboardMetrics() {
    return this.apiRequest('/api/dashboard/metrics');
  }

  // ===== TRACKING & REAL-TIME =====
  static async updateVehicleLocation(vehicleId: string, lat: number, lng: number) {
    return this.updateVehicle(vehicleId, {
      location_lat: lat,
      location_lng: lng,
      updated_at: new Date().toISOString()
    });
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
    ]);

    return { order: orderUpdate, vehicle: vehicleUpdate };
  }

  // ===== SUPPLY CHAIN TRACKING =====
  static async getSupplyChainStatus(orderId: string) {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const vehicle = order.vehicle_id ? await this.getVehicle(order.vehicle_id) : null;
    const driver = order.driver_id ? await this.getDriver(order.driver_id) : null;

    return {
      order,
      vehicle,
      driver,
      status: order.status,
      estimatedDelivery: order.delivery_date,
      currentLocation: vehicle ? { lat: vehicle.location_lat, lng: vehicle.location_lng } : null,
      trackingNumber: order.id
    };
  }
}
