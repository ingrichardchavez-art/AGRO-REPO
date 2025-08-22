import { supabase } from './supabase'
import { LogisticsAPI } from './api'
import type { Vehicle, Order, Driver } from './supabase'

// Sistema de tracking en tiempo real para la cadena de suministro
export class SupplyChainTracker {
  private static instance: SupplyChainTracker
  private realtimeSubscriptions: Map<string, any> = new Map()
  private locationUpdateInterval: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): SupplyChainTracker {
    if (!SupplyChainTracker.instance) {
      SupplyChainTracker.instance = new SupplyChainTracker()
    }
    return SupplyChainTracker.instance
  }

  // Iniciar tracking en tiempo real de un vehículo
  async startVehicleTracking(vehicleId: string): Promise<void> {
    if (this.realtimeSubscriptions.has(vehicleId)) {
      return // Ya está siendo trackeado
    }

    // Suscripción a cambios en tiempo real del vehículo
    const subscription = supabase
      .channel(`vehicle-${vehicleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
          filter: `id=eq.${vehicleId}`
        },
        (payload) => {
          this.handleVehicleUpdate(payload)
        }
      )
      .subscribe()

    this.realtimeSubscriptions.set(vehicleId, subscription)

    // Simular actualizaciones de ubicación (en producción esto vendría de GPS)
    this.startLocationSimulation(vehicleId)
  }

  // Detener tracking de un vehículo
  async stopVehicleTracking(vehicleId: string): Promise<void> {
    const subscription = this.realtimeSubscriptions.get(vehicleId)
    if (subscription) {
      await supabase.removeChannel(subscription)
      this.realtimeSubscriptions.delete(vehicleId)
    }

    const interval = this.locationUpdateInterval.get(vehicleId)
    if (interval) {
      clearInterval(interval)
      this.locationUpdateInterval.delete(vehicleId)
    }
  }

  // Simular actualizaciones de ubicación GPS
  private startLocationSimulation(vehicleId: string): void {
    const interval = setInterval(async () => {
      try {
        // Simular movimiento del vehículo
        const vehicle = await LogisticsAPI.getVehicle(vehicleId)
        if (vehicle && vehicle.status === 'active') {
          // Simular pequeñas variaciones en la ubicación
          const latVariation = (Math.random() - 0.5) * 0.001
          const lngVariation = (Math.random() - 0.5) * 0.001
          
          const newLat = vehicle.current_location.lat + latVariation
          const newLng = vehicle.current_location.lng + lngVariation

          await LogisticsAPI.updateVehicleLocation(vehicleId, newLat, newLng)
        }
      } catch (error) {
        console.error('Error updating vehicle location:', error)
      }
    }, 30000) // Actualizar cada 30 segundos

    this.locationUpdateInterval.set(vehicleId, interval)
  }

  // Manejar actualizaciones del vehículo en tiempo real
  private handleVehicleUpdate(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'UPDATE':
        this.handleVehicleStatusChange(newRecord, oldRecord)
        break
      case 'INSERT':
        this.handleNewVehicle(newRecord)
        break
      case 'DELETE':
        this.handleVehicleDeleted(newRecord)
        break
    }
  }

  // Manejar cambios de estado del vehículo
  private async handleVehicleStatusChange(newRecord: Vehicle, oldRecord: Vehicle): Promise<void> {
    if (newRecord.status !== oldRecord.status) {
      // Crear alerta si el vehículo entra en mantenimiento
      if (newRecord.status === 'maintenance') {
        await LogisticsAPI.createAlert({
          type: 'maintenance',
          severity: 'high',
          message: `Vehículo ${newRecord.plate} requiere mantenimiento`,
          vehicle_id: newRecord.id,
          status: 'active'
        })
      }

      // Notificar si el vehículo está disponible
      if (newRecord.status === 'active' && oldRecord.status === 'maintenance') {
        await LogisticsAPI.createAlert({
          type: 'maintenance',
          severity: 'low',
          message: `Vehículo ${newRecord.plate} disponible para servicio`,
          vehicle_id: newRecord.id,
          status: 'active'
        })
      }
    }

    // Verificar nivel de combustible
    if (newRecord.fuel_level < 20) {
      await LogisticsAPI.createAlert({
        type: 'fuel',
        severity: 'medium',
        message: `Vehículo ${newRecord.plate} con bajo nivel de combustible (${newRecord.fuel_level}%)`,
        vehicle_id: newRecord.id,
        status: 'active'
      })
    }
  }

  // Manejar nuevo vehículo
  private async handleNewVehicle(vehicle: Vehicle): Promise<void> {
    await LogisticsAPI.createAlert({
      type: 'system',
      severity: 'low',
      message: `Nuevo vehículo ${vehicle.plate} agregado al sistema`,
      vehicle_id: vehicle.id,
      status: 'active'
    })
  }

  // Manejar vehículo eliminado
  private async handleVehicleDeleted(vehicle: Vehicle): Promise<void> {
    await LogisticsAPI.createAlert({
      type: 'system',
      severity: 'medium',
      message: `Vehículo ${vehicle.plate} removido del sistema`,
      vehicle_id: vehicle.id,
      status: 'active'
    })
  }

  // Tracking de pedidos en tiempo real
  async startOrderTracking(orderId: string): Promise<void> {
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          this.handleOrderUpdate(payload)
        }
      )
      .subscribe()

    this.realtimeSubscriptions.set(`order-${orderId}`, subscription)
  }

  // Manejar actualizaciones de pedidos
  private async handleOrderUpdate(payload: any): Promise<void> {
    const { eventType, new: newRecord, old: oldRecord } = payload

    if (eventType === 'UPDATE' && newRecord.status !== oldRecord.status) {
      // Crear alerta cuando cambia el estado del pedido
      const statusMessages = {
        'assigned': 'Pedido asignado a vehículo',
        'in_transit': 'Pedido en tránsito',
        'delivered': 'Pedido entregado exitosamente',
        'cancelled': 'Pedido cancelado'
      }

      const message = statusMessages[newRecord.status as keyof typeof statusMessages]
      if (message) {
        await LogisticsAPI.createAlert({
          type: 'delivery',
          severity: newRecord.status === 'delivered' ? 'low' : 'medium',
          message: `${message}: ${newRecord.tracking_number}`,
          order_id: newRecord.id,
          status: 'active'
        })
      }
    }
  }

  // Obtener estado actual de la cadena de suministro
  async getSupplyChainStatus(orderId: string): Promise<any> {
    try {
      const status = await LogisticsAPI.getSupplyChainStatus(orderId)
      
      // Agregar información de tracking en tiempo real
      if (status.vehicle) {
        status.vehicle.lastLocationUpdate = new Date().toISOString()
        status.vehicle.isTracking = this.realtimeSubscriptions.has(status.vehicle.id)
      }

      return status
    } catch (error) {
      console.error('Error getting supply chain status:', error)
      throw error
    }
  }

  // Generar reporte de tracking
  async generateTrackingReport(orderId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const order = await LogisticsAPI.getOrder(orderId)
      if (!order) throw new Error('Order not found')

      // Aquí se generaría un reporte detallado con historial de ubicaciones,
      // tiempos de entrega, paradas, etc.
      // Por ahora retornamos información básica
      
      return {
        orderId,
        trackingNumber: order.tracking_number,
        status: order.status,
        pickupDate: order.pickup_date,
        deliveryDate: order.delivery_date,
        estimatedDelivery: order.delivery_date,
        currentStatus: order.status,
        vehicle: order.vehicle_id ? await LogisticsAPI.getVehicle(order.vehicle_id) : null,
        driver: order.driver_id ? await LogisticsAPI.getDriver(order.driver_id) : null,
        reportGenerated: new Date().toISOString(),
        period: { startDate, endDate }
      }
    } catch (error) {
      console.error('Error generating tracking report:', error)
      throw error
    }
  }

  // Limpiar todas las suscripciones
  async cleanup(): Promise<void> {
    for (const [key, subscription] of this.realtimeSubscriptions) {
      await supabase.removeChannel(subscription)
    }
    this.realtimeSubscriptions.clear()

    for (const interval of this.locationUpdateInterval.values()) {
      clearInterval(interval)
    }
    this.locationUpdateInterval.clear()
  }
}

// Exportar instancia singleton
export const supplyChainTracker = SupplyChainTracker.getInstance()
