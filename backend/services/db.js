import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(currentDirectory, '..', 'data');
const dataFile = path.join(dataDirectory, 'fleetflow.json');

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const today = () => new Date().toISOString().slice(0, 10);
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const createId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
export const vehicleRegistration = (vehicle = '') => vehicle.match(/#([A-Z0-9-]+)/i)?.[1]?.toUpperCase();
export const findVehicle = (registrationNumber) => db.vehicles.find((v) => v.registrationNumber === registrationNumber);
export const findDriver = (name) => db.drivers.find((d) => d.name.toLowerCase() === String(name).toLowerCase());

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
];

const seedDrivers = [
  { id: 'DRV-101', name: 'Robert Johnson', licenseNumber: 'CDL-TX89012', licenseCategory: 'CDL-A', contactNumber: '+1 (512) 555-0101', safetyScore: 98, status: 'On Trip', currentVehicle: 'Volvo VNL 860 (#TRK-892)', licenseExpiry: '2027-11-20', daysToExpiry: 512, lastTrip: 'BOS-Hub ➔ JFK-NY', experience: 8, totalTrips: 142, avgDistance: 310, avgFuelEfficiency: 6.8, emergencyContact: 'Mary Johnson (Spouse) - +1 (512) 555-0102', region: 'East Coast', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 0, timeline: [{ date: '2026-07-12', event: 'Dispatched on route TR-8802' }, { date: '2026-05-10', event: 'Safety refresher class completed' }] },
  { id: 'DRV-102', name: 'Sarah Davis', licenseNumber: 'CDL-IL30921', licenseCategory: 'CDL-A', contactNumber: '+1 (312) 555-0102', safetyScore: 91, status: 'On Trip', currentVehicle: 'Freightliner Cascadia (#TRK-201)', licenseExpiry: '2026-07-30', daysToExpiry: 18, lastTrip: 'CHI-Depot ➔ MSP-Terminal', experience: 5, totalTrips: 98, avgDistance: 280, avgFuelEfficiency: 7.2, emergencyContact: 'James Davis (Father) - +1 (312) 555-0103', region: 'Midwest', compliance: { license: 'Expiring Soon', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 0, timeline: [{ date: '2026-07-12', event: 'Dispatched on route TR-9114' }] },
  { id: 'DRV-103', name: 'John Doe', licenseNumber: 'CDL-CA89201', licenseCategory: 'CDL-A', contactNumber: '+1 (213) 555-0103', safetyScore: 97, status: 'On Trip', currentVehicle: 'Peterbilt 579 (#TRK-544)', licenseExpiry: '2027-04-18', daysToExpiry: 280, lastTrip: 'HOU-Freight ➔ DAL-Distribution', experience: 10, totalTrips: 210, avgDistance: 340, avgFuelEfficiency: 7.0, emergencyContact: 'Jane Doe (Wife) - +1 (213) 555-0104', region: 'South', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 1, timeline: [{ date: '2026-07-12', event: 'Dispatched on route TR-7761' }] },
  { id: 'DRV-104', name: 'Jane Smith', licenseNumber: 'CDL-NY99810', licenseCategory: 'CDL-B', contactNumber: '+1 (212) 555-0104', safetyScore: 100, status: 'Available', currentVehicle: 'Ford Transit Cargo (#TRK-109)', licenseExpiry: '2027-09-12', daysToExpiry: 420, lastTrip: 'LAX-Hub ➔ SNA-Terminal', experience: 4, totalTrips: 76, avgDistance: 110, avgFuelEfficiency: 14.5, emergencyContact: 'Thomas Smith (Spouse) - +1 (212) 555-0105', region: 'West Coast', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 0, timeline: [{ date: '2026-07-05', event: 'Trip completed safely' }] },
  { id: 'DRV-105', name: 'Michael Miller', licenseNumber: 'CDL-GA88210', licenseCategory: 'CDL-A', contactNumber: '+1 (404) 555-0105', safetyScore: 65, status: 'Off Duty', currentVehicle: 'N/A', licenseExpiry: '2026-11-20', daysToExpiry: 131, lastTrip: 'MIA-Depot ➔ ATL-Hub', experience: 3, totalTrips: 45, avgDistance: 290, avgFuelEfficiency: 6.8, emergencyContact: 'Alice Miller (Wife) - +1 (404) 555-0106', region: 'South', compliance: { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Pending Refresher' }, incidents: 3, timeline: [{ date: '2026-07-08', event: 'Speeding alert flagged during route' }] },
  { id: 'DRV-106', name: 'David Wilson', licenseNumber: 'CDL-FL70921', licenseCategory: 'CDL-A', contactNumber: '+1 (305) 555-0106', safetyScore: 78, status: 'Suspended', currentVehicle: 'N/A', licenseExpiry: '2026-06-01', daysToExpiry: -41, lastTrip: 'SEA-Hub ➔ PDX-Depot', experience: 7, totalTrips: 112, avgDistance: 270, avgFuelEfficiency: 6.9, emergencyContact: 'Carol Wilson (Wife) - +1 (305) 555-0107', region: 'West Coast', compliance: { license: 'Expired', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 2, timeline: [{ date: '2026-06-01', event: 'Safety suspension order issued' }] },
];

const seedVehicles = [
  { registrationNumber: 'TRK-892', name: 'Volvo VNL 860', type: 'Semi-Truck', capacity: 45000, odometer: 142300, acquisitionCost: 135000, status: 'On Trip', lastMaintenance: '2026-05-12', assignedDriver: 'Robert Johnson', health: 94, region: 'East Coast', purchaseDate: '2024-03-12', insuranceExpiry: '2026-11-20', roadTax: 'Compliant', documents: ['Insurance', 'Registration', 'Permits'], specs: { engine: 'Volvo D13 455HP', fuelType: 'Diesel', mpg: 6.8, fuelCapacity: 150 }, tripsHistory: [{ id: 'TR-8802', route: 'BOS ➔ JFK', date: '2026-07-12', status: 'On Trip' }, { id: 'TR-8409', route: 'PHL ➔ BOS', date: '2026-07-09', status: 'Completed' }], fuelConsumption: [{ date: '2026-07-10', gallons: 110, cost: 385.00 }, { date: '2026-07-06', gallons: 125, cost: 437.50 }], maintenanceHistory: [{ date: '2026-05-12', issue: 'A-Service Oil Renewal', cost: 450.00, shop: 'Boston Hub Shop' }, { date: '2026-02-14', issue: 'Front Brake Pad Overhaul', cost: 1200.00, shop: 'JFK Depot Shop' }], timeline: [{ date: '2026-07-12', event: 'Trip TR-8802 started from Boston' }, { date: '2026-05-12', event: 'Maintenance service logged' }] },
  { registrationNumber: 'TRK-201', name: 'Freightliner Cascadia', type: 'Semi-Truck', capacity: 42000, odometer: 215400, acquisitionCost: 128000, status: 'On Trip', lastMaintenance: '2026-06-02', assignedDriver: 'Sarah Davis', health: 88, region: 'Midwest', purchaseDate: '2023-08-15', insuranceExpiry: '2026-08-15', roadTax: 'Compliant', documents: ['Insurance', 'Registration'], specs: { engine: 'Detroit DD15 505HP', fuelType: 'Diesel', mpg: 7.2, fuelCapacity: 120 }, tripsHistory: [{ id: 'TR-9114', route: 'CHI ➔ MSP', date: '2026-07-12', status: 'Delayed' }], fuelConsumption: [{ date: '2026-07-12', gallons: 120, cost: 410.50 }], maintenanceHistory: [{ date: '2026-06-02', issue: 'Transmission Fluid Check', cost: 320.00, shop: 'Chicago Terminal Shop' }], timeline: [{ date: '2026-07-12', event: 'Fuel logged: 120 Gallons' }, { date: '2026-07-12', event: 'Trip TR-9114 entered Delayed state' }] },
  { registrationNumber: 'TRK-544', name: 'Peterbilt 579', type: 'Semi-Truck', capacity: 48000, odometer: 89200, acquisitionCost: 142000, status: 'On Trip', lastMaintenance: '2026-06-25', assignedDriver: 'John Doe', health: 97, region: 'South', purchaseDate: '2024-11-01', insuranceExpiry: '2026-11-01', roadTax: 'Compliant', documents: ['Insurance', 'Registration', 'Permits'], specs: { engine: 'PACCAR MX-13 455HP', fuelType: 'Diesel', mpg: 7.0, fuelCapacity: 130 }, tripsHistory: [{ id: 'TR-7761', route: 'HOU ➔ DAL', date: '2026-07-12', status: 'On Trip' }, { id: 'TR-7611', route: 'DAL ➔ HOU', date: '2026-07-12', status: 'Completed' }], fuelConsumption: [{ date: '2026-07-10', gallons: 90, cost: 310.00 }], maintenanceHistory: [{ date: '2026-06-25', issue: 'Coolant Hose Leak Repair', cost: 180.00, shop: 'Houston Freight shop' }], timeline: [{ date: '2026-07-12', event: 'Trip TR-7611 arrived in Houston' }] },
  { registrationNumber: 'TRK-109', name: 'Ford Transit Cargo', type: 'Delivery Van', capacity: 4500, odometer: 42100, acquisitionCost: 45000, status: 'Available', lastMaintenance: '2026-04-18', assignedDriver: 'Jane Smith', health: 100, region: 'West Coast', purchaseDate: '2025-01-20', insuranceExpiry: '2027-01-20', roadTax: 'Compliant', documents: ['Insurance', 'Registration'], specs: { engine: '3.5L EcoBoost V6', fuelType: 'Gasoline', mpg: 14.5, fuelCapacity: 25 }, tripsHistory: [{ id: 'TR-3011', route: 'LAX ➔ SNA', date: '2026-07-05', status: 'Completed' }], fuelConsumption: [{ date: '2026-07-04', gallons: 20, cost: 75.00 }], maintenanceHistory: [{ date: '2026-04-18', issue: 'Scheduled Tire Rotation', cost: 95.00, shop: 'Los Angeles Terminal Shop' }], timeline: [{ date: '2026-04-18', event: 'Scheduled tire service completed' }] },
  { registrationNumber: 'TRK-704', name: 'Volvo VNL 860', type: 'Semi-Truck', capacity: 45000, odometer: 189400, acquisitionCost: 135000, status: 'In Shop', lastMaintenance: '2026-07-12', assignedDriver: 'N/A', health: 54, region: 'South', purchaseDate: '2024-03-12', insuranceExpiry: '2026-11-20', roadTax: 'Compliant', documents: ['Insurance', 'Registration'], specs: { engine: 'Volvo D13 455HP', fuelType: 'Diesel', mpg: 6.8, fuelCapacity: 150 }, tripsHistory: [], fuelConsumption: [], maintenanceHistory: [{ date: '2026-07-12', issue: 'Engine Misfire Check (Ongoing)', cost: 1400.00, shop: 'Atlanta Service Center' }], timeline: [{ date: '2026-07-12', event: 'Scheduled shop check-in' }] },
  { registrationNumber: 'TRK-112', name: 'Chevrolet Express', type: 'Delivery Van', capacity: 4000, odometer: 64100, acquisitionCost: 38000, status: 'Retired', lastMaintenance: '2026-01-10', assignedDriver: 'N/A', health: 72, region: 'West Coast', purchaseDate: '2021-05-10', insuranceExpiry: '2026-05-10', roadTax: 'Expired', documents: [], specs: { engine: '4.3L V6', fuelType: 'Gasoline', mpg: 13.0, fuelCapacity: 31 }, tripsHistory: [], fuelConsumption: [], maintenanceHistory: [], timeline: [{ date: '2026-06-01', event: 'Decommissioned from active service' }] },
];

const seedMaintenanceRecords = [
  { id: 'MA-908', vehicle: 'Freightliner Cascadia (#TRK-201)', registrationNumber: 'TRK-201', type: 'Brake Service', workshop: 'Midwest Fleet Garage', mechanic: 'Tom Miller', scheduledDate: '2026-07-11', estimatedCost: 850, status: 'In Progress', priority: 'High', notes: 'Front brake pads require immediate replacement.', partsUsed: [{ name: 'Ceramic Brake Pads (Set)', qty: 2, cost: 280 }, { name: 'Fluid Refill', qty: 1, cost: 45 }] },
  { id: 'MA-907', vehicle: 'Ford Transit Cargo (#TRK-109)', registrationNumber: 'TRK-109', type: 'Oil Change', workshop: 'Chicago Rapid Lube', mechanic: 'Sarah Jenkins', scheduledDate: '2026-07-10', estimatedCost: 120, status: 'Completed', priority: 'Low', notes: 'Standard synthetic oil change.', partsUsed: [{ name: 'Synthetic Oil (5W-30)', qty: 6, cost: 72 }, { name: 'Premium Oil Filter', qty: 1, cost: 18 }] },
];

const seedFuelLogs = [
  { id: 'FL-001', vehicle: 'Freightliner Cascadia', registrationNumber: 'TRK-201', driver: 'Sarah Davis', tripId: 'TR-9114', station: "Love's Travel Stop #102", fuelType: 'Diesel', quantity: 85, pricePerLiter: 3.58, totalCost: 304.3, odometer: 142200, date: '2026-07-11', notes: '' },
  { id: 'FL-002', vehicle: 'Volvo VNL 860', registrationNumber: 'TRK-892', driver: 'Robert Johnson', tripId: 'TR-8802', station: 'Pilot Flying J Boston', fuelType: 'Diesel', quantity: 110, pricePerLiter: 3.5, totalCost: 385, odometer: 142300, date: '2026-07-10', notes: '' },
];

const seedExpenses = [
  { id: 'EX-001', vehicle: 'TRK-201', tripId: 'TR-9114', category: 'Toll', amount: 45, date: '2026-07-11', recordedBy: 'Sarah Davis', status: 'Approved', notes: 'Midwest turnpike pass' },
  { id: 'EX-002', vehicle: 'TRK-109', tripId: 'TR-4029', category: 'Parking', amount: 22, date: '2026-07-10', recordedBy: 'Jane Smith', status: 'Pending', notes: 'Overnight dock parking' },
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
  role: 'Fleet Manager',
  department: 'Fleet Operations',
  region: 'East Coast',
  notificationPreferences: { email: true, push: true, maintenance: true, trips: true, compliance: true, expenses: false, weekly: true, daily: false },
};

// ─── In-Memory Database ───────────────────────────────────────────────────────

export const db = {
  trips: clone(seedTrips),
  drivers: clone(seedDrivers),
  vehicles: clone(seedVehicles),
  maintenanceRecords: clone(seedMaintenanceRecords),
  fuelLogs: clone(seedFuelLogs),
  expenses: clone(seedExpenses),
  notifications: clone(seedNotifications).map(normalizeNotification),
  activityTimeline: clone(seedActivityTimeline),
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

// ─── Persistence ──────────────────────────────────────────────────────────────

export const persistState = () => {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const state = {
    trips: db.trips,
    drivers: db.drivers,
    vehicles: db.vehicles,
    notifications: db.notifications,
    activityTimeline: db.activityTimeline,
    maintenanceRecords: db.maintenanceRecords,
    fuelLogs: db.fuelLogs,
    expenses: db.expenses,
    profile: db.profile,
  };
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(state, null, 2));
  fs.renameSync(temporaryFile, dataFile);
};

export const loadState = () => {
  if (!fs.existsSync(dataFile)) {
    persistState();
    return;
  }
  try {
    const persisted = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    if (Array.isArray(persisted.trips)) db.trips = persisted.trips;
    if (Array.isArray(persisted.drivers)) db.drivers = persisted.drivers;
    if (Array.isArray(persisted.vehicles)) db.vehicles = persisted.vehicles;
    if (Array.isArray(persisted.notifications)) db.notifications = persisted.notifications.map(normalizeNotification);
    if (Array.isArray(persisted.activityTimeline)) db.activityTimeline = persisted.activityTimeline;
    if (Array.isArray(persisted.maintenanceRecords)) db.maintenanceRecords = persisted.maintenanceRecords;
    if (Array.isArray(persisted.fuelLogs)) db.fuelLogs = persisted.fuelLogs;
    if (Array.isArray(persisted.expenses)) db.expenses = persisted.expenses;
    if (persisted.profile && typeof persisted.profile === 'object') db.profile = persisted.profile;
  } catch (error) {
    console.error('Unable to load persisted data; using seed data.', error);
    persistState();
  }
};
