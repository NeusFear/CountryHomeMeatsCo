import mongoose, { Schema, Document, Types, mongo, FilterQuery } from 'mongoose';
import { ObjectId } from 'bson'
import { createResultWatcher } from '../Database';
import { userModelName } from './User';

export const AnimalType = {
  Cow: "Cow",
  Pig: "Pig"
}

export type Eater = { 
  id: ObjectId, 
  portion: number, 
  recordCard: number
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
  animalType: "Cow" | "Pig"
  bringer: ObjectId,
  eaters: Eater[],
  killDate: Date,
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
  animalType: { type: String, enum: [AnimalType.Cow, AnimalType.Pig], required: true },
  bringer: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
  eaters: { type: [{
    id: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
    portion: { type: Number, required: true },
    recordCard: { type: Number, required: true }
  }], default: [] },
  killDate: { type: Schema.Types.Date, required: true },
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

export const useAnimals = createResultWatcher(Animal)
export default Animal