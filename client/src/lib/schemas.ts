import { z } from 'zod'

// Esquema para crear un pedido
export const createOrderSchema = z.object({
  client_id: z.string().min(1, "Debe seleccionar un cliente"),
  client_name: z.string().min(1, "El nombre del cliente es requerido"),
  pickup_address: z.string().min(1, "La dirección de recogida es requerida"),
  delivery_address: z.string().min(1, "La dirección de entrega es requerida"),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Debe seleccionar una prioridad"
  }),
  pickup_date: z.date({
    required_error: "Debe seleccionar una fecha de recogida"
  }),
  delivery_date: z.date({
    required_error: "Debe seleccionar una fecha de entrega"
  }),
  weight: z.number().min(0.1, "El peso debe ser mayor a 0"),
  volume: z.number().min(0.1, "El volumen debe ser mayor a 0"),
  special_instructions: z.string().optional(),
  products: z.array(z.object({
    name: z.string().min(1, "El nombre del producto es requerido"),
    quantity: z.number().min(0.1, "La cantidad debe ser mayor a 0"),
    unit: z.string().min(1, "La unidad es requerida")
  })).min(1, "Debe agregar al menos un producto")
})

// Esquema para actualizar un pedido
export const updateOrderSchema = z.object({
  status: z.enum(["pending", "assigned", "in_transit", "delivered", "cancelled"]).optional(),
  vehicle_id: z.string().optional(),
  driver_id: z.string().optional(),
  delivery_date: z.date().optional(),
  special_instructions: z.string().optional()
})

// Esquema para crear un cliente
export const createClientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  type: z.enum(["retail", "wholesale", "industrial"], {
    required_error: "Debe seleccionar un tipo de cliente"
  }),
  credit_limit: z.number().min(0, "El límite de crédito debe ser mayor o igual a 0"),
  payment_terms: z.string().min(1, "Los términos de pago son requeridos")
})

// Esquema para crear un vehículo
export const createVehicleSchema = z.object({
  plate: z.string().min(1, "La placa es requerida"),
  type: z.enum(["truck", "van", "car", "motorcycle"], {
    required_error: "Debe seleccionar un tipo de vehículo"
  }),
  capacity: z.number().min(0.1, "La capacidad debe ser mayor a 0"),
  fuel_type: z.enum(["diesel", "gasoline", "electric", "hybrid"], {
    required_error: "Debe seleccionar un tipo de combustible"
  }),
  fuel_level: z.number().min(0).max(100, "El nivel de combustible debe estar entre 0 y 100"),
  last_maintenance: z.string().min(1, "La fecha del último mantenimiento es requerida"),
  next_maintenance: z.string().min(1, "La fecha del próximo mantenimiento es requerida")
})

// Esquema para crear un conductor
export const createDriverSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  license_number: z.string().min(1, "El número de licencia es requerido"),
  license_type: z.string().min(1, "El tipo de licencia es requerido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido"),
  rating: z.number().min(1).max(5, "La calificación debe estar entre 1 y 5")
})

// Esquema para crear un gasto
export const createExpenseSchema = z.object({
  category: z.enum(["fuel", "maintenance", "tolls", "insurance", "other"], {
    required_error: "Debe seleccionar una categoría"
  }),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  description: z.string().min(1, "La descripción es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
  vehicle_id: z.string().optional(),
  driver_id: z.string().optional()
})

// Esquema para crear combustible
export const createFuelSchema = z.object({
  vehicle_id: z.string().min(1, "Debe seleccionar un vehículo"),
  quantity: z.number().min(0.1, "La cantidad debe ser mayor a 0"),
  cost_per_liter: z.number().min(0.01, "El costo por litro debe ser mayor a 0"),
  location: z.string().min(1, "La ubicación es requerida"),
  fuel_type: z.enum(["diesel", "gasoline"], {
    required_error: "Debe seleccionar un tipo de combustible"
  })
})

// Esquema para crear mantenimiento
export const createMaintenanceSchema = z.object({
  vehicle_id: z.string().min(1, "Debe seleccionar un vehículo"),
  type: z.enum(["preventive", "corrective", "emergency"], {
    required_error: "Debe seleccionar un tipo de mantenimiento"
  }),
  description: z.string().min(1, "La descripción es requerida"),
  cost: z.number().min(0, "El costo debe ser mayor o igual a 0"),
  date: z.string().min(1, "La fecha es requerida"),
  mechanic: z.string().min(1, "El nombre del mecánico es requerido"),
  next_maintenance: z.string().optional()
})

// Tipos derivados de los esquemas
export type CreateOrder = z.infer<typeof createOrderSchema>
export type UpdateOrder = z.infer<typeof updateOrderSchema>
export type CreateClient = z.infer<typeof createClientSchema>
export type CreateVehicle = z.infer<typeof createVehicleSchema>
export type CreateDriver = z.infer<typeof createDriverSchema>
export type CreateExpense = z.infer<typeof createExpenseSchema>
export type CreateFuel = z.infer<typeof createFuelSchema>
export type CreateMaintenance = z.infer<typeof createMaintenanceSchema>
