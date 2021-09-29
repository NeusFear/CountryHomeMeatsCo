import mongoose, { Schema, Document } from 'mongoose';

import { createResultWatcher } from '../Database';
import { customEventsDatabaseName } from '../DatabaseNames';

export interface ICustomEvent extends Document {
  startDate: Date
  endDate: Date
  eventName: string
  eventColor: string
}

const customEventsSchema = new Schema({
  startDate: { type: Schema.Types.Date, required: true },
  endDate: { type: Schema.Types.Date, required: true },
  eventName: { type: String, required: true },
  eventColor: { type: String, default: 'white' }
});

const DayEvents = mongoose.model<ICustomEvent>(customEventsDatabaseName, customEventsSchema)

export const useDayEvents = createResultWatcher(DayEvents)
export default DayEvents
