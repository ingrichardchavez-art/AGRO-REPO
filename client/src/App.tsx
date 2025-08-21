import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Fleet from "@/pages/fleet";
import Routes from "@/pages/routes";
import Orders from "@/pages/orders";
import Clients from "@/pages/clients";
import Inventory from "@/pages/inventory";
import Drivers from "@/pages/drivers";
import Maintenance from "@/pages/maintenance";
import Fuel from "@/pages/fuel";
import Suppliers from "@/pages/suppliers";
import Finances from "@/pages/finances";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/fleet" component={Fleet} />
      <Route path="/routes" component={Routes} />
      <Route path="/orders" component={Orders} />
      <Route path="/clients" component={Clients} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/drivers" component={Drivers} />
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/fuel" component={Fuel} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/finances" component={Finances} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
