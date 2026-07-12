import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
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

// --- API ROUTES ---

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
