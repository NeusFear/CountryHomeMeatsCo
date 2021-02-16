import { SchemaDefinition } from 'mongoose';

export const OneFourAmount = [ '1', '2', '3', '4' ] as const
export const HamCf = [ "Hamburger", "Chicken Fry" ] as const
export const RoundAmount = [ "25%", "50%", "75%" ] as const
export const RoundSize = [ '.5"', '.75"', '1"' ] as const
export const SirloinTipSize = [ '.75"', '1"', '1.25"', '3lbRoast' ] as const
export const HamCfWhole = [ "Hamburger", "Chicken Fry", "Whole" ] as const
export const Point5OnePoint5Size = [ '.5"', '.75"', '1"', '1.25"' ] as const
export const TwoLB4LBWeight = [ '2lb', '2.5lb', '3lb', '3.5lb', '4lb' ] as const
export const SoupBones = [ 'Yes', 'No', 'Shank Only', 'Marrow Only' ] as const
export const GroupBeef = [ '1', '1.5', '2', '5', '10', 'half1half2' ] as const
export const Ribs = [ 'Keep', 'Keep Part', 'All Hamburger', 'Hamburger If Possible' ] as const
export const ClubType = [ 'Ribeye', 'Bone In' ] as const
export const Brisket = [ 'Whole', 'Halved', 'Hamburger' ] as const
export const StewmeatAmount = [ '5PKG', '10PKG', '15PKG' ] as const
export const StewmeatSize = [ '1.0lb/PKG', '1.5lb/PKG', '2.0lb/PKG' ] as const
export const PattiesWeight = [ '20lb', '30lb', '40lb', '25%', '33%', '50%' ] as const
export const PattiesAmount = [ '3', '4', '5', '6' ] as const

export type BeefCutInstructions = {
  type: "beef"
  round: { amount: string, tenderized: boolean, size: string, type: string }
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
  round: {
    amount: { type: String, required: true },
    tenderized: { type: Boolean, required: true },
    size: { type: String, required: true },
    type: { type: String, required: true },
  },
  sirlointip: {
    size: { type: String, required: true },
    amount: { type: String, required: true },
    type: { type: String, required: true },
  },
  flank: { type: String },
  sirloin: { 
    size: { type: String, required: true },
    amount: { type: String, required: true },
  },
  tbone: { 
    size: { type: String, required: true },
    amount: { type: String, required: true },
  },
  rump: { type: String },
  pikespeak: { type: String },
  soupbones: { type: String },
  groundbeef: { type: String },
  chuck: { type: String },
  arm: { type: String },
  ribs: { type: String },
  club: {
    type: { type: String, required: true },
    size: { type: String, required: true },
    amount: { type: String, required: true },
  },
  brisket: { type: String },
  stewmeat: { 
    amount: { type: String, required: true },
    size: { type: String, required: true },
  },
  patties: {
    weight: { type: String, required: true },
    amount: { type: String, required: true },
  }
}