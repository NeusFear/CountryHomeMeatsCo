import { useMemo, DependencyList, useEffect, useState } from 'react'
import mongoose, { Schema, Document, ObjectId, FilterQuery, Query } from 'mongoose';
import { ObjectId as BsonObjectId } from 'bson'

import { createResultWatcher } from '../Database';
import { stat } from 'fs';

export const userModelName = 'User'

type HamCf = "Hamburger" | "Chicken Fry"

export type CutInstructions = BeefCutInstructions | PorkCutInstructions


export type BeefCutInstructions = {
  type: "beef"
  round: { amount: "25%"|"50%"|"75%", tenderized: boolean, size: '.5"'|'.75"'|'1"', type: HamCf }
  sirlointip: { size: '.75"'|'1"'|'1.25"'|'3lbRoast', amount: '1'|'2'|'3'|'4', type: HamCf }
  flank: HamCf | "Whole"
  sirloin: { size: '.5"'|'.75"'|'1"'|'1.25"', amount: '1'|'2'|'3'|'4' }
  tbone: { size: '.5"'|'.75"'|'1"'|'1.25"', amount: '1'|'2'|'3'|'4' }
  rump: '2lb'|'2.5lb'|'3lb'|'3.5lb'|'4lb'
  pikespeak: '2lb'|'2.5lb'|'3lb'|'3.5lb'|'4lb'
  soupbones: 'Yes'|'No'|'Shank Only'|'Marrow Only'
  groundbeef: '1'|'1.5'|'2'|'5'|'10'|'half1half2'
  chuck: '2lb'|'2.5lb'|'3lb'|'3.5lb'|'4lb'
  arm: '2lb'|'2.5lb'|'3lb'|'3.5lb'|'4lb'
  ribs: 'Keep'|'Keep Part'|'All Hamburger'|'Hamburger If Possible'
  club: { type: 'Ribeye'|'Bone In', size: '.5"'|'.75"'|'1"'|'1.25"', amount: '1'|'2'|'3'|'4' }
  brisket: 'Whole'|'Halved'|'Hamburger'
  stewmeat: { amount: '5PKG'|'10PKG'|'15PKG', size: '1.0lb/PKG'|'1.5lb/PKG'|'2.0lb/PKG' }
  patties: { weight: '20lb'|'30lb'|'40lb'|'25%'|'33%'|'50%', amount: '3'|'4'|'5'|'6' }
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