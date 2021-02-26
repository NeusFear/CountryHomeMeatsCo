import { useMemo } from 'react';
import mongoose, { Schema, Document, Types, mongo, FilterQuery } from 'mongoose';
import { ObjectId } from 'bson'
import { createResultWatcher } from '../Database';
import { userModelName } from './User';

export enum AnimalType {
  Cow = "Cow",
  Pig = "Pig"
}

export type Eater = { 
  id: ObjectId, 
  portion: number, 
  cutInstruction: number
}
export const validateEaters = (eaters: Eater[]): boolean => {
  const portions = eaters.map(e => e.portion)
  return portions.reduce((a, b) => a + b, 0) === 1 &&
         portions.every(p => p === 1 || p === 0.5 || p === 0.25)
}

export const getSexes = (animal: IAnimal): AnimalSexes[] => {
  return animal.animalType === "Cow" ? 
    ["Steer", "Heffer", "Cow", "Bull"] :
    ["Barrow", "Gilt", "Sow", "Boar"]
}

export type AnimalSexes = 
    "Steer" | "Heffer" | "Cow" | "Bull" | 
    "Barrow" | "Gilt" | "Sow" | "Boar"

export type PenLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"

export interface IAnimal extends Document {
  animalType: AnimalType
  bringer: ObjectId,
  eaters: Eater[],
  killDate: Date,
  called: boolean,
  confirmed: boolean,
  
  liveWeight: number,
  dressWeight: number,
  color: string,
  sex: AnimalSexes,
  penLetter: PenLetter
  processDate: Date,
  tagNumber: number,
  pigTatooNumber?: number,

  pickedUp: boolean
}

const animalSchmea = new Schema({
  animalType: { type: String, enum: Object.keys(AnimalType), required: true },
  bringer: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
  eaters: { type: [{
    id: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
    portion: { type: Number, required: true },
    cutInstruction: { type: Number, required: true }
  }], default: [] },
  killDate: { type: Schema.Types.Date, required: true },
  called: { type: Boolean, default: false},
  confirmed: { type: Boolean, default: false },
  
  liveWeight: { type: Number },
  dressWeight: { type: Number },
  color: { type: String },
  sex: { type: String },
  penLetter: { type: String, uppercase: true, enum: ['A','B','C','D','E','F','G','H','I','J']},
  processDate: { type: Schema.Types.Date },
  tagNumber: { type: Number },
  pigTatooNumber: { type: Number },

  pickedUp: { type: Boolean, default: false },
});

const Animal = mongoose.model<IAnimal>('Animal', animalSchmea)

export const createEmptyAnimal = (userID: string): IAnimal => {
  return new Animal({
    bringer: new ObjectId(userID),
    eaters: [],
  })
}

export const useComputedAnimalState = (animal: IAnimal) => 
  useMemo(() => {
    if(!animal || !animal.confirmed) return 0
    if([ animal.liveWeight, animal.color, animal.sex, 
        animal.tagNumber, animal.penLetter].some(e => e === undefined)) return 1
    if(animal.dressWeight === undefined) return 2
    if(!validateEaters(animal.eaters)) return 3
    if(animal.processDate === undefined) return 4
    if(animal.pickedUp) return 5
    return 6
  }, [
    //To get from scheduled to confirmed
    animal?.confirmed,

    //To get from confirmed to arrived
    animal?.liveWeight, animal?.color, animal?.sex, animal?.tagNumber, animal?.penLetter,

    //To get from arrived to hanging
    animal?.dressWeight,

    //To get from hanging to ready-to-cut.
    //The stringify is as it needs to be one element, rather than several
    JSON.stringify(animal?.eaters.map(e => { return [e.id, e.portion, e.cutInstruction] })),

    //To get from ready-to-cut to ready-for-pickup
    animal?.processDate,

    //To get from ready-for-pickup to archived
    animal?.pickedUp
  ])



export const useAnimals = createResultWatcher(Animal)
export default Animal