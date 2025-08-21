# AgroFlow Logistics

## Overview

AgroFlow is a comprehensive agricultural supply chain ERP system that combines modern logistics management with enterprise resource planning capabilities. The platform provides real-time fleet tracking, order management, route optimization, inventory control, maintenance scheduling, financial management, and comprehensive analytics. Built with a mobile-first approach using only free/open-source technologies, it enables agricultural businesses to manage their entire supply chain operation efficiently.

The system focuses on agricultural logistics needs including temperature-controlled transport for perishable goods, client relationship management, comprehensive inventory tracking, driver management, maintenance scheduling, fuel monitoring, supplier relationships, and financial workflows with approval systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses a modern React-based stack with TypeScript for type safety:

- **Framework**: React with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing  
- **Styling**: Tailwind CSS with shadcn/ui component library for professional UI design
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation through @hookform/resolvers
- **Mobile Responsiveness**: Custom mobile breakpoint handling with dedicated mobile navigation

### Backend Architecture
The server follows a REST API pattern with Express.js:

- **Framework**: Express.js with TypeScript for the REST API layer
- **Build System**: ESBuild for production bundling with platform-specific Node.js targeting
- **Middleware**: Custom request logging and JSON response capturing for API monitoring
- **Error Handling**: Centralized error middleware with proper HTTP status code handling
- **Development**: Hot reloading with Vite integration for seamless development experience

### Data Storage Solutions
The application uses PostgreSQL as the primary database with modern ORM tooling:

- **Database**: PostgreSQL (configured for Neon serverless deployment)
- **ORM**: Drizzle ORM with type-safe queries and schema management
- **Schema**: Comprehensive data model including users, vehicles, clients, orders, routes, alerts, and deliveries
- **Migrations**: Drizzle-kit for database schema migrations and version control
- **Connection Pooling**: Neon serverless connection pooling for scalable database access

### Component Architecture
The UI follows a component-driven design with clear separation of concerns:

- **Layout Components**: Responsive sidebar navigation with mobile hamburger menu
- **Dashboard Widgets**: Modular components for metrics cards, interactive maps, alerts, and performance charts
- **Vehicle Management**: Dedicated vehicle card components with real-time status tracking
- **Data Visualization**: Custom chart components for fleet performance and operational metrics

### Key Data Models
The schema includes comprehensive ERP entities:

**Core Logistics:**
- **Vehicles**: Fleet management with capacity, location tracking, driver assignment, and maintenance status
- **Orders**: Product management with weight calculations, delivery scheduling, and status tracking
- **Routes**: Multi-stop route optimization with pickup and delivery coordination
- **Clients**: Customer relationship management for suppliers, customers, and distributors
- **Alerts**: Real-time notification system for delays, temperature issues, and maintenance needs

**ERP Modules:**
- **Inventory**: Complete inventory management with SKU tracking, stock levels, location management, and automated reorder alerts
- **Drivers**: Comprehensive driver management including license tracking, certification expiry alerts, and vehicle assignments
- **Maintenance**: Preventive and corrective maintenance scheduling with cost tracking and service provider management
- **Fuel**: Fuel consumption tracking, cost analysis, and mileage monitoring with receipt management
- **Suppliers**: Vendor relationship management with rating systems, contract tracking, and payment terms
- **Finances**: Expense tracking, budget management, and approval workflow system for financial controls
- **Approvals**: Multi-level approval system for expenses, purchases, and operational changes

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: Real-time connectivity through ws library for live updates

### UI and Styling
- **Radix UI**: Accessible component primitives for professional UI development
- **Tailwind CSS**: Utility-first CSS framework with custom AgroFlow color scheme
- **Lucide React**: Consistent icon library for logistics and agricultural themes

### Development and Build Tools
- **Vite**: Fast development server and optimized production builds
- **TypeScript**: Type safety across frontend, backend, and shared schema definitions
- **ESBuild**: High-performance bundling for production deployment
- **PostCSS**: CSS processing with Tailwind integration

### Utility Libraries
- **date-fns**: Date manipulation and formatting for scheduling operations
- **clsx + tailwind-merge**: Dynamic CSS class composition
- **nanoid**: Unique ID generation for entities and sessions

### Replit Integration
- **Runtime Error Overlay**: Development debugging with @replit/vite-plugin-runtime-error-modal
- **Cartographer**: Development tooling for @replit/vite-plugin-cartographer integration