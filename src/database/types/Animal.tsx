import mongoose, { Schema, Document, Types, mongo } from 'mongoose';
import { ObjectId } from 'bson'
import { createGetElement, createRefreshListener } from '../Database';
import { userModelName } from './User';

export const AnimalType = {
  Cow: "Cow",
  Pig: "Pig"
}

export interface IAnimal extends Document {
  animalType: "Cow" | "Pig"
  bringer: ObjectId,
  eater: { id: ObjectId, portion: number, recordCard: number }[],
  killDate: Date,
  bringInData?: {
    liveWeight: number,
    dressWeight: number,
    color: string,
    sex: string,
    penLetter: string
    processDate: Date,
    tagNumber: number,
    pigTatooNumber?: number
  }
}

const animalSchmea = new Schema({
  animalType: { type: String, enum: [AnimalType.Cow, AnimalType.Pig], required: true },
  bringer: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
  eaters: { type: [{
    id: { type: Schema.Types.ObjectId, ref: userModelName, required: true },
    portion: { type: Number, required: true },
    recordCard: { type: Number, required: true }
  }], required: true },
  killDate: { type: Schema.Types.Date, required: true },
  bringInData: { type: {
    liveWeight: { type: Number, required: true },
    dressWeight: { type: Number, required: true },
    color: { type: String, required: true },
    sex: { type: String, required: true },
    penLetter: { type: String, required: true, uppercase: true, enum: ['A','B','C','D','E','F','G','H','I','J']},
    processDate: { type: Schema.Types.Date, required: true },
    tagNumber: { type: Number, required: true },
    pigTatooNumber: { type: Number, required: false }
  }},
});

const Animal = mongoose.model<IAnimal>('Animal', animalSchmea)

export const createEmptyAnimal = (userID: string): IAnimal => {
  return new Animal({
    bringer: new ObjectId(userID),
    eater: [],
  })
}

const refreshListener = createRefreshListener(Animal)
export const useAnimalById = createGetElement<IAnimal, string>(
  id => Animal.findById(id), 
  refreshListener, 
  (param, evt) => {
    const any: any = evt
    if(any.documentKey) {
      return param === any.documentKey._id.toString()
    }
    return false
  }
)
export const useAnimals = createGetElement<Array<IAnimal>, any>(q => Animal.find(q), refreshListener)
export default Animal