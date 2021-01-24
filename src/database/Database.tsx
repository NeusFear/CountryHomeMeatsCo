import { Model, Document } from "mongoose";
import { ChangeEvent } from "mongodb"
import { list } from "postcss";
import { useEffect, useRef, useState } from "react";
import User, { IUser } from "./types/User";

//Import the mongoose module
const mongoose = require('mongoose')

let connected = false

type ConnectState = { details: string, connected: boolean }
export const connectToDB = (ip: string): ConnectState => {
  let [ connectState,  setConnectState ] = useState<ConnectState>({
    details: "Connecting to database...",
    connected: false
  })

  if(!connected) {
    connected = true
    mongoose.connect(`mongodb://${ip}:27017/`, {useNewUrlParser: true, useUnifiedTopology: true})

    const db = mongoose.connection;
    db.on('error', err => setConnectState({ details: `Error: ${err}`, connected: false }));
    db.on('disconnected', () => setConnectState({details: `Connection Closed`, connected: false }));
    db.on('connecting', () => setConnectState({details: `Trying to establish a connection...`, connected: false }));
    db.on('open', () => setConnectState({details: `Connected`, connected: true }));
  }


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
    modelDataGetter: (param: A) => PromiseLike<T>,
    refreshListener: (listener: (event: ChangeEvent<any>) => void) => void,
    refreshMatcher: (param: A, event: ChangeEvent<any>) => boolean = () => true
  ):
  (param?: A) => T | undefined => {
  return (param) => {
    const update = () => modelDataGetter(param).then(obj => setElement(obj))
    const [element, setElement] = useState<T>(undefined)
    //We need to keep track of the parameter here, as sometimes it can change without a full re-render.
    const prevParam = useRef<A>()
    useEffect(() => {
      if(element === undefined || prevParam.current !== param) {
        update()
      }
      prevParam.current = param
    })
    refreshListener(e => {
      if(refreshMatcher(param, e)) {
        update()
      }
    })
    return element
  }
}
