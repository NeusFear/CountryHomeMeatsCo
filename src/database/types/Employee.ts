import mongoose, { Schema, Document } from 'mongoose';

import { createResultWatcher } from '../Database';
import { employeeDatabaseName } from '../DatabaseNames';

export const ClockInState = {
  ClockedIn: 1,
  OnBreak: 2,
  ClockedOut: 3
}

export interface IEmployee extends Document {
  firstName: string,
  lastName: string,
  middleName: string
  phoneNumbers: { name: string, number: string }[]
  address: string[],
  startDate: Date,
  birthday: Date,

  clockInEvents: { day: Date, events: { time: Date, state: number }[] }[]
}

const employeeSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String, default: '' },
  phoneNumbers: {
    type: [{
      name: { type: String, required: true },
      number: { type: String, required: true }
    }], required: true
  },
  address: { type: [String], required: true },
  startDate: { type: Schema.Types.Date, required: true },
  birthday: { type: Schema.Types.Date, required: true },

  hours: { type: Number, required: true, default: 0 },
  clockInEvents: {
    type: [{
      day: { type: Schema.Types.Date, required: true },
      events: {
        type: [{
          time: { type: Schema.Types.Date, required: true },
          state: { type: Number, default: 3, enum: [1, 2, 3] }
        }], required: true, default: []
      }
    }], required: true, default: []
  },
});

export const computeEmployeeDay = (events: { time: Date; state: number; }[]) => {
  let hours = 0;
  for(let i = 0; i < events.length-1; i+=2) {
    hours += events[i+1].time.getTime() - events[i].time.getTime()
  }
  return hours
}

const Employee = mongoose.model<IEmployee>(employeeDatabaseName, employeeSchema)

export const useEmployees = createResultWatcher(Employee)
export default Employee
