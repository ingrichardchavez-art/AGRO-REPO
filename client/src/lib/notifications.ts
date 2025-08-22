import { supabase } from './supabase'
import { LogisticsAPI } from './api'
import type { Alert, Vehicle, Order, Driver } from './supabase'

// Sistema de notificaciones inteligentes para logística
export class LogisticsNotifications {
  private static instance: LogisticsNotifications
  private notificationQueue: Alert[] = []
  private isProcessing = false

  static getInstance(): LogisticsNotifications {
    if (!LogisticsNotifications.instance) {
      LogisticsNotifications.instance = new LogisticsNotifications()
    }
    return LogisticsNotifications.instance
  }

  // Crear alerta inteligente basada en el contexto
  async createSmartAlert(context: {
    type: 'maintenance' | 'fuel' | 'delivery' | 'safety' | 'system' | 'performance'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    vehicle_id?: string
    driver_id?: string
    order_id?: string
    metadata?: Record<string, any>
  }): Promise<Alert> {
    try {
      // Analizar el contexto para determinar la severidad real
      const actualSeverity = await this.analyzeSeverity(context)
      
      // Crear la alerta con severidad ajustada
      const alert = await LogisticsAPI.createAlert({
        ...context,
        severity: actualSeverity,
        status: 'active'
      })

      // Agregar a la cola de notificaciones
      this.notificationQueue.push(alert)
      
      // Procesar la cola si no está siendo procesada
      if (!this.isProcessing) {
        this.processNotificationQueue()
      }

      return alert
    } catch (error) {
      console.error('Error creating smart alert:', error)
      throw error
    }
  }

  // Analizar la severidad real basada en el contexto
  private async analyzeSeverity(context: any): Promise<'low' | 'medium' | 'high' | 'critical'> {
    let severity = context.severity

    // Ajustar severidad basada en el contexto del vehículo
    if (context.vehicle_id) {
      const vehicle = await LogisticsAPI.getVehicle(context.vehicle_id)
      if (vehicle) {
        // Aumentar severidad si es un vehículo crítico
        if (vehicle.type === 'truck' && vehicle.capacity > 5000) {
          severity = this.upgradeSeverity(severity)
        }
        
        // Aumentar severidad si el vehículo está en ruta activa
        if (vehicle.status === 'active') {
          severity = this.upgradeSeverity(severity)
        }
      }
    }

    // Ajustar severidad basada en el pedido
    if (context.order_id) {
      const order = await LogisticsAPI.getOrder(context.order_id)
      if (order) {
        // Aumentar severidad para pedidos urgentes
        if (order.priority === 'urgent') {
          severity = this.upgradeSeverity(severity)
        }
        
        // Aumentar severidad para pedidos de alto valor
        if (order.weight > 1000 || order.volume > 100) {
          severity = this.upgradeSeverity(severity)
        }
      }
    }

    return severity
  }

  // Mejorar la severidad de una alerta
  private upgradeSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'low': return 'medium'
      case 'medium': return 'high'
      case 'high': return 'critical'
      default: return 'critical'
    }
  }

  // Procesar la cola de notificaciones
  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.notificationQueue.length > 0) {
        const alert = this.notificationQueue.shift()
        if (alert) {
          await this.sendNotification(alert)
          await this.updateAlertStatus(alert.id, 'sent')
        }
      }
    } catch (error) {
      console.error('Error processing notification queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Enviar notificación (simulado)
  private async sendNotification(alert: Alert): Promise<void> {
    // En producción, aquí se integraría con servicios como:
    // - Push notifications
    // - Email
    // - SMS
    // - Slack/Discord
    // - WhatsApp Business API
    
    console.log(`🔔 NOTIFICACIÓN ENVIADA: ${alert.message}`)
    console.log(`   Tipo: ${alert.type}`)
    console.log(`   Severidad: ${alert.severity}`)
    console.log(`   Timestamp: ${alert.created_at}`)
    
    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Actualizar estado de la alerta
  private async updateAlertStatus(alertId: string, status: 'sent' | 'read' | 'resolved'): Promise<void> {
    try {
      await LogisticsAPI.updateAlert(alertId, { status })
    } catch (error) {
      console.error('Error updating alert status:', error)
    }
  }

  // Crear alerta de mantenimiento preventivo
  async createMaintenanceAlert(vehicleId: string): Promise<Alert> {
    const vehicle = await LogisticsAPI.getVehicle(vehicleId)
    if (!vehicle) throw new Error('Vehicle not found')

    const nextMaintenance = new Date(vehicle.next_maintenance)
    const now = new Date()
    const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let severity: 'low' | 'medium' | 'high' = 'low'
    let message = ''

    if (daysUntilMaintenance <= 0) {
      severity = 'critical'
      message = `🚨 MANTENIMIENTO URGENTE: Vehículo ${vehicle.plate} requiere mantenimiento inmediato`
    } else if (daysUntilMaintenance <= 3) {
      severity = 'high'
      message = `⚠️ MANTENIMIENTO PRÓXIMO: Vehículo ${vehicle.plate} requiere mantenimiento en ${daysUntilMaintenance} días`
    } else if (daysUntilMaintenance <= 7) {
      severity = 'medium'
      message = `📅 MANTENIMIENTO PROGRAMADO: Vehículo ${vehicle.plate} requiere mantenimiento en ${daysUntilMaintenance} días`
    } else {
      severity = 'low'
      message = `ℹ️ MANTENIMIENTO FUTURO: Vehículo ${vehicle.plate} requiere mantenimiento en ${daysUntilMaintenance} días`
    }

    return this.createSmartAlert({
      type: 'maintenance',
      severity,
      message,
      vehicle_id: vehicleId,
      metadata: {
        daysUntilMaintenance,
        nextMaintenance: vehicle.next_maintenance,
        lastMaintenance: vehicle.last_maintenance
      }
    })
  }

  // Crear alerta de combustible
  async createFuelAlert(vehicleId: string): Promise<Alert> {
    const vehicle = await LogisticsAPI.getVehicle(vehicleId)
    if (!vehicle) throw new Error('Vehicle not found')

    let severity: 'low' | 'medium' | 'high' = 'low'
    let message = ''

    if (vehicle.fuel_level <= 10) {
      severity = 'critical'
      message = `⛽ COMBUSTIBLE CRÍTICO: Vehículo ${vehicle.plate} con ${vehicle.fuel_level}% de combustible`
    } else if (vehicle.fuel_level <= 20) {
      severity = 'high'
      message = `⛽ COMBUSTIBLE BAJO: Vehículo ${vehicle.plate} con ${vehicle.fuel_level}% de combustible`
    } else if (vehicle.fuel_level <= 30) {
      severity = 'medium'
      message = `⛽ COMBUSTIBLE MEDIO: Vehículo ${vehicle.plate} con ${vehicle.fuel_level}% de combustible`
    }

    if (severity !== 'low') {
      return this.createSmartAlert({
        type: 'fuel',
        severity,
        message,
        vehicle_id: vehicleId,
        metadata: {
          fuelLevel: vehicle.fuel_level,
          fuelType: vehicle.fuel_type
        }
      })
    }

    throw new Error('No fuel alert needed')
  }

  // Crear alerta de rendimiento del conductor
  async createDriverPerformanceAlert(driverId: string): Promise<Alert> {
    const driver = await LogisticsAPI.getDriver(driverId)
    if (!driver) throw new Error('Driver not found')

    let severity: 'low' | 'medium' | 'high' = 'low'
    let message = ''

    if (driver.rating < 3.0) {
      severity = 'high'
      message = `👤 RENDIMIENTO BAJO: Conductor ${driver.name} tiene calificación de ${driver.rating}/5`
    } else if (driver.rating < 4.0) {
      severity = 'medium'
      message = `👤 RENDIMIENTO MEDIO: Conductor ${driver.name} tiene calificación de ${driver.rating}/5`
    }

    if (severity !== 'low') {
      return this.createSmartAlert({
        type: 'performance',
        severity,
        message,
        driver_id: driverId,
        metadata: {
          rating: driver.rating,
          totalTrips: driver.total_trips
        }
      })
    }

    throw new Error('No performance alert needed')
  }

  // Crear alerta de entrega
  async createDeliveryAlert(orderId: string): Promise<Alert> {
    const order = await LogisticsAPI.getOrder(orderId)
    if (!order) throw new Error('Order not found')

    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let message = ''

    // Calcular días hasta la entrega
    const deliveryDate = new Date(order.delivery_date)
    const now = new Date()
    const daysUntilDelivery = Math.ceil((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDelivery < 0) {
      severity = 'critical'
      message = `🚨 ENTREGA RETRASADA: Pedido ${order.tracking_number} está retrasado por ${Math.abs(daysUntilDelivery)} días`
    } else if (daysUntilDelivery <= 1) {
      severity = 'high'
      message = `⚠️ ENTREGA PRÓXIMA: Pedido ${order.tracking_number} debe entregarse mañana`
    } else if (daysUntilDelivery <= 3) {
      severity = 'medium'
      message = `📅 ENTREGA PRÓXIMA: Pedido ${order.tracking_number} debe entregarse en ${daysUntilDelivery} días`
    }

    if (severity !== 'low') {
      return this.createSmartAlert({
        type: 'delivery',
        severity,
        message,
        order_id: orderId,
        metadata: {
          daysUntilDelivery,
          deliveryDate: order.delivery_date,
          priority: order.priority
        }
      })
    }

    throw new Error('No delivery alert needed')
  }

  // Obtener alertas activas
  async getActiveAlerts(): Promise<Alert[]> {
    try {
      return await LogisticsAPI.getAlerts()
    } catch (error) {
      console.error('Error getting active alerts:', error)
      return []
    }
  }

  // Marcar alerta como leída
  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      await LogisticsAPI.updateAlert(alertId, { status: 'read' })
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  // Resolver alerta
  async resolveAlert(alertId: string): Promise<void> {
    try {
      await LogisticsAPI.updateAlert(alertId, { status: 'resolved' })
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }
}

// Exportar instancia singleton
export const logisticsNotifications = LogisticsNotifications.getInstance()
