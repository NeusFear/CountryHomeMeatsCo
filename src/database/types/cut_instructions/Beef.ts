import { SchemaDefinition } from 'mongoose';
import { AnimalType } from '../Animal';

export type BeefCutInstructions = {
  cutType: AnimalType.Beef
  round: { tenderizedAmount: string, size: string, perPackage: string }
  sirlointip: { size: string, amount: string }
  flank: string
  sirloin: { size: string, amount: string }
  tbone: { bone: string, size: string, amount: string }
  rump: string
  pikespeak: string
  soupbones: string
  groundbeef: string
  chuck: string
  arm: string
  ribs: string
  club: { bone: string, size: string, amount: string }
  brisket: string
  stewmeat: { amount: string, size: string }
  patties: { weight: string, amount: string }
  
  boneOutPrimeRib: boolean
  boneOutLoin: boolean
}

export const BeefCutInstructionsSchema: SchemaDefinition = {
  round: { tenderizedAmount: String, size: String, perPackage: String },
  sirlointip: { size: String, amount: String },
  flank: String,
  sirloin: { size: String, amount: String },
  tbone: { bone: String, size: String, amount: String },
  rump: String,
  pikespeak: String,
  soupbones: String,
  groundbeef: String,
  chuck: String,
  arm: String,
  ribs: String,
  club: { bone: String, size: String, amount: String },
  brisket: String,
  stewmeat: { amount: String, size: String },
  patties: { weight: String, amount: String },

  boneOutPrimeRib: Boolean,
  boneOutLoin: Boolean,
}