// mqtt-server.js

const { connectToBroker } = require('./mqtt');
require('dotenv').config();


const setParkingSpots = (spots) => {
  console.log('Test: Parking spots updated:', spots);
};

const disconnect = connectToBroker('parking/update', setParkingSpots);

process.on('SIGINT', () => {
  disconnect();
  console.log('Disconnected from MQTT broker.');
  process.exit();
});
