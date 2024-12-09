import mqtt from 'mqtt';

export function handleMessage(message) {
  try {
    console.log('Raw message content:', message);

    // Replace all single quotes with double quotes
    const jsonString = message.replace(/'/g, '"');

    console.log('Reconstructed JSON string:', jsonString);

    // Parse the reconstructed JSON string
    const jsonObject = JSON.parse(jsonString);

    console.log('Parsed object:', jsonObject);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}api/streetsdata`;
    const apiUrlData = `${process.env.NEXT_PUBLIC_API_URL}api/parkdataaus`;
    console.log('API URL (streetsdata):', apiUrl);
    console.log('API URL (parkdataaus):', apiUrlData);

    // Send data to the streetsdata API endpoint
    fetch(apiUrl, {
      method: 'PUT', // Using PUT to update data
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

    // Send data to the parkdataaus API endpoint
    fetch(apiUrlData, {
      method: 'POST', // Using POST to create data
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        streetName: jsonObject.streetName,
        betweenStreets: jsonObject.betweenStreets,
        deviceId: jsonObject.deviceId,
        vehiclePresent: jsonObject.vehiclePresent,
        timestamp: jsonObject.timestamp, // Include the timestamp
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

export function connectToBroker(topic) {
  const user = process.env.MQTT_USER;
  const password = process.env.MQTT_PASS;
  const mqttip = process.env.MQTT_IP;

  console.log('Connecting to MQTT broker...');
  console.log('MQTT URI:', mqttip);
  console.log('Username:', user);

  const client = mqtt.connect(mqttip, {
    username: user,
    password: password,
  });

  client.on('connect', () => {
    console.log('Connected to MQTT broker');
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
    console.log('Raw message content:', message.toString());

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
