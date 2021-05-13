import mongoose, { Schema, Document } from 'mongoose';

import { createResultWatcher } from '../Database';

export const customEventsModelName = 'CustomEvents'

export interface ICustomEvent extends Document {
  date: Date
  eventName: string
  eventColor: number
}

const customEventsSchema = new Schema({
  date: { type: Schema.Types.Date, required: true },
  eventName: { type: String, required: true },
  eventColor: { type: Number, default: 0 }
});

const DayEvents = mongoose.model<ICustomEvent>(customEventsModelName, customEventsSchema)

export const useDayEvents = createResultWatcher(DayEvents)
export default DayEvents
