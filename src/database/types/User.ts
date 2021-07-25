import mongoose, { Schema, Document, SchemaDefinition, DocumentDefinition } from 'mongoose';
import { ObjectId } from 'bson';
import { createResultWatcher } from '../Database';
import { invoiceDatabaseName, userDatabaseName } from '../DatabaseNames';
import { AnimalType } from './Animal';
import { BeefCutInstructions, BeefCutInstructionsSchema } from './cut_instructions/Beef';
import { PorkCutInstructions, PorkCutInstructionsSchema } from './cut_instructions/Pork';

export type CutInstructions = (BeefCutInstructions | PorkCutInstructions) & { notes?: string }

export interface IUser extends Document {
  name: string
  invoices: ObjectId[],
  phoneNumbers: { name: string, number: string }[]
  emails: string[],
  cutInstructions: {
    id: number,
    instructions: CutInstructions
  }[],
  notes: string
}

export const CutInstructionsSchema: SchemaDefinition<DocumentDefinition<any>> = {
  cutType: { type: String, enum: [AnimalType.Beef, AnimalType.Pork], required: true },
  ...BeefCutInstructionsSchema, 
  ...PorkCutInstructionsSchema,
  notes: { type: String, default: '' },
}

const userSchmea = new Schema({
  name: { type: String, required: true },
  invoices: [{ type: Schema.Types.ObjectId, ref: invoiceDatabaseName, required: true, default: [] }],
  phoneNumbers: { type: [{ 
    name: { type: String, required: true }, 
    number: { type: String, required: true }
  }], required: true },
  emails: {type: [String], required: true },
  cutInstructions: { type: [{ 
    id: { type: Number, required: true },
    instructions: { type: CutInstructionsSchema, required: true }
   }], required: true},
   notes: { type: String, default: '' },
});

const User = mongoose.model<IUser>(userDatabaseName, userSchmea)

export const useUsers = createResultWatcher(User)
export default User