import mongoose, { Schema, Document } from 'mongoose';

import { createResultWatcher } from '../Database';
import { customEventsDatabaseName } from '../DatabaseNames';

export interface ICustomEvent extends Document {
  date: Date
  eventName: string
  eventColor: string
}

const customEventsSchema = new Schema({
  date: { type: Schema.Types.Date, required: true },
  eventName: { type: String, required: true },
  eventColor: { type: String, default: 'white' }
});

const DayEvents = mongoose.model<ICustomEvent>(customEventsDatabaseName, customEventsSchema)

export const useDayEvents = createResultWatcher(DayEvents)
export default DayEvents
