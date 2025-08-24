import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email").unique(),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plate: text("plate").notNull().unique(),
  type: text("type").notNull(), // truck, van, refrigerated
  capacity: decimal("capacity", { precision: 8, scale: 2 }).notNull(), // in tons
  currentLoad: decimal("current_load", { precision: 8, scale: 2 }).default("0"),
  status: text("status").notNull().default("idle"), // idle, active, maintenance, warning
  driverId: varchar("driver_id"),
  driverName: text("driver_name"),
  lastLocation: jsonb("last_location"), // {lat, lng, timestamp}
  fuelLevel: decimal("fuel_level", { precision: 5, scale: 2 }),
  fuelType: text("fuel_type").default("diesel"),
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // for refrigerated vehicles
  maintenanceStatus: text("maintenance_status").default("good"),
  location: text("location"),
  lastMaintenance: text("last_maintenance"),
  nextMaintenance: text("next_maintenance"),
  insuranceExpiry: text("insurance_expiry"),
  registrationExpiry: text("registration_expiry"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address").notNull(),
  location: jsonb("location"), // {lat, lng}
  clientType: text("client_type").notNull(), // supplier, customer, distributor
  priority: text("priority").default("normal"), // low, normal, high, critical
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  clientName: text("client_name").notNull(),
  products: jsonb("products").notNull(), // [{name, quantity, unit, temperature?}]
  totalWeight: decimal("total_weight", { precision: 8, scale: 2 }),
  priority: text("priority").default("normal"),
  status: text("status").notNull().default("pending"), // pending, assigned, in_transit, delivered, cancelled
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  pickupLocation: jsonb("pickup_location"),
  deliveryLocation: jsonb("delivery_location"),
  scheduledPickup: timestamp("scheduled_pickup"),
  scheduledDelivery: timestamp("scheduled_delivery"),
  actualPickup: timestamp("actual_pickup"),
  actualDelivery: timestamp("actual_delivery"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const routes = pgTable("routes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  vehicleId: varchar("vehicle_id"),
  driverId: varchar("driver_id"),
  orderIds: jsonb("order_ids").notNull(), // array of order IDs
  stops: jsonb("stops").notNull(), // [{orderId, address, location, type: pickup|delivery, estimatedTime}]
  status: text("status").default("planned"), // planned, active, completed, cancelled
  totalDistance: decimal("total_distance", { precision: 8, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // minutes
  efficiency: decimal("efficiency", { precision: 5, scale: 2 }), // percentage
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // delay, temperature, capacity, maintenance, traffic
  severity: text("severity").notNull(), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description").notNull(),
  vehicleId: varchar("vehicle_id"),
  routeId: varchar("route_id"),
  orderId: varchar("order_id"),
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deliveries = pgTable("deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  routeId: varchar("route_id"),
  vehicleId: varchar("vehicle_id"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_transit, delivered, failed
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  timeWindow: jsonb("time_window"), // {start, end}
  deliveryNotes: text("delivery_notes"),
  signature: text("signature"),
  photos: jsonb("photos"), // array of photo URLs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  capacity: z.string().or(z.number()),
  currentLoad: z.string().or(z.number()).optional(),
  fuelLevel: z.string().or(z.number()).optional(),
  fuelType: z.string().default("diesel"),
  maintenanceStatus: z.string().default("good"),
  location: z.string().optional(),
  lastMaintenance: z.string().optional(),
  nextMaintenance: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  registrationExpiry: z.string().optional(),
  notes: z.string().optional(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  clientType: z.enum(["customer", "supplier", "distributor"]),
  priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertDeliverySchema = createInsertSchema(deliveries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ERP Logistics Extensions
export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(), // spare_parts, fuel, supplies, tools
  sku: text("sku").notNull().unique(),
  currentStock: integer("current_stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  maxStock: integer("max_stock").notNull().default(100),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  supplier: text("supplier"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  licenseNumber: text("license_number").notNull().unique(),
  licenseClass: text("license_class").notNull(), // A, B, C
  licenseExpiry: date("license_expiry").notNull(),
  medicalCertExpiry: date("medical_cert_expiry"),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  hireDate: date("hire_date").notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const maintenance = pgTable("maintenance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  type: text("type").notNull(), // preventive, corrective, inspection
  description: text("description").notNull(),
  scheduledDate: date("scheduled_date").notNull(),
  completedDate: date("completed_date"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  mileage: integer("mileage"),
  serviceProvider: text("service_provider"),
  status: text("status").notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  priority: text("priority").notNull().default("normal"), // low, normal, high, critical
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fuelLog = pgTable("fuel_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  driverId: varchar("driver_id"),
  liters: decimal("liters", { precision: 8, scale: 2 }).notNull(),
  costPerLiter: decimal("cost_per_liter", { precision: 6, scale: 3 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  odometer: integer("odometer"),
  fuelStation: text("fuel_station"),
  receiptNumber: text("receipt_number"),
  filledAt: text("filled_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // fuel, parts, maintenance, insurance
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  rating: integer("rating").default(5), // 1-5
  contractStart: date("contract_start"),
  contractEnd: date("contract_end"),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  paymentTerms: text("payment_terms"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const approvals = pgTable("approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // expense, purchase, maintenance, route_change
  entityId: text("entity_id").notNull(), // ID of the entity being approved
  requestedBy: text("requested_by").notNull(),
  approvedBy: text("approved_by"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  priority: text("priority").notNull().default("normal"),
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  comments: text("comments"),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // fuel, maintenance, tolls, parking, other
  vehicleId: varchar("vehicle_id"),
  routeId: varchar("route_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  receiptNumber: text("receipt_number"),
  category: text("category").notNull().default("operational"), // operational, administrative, capital
  expenseDate: date("expense_date").notNull(),
  approvalId: varchar("approval_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional Insert Schemas
export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceSchema = createInsertSchema(maintenance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFuelLogSchema = createInsertSchema(fuelLog).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApprovalSchema = createInsertSchema(approvals).omit({
  id: true,
  requestedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;

// ERP Types
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export type Maintenance = typeof maintenance.$inferSelect;
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;

export type FuelLog = typeof fuelLog.$inferSelect;
export type InsertFuelLog = z.infer<typeof insertFuelLogSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Approval = typeof approvals.$inferSelect;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
