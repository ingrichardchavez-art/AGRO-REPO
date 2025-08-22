import { LogisticsAPI } from './api'
import type { Vehicle, Order, Driver, Expense, Fuel, Maintenance } from './supabase'

// Sistema de analytics y reportes avanzados para logística
export class LogisticsAnalytics {
  
  // ===== MÉTRICAS DE RENDIMIENTO =====
  
  // Calcular KPIs principales
  static async calculateKPIs(): Promise<{
    onTimeDelivery: number
    vehicleUtilization: number
    fuelEfficiency: number
    maintenanceCosts: number
    driverPerformance: number
    orderFulfillment: number
  }> {
    try {
      const [orders, vehicles, drivers, expenses, fuel, maintenance] = await Promise.all([
        LogisticsAPI.getOrders(),
        LogisticsAPI.getVehicles(),
        LogisticsAPI.getDrivers(),
        LogisticsAPI.getExpenses(),
        LogisticsAPI.getFuel(),
        LogisticsAPI.getMaintenance()
      ])

      // Entrega a tiempo
      const deliveredOrders = orders.filter(o => o.status === 'delivered')
      const onTimeDeliveries = deliveredOrders.filter(o => {
        if (!o.delivery_date) return false
        const deliveryDate = new Date(o.delivery_date)
        const estimatedDate = new Date(o.pickup_date)
        estimatedDate.setDate(estimatedDate.getDate() + 3) // Asumir 3 días de entrega
        return deliveryDate <= estimatedDate
      })
      const onTimeDelivery = deliveredOrders.length > 0 ? (onTimeDeliveries.length / deliveredOrders.length) * 100 : 0

      // Utilización de vehículos
      const activeVehicles = vehicles.filter(v => v.status === 'active')
      const vehiclesWithOrders = vehicles.filter(v => orders.some(o => o.vehicle_id === v.id))
      const vehicleUtilization = activeVehicles.length > 0 ? (vehiclesWithOrders.length / activeVehicles.length) * 100 : 0

      // Eficiencia de combustible
      const totalFuelCost = fuel.reduce((sum, f) => sum + f.total_cost, 0)
      const totalDistance = vehicles.reduce((sum, v) => sum + (v.current_location ? 100 : 0), 0) // Simulado
      const fuelEfficiency = totalDistance > 0 ? (totalFuelCost / totalDistance) * 100 : 0

      // Costos de mantenimiento
      const maintenanceCosts = maintenance.reduce((sum, m) => sum + m.cost, 0)

      // Rendimiento del conductor
      const driverPerformance = drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length

      // Cumplimiento de pedidos
      const orderFulfillment = orders.length > 0 ? (deliveredOrders.length / orders.length) * 100 : 0

      return {
        onTimeDelivery: Math.round(onTimeDelivery * 100) / 100,
        vehicleUtilization: Math.round(vehicleUtilization * 100) / 100,
        fuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
        maintenanceCosts: Math.round(maintenanceCosts * 100) / 100,
        driverPerformance: Math.round(driverPerformance * 100) / 100,
        orderFulfillment: Math.round(orderFulfillment * 100) / 100
      }
    } catch (error) {
      console.error('Error calculating KPIs:', error)
      throw error
    }
  }

  // ===== ANÁLISIS DE COSTOS =====
  
  // Análisis de costos por categoría
  static async analyzeCosts(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<{
    fuel: number
    maintenance: number
    tolls: number
    insurance: number
    other: number
    total: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }> {
    try {
      const expenses = await LogisticsAPI.getExpenses()
      const fuel = await LogisticsAPI.getFuel()
      const maintenance = await LogisticsAPI.getMaintenance()

      const now = new Date()
      let filteredExpenses: any[] = []
      let filteredFuel: any[] = []
      let filteredMaintenance: any[] = []

      // Filtrar por período
      switch (period) {
        case 'daily':
          filteredExpenses = expenses.filter(e => {
            const date = new Date(e.date)
            return date.toDateString() === now.toDateString()
          })
          filteredFuel = fuel.filter(f => {
            const date = new Date(f.date)
            return date.toDateString() === now.toDateString()
          })
          filteredMaintenance = maintenance.filter(m => {
            const date = new Date(m.date)
            return date.toDateString() === now.toDateString()
          })
          break
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filteredExpenses = expenses.filter(e => new Date(e.date) >= weekAgo)
          filteredFuel = fuel.filter(f => new Date(f.date) >= weekAgo)
          filteredMaintenance = maintenance.filter(m => new Date(m.date) >= weekAgo)
          break
        case 'monthly':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filteredExpenses = expenses.filter(e => new Date(e.date) >= monthAgo)
          filteredFuel = fuel.filter(f => new Date(f.date) >= monthAgo)
          filteredMaintenance = maintenance.filter(m => new Date(m.date) >= monthAgo)
          break
        case 'yearly':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          filteredExpenses = expenses.filter(e => new Date(e.date) >= yearAgo)
          filteredFuel = fuel.filter(f => new Date(f.date) >= yearAgo)
          filteredMaintenance = maintenance.filter(m => new Date(m.date) >= yearAgo)
          break
      }

      const fuelCost = filteredFuel.reduce((sum, f) => sum + f.total_cost, 0)
      const maintenanceCost = filteredMaintenance.reduce((sum, m) => sum + m.cost, 0)
      const tollsCost = filteredExpenses.filter(e => e.category === 'tolls').reduce((sum, e) => sum + e.amount, 0)
      const insuranceCost = filteredExpenses.filter(e => e.category === 'insurance').reduce((sum, e) => sum + e.amount, 0)
      const otherCost = filteredExpenses.filter(e => !['fuel', 'maintenance', 'tolls', 'insurance'].includes(e.category)).reduce((sum, e) => sum + e.amount, 0)

      const total = fuelCost + maintenanceCost + tollsCost + insuranceCost + otherCost

      // Determinar tendencia (simulado)
      const trend: 'increasing' | 'decreasing' | 'stable' = 'stable'

      return {
        fuel: Math.round(fuelCost * 100) / 100,
        maintenance: Math.round(maintenanceCost * 100) / 100,
        tolls: Math.round(tollsCost * 100) / 100,
        insurance: Math.round(insuranceCost * 100) / 100,
        other: Math.round(otherCost * 100) / 100,
        total: Math.round(total * 100) / 100,
        trend
      }
    } catch (error) {
      console.error('Error analyzing costs:', error)
      throw error
    }
  }

  // ===== ANÁLISIS DE RUTAS =====
  
  // Optimización de rutas
  static async optimizeRoutes(): Promise<{
    totalDistance: number
    estimatedTime: number
    fuelConsumption: number
    costSavings: number
    recommendations: string[]
  }> {
    try {
      const routes = await LogisticsAPI.getRoutes()
      const vehicles = await LogisticsAPI.getVehicles()
      const orders = await LogisticsAPI.getOrders()

      let totalDistance = 0
      let estimatedTime = 0
      let fuelConsumption = 0

      // Calcular métricas de rutas
      routes.forEach(route => {
        totalDistance += route.distance || 0
        estimatedTime += route.estimated_duration || 0
      })

      // Calcular consumo de combustible (estimado)
      vehicles.forEach(vehicle => {
        if (vehicle.status === 'active') {
          fuelConsumption += (totalDistance / 100) * 15 // 15L por 100km promedio
        }
      })

      // Recomendaciones de optimización
      const recommendations: string[] = []
      
      if (totalDistance > 1000) {
        recommendations.push('Considerar consolidación de rutas para reducir distancia total')
      }
      
      if (estimatedTime > 24) {
        recommendations.push('Evaluar asignación de conductores adicionales para reducir tiempo')
      }
      
      if (fuelConsumption > 500) {
        recommendations.push('Implementar estrategias de conducción eficiente para reducir consumo')
      }

      // Calcular ahorros potenciales (estimado)
      const costSavings = Math.round((totalDistance * 0.1 + estimatedTime * 50) * 100) / 100

      return {
        totalDistance: Math.round(totalDistance * 100) / 100,
        estimatedTime: Math.round(estimatedTime * 100) / 100,
        fuelConsumption: Math.round(fuelConsumption * 100) / 100,
        costSavings,
        recommendations
      }
    } catch (error) {
      console.error('Error optimizing routes:', error)
      throw error
    }
  }

  // ===== ANÁLISIS DE FLOTA =====
  
  // Estado de la flota
  static async analyzeFleet(): Promise<{
    totalVehicles: number
    activeVehicles: number
    maintenanceVehicles: number
    inactiveVehicles: number
    averageAge: number
    utilizationRate: number
    recommendations: string[]
  }> {
    try {
      const vehicles = await LogisticsAPI.getVehicles()
      const orders = await LogisticsAPI.getOrders()

      const totalVehicles = vehicles.length
      const activeVehicles = vehicles.filter(v => v.status === 'active').length
      const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length
      const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length

      // Calcular edad promedio (simulado)
      const averageAge = vehicles.reduce((sum, v) => sum + 5, 0) / vehicles.length // 5 años promedio

      // Calcular tasa de utilización
      const vehiclesWithOrders = vehicles.filter(v => orders.some(o => o.vehicle_id === v.id))
      const utilizationRate = totalVehicles > 0 ? (vehiclesWithOrders.length / totalVehicles) * 100 : 0

      // Recomendaciones
      const recommendations: string[] = []
      
      if (maintenanceVehicles > totalVehicles * 0.2) {
        recommendations.push('Alto número de vehículos en mantenimiento - revisar programa preventivo')
      }
      
      if (utilizationRate < 70) {
        recommendations.push('Baja utilización de flota - considerar reducción o reasignación')
      }
      
      if (averageAge > 8) {
        recommendations.push('Flota envejecida - evaluar renovación de vehículos')
      }

      return {
        totalVehicles,
        activeVehicles,
        maintenanceVehicles,
        inactiveVehicles,
        averageAge: Math.round(averageAge * 100) / 100,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        recommendations
      }
    } catch (error) {
      console.error('Error analyzing fleet:', error)
      throw error
    }
  }

  // ===== ANÁLISIS DE CONDUCTORES =====
  
  // Rendimiento de conductores
  static async analyzeDrivers(): Promise<{
    totalDrivers: number
    activeDrivers: number
    averageRating: number
    topPerformers: Driver[]
    needsImprovement: Driver[]
    recommendations: string[]
  }> {
    try {
      const drivers = await LogisticsAPI.getDrivers()

      const totalDrivers = drivers.length
      const activeDrivers = drivers.filter(d => d.status === 'active').length
      const averageRating = drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length

      // Top performers
      const topPerformers = drivers
        .filter(d => d.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)

      // Necesitan mejora
      const needsImprovement = drivers
        .filter(d => d.rating < 3.5)
        .sort((a, b) => a.rating - b.rating)

      // Recomendaciones
      const recommendations: string[] = []
      
      if (averageRating < 4.0) {
        recommendations.push('Implementar programa de capacitación para conductores')
      }
      
      if (needsImprovement.length > totalDrivers * 0.2) {
        recommendations.push('Revisar criterios de selección y evaluación de conductores')
      }
      
      if (topPerformers.length < totalDrivers * 0.1) {
        recommendations.push('Establecer programa de reconocimiento para conductores destacados')
      }

      return {
        totalDrivers,
        activeDrivers,
        averageRating: Math.round(averageRating * 100) / 100,
        topPerformers,
        needsImprovement,
        recommendations
      }
    } catch (error) {
      console.error('Error analyzing drivers:', error)
      throw error
    }
  }

  // ===== REPORTES PERSONALIZADOS =====
  
  // Generar reporte personalizado
  static async generateCustomReport(options: {
    includeKPIs?: boolean
    includeCosts?: boolean
    includeRoutes?: boolean
    includeFleet?: boolean
    includeDrivers?: boolean
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    format?: 'json' | 'summary'
  }): Promise<any> {
    try {
      const report: any = {
        generatedAt: new Date().toISOString(),
        period: options.period || 'monthly',
        summary: {}
      }

      if (options.includeKPIs) {
        report.kpis = await this.calculateKPIs()
      }

      if (options.includeCosts) {
        report.costs = await this.analyzeCosts(options.period || 'monthly')
      }

      if (options.includeRoutes) {
        report.routes = await this.optimizeRoutes()
      }

      if (options.includeFleet) {
        report.fleet = await this.analyzeFleet()
      }

      if (options.includeDrivers) {
        report.drivers = await this.analyzeDrivers()
      }

      // Generar resumen ejecutivo
      if (options.format === 'summary') {
        report.summary = this.generateExecutiveSummary(report)
      }

      return report
    } catch (error) {
      console.error('Error generating custom report:', error)
      throw error
    }
  }

  // Generar resumen ejecutivo
  private static generateExecutiveSummary(report: any): string {
    let summary = '📊 RESUMEN EJECUTIVO DE LOGÍSTICA\n\n'

    if (report.kpis) {
      summary += `🎯 KPIs PRINCIPALES:\n`
      summary += `• Entrega a tiempo: ${report.kpis.onTimeDelivery}%\n`
      summary += `• Utilización de flota: ${report.kpis.vehicleUtilization}%\n`
      summary += `• Cumplimiento de pedidos: ${report.kpis.orderFulfillment}%\n\n`
    }

    if (report.costs) {
      summary += `💰 ANÁLISIS DE COSTOS:\n`
      summary += `• Costo total: $${report.costs.total}\n`
      summary += `• Combustible: $${report.costs.fuel}\n`
      summary += `• Mantenimiento: $${report.costs.maintenance}\n\n`
    }

    if (report.fleet) {
      summary += `🚛 ESTADO DE LA FLOTA:\n`
      summary += `• Vehículos activos: ${report.fleet.activeVehicles}/${report.fleet.totalVehicles}\n`
      summary += `• Tasa de utilización: ${report.fleet.utilizationRate}%\n\n`
    }

    if (report.drivers) {
      summary += `👥 RENDIMIENTO DE CONDUCTORES:\n`
      summary += `• Calificación promedio: ${report.drivers.averageRating}/5\n`
      summary += `• Conductores activos: ${report.drivers.activeDrivers}/${report.drivers.totalDrivers}\n\n`
    }

    summary += `📅 Reporte generado: ${new Date().toLocaleDateString('es-ES')}`

    return summary
  }
}
