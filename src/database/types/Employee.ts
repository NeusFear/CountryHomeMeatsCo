import mongoose, { Schema, Document } from 'mongoose';

import { createResultWatcher } from '../Database';

export const userModelName = 'Employee'

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

  hours: number,
  clockInState: number
  clockInTime: number
  onBreakTime: number
}

const employeeSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String, default:'' },
  phoneNumbers: { type: [{ 
    name: { type: String, required: true }, 
    number: { type: String, required: true }
  }], required: true },
  address: { type: [String], required: true },
  startDate: { type: Schema.Types.Date, required: true },
  birthday: { type: Schema.Types.Date, required: true },

  hours: { type: Number, required: true, default: 0 },
  clockInState: { type: Number, default: 3, enum: [1,2,3] },
  clockInTime: { type: Number, default: 0 },
  onBreakTime: { type: Number, default: 0 }
});

const Employee = mongoose.model<IEmployee>(userModelName, employeeSchema)

export const useEmployees = createResultWatcher(Employee)
export default Employee
