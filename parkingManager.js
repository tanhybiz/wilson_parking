// parkingManager.js

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'parkingData.json');

const ParkingManager = {
  parkingLocations: {},

  addLocation(locationId, totalParkingLots) {
    if (this.parkingLocations[locationId]) {
      throw new Error(`Location with ID "${locationId}" already exists.`);
    }

    this.parkingLocations[locationId] = {
      locationId,
      totalParkingLots,
      estimatedParkedCars: 0,
      dateTimeOfEstimate: new Date().toISOString(),
      carsInSinceLastEstimate: 0,
      carsOutSinceLastEstimate: 0
    };

    this.saveData();
  },

  updateLocation(locationId, carsIn = 0, carsOut = 0) {
    const location = this.parkingLocations[locationId];

    if (!location) {
      throw new Error(`Location with ID "${locationId}" not found.`);
    }

    location.estimatedParkedCars += carsIn - carsOut;
    location.estimatedParkedCars = Math.max(0, Math.min(location.estimatedParkedCars, location.totalParkingLots));

    location.carsInSinceLastEstimate = carsIn;
    location.carsOutSinceLastEstimate = carsOut;
    location.dateTimeOfEstimate = new Date().toISOString();

    this.saveData();
  },

  getLocation(locationId) {
    return this.parkingLocations[locationId] || null;
  },

  getAvailableLots(locationId) {
    const location = this.parkingLocations[locationId];
    if (!location) return null;
    return location.totalParkingLots - location.estimatedParkedCars;
  },

  saveData() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.parkingLocations, null, 2));
      console.log('Data saved successfully.');
    } catch (err) {
      console.error('Error saving data:', err);
    }
  },

  loadData() {
    if (fs.existsSync(DATA_FILE)) {
      try {
        const rawData = fs.readFileSync(DATA_FILE);
        this.parkingLocations = JSON.parse(rawData);
        console.log('Data loaded successfully.');
      } catch (err) {
        console.error('Error loading data:', err);
        this.parkingLocations = {}; // fallback
      }
    } else {
      this.parkingLocations = {}; // start empty
    }
  }
};

// Load data when the app starts
ParkingManager.loadData();

// 🛡️ Handle errors gracefully (but DO NOT exit)
const gracefulErrorHandler = (err) => {
  console.error('⚠️  Unexpected Error:', err);
  ParkingManager.saveData();
  // No process.exit() here! App keeps running.
};

const gracefulRejectionHandler = (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, 'Reason:', reason);
  ParkingManager.saveData();
  // No process.exit() here! App keeps running.
};

// Listen for unexpected errors but don't crash
process.on('uncaughtException', gracefulErrorHandler);
process.on('unhandledRejection', gracefulRejectionHandler);

// Optional: still handle Ctrl+C nicely
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Saving data...');
  ParkingManager.saveData();
  process.exit(0); // Only exit when user *wants* (Ctrl+C)
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Saving data...');
  ParkingManager.saveData();
  process.exit(0); // Server/OS shutdown
});

module.exports = ParkingManager;
