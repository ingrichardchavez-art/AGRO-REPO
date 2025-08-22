# 🚛 AGRO-REPO - Sistema de Logística y Tracking de Cadena de Suministro

Un sistema completo y profesional de gestión logística que integra Supabase como MCP (Model Context Protocol) para proporcionar funcionalidades avanzadas de tracking en tiempo real, analytics y gestión integral de la cadena de suministro.

## ✨ Características Principales

### 🎯 **Gestión de Flota**
- **Tracking en tiempo real** de vehículos con GPS
- **Gestión de mantenimiento** preventivo y correctivo
- **Control de combustible** y eficiencia energética
- **Monitoreo de estado** y disponibilidad de vehículos

### 📦 **Gestión de Pedidos**
- **Sistema de tracking** completo con números de seguimiento
- **Priorización inteligente** de entregas
- **Asignación automática** de vehículos y conductores
- **Estados de entrega** en tiempo real

### 👥 **Gestión de Conductores**
- **Evaluación de rendimiento** y calificaciones
- **Programa de capacitación** y desarrollo
- **Control de licencias** y certificaciones
- **Asignación dinámica** de rutas

### 🗺️ **Optimización de Rutas**
- **Algoritmos de optimización** para reducir costos
- **Cálculo de distancias** y tiempos estimados
- **Waypoints inteligentes** y consolidación de rutas
- **Análisis de eficiencia** y ahorros potenciales

### 📊 **Analytics y Reportes**
- **KPIs en tiempo real** de rendimiento logístico
- **Análisis de costos** por categoría y período
- **Reportes ejecutivos** personalizables
- **Métricas de satisfacción** del cliente

### 🔔 **Sistema de Alertas Inteligentes**
- **Notificaciones automáticas** basadas en contexto
- **Alertas de mantenimiento** preventivo
- **Monitoreo de combustible** y rendimiento
- **Seguimiento de entregas** críticas

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/AGRO-REPO.git
cd AGRO-REPO
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén las credenciales de la API

#### Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Client Environment Variables
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

#### Configurar base de datos
El sistema creará automáticamente las tablas necesarias con datos de ejemplo.

### 4. Ejecutar el proyecto
```bash
npm run dev
```

El sistema estará disponible en `http://localhost:5000`

## 🏗️ Arquitectura del Sistema

### **Frontend (React + TypeScript)**
- **Componentes modulares** con Tailwind CSS
- **Estado global** con React Query
- **Routing** con Wouter
- **UI Components** con Radix UI

### **Backend (Express + TypeScript)**
- **API RESTful** para todas las operaciones
- **Middleware** de autenticación y validación
- **Integración** con Supabase
- **Sistema de logging** avanzado

### **Base de Datos (Supabase)**
- **PostgreSQL** con funciones avanzadas
- **Real-time subscriptions** para tracking
- **Row Level Security** (RLS)
- **Backups automáticos** y escalabilidad

### **Integraciones MCP**
- **Supabase** como proveedor principal de datos
- **Sistema de tracking** en tiempo real
- **Notificaciones** inteligentes
- **Analytics** avanzados

## 📋 Funcionalidades Detalladas

### **Dashboard Principal**
- Métricas en tiempo real
- Estado de la flota
- Alertas críticas
- Gráficos de rendimiento

### **Gestión de Vehículos**
- CRUD completo de vehículos
- Tracking GPS en tiempo real
- Historial de mantenimiento
- Control de combustible

### **Sistema de Pedidos**
- Creación y seguimiento
- Asignación automática
- Estados de entrega
- Notificaciones de cliente

### **Optimización de Rutas**
- Algoritmos de optimización
- Cálculo de costos
- Recomendaciones inteligentes
- Análisis de eficiencia

### **Gestión de Conductores**
- Perfiles completos
- Evaluación de rendimiento
- Capacitación y desarrollo
- Asignación de rutas

### **Inventario y Almacén**
- Control de stock
- Alertas de reorden
- Trazabilidad completa
- Gestión de proveedores

### **Mantenimiento**
- Programación preventiva
- Historial de servicios
- Control de costos
- Alertas automáticas

### **Finanzas**
- Control de gastos
- Análisis de costos
- Reportes financieros
- Presupuestos

## 🔧 Configuración Avanzada

### **Personalización de Alertas**
```typescript
import { logisticsNotifications } from './lib/notifications'

// Crear alerta personalizada
await logisticsNotifications.createSmartAlert({
  type: 'custom',
  severity: 'high',
  message: 'Alerta personalizada',
  metadata: { customField: 'value' }
})
```

### **Tracking Personalizado**
```typescript
import { supplyChainTracker } from './lib/tracking'

// Iniciar tracking de vehículo
await supplyChainTracker.startVehicleTracking('vehicle-id')

// Obtener estado de la cadena de suministro
const status = await supplyChainTracker.getSupplyChainStatus('order-id')
```

### **Reportes Personalizados**
```typescript
import { LogisticsAnalytics } from './lib/analytics'

// Generar reporte completo
const report = await LogisticsAnalytics.generateCustomReport({
  includeKPIs: true,
  includeCosts: true,
  includeRoutes: true,
  includeFleet: true,
  includeDrivers: true,
  period: 'monthly',
  format: 'summary'
})
```

## 📱 Características Móviles

- **Diseño responsive** para todos los dispositivos
- **Navegación móvil** optimizada
- **Touch gestures** para mapas
- **Offline capabilities** básicas

## 🔒 Seguridad

- **Autenticación** con Supabase Auth
- **Autorización** basada en roles
- **Validación** de datos en frontend y backend
- **Encriptación** de datos sensibles
- **Auditoría** de todas las operaciones

## 🚀 Despliegue

### **Despliegue en Producción**
1. Configurar variables de entorno de producción
2. Construir la aplicación: `npm run build`
3. Desplegar en tu plataforma preferida (Vercel, Netlify, etc.)

### **Docker (Opcional)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Métricas y KPIs

El sistema calcula automáticamente:

- **Entrega a tiempo**: Porcentaje de entregas cumplidas en plazo
- **Utilización de flota**: Eficiencia en el uso de vehículos
- **Eficiencia de combustible**: Consumo por kilómetro
- **Rendimiento del conductor**: Calificaciones promedio
- **Cumplimiento de pedidos**: Tasa de éxito en entregas
- **Costos operativos**: Análisis por categoría

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [Wiki del proyecto](link-a-wiki)
- **Issues**: [GitHub Issues](link-a-issues)
- **Discusiones**: [GitHub Discussions](link-a-discussions)
- **Email**: soporte@agro-repo.com

## 🙏 Agradecimientos

- **Supabase** por la infraestructura de base de datos
- **Tailwind CSS** por el sistema de diseño
- **Radix UI** por los componentes accesibles
- **React Query** por el manejo de estado del servidor

---

**Desarrollado con ❤️ para la industria logística moderna**
