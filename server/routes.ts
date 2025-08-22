import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase, inMemoryData } from "./supabase";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard metrics
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      if (supabase) {
        const { data: vehicles } = await supabase.from('vehicles').select('*').eq('status', 'active');
        const { data: orders } = await supabase.from('orders').select('*').eq('status', 'delivered');
        
        const metrics = {
          activeVehicles: vehicles?.length || 0,
          dailyDeliveries: orders?.length || 0,
          totalRevenue: 0,
          pendingOrders: 0
        };
        res.json(metrics);
      } else {
        // Usar datos en memoria
        const activeVehicles = inMemoryData.vehicles.filter(v => v.status === 'active');
        const deliveredOrders = inMemoryData.orders.filter(o => o.status === 'delivered');
        
        const metrics = {
          activeVehicles: activeVehicles.length,
          dailyDeliveries: deliveredOrders.length,
          totalRevenue: 0,
          pendingOrders: 0
        };
        res.json(metrics);
      }
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      if (supabase) {
        const { data: vehicles, error } = await supabase.from('vehicles').select('*');
        if (error) throw error;
        res.json(vehicles);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.vehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      if (supabase) {
        const { data: vehicle, error } = await supabase.from('vehicles').select('*').eq('id', req.params.id).single();
        if (error) throw error;
        if (!vehicle) {
          return res.status(404).json({ message: "Vehicle not found" });
        }
        res.json(vehicle);
      } else {
        // Usar datos en memoria
        const vehicle = inMemoryData.vehicles.find(v => v.id === req.params.id);
        if (!vehicle) {
          return res.status(404).json({ message: "Vehicle not found" });
        }
        res.json(vehicle);
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ message: "Failed to fetch vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      if (supabase) {
        const { data: vehicle, error } = await supabase.from('vehicles').update(req.body).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(vehicle);
      } else {
        // Usar datos en memoria
        const index = inMemoryData.vehicles.findIndex(v => v.id === req.params.id);
        if (index === -1) {
          return res.status(404).json({ message: "Vehicle not found" });
        }
        inMemoryData.vehicles[index] = { ...inMemoryData.vehicles[index], ...req.body, updatedAt: new Date() };
        res.json(inMemoryData.vehicles[index]);
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ message: "Failed to update vehicle" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      if (supabase) {
        const { data: clients, error } = await supabase.from('clients').select('*');
        if (error) throw error;
        res.json(clients);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.clients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      if (supabase) {
        const { data: orders, error } = await supabase.from('orders').select('*');
        if (error) throw error;
        res.json(orders);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      if (supabase) {
        const { data: order, error } = await supabase.from('orders').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(order);
      } else {
        // Usar datos en memoria
        const newOrder = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryData.orders.push(newOrder);
        res.status(201).json(newOrder);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      if (supabase) {
        const { data: order, error } = await supabase.from('orders').update(req.body).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(order);
      } else {
        // Usar datos en memoria
        const index = inMemoryData.orders.findIndex(o => o.id === req.params.id);
        if (index === -1) {
          return res.status(404).json({ message: "Order not found" });
        }
        inMemoryData.orders[index] = { ...inMemoryData.orders[index], ...req.body, updatedAt: new Date() };
        res.json(inMemoryData.orders[index]);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Route routes
  app.get("/api/routes", async (req, res) => {
    try {
      if (supabase) {
        const { data: routes, error } = await supabase.from('routes').select('*');
        if (error) throw error;
        res.json(routes);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.routes);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      if (supabase) {
        const { data: route, error } = await supabase.from('routes').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(route);
      } else {
        // Usar datos en memoria
        const newRoute = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryData.routes.push(newRoute);
        res.status(201).json(newRoute);
      }
    } catch (error) {
      console.error("Error creating route:", error);
      res.status(500).json({ message: "Failed to create route" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      if (supabase) {
        const { data: alerts, error } = await supabase.from('alerts').select('*');
        if (error) throw error;
        res.json(alerts);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.alerts);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      if (supabase) {
        const { data: alert, error } = await supabase.from('alerts').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(alert);
      } else {
        // Usar datos en memoria
        const newAlert = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryData.alerts.push(newAlert);
        res.status(201).json(newAlert);
      }
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      if (supabase) {
        const { data: alert, error } = await supabase.from('alerts').update({ read: true }).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(alert);
      } else {
        // Usar datos en memoria
        const index = inMemoryData.alerts.findIndex(a => a.id === req.params.id);
        if (index === -1) {
          return res.status(404).json({ message: "Alert not found" });
        }
        inMemoryData.alerts[index].read = true;
        inMemoryData.alerts[index].updatedAt = new Date();
        res.json(inMemoryData.alerts[index]);
      }
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  app.patch("/api/alerts/:id/resolve", async (req, res) => {
    try {
      if (supabase) {
        const { data: alert, error } = await supabase.from('alerts').update({ resolved: true }).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(alert);
      } else {
        // Usar datos en memoria
        const index = inMemoryData.alerts.findIndex(a => a.id === req.params.id);
        if (index === -1) {
          return res.status(404).json({ message: "Alert not found" });
        }
        inMemoryData.alerts[index].resolved = true;
        inMemoryData.alerts[index].updatedAt = new Date();
        res.json(inMemoryData.alerts[index]);
      }
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Delivery routes
  app.get("/api/deliveries", async (req, res) => {
    try {
      // Mock data for deliveries
      const deliveries = [
        {
          id: "1",
          orderId: "1",
          vehicleId: "1",
          driverId: "1",
          status: "in_transit",
          estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdAt: new Date()
        }
      ];
      res.json(deliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      res.status(500).json({ message: "Failed to fetch deliveries" });
    }
  });

  app.post("/api/deliveries", async (req, res) => {
    try {
      const delivery = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
      res.status(201).json(delivery);
    } catch (error) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ message: "Failed to create delivery" });
    }
  });

  app.patch("/api/deliveries/:id", async (req, res) => {
    try {
      const delivery = { id: req.params.id, ...req.body, updatedAt: new Date() };
      res.json(delivery);
    } catch (error) {
      console.error("Error updating delivery:", error);
      res.status(500).json({ message: "Failed to update delivery" });
    }
  });

  // ERP Routes - Inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      if (supabase) {
        const { data: inventory, error } = await supabase.from('inventory').select('*');
        if (error) throw error;
        res.json(inventory);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.inventory);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      if (supabase) {
        const { data: item, error } = await supabase.from('inventory').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(item);
      } else {
        // Usar datos en memoria
        const newItem = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryData.inventory.push(newItem);
        res.status(201).json(newItem);
      }
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  // ERP Routes - Drivers
  app.get("/api/drivers", async (req, res) => {
    try {
      if (supabase) {
        const { data: drivers, error } = await supabase.from('drivers').select('*');
        if (error) throw error;
        res.json(drivers);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.drivers);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      if (supabase) {
        const { data: driver, error } = await supabase.from('drivers').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(driver);
      } else {
        // Usar datos en memoria
        const newDriver = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryData.drivers.push(newDriver);
        res.status(201).json(newDriver);
      }
    } catch (error) {
      console.error("Error creating driver:", error);
      res.status(500).json({ message: "Failed to create driver" });
    }
  });

  // ERP Routes - Maintenance
  app.get("/api/maintenance", async (req, res) => {
    try {
      if (supabase) {
        const { data: maintenance, error } = await supabase.from('maintenance').select('*');
        if (error) throw error;
        res.json(maintenance);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.maintenance);
      }
    } catch (error) {
      console.error("Error fetching maintenance:", error);
      res.status(500).json({ message: "Failed to fetch maintenance" });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      if (supabase) {
        const { data: maintenance, error } = await supabase.from('maintenance').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(maintenance);
      } else {
        // Usar datos en memoria
        const newMaintenance = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inMemoryData.maintenance.push(newMaintenance);
        res.status(201).json(newMaintenance);
      }
    } catch (error) {
      console.error("Error creating maintenance:", error);
      res.status(500).json({ message: "Failed to create maintenance" });
    }
  });

  // ERP Routes - Fuel
  app.get("/api/fuel", async (req, res) => {
    try {
      if (supabase) {
        const { data: fuel, error } = await supabase.from('fuel').select('*');
        if (error) throw error;
        res.json(fuel);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.fuel);
      }
    } catch (error) {
      console.error("Error fetching fuel logs:", error);
      res.status(500).json({ message: "Failed to fetch fuel logs" });
    }
  });

  app.post("/api/fuel", async (req, res) => {
    try {
      if (supabase) {
        const { data: fuelLog, error } = await supabase.from('fuel').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(fuelLog);
      } else {
        // Usar datos en memoria
        const newFuelLog = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date()
        };
        inMemoryData.fuel.push(newFuelLog);
        res.status(201).json(newFuelLog);
      }
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
      if (supabase) {
        const { data: expenses, error } = await supabase.from('expenses').select('*');
        if (error) throw error;
        res.json(expenses);
      } else {
        // Usar datos en memoria
        res.json(inMemoryData.expenses);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      if (supabase) {
        const { data: expense, error } = await supabase.from('expenses').insert(req.body).select().single();
        if (error) throw error;
        res.status(201).json(expense);
      } else {
        // Usar datos en memoria
        const newExpense = {
          id: Date.now().toString(),
          ...req.body,
          createdAt: new Date()
        };
        inMemoryData.expenses.push(newExpense);
        res.status(201).json(newExpense);
      }
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // ERP Routes - Finances (NUEVA RUTA)
  app.get("/api/finances", async (req, res) => {
    try {
      // Mock data for finances
      const finances = {
        revenue: {
          total: 125000,
          monthly: 15000,
          weekly: 3500
        },
        expenses: {
          total: 85000,
          monthly: 12000,
          weekly: 2800
        },
        profit: {
          total: 40000,
          monthly: 3000,
          weekly: 700
        },
        outstandingInvoices: 15000,
        cashFlow: [
          { month: "Ene", revenue: 12000, expenses: 11000 },
          { month: "Feb", revenue: 13500, expenses: 12500 },
          { month: "Mar", revenue: 15000, expenses: 12000 }
        ]
      };
      res.json(finances);
    } catch (error) {
      console.error("Error fetching finances:", error);
      res.status(500).json({ message: "Failed to fetch finances" });
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
