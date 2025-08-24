#!/usr/bin/env node

/**
 * Script de prueba para verificar la API de AGRO Logistics
 * Ejecutar: node test-api.js
 */

const API_BASE = 'http://localhost:5000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Función para hacer peticiones HTTP
async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Error en ${endpoint}: ${error.message}`);
  }
}

// Pruebas de la API
async function runTests() {
  log('🚀 Iniciando pruebas de la API de AGRO Logistics', 'bright');
  log('='.repeat(60), 'cyan');
  
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Obtener métricas del dashboard
  try {
    logInfo('Test 1: Obteniendo métricas del dashboard...');
    const metrics = await makeRequest('/api/dashboard/metrics');
    if (metrics && typeof metrics === 'object') {
      logSuccess(`Dashboard metrics obtenidas: ${JSON.stringify(metrics)}`);
      passedTests++;
    } else {
      throw new Error('Respuesta inválida del dashboard');
    }
  } catch (error) {
    logError(`Dashboard metrics falló: ${error.message}`);
  }
  totalTests++;

  // Test 2: Obtener conductores
  try {
    logInfo('Test 2: Obteniendo lista de conductores...');
    const drivers = await makeRequest('/api/drivers');
    if (Array.isArray(drivers)) {
      logSuccess(`Conductores obtenidos: ${drivers.length} conductores`);
      passedTests++;
    } else {
      throw new Error('Respuesta inválida de conductores');
    }
  } catch (error) {
    logError(`Obtener conductores falló: ${error.message}`);
  }
  totalTests++;

  // Test 3: Crear un conductor de prueba
  try {
    logInfo('Test 3: Creando un conductor de prueba...');
    const testDriver = {
      name: 'Conductor de Prueba',
      email: 'test@agro.com',
      phone: '+57 300 123 4567',
      license_number: 'TEST-001',
      license_class: 'B',
      status: 'active',
      address: 'Dirección de prueba',
      license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      hire_date: new Date().toISOString()
    };

    const createdDriver = await makeRequest('/api/drivers', {
      method: 'POST',
      body: JSON.stringify(testDriver),
    });

    if (createdDriver && createdDriver.id) {
      logSuccess(`Conductor creado exitosamente con ID: ${createdDriver.id}`);
      passedTests++;
      
      // Test 4: Verificar que el conductor aparece en la lista
      try {
        logInfo('Test 4: Verificando que el conductor aparece en la lista...');
        const updatedDrivers = await makeRequest('/api/drivers');
        const foundDriver = updatedDrivers.find(d => d.id === createdDriver.id);
        
        if (foundDriver) {
          logSuccess('Conductor encontrado en la lista actualizada');
          passedTests++;
        } else {
          throw new Error('Conductor no encontrado en la lista');
        }
      } catch (error) {
        logError(`Verificación de conductor falló: ${error.message}`);
      }
      totalTests++;
    } else {
      throw new Error('Conductor no se creó correctamente');
    }
  } catch (error) {
    logError(`Crear conductor falló: ${error.message}`);
  }
  totalTests++;

  // Test 5: Obtener vehículos
  try {
    logInfo('Test 5: Obteniendo lista de vehículos...');
    const vehicles = await makeRequest('/api/vehicles');
    if (Array.isArray(vehicles)) {
      logSuccess(`Vehículos obtenidos: ${vehicles.length} vehículos`);
      passedTests++;
    } else {
      throw new Error('Respuesta inválida de vehículos');
    }
  } catch (error) {
    logError(`Obtener vehículos falló: ${error.message}`);
  }
  totalTests++;

  // Test 6: Obtener clientes
  try {
    logInfo('Test 6: Obteniendo lista de clientes...');
    const clients = await makeRequest('/api/clients');
    if (Array.isArray(clients)) {
      logSuccess(`Clientes obtenidos: ${clients.length} clientes`);
      passedTests++;
    } else {
      throw new Error('Respuesta inválida de clientes');
    }
  } catch (error) {
    logError(`Obtener clientes falló: ${error.message}`);
  }
  totalTests++;

  // Test 7: Obtener inventario
  try {
    logInfo('Test 7: Obteniendo inventario...');
    const inventory = await makeRequest('/api/inventory');
    if (Array.isArray(inventory)) {
      logSuccess(`Inventario obtenido: ${inventory.length} items`);
      passedTests++;
    } else {
      throw new Error('Respuesta inválida del inventario');
    }
  } catch (error) {
    logError(`Obtener inventario falló: ${error.message}`);
  }
  totalTests++;

  // Test 8: Obtener pedidos
  try {
    logInfo('Test 8: Obteniendo pedidos...');
    const orders = await makeRequest('/api/orders');
    if (Array.isArray(orders)) {
      logSuccess(`Pedidos obtenidos: ${orders.length} pedidos`);
      passedTests++;
    } else {
      throw new Error('Respuesta inválida de pedidos');
    }
  } catch (error) {
    logError(`Obtener pedidos falló: ${error.message}`);
  }
  totalTests++;

  // Resumen de resultados
  log('='.repeat(60), 'cyan');
  log(`📊 Resumen de Pruebas: ${passedTests}/${totalTests} exitosas`, 'bright');
  
  if (passedTests === totalTests) {
    log('🎉 ¡Todas las pruebas pasaron exitosamente!', 'green');
    log('✅ La API está funcionando correctamente', 'green');
  } else {
    logWarning(`${totalTests - passedTests} pruebas fallaron`);
    logWarning('Revisar los logs de error arriba para más detalles');
  }

  // Información adicional
  log('='.repeat(60), 'cyan');
  log('📝 Información Adicional:', 'bright');
  log('• La API está configurada para usar datos en memoria en desarrollo');
  log('• Los datos se pierden al reiniciar el servidor');
  log('• Para persistencia real, configurar Supabase en producción');
  log('• Verificar que el servidor esté ejecutándose en puerto 5000');
}

// Manejo de errores global
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:');
  logError(`Promise: ${promise}`);
  logError(`Reason: ${reason}`);
  process.exit(1);
});

// Ejecutar las pruebas
if (require.main === module) {
  runTests().catch(error => {
    logError(`Error ejecutando pruebas: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests, makeRequest };
