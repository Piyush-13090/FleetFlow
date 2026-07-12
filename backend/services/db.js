import crypto from 'crypto';
import prisma from '../lib/prisma.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const today = () => new Date().toISOString().slice(0, 10);
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const createId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
export const vehicleRegistration = (vehicle = '') => vehicle.match(/#([A-Z0-9-]+)/i)?.[1]?.toUpperCase();
export const findVehicle = (registrationNumber) => db.vehicles.find((v) => v.registrationNumber === registrationNumber);
export const findDriver = (name) => db.drivers.find((d) => d.name.toLowerCase() === String(name).toLowerCase());

// Deterministic UUID converter to satisfy Postgres UUID primary and foreign keys
export const toUuid = (str, prefix = '') => {
  if (!str) return null;
  const target = prefix ? `${prefix}-${str}` : str;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target)) {
    return target.toLowerCase();
  }
  const hash = crypto.createHash('md5').update(target).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
};

// ─── Notification Normalization ───────────────────────────────────────────────

const notificationType = (category) => {
  if (category === 'maintenance') return 'maintenance';
  if (category === 'fuel' || category === 'expenses') return 'fuel';
  if (category === 'compliance' || category === 'drivers') return 'license';
  return 'dispatch';
};

export const normalizeNotification = (notification) => {
  const category =
    notification.category ||
    (notification.type === 'license'
      ? 'compliance'
      : notification.type === 'fuel'
      ? 'fuel'
      : notification.type === 'maintenance'
      ? 'maintenance'
      : 'trips');
  const priority = notification.priority || (notification.critical ? 'Critical' : 'Medium');
  const description = notification.description || notification.desc || '';
  return {
    ...notification,
    category,
    priority,
    status: notification.status || 'unread',
    timestamp: notification.timestamp || notification.time || 'Just now',
    description,
    desc: description,
    type: notification.type || notificationType(category),
    critical: typeof notification.critical === 'boolean' ? notification.critical : priority === 'Critical',
    time: notification.time || notification.timestamp || 'Just now',
  };
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedTrips = [
  { id: 'TR-8802', vehicle: 'Volvo VNL 860 (#TRK-892)', vehicleType: 'Semi-Truck', driver: 'Robert Johnson', route: 'BOS-Hub ➔ JFK-NY', status: 'On Trip', cargo: 'Medical Equipment', eta: '1.2 Hours', health: 94, region: 'East Coast' },
  { id: 'TR-9114', vehicle: 'Freightliner Cascadia (#TRK-201)', vehicleType: 'Semi-Truck', driver: 'Sarah Davis', route: 'CHI-Depot ➔ MSP-Terminal', status: 'Delayed', cargo: 'Consumer Electronics', eta: '3.8 Hours', health: 88, region: 'Midwest' },
  { id: 'TR-7761', vehicle: 'Peterbilt 579 (#TRK-544)', vehicleType: 'Semi-Truck', driver: 'John Doe', route: 'HOU-Freight ➔ DAL-Distribution', status: 'On Trip', cargo: 'Automotive Parts', eta: '0.4 Hours', health: 97, region: 'South' },
  { id: 'TR-4029', vehicle: 'Ford Transit Cargo (#TRK-109)', vehicleType: 'Delivery Van', driver: 'Jane Smith', route: 'LAX-Hub ➔ SFO-Terminal', status: 'Available', cargo: 'E-commerce Parcels', eta: 'Ready', health: 100, region: 'West Coast' },
  { id: 'TR-3392', vehicle: 'Volvo VNL 860 (#TRK-704)', vehicleType: 'Semi-Truck', driver: 'Michael Miller', route: 'MIA-Depot ➔ ATL-Hub', status: 'In Shop', cargo: 'N/A (Shop Repair)', eta: 'In Service', health: 54, region: 'South' },
  { id: 'TR-5052', vehicle: 'Chevrolet Express (#TRK-112)', vehicleType: 'Delivery Van', driver: 'David Wilson', route: 'SEA-Hub ➔ PDX-Depot', status: 'Completed', cargo: 'Perishable Produce', eta: 'Completed', health: 99, region: 'West Coast' },
  { id: 'TR-1001', vehicle: 'Ford Transit (#Van-05)', vehicleType: 'Delivery Van', driver: 'Alex', route: 'BOS-Hub ➔ JFK-NY', status: 'Completed', cargo: 'E-commerce Parcels', eta: 'Completed', health: 95, region: 'East Coast', cargoWeight: 450, distance: 200 }
];

const seedDrivers = [
  { id: 'DRV-101', name: 'Robert Johnson', licenseNumber: 'CDL-TX89012', licenseCategory: 'CDL-A', contactNumber: '+1 (512) 555-0101', safetyScore: 98, status: 'On Trip', currentVehicle: 'Volvo VNL 860 (#TRK-892)', licenseExpiry: '2027-11-20', daysToExpiry: 512, lastTrip: 'BOS-Hub ➔ JFK-NY', experience: 8, totalTrips: 142, avgDistance: 310, avgFuelEfficiency: 6.8, emergencyContact: 'Mary Johnson (Spouse) - +1 (512) 555-0102', region: 'East Coast', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 0, timeline: [{ date: '2026-07-12', event: 'Dispatched on route TR-8802' }, { date: '2026-05-10', event: 'Safety refresher class completed' }] },
  { id: 'DRV-102', name: 'Sarah Davis', licenseNumber: 'CDL-IL30921', licenseCategory: 'CDL-A', contactNumber: '+1 (312) 555-0102', safetyScore: 91, status: 'On Trip', currentVehicle: 'Freightliner Cascadia (#TRK-201)', licenseExpiry: '2026-07-30', daysToExpiry: 18, lastTrip: 'CHI-Depot ➔ MSP-Terminal', experience: 5, totalTrips: 98, avgDistance: 280, avgFuelEfficiency: 7.2, emergencyContact: 'James Davis (Father) - +1 (312) 555-0103', region: 'Midwest', compliance: { license: 'Expiring Soon', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 0, timeline: [{ date: '2026-07-12', event: 'Dispatched on route TR-9114' }] },
  { id: 'DRV-103', name: 'John Doe', licenseNumber: 'CDL-CA89201', licenseCategory: 'CDL-A', contactNumber: '+1 (213) 555-0103', safetyScore: 97, status: 'On Trip', currentVehicle: 'Peterbilt 579 (#TRK-544)', licenseExpiry: '2027-04-18', daysToExpiry: 280, lastTrip: 'HOU-Freight ➔ DAL-Distribution', experience: 10, totalTrips: 210, avgDistance: 340, avgFuelEfficiency: 7.0, emergencyContact: 'Jane Doe (Wife) - +1 (213) 555-0104', region: 'South', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 1, timeline: [{ date: '2026-07-12', event: 'Dispatched on route TR-7761' }] },
  { id: 'DRV-104', name: 'Jane Smith', licenseNumber: 'CDL-NY99810', licenseCategory: 'CDL-B', contactNumber: '+1 (212) 555-0104', safetyScore: 100, status: 'Available', currentVehicle: 'Ford Transit Cargo (#TRK-109)', licenseExpiry: '2027-09-12', daysToExpiry: 420, lastTrip: 'LAX-Hub ➔ SNA-Terminal', experience: 4, totalTrips: 76, avgDistance: 110, avgFuelEfficiency: 14.5, emergencyContact: 'Thomas Smith (Spouse) - +1 (212) 555-0105', region: 'West Coast', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 0, timeline: [{ date: '2026-07-05', event: 'Trip completed safely' }] },
  { id: 'DRV-105', name: 'Michael Miller', licenseNumber: 'CDL-GA88210', licenseCategory: 'CDL-A', contactNumber: '+1 (404) 555-0105', safetyScore: 65, status: 'Off Duty', currentVehicle: 'N/A', licenseExpiry: '2026-11-20', daysToExpiry: 131, lastTrip: 'MIA-Depot ➔ ATL-Hub', experience: 3, totalTrips: 45, avgDistance: 290, avgFuelEfficiency: 6.8, emergencyContact: 'Alice Miller (Wife) - +1 (404) 555-0106', region: 'South', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Pending Refresher' }, incidents: 3, timeline: [{ date: '2026-07-08', event: 'Speeding alert flagged during route' }] },
  { id: 'DRV-106', name: 'David Wilson', licenseNumber: 'CDL-FL70921', licenseCategory: 'CDL-A', contactNumber: '+1 (305) 555-0106', safetyScore: 78, status: 'Suspended', currentVehicle: 'N/A', licenseExpiry: '2026-06-01', daysToExpiry: -41, lastTrip: 'SEA-Hub ➔ PDX-Depot', experience: 7, totalTrips: 112, avgDistance: 270, avgFuelEfficiency: 6.9, emergencyContact: 'Carol Wilson (Wife) - +1 (305) 555-0107', region: 'West Coast', compliance: { license: 'Expired', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 2, timeline: [{ date: '2026-06-01', event: 'Safety suspension order issued' }] },
  { id: 'DRV-107', name: 'Alex', licenseNumber: 'CDL-NY10005', licenseCategory: 'CDL-B', contactNumber: '+1 (212) 555-0107', safetyScore: 95, status: 'Available', currentVehicle: 'Ford Transit (#Van-05)', licenseExpiry: '2028-07-12', daysToExpiry: 730, lastTrip: 'BOS-Hub ➔ JFK-NY', experience: 5, totalTrips: 50, avgDistance: 120, avgFuelEfficiency: 30.0, emergencyContact: 'Sarah (Wife) - +1 (212) 555-0108', region: 'East Coast', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 0, timeline: [{ date: '2026-07-12', event: 'Trip Completed' }] }
];

const seedVehicles = [
  { registrationNumber: 'TRK-892', name: 'Volvo VNL 860', type: 'Semi-Truck', capacity: 45000, odometer: 142300, acquisitionCost: 135000, status: 'On Trip', lastMaintenance: '2026-05-12', assignedDriver: 'Robert Johnson', health: 94, region: 'East Coast', purchaseDate: '2024-03-12', insuranceExpiry: '2026-11-20', roadTax: 'Compliant', documents: ['Insurance', 'Registration', 'Permits'], specs: { engine: 'Volvo D13 455HP', fuelType: 'Diesel', mpg: 6.8, fuelCapacity: 150 }, tripsHistory: [{ id: 'TR-8802', route: 'BOS ➔ JFK', date: '2026-07-12', status: 'On Trip' }, { id: 'TR-8409', route: 'PHL ➔ BOS', date: '2026-07-09', status: 'Completed' }], fuelConsumption: [{ date: '2026-07-10', gallons: 110, cost: 385.00 }, { date: '2026-07-06', gallons: 125, cost: 437.50 }], maintenanceHistory: [{ date: '2026-05-12', issue: 'A-Service Oil Renewal', cost: 450.00, shop: 'Boston Hub Shop' }, { date: '2026-02-14', issue: 'Front Brake Pad Overhaul', cost: 1200.00, shop: 'JFK Depot Shop' }], timeline: [{ date: '2026-07-12', event: 'Trip TR-8802 started from Boston' }, { date: '2026-05-12', event: 'Maintenance service logged' }] },
  { registrationNumber: 'TRK-201', name: 'Freightliner Cascadia', type: 'Semi-Truck', capacity: 42000, odometer: 215400, acquisitionCost: 128000, status: 'On Trip', lastMaintenance: '2026-06-02', assignedDriver: 'Sarah Davis', health: 88, region: 'Midwest', purchaseDate: '2023-08-15', insuranceExpiry: '2026-08-15', roadTax: 'Compliant', documents: ['Insurance', 'Registration'], specs: { engine: 'Detroit DD15 505HP', fuelType: 'Diesel', mpg: 7.2, fuelCapacity: 120 }, tripsHistory: [{ id: 'TR-9114', route: 'CHI ➔ MSP', date: '2026-07-12', status: 'Delayed' }], fuelConsumption: [{ date: '2026-07-12', gallons: 120, cost: 410.50 }], maintenanceHistory: [{ date: '2026-06-02', issue: 'Transmission Fluid Check', cost: 320.00, shop: 'Chicago Terminal Shop' }], timeline: [{ date: '2026-07-12', event: 'Fuel logged: 120 Gallons' }, { date: '2026-07-12', event: 'Trip TR-9114 entered Delayed state' }] },
  { registrationNumber: 'TRK-544', name: 'Peterbilt 579', type: 'Semi-Truck', capacity: 48000, odometer: 89200, acquisitionCost: 142000, status: 'On Trip', lastMaintenance: '2026-06-25', assignedDriver: 'John Doe', health: 97, region: 'South', purchaseDate: '2024-11-01', insuranceExpiry: '2026-11-01', roadTax: 'Compliant', documents: ['Insurance', 'Registration', 'Permits'], specs: { engine: 'PACCAR MX-13 455HP', fuelType: 'Diesel', mpg: 7.0, fuelCapacity: 130 }, tripsHistory: [{ id: 'TR-7761', route: 'HOU ➔ DAL', date: '2026-07-12', status: 'On Trip' }, { id: 'TR-7611', route: 'DAL ➔ HOU', date: '2026-07-12', status: 'Completed' }], fuelConsumption: [{ date: '2026-07-10', gallons: 90, cost: 310.00 }], maintenanceHistory: [{ date: '2026-06-25', issue: 'Coolant Hose Leak Repair', cost: 180.00, shop: 'Houston Freight shop' }], timeline: [{ date: '2026-07-12', event: 'Trip TR-7611 arrived in Houston' }] },
  { registrationNumber: 'TRK-109', name: 'Ford Transit Cargo', type: 'Delivery Van', capacity: 4500, odometer: 42100, acquisitionCost: 45000, status: 'Available', lastMaintenance: '2026-04-18', assignedDriver: 'Jane Smith', health: 100, region: 'West Coast', purchaseDate: '2025-01-20', insuranceExpiry: '2027-01-20', roadTax: 'Compliant', documents: ['Insurance', 'Registration'], specs: { engine: '3.5L EcoBoost V6', fuelType: 'Gasoline', mpg: 14.5, fuelCapacity: 25 }, tripsHistory: [{ id: 'TR-3011', route: 'LAX ➔ SNA', date: '2026-07-05', status: 'Completed' }], fuelConsumption: [{ date: '2026-07-04', gallons: 20, cost: 75.00 }], maintenanceHistory: [{ date: '2026-04-18', issue: 'Scheduled Tire Rotation', cost: 95.00, shop: 'Los Angeles Terminal Shop' }], timeline: [{ date: '2026-04-18', event: 'Scheduled tire service completed' }] },
  { registrationNumber: 'TRK-704', name: 'Volvo VNL 860', type: 'Semi-Truck', capacity: 45000, odometer: 189400, acquisitionCost: 135000, status: 'In Shop', lastMaintenance: '2026-07-12', assignedDriver: 'N/A', health: 54, region: 'South', purchaseDate: '2024-03-12', insuranceExpiry: '2026-11-20', roadTax: 'Compliant', documents: ['Insurance', 'Registration'], specs: { engine: 'Volvo D13 455HP', fuelType: 'Diesel', mpg: 6.8, fuelCapacity: 150 }, tripsHistory: [], fuelConsumption: [], maintenanceHistory: [{ date: '2026-07-12', issue: 'Engine Misfire Check (Ongoing)', cost: 1400.00, shop: 'Atlanta Service Center' }], timeline: [{ date: '2026-07-12', event: 'Scheduled shop check-in' }] },
  { registrationNumber: 'TRK-112', name: 'Chevrolet Express', type: 'Delivery Van', capacity: 4000, odometer: 64100, acquisitionCost: 38000, status: 'Retired', lastMaintenance: '2026-01-10', assignedDriver: 'N/A', health: 72, region: 'West Coast', purchaseDate: '2021-05-10', insuranceExpiry: '2026-05-10', roadTax: 'Expired', documents: [], specs: { engine: '4.3L V6', fuelType: 'Gasoline', mpg: 13.0, fuelCapacity: 31 }, tripsHistory: [], fuelConsumption: [], maintenanceHistory: [], timeline: [{ date: '2026-06-01', event: 'Decommissioned from active service' }] },
  { registrationNumber: 'Van-05', name: 'Ford Transit', type: 'Delivery Van', capacity: 500, odometer: 10000, acquisitionCost: 25000, status: 'In Shop', lastMaintenance: '2026-07-12', assignedDriver: 'Alex', health: 95, region: 'East Coast', purchaseDate: '2025-06-01', insuranceExpiry: '2027-06-01', roadTax: 'Compliant', documents: ['Insurance', 'Registration'], specs: { engine: '2.0L EcoBlue', fuelType: 'Diesel', mpg: 30.0, fuelCapacity: 80 }, tripsHistory: [{ id: 'TR-1001', route: 'BOS ➔ JFK', date: '2026-07-12', status: 'Completed' }], fuelConsumption: [{ date: '2026-07-12', gallons: 15, cost: 52.5 }], maintenanceHistory: [{ date: '2026-07-12', issue: 'Oil Change', cost: 120.00, shop: 'Boston Hub Shop' }], timeline: [{ date: '2026-07-12', event: 'Oil Change logged' }] }
];

const seedMaintenanceRecords = [
  { id: 'MA-908', vehicle: 'Freightliner Cascadia (#TRK-201)', registrationNumber: 'TRK-201', type: 'Brake Service', workshop: 'Midwest Fleet Garage', mechanic: 'Tom Miller', scheduledDate: '2026-07-11', estimatedCost: 850, status: 'In Progress', priority: 'High', notes: 'Front brake pads require immediate replacement.', partsUsed: [{ name: 'Ceramic Brake Pads (Set)', qty: 2, cost: 280 }, { name: 'Fluid Refill', qty: 1, cost: 45 }] },
  { id: 'MA-907', vehicle: 'Ford Transit Cargo (#TRK-109)', registrationNumber: 'TRK-109', type: 'Oil Change', workshop: 'Chicago Rapid Lube', mechanic: 'Sarah Jenkins', scheduledDate: '2026-07-10', estimatedCost: 120, status: 'Completed', priority: 'Low', notes: 'Standard synthetic oil change.', partsUsed: [{ name: 'Synthetic Oil (5W-30)', qty: 6, cost: 72 }, { name: 'Premium Oil Filter', qty: 1, cost: 18 }] },
  { id: 'MA-909', vehicle: 'Ford Transit (#Van-05)', registrationNumber: 'Van-05', type: 'Oil Change', workshop: 'Boston Hub Shop', mechanic: 'Sarah Jenkins', scheduledDate: '2026-07-12', estimatedCost: 120, status: 'In Progress', priority: 'Medium', notes: 'Oil Change service.', partsUsed: [{ name: 'Engine Oil', qty: 1, cost: 50 }] }
];

const seedFuelLogs = [
  { id: 'FL-001', vehicle: 'Freightliner Cascadia', registrationNumber: 'TRK-201', driver: 'Sarah Davis', tripId: 'TR-9114', station: "Love's Travel Stop #102", fuelType: 'Diesel', quantity: 85, pricePerLiter: 3.58, totalCost: 304.3, odometer: 142200, date: '2026-07-11', notes: '' },
  { id: 'FL-002', vehicle: 'Volvo VNL 860', registrationNumber: 'TRK-892', driver: 'Robert Johnson', tripId: 'TR-8802', station: 'Pilot Flying J Boston', fuelType: 'Diesel', quantity: 110, pricePerLiter: 3.5, totalCost: 385, odometer: 142300, date: '2026-07-10', notes: '' },
  { id: 'FL-003', vehicle: 'Ford Transit', registrationNumber: 'Van-05', driver: 'Alex', tripId: 'TR-1001', station: 'Pilot Flying J Boston', fuelType: 'Diesel', quantity: 15, pricePerLiter: 3.5, totalCost: 52.5, odometer: 10200, date: '2026-07-12', notes: 'Fuel fill after trip completion' }
];

const seedExpenses = [
  { id: 'EX-001', vehicle: 'TRK-201', tripId: 'TR-9114', category: 'Toll', amount: 45, date: '2026-07-11', recordedBy: 'Sarah Davis', status: 'Approved', notes: 'Midwest turnpike pass' },
  { id: 'EX-002', vehicle: 'TRK-109', tripId: 'TR-4029', category: 'Parking', amount: 22, date: '2026-07-10', recordedBy: 'Jane Smith', status: 'Pending', notes: 'Overnight dock parking' },
  { id: 'EX-003', vehicle: 'Van-05', tripId: 'TR-1001', category: 'Other', amount: 120, date: '2026-07-12', recordedBy: 'Alex', status: 'Approved', notes: 'Oil Change cost' }
];

const seedNotifications = [
  { id: 'notif-1', type: 'license', title: 'Sarah Davis CDL Renewal', desc: 'Commercial Driver License expiring in 18 days. Contact driver immediately.', time: '3 mins ago', critical: true },
  { id: 'notif-2', type: 'maintenance', title: 'Scheduled Service: TRK-892', desc: 'Volvo VNL has exceeded 10,000 miles since last engine service.', time: '2 hours ago', critical: false },
  { id: 'notif-3', type: 'fuel', title: 'Fuel Invoice Spike Alert', desc: 'Transaction #TX-9092 marked cost efficiency anomaly (+$120 fuel bill).', time: '4 hours ago', critical: false },
];

const seedActivityTimeline = [
  { id: 'act-1', type: 'trip_completed', title: 'Trip #TR-7611 Completed', desc: 'Asset #TRK-544 arrived safely at Dallas Hub', time: '24 mins ago', color: '#22C55E', bgColor: '#DCFCE7' },
  { id: 'act-2', type: 'maintenance_created', title: 'Maintenance Created', desc: 'Volvo VNL (#TRK-892) registered for engine diagnostics', time: '1.2 hours ago', color: '#EF4444', bgColor: '#FEE2E2' },
  { id: 'act-3', type: 'fuel_logged', title: 'Fuel Logged', desc: '120 Gallons ($410.50) added to Asset #TRK-201', time: '2.5 hours ago', color: '#2563EB', bgColor: '#DBEAFE' },
];

const seedProfile = {
  id: 'USR-001',
  name: 'Piyush Sharma',
  email: 'admin@fleetflow.io',
  role: 'Admin',
  department: 'Fleet Operations',
  region: 'East Coast',
  notificationPreferences: { email: true, push: true, maintenance: true, trips: true, compliance: true, expenses: false, weekly: true, daily: false },
};

// ─── In-Memory Database State ───────────────────────────────────────────────────

export const db = {
  trips: [],
  drivers: [],
  vehicles: [],
  maintenanceRecords: [],
  fuelLogs: [],
  expenses: [],
  notifications: [],
  activityTimeline: [],
  profile: clone(seedProfile),
};

// ─── Activity & Notification Helpers ─────────────────────────────────────────

export const addActivity = ({ type, title, desc, color = '#2563EB', bgColor = '#DBEAFE' }) => {
  db.activityTimeline = [
    { id: createId('ACT'), type, title, desc, time: 'Just now', color, bgColor },
    ...db.activityTimeline,
  ].slice(0, 100);
};

export const addNotification = ({ title, description, category = 'system', priority = 'Medium', relatedVehicle, relatedDriver, relatedTrip, actionLabel }) => {
  db.notifications = [
    normalizeNotification({ id: createId('NTF'), title, description, category, priority, status: 'unread', timestamp: 'Just now', relatedVehicle, relatedDriver, relatedTrip, actionLabel }),
    ...db.notifications,
  ].slice(0, 200);
};

// ─── Enum Mapper Helpers ───────────────────────────────────────────────────────

const mapVehicleStatus = (s) => {
  if (s === 'On Trip') return 'On_Trip';
  if (s === 'In Shop') return 'In_Shop';
  if (['Available', 'Retired'].includes(s)) return s;
  return 'Available';
};

const mapDriverStatus = (s) => {
  if (s === 'On Trip') return 'On_Trip';
  if (s === 'Off Duty') return 'Off_Duty';
  if (['Available', 'Suspended'].includes(s)) return s;
  return 'Available';
};

const mapTripStatus = (s) => {
  if (s === 'On Trip' || s === 'Delayed') return 'Dispatched';
  if (['Draft', 'Completed', 'Cancelled'].includes(s)) return s;
  return 'Draft';
};

const mapExpenseType = (c) => {
  if (['Toll', 'Parking', 'Fine', 'Other'].includes(c)) return c;
  return 'Other';
};

// ─── Persistence to PostgreSQL ──────────────────────────────────────────────────

const orgId = 'de000000-0000-0000-0000-000000000000';

const demoUsers = [
  {
    id: toUuid('USR-001'),
    name: 'Piyush Sharma',
    email: 'admin@fleetflow.io',
    role: 'Admin',
    department: 'Corporate IT',
    region: 'East Coast'
  },
  {
    id: toUuid('USR-002'),
    name: 'Alex Thompson',
    email: 'manager@fleetflow.io',
    role: 'Fleet Manager',
    department: 'Fleet Operations',
    region: 'Midwest'
  },
  {
    id: toUuid('USR-003'),
    name: 'Robert Johnson',
    email: 'driver@fleetflow.io',
    role: 'Driver',
    department: 'Logistics',
    region: 'East Coast'
  },
  {
    id: toUuid('USR-004'),
    name: 'Marcus Brody',
    email: 'safety@fleetflow.io',
    role: 'Safety Officer',
    department: 'Compliance',
    region: 'South'
  },
  {
    id: toUuid('USR-005'),
    name: 'Sarah Jenkins',
    email: 'finance@fleetflow.io',
    role: 'Financial Analyst',
    department: 'Finance',
    region: 'East Coast'
  }
];

export const persistState = async () => {
  try {
    await prisma.$transaction(async (tx) => {
      // Temporarily disable triggers
      await tx.$executeRawUnsafe("SET session_replication_role = 'replica';");

      // 1. Ensure Default Org Exists
      await tx.organizations.upsert({
        where: { id: orgId },
        create: { id: orgId, name: 'FleetFlow Global', region: 'Global' },
        update: {}
      });

      // 2. Persist Profile / User & Demo Users
      for (const u of demoUsers) {
        const isCurrentProfile = u.email === db.profile.email;
        const name = isCurrentProfile ? db.profile.name : u.name;
        const metadata = isCurrentProfile ? db.profile : {
          role: u.role,
          department: u.department,
          region: u.region,
          notificationPreferences: { email: true, push: true }
        };

        await tx.users.upsert({
          where: { email: u.email },
          create: {
            id: u.id,
            organization_id: orgId,
            name,
            email: u.email,
            password_hash: '$2b$10$vbYfQ7tRuGT8xwAEEVTBqO4j7m7XDlqQGFx9QSt17ZFqcxSKyijh2', // bcrypt hash of password123
            metadata
          },
          update: {
            name,
            metadata
          }
        });
      }

      // 3. Persist Vehicles
      const vehicleIds = db.vehicles.map(v => toUuid(v.registrationNumber));
      await tx.vehicles.deleteMany({
        where: {
          id: { notIn: vehicleIds }
        }
      });
      for (const v of db.vehicles) {
        await tx.vehicles.upsert({
          where: { id: toUuid(v.registrationNumber) },
          create: {
            id: toUuid(v.registrationNumber),
            organization_id: orgId,
            registration_number: v.registrationNumber,
            name_model: v.name,
            type: v.type,
            max_load_capacity_kg: v.capacity || 12000,
            odometer_km: v.odometer || 0,
            acquisition_cost: v.acquisitionCost || 50000,
            status: mapVehicleStatus(v.status),
            region: v.region,
            metadata: v
          },
          update: {
            name_model: v.name,
            type: v.type,
            max_load_capacity_kg: v.capacity || 12000,
            odometer_km: v.odometer || 0,
            acquisition_cost: v.acquisitionCost || 50000,
            status: mapVehicleStatus(v.status),
            region: v.region,
            metadata: v
          }
        });
      }

      // 4. Persist Drivers
      const driverIds = db.drivers.map(d => toUuid(d.id));
      await tx.drivers.deleteMany({
        where: {
          id: { notIn: driverIds }
        }
      });
      for (const d of db.drivers) {
        await tx.drivers.upsert({
          where: { id: toUuid(d.id) },
          create: {
            id: toUuid(d.id),
            organization_id: orgId,
            name: d.name,
            license_number: d.licenseNumber,
            license_category: d.licenseCategory || 'CDL-A',
            license_expiry_date: new Date(d.licenseExpiry || today()),
            contact_number: d.contactNumber || '',
            safety_score: d.safetyScore || 100,
            status: mapDriverStatus(d.status),
            region: d.region,
            metadata: d
          },
          update: {
            name: d.name,
            license_number: d.licenseNumber,
            license_category: d.licenseCategory || 'CDL-A',
            license_expiry_date: new Date(d.licenseExpiry || today()),
            contact_number: d.contactNumber || '',
            safety_score: d.safetyScore || 100,
            status: mapDriverStatus(d.status),
            region: d.region,
            metadata: d
          }
        });
      }

      // 5. Persist Trips
      const tripIds = db.trips.map(t => toUuid(t.id));
      await tx.trips.deleteMany({
        where: {
          id: { notIn: tripIds }
        }
      });
      for (const t of db.trips) {
        const reg = vehicleRegistration(t.vehicle);
        const vehicleId = reg ? toUuid(reg) : null;
        const driverObj = findDriver(t.driver);
        const driverId = driverObj ? toUuid(driverObj.id) : null;

        const [source = 'Origin', destination = 'Destination'] = t.route.split(/\s*➔\s*|\s*➔\s*/);

        await tx.trips.upsert({
          where: { id: toUuid(t.id) },
          create: {
            id: toUuid(t.id),
            organization_id: orgId,
            source: source.trim(),
            destination: destination.trim(),
            vehicle_id: vehicleId,
            driver_id: driverId,
            cargo_weight_kg: t.cargoWeight || 0,
            planned_distance_km: t.distance || 0,
            status: mapTripStatus(t.status),
            metadata: t
          },
          update: {
            source: source.trim(),
            destination: destination.trim(),
            vehicle_id: vehicleId,
            driver_id: driverId,
            cargo_weight_kg: t.cargoWeight || 0,
            planned_distance_km: t.distance || 0,
            status: mapTripStatus(t.status),
            metadata: t
          }
        });
      }

      // 6. Persist Maintenance Records
      const maintIds = db.maintenanceRecords.map(m => toUuid(m.id));
      await tx.maintenance_logs.deleteMany({
        where: {
          id: { notIn: maintIds }
        }
      });
      for (const m of db.maintenanceRecords) {
        const mReg = m.registrationNumber || vehicleRegistration(m.vehicle);
        await tx.maintenance_logs.upsert({
          where: { id: toUuid(m.id) },
          create: {
            id: toUuid(m.id),
            vehicle_id: toUuid(mReg),
            type: m.type,
            description: m.notes || '',
            cost: m.estimatedCost || 0,
            status: m.status === 'Completed' ? 'Closed' : 'Open',
            metadata: m
          },
          update: {
            vehicle_id: toUuid(mReg),
            type: m.type,
            description: m.notes || '',
            cost: m.estimatedCost || 0,
            status: m.status === 'Completed' ? 'Closed' : 'Open',
            metadata: m
          }
        });
      }

      // 7. Persist Fuel Logs
      const fuelIds = db.fuelLogs.map(fl => toUuid(fl.id));
      await tx.fuel_logs.deleteMany({
        where: {
          id: { notIn: fuelIds }
        }
      });
      for (const fl of db.fuelLogs) {
        const flReg = fl.registrationNumber || vehicleRegistration(fl.vehicle);
        await tx.fuel_logs.upsert({
          where: { id: toUuid(fl.id) },
          create: {
            id: toUuid(fl.id),
            vehicle_id: toUuid(flReg),
            trip_id: fl.tripId ? toUuid(fl.tripId) : null,
            liters: fl.quantity || 0,
            cost: fl.totalCost || 0,
            metadata: fl
          },
          update: {
            vehicle_id: toUuid(flReg),
            trip_id: fl.tripId ? toUuid(fl.tripId) : null,
            liters: fl.quantity || 0,
            cost: fl.totalCost || 0,
            metadata: fl
          }
        });
      }

      // 8. Persist Expenses
      const expIds = db.expenses.map(e => toUuid(e.id));
      await tx.expenses.deleteMany({
        where: {
          id: { notIn: expIds }
        }
      });
      for (const e of db.expenses) {
        await tx.expenses.upsert({
          where: { id: toUuid(e.id) },
          create: {
            id: toUuid(e.id),
            vehicle_id: toUuid(e.vehicle),
            trip_id: e.tripId ? toUuid(e.tripId) : null,
            type: mapExpenseType(e.category),
            amount: e.amount || 0,
            metadata: e
          },
          update: {
            vehicle_id: toUuid(e.vehicle),
            trip_id: e.tripId ? toUuid(e.tripId) : null,
            type: mapExpenseType(e.category),
            amount: e.amount || 0,
            metadata: e
          }
        });
      }

      // 9. Persist Alerts / Notifications
      const alertIds = db.notifications.map(n => toUuid(n.id));
      await tx.alerts.deleteMany({
        where: {
          id: { notIn: alertIds }
        }
      });
      for (const n of db.notifications) {
        await tx.alerts.upsert({
          where: { id: toUuid(n.id) },
          create: {
            id: toUuid(n.id),
            organization_id: orgId,
            type: n.type || 'dispatch',
            message: n.title,
            severity: n.critical ? 'critical' : 'info',
            is_read: n.status === 'read',
            metadata: n
          },
          update: {
            type: n.type || 'dispatch',
            message: n.title,
            severity: n.critical ? 'critical' : 'info',
            is_read: n.status === 'read',
            metadata: n
          }
        });
      }

      // 10. Persist Activity Timeline Logs
      await tx.activity_logs.deleteMany();
      for (const al of db.activityTimeline) {
        await tx.activity_logs.create({
          data: {
            entity_type: al.type || 'system',
            entity_id: toUuid(al.id),
            action: al.title,
            metadata: al
          }
        });
      }

      // Restore replication role
      await tx.$executeRawUnsafe("SET session_replication_role = 'origin';");
    });
  } catch (error) {
    console.error('Error persisting state to PostgreSQL database:', error);
  }
};

export const loadState = async () => {
  try {
    const userCount = await prisma.users.count();
    if (userCount === 0) {
      console.log('PostgreSQL database is empty. Initializing with default seed data...');
      db.trips = clone(seedTrips);
      db.drivers = clone(seedDrivers);
      db.vehicles = clone(seedVehicles);
      db.maintenanceRecords = clone(seedMaintenanceRecords);
      db.fuelLogs = clone(seedFuelLogs);
      db.expenses = clone(seedExpenses);
      db.notifications = clone(seedNotifications).map(normalizeNotification);
      db.activityTimeline = clone(seedActivityTimeline);
      db.profile = clone(seedProfile);
      await persistState();
      return;
    }

    const users = await prisma.users.findMany();
    const vehicles = await prisma.vehicles.findMany();
    const drivers = await prisma.drivers.findMany();
    const trips = await prisma.trips.findMany();
    const maintenance = await prisma.maintenance_logs.findMany();
    const fuelLogs = await prisma.fuel_logs.findMany();
    const expenses = await prisma.expenses.findMany();
    const alerts = await prisma.alerts.findMany();
    const activityLogs = await prisma.activity_logs.findMany();

    // Map profile/user
    const adminUser = users.find(u => u.email === 'admin@fleetflow.io');
    if (adminUser) {
      db.profile = {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        ...(adminUser.metadata || {})
      };
    } else {
      db.profile = clone(seedProfile);
    }

    // Map vehicles
    db.vehicles = vehicles.map(v => ({
      registrationNumber: v.registration_number,
      name: v.name_model,
      type: v.type,
      capacity: Number(v.max_load_capacity_kg),
      odometer: Number(v.odometer_km),
      acquisitionCost: Number(v.acquisition_cost),
      status: v.status === 'On_Trip' ? 'On Trip' : v.status === 'In_Shop' ? 'In Shop' : v.status,
      region: v.region,
      ...(v.metadata || {})
    }));

    // Map drivers
    db.drivers = drivers.map(d => ({
      id: d.id,
      name: d.name,
      licenseNumber: d.license_number,
      licenseCategory: d.license_category,
      contactNumber: d.contact_number,
      safetyScore: Number(d.safety_score),
      status: d.status === 'On_Trip' ? 'On Trip' : d.status === 'Off_Duty' ? 'Off Duty' : d.status,
      region: d.region,
      ...(d.metadata || {})
    }));

    // Map trips
    db.trips = trips.map(t => ({
      id: t.id,
      route: `${t.source} ➔ ${t.destination}`,
      status: t.status === 'Dispatched' ? 'On Trip' : t.status,
      cargoWeight: Number(t.cargo_weight_kg),
      distance: Number(t.planned_distance_km),
      ...(t.metadata || {})
    }));

    // Map maintenanceRecords
    db.maintenanceRecords = maintenance.map(m => ({
      id: m.id,
      type: m.type,
      status: m.status === 'Closed' ? 'Completed' : 'In Progress',
      estimatedCost: Number(m.cost),
      ...(m.metadata || {})
    }));

    // Map fuelLogs
    db.fuelLogs = fuelLogs.map(fl => ({
      id: fl.id,
      quantity: Number(fl.liters),
      totalCost: Number(fl.cost),
      ...(fl.metadata || {})
    }));

    // Map expenses
    db.expenses = expenses.map(e => ({
      id: e.id,
      amount: Number(e.amount),
      ...(e.metadata || {})
    }));

    // Map notifications
    db.notifications = alerts.map(a => ({
      id: a.id,
      title: a.message,
      critical: a.severity === 'critical',
      status: a.is_read ? 'read' : 'unread',
      ...(a.metadata || {})
    })).map(normalizeNotification);

    // Map activityTimeline
    db.activityTimeline = activityLogs.map(al => ({
      id: String(al.id),
      type: al.entity_type,
      title: al.action,
      ...(al.metadata || {})
    }));

    // Ensure all demo users exist in the database
    await persistState();

  } catch (error) {
    console.error('Unable to load persisted data from PostgreSQL; using seed data.', error);
    db.trips = clone(seedTrips);
    db.drivers = clone(seedDrivers);
    db.vehicles = clone(seedVehicles);
    db.maintenanceRecords = clone(seedMaintenanceRecords);
    db.fuelLogs = clone(seedFuelLogs);
    db.expenses = clone(seedExpenses);
    db.notifications = clone(seedNotifications).map(normalizeNotification);
    db.activityTimeline = clone(seedActivityTimeline);
    db.profile = clone(seedProfile);
  }
};
