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

export const validateFreshCuredPart = ({ fresh, cured }: {
  fresh: { amount: string }
  cured: { amount: string }
}) => {
  return (parseInt(fresh.amount) + parseInt(cured.amount)) === 2
}

export type PorkCutInstructions = {
  type: "pork"
  ham: {
    fresh: { amount: string, type: string, cutType: string }
    cured: { amount: string, type: string, cutType: string }
  },
  bacon: {
    fresh: { amount: string, type: string, cutType: string }
    cured: { amount: string, type: string, cutType: string }
  },
  jowl: {
    fresh: { amount: string, type: string }
    cured: { amount: string, type: string }
  },
  loin: {
    fresh: { amount: string, size: string, packageAmount: string }
    cured: { amount: string, size: string, packageAmount: string }
  },
  butt: {
    fresh: { amount: string, type: string, packageAmount: string }
    cured: { amount: string, type: string, packageAmount: string }
  }
  picnic: {
    fresh: { amount: string, type: string, packageAmount: string }
    cured: { amount: string, type: string, packageAmount: string }
  },
  rib: string,
  sausage: string,
  head: boolean,
  feet: boolean,
  heart: boolean,
  fat: boolean  

}