import { useMemo, DependencyList, useEffect, useState } from 'react'
import mongoose, { Schema, Document, ObjectId, FilterQuery, Query } from 'mongoose';
import { ObjectId as BsonObjectId } from 'bson'

import { createResultWatcher } from '../Database';
import { stat } from 'fs';

export const userModelName = 'User'

export interface IUser extends Document {
  name: string
  phoneNumbers: { name: string, number: string }[]
  emails: string[],
  recordCards: {id: number}[],
  notes: string
}

const userSchmea = new Schema({
  name: { type: String, required: true },
  phoneNumbers: { type: [{ 
    name: { type: String, required: true }, 
    number: { type: String, required: true }
  }], required: true },
  emails: {type: [String], required: true },
  recordCards: { type: [{ 
    id: { type: Number, required: true },
    //TODO: record cards data
   }], required: true},
   notes: { type: String, required: true, default: '' },
});

const User = mongoose.model<IUser>(userModelName, userSchmea)

export const useUsers = createResultWatcher(User)
export default User