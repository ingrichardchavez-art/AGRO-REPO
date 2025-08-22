import { createClient } from '@supabase/supabase-js'

// Definir tipos para los datos en memoria
interface Vehicle {
  id: string;
  plate: string;
  type: string;
  capacity: number;
  fuel_type: string;
  fuel_level: number;
  status: string;
  last_maintenance: string;
  next_maintenance: string;
  location_lat: number;
  location_lng: number;
  created_at: string;
  updated_at: string;
}

interface Driver {
  id: string;
  name: string;
  license_number: string;
  license_type: string;
  phone: string;
  email: string;
  status: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  credit_limit: number;
  payment_terms: string;
  created_at: string;
  updated_at: string;
}

interface InventoryItem {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  supplier: string;
  expiry_date: string;
  location: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  client_id: string;
  client_name: string;
  pickup_address: string;
  delivery_address: string;
  status: string;
  priority: string;
  pickup_date: string;
  delivery_date: string;
  weight: number;
  volume: number;
  vehicle_id?: string;
  driver_id?: string;
  special_instructions: string;
  products: string;
  created_at: string;
  updated_at: string;
}

interface Route {
  id: string;
  name: string;
  description: string;
  vehicle_id: string;
  driver_id: string;
  status: string;
  start_location: string;
  end_location: string;
  estimated_duration: number;
  distance: number;
  waypoints: string;
  created_at: string;
  updated_at: string;
}

interface Maintenance {
  id: string;
  vehicle_id: string;
  type: string;
  description: string;
  cost: number;
  date: string;
  status: string;
  mechanic: string;
  created_at: string;
  updated_at: string;
}

interface FuelLog {
  id: string;
  vehicle_id: string;
  liters: number;
  cost: number;
  date: string;
  created_at: string;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: string;
  vehicle_id?: string;
  created_at: string;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: string;
  read: boolean;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

// Para desarrollo, usamos datos en memoria si no hay credenciales de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

// Verificar si las credenciales son válidas
const hasValidCredentials = supabaseUrl !== 'https://your-project.supabase.co' && supabaseServiceKey !== 'your-service-role-key'

export const supabase = hasValidCredentials ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

// Datos en memoria para desarrollo con tipos explícitos
export const inMemoryData: {
  vehicles: Vehicle[];
  drivers: Driver[];
  orders: Order[];
  routes: Route[];
  clients: Client[];
  inventory: InventoryItem[];
  maintenance: Maintenance[];
  fuel: FuelLog[];
  expenses: Expense[];
  alerts: Alert[];
} = {
  vehicles: [],
  drivers: [],
  orders: [],
  routes: [],
  clients: [],
  inventory: [],
  maintenance: [],
  fuel: [],
  expenses: [],
  alerts: []
}

// Configuración de la base de datos
export const dbConfig = {
  tables: {
    vehicles: 'vehicles',
    drivers: 'drivers',
    orders: 'orders',
    routes: 'routes',
    clients: 'clients',
    inventory: 'inventory',
    maintenance: 'maintenance',
    fuel: 'fuel',
    expenses: 'expenses',
    alerts: 'alerts'
  }
}

// Función para inicializar la base de datos con datos de ejemplo
export async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando base de datos...')

    if (supabase) {
      // Usar Supabase si está configurado
      const { data: existingVehicles } = await supabase
        .from('vehicles')
        .select('id')
        .limit(1)

      if (existingVehicles && existingVehicles.length > 0) {
        console.log('✅ Base de datos Supabase ya contiene datos')
        return
      }

      // Insertar datos de ejemplo en Supabase
      await insertSampleData()
      console.log('✅ Base de datos Supabase inicializada con datos de ejemplo')
    } else {
      // Usar datos en memoria para desarrollo
      console.log('📝 Usando datos en memoria para desarrollo')
      await insertInMemoryData()
      console.log('✅ Datos en memoria inicializados')
    }
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error)
    // Fallback a datos en memoria
    console.log('📝 Fallback a datos en memoria')
    await insertInMemoryData()
  }
}

// Insertar datos en memoria para desarrollo
async function insertInMemoryData() {
  console.log("📦 Insertando datos de ejemplo en memoria...");
  
  // Vehículos de ejemplo
  inMemoryData.vehicles = [
    {
      id: 'v1',
      plate: 'ABC-123',
      type: 'truck',
      capacity: 5000,
      fuel_type: 'diesel',
      fuel_level: 75,
      status: 'active',
      last_maintenance: '2024-01-15',
      next_maintenance: '2024-04-15',
      location_lat: 4.6097,
      location_lng: -74.0817,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'v2',
      plate: 'DEF-456',
      type: 'van',
      capacity: 2000,
      fuel_type: 'gasoline',
      fuel_level: 60,
      status: 'active',
      last_maintenance: '2024-02-01',
      next_maintenance: '2024-05-01',
      location_lat: 4.6482,
      location_lng: -74.0789,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'v3',
      plate: 'GHI-789',
      type: 'truck',
      capacity: 8000,
      fuel_type: 'diesel',
      fuel_level: 90,
      status: 'maintenance',
      last_maintenance: '2024-03-10',
      next_maintenance: '2024-06-10',
      location_lat: 4.5981,
      location_lng: -74.0758,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Conductores de ejemplo
  inMemoryData.drivers = [
    {
      id: 'd1',
      name: 'Juan Pérez',
      license_number: 'LIC-001',
      license_type: 'B2',
      phone: '+57 300 123 4567',
      email: 'juan.perez@agro.com',
      status: 'active',
      rating: 4.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'd2',
      name: 'María González',
      license_number: 'LIC-002',
      license_type: 'C1',
      phone: '+57 301 234 5678',
      email: 'maria.gonzalez@agro.com',
      status: 'active',
      rating: 4.9,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'd3',
      name: 'Carlos Rodríguez',
      license_number: 'LIC-003',
      license_type: 'B2',
      phone: '+57 302 345 6789',
      email: 'carlos.rodriguez@agro.com',
      status: 'on_leave',
      rating: 4.6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'd4',
      name: 'Ana López',
      license_number: 'LIC-004',
      license_type: 'C1',
      phone: '+57 303 456 7890',
      email: 'ana.lopez@agro.com',
      status: 'active',
      rating: 4.7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Clientes de ejemplo
  inMemoryData.clients = [
    {
      id: 'c1',
      name: 'Supermercado Central',
      email: 'compras@supercentral.com',
      phone: '+57 601 234 5678',
      address: 'Calle 100 #50-25, Bogotá',
      type: 'retail',
      credit_limit: 10000000,
      payment_terms: '30 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c2',
      name: 'Distribuidora El Mayorista',
      email: 'pedidos@mayorista.com',
      phone: '+57 602 345 6789',
      address: 'Carrera 68 #13-45, Bogotá',
      type: 'wholesale',
      credit_limit: 25000000,
      payment_terms: '45 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c3',
      name: 'Restaurante Gourmet Plaza',
      email: 'chef@gourmetplaza.com',
      phone: '+57 603 456 7890',
      address: 'Zona Rosa, Calle 82 #12-18, Bogotá',
      type: 'retail',
      credit_limit: 5000000,
      payment_terms: '15 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c4',
      name: 'Procesadora Industrial Agro',
      email: 'compras@procesadora.com',
      phone: '+57 604 567 8901',
      address: 'Zona Industrial, Calle 13 Sur #45-67, Bogotá',
      type: 'industrial',
      credit_limit: 50000000,
      payment_terms: '60 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c5',
      name: 'Mercado Campesino del Norte',
      email: 'gerencia@mercadocampesino.com',
      phone: '+57 605 678 9012',
      address: 'Calle 170 #7-85, Bogotá',
      type: 'wholesale',
      credit_limit: 15000000,
      payment_terms: '30 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Inventario de ejemplo
  inMemoryData.inventory = [
    {
      id: 'inv1',
      product_name: 'Banano Premium',
      category: 'frutas',
      quantity: 5000,
      unit: 'kg',
      price_per_unit: 2500,
      supplier: 'Finca La Esperanza',
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega A - Sección 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv2',
      product_name: 'Aguacate Hass',
      category: 'frutas',
      quantity: 2000,
      unit: 'kg',
      price_per_unit: 4500,
      supplier: 'Cultivos del Valle',
      expiry_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega A - Sección 2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv3',
      product_name: 'Papa Criolla',
      category: 'tuberculos',
      quantity: 8000,
      unit: 'kg',
      price_per_unit: 1800,
      supplier: 'Cooperativa Andina',
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega B - Sección 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv4',
      product_name: 'Tomate Chonto',
      category: 'verduras',
      quantity: 3000,
      unit: 'kg',
      price_per_unit: 3200,
      supplier: 'Invernaderos del Sol',
      expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega A - Sección 3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv5',
      product_name: 'Cebolla Cabezona',
      category: 'verduras',
      quantity: 4500,
      unit: 'kg',
      price_per_unit: 2800,
      supplier: 'Agricultores Unidos',
      expiry_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega B - Sección 2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Pedidos de ejemplo
  inMemoryData.orders = [
    {
      id: 'o1',
      client_id: 'c1',
      client_name: 'Supermercado Central',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Calle 100 #50-25, Bogotá',
      status: 'pending',
      priority: 'high',
      pickup_date: new Date().toISOString(),
      delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      weight: 500,
      volume: 50,
      special_instructions: 'Producto refrigerado - mantener cadena de frío',
      products: JSON.stringify([
        { name: 'Banano Premium', quantity: 300, unit: 'kg' },
        { name: 'Aguacate Hass', quantity: 200, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'o2',
      client_id: 'c2',
      client_name: 'Distribuidora El Mayorista',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Carrera 68 #13-45, Bogotá',
      status: 'assigned',
      priority: 'medium',
      pickup_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      weight: 1200,
      volume: 120,
      vehicle_id: 'v1',
      driver_id: 'd1',
      special_instructions: 'Entrega en horario matutino',
      products: JSON.stringify([
        { name: 'Papa Criolla', quantity: 800, unit: 'kg' },
        { name: 'Cebolla Cabezona', quantity: 400, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'o3',
      client_id: 'c3',
      client_name: 'Restaurante Gourmet Plaza',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Zona Rosa, Calle 82 #12-18, Bogotá',
      status: 'in_transit',
      priority: 'urgent',
      pickup_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      weight: 150,
      volume: 25,
      vehicle_id: 'v2',
      driver_id: 'd2',
      special_instructions: 'Producto de alta calidad para restaurante gourmet',
      products: JSON.stringify([
        { name: 'Aguacate Hass', quantity: 50, unit: 'kg' },
        { name: 'Tomate Chonto', quantity: 100, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'o4',
      client_id: 'c4',
      client_name: 'Procesadora Industrial Agro',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Zona Industrial, Calle 13 Sur #45-67, Bogotá',
      status: 'delivered',
      priority: 'low',
      pickup_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 2000,
      volume: 200,
      vehicle_id: 'v1',
      driver_id: 'd1',
      special_instructions: 'Carga industrial - verificar peso en báscula',
      products: JSON.stringify([
        { name: 'Papa Criolla', quantity: 2000, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'o5',
      client_id: 'c5',
      client_name: 'Mercado Campesino del Norte',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Calle 170 #7-85, Bogotá',
      status: 'cancelled',
      priority: 'medium',
      pickup_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
      weight: 800,
      volume: 80,
      special_instructions: 'Pedido cancelado por cliente',
      products: JSON.stringify([
        { name: 'Banano Premium', quantity: 400, unit: 'kg' },
        {name: 'Tomate Chonto', quantity: 400, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Rutas de ejemplo
  inMemoryData.routes = [
    {
      id: 'r1',
      name: 'Ruta Norte Bogotá',
      description: 'Distribución zona norte de Bogotá',
      vehicle_id: 'v1',
      driver_id: 'd1',
      status: 'active',
      start_location: 'Bodega Central',
      end_location: 'Zona Norte',
      estimated_duration: 4,
      distance: 25.5,
      waypoints: JSON.stringify([
        { lat: 4.6097, lng: -74.0817, name: 'Bodega Central' },
        { lat: 4.6482, lng: -74.0789, name: 'Supermercado Central' },
        { lat: 4.6700, lng: -74.0500, name: 'Mercado del Norte' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'r2',
      name: 'Ruta Centro Comercial',
      description: 'Entrega en centros comerciales zona rosa',
      vehicle_id: 'v2',
      driver_id: 'd2',
      status: 'in_progress',
      start_location: 'Bodega Central',
      end_location: 'Zona Rosa',
      estimated_duration: 2.5,
      distance: 15.2,
      waypoints: JSON.stringify([
        { lat: 4.6097, lng: -74.0817, name: 'Bodega Central' },
        { lat: 4.6482, lng: -74.0600, name: 'Zona Rosa' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Mantenimiento de ejemplo
  inMemoryData.maintenance = [
    {
      id: 'm1',
      vehicle_id: 'v1',
      type: 'preventive',
      description: 'Cambio de aceite y filtros',
      cost: 350000,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      mechanic: 'Taller Automotriz Central',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'm2',
      vehicle_id: 'v3',
      type: 'corrective',
      description: 'Reparación sistema de frenos',
      cost: 850000,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      mechanic: 'Frenos y Suspensión Pro',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Combustible de ejemplo
  inMemoryData.fuel = [
    {
      id: 'f1',
      vehicle_id: 'v1',
      liters: 80,
      cost: 260000,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'f2',
      vehicle_id: 'v2',
      liters: 50,
      cost: 155000,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Gastos de ejemplo
  inMemoryData.expenses = [
    {
      id: 'e1',
      category: 'fuel',
      amount: 260000,
      description: 'Combustible vehículo ABC-123',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'paid',
      vehicle_id: 'v1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'e2',
      category: 'maintenance',
      amount: 350000,
      description: 'Mantenimiento preventivo ABC-123',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'paid',
      vehicle_id: 'v1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'e3',
      category: 'tolls',
      amount: 45000,
      description: 'Peajes ruta norte',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      vehicle_id: 'v2',
      driver_id: 'd2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Alertas de ejemplo
  inMemoryData.alerts = [
    {
      id: 'a1',
      type: 'maintenance',
      severity: 'high',
      title: 'Mantenimiento Vencido',
      message: 'El vehículo GHI-789 requiere mantenimiento urgente',
      read: false,
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'a2',
      type: 'fuel',
      severity: 'medium',
      title: 'Combustible Bajo',
      message: 'El vehículo DEF-456 tiene combustible por debajo del 70%',
      read: false,
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'a3',
      type: 'delivery',
      severity: 'urgent',
      title: 'Entrega Urgente',
      message: 'Pedido #o3 requiere entrega inmediata para Restaurante Gourmet Plaza',
      read: false,
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  console.log("✅ Datos de ejemplo en memoria insertados exitosamente");
  console.log("📊 Datos insertados:");
  console.log("   - 3 Vehículos");
  console.log("   - 4 Conductores");
  console.log("   - 5 Clientes");
  console.log("   - 5 Productos en inventario");
  console.log("   - 5 Pedidos (varios estados)");
  console.log("   - 2 Rutas");
  console.log("   - 2 Registros de combustible");
  console.log("   - 2 Mantenimientos");
  console.log("   - 3 Gastos");
  console.log("   - 3 Alertas");
}

// Insertar datos de ejemplo completos
async function insertSampleData() {
  console.log("📦 Insertando datos de ejemplo completos...");
  
  // Vehículos de ejemplo
  const vehicles = [
    {
      id: 'v1',
      plate: 'ABC-123',
      type: 'truck',
      capacity: 5000,
      fuel_type: 'diesel',
      fuel_level: 75,
      status: 'active',
      last_maintenance: '2024-01-15',
      next_maintenance: '2024-04-15',
      location_lat: 4.6097,
      location_lng: -74.0817,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'v2',
      plate: 'DEF-456',
      type: 'van',
      capacity: 2000,
      fuel_type: 'gasoline',
      fuel_level: 60,
      status: 'active',
      last_maintenance: '2024-02-01',
      next_maintenance: '2024-05-01',
      location_lat: 4.6482,
      location_lng: -74.0789,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'v3',
      plate: 'GHI-789',
      type: 'truck',
      capacity: 8000,
      fuel_type: 'diesel',
      fuel_level: 90,
      status: 'maintenance',
      last_maintenance: '2024-03-10',
      next_maintenance: '2024-06-10',
      location_lat: 4.5981,
      location_lng: -74.0758,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Conductores de ejemplo
  const drivers = [
    {
      id: 'd1',
      name: 'Juan Pérez',
      license_number: 'LIC-001',
      license_type: 'B2',
      phone: '+57 300 123 4567',
      email: 'juan.perez@agro.com',
      status: 'active',
      rating: 4.8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'd2',
      name: 'María González',
      license_number: 'LIC-002',
      license_type: 'C1',
      phone: '+57 301 234 5678',
      email: 'maria.gonzalez@agro.com',
      status: 'active',
      rating: 4.9,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'd3',
      name: 'Carlos Rodríguez',
      license_number: 'LIC-003',
      license_type: 'B2',
      phone: '+57 302 345 6789',
      email: 'carlos.rodriguez@agro.com',
      status: 'on_leave',
      rating: 4.6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'd4',
      name: 'Ana López',
      license_number: 'LIC-004',
      license_type: 'C1',
      phone: '+57 303 456 7890',
      email: 'ana.lopez@agro.com',
      status: 'active',
      rating: 4.7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Clientes de ejemplo
  const clients = [
    {
      id: 'c1',
      name: 'Supermercado Central',
      email: 'compras@supercentral.com',
      phone: '+57 601 234 5678',
      address: 'Calle 100 #50-25, Bogotá',
      type: 'retail',
      credit_limit: 10000000,
      payment_terms: '30 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c2',
      name: 'Distribuidora El Mayorista',
      email: 'pedidos@mayorista.com',
      phone: '+57 602 345 6789',
      address: 'Carrera 68 #13-45, Bogotá',
      type: 'wholesale',
      credit_limit: 25000000,
      payment_terms: '45 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c3',
      name: 'Restaurante Gourmet Plaza',
      email: 'chef@gourmetplaza.com',
      phone: '+57 603 456 7890',
      address: 'Zona Rosa, Calle 82 #12-18, Bogotá',
      type: 'retail',
      credit_limit: 5000000,
      payment_terms: '15 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c4',
      name: 'Procesadora Industrial Agro',
      email: 'compras@procesadora.com',
      phone: '+57 604 567 8901',
      address: 'Zona Industrial, Calle 13 Sur #45-67, Bogotá',
      type: 'industrial',
      credit_limit: 50000000,
      payment_terms: '60 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'c5',
      name: 'Mercado Campesino del Norte',
      email: 'gerencia@mercadocampesino.com',
      phone: '+57 605 678 9012',
      address: 'Calle 170 #7-85, Bogotá',
      type: 'wholesale',
      credit_limit: 15000000,
      payment_terms: '30 días',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Inventario de ejemplo
  const inventory = [
    {
      id: 'inv1',
      product_name: 'Banano Premium',
      category: 'frutas',
      quantity: 5000,
      unit: 'kg',
      price_per_unit: 2500,
      supplier: 'Finca La Esperanza',
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega A - Sección 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv2',
      product_name: 'Aguacate Hass',
      category: 'frutas',
      quantity: 2000,
      unit: 'kg',
      price_per_unit: 4500,
      supplier: 'Cultivos del Valle',
      expiry_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega A - Sección 2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv3',
      product_name: 'Papa Criolla',
      category: 'tuberculos',
      quantity: 8000,
      unit: 'kg',
      price_per_unit: 1800,
      supplier: 'Cooperativa Andina',
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega B - Sección 1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv4',
      product_name: 'Tomate Chonto',
      category: 'verduras',
      quantity: 3000,
      unit: 'kg',
      price_per_unit: 3200,
      supplier: 'Invernaderos del Sol',
      expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega A - Sección 3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'inv5',
      product_name: 'Cebolla Cabezona',
      category: 'verduras',
      quantity: 4500,
      unit: 'kg',
      price_per_unit: 2800,
      supplier: 'Agricultores Unidos',
      expiry_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Bodega B - Sección 2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Pedidos de ejemplo
  const orders = [
    {
      id: 'o1',
      client_id: 'c1',
      client_name: 'Supermercado Central',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Calle 100 #50-25, Bogotá',
      status: 'pending',
      priority: 'high',
      pickup_date: new Date().toISOString(),
      delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      weight: 500,
      volume: 50,
      special_instructions: 'Producto refrigerado - mantener cadena de frío',
      products: JSON.stringify([
        { name: 'Banano Premium', quantity: 300, unit: 'kg' },
        { name: 'Aguacate Hass', quantity: 200, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'o2',
      client_id: 'c2',
      client_name: 'Distribuidora El Mayorista',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Carrera 68 #13-45, Bogotá',
      status: 'assigned',
      priority: 'medium',
      pickup_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      weight: 1200,
      volume: 120,
      vehicle_id: 'v1',
      driver_id: 'd1',
      special_instructions: 'Entrega en horario matutino',
      products: JSON.stringify([
        { name: 'Papa Criolla', quantity: 800, unit: 'kg' },
        { name: 'Cebolla Cabezona', quantity: 400, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'o3',
      client_id: 'c3',
      client_name: 'Restaurante Gourmet Plaza',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Zona Rosa, Calle 82 #12-18, Bogotá',
      status: 'in_transit',
      priority: 'urgent',
      pickup_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      weight: 150,
      volume: 25,
      vehicle_id: 'v2',
      driver_id: 'd2',
      special_instructions: 'Producto de alta calidad para restaurante gourmet',
      products: JSON.stringify([
        { name: 'Aguacate Hass', quantity: 50, unit: 'kg' },
        { name: 'Tomate Chonto', quantity: 100, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'o4',
      client_id: 'c4',
      client_name: 'Procesadora Industrial Agro',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Zona Industrial, Calle 13 Sur #45-67, Bogotá',
      status: 'delivered',
      priority: 'low',
      pickup_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      weight: 2000,
      volume: 200,
      vehicle_id: 'v1',
      driver_id: 'd1',
      special_instructions: 'Carga industrial - verificar peso en báscula',
      products: JSON.stringify([
        { name: 'Papa Criolla', quantity: 2000, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'o5',
      client_id: 'c5',
      client_name: 'Mercado Campesino del Norte',
      pickup_address: 'Bodega Central - Calle 13 #68-45, Bogotá',
      delivery_address: 'Calle 170 #7-85, Bogotá',
      status: 'cancelled',
      priority: 'medium',
      pickup_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      delivery_date: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
      weight: 800,
      volume: 80,
      special_instructions: 'Pedido cancelado por cliente',
      products: JSON.stringify([
        { name: 'Banano Premium', quantity: 400, unit: 'kg' },
        { name: 'Tomate Chonto', quantity: 400, unit: 'kg' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Rutas de ejemplo
  const routes = [
    {
      id: 'r1',
      name: 'Ruta Norte Bogotá',
      description: 'Distribución zona norte de Bogotá',
      vehicle_id: 'v1',
      driver_id: 'd1',
      status: 'active',
      start_location: 'Bodega Central',
      end_location: 'Zona Norte',
      estimated_duration: 4,
      distance: 25.5,
      waypoints: JSON.stringify([
        { lat: 4.6097, lng: -74.0817, name: 'Bodega Central' },
        { lat: 4.6482, lng: -74.0789, name: 'Supermercado Central' },
        { lat: 4.6700, lng: -74.0500, name: 'Mercado del Norte' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'r2',
      name: 'Ruta Centro Comercial',
      description: 'Entrega en centros comerciales zona rosa',
      vehicle_id: 'v2',
      driver_id: 'd2',
      status: 'in_progress',
      start_location: 'Bodega Central',
      end_location: 'Zona Rosa',
      estimated_duration: 2.5,
      distance: 15.2,
      waypoints: JSON.stringify([
        { lat: 4.6097, lng: -74.0817, name: 'Bodega Central' },
        { lat: 4.6482, lng: -74.0600, name: 'Zona Rosa' }
      ]),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Mantenimiento de ejemplo
  const maintenance = [
    {
      id: 'm1',
      vehicle_id: 'v1',
      type: 'preventive',
      description: 'Cambio de aceite y filtros',
      cost: 350000,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      mechanic: 'Taller Automotriz Central',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'm2',
      vehicle_id: 'v3',
      type: 'corrective',
      description: 'Reparación sistema de frenos',
      cost: 850000,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      mechanic: 'Frenos y Suspensión Pro',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // Combustible de ejemplo
  const fuel = [
    {
      id: 'f1',
      vehicle_id: 'v1',
      liters: 80,
      cost: 260000,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'f2',
      vehicle_id: 'v2',
      liters: 50,
      cost: 155000,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // Gastos de ejemplo
  const expenses = [
    {
      id: 'e1',
      category: 'fuel',
      amount: 260000,
      description: 'Combustible vehículo ABC-123',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'paid',
      vehicle_id: 'v1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'e2',
      category: 'maintenance',
      amount: 350000,
      description: 'Mantenimiento preventivo ABC-123',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'paid',
      vehicle_id: 'v1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'e3',
      category: 'tolls',
      amount: 45000,
      description: 'Peajes ruta norte',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      vehicle_id: 'v2',
      driver_id: 'd2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Alertas de ejemplo
  const alerts = [
    {
      id: 'a1',
      type: 'maintenance',
      severity: 'high',
      title: 'Mantenimiento Vencido',
      message: 'El vehículo GHI-789 requiere mantenimiento urgente',
      read: false,
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'a2',
      type: 'fuel',
      severity: 'medium',
      title: 'Combustible Bajo',
      message: 'El vehículo DEF-456 tiene combustible por debajo del 70%',
      read: false,
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'a3',
      type: 'delivery',
      severity: 'urgent',
      title: 'Entrega Urgente',
      message: 'Pedido #o3 requiere entrega inmediata para Restaurante Gourmet Plaza',
      read: false,
      resolved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Insertar todos los datos
  try {
    await supabase.from('vehicles').insert(vehicles)
    await supabase.from('drivers').insert(drivers)
    await supabase.from('clients').insert(clients)
    await supabase.from('inventory').insert(inventory)
    await supabase.from('orders').insert(orders)
    await supabase.from('routes').insert(routes)
    await supabase.from('maintenance').insert(maintenance)
    await supabase.from('fuel').insert(fuel)
    await supabase.from('expenses').insert(expenses)
    await supabase.from('alerts').insert(alerts)

    console.log("✅ Datos de ejemplo completos insertados exitosamente");
    console.log("📊 Datos insertados:");
    console.log("   - 3 Vehículos");
    console.log("   - 4 Conductores");
    console.log("   - 5 Clientes");
    console.log("   - 5 Productos en inventario");
    console.log("   - 5 Pedidos (varios estados)");
    console.log("   - 2 Rutas");
    console.log("   - 2 Registros de combustible");
    console.log("   - 2 Mantenimientos");
    console.log("   - 3 Gastos");
    console.log("   - 3 Alertas");
  } catch (error) {
    console.error("❌ Error insertando datos:", error);
  }
}

// Función para limpiar la base de datos (solo para desarrollo)
export async function clearDatabase() {
  try {
    console.log('🗑️ Limpiando base de datos...')
    
    const tables = Object.values(dbConfig.tables)
    const deletePromises = tables.map(table => 
      supabase.from(table).delete().neq('id', '')
    )
    
    await Promise.all(deletePromises)
    console.log('✅ Base de datos limpiada')
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error)
  }
}
