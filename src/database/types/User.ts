import mongoose, { Schema, Document } from 'mongoose';

import { createResultWatcher } from '../Database';
import { BeefCutInstructions, BeefCutInstructionsSchema } from './cut_instructions/Beef';
import { PorkCutInstructions, PorkCutInstructionsSchema } from './cut_instructions/Pork';

export const userModelName = 'User'

export type CutInstructions = (BeefCutInstructions | PorkCutInstructions) & { notes?: string }

export interface IUser extends Document {
  name: string
  phoneNumbers: { name: string, number: string }[]
  emails: string[],
  cutInstructions: {
    id: number,
    instructions: CutInstructions
  }[],
  notes: string
}

const userSchmea = new Schema({
  name: { type: String, required: true },
  phoneNumbers: { type: [{ 
    name: { type: String, required: true }, 
    number: { type: String, required: true }
  }], required: true },
  emails: {type: [String], required: true },
  cutInstructions: { type: [{ 
    id: { type: Number, required: true },
    instructions: { type: {
      cutType: { type: String, enum: ["beef", "pork"], required: true },
      ...BeefCutInstructionsSchema, 
      ...PorkCutInstructionsSchema,
      notes: { type: String, default: '' },
    }, required: true }
   }], required: true},
   notes: { type: String, default: '' },
});

const User = mongoose.model<IUser>(userModelName, userSchmea)

export const useUsers = createResultWatcher(User)
export default User