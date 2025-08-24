// Test de funcionalidad CRUD de clientes
const API_BASE = 'http://localhost:5000/api';

async function testClients() {
  console.log('🧪 Iniciando pruebas de clientes...\n');

  try {
    // 1. Obtener clientes existentes
    console.log('1️⃣ Obteniendo clientes existentes...');
    const getResponse = await fetch(`${API_BASE}/clients`);
    const existingClients = await getResponse.json();
    console.log(`✅ Clientes encontrados: ${existingClients.length}`);
    console.log('📋 Clientes:', existingClients.map(c => ({ id: c.id, name: c.name, clientType: c.clientType })));

    // 2. Crear un nuevo cliente
    console.log('\n2️⃣ Creando nuevo cliente...');
    const newClient = {
      name: 'Cliente de Prueba',
      email: 'test@cliente.com',
      phone: '+57 300 123 4567',
      address: 'Dirección de Prueba 123',
      clientType: 'customer',
      priority: 'normal'
    };

    const createResponse = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClient)
    });

    if (!createResponse.ok) {
      throw new Error(`Error creando cliente: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdClient = await createResponse.json();
    console.log('✅ Cliente creado:', createdClient);
    const clientId = createdClient.id;

    // 3. Verificar que el cliente se creó
    console.log('\n3️⃣ Verificando cliente creado...');
    const verifyResponse = await fetch(`${API_BASE}/clients/${clientId}`);
    if (!verifyResponse.ok) {
      throw new Error(`Error verificando cliente: ${verifyResponse.status}`);
    }
    const verifiedClient = await verifyResponse.json();
    console.log('✅ Cliente verificado:', verifiedClient);

    // 4. Actualizar el cliente
    console.log('\n4️⃣ Actualizando cliente...');
    const updateData = {
      name: 'Cliente de Prueba Actualizado',
      priority: 'high'
    };

    const updateResponse = await fetch(`${API_BASE}/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      throw new Error(`Error actualizando cliente: ${updateResponse.status}`);
    }

    const updatedClient = await updateResponse.json();
    console.log('✅ Cliente actualizado:', updatedClient);

    // 5. Verificar la lista final
    console.log('\n5️⃣ Verificando lista final de clientes...');
    const finalResponse = await fetch(`${API_BASE}/clients`);
    const finalClients = await finalResponse.json();
    console.log(`✅ Total de clientes: ${finalClients.length}`);
    console.log('📋 Clientes finales:', finalClients.map(c => ({ id: c.id, name: c.name, clientType: c.clientType, priority: c.priority })));

    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar las pruebas
testClients();
