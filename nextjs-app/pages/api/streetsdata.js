import { mongooseConnect } from "@/lib/mongoose";
import { StreetsData } from "@/models/StreetsData";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === 'POST') {
    const { streetName, betweenStreets, devices } = req.body;

    if (!streetName || !betweenStreets || !devices) {
      return res.status(400).json({ error: 'Missing required fields: streetName, betweenStreets, or devices' });
    }

    try {
      const streetsDataDoc = await StreetsData.create({
        streetName,
        betweenStreets,
        devices,
        lastUpdated: new Date(),
      });

      res.status(200).json(streetsDataDoc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create streets data' });
    }
    return;
  }

if (method === 'GET') {
  try {
    const { streetName } = req.query;

    // Build the query object
    const query = streetName ? { streetName: streetName.toUpperCase() } : {};

    // Fetch filtered data
    const streetsData = await StreetsData.find(query);

    res.status(200).json(streetsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch streets data' });
  }
  return;
}


  if (method === "PUT") {
    const { streetName, betweenStreets, deviceId, vehiclePresent, addNewDevice } = req.body;

    if (!streetName || !betweenStreets || !deviceId) {
      return res.status(400).json({ error: "Missing required fields: streetName, betweenStreets, or deviceId" });
    }

    try {
      const document = await StreetsData.findOne({ streetName, betweenStreets });

      if (!document) {
        return res.status(404).json({ error: "Document not found for the specified streetName and betweenStreets" });
      }

      if (addNewDevice) {
        // Check if the deviceId already exists
        const deviceExists = document.devices.some((device) => device.deviceId === deviceId);
        if (deviceExists) {
          return res.status(400).json({ error: "Device ID already exists in the document" });
        }

        // Add a new device with vehiclePresent set to false
        document.devices.push({ deviceId, vehiclePresent: false });
        await document.save();

        return res.status(200).json({ message: "New device added successfully", updatedDocument: document });
      } else {
        // Update the vehiclePresent status for the given deviceId
        const device = document.devices.find((device) => device.deviceId === deviceId);

        if (!device) {
          return res.status(404).json({ error: "Device ID not found in the document" });
        }

        device.vehiclePresent = vehiclePresent;
        await document.save();

        return res.status(200).json({ message: "Device updated successfully", updatedDocument: document });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to process the request" });
    }
  }

  if (method === "DELETE") {
    const { streetName, betweenStreets, deviceId } = req.body;
  
    if (!streetName || !betweenStreets || !deviceId) {
      return res.status(400).json({ error: "Missing required fields: streetName, betweenStreets, or deviceId" });
    }
  
    try {
      const document = await StreetsData.findOne({ streetName, betweenStreets });
  
      if (!document) {
        return res.status(404).json({ error: "Document not found for the specified streetName and betweenStreets" });
      }
  
      const deviceIndex = document.devices.findIndex((device) => device.deviceId === deviceId);
  
      if (deviceIndex === -1) {
        return res.status(404).json({ error: "Device ID not found in the document" });
      }
  
      // Remove the device from the devices array
      document.devices.splice(deviceIndex, 1);
      await document.save();
  
      return res.status(200).json({ message: "Device deleted successfully", updatedDocument: document });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to delete the device" });
    }
  }

  res.status(405).json({ error: `Method ${method} Not Allowed` });
}
