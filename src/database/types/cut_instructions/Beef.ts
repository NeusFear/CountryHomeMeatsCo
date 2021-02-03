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
  round: { amount: typeof RoundAmount[number], tenderized: boolean, size: typeof RoundSize[number], type: typeof HamCf[number] }
  sirlointip: { size: typeof SirloinTipSize[number], amount: typeof OneFourAmount[number], type: typeof HamCf[number] }
  flank: typeof HamCfWhole[number]
  sirloin: { size: typeof Point5OnePoint5Size[number], amount: typeof OneFourAmount[number] }
  tbone: { size: typeof Point5OnePoint5Size[number], amount: typeof OneFourAmount[number] }
  rump: typeof TwoLB4LBWeight[number]
  pikespeak: typeof TwoLB4LBWeight[number]
  soupbones: typeof SoupBones[number]
  groundbeef: typeof GroupBeef[number]
  chuck: typeof TwoLB4LBWeight[number]
  arm: typeof TwoLB4LBWeight[number]
  ribs: typeof Ribs[number]
  club: { type: typeof ClubType[number], size: typeof Point5OnePoint5Size[number], amount: typeof OneFourAmount[number] }
  brisket: typeof Brisket[number]
  stewmeat: { amount: typeof StewmeatAmount[number], size: typeof StewmeatSize[number] }
  patties: { weight: typeof PattiesWeight[number], amount: typeof PattiesAmount[number] }
}

export const BeefCutInstructionsSchema: SchemaDefinition = {
  round: {
    amount: { type: String, enum: RoundAmount, required: true },
    tenderized: { type: Boolean, required: true },
    size: { type: String, enum: RoundSize, required: true },
    type: { type: String, enum: HamCf, required: true },
  },
  sirlointip: {
    size: { type: String, enum: SirloinTipSize, required: true },
    amount: { type: String, enum: OneFourAmount, required: true },
    type: { type: String, enum: HamCf, required: true },
  },
  flank: { type: String, enum: HamCfWhole },
  sirloin: { 
    size: { type: String, enum: Point5OnePoint5Size, required: true },
    amount: { type: String, enum: OneFourAmount, required: true },
  },
  tbone: { 
    size: { type: String, enum: Point5OnePoint5Size, required: true },
    amount: { type: String, enum: OneFourAmount, required: true },
  },
  rump: { type: String, enum: TwoLB4LBWeight },
  pikespeak: { type: String, enum: TwoLB4LBWeight },
  soupbones: { type: String, enum: SoupBones },
  groundbeef: { type: String, enum: GroupBeef },
  chuck: { type: String, enum: TwoLB4LBWeight },
  arm: { type: String, enum: TwoLB4LBWeight },
  ribs: { type: String, enum: Ribs },
  club: {
    type: { type: String, enum: ClubType, required: true },
    size: { type: String, enum: Point5OnePoint5Size, required: true },
    amount: { type: String, enum: OneFourAmount, required: true },
  },
  brisket: { type: String, enum: Brisket },
  stewmeat: { 
    amount: { type: String, enum: StewmeatAmount, required: true },
    size: { type: String, enum: StewmeatSize, required: true },
  },
  patties: {
    weight: { type: String, enum: PattiesWeight, required: true },
    amount: { type: String, enum: PattiesAmount, required: true },
  }
}