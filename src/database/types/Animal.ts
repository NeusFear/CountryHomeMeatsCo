import { useMemo } from 'react';
import mongoose, { Schema, Document, Types, mongo, FilterQuery } from 'mongoose';
import { ObjectId } from 'bson'
import { createResultWatcher } from '../Database';
import { userModelName } from './User';
import { unstable_batchedUpdates } from 'react-dom';

export enum AnimalType {
  Cow = "Cow",
  Pig = "Pig"
}

export type Eater = {
  id: ObjectId,
  tag: string,
  halfUser?: { id: ObjectId, tag: string }
  cutInstruction: number
}

export const ValidateEatersFields = ""
export const validateEaters = (animal: IAnimal): boolean => {
  return true;
  //TODO re-add this to make sure that if there are x specified users that we have information for all said users
}

const CowSexes = ["Steer", "Heiffer", "Cow", "Bull"] as const
const PigSexes = ["Barrow", "Gilt", "Sow", "Boar"] as const

export const getSexes = (animal: IAnimal): AnimalSexes[] => {
  return [...animal.animalType === "Cow" ? CowSexes : PigSexes]
}

export type AnimalSexes = typeof CowSexes[number] | typeof PigSexes[number]

export type PenLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J"

export interface IAnimal extends Document {
  animalType: AnimalType
  bringer: ObjectId,
  numEaters: number
  eaters: Eater[],
  killDate: Date,
  called: boolean,
  confirmed: boolean,

  arriveDate: Date,

  liveWeight: number,
  dressWeight: number,
  color: string,
  sex: AnimalSexes,
  penLetter: PenLetter
  processDate: Date,
  tagNumber: number,
  liverGood: boolean,
  older30Months: boolean
  pigTatooNumber?: number,

  pickedUp: boolean
}

const animalSchmea = new Schema({
  animalType: { type: String, enum: Object.keys(AnimalType), required: true },
  bringer: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
  numEaters: { type: Number, default: 1 },
  eaters: {
    type: [{
      id: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
      tag: { type: String },
      halfUser: {
        type: {
          id: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
          tag: { type: String },
        }
      },
      cutInstruction: { type: Number, required: true }
    }], default: []
  },
  killDate: { type: Schema.Types.Date, required: true },
  called: { type: Boolean, default: false },
  confirmed: { type: Boolean, default: false },

  arriveDate: { type: Schema.Types.Date },

  liveWeight: { type: Number },
  dressWeight: { type: Number },
  color: { type: String },
  sex: { type: String },
  penLetter: { type: String, uppercase: true, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] },
  processDate: { type: Schema.Types.Date },
  tagNumber: { type: Number },
  liverGood: { type: Boolean },
  older30Months: { type: Boolean },
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

export const AnimalStateFields = "confirmed liveWeight color sex tagNumber penLetter dressWeight processDate pickedUp " + ValidateEatersFields
export const computeAnimalState = (animal: IAnimal | undefined) => {
  if (!animal || !animal.confirmed) return 0
  if ([animal.liveWeight, animal.color, animal.sex,
  animal.tagNumber, animal.penLetter].some(e => e === undefined)) return 1
  if (animal.dressWeight === undefined) return 2
  if (!validateEaters(animal)) return 3
  if (animal.processDate === undefined) return 4
  if (animal.pickedUp) return 5
  return 6
}

export const useAnimalStateText = (state: number) => useMemo(() => {
  switch (state) {
    case 0:
      return "Scheduled"
    case 1:
      return "Confirmed"
    case 2:
      return "Arrived"
    case 3:
      return "Hanging"
    case 4:
      return "Ready to Cut"
    case 5:
      return "Ready to Pickup"
    case 6:
      return "Delivered"
  }
}, [state])

export const useComputedAnimalState = (animal: IAnimal | undefined) =>
  useMemo(() => computeAnimalState(animal), [
    //To get from scheduled to confirmed
    animal?.confirmed,

    //To get from confirmed to arrived
    animal?.liveWeight, animal?.color, animal?.sex, animal?.tagNumber, animal?.penLetter,

    //To get from arrived to hanging
    animal?.dressWeight,

    //To get from hanging to ready-to-cut.
    //The stringify is as it needs to be one element, rather than several
    JSON.stringify(animal?.eaters?.map(e => { return [e.id, e.halfUser, e.cutInstruction] })),

    //To get from ready-to-cut to ready-for-pickup
    animal?.processDate,

    //To get from ready-for-pickup to archived
    animal?.pickedUp
  ])



export const useAnimals = createResultWatcher(Animal)
export default Animal