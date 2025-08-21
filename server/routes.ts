import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      res.json(vehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Route routes
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const route = await storage.createRoute(req.body);
      res.status(201).json(route);
    } catch (error) {
      console.error("Error creating route:", error);
      res.status(500).json({ message: "Failed to create route" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alert = await storage.createAlert(req.body);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const alert = await storage.markAlertRead(req.params.id);
      res.json(alert);
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  app.patch("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const alert = await storage.markAlertResolved(req.params.id);
      res.json(alert);
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Delivery routes
  app.get("/api/deliveries", async (req, res) => {
    try {
      const deliveries = await storage.getDeliveries();
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const delivery = await storage.createDelivery(req.body);
      res.status(201).json(delivery);
    } catch (error) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ message: "Failed to create delivery" });
    }
  });

  app.patch("/api/deliveries/:id", async (req, res) => {
    try {
      const delivery = await storage.updateDelivery(req.params.id, req.body);
      res.json(delivery);
    } catch (error) {
      console.error("Error updating delivery:", error);
      res.status(500).json({ message: "Failed to update delivery" });
    }
  });

  // ERP Routes - Inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      // Return empty array for now - will be implemented with storage
      res.json([]);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      // Mock creation for now
      const item = { id: Date.now().toString(), ...req.body, createdAt: new Date(), updatedAt: new Date() };
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  // ERP Routes - Drivers
  app.get("/api/drivers", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const driver = { id: Date.now().toString(), ...req.body, createdAt: new Date(), updatedAt: new Date() };
      res.status(201).json(driver);
    } catch (error) {
      console.error("Error creating driver:", error);
      res.status(500).json({ message: "Failed to create driver" });
    }
  });

  // ERP Routes - Maintenance
  app.get("/api/maintenance", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching maintenance:", error);
      res.status(500).json({ message: "Failed to fetch maintenance" });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      const maintenance = { id: Date.now().toString(), ...req.body, createdAt: new Date(), updatedAt: new Date() };
      res.status(201).json(maintenance);
    } catch (error) {
      console.error("Error creating maintenance:", error);
      res.status(500).json({ message: "Failed to create maintenance" });
    }
  });

  // ERP Routes - Fuel
  app.get("/api/fuel", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching fuel logs:", error);
      res.status(500).json({ message: "Failed to fetch fuel logs" });
    }
  });

  app.post("/api/fuel", async (req, res) => {
    try {
      const fuelLog = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
      res.status(201).json(fuelLog);
    } catch (error) {
      console.error("Error creating fuel log:", error);
      res.status(500).json({ message: "Failed to create fuel log" });
    }
  });

  // ERP Routes - Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplier = { id: Date.now().toString(), ...req.body, createdAt: new Date(), updatedAt: new Date() };
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  // ERP Routes - Expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // ERP Routes - Approvals
  app.get("/api/approvals", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  app.post("/api/approvals", async (req, res) => {
    try {
      const approval = { id: Date.now().toString(), ...req.body, requestedAt: new Date() };
      res.status(201).json(approval);
    } catch (error) {
      console.error("Error creating approval:", error);
      res.status(500).json({ message: "Failed to create approval" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
