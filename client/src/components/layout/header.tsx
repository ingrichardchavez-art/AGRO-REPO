import { useState } from "react";
import { Search, Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export default function Header({ onMobileMenuToggle, isMobileMenuOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const unreadNotifications = 3; // This would come from state/API

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={onMobileMenuToggle}
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </Button>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-agro-primary focus:border-agro-primary text-sm"
                placeholder="Buscar pedidos, clientes, vehículos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative p-2"
                  data-testid="button-notifications"
                >
                  <Bell className="w-5 h-5 text-gray-400" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-alert-red"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2 border-b">
                  <h4 className="font-semibold">Notificaciones</h4>
                </div>
                <DropdownMenuItem className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-alert-red rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Vehículo con retraso</p>
                      <p className="text-xs text-gray-600">ABC-123 lleva 45 min de retraso</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 15 min</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-logistics-blue">
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  data-testid="button-user-menu"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-agro-primary text-white text-sm font-medium">
                      JS
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    Juan Silva
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid="menu-profile">
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-logout">
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
