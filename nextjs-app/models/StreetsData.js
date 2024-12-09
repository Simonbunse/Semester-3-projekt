import { model, models, Schema } from "mongoose";

const streetsDataSchema = new Schema({
  streetName: { type: String, required: true },
  betweenStreets: { type: String, required: true },
  devices: [
    {
      deviceId: { type: Number, required: true },
      vehiclePresent: { type: Boolean, required: true },
    }
  ],
  lastUpdated: { type: Date, default: Date.now }
});

export const StreetsData = models?.StreetsData || model('StreetsData', streetsDataSchema);
