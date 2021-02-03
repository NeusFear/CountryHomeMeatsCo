import { useMemo, DependencyList, useEffect, useState } from 'react'
import mongoose, { Schema, Document, ObjectId, FilterQuery, Query } from 'mongoose';
import { ObjectId as BsonObjectId } from 'bson'

import { createResultWatcher } from '../Database';
import { stat } from 'fs';
import { BeefCutInstructions } from './cut_instructions/Beef';
import { PorkCutInstructions } from './cut_instructions/Pork';

export const userModelName = 'User'


export type CutInstructions = BeefCutInstructions | PorkCutInstructions


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
    //TODO: record cards data
   }], required: true},
   notes: { type: String, default: '' },
});

const User = mongoose.model<IUser>(userModelName, userSchmea)

export const useUsers = createResultWatcher(User)
export default User