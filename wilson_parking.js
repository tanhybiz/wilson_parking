// app.js
const ParkingManager = require('./parkingManager.js');

// Add or update locations
let locationName = 'Marina Square';
ParkingManager.addLocation(locationName, 300);
ParkingManager.updateLocation(locationName, 15, 5);

// Get info
console.log(ParkingManager.getLocation(locationName));
console.log(`Available at ${locationName}: ${ParkingManager.getAvailableLots(locationName)} lots`);
