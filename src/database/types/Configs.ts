import { createResultWatcher, DatabaseWait, DatabaseWaitType } from './../Database';
import mongoose, { Schema, Document, SchemaDefinition, DocumentDefinition } from 'mongoose';
import { animalDatabaseName, configDatabaseName } from '../DatabaseNames';

const Configs = ["FullDays", "PriceData", "GlobalNotes"] as const


export type PriceDataNumbers = {
  beef: {
    slaughter: number;
    processing: number;
    patties: number;
    halves: number;
    halvesToQuaters: number;
    extraBoning: number;
    cutStewMeat: number;
    boneAndTenderizeRoundSteaks: number;
    makeCubedSteaks: number;
    boneOutPrimeRib: number;
    boneOutLoin: number;
    minPrice: number;
  };
  pork: {
      slaughter: number;
      slaughterOver150lb: number;
      processing: number;
      cure: number;
      sausage: number;
      minPrice: number;
  };
}

export const PriceDataSchema: SchemaDefinition<DocumentDefinition<any>> = {
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
    boneOutPrimeRib: { type: Number, required: true },
    boneOutLoin: { type: Number, required: true },
    minPrice: { type: Number, required: true },
  }, required: true },
  pork: { type: {
    slaughter: { type: Number, required: true },
    slaughterOver150lb: { type: Number, required: true },
    processing: { type: Number, required: true },
    cure: { type: Number, required: true },
    sausage: { type: Number, required: true },
    minPrice: { type: Number, required: true },
  }, required: true }
}

export interface PriceData extends Document {
  currentPrices: PriceDataNumbers
}

export interface IFullDaysConfig extends Document {
  dates: Date[]
}

export interface IGlobalNotes extends Document {
  globalNotes: string
}

type ConfigTypes<T> = 
  T extends typeof Configs[0] ? IFullDaysConfig :
  T extends typeof Configs[1] ? PriceData :
  T extends typeof Configs[2] ? IGlobalNotes :
  never;

type AllConfigs = IFullDaysConfig & PriceData & IGlobalNotes

const configSchema = new Schema({
  //Full days:
  dates: { type: [Schema.Types.Date] },

  //Price: data
  currentPrices: { type: PriceDataSchema },

  //Global Notes
  globalNotes: { type: String },


})


const ConfigModel = mongoose.model<AllConfigs>(configDatabaseName, configSchema)

const TypeToKey: { [path in typeof Configs[number]]: keyof Omit<ConfigTypes<path>, keyof Document> } = {
  "FullDays": "dates",
  "PriceData": "currentPrices",
  "GlobalNotes": "globalNotes"
}

const useConfigs = createResultWatcher(ConfigModel)

export const useConfig = <T extends typeof Configs[number]>(type: T): ConfigTypes<T> | DatabaseWaitType =>  {
  const configs = useConfigs(ConfigModel.find().select(TypeToKey[type]))
  if(configs === DatabaseWait) {
    return DatabaseWait
  }
  if(configs.length === 0) {
    return new ConfigModel({
      dates: [],

      globalNotes: "",

      currentPrices: {
        beef: {
          slaughter: 75, processing: 1, patties: 0.45, halves: 3, halvesToQuaters: 5,
          extraBoning: 0.2, cutStewMeat: 0.5, boneAndTenderizeRoundSteaks: 3, 
          makeCubedSteaks: 3, boneOutPrimeRib: 5, boneOutLoin: 10, minPrice: 400
        },
        pork: { slaughter: 50, slaughterOver150lb: 60, processing: 1, cure: 1, sausage: 0.25, minPrice: 200 }
      }
    } as AllConfigs) as ConfigTypes<T>
  }
  return configs[0] as ConfigTypes<T>
}
