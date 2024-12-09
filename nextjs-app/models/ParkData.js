import { model, models, Schema } from "mongoose";

const parkDataSchema = new Schema({
  line_items: Object,
  parkingLotName: { type: String, required: true },
  dateTimeStart: { type: String, required: true },
  dateTimeEnd: { type: String, required: true }
}, { timestamps: true });

export const ParkData = models?.ParkData || model('ParkData', parkDataSchema);
