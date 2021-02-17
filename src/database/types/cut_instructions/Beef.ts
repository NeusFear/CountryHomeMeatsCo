import { SchemaDefinition } from 'mongoose';

export type BeefCutInstructions = {
  cutType: "beef"
  round: { type: string, tenderized: string, size: string, amount: string }
  sirlointip: { size: string, amount: string, type: string }
  flank: string
  sirloin: { size: string, amount: string }
  tbone: { size: string, amount: string }
  rump: string
  pikespeak: string
  soupbones: string
  groundbeef: string
  chuck: string
  arm: string
  ribs: string
  club: { type: string, size: string, amount: string }
  brisket: string
  stewmeat: { amount: string, size: string }
  patties: { weight: string, amount: string }
}

export const BeefCutInstructionsSchema: SchemaDefinition = {
  round: { type: String, tenderized: String, size: String, amount: String },
  sirlointip: { size: String, amount: String, type: String },
  flank: String,
  sirloin: { size: String, amount: String },
  tbone: { size: String, amount: String },
  rump: String,
  pikespeak: String,
  soupbones: String,
  groundbeef: String,
  chuck: String,
  arm: String,
  ribs: String,
  club: { type: String, size: String, amount: String },
  brisket: String,
  stewmeat: { amount: String, size: String },
  patties: { weight: String, amount: String },
}