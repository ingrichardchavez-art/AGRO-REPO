import { 
  type User, 
  type InsertUser, 
  type Vehicle, 
  type InsertVehicle,
  type Client,
  type InsertClient,
  type Order,
  type InsertOrder,
  type Route,
  type InsertRoute,
  type Alert,
  type InsertAlert,
  type Delivery,
  type InsertDelivery
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle>;
  
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  
  // Order operations
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;
  
  // Route operations
  getRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: string, updates: Partial<Route>): Promise<Route>;
  
  // Alert operations
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertRead(id: string): Promise<Alert>;
  markAlertResolved(id: string): Promise<Alert>;
  
  // Delivery operations
  getDeliveries(): Promise<Delivery[]>;
  getDelivery(id: string): Promise<Delivery | undefined>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    activeVehicles: number;
    dailyDeliveries: number;
    pendingOrders: number;
    compliance: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private vehicles: Map<string, Vehicle> = new Map();
  private clients: Map<string, Client> = new Map();
  private orders: Map<string, Order> = new Map();
  private routes: Map<string, Route> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private deliveries: Map<string, Delivery> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial data for the application
    const now = new Date();
    
    // Sample vehicles
    const vehicle1: Vehicle = {
      id: "v1",
      plate: "ABC-123",
      type: "truck",
      capacity: "3.5",
      currentLoad: "2.8",
      status: "active",
      driverId: "d1",
      driverName: "María González",
      lastLocation: { lat: -34.6037, lng: -58.3816, timestamp: now.toISOString() },
      fuelLevel: "85.5",
      temperature: null,
      createdAt: now,
      updatedAt: now,
    };

    const vehicle2: Vehicle = {
      id: "v2",
      plate: "XYZ-456", 
      type: "refrigerated",
      capacity: "4.0",
      currentLoad: "4.2",
      status: "warning",
      driverId: "d2",
      driverName: "Carlos Ruiz",
      lastLocation: { lat: -34.5947, lng: -58.3656, timestamp: now.toISOString() },
      fuelLevel: "62.3",
      temperature: "12.0",
      createdAt: now,
      updatedAt: now,
    };

    this.vehicles.set(vehicle1.id, vehicle1);
    this.vehicles.set(vehicle2.id, vehicle2);

    // Sample clients
    const client1: Client = {
      id: "c1",
      name: "Supermercado Central",
      email: "compras@supercentral.com",
      phone: "+54 11 1234-5678",
      address: "Av. Corrientes 1234, Buenos Aires",
      location: { lat: -34.6037, lng: -58.3816 },
      clientType: "customer",
      priority: "high",
      createdAt: now,
    };

    this.clients.set(client1.id, client1);

    // Sample orders
    const order1: Order = {
      id: "o1",
      clientId: "c1",
      clientName: "Supermercado Central",
      products: [
        { name: "Frutas y verduras frescas", quantity: 150, unit: "kg" },
        { name: "Lácteos", quantity: 50, unit: "kg", temperature: "2-8°C" }
      ],
      totalWeight: "200",
      priority: "high",
      status: "in_transit",
      pickupAddress: "Mercado Central, La Matanza",
      deliveryAddress: "Av. Corrientes 1234, Buenos Aires",
      pickupLocation: { lat: -34.7500, lng: -58.6167 },
      deliveryLocation: { lat: -34.6037, lng: -58.3816 },
      scheduledPickup: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      scheduledDelivery: new Date(now.getTime() + 1.5 * 60 * 60 * 1000), // 1.5 hours from now
      actualPickup: null,
      actualDelivery: null,
      specialInstructions: "Mantener cadena de frío para lácteos",
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(order1.id, order1);

    // Sample alerts
    const alert1: Alert = {
      id: "a1",
      type: "delay",
      severity: "high",
      title: "Vehículo V-003 con retraso",
      description: "45 min de retraso en ruta R-127",
      vehicleId: "v2",
      routeId: null,
      orderId: null,
      isRead: false,
      isResolved: false,
      createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
    };

    const alert2: Alert = {
      id: "a2",
      type: "temperature",
      severity: "medium",
      title: "Temperatura crítica",
      description: "Carga refrigerada a 12°C",
      vehicleId: "v2",
      routeId: null,
      orderId: "o1",
      isRead: false,
      isResolved: false,
      createdAt: new Date(now.getTime() - 8 * 60 * 1000), // 8 minutes ago
    };

    this.alerts.set(alert1.id, alert1);
    this.alerts.set(alert2.id, alert2);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || "user"
    };
    this.users.set(id, user);
    return user;
  }

  // Vehicle operations
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      ...insertVehicle,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) throw new Error("Vehicle not found");
    
    const updatedVehicle = { ...vehicle, ...updates, updatedAt: new Date() };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  // Client operations  
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = {
      ...insertClient,
      id,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Route operations
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const route: Route = {
      ...insertRoute,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route> {
    const route = this.routes.get(id);
    if (!route) throw new Error("Route not found");
    
    const updatedRoute = { ...route, ...updates, updatedAt: new Date() };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  // Alert operations
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertRead(id: string): Promise<Alert> {
    const alert = this.alerts.get(id);
    if (!alert) throw new Error("Alert not found");
    
    const updatedAlert = { ...alert, isRead: true };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async markAlertResolved(id: string): Promise<Alert> {
    const alert = this.alerts.get(id);
    if (!alert) throw new Error("Alert not found");
    
    const updatedAlert = { ...alert, isResolved: true, isRead: true };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // Delivery operations
  async getDeliveries(): Promise<Delivery[]> {
    return Array.from(this.deliveries.values());
  }

  async getDelivery(id: string): Promise<Delivery | undefined> {
    return this.deliveries.get(id);
  }

  async createDelivery(insertDelivery: InsertDelivery): Promise<Delivery> {
    const id = randomUUID();
    const delivery: Delivery = {
      ...insertDelivery,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deliveries.set(id, delivery);
    return delivery;
  }

  async updateDelivery(id: string, updates: Partial<Delivery>): Promise<Delivery> {
    const delivery = this.deliveries.get(id);
    if (!delivery) throw new Error("Delivery not found");
    
    const updatedDelivery = { ...delivery, ...updates, updatedAt: new Date() };
    this.deliveries.set(id, updatedDelivery);
    return updatedDelivery;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    activeVehicles: number;
    dailyDeliveries: number;
    pendingOrders: number;
    compliance: number;
  }> {
    const vehicles = await this.getVehicles();
    const orders = await this.getOrders();
    const deliveries = await this.getDeliveries();
    
    const activeVehicles = vehicles.filter(v => v.status === "active").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dailyDeliveries = deliveries.filter(d => {
      const deliveryDate = new Date(d.createdAt);
      return deliveryDate >= today && deliveryDate < tomorrow && d.status === "delivered";
    }).length;
    
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    
    const totalDeliveries = deliveries.length;
    const successfulDeliveries = deliveries.filter(d => d.status === "delivered").length;
    const compliance = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
    
    return {
      activeVehicles,
      dailyDeliveries,
      pendingOrders,
      compliance: Math.round(compliance * 10) / 10,
    };
  }
}

export const storage = new MemStorage();
