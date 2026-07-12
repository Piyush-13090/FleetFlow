import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Check
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { FiltersPanel } from './FiltersPanel';
import { KpiGrid } from './KpiGrid';
import { AnalyticsSection } from './AnalyticsSection';
import { LiveTripMap } from './LiveTripMap';
import { OperationsTable } from './OperationsTable';
import type { TableRowData } from './OperationsTable';
import { FleetHealth } from './FleetHealth';
import { ActivityTimeline } from './ActivityTimeline';
import { AiAssistant } from './AiAssistant';
import { QuickActionModals } from './QuickActionModals';
import { NotificationPanel } from './NotificationPanel';
import type { NotificationItem } from './NotificationPanel';
import { VehicleRegistry } from './VehicleRegistry';
import { DriverManagement } from './DriverManagement';
import { TripManagement } from './TripManagement';
import { MaintenanceManagement } from './MaintenanceManagement';
import { FuelExpenseManagement } from './FuelExpenseManagement';
import { ReportsAnalytics } from './ReportsAnalytics';
import { NotificationsCenter } from './NotificationsCenter';
import { ProfileSettings } from './ProfileSettings';
import { AccessDenied } from './AccessDenied';
import { NotFound404 } from './NotFound404';

interface TransitOpsDashboardProps {
  onLogout: () => void;
}

const initialRows: TableRowData[] = [
  {
    id: 'TR-8802',
    vehicle: 'Volvo VNL (Asset #TRK-892)',
    vehicleType: 'Semi-Truck',
    driver: 'Robert Johnson',
    route: 'BOS-Hub ➔ JFK-NY',
    status: 'On Trip',
    cargo: 'Medical Equipment',
    eta: '1.2 Hours',
    health: 94,
    region: 'East Coast'
  },
  {
    id: 'TR-9114',
    vehicle: 'Freightliner Cascadia (#TRK-201)',
    vehicleType: 'Semi-Truck',
    driver: 'Sarah Davis',
    route: 'CHI-Depot ➔ MSP-Terminal',
    status: 'Delayed',
    cargo: 'Consumer Electronics',
    eta: '3.8 Hours',
    health: 88,
    region: 'Midwest'
  },
  {
    id: 'TR-7761',
    vehicle: 'Peterbilt 579 (Asset #TRK-544)',
    vehicleType: 'Semi-Truck',
    driver: 'John Doe',
    route: 'HOU-Freight ➔ DAL-Distribution',
    status: 'On Trip',
    cargo: 'Automotive Parts',
    eta: '0.4 Hours',
    health: 97,
    region: 'South'
  },
  {
    id: 'TR-4029',
    vehicle: 'Ford Transit Cargo (#TRK-109)',
    vehicleType: 'Delivery Van',
    driver: 'Jane Smith',
    route: 'LAX-Hub ➔ SFO-Terminal',
    status: 'Available',
    cargo: 'E-commerce Parcels',
    eta: 'Ready',
    health: 100,
    region: 'West Coast'
  },
  {
    id: 'TR-3392',
    vehicle: 'Volvo VNL (Asset #TRK-704)',
    vehicleType: 'Semi-Truck',
    driver: 'Michael Miller',
    route: 'MIA-Depot ➔ ATL-Hub',
    status: 'Maintenance',
    cargo: 'N/A (Shop Repair)',
    eta: 'In Service',
    health: 54,
    region: 'South'
  },
  {
    id: 'TR-5052',
    vehicle: 'Chevrolet Express (#TRK-112)',
    vehicleType: 'Delivery Van',
    driver: 'David Wilson',
    route: 'SEA-Hub ➔ PDX-Depot',
    status: 'Completed',
    cargo: 'Perishable Produce',
    eta: 'Completed',
    health: 99,
    region: 'West Coast'
  }
];

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'license',
    title: 'Sarah Davis CDL Renewal',
    desc: 'Commercial Driver License expiring in 3 days. Contact driver immediately.',
    time: '3 mins ago',
    critical: true
  },
  {
    id: 'notif-2',
    type: 'maintenance',
    title: 'Scheduled Service: TRK-892',
    desc: 'Volvo VNL has exceeded 10,000 miles since last engine service.',
    time: '2 hours ago',
    critical: false
  },
  {
    id: 'notif-3',
    type: 'fuel',
    title: 'Fuel Invoice Spike Alert',
    desc: 'Transaction #TX-9092 marked cost efficiency anomaly (+$120 fuel bill).',
    time: '4 hours ago',
    critical: false
  }
];

export const TransitOpsDashboard: React.FC<TransitOpsDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'All Types',
    status: 'All Statuses',
    region: 'All Regions',
    driver: 'All Drivers'
  });

  const [rows, setRows] = useState<TableRowData[]>(initialRows);
  const [drivers, setDrivers] = useState<any[]>(initialRows.map(r => r.driver));
  const driverNames = drivers.map(d => typeof d === 'string' ? d : (d?.name || ''));
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [kpis, setKpis] = useState({
    activeVehicles: 145,
    availableVehicles: 98,
    inMaintenance: 17,
    activeTrips: 42,
    pendingTrips: 13,
    driversOnDuty: 65,
    fleetUtilization: 84
  });

  // Modal control states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [activeActionTab, setActiveActionTab] = useState('trip');

  // Loading / syncing indicators
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tripsRes, driversRes, notifRes, kpisRes] = await Promise.all([
        fetch('/api/fleet/trips'),
        fetch('/api/fleet/drivers'),
        fetch('/api/fleet/notifications'),
        fetch('/api/fleet/kpis')
      ]);

      if (tripsRes.ok) setRows(await tripsRes.json());
      if (driversRes.ok) setDrivers(await driversRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (kpisRes.ok) setKpis(await kpisRes.json());

      updateSyncTime();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Set initial sync timestamp
  useEffect(() => {
    loadDashboardData();
  }, []);

  const updateSyncTime = () => {
    const now = new Date();
    setLastSynced(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulated pull refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    showToast("Syncing real-time satellite telemetry...");
    await loadDashboardData();
    showToast("All fleet metrics up to date.");
  };

  const handleResetFilters = () => {
    setFilters({
      type: 'All Types',
      status: 'All Statuses',
      region: 'All Regions',
      driver: 'All Drivers'
    });
    setSearchQuery('');
    showToast("Search filters cleared.");
  };

  // Actions handlers
  const handleViewDetails = (row: TableRowData) => {
    showToast(`Opening details terminal for dispatch ${row.id}`);
  };

  const handleEditRow = (row: TableRowData) => {
    showToast(`Editing dispatch records for ${row.id}`);
  };

  const handleDeleteRow = async (id: string) => {
    try {
      const res = await fetch(`/api/fleet/trips/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Removed dispatch entry ${id}`);
        loadDashboardData();
      }
    } catch {
      showToast("Error communicating with server.");
    }
  };

  // Modals submits
  const handleAddTrip = async (newTrip: TableRowData) => {
    try {
      const res = await fetch('/api/fleet/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrip)
      });
      if (res.ok) {
        showToast(`Trip ${newTrip.id} successfully dispatched.`);
        loadDashboardData();
      }
    } catch {
      showToast("Error communicating with server.");
    }
  };

  const handleAddVehicle = async (newVehicle: { id: string; type: string }) => {
    try {
      const res = await fetch('/api/fleet/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle)
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message);
        loadDashboardData();
      }
    } catch {
      showToast("Error communicating with server.");
    }
  };

  const handleAddDriver = async (newDriverName: string) => {
    try {
      const res = await fetch('/api/fleet/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDriverName })
      });
      if (res.ok) {
        showToast(`Driver ${newDriverName} CDL credential verified.`);
        loadDashboardData();
      }
    } catch {
      showToast("Error communicating with server.");
    }
  };

  const handleClearNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/fleet/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch {
      showToast("Error communicating with server.");
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const res = await fetch('/api/fleet/notifications', { method: 'DELETE' });
      if (res.ok) {
        setNotifications([]);
        showToast("All dispatcher alerts read.");
      }
    } catch {
      showToast("Error communicating with server.");
    }
  };

  const triggerQuickAction = (tabId: string) => {
    setActiveActionTab(tabId);
    setIsQuickAddOpen(true);
  };

  // Filtered operational rows
  const filteredRows = rows.filter((row) => {
    // Search filter
    const matchesSearch = 
      row.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filters
    const matchesType = filters.type === 'All Types' || row.vehicleType === filters.type;
    const matchesStatus = filters.status === 'All Statuses' || row.status === filters.status;
    const matchesRegion = filters.region === 'All Regions' || row.region === filters.region;
    const matchesDriver = filters.driver === 'All Drivers' || row.driver === filters.driver;

    return matchesSearch && matchesType && matchesStatus && matchesRegion && matchesDriver;
  });



  return (
    <div className="min-h-screen w-full flex bg-bg-main relative overflow-x-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenQuickAdd={() => triggerQuickAction('trip')}
          onToggleNotifications={() => setIsNotificationOpen(true)}
          unreadNotifications={notifications.length}
        />

        {/* Dynamic Page Rendering */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {activeTab === 'dashboard' ? (
            <>
              {/* Hero Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border-gray/50">
                <div className="text-left">
                  <h1 className="text-2xl font-black text-text-dark tracking-tight leading-none">
                    Fleet Operations Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-none">
                    Monitor fleet performance, dispatch activities, maintenance, and operational health in real time.
                  </p>
                </div>

                <div className="flex items-center space-x-3.5 self-start md:self-auto select-none">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block leading-none">TELEMETRY LOCK</span>
                    <span className="text-[11px] font-bold text-slate-500 font-mono mt-1 block">
                      Last synced: {lastSynced}
                    </span>
                  </div>

                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow hover:scale-102 transition-all duration-200 cursor-pointer flex items-center space-x-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Data</span>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              <FiltersPanel
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
                availableDrivers={driverNames}
              />

              {/* KPI Cards Grid */}
              <KpiGrid data={kpis} isLoading={isLoading} />

              {/* Charts area */}
              <AnalyticsSection onShowToast={showToast} />

              {/* Interactive dispatch Map */}
              <LiveTripMap />

              {/* Bottom operational grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <OperationsTable
                    rows={filteredRows}
                    isLoading={isLoading}
                    onViewDetails={handleViewDetails}
                    onEditRow={handleEditRow}
                    onDeleteRow={handleDeleteRow}
                    onCreateTripClick={() => triggerQuickAction('trip')}
                  />
                </div>
                <div className="space-y-6">
                  <FleetHealth />
                  <ActivityTimeline />
                </div>
              </div>
            </>
          ) : activeTab === 'vehicles' ? (
            <VehicleRegistry onShowToast={showToast} />
          ) : activeTab === 'drivers' ? (
            <DriverManagement onShowToast={showToast} />
          ) : activeTab === 'trips' ? (
            <TripManagement onShowToast={showToast} />
          ) : activeTab === 'maintenance' ? (
            <MaintenanceManagement onShowToast={showToast} />
          ) : activeTab === 'fuel' ? (
            <FuelExpenseManagement onShowToast={showToast} />
          ) : activeTab === 'reports' ? (
            <ReportsAnalytics onShowToast={showToast} />
          ) : activeTab === 'notifications' ? (
            <NotificationsCenter onShowToast={showToast} />
          ) : activeTab === 'settings' ? (
            <ProfileSettings onShowToast={showToast} />
          ) : activeTab === 'notfound' ? (
            <NotFound404 onNavigate={setActiveTab} onShowToast={showToast} />
          ) : (
            <AccessDenied
              attemptedResource={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              requiredRole="Admin / Financial Analyst"
              onNavigate={setActiveTab}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Floating AI Assistant */}
      <AiAssistant
        onTriggerQuickAction={triggerQuickAction}
        onShowToast={showToast}
      />

      {/* Notification drawer panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onClearItem={handleClearNotification}
        onClearAll={handleClearAllNotifications}
      />

      {/* Modals Dispatch panels */}
      <QuickActionModals
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        activeActionTab={activeActionTab}
        setActiveActionTab={setActiveActionTab}
        onSubmitTrip={handleAddTrip}
        onSubmitVehicle={handleAddVehicle}
        onSubmitDriver={handleAddDriver}
        availableDrivers={driverNames}
      />

      {/* Global Action Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-6 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2.5 z-50 text-xs font-semibold"
          >
            <div className="w-4 h-4 bg-primary/20 text-primary border border-primary/20 rounded-full flex items-center justify-center shrink-0">
              <Check className="w-3 h-3" strokeWidth={2.5} />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
