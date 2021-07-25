import { SchemaDefinition } from "mongoose"
import { AnimalType } from "../Animal"

export const validateFreshCuredPart = ({ fresh, cured }: {
  fresh: { amount: number }
  cured: { amount: number }
}) => {
  return (fresh.amount + cured.amount) === 2
}

export type PorkCutInstructions = {
  cutType: AnimalType.Pork
  ham: {
    fresh: { amount: number, type: string, cutType: string, size: string, amountPerPackage: string }
    cured: { amount: number, type: string, cutType: string, size: string, amountPerPackage: string }
  },
  bacon: {
    fresh: { amount: number, size: string, cutType: string }
    cured: { amount: number, size: string, cutType: string }
  },
  jowl: {
    fresh: { amount: number, type: string }
    cured: { amount: number, type: string }
  },
  loin: {
    fresh: { amount: number, size: string, packageAmount: string }
    cured: { amount: number, size: string, packageAmount: string }
  },
  butt: {
    fresh: { amount: number, type: string, packageAmount: string }
    cured: { amount: number, type: string, packageAmount: string }
  }
  picnic: {
    fresh: { amount: number, type: string, packageAmount: string }
    cured: { amount: number, type: string, packageAmount: string }
  },
  rib: string,
  sausage: string,
  head: string,
  feet: string,
  heart: string,
  fat: string  
}

export const PorkCutInstructionsSchema: SchemaDefinition = {
  ham: {
    fresh: { amount: Number, type: String, cutType: String, size: String, amountPerPackage: String },
    cured: { amount: Number, type: String, cutType: String, size: String, amountPerPackage: String },
  },
  bacon: {
    fresh: { amount: Number, size: String, cutType: String },
    cured: { amount: Number, size: String, cutType: String },
  },
  jowl: {
    fresh: { amount: Number, type: String },
    cured: { amount: Number, type: String },
  },
  loin: {
    fresh: { amount: Number, size: String, packageAmount: String },
    cured: { amount: Number, size: String, packageAmount: String },
  },
  butt: {
    fresh: { amount: Number, type: String, packageAmount: String },
    cured: { amount: Number, type: String, packageAmount: String },
  },
  picnic: {
    fresh: { amount: Number, type: String, packageAmount: String },
    cured: { amount: Number, type: String, packageAmount: String },
  },
  rib: String,
  sausage: String,
  head: String,
  feet: String,
  heart: String,
  fat: String,
}

export const clonePorkCutInstructions = (instructions: PorkCutInstructions): PorkCutInstructions => {
  return {
    cutType: AnimalType.Pork,
    ham: instructions.ham,
    bacon: instructions.bacon,
    jowl: instructions.jowl,
    loin: instructions.loin,
    butt: instructions.butt,
    picnic: instructions.picnic,
    rib: instructions.rib,
    sausage: instructions.sausage,
    head: instructions.head,
    feet: instructions.feet,
    heart: instructions.heart,
    fat: instructions.fat
  }
}