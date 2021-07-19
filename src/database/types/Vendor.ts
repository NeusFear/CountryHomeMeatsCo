import mongoose, { Schema, Document } from 'mongoose';

import { createResultWatcher } from '../Database';
import { vendorDatabaseName } from '../DatabaseNames';


export interface IVendor extends Document {
  company: string,
  primaryContact: string,
  phoneNumbers: { name: string, number: string }[],
  emails: string[],
  notes: string
}

const vendorSchema = new Schema({
  company: { type: String, required: true },
  primaryContact: { type: String, required: true },
  phoneNumbers: { type: [{ 
    name: { type: String, required: true }, 
    number: { type: String, required: true }
  }], required: true },
  emails: {type: [String], required: true },
  notes: { type: String, default: '' }
});

const Vendor = mongoose.model<IVendor>(vendorDatabaseName, vendorSchema)

export const useVendors = createResultWatcher(Vendor)
export default Vendor