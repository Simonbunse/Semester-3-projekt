//mqtt.js
const mqtt = require('mqtt');

function handleMessage(message) {
  try {

    const jsonString = message.replace(/'/g, '"');

    const jsonObject = JSON.parse(jsonString);

    const apiUrl = `${process.env.API_URL}api/streetsdata`;
    const apiUrlData = `${process.env.API_URL}api/parkdataaus`;

    fetch(apiUrl, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        streetName: jsonObject.streetName,
        betweenStreets: jsonObject.betweenStreets,
        deviceId: jsonObject.deviceId,
        vehiclePresent: jsonObject.vehiclePresent,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Data sent to streetsdata API successfully:', data);
      })
      .catch(error => {
        console.error('Error sending data to streetsdata API:', error);
      });

    fetch(apiUrlData, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        streetName: jsonObject.streetName,
        betweenStreets: jsonObject.betweenStreets,
        deviceId: jsonObject.deviceId,
        vehiclePresent: jsonObject.vehiclePresent,
        timestamp: jsonObject.timestamp,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Data sent to parkdataaus API successfully:', data);
      })
      .catch(error => {
        console.error('Error sending data to parkdataaus API:', error);
      });
  } catch (e) {
    console.error('Error parsing MQTT message:', e);
  }
}

function connectToBroker(topic, setParkingSpots) {
  const user = process.env.MQTT_USER;
  const password = process.env.MQTT_PASS;
  const mqttip = process.env.MQTT_IP;

  const client = mqtt.connect(mqttip, {
    username: user,
    password: password,
  });

  client.on('connect', () => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error('Subscription error:', err);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  });

  client.on('error', (err) => {
    console.error('Connection error:', err);
  });

  client.on('message', (receivedTopic, message) => {
    console.log(`Message received on topic: ${receivedTopic}`);

    if (receivedTopic === topic) {
      handleMessage(message.toString());
    } else {
      console.log(`Ignored message from topic: ${receivedTopic}`);
    }
  });

  return function disconnect() {
    console.log('Disconnecting from MQTT broker...');
    client.end();
  };
}

module.exports = { connectToBroker };
