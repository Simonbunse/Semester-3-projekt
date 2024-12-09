import { mongooseConnect } from "@/lib/mongoose";
import { ParkDataAusTests } from "@/models/ParkDataAusTests";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests are allowed' });
    return;
  }

  // Log the request body
  console.log("Request Body:", req.body);

  // Destructure required fields from the request body
  const { deviceId, timestamp, streetName, betweenStreets, vehiclePresent } = req.body;

  // Validate required fields
  if (!deviceId || !timestamp || !streetName || !betweenStreets || vehiclePresent === undefined) {
    res.status(400).json({ message: 'Missing required fields in request body' });
    return;
  }

  const dateStart = new Date(timestamp).toISOString().split('T')[0];
  const dateTimeStart = `${dateStart}T00:00:00Z`;
  const dateTimeEnd = `${dateStart}T23:59:59.999999Z`;

  try {
    // Check if a document for the given date and deviceId exists
    const existingDocument = await ParkDataAusTests.findOne({ deviceId, dateTimeStart });

    if (existingDocument) {
      console.log('Document already exists');

      const lineItems = existingDocument.line_items;

      if (!lineItems || lineItems.length === 0) {
        res.status(500).json({ message: 'Existing document has no line items to reference' });
        return;
      }

      // Exclude the last placeholder object from timestamp validation
      const lastValidLineItem = lineItems[lineItems.length - 2] || lineItems[lineItems.length - 1];

      // Validate that the new timestamp is later than the previous DepartureTime
      if (new Date(timestamp) <= new Date(lastValidLineItem.departureTime)) {
        res.status(400).json({
          message: `Invalid timestamp: ${timestamp} is earlier than or equal to the previous departureTime: ${lastValidLineItem.departureTime}`
        });
        return;
      }

      // Update the placeholder last item with new departureTime
      const lastLineItem = lineItems[lineItems.length - 1];
      lastLineItem.departureTime = timestamp;
      lastLineItem.vehiclePresent = vehiclePresent;

      // Add a new placeholder line item for the end of the day
      const newLineItem = {
        arrivalTime: timestamp,
        departureTime: dateTimeEnd,
        vehiclePresent
      };

      existingDocument.line_items.push(newLineItem);
      await existingDocument.save();

      res.status(200).json({ message: 'New line item added and placeholder updated', data: newLineItem });
      return;
    }

    // If no document exists, create a new one
    const initialLineItem = {
      arrivalTime: dateTimeStart,
      departureTime: timestamp,
      vehiclePresent
    };

    const placeholderLineItem = {
      arrivalTime: timestamp,
      departureTime: dateTimeEnd,
      vehiclePresent
    };

    const newDocument = {
      deviceId,
      dateTimeStart,
      dateTimeEnd,
      streetName,
      betweenStreets, // Directly use the combined field
      line_items: [initialLineItem, placeholderLineItem]
    };

    const savedDocument = await ParkDataAusTests.create(newDocument);
    res.status(201).json({ message: 'Document created successfully with initial and placeholder line items', data: savedDocument });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
}
