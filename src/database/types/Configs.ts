import { createResultWatcher } from './../Database';
import mongoose, { Schema, Document } from 'mongoose';

const Configs = ["FullDays", "PriceData"] as const

export interface PriceData extends Document {
  currentPrices: {
    beef: {
      slaughter: number
      processing: number
      patties: number
      halves: number
      halvesToQuaters: number
      extraBoning: number
      cutStewMeat: number
      boneAndTenderizeRoundSteaks: number
      makeCubedSteaks: number
      boneOrPrimeRib: number
      boneOutLoin: number
    },
    pork: {
      slaughter: number,
      slaughter150lb: number,
      processing: number,
      cure: number,
      sausage: number
    }
  }
}

export interface IFullDaysConfig extends Document {
  dates: Date[]
}

type ConfigTypes<T> = 
  T extends typeof Configs[0] ? IFullDaysConfig :
  T extends typeof Configs[1] ? PriceData :
  never;

type AllConfigs = IFullDaysConfig & PriceData

const configSchema = new Schema({
  //Full days:
  dates: { type: [Schema.Types.Date], required: true },

  //Price: data
  currentPrices: { type: {
    beef: { type: {
      slaughter: { type: Number, required: true },
      processing: { type: Number, required: true },
      patties: { type: Number, required: true },
      halves: { type: Number, required: true },
      halvesToQuaters: { type: Number, required: true },
      extraBoning: { type: Number, required: true },
      cutStewMeat: { type: Number, required: true },
      boneAndTenderizeRoundSteaks: { type: Number, required: true },
      makeCubedSteaks: { type: Number, required: true },
      boneOrPrimeRib: { type: Number, required: true },
      boneOutLoin: { type: Number, required: true },
    }, required: true },
    pork: { type: {
      slaughter: { type: Number, required: true },
      slaughter150lb: { type: Number, required: true },
      processing: { type: Number, required: true },
      cure: { type: Number, required: true },
      sausage: { type: Number, required: true },
    }, required: true }
  }, required: true },
  
})

const ConfigModel = mongoose.model<AllConfigs>('Configs', configSchema)

const useConfigs = createResultWatcher(ConfigModel)

export const useConfig = <T extends typeof Configs[number]>(_: T): ConfigTypes<T> | undefined =>  {
  const configs = useConfigs(ConfigModel.find())
  if(configs === undefined) {
    return undefined
  }
  if(configs.length === 0) {
    return new ConfigModel({
      dates: [],

      currentPrices: {
        beef: {
          slaughter: 75, processing: 1, patties: 0.45, halves: 3, halvesToQuaters: 5,
          extraBoning: 0.2, cutStewMeat: 0.5, boneAndTenderizeRoundSteaks: 3, 
          makeCubedSteaks: 3, boneOrPrimeRib: 5, boneOutLoin: 10
        },
        pork: { slaughter: 50, slaughter150lb: 60, processing: 1, cure: 1, sausage: 1 }
      }
    } as AllConfigs) as ConfigTypes<T>
  }
  return configs[0] as ConfigTypes<T>
}
