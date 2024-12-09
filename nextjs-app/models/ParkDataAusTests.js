import { model, models, Schema } from "mongoose";

const lineItemSchema = new Schema({
  arrivalTime: { type: String, required: true },
  departureTime: { type: String, required: true },
  vehiclePresent: { type: Boolean, required: true }
}, { _id: false });

const parkDataAusTestsSchema = new Schema({
  deviceId: { type: String, required: true },
  dateTimeStart: { type: String, required: true },
  dateTimeEnd: { type: String, required: true },
  streetName: { type: String, required: true },
  betweenStreets: { type: String, required: true },
  line_items: [lineItemSchema],
}, { timestamps: true });

export const ParkDataAusTests = models?.ParkDataAusTests || model('ParkDataAusTests', parkDataAusTestsSchema);
