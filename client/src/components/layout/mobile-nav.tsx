import { BarChart3, Truck, Route, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/", active: true },
  { id: "fleet", label: "Flota", icon: Truck, href: "/fleet" },
  { id: "routes", label: "Rutas", icon: Route, href: "/routes" },
  { id: "orders", label: "Pedidos", icon: Package, href: "/orders" },
];

export default function MobileNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "flex flex-col items-center p-2 h-auto",
                item.active
                  ? "text-agro-primary"
                  : "text-gray-400"
              )}
              data-testid={`button-mobile-${item.id}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
