import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { 
  BarChart3, 
  Truck, 
  Route, 
  Package, 
  Users, 
  FileText, 
  Sprout,
  HelpCircle,
  X,
  Package2,
  UserCog,
  Wrench,
  Fuel,
  Building2,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onClose?: () => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/" },
  { id: "fleet", label: "Flota", icon: Truck, href: "/fleet" },
  { id: "routes", label: "Rutas", icon: Route, href: "/routes" },
  { id: "orders", label: "Pedidos", icon: Package, href: "/orders" },
  { id: "clients", label: "Clientes", icon: Users, href: "/clients" },
  { id: "inventory", label: "Inventario", icon: Package2, href: "/inventory" },
  { id: "drivers", label: "Conductores", icon: UserCog, href: "/drivers" },
  { id: "maintenance", label: "Mantenimiento", icon: Wrench, href: "/maintenance" },
  { id: "fuel", label: "Combustible", icon: Fuel, href: "/fuel" },
  { id: "suppliers", label: "Proveedores", icon: Building2, href: "/suppliers" },
  { id: "finances", label: "Finanzas", icon: DollarSign, href: "/finances" },
  { id: "reports", label: "Reportes", icon: FileText, href: "/reports" },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();
  
  return (
    <div className="flex flex-col w-64 h-full bg-white shadow-lg border-r border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-agro-primary rounded-lg flex items-center justify-center">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">AgroFlow</span>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            data-testid="button-close-sidebar"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "text-white bg-agro-primary"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
              data-testid={`link-${item.id}`}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-success-green">
          <div className="w-2 h-2 bg-success-green rounded-full animate-pulse" />
          <span>Sistema Online</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 flex items-center text-sm text-gray-500 hover:text-gray-700 p-0"
          data-testid="button-help-support"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Ayuda y Soporte
        </Button>
      </div>
    </div>
  );
}
