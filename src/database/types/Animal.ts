import { ObjectId } from 'bson';
import mongoose, { Document, Schema } from 'mongoose';
import { useMemo } from 'react';
import { createResultWatcher, DatabaseWait, DatabaseWaitType } from '../Database';
import { animalDatabaseName, invoiceDatabaseName, userDatabaseName } from '../DatabaseNames';


export enum AnimalType {
  Beef = "Beef",
  Pork = "Pork"
}

export type Eater = {
  id?: ObjectId,
  tag?: string,
  halfUser?: { id: ObjectId, tag: string }
  cutInstruction?: number
}

export const ValidateEatersFields = "numEaters eaters"
export const validateEaters = (animal: IAnimal): boolean => {
  const eaterValid = (obj?: { id?: ObjectId; tag?: string; cutInstruction?: number }, isHalfUser?: boolean) => {
    if (obj === undefined || obj === null) {
      return false
    }
    const { id, cutInstruction } = obj
    return (id ?? false) && ((cutInstruction !== undefined && cutInstruction >= 0) || isHalfUser)
  }
  const eaters = animal.numEaters;
  if (eaters < 1 || eaters > 4) {
    return false
  }
  switch (eaters) {
    case 1: return animal.eaters.length === 1 && eaterValid(animal.eaters[0]) && !animal.eaters[0].halfUser
    case 2: return animal.eaters.length === 2 && eaterValid(animal.eaters[0]) && !animal.eaters[0].halfUser && eaterValid(animal.eaters[1]) && !animal.eaters[1].halfUser
    case 3: return animal.eaters.length === 2 && eaterValid(animal.eaters[0]) && eaterValid(animal.eaters[0].halfUser, true) && eaterValid(animal.eaters[1]) && !animal.eaters[1].halfUser
    case 4: return animal.eaters.length === 2 && eaterValid(animal.eaters[0]) && eaterValid(animal.eaters[0].halfUser, true) && eaterValid(animal.eaters[1]) && eaterValid(animal.eaters[1].halfUser, true)
  }
  return false;
}

const CowSexes = ["Steer", "Heiffer", "Cow", "Bull"] as const
const PigSexes = ["Barrow", "Gilt", "Sow", "Boar"] as const

export const getSexes = (animal: IAnimal): AnimalSexes[] => {
  return [...animal?.animalType === AnimalType.Beef ? CowSexes : PigSexes]
}

export type AnimalSexes = typeof CowSexes[number] | typeof PigSexes[number]

export type PenLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | ""

export interface IAnimal extends Document {
  animalType: AnimalType,
  animalId: number,
  bringer: ObjectId,
  invoices: ObjectId[],
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
  invoiceGeneratedDate: Date
  tagNumber: string,
  liverGood: boolean,
  liverBadReason?: string
  older30Months?: boolean
  pigTatooNumber?: number,

  pickedUp: boolean
}

const animalSchmea = new Schema({
  animalType: { type: String, enum: Object.keys(AnimalType), required: true },
  animalId: { type: Number, required: true },
  bringer: { type: Schema.Types.ObjectId, ref: userDatabaseName, required: true },
  invoices: [{ type: Schema.Types.ObjectId, ref: invoiceDatabaseName, required: true, default: [] }],
  numEaters: { type: Number, default: 1 },
  eaters: {
    type: [{
      id: { type: Schema.Types.ObjectId, ref: userDatabaseName },
      tag: { type: String },
      halfUser: {
        type: {
          id: { type: Schema.Types.ObjectId, ref: userDatabaseName },
          tag: { type: String },
        }
      },
      cutInstruction: { type: Number }
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
  penLetter: { type: String, uppercase: true, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', ''] },
  processDate: { type: Schema.Types.Date },
  invoiceGeneratedDate: { type: Schema.Types.Date },
  tagNumber: { type: String },
  liverGood: { type: Boolean, default: true },
  liverBadReason: { type: String },
  older30Months: { type: Boolean },
  pigTatooNumber: { type: Number },

  pickedUp: { type: Boolean, default: false },
});

const Animal = mongoose.model<IAnimal>(animalDatabaseName, animalSchmea)

export const createEmptyAnimal = (userID: string): IAnimal => {
  return new Animal({
    bringer: new ObjectId(userID),
    eaters: [],
  })
}

export const AnimalStateFields = "confirmed liveWeight color sex dressWeight invoiceGeneratedDate pickedUp tagNumber " + ValidateEatersFields
export const computeAnimalState = (animal: IAnimal | undefined) => {
  if (!animal || !animal.confirmed) return 0
  if ([animal.liveWeight, animal.color, animal.sex].some(e => e === undefined || e === "")) return 1
  if (animal.dressWeight === undefined) return 2
  if (!validateEaters(animal)) return 3
  if (animal.invoiceGeneratedDate === undefined) return 4
  if (!animal.pickedUp) return 5
  return 6
}

export const paddedAnimalId = (animal: IAnimal) => String(animal.animalId).padStart(5, "0")

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

export const useComputedAnimalState = (animalWithWait: IAnimal | undefined | DatabaseWaitType) => {
  let animal: IAnimal | undefined
  if (animalWithWait === DatabaseWait) {
    animal = undefined
  } else {
    animal = animalWithWait
  }

  return useMemo(() => computeAnimalState(animal), [
    //To get from scheduled to confirmed
    animal?.confirmed,

    //To get from confirmed to arrived
    animal?.liveWeight, animal?.color, animal?.sex, animal?.penLetter,

    //To get from arrived to hanging
    animal?.dressWeight,

    //To get from hanging to ready-to-cut.
    //The stringify is as it needs to be one element, rather than several
    animal?.numEaters,
    JSON.stringify(animal?.eaters?.filter(e => e !== null)?.map(e => { return [e.id, e.halfUser, e.cutInstruction] })),

    //To get from ready-to-cut to ready-for-pickup
    animal?.invoiceGeneratedDate,

    //To get from ready-for-pickup to archived
    animal?.pickedUp
  ])
}



export const useAnimals = createResultWatcher(Animal)
export default Animal