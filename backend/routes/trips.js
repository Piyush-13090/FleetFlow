import { Router } from 'express';
import { db, today, createId, vehicleRegistration, findVehicle, findDriver, addActivity, addNotification, persistState } from '../services/db.js';

const router = Router();

// GET /api/fleet/trips
router.get('/', (_req, res) => res.json(db.trips));

// POST /api/fleet/trips
router.post('/', (req, res) => {
  const { vehicle, vehicleType, driver, route, cargo, eta, region, cargoWeight, distance, departureTime } = req.body || {};
  if (![vehicle, driver, route].every((v) => typeof v === 'string' && v.trim())) {
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
    createdAt: new Date().toISOString(),
  };

  db.trips = [newTrip, ...db.trips];
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

// PUT /api/fleet/trips/:id
router.put('/:id', (req, res) => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  const allowed = ['route', 'cargo', 'eta', 'status', 'health', 'region', 'cargoWeight', 'distance', 'departureTime'];
  allowed.forEach((key) => { if (req.body?.[key] !== undefined) trip[key] = req.body[key]; });
  persistState();
  res.json({ success: true, trip });
});

// DELETE /api/fleet/trips/:id
router.delete('/:id', (req, res) => {
  const trip = db.trips.find((t) => t.id === req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found.' });
  db.trips = db.trips.filter((t) => t.id !== trip.id);

  const registrationNumber = vehicleRegistration(trip.vehicle);
  const selectedVehicle = registrationNumber && findVehicle(registrationNumber);
  const selectedDriver = findDriver(trip.driver);

  if (selectedVehicle && !db.trips.some((t) => vehicleRegistration(t.vehicle) === registrationNumber && t.status === 'On Trip')) {
    selectedVehicle.status = 'Available';
    selectedVehicle.assignedDriver = 'N/A';
    selectedVehicle.timeline.unshift({ date: today(), event: `Trip ${trip.id} closed` });
  }
  if (selectedDriver && !db.trips.some((t) => t.driver === selectedDriver.name && t.status === 'On Trip')) {
    selectedDriver.status = 'Available';
    selectedDriver.currentVehicle = 'N/A';
    selectedDriver.timeline.unshift({ date: today(), event: `Trip ${trip.id} closed` });
  }

  addActivity({ type: 'trip_completed', title: `Trip ${trip.id} closed`, desc: `Dispatch entry for ${trip.vehicle} was removed.`, color: '#64748B', bgColor: '#F1F5F9' });
  persistState();
  res.json({ success: true, message: `Trip ${trip.id} removed.` });
});

export default router;
