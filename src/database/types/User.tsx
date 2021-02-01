import { useMemo, DependencyList, useEffect, useState } from 'react'
import mongoose, { Schema, Document, ObjectId, FilterQuery, Query } from 'mongoose';
import { ObjectId as BsonObjectId } from 'bson'

import { createResultWatcher } from '../Database';
import { stat } from 'fs';

export const userModelName = 'User'

type HamCf = "Hamburger" | "Chicken Fry"

export type CutInstructions = null

export type BeefCutInstructions = {
  type: "beef"
  round: { amount: number, tenderized: boolean, size: number, type: HamCf }
  sirlointip: { size: number, amount: number, type: HamCf }
  flank: HamCf | "Whole"
  sirloin: { size: number, amount: number }
  tbone: { size: number, amount: number }
  rump: number
  pikespeak: number
  soupbones: "Yes" | "No" | "Shank Only" | "Marrow Only"
  groundbeef: number
  chuck: number
  arm: number
  ribs: "Keep" | "Keep Part" | "All Hamburger" | "Hamburger If Possible"
  club: { size: number, amoutn: number, type: "Ribeye" | "Bone In" }
  brisket: "Whole" | "Halved" | "Hamburger"
  stewmeat: { packages: number, amount: number }
  patties: { weight: number, amount: number }
}

export type PorkCutInstructions = {
  type: "pork"
  ham: {
    fresh: {
      amount: number,
      
    }
  }
}
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
   notes: { type: String, default: '' },
});

const User = mongoose.model<IUser>(userModelName, userSchmea)

export const useUsers = createResultWatcher(User)
export default User