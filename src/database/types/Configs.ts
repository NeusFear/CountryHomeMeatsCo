import { createResultWatcher } from './../Database';
import mongoose, { Schema, Document } from 'mongoose';

const Configs = ["FullDays"] as const

export interface IFullDaysConfig extends Document {
  configType: typeof Configs[0],
  dates: Date[]
}

type ConfigTypes<T> = 
  T extends typeof Configs[0] ? IFullDaysConfig :
  never;

type AllConfigs = IFullDaysConfig

const configSchema = new Schema({
  configType: { type: String, enum: Configs },

  dates: { type: [Schema.Types.Date] }
})

const ConfigModel = mongoose.model<AllConfigs>('Configs', configSchema)

const useConfigs = createResultWatcher(ConfigModel)

export const useConfig = <T extends typeof Configs[number]>(configType: T): ConfigTypes<T> =>  {
  const configs = useConfigs(ConfigModel.find())
  if(configs === undefined) {
    return undefined
  }
  if(configs.length === 0) {
    return new ConfigModel({
      configType: configType as string,
      dates: []
    } as ConfigTypes<T>) as ConfigTypes<T>
  }
  return configs[0] as ConfigTypes<T>
}
