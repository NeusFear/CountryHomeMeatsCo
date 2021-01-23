import { Model, Document } from "mongoose";
import { ChangeEvent } from "mongodb"
import { list } from "postcss";
import { useEffect, useState } from "react";
import User, { IUser } from "./types/User";

//Import the mongoose module
const mongoose = require('mongoose')

let connected = false

type ConnectState = { details: string, connected: boolean }
export const connectToDB = (ip: string): ConnectState => {
  if(!connected) {
    connected = true
    mongoose.connect(`mongodb://${ip}:27017/`, {useNewUrlParser: true, useUnifiedTopology: true})
  }
  let [ connectState,  setConnectState ] = useState<ConnectState>({
    details: "Connecting to database...",
    connected: false
  })

  const db = mongoose.connection;
  db.on('error', err => setConnectState({
    details: `Error: ${err}`,
    connected: false
  }));
  db.once('open', function() {
    setConnectState({
      details: `Conneted`,
      connected: true
    })
  });

  return connectState
}

export const createRefreshListener = (model: Model<any>): (listener: (event: ChangeEvent<any>) => void) => void => {
  const listeners: ((event: ChangeEvent<any>) => void)[] = []
  model.watch().on('change', event => listeners.forEach(l => l(event)))

  return (listener) => {
    useEffect(() => {
      listeners.push(listener)
      return () => listeners.splice(listeners.indexOf(listener), 1)
    })
  }
}

export const createGetElement = 
  <T, A>
  (
    modelDataGetter: (param: A) => Promise<T>,
    refreshListener: (listener: (event: ChangeEvent<any>) => void) => void,
    refreshMatcher: (param: A, event: ChangeEvent<any>) => boolean = () => true
  ):
  (param?: A) => T | undefined => {
  return (param) => {
    const update = () => modelDataGetter(param).then(obj => setElement(obj))
    const [element, setElement] = useState<T>(undefined)
    if(element === undefined) {
      update()
    }
    refreshListener(e => {
      console.log(e)
      if(refreshMatcher(param, e)) {
        update()
      }
    })
    return element
  }
}
