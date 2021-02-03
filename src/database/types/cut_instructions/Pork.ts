export const ZeroOneTwo = ["0", "1", "2"] as const
export const HamType = ["Whole", "2 Pieces", "Ends For Roast", "Shank For Roast"] as const
export const HamCutType = ['centers/buttEnd/sliceAll', '.5"', '2 / Package'] as const
export const FreshBaconType = ["Slice Fresh", "Grind"] as const
export const CuredBaconType = ["Regular", "Thick", "Thin"] as const
export const BaconWeight = ["1.0lb", "1.5lb", "2.0lb"] as const
export const FreshJowlType = ["Grind", "Whole", "Slice"] as const
export const CuredJowlType = ["Chunk", "Whole", "Slice"] as const
export const LoinSize = ['.5"', '.75"', '1"', '1.25"'] as const
export const LoinPackageAmount = ["2", "3", "4", "5", "6"] as const
export const CuredPicnicType = ['3lb Roast', '4lb Roast', '5lb Roast', '2 Packs', 'Whole', '.5"', '.75"'] as const
export const FreshPicnicType = [...CuredPicnicType, "Grind"] as const
export const FreshButtType = ['CSRibs', ...FreshPicnicType] as const
export const CuredButtType = ['CSRibs', ...CuredPicnicType] as const
export const TwoThreeFour = ["2", "3", "4"] as const
export const Rib = ["Whole", "Split"] as const
export const Sausage = ["Regular", "Hot", "No Seasoning", "No Preservatives"]

export type PorkCutInstructions = {
  type: "pork"
  ham: {
    fresh: { amount: typeof ZeroOneTwo[number], type: typeof HamType[number], cutType: typeof HamCutType[number] }
    cured: { amount: typeof ZeroOneTwo[number], type: typeof HamType[number], cutType: typeof HamCutType[number] }
  },
  bacon: {
    fresh: { amount: typeof ZeroOneTwo[number], type: typeof FreshBaconType[number], cutType: typeof BaconWeight[number] }
    cured: { amount: typeof ZeroOneTwo[number], type: typeof CuredBaconType[number], cutType: typeof BaconWeight[number] }
  },
  jowl: {
    fresh: { amount: typeof ZeroOneTwo[number], type: typeof FreshJowlType[number] }
    cured: { amount: typeof ZeroOneTwo[number], type: typeof CuredJowlType[number] }
  },
  loin: {
    fresh: { amount: typeof ZeroOneTwo[number], size: typeof LoinSize[number], packageAmount: typeof LoinPackageAmount[number] }
    cured: { amount: typeof ZeroOneTwo[number], size: typeof LoinSize[number], packageAmount: typeof LoinPackageAmount[number] }
  },
  butt: {
    fresh: { amount: typeof ZeroOneTwo[number], type: typeof FreshButtType[number], packageAmount: typeof TwoThreeFour[number] }
    cured: { amount: typeof ZeroOneTwo[number], type: typeof CuredButtType[number], packageAmount: typeof TwoThreeFour[number] }
  }
  picnic: {
    fresh: { amount: typeof ZeroOneTwo[number], type: typeof FreshPicnicType[number], packageAmount: typeof TwoThreeFour[number] }
    cured: { amount: typeof ZeroOneTwo[number], type: typeof CuredPicnicType[number], packageAmount: typeof TwoThreeFour[number] }
  },
  rib: typeof Rib[number],
  sausage: typeof Sausage[number],
  head: boolean,
  feet: boolean,
  heart: boolean,
  fat: boolean  

}