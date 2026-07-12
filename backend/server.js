import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const authSecret = process.env.AUTH_SECRET || 'change-this-development-secret-before-deploying';
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(currentDirectory, 'data');
const dataFile = path.join(dataDirectory, 'transitops.json');

app.use(cors({ origin: clientOrigin.split(',').map((origin) => origin.trim()) }));
app.use(express.json());

// In-memory Database States
let trips = [
  {
    id: 'TR-8802',
    vehicle: 'Volvo VNL 860 (#TRK-892)',
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
    vehicle: 'Peterbilt 579 (#TRK-544)',
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
    vehicle: 'Volvo VNL 860 (#TRK-704)',
    vehicleType: 'Semi-Truck',
    driver: 'Michael Miller',
    route: 'MIA-Depot ➔ ATL-Hub',
    status: 'In Shop',
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

let drivers = [
  {
    id: 'DRV-101',
    name: 'Robert Johnson',
    licenseNumber: 'CDL-TX89012',
    licenseCategory: 'CDL-A',
    contactNumber: '+1 (512) 555-0101',
    safetyScore: 98,
    status: 'On Trip',
    currentVehicle: 'Volvo VNL 860 (#TRK-892)',
    licenseExpiry: '2027-11-20',
    daysToExpiry: 512,
    lastTrip: 'BOS-Hub ➔ JFK-NY',
    experience: 8,
    totalTrips: 142,
    avgDistance: 310,
    avgFuelEfficiency: 6.8,
    emergencyContact: 'Mary Johnson (Spouse) - +1 (512) 555-0102',
    region: 'East Coast',
    compliance: {
      license: 'Valid',
      medical: 'Valid',
      background: 'Cleared',
      training: 'Completed'
    },
    incidents: 0,
    timeline: [
      { date: '2026-07-12', event: 'Dispatched on route TR-8802' },
      { date: '2026-05-10', event: 'Safety refresher class completed' }
    ]
  },
  {
    id: 'DRV-102',
    name: 'Sarah Davis',
    licenseNumber: 'CDL-IL30921',
    licenseCategory: 'CDL-A',
    contactNumber: '+1 (312) 555-0102',
    safetyScore: 91,
    status: 'On Trip',
    currentVehicle: 'Freightliner Cascadia (#TRK-201)',
    licenseExpiry: '2026-07-30', // Expiring in 18 days
    daysToExpiry: 18,
    lastTrip: 'CHI-Depot ➔ MSP-Terminal',
    experience: 5,
    totalTrips: 98,
    avgDistance: 280,
    avgFuelEfficiency: 7.2,
    emergencyContact: 'James Davis (Father) - +1 (312) 555-0103',
    region: 'Midwest',
    compliance: {
      license: 'Expiring Soon',
      medical: 'Valid',
      background: 'Cleared',
      training: 'Completed'
    },
    incidents: 0,
    timeline: [
      { date: '2026-07-12', event: 'Dispatched on route TR-9114' }
    ]
  },
  {
    id: 'DRV-103',
    name: 'John Doe',
    licenseNumber: 'CDL-CA89201',
    licenseCategory: 'CDL-A',
    contactNumber: '+1 (213) 555-0103',
    safetyScore: 97,
    status: 'On Trip',
    currentVehicle: 'Peterbilt 579 (#TRK-544)',
    licenseExpiry: '2027-04-18',
    daysToExpiry: 280,
    lastTrip: 'HOU-Freight ➔ DAL-Distribution',
    experience: 10,
    totalTrips: 210,
    avgDistance: 340,
    avgFuelEfficiency: 7.0,
    emergencyContact: 'Jane Doe (Wife) - +1 (213) 555-0104',
    region: 'South',
    compliance: {
      license: 'Valid',
      medical: 'Valid',
      background: 'Cleared',
      training: 'Completed'
    },
    incidents: 1,
    timeline: [
      { date: '2026-07-12', event: 'Dispatched on route TR-7761' }
    ]
  },
  {
    id: 'DRV-104',
    name: 'Jane Smith',
    licenseNumber: 'CDL-NY99810',
    licenseCategory: 'CDL-B',
    contactNumber: '+1 (212) 555-0104',
    safetyScore: 100,
    status: 'Available',
    currentVehicle: 'Ford Transit Cargo (#TRK-109)',
    licenseExpiry: '2027-09-12',
    daysToExpiry: 420,
    lastTrip: 'LAX-Hub ➔ SNA-Terminal',
    experience: 4,
    totalTrips: 76,
    avgDistance: 110,
    avgFuelEfficiency: 14.5,
    emergencyContact: 'Thomas Smith (Spouse) - +1 (212) 555-0105',
    region: 'West Coast',
    compliance: {
      license: 'Valid',
      medical: 'Valid',
      background: 'Cleared',
      training: 'Completed'
    },
    incidents: 0,
    timeline: [
      { date: '2026-07-05', event: 'Trip completed safely' }
    ]
  },
  {
    id: 'DRV-105',
    name: 'Michael Miller',
    licenseNumber: 'CDL-GA88210',
    licenseCategory: 'CDL-A',
    contactNumber: '+1 (404) 555-0105',
    safetyScore: 65, // Low safety score!
    status: 'Off Duty',
    currentVehicle: 'N/A',
    licenseExpiry: '2026-11-20',
    daysToExpiry: 131,
    lastTrip: 'MIA-Depot ➔ ATL-Hub',
    experience: 3,
    totalTrips: 45,
    avgDistance: 290,
    avgFuelEfficiency: 6.8,
    emergencyContact: 'Alice Miller (Wife) - +1 (404) 555-0106',
    region: 'South',
    compliance: {
      license: 'Valid',
      medical: 'Valid',
      background: 'Cleared',
      training: 'Pending Refresher'
    },
    incidents: 3,
    timeline: [
      { date: '2026-07-08', event: 'Speeding alert flagged during route' }
    ]
  },
  {
    id: 'DRV-106',
    name: 'David Wilson',
    licenseNumber: 'CDL-FL70921',
    licenseCategory: 'CDL-A',
    contactNumber: '+1 (305) 555-0106',
    safetyScore: 78,
    status: 'Suspended', // Suspended driver!
    currentVehicle: 'N/A',
    licenseExpiry: '2026-06-01', // Expired license!
    daysToExpiry: -41,
    lastTrip: 'SEA-Hub ➔ PDX-Depot',
    experience: 7,
    totalTrips: 112,
    avgDistance: 270,
    avgFuelEfficiency: 6.9,
    emergencyContact: 'Carol Wilson (Wife) - +1 (305) 555-0107',
    region: 'West Coast',
    compliance: {
      license: 'Expired',
      medical: 'Valid',
      background: 'Cleared',
      training: 'Completed'
    },
    incidents: 2,
    timeline: [
      { date: '2026-06-01', event: 'Safety suspension order issued' }
    ]
  }
];

let notifications = [
  {
    id: 'notif-1',
    type: 'license',
    title: 'Sarah Davis CDL Renewal',
    desc: 'Commercial Driver License expiring in 18 days. Contact driver immediately.',
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

let activityTimeline = [
  {
    id: 'act-1',
    type: 'trip_completed',
    title: 'Trip #TR-7611 Completed',
    desc: 'Asset #TRK-544 arrived safely at Dallas Hub',
    time: '24 mins ago',
    color: '#22C55E',
    bgColor: '#DCFCE7'
  },
  {
    id: 'act-2',
    type: 'maintenance_created',
    title: 'Maintenance Created',
    desc: 'Volvo VNL (#TRK-892) registered for engine diagnostics',
    time: '1.2 hours ago',
    color: '#EF4444',
    bgColor: '#FEE2E2'
  },
  {
    id: 'act-3',
    type: 'fuel_logged',
    title: 'Fuel Logged',
    desc: '120 Gallons ($410.50) added to Asset #TRK-201',
    time: '2.5 hours ago',
    color: '#2563EB',
    bgColor: '#DBEAFE'
  }
];

// Expanded Vehicle Database State
let vehicles = [
  {
    registrationNumber: 'TRK-892',
    name: 'Volvo VNL 860',
    type: 'Semi-Truck',
    capacity: 45000,
    odometer: 142300,
    acquisitionCost: 135000,
    status: 'On Trip',
    lastMaintenance: '2026-05-12',
    assignedDriver: 'Robert Johnson',
    health: 94,
    region: 'East Coast',
    purchaseDate: '2024-03-12',
    insuranceExpiry: '2026-11-20',
    roadTax: 'Compliant',
    documents: ['Insurance', 'Registration', 'Permits'],
    specs: {
      engine: 'Volvo D13 455HP',
      fuelType: 'Diesel',
      mpg: 6.8,
      fuelCapacity: 150
    },
    tripsHistory: [
      { id: 'TR-8802', route: 'BOS ➔ JFK', date: '2026-07-12', status: 'On Trip' },
      { id: 'TR-8409', route: 'PHL ➔ BOS', date: '2026-07-09', status: 'Completed' }
    ],
    fuelConsumption: [
      { date: '2026-07-10', gallons: 110, cost: 385.00 },
      { date: '2026-07-06', gallons: 125, cost: 437.50 }
    ],
    maintenanceHistory: [
      { date: '2026-05-12', issue: 'A-Service Oil Renewal', cost: 450.00, shop: 'Boston Hub Shop' },
      { date: '2026-02-14', issue: 'Front Brake Pad Overhaul', cost: 1200.00, shop: 'JFK Depot Shop' }
    ],
    timeline: [
      { date: '2026-07-12', event: 'Trip TR-8802 started from Boston' },
      { date: '2026-05-12', event: 'Maintenance service logged' }
    ]
  },
  {
    registrationNumber: 'TRK-201',
    name: 'Freightliner Cascadia',
    type: 'Semi-Truck',
    capacity: 42000,
    odometer: 215400,
    acquisitionCost: 128000,
    status: 'On Trip',
    lastMaintenance: '2026-06-02',
    assignedDriver: 'Sarah Davis',
    health: 88,
    region: 'Midwest',
    purchaseDate: '2023-08-15',
    insuranceExpiry: '2026-08-15',
    roadTax: 'Compliant',
    documents: ['Insurance', 'Registration'],
    specs: {
      engine: 'Detroit DD15 505HP',
      fuelType: 'Diesel',
      mpg: 7.2,
      fuelCapacity: 120
    },
    tripsHistory: [
      { id: 'TR-9114', route: 'CHI ➔ MSP', date: '2026-07-12', status: 'Delayed' }
    ],
    fuelConsumption: [
      { date: '2026-07-12', gallons: 120, cost: 410.50 }
    ],
    maintenanceHistory: [
      { date: '2026-06-02', issue: 'Transmission Fluid Check', cost: 320.00, shop: 'Chicago Terminal Shop' }
    ],
    timeline: [
      { date: '2026-07-12', event: 'Fuel logged: 120 Gallons' },
      { date: '2026-07-12', event: 'Trip TR-9114 entered Delayed state' }
    ]
  },
  {
    registrationNumber: 'TRK-544',
    name: 'Peterbilt 579',
    type: 'Semi-Truck',
    capacity: 48000,
    odometer: 89200,
    acquisitionCost: 142000,
    status: 'On Trip',
    lastMaintenance: '2026-06-25',
    assignedDriver: 'John Doe',
    health: 97,
    region: 'South',
    purchaseDate: '2024-11-01',
    insuranceExpiry: '2026-11-01',
    roadTax: 'Compliant',
    documents: ['Insurance', 'Registration', 'Permits'],
    specs: {
      engine: 'PACCAR MX-13 455HP',
      fuelType: 'Diesel',
      mpg: 7.0,
      fuelCapacity: 130
    },
    tripsHistory: [
      { id: 'TR-7761', route: 'HOU ➔ DAL', date: '2026-07-12', status: 'On Trip' },
      { id: 'TR-7611', route: 'DAL ➔ HOU', date: '2026-07-12', status: 'Completed' }
    ],
    fuelConsumption: [
      { date: '2026-07-10', gallons: 90, cost: 310.00 }
    ],
    maintenanceHistory: [
      { date: '2026-06-25', issue: 'Coolant Hose Leak Repair', cost: 180.00, shop: 'Houston Freight shop' }
    ],
    timeline: [
      { date: '2026-07-12', event: 'Trip TR-7611 arrived in Houston' }
    ]
  },
  {
    registrationNumber: 'TRK-109',
    name: 'Ford Transit Cargo',
    type: 'Delivery Van',
    capacity: 4500,
    odometer: 42100,
    acquisitionCost: 45000,
    status: 'Available',
    lastMaintenance: '2026-04-18',
    assignedDriver: 'Jane Smith',
    health: 100,
    region: 'West Coast',
    purchaseDate: '2025-01-20',
    insuranceExpiry: '2027-01-20',
    roadTax: 'Compliant',
    documents: ['Insurance', 'Registration'],
    specs: {
      engine: '3.5L EcoBoost V6',
      fuelType: 'Gasoline',
      mpg: 14.5,
      fuelCapacity: 25
    },
    tripsHistory: [
      { id: 'TR-3011', route: 'LAX ➔ SNA', date: '2026-07-05', status: 'Completed' }
    ],
    fuelConsumption: [
      { date: '2026-07-04', gallons: 20, cost: 75.00 }
    ],
    maintenanceHistory: [
      { date: '2026-04-18', issue: 'Scheduled Tire Rotation', cost: 95.00, shop: 'Los Angeles Terminal Shop' }
    ],
    timeline: [
      { date: '2026-04-18', event: 'Scheduled tire service completed' }
    ]
  },
  {
    registrationNumber: 'TRK-704',
    name: 'Volvo VNL 860',
    type: 'Semi-Truck',
    capacity: 45000,
    odometer: 189400,
    acquisitionCost: 135000,
    status: 'In Shop',
    lastMaintenance: '2026-07-12',
    assignedDriver: 'N/A',
    health: 54,
    region: 'South',
    purchaseDate: '2024-03-12',
    insuranceExpiry: '2026-11-20',
    roadTax: 'Compliant',
    documents: ['Insurance', 'Registration'],
    specs: {
      engine: 'Volvo D13 455HP',
      fuelType: 'Diesel',
      mpg: 6.8,
      fuelCapacity: 150
    },
    tripsHistory: [],
    fuelConsumption: [],
    maintenanceHistory: [
      { date: '2026-07-12', issue: 'Engine Misfire Check (Ongoing)', cost: 1400.00, shop: 'Atlanta Service Center' }
    ],
    timeline: [
      { date: '2026-07-12', event: 'Scheduled shop check-in' }
    ]
  },
  {
    registrationNumber: 'TRK-112',
    name: 'Chevrolet Express',
    type: 'Delivery Van',
    capacity: 4000,
    odometer: 64100,
    acquisitionCost: 38000,
    status: 'Retired',
    lastMaintenance: '2026-01-10',
    assignedDriver: 'N/A',
    health: 72,
    region: 'West Coast',
    purchaseDate: '2021-05-10',
    insuranceExpiry: '2026-05-10',
    roadTax: 'Expired',
    documents: [],
    specs: {
      engine: '4.3L V6',
      fuelType: 'Gasoline',
      mpg: 13.0,
      fuelCapacity: 31
    },
    tripsHistory: [],
    fuelConsumption: [],
    maintenanceHistory: [],
    timeline: [
      { date: '2026-06-01', event: 'Decommissioned from active service' }
    ]
  }
];

let maintenanceRecords = [
  {
    id: 'MA-908',
    vehicle: 'Freightliner Cascadia (#TRK-201)',
    registrationNumber: 'TRK-201',
    type: 'Brake Service',
    workshop: 'Midwest Fleet Garage',
    mechanic: 'Tom Miller',
    scheduledDate: '2026-07-11',
    estimatedCost: 850,
    status: 'In Progress',
    priority: 'High',
    notes: 'Front brake pads require immediate replacement.',
    partsUsed: [
      { name: 'Ceramic Brake Pads (Set)', qty: 2, cost: 280 },
      { name: 'Fluid Refill', qty: 1, cost: 45 }
    ]
  },
  {
    id: 'MA-907',
    vehicle: 'Ford Transit Cargo (#TRK-109)',
    registrationNumber: 'TRK-109',
    type: 'Oil Change',
    workshop: 'Chicago Rapid Lube',
    mechanic: 'Sarah Jenkins',
    scheduledDate: '2026-07-10',
    estimatedCost: 120,
    status: 'Completed',
    priority: 'Low',
    notes: 'Standard synthetic oil change.',
    partsUsed: [
      { name: 'Synthetic Oil (5W-30)', qty: 6, cost: 72 },
      { name: 'Premium Oil Filter', qty: 1, cost: 18 }
    ]
  }
];

let fuelLogs = [
  {
    id: 'FL-001',
    vehicle: 'Freightliner Cascadia',
    registrationNumber: 'TRK-201',
    driver: 'Sarah Davis',
    tripId: 'TR-9114',
    station: "Love's Travel Stop #102",
    fuelType: 'Diesel',
    quantity: 85,
    pricePerLiter: 3.58,
    totalCost: 304.3,
    odometer: 142200,
    date: '2026-07-11',
    notes: ''
  },
  {
    id: 'FL-002',
    vehicle: 'Volvo VNL 860',
    registrationNumber: 'TRK-892',
    driver: 'Robert Johnson',
    tripId: 'TR-8802',
    station: 'Pilot Flying J Boston',
    fuelType: 'Diesel',
    quantity: 110,
    pricePerLiter: 3.5,
    totalCost: 385,
    odometer: 142300,
    date: '2026-07-10',
    notes: ''
  }
];

let expenses = [
  {
    id: 'EX-001',
    vehicle: 'TRK-201',
    tripId: 'TR-9114',
    category: 'Toll',
    amount: 45,
    date: '2026-07-11',
    recordedBy: 'Sarah Davis',
    status: 'Approved',
    notes: 'Midwest turnpike pass'
  },
  {
    id: 'EX-002',
    vehicle: 'TRK-109',
    tripId: 'TR-4029',
    category: 'Parking',
    amount: 22,
    date: '2026-07-10',
    recordedBy: 'Jane Smith',
    status: 'Pending',
    notes: 'Overnight dock parking'
  }
];

let profile = {
  id: 'USR-001',
  name: 'Piyush Sharma',
  email: 'admin@transitops.com',
  role: 'Fleet Manager',
  department: 'Fleet Operations',
  region: 'East Coast',
  notificationPreferences: {
    email: true,
    push: true,
    maintenance: true,
    trips: true,
    compliance: true,
    expenses: false,
    weekly: true,
    daily: false
  }
};

const today = () => new Date().toISOString().slice(0, 10);
const clone = (value) => JSON.parse(JSON.stringify(value));
const createId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
const vehicleRegistration = (vehicle = '') => vehicle.match(/#([A-Z0-9-]+)/i)?.[1]?.toUpperCase();
const findVehicle = (registrationNumber) => vehicles.find((vehicle) => vehicle.registrationNumber === registrationNumber);
const findDriver = (name) => drivers.find((driver) => driver.name.toLowerCase() === String(name).toLowerCase());

const notificationType = (category) => {
  if (category === 'maintenance') return 'maintenance';
  if (category === 'fuel' || category === 'expenses') return 'fuel';
  if (category === 'compliance' || category === 'drivers') return 'license';
  return 'dispatch';
};

const normalizeNotification = (notification) => {
  const category = notification.category || (notification.type === 'license' ? 'compliance' : notification.type === 'fuel' ? 'fuel' : notification.type === 'maintenance' ? 'maintenance' : 'trips');
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
    time: notification.time || notification.timestamp || 'Just now'
  };
};

const initialState = () => ({
  trips: clone(trips),
  drivers: clone(drivers),
  vehicles: clone(vehicles),
  notifications: clone(notifications).map(normalizeNotification),
  activityTimeline: clone(activityTimeline),
  maintenanceRecords: clone(maintenanceRecords),
  fuelLogs: clone(fuelLogs),
  expenses: clone(expenses),
  profile: clone(profile)
});

const persistState = () => {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const state = { trips, drivers, vehicles, notifications, activityTimeline, maintenanceRecords, fuelLogs, expenses, profile };
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(state, null, 2));
  fs.renameSync(temporaryFile, dataFile);
};

const loadState = () => {
  if (!fs.existsSync(dataFile)) {
    notifications = notifications.map(normalizeNotification);
    persistState();
    return;
  }

  try {
    const persisted = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    trips = Array.isArray(persisted.trips) ? persisted.trips : trips;
    drivers = Array.isArray(persisted.drivers) ? persisted.drivers : drivers;
    vehicles = Array.isArray(persisted.vehicles) ? persisted.vehicles : vehicles;
    notifications = (Array.isArray(persisted.notifications) ? persisted.notifications : notifications).map(normalizeNotification);
    activityTimeline = Array.isArray(persisted.activityTimeline) ? persisted.activityTimeline : activityTimeline;
    maintenanceRecords = Array.isArray(persisted.maintenanceRecords) ? persisted.maintenanceRecords : maintenanceRecords;
    fuelLogs = Array.isArray(persisted.fuelLogs) ? persisted.fuelLogs : fuelLogs;
    expenses = Array.isArray(persisted.expenses) ? persisted.expenses : expenses;
    profile = persisted.profile && typeof persisted.profile === 'object' ? persisted.profile : profile;
  } catch (error) {
    console.error('Unable to load persisted data; using seed data.', error);
    notifications = notifications.map(normalizeNotification);
    persistState();
  }
};

const addActivity = ({ type, title, desc, color = '#2563EB', bgColor = '#DBEAFE' }) => {
  activityTimeline = [{ id: createId('ACT'), type, title, desc, time: 'Just now', color, bgColor }, ...activityTimeline].slice(0, 100);
};

const addNotification = ({ title, description, category = 'system', priority = 'Medium', relatedVehicle, relatedDriver, relatedTrip, actionLabel }) => {
  notifications = [normalizeNotification({
    id: createId('NTF'),
    title,
    description,
    category,
    priority,
    status: 'unread',
    timestamp: 'Just now',
    relatedVehicle,
    relatedDriver,
    relatedTrip,
    actionLabel
  }), ...notifications].slice(0, 200);
};

const signToken = (payload) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', authSecret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
};

const verifyToken = (token) => {
  const [encodedPayload, signature] = String(token || '').split('.');
  if (!encodedPayload || !signature) return null;
  const expected = crypto.createHmac('sha256', authSecret).update(encodedPayload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
};

const requireAuth = (req, res, next) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const session = verifyToken(token);
  if (!session) return res.status(401).json({ success: false, message: 'Authentication is required.' });
  req.user = session;
  next();
};

loadState();

// --- API ROUTES ---

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString(), storage: 'json-file' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (email !== 'admin@transitops.com' || password !== 'password123') {
    return res.status(401).json({ success: false, message: 'Invalid corporate credentials.' });
  }

  const user = { id: profile.id, name: profile.name, email: profile.email, role: profile.role };
  const token = signToken({ sub: user.id, email: user.email, role: user.role, exp: Date.now() + 8 * 60 * 60 * 1000 });
  res.json({ success: true, token, user });
});

app.get('/api/auth/me', requireAuth, (_req, res) => {
  res.json({ success: true, user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role } });
});

app.use('/api/fleet', requireAuth);

app.get('/api/fleet/kpis', (_req, res) => {
  const activeTrips = trips.filter((trip) => trip.status === 'On Trip').length;
  const delayedTrips = trips.filter((trip) => trip.status === 'Delayed').length;
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status === 'Available').length;
  const maintenanceVehicles = vehicles.filter((vehicle) => vehicle.status === 'In Shop').length;
  const driversOnDuty = drivers.filter((driver) => driver.status === 'On Trip').length;
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === 'On Trip').length;
  const fleetUtilization = vehicles.length ? Math.round(((activeVehicles + maintenanceVehicles) / vehicles.length) * 100) : 0;

  res.json({
    activeVehicles,
    availableVehicles,
    inMaintenance: maintenanceVehicles,
    activeTrips,
    pendingTrips: delayedTrips,
    driversOnDuty,
    fleetUtilization
  });
});

app.get('/api/fleet/trips', (_req, res) => res.json(trips));

app.post('/api/fleet/trips', (req, res) => {
  const { vehicle, vehicleType, driver, route, cargo, eta, region, cargoWeight, distance, departureTime } = req.body || {};
  if (![vehicle, driver, route].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ success: false, message: 'Vehicle, driver, and route are required.' });
  }

  const registrationNumber = vehicleRegistration(vehicle);
  const selectedVehicle = registrationNumber && findVehicle(registrationNumber);
  const selectedDriver = findDriver(driver);
  if (!selectedVehicle) return res.status(400).json({ success: false, message: 'Select a vehicle registered in the fleet.' });
  if (!selectedDriver) return res.status(400).json({ success: false, message: 'Select a driver registered in the fleet.' });
  if (selectedVehicle.status !== 'Available') return res.status(409).json({ success: false, message: `${selectedVehicle.registrationNumber} is not available for dispatch.` });
  if (selectedDriver.status !== 'Available') return res.status(409).json({ success: false, message: `${selectedDriver.name} is not available for dispatch.` });

  const newTrip = {
    id: createId('TR'),
    vehicle: `${selectedVehicle.name} (#${selectedVehicle.registrationNumber})`,
    vehicleType: vehicleType || selectedVehicle.type,
    driver: selectedDriver.name,
    route: route.trim(),
    status: 'On Trip',
    cargo: cargo?.trim() || 'General Merchandise',
    eta: eta?.trim() || 'Pending ETA',
    health: selectedVehicle.health,
    region: region || selectedVehicle.region,
    cargoWeight: Number(cargoWeight) || 0,
    distance: Number(distance) || 0,
    departureTime: departureTime || null,
    createdAt: new Date().toISOString()
  };

  trips = [newTrip, ...trips];
  selectedVehicle.status = 'On Trip';
  selectedVehicle.assignedDriver = selectedDriver.name;
  selectedVehicle.tripsHistory.unshift({ id: newTrip.id, route: newTrip.route, date: today(), status: 'On Trip' });
  selectedVehicle.timeline.unshift({ date: today(), event: `Trip ${newTrip.id} dispatched` });
  selectedDriver.status = 'On Trip';
  selectedDriver.currentVehicle = newTrip.vehicle;
  selectedDriver.lastTrip = newTrip.route;
  selectedDriver.totalTrips += 1;
  selectedDriver.timeline.unshift({ date: today(), event: `Trip ${newTrip.id} dispatched` });
  addActivity({ type: 'trip_started', title: `Trip ${newTrip.id} dispatched`, desc: `${newTrip.vehicle} departed for ${newTrip.route}` });
  addNotification({ title: `Trip ${newTrip.id} dispatched`, description: `${selectedDriver.name} departed on ${newTrip.route}.`, category: 'trips', relatedVehicle: selectedVehicle.registrationNumber, relatedDriver: selectedDriver.name, relatedTrip: newTrip.id, actionLabel: 'View Trip' });
  persistState();
  res.status(201).json(newTrip);
});

app.put('/api/fleet/trips/:id', (req, res) => {
  const trip = trips.find((item) => item.id === req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  const allowed = ['route', 'cargo', 'eta', 'status', 'health', 'region', 'cargoWeight', 'distance', 'departureTime'];
  allowed.forEach((key) => {
    if (req.body?.[key] !== undefined) trip[key] = req.body[key];
  });
  persistState();
  res.json({ success: true, trip });
});

app.delete('/api/fleet/trips/:id', (req, res) => {
  const trip = trips.find((item) => item.id === req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  trips = trips.filter((item) => item.id !== trip.id);
  const registrationNumber = vehicleRegistration(trip.vehicle);
  const selectedVehicle = registrationNumber && findVehicle(registrationNumber);
  const selectedDriver = findDriver(trip.driver);
  if (selectedVehicle && !trips.some((item) => vehicleRegistration(item.vehicle) === registrationNumber && item.status === 'On Trip')) {
    selectedVehicle.status = 'Available';
    selectedVehicle.assignedDriver = 'N/A';
    selectedVehicle.timeline.unshift({ date: today(), event: `Trip ${trip.id} closed` });
  }
  if (selectedDriver && !trips.some((item) => item.driver === selectedDriver.name && item.status === 'On Trip')) {
    selectedDriver.status = 'Available';
    selectedDriver.currentVehicle = 'N/A';
    selectedDriver.timeline.unshift({ date: today(), event: `Trip ${trip.id} closed` });
  }
  addActivity({ type: 'trip_completed', title: `Trip ${trip.id} closed`, desc: `Dispatch entry for ${trip.vehicle} was removed.`, color: '#64748B', bgColor: '#F1F5F9' });
  persistState();
  res.json({ success: true, message: `Trip ${trip.id} removed.` });
});

app.get('/api/fleet/vehicles', (_req, res) => res.json(vehicles));

app.post('/api/fleet/vehicles', (req, res) => {
  const source = req.body || {};
  const registrationNumber = String(source.registrationNumber || vehicleRegistration(source.id) || '').trim().toUpperCase();
  const name = String(source.name || source.id || '').replace(/\s*\(#?[A-Z0-9-]+\)\s*$/i, '').trim();
  if (!registrationNumber || !name) return res.status(400).json({ success: false, message: 'Registration number and vehicle name are required.' });
  if (findVehicle(registrationNumber)) return res.status(409).json({ success: false, message: `Registration number ${registrationNumber} already exists.` });

  const newVehicle = {
    registrationNumber,
    name,
    type: source.type || 'Semi-Truck',
    capacity: Number(source.capacity) || 12000,
    odometer: Number(source.odometer) || 0,
    acquisitionCost: Number(source.acquisitionCost) || 50000,
    status: 'Available',
    lastMaintenance: today(),
    assignedDriver: 'N/A',
    health: 100,
    region: source.region || 'East Coast',
    purchaseDate: source.purchaseDate || today(),
    insuranceExpiry: source.insuranceExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    roadTax: source.roadTax || 'Compliant',
    documents: Array.isArray(source.documents) ? source.documents : ['Insurance', 'Registration'],
    specs: {
      engine: source.engine || source.specs?.engine || 'Cummins 300HP',
      fuelType: source.fuelType || source.specs?.fuelType || 'Diesel',
      mpg: Number(source.mpg || source.specs?.mpg) || 8.5,
      fuelCapacity: Number(source.fuelCapacity || source.specs?.fuelCapacity) || 80
    },
    tripsHistory: [],
    fuelConsumption: [],
    maintenanceHistory: [],
    timeline: [{ date: today(), event: 'Asset registered in fleet registry' }]
  };
  vehicles = [...vehicles, newVehicle];
  addActivity({ type: 'vehicle_registered', title: `Asset registered: ${registrationNumber}`, desc: `${name} added to the ${newVehicle.region} fleet.` });
  addNotification({ title: `Vehicle ${registrationNumber} registered`, description: `${name} is available for dispatch.`, category: 'vehicles', relatedVehicle: registrationNumber, actionLabel: 'View Vehicle' });
  persistState();
  res.status(201).json({ success: true, message: `Vehicle ${name} registered successfully.`, vehicle: newVehicle });
});

app.put('/api/fleet/vehicles/:registrationNumber', (req, res) => {
  const vehicle = findVehicle(req.params.registrationNumber.toUpperCase());
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  const source = req.body || {};
  const allowed = ['name', 'type', 'capacity', 'odometer', 'acquisitionCost', 'status', 'lastMaintenance', 'assignedDriver', 'health', 'region', 'purchaseDate', 'insuranceExpiry', 'roadTax', 'documents'];
  allowed.forEach((key) => {
    if (source[key] !== undefined) vehicle[key] = source[key];
  });
  if (source.engine || source.fuelType || source.mpg || source.fuelCapacity || source.specs) {
    vehicle.specs = { ...vehicle.specs, ...(source.specs || {}), ...(source.engine ? { engine: source.engine } : {}), ...(source.fuelType ? { fuelType: source.fuelType } : {}), ...(source.mpg ? { mpg: Number(source.mpg) } : {}), ...(source.fuelCapacity ? { fuelCapacity: Number(source.fuelCapacity) } : {}) };
  }
  vehicle.timeline.unshift({ date: today(), event: 'Vehicle information updated' });
  persistState();
  res.json({ success: true, vehicle });
});

app.delete('/api/fleet/vehicles/:registrationNumber', (req, res) => {
  const registrationNumber = req.params.registrationNumber.toUpperCase();
  const vehicle = findVehicle(registrationNumber);
  if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
  if (vehicle.status === 'On Trip') return res.status(409).json({ success: false, message: 'Close the active trip before removing this vehicle.' });
  vehicles = vehicles.filter((item) => item.registrationNumber !== registrationNumber);
  addActivity({ type: 'vehicle_removed', title: `Asset removed: ${registrationNumber}`, desc: `${vehicle.name} was removed from the fleet.` });
  persistState();
  res.json({ success: true, message: `Vehicle ${registrationNumber} de-registered.` });
});

app.get('/api/fleet/drivers', (_req, res) => res.json(drivers));

app.post('/api/fleet/drivers', (req, res) => {
  const source = req.body || {};
  const name = String(source.name || '').trim();
  const licenseNumber = String(source.licenseNumber || `PENDING-${createId('CDL')}`).toUpperCase();
  if (!name) return res.status(400).json({ success: false, message: 'Driver name is required.' });
  if (drivers.some((driver) => driver.licenseNumber === licenseNumber)) return res.status(409).json({ success: false, message: `License ${licenseNumber} already exists.` });
  const newDriver = {
    id: createId('DRV'), name, licenseNumber, licenseCategory: source.licenseCategory || 'CDL-A', contactNumber: source.contactNumber || '+1 (555) 010-0000',
    safetyScore: Number(source.safetyScore) || 100, status: 'Available', currentVehicle: 'N/A',
    licenseExpiry: source.licenseExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), daysToExpiry: Number(source.daysToExpiry) || 365,
    lastTrip: 'N/A', experience: Number(source.experience) || 1, totalTrips: 0, avgDistance: 0, avgFuelEfficiency: 7, emergencyContact: source.emergencyContact || 'N/A',
    region: source.region || 'East Coast', compliance: source.compliance || { license: 'Valid', medical: 'Valid', background: 'Cleared', training: 'Completed' }, incidents: 0,
    timeline: [{ date: today(), event: 'Driver profile created' }]
  };
  drivers = [...drivers, newDriver];
  addActivity({ type: 'driver_registered', title: `Driver enrolled: ${name}`, desc: `${name} added to the driver registry.` });
  persistState();
  res.status(201).json({ success: true, driver: newDriver });
});

app.put('/api/fleet/drivers/:id', (req, res) => {
  const driver = drivers.find((item) => item.id === req.params.id);
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
  const source = req.body || {};
  if (source.licenseNumber && drivers.some((item) => item.id !== driver.id && item.licenseNumber === String(source.licenseNumber).toUpperCase())) return res.status(409).json({ success: false, message: 'License number already exists.' });
  const allowed = ['name', 'licenseNumber', 'licenseCategory', 'contactNumber', 'safetyScore', 'status', 'currentVehicle', 'licenseExpiry', 'daysToExpiry', 'lastTrip', 'experience', 'totalTrips', 'avgDistance', 'avgFuelEfficiency', 'emergencyContact', 'region', 'compliance', 'incidents'];
  allowed.forEach((key) => {
    if (source[key] !== undefined) driver[key] = key === 'licenseNumber' ? String(source[key]).toUpperCase() : source[key];
  });
  driver.timeline.unshift({ date: today(), event: 'Driver profile updated' });
  persistState();
  res.json({ success: true, driver });
});

app.delete('/api/fleet/drivers/:id', (req, res) => {
  const driver = drivers.find((item) => item.id === req.params.id);
  if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
  if (driver.status === 'On Trip') return res.status(409).json({ success: false, message: 'Close the active trip before removing this driver.' });
  drivers = drivers.filter((item) => item.id !== driver.id);
  addActivity({ type: 'driver_removed', title: `Driver archived: ${driver.name}`, desc: `${driver.name} was removed from the active registry.` });
  persistState();
  res.json({ success: true, message: `Driver ${driver.id} removed.` });
});

app.get('/api/fleet/maintenance', (_req, res) => res.json(maintenanceRecords));

app.post('/api/fleet/maintenance', (req, res) => {
  const source = req.body || {};
  const registrationNumber = String(source.registrationNumber || '').toUpperCase();
  const vehicle = findVehicle(registrationNumber);
  if (!vehicle || !source.workshop || !source.mechanic || !source.type) return res.status(400).json({ success: false, message: 'Vehicle, maintenance type, workshop, and mechanic are required.' });
  const record = { id: createId('MA'), vehicle: `${vehicle.name} (#${registrationNumber})`, registrationNumber, type: source.type, workshop: source.workshop, mechanic: source.mechanic, scheduledDate: source.scheduledDate || today(), estimatedCost: Number(source.estimatedCost) || 0, status: source.status || 'Scheduled', priority: source.priority || 'Medium', notes: source.notes || '', partsUsed: source.partsUsed || [] };
  maintenanceRecords = [record, ...maintenanceRecords];
  vehicle.status = record.status === 'Completed' ? 'Available' : 'In Shop';
  vehicle.lastMaintenance = record.scheduledDate;
  vehicle.timeline.unshift({ date: today(), event: `Maintenance ${record.id} scheduled` });
  addActivity({ type: 'maintenance_created', title: `Maintenance scheduled: ${registrationNumber}`, desc: `${record.type} at ${record.workshop}.`, color: '#EF4444', bgColor: '#FEE2E2' });
  addNotification({ title: `Maintenance scheduled for ${registrationNumber}`, description: `${record.type} is scheduled with ${record.mechanic}.`, category: 'maintenance', priority: record.priority === 'High' ? 'High' : 'Medium', relatedVehicle: registrationNumber, actionLabel: 'View Maintenance' });
  persistState();
  res.status(201).json({ success: true, record });
});

app.put('/api/fleet/maintenance/:id', (req, res) => {
  const record = maintenanceRecords.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
  const source = req.body || {};
  ['type', 'workshop', 'mechanic', 'scheduledDate', 'estimatedCost', 'status', 'priority', 'notes', 'partsUsed'].forEach((key) => { if (source[key] !== undefined) record[key] = source[key]; });
  const vehicle = findVehicle(record.registrationNumber);
  if (vehicle && source.status) {
    vehicle.status = source.status === 'Completed' || source.status === 'Cancelled' ? 'Available' : 'In Shop';
    vehicle.lastMaintenance = today();
    vehicle.maintenanceHistory.unshift({ date: today(), issue: record.type, cost: Number(record.estimatedCost), shop: record.workshop });
    vehicle.timeline.unshift({ date: today(), event: `Maintenance ${record.id} marked ${record.status}` });
  }
  if (source.status === 'Completed') {
    addActivity({ type: 'maintenance_completed', title: `Maintenance completed: ${record.registrationNumber}`, desc: `${record.type} completed at ${record.workshop}.`, color: '#22C55E', bgColor: '#DCFCE7' });
    addNotification({ title: `Maintenance completed for ${record.registrationNumber}`, description: `${record.type} has been completed and the asset is available.`, category: 'maintenance', relatedVehicle: record.registrationNumber, actionLabel: 'View Vehicle' });
  }
  persistState();
  res.json({ success: true, record });
});

app.delete('/api/fleet/maintenance/:id', (req, res) => {
  const record = maintenanceRecords.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Maintenance record not found.' });
  maintenanceRecords = maintenanceRecords.filter((item) => item.id !== record.id);
  persistState();
  res.json({ success: true });
});

app.get('/api/fleet/fuel-logs', (_req, res) => res.json(fuelLogs));

app.post('/api/fleet/fuel-logs', (req, res) => {
  const source = req.body || {};
  const registrationNumber = String(source.registrationNumber || source.vehicle || '').toUpperCase();
  const vehicle = findVehicle(registrationNumber);
  const quantity = Number(source.quantity);
  const pricePerLiter = Number(source.pricePerLiter);
  if (!vehicle || !source.station || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(pricePerLiter) || pricePerLiter <= 0) return res.status(400).json({ success: false, message: 'Valid vehicle, station, quantity, and price are required.' });
  const record = { id: createId('FL'), vehicle: vehicle.name, registrationNumber, driver: source.driver || vehicle.assignedDriver || 'N/A', tripId: source.tripId || '', station: source.station, fuelType: source.fuelType || vehicle.specs.fuelType || 'Diesel', quantity, pricePerLiter, totalCost: Number((quantity * pricePerLiter).toFixed(2)), odometer: Number(source.odometer) || vehicle.odometer, date: source.date || today(), notes: source.notes || '' };
  fuelLogs = [record, ...fuelLogs];
  vehicle.odometer = Math.max(vehicle.odometer, record.odometer);
  vehicle.fuelConsumption.unshift({ date: record.date, gallons: record.quantity, cost: record.totalCost });
  vehicle.timeline.unshift({ date: today(), event: `Fuel log ${record.id} recorded` });
  addActivity({ type: 'fuel_logged', title: `Fuel logged: ${registrationNumber}`, desc: `${record.quantity} units recorded at ${record.station}.` });
  persistState();
  res.status(201).json({ success: true, record });
});

app.delete('/api/fleet/fuel-logs/:id', (req, res) => {
  const record = fuelLogs.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Fuel log not found.' });
  fuelLogs = fuelLogs.filter((item) => item.id !== record.id);
  persistState();
  res.json({ success: true });
});

app.get('/api/fleet/expenses', (_req, res) => res.json(expenses));

app.post('/api/fleet/expenses', (req, res) => {
  const source = req.body || {};
  const amount = Number(source.amount);
  if (!source.vehicle || !source.category || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'Vehicle, category, and a positive amount are required.' });
  const record = { id: createId('EX'), vehicle: source.vehicle, tripId: source.tripId || '', category: source.category, amount, date: source.date || today(), recordedBy: source.recordedBy || profile.name, status: source.status || 'Pending', notes: source.notes || '' };
  expenses = [record, ...expenses];
  addNotification({ title: 'Expense approval pending', description: `${record.category} expense of $${record.amount.toFixed(2)} needs review.`, category: 'expenses', priority: 'High', relatedVehicle: record.vehicle, actionLabel: 'Review Expense' });
  persistState();
  res.status(201).json({ success: true, record });
});

app.put('/api/fleet/expenses/:id', (req, res) => {
  const record = expenses.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Expense not found.' });
  ['vehicle', 'tripId', 'category', 'amount', 'date', 'recordedBy', 'status', 'notes'].forEach((key) => { if (req.body?.[key] !== undefined) record[key] = req.body[key]; });
  persistState();
  res.json({ success: true, record });
});

app.delete('/api/fleet/expenses/:id', (req, res) => {
  const record = expenses.find((item) => item.id === req.params.id);
  if (!record) return res.status(404).json({ success: false, message: 'Expense not found.' });
  expenses = expenses.filter((item) => item.id !== record.id);
  persistState();
  res.json({ success: true });
});

app.get('/api/fleet/notifications', (req, res) => {
  const requestedStatus = req.query.status;
  const includeAll = req.query.all === 'true';
  const result = notifications.filter((notification) => includeAll || requestedStatus ? notification.status === requestedStatus || (includeAll && true) : notification.status === 'unread');
  res.json(result);
});

app.put('/api/fleet/notifications/read-all', (_req, res) => {
  notifications = notifications.map((notification) => notification.status === 'unread' ? { ...notification, status: 'read' } : notification);
  persistState();
  res.json({ success: true });
});

app.put('/api/fleet/notifications/:id', (req, res) => {
  const notification = notifications.find((item) => item.id === req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
  const status = req.body?.status;
  if (!['unread', 'read', 'archived'].includes(status)) return res.status(400).json({ success: false, message: 'A valid notification status is required.' });
  notification.status = status;
  persistState();
  res.json({ success: true, notification });
});

app.delete('/api/fleet/notifications/:id', (req, res) => {
  const exists = notifications.some((item) => item.id === req.params.id);
  if (!exists) return res.status(404).json({ success: false, message: 'Notification not found.' });
  notifications = notifications.filter((item) => item.id !== req.params.id);
  persistState();
  res.json({ success: true });
});

app.delete('/api/fleet/notifications', (req, res) => {
  notifications = req.query.status === 'unread' ? notifications.filter((notification) => notification.status !== 'unread') : [];
  persistState();
  res.json({ success: true });
});

app.get('/api/fleet/activity', (_req, res) => res.json(activityTimeline));

app.get('/api/fleet/profile', (_req, res) => res.json(profile));

app.put('/api/fleet/profile', (req, res) => {
  const source = req.body || {};
  profile = { ...profile, ...source, id: profile.id, email: source.email || profile.email };
  persistState();
  res.json({ success: true, profile });
});

app.get('/api/fleet/health', (_req, res) => {
  const averageFuelEfficiency = vehicles.length ? Number((vehicles.reduce((total, vehicle) => total + Number(vehicle.specs?.mpg || 0), 0) / vehicles.length).toFixed(1)) : 0;
  const maintenanceInProgress = maintenanceRecords.filter((record) => record.status === 'In Progress' || record.status === 'Scheduled').length;
  const highCostAssets = vehicles.map((vehicle) => ({ registrationNumber: vehicle.registrationNumber, name: vehicle.name, cost: [...fuelLogs.filter((record) => record.registrationNumber === vehicle.registrationNumber).map((record) => record.totalCost), ...maintenanceRecords.filter((record) => record.registrationNumber === vehicle.registrationNumber).map((record) => Number(record.estimatedCost))].reduce((total, value) => total + value, 0) })).sort((left, right) => right.cost - left.cost).slice(0, 2);
  res.json({ maintenanceInProgress, maintenanceTotal: maintenanceRecords.length, averageFuelEfficiency, upcomingLicenses: drivers.filter((driver) => driver.daysToExpiry <= 30).map((driver) => ({ name: driver.name, daysToExpiry: driver.daysToExpiry, licenseCategory: driver.licenseCategory })), highCostAssets });
});

app.get('/api/fleet/reports/summary', (_req, res) => {
  const totalFuelCost = fuelLogs.reduce((total, record) => total + record.totalCost, 0);
  const totalExpenses = expenses.reduce((total, record) => total + record.amount, 0);
  const totalMaintenanceCost = maintenanceRecords.reduce((total, record) => total + Number(record.estimatedCost), 0);
  res.json({
    vehicles: vehicles.length,
    drivers: drivers.length,
    trips: trips.length,
    activeTrips: trips.filter((trip) => trip.status === 'On Trip').length,
    vehicleStatus: vehicles.reduce((result, vehicle) => ({ ...result, [vehicle.status]: (result[vehicle.status] || 0) + 1 }), {}),
    tripStatus: trips.reduce((result, trip) => ({ ...result, [trip.status]: (result[trip.status] || 0) + 1 }), {}),
    totalFuelCost: Number(totalFuelCost.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    totalMaintenanceCost: Number(totalMaintenanceCost.toFixed(2)),
    operationalCost: Number((totalFuelCost + totalExpenses + totalMaintenanceCost).toFixed(2)),
    totalFuelQuantity: fuelLogs.reduce((total, record) => total + record.quantity, 0)
  });
});

// 1. Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@transitops.com' && password === 'password123') {
    return res.status(200).json({
      success: true,
      token: 'mock-jwt-token-signature-payload-transitops',
      user: {
        name: 'Piyush Sharma',
        role: 'Fleet Manager'
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid corporate credentials'
    });
  }
});

// 2. Telemetry KPIs
app.get('/api/fleet/kpis', (req, res) => {
  const activeCount = trips.filter(r => r.status === 'On Trip' || r.status === 'Delayed').length;
  const availableCount = trips.filter(r => r.status === 'Available').length;
  const maintenanceCount = trips.filter(r => r.status === 'Maintenance' || r.status === 'In Shop').length;
  const activeTripsCount = trips.filter(r => r.status === 'On Trip').length;

  res.status(200).json({
    activeVehicles: activeCount * 24 + 49,
    availableVehicles: availableCount * 20 + 58,
    inMaintenance: maintenanceCount * 3 + 11,
    activeTrips: activeTripsCount * 10 + 22,
    pendingTrips: 13,
    driversOnDuty: activeCount * 12 + 29,
    fleetUtilization: 84
  });
});

// 3. Trips Management
app.get('/api/fleet/trips', (req, res) => {
  res.status(200).json(trips);
});

app.post('/api/fleet/trips', (req, res) => {
  const { vehicle, vehicleType, driver, route, cargo, eta, region } = req.body;

  const newTrip = {
    id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
    vehicle,
    vehicleType,
    driver,
    route,
    status: 'On Trip',
    cargo: cargo || 'General Merchandise',
    eta: eta || '3.5 Hours',
    health: 100,
    region
  };

  trips = [newTrip, ...trips];

  // Update in-memory vehicle status
  const matchedReg = vehicle.match(/#([A-Z0-9-]+)/);
  if (matchedReg && matchedReg[1]) {
    const reg = matchedReg[1];
    const vehIndex = vehicles.findIndex(v => v.registrationNumber === reg);
    if (vehIndex !== -1) {
      vehicles[vehIndex].status = 'On Trip';
      vehicles[vehIndex].assignedDriver = driver;
      vehicles[vehIndex].tripsHistory.unshift({
        id: newTrip.id,
        route,
        date: new Date().toISOString().split('T')[0],
        status: 'On Trip'
      });
      vehicles[vehIndex].timeline.unshift({
        date: new Date().toISOString().split('T')[0],
        event: `Trip ${newTrip.id} dispatched by coordinator`
      });
    }
  }

  // Update driver status in-memory
  const drvIndex = drivers.findIndex(d => d.name === driver);
  if (drvIndex !== -1) {
    drivers[drvIndex].status = 'On Trip';
    drivers[drvIndex].currentVehicle = vehicle;
    drivers[drvIndex].lastTrip = route;
    drivers[drvIndex].totalTrips += 1;
    drivers[drvIndex].timeline.unshift({
      date: new Date().toISOString().split('T')[0],
      event: `Trip ${newTrip.id} dispatched. Route: ${route}`
    });
  }

  // Append to Activity timeline
  activityTimeline = [
    {
      id: `act-${Date.now()}`,
      type: 'trip_started',
      title: `Trip ${newTrip.id} Dispatched`,
      desc: `Asset ${newTrip.vehicle} left for ${newTrip.route}`,
      time: 'Just now',
      color: '#2563EB',
      bgColor: '#DBEAFE'
    },
    ...activityTimeline
  ];

  res.status(201).json(newTrip);
});

app.delete('/api/fleet/trips/:id', (req, res) => {
  const { id } = req.params;
  const trip = trips.find(t => t.id === id);

  if (trip) {
    trips = trips.filter(t => t.id !== id);

    // Free the driver
    const drvIndex = drivers.findIndex(d => d.name === trip.driver);
    if (drvIndex !== -1) {
      drivers[drvIndex].status = 'Available';
      drivers[drvIndex].currentVehicle = 'N/A';
      drivers[drvIndex].timeline.unshift({
        date: new Date().toISOString().split('T')[0],
        event: `Trip ${id} closed. Driver returned to terminal.`
      });
    }

    activityTimeline = [
      {
        id: `act-${Date.now()}`,
        type: 'trip_completed',
        title: `Trip ${id} Terminated`,
        desc: `Asset ${trip.vehicle} dispatch removed by manager`,
        time: 'Just now',
        color: '#64748B',
        bgColor: '#F1F5F9'
      },
      ...activityTimeline
    ];

    res.status(200).json({ success: true, message: `Trip ${id} removed` });
  } else {
    res.status(404).json({ success: false, message: 'Trip not found' });
  }
});

// 4. Detailed Vehicles Registry
app.get('/api/fleet/vehicles', (req, res) => {
  res.status(200).json(vehicles);
});

app.post('/api/fleet/vehicles', (req, res) => {
  const { registrationNumber, name, type, capacity, odometer, acquisitionCost, region, engine, fuelType, mpg, fuelCapacity } = req.body;

  // Validate unique registration number
  const exists = vehicles.some(v => v.registrationNumber.toUpperCase() === registrationNumber.toUpperCase());
  if (exists) {
    return res.status(400).json({
      success: false,
      message: `Registration number ${registrationNumber} already exists in registry.`
    });
  }

  const newVehicle = {
    registrationNumber: registrationNumber.toUpperCase(),
    name,
    type,
    capacity: Number(capacity) || 12000,
    odometer: Number(odometer) || 0,
    acquisitionCost: Number(acquisitionCost) || 50000,
    status: 'Available',
    lastMaintenance: new Date().toISOString().split('T')[0],
    assignedDriver: 'N/A',
    health: 100,
    region: region || 'East Coast',
    purchaseDate: new Date().toISOString().split('T')[0],
    insuranceExpiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    roadTax: 'Compliant',
    documents: ['Insurance', 'Registration'],
    specs: {
      engine: engine || 'Default Cummins 300HP',
      fuelType: fuelType || 'Diesel',
      mpg: Number(mpg) || 8.5,
      fuelCapacity: Number(fuelCapacity) || 80
    },
    tripsHistory: [],
    fuelConsumption: [],
    maintenanceHistory: [],
    timeline: [
      { date: new Date().toISOString().split('T')[0], event: 'Asset registered in database' }
    ]
  };

  vehicles = [...vehicles, newVehicle];

  activityTimeline = [
    {
      id: `act-${Date.now()}`,
      type: 'vehicle_registered',
      title: `Asset Registered: ${newVehicle.registrationNumber}`,
      desc: `${newVehicle.name} added to ${newVehicle.region} fleet registry`,
      time: 'Just now',
      color: '#2563EB',
      bgColor: '#DBEAFE'
    },
    ...activityTimeline
  ];

  res.status(201).json({
    success: true,
    message: `Vehicle ${newVehicle.name} (#${newVehicle.registrationNumber}) registered successfully.`,
    vehicle: newVehicle
  });
});

app.delete('/api/fleet/vehicles/:id', (req, res) => {
  const { id } = req.params;
  const exists = vehicles.some(v => v.registrationNumber === id);

  if (exists) {
    vehicles = vehicles.filter(v => v.registrationNumber !== id);
    res.status(200).json({ success: true, message: `Vehicle ${id} de-registered` });
  } else {
    res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
});

// 5. Drivers Management
app.get('/api/fleet/drivers', (req, res) => {
  res.status(200).json(drivers);
});

app.post('/api/fleet/drivers', (req, res) => {
  const { name, licenseNumber, licenseCategory, contactNumber, region, experience, safetyScore } = req.body;

  if (!name || !licenseNumber) {
    return res.status(400).json({ success: false, message: 'Driver name and license number required' });
  }

  const exists = drivers.some(d => d.licenseNumber.toUpperCase() === licenseNumber.toUpperCase());
  if (exists) {
    return res.status(400).json({ success: false, message: `License Number ${licenseNumber} already exists in safety registry.` });
  }

  const newDriver = {
    id: `DRV-${Math.floor(107 + Math.random() * 900)}`,
    name,
    licenseNumber: licenseNumber.toUpperCase(),
    licenseCategory: licenseCategory || 'CDL-A',
    contactNumber: contactNumber || '+1 (555) 010-0000',
    safetyScore: Number(safetyScore) || 100,
    status: 'Available',
    currentVehicle: 'N/A',
    licenseExpiry: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    daysToExpiry: 365,
    lastTrip: 'N/A',
    experience: Number(experience) || 1,
    totalTrips: 0,
    avgDistance: 0,
    avgFuelEfficiency: 7.0,
    emergencyContact: 'N/A',
    region: region || 'East Coast',
    compliance: {
      license: 'Valid',
      medical: 'Valid',
      background: 'Cleared',
      training: 'Completed'
    },
    incidents: 0,
    timeline: [
      { date: new Date().toISOString().split('T')[0], event: 'Safety dossier initialized in system' }
    ]
  };

  drivers = [...drivers, newDriver];

  activityTimeline = [
    {
      id: `act-${Date.now()}`,
      type: 'driver_registered',
      title: `Driver Enrolled: ${newDriver.name}`,
      desc: `${newDriver.name} added to safety registry`,
      time: 'Just now',
      color: '#2563EB',
      bgColor: '#DBEAFE'
    },
    ...activityTimeline
  ];

  res.status(201).json({ success: true, driver: newDriver });
});

app.delete('/api/fleet/drivers/:id', (req, res) => {
  const { id } = req.params;
  const exists = drivers.some(d => d.id === id);

  if (exists) {
    drivers = drivers.filter(d => d.id !== id);
    res.status(200).json({ success: true, message: `Driver ${id} removed` });
  } else {
    res.status(404).json({ success: false, message: 'Driver not found' });
  }
});

// 6. Notifications
app.get('/api/fleet/notifications', (req, res) => {
  res.status(200).json(notifications);
});

app.delete('/api/fleet/notifications/:id', (req, res) => {
  const { id } = req.params;
  notifications = notifications.filter(n => n.id !== id);
  res.status(200).json({ success: true });
});

app.delete('/api/fleet/notifications', (req, res) => {
  notifications = [];
  res.status(200).json({ success: true });
});

// 7. Timeline logs
app.get('/api/fleet/activity', (req, res) => {
  res.status(200).json(activityTimeline);
});

app.listen(port, () => {
  console.log(`TransitOps Backend listening at http://localhost:${port}`);
});
