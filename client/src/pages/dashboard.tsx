import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import MetricsCards from "@/components/dashboard/metrics-cards";
import FleetMap from "@/components/dashboard/fleet-map";
import PriorityAlerts from "@/components/dashboard/priority-alerts";
import CriticalDeliveries from "@/components/dashboard/critical-deliveries";
import FleetPerformance from "@/components/dashboard/fleet-performance";
import VehicleCards from "@/components/dashboard/vehicle-cards";

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-full flex bg-neutral-bg">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex w-64 flex-col bg-white h-full">
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Header 
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <main className="p-4 lg:p-6 space-y-6 pb-20 lg:pb-6">
          {/* Metrics Cards */}
          <MetricsCards />

          {/* Map and Widgets Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Map */}
            <div className="lg:col-span-2">
              <FleetMap />
            </div>

            {/* Widgets Column */}
            <div className="space-y-6">
              <PriorityAlerts />
              <CriticalDeliveries />
            </div>
          </div>

          {/* Fleet Performance and Vehicle Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FleetPerformance />
            <VehicleCards />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}
