import { connectToBroker } from './lib/mqtt.js';
import dotenv from 'dotenv';
dotenv.config();

const setParkingSpots = (spots) => {
  console.log('Test: Parking spots updated:', spots);
};

const disconnect = connectToBroker('parking/update', setParkingSpots);

process.on('SIGINT', () => {
  disconnect();
  console.log('Disconnected from MQTT broker.');
  process.exit();
});
