import { Model, ObjectId, Query, Types, Document } from "mongoose";
import { ChangeEvent } from "mongodb"
import { list } from "postcss";
import { useEffect, useRef, useState, DependencyList } from "react";
import User, { IUser } from "./types/User";
import { ObjectId as BsonObjectId } from 'bson'
import { ipcRenderer } from "electron";

//Import the mongoose module
const mongoose = require('mongoose')

type ConnectState = { details: string, connected: boolean, address: string }
export const useDatabaseConnection = (ip: string, port: number): ConnectState & { refresh: (ip: string, port: number) => void }  => {
  const [address, setAddress] = useState(`${ip}:${port}`)

  const defaultState = () => {
    return {
      details: "Connecting to database...",
      connected: false,
      address,
    }
  }

  let [connectState, setConnectState] = useState<ConnectState>(defaultState)

  useEffect(() => {
    setConnectState(defaultState)
    mongoose.connect(`mongodb://${address}/`, { useNewUrlParser: true, useUnifiedTopology: true })
    
    const db = mongoose.connection;
    db.on('error', err => setConnectState({ details: `Error: ${err}`, connected: false, address }));
    db.on('disconnected', () => setConnectState({ details: `Connection Closed`, connected: false, address }));
    db.on('connecting', () => setConnectState({ details: `Trying to establish a connection...`, connected: false, address }));
    db.on('open', () => setConnectState({ details: `Connected`, connected: true, address }));
    
    return () => {
      db.removeAllListeners();

      //Bit of a hack here, but essentially set the state to DISCONNECTED on the mongoose connection
      mongoose.connection.readyState = 0
    }
  }, [address])

  return {
    ...connectState,
    refresh: async(ip, port) => {
      ipcRenderer.send("save-default-connection", [ip, port])
      setAddress(`${ip}:${port}`)
    }
  }
}

export const DatabaseWait = "DatabaseHoldValue"

export type DatabaseWaitType = typeof DatabaseWait

export const createResultWatcher = <DocType extends Document,>(model: Model<DocType>):
  <T, >(
    query: Query<T, DocType>,
    deps?: DependencyList | undefined,
    ...ids: (string | ObjectId | BsonObjectId)[]) => T | DatabaseWaitType => {
  const listeners: ((event: ChangeEvent<any>) => void)[] = []
  model.watch().on('change', event => listeners.forEach(l => l(event)))

  const subscribeListener = (listener: (event?: ChangeEvent<any>) => void): () => void => {
    listeners.push(listener)
    listener()
    return () => listeners.splice(listeners.indexOf(listener), 1)
  }

  return <T,>(
    query: Query<T, DocType>,
    deps: DependencyList,
    ...ids: (string | ObjectId | BsonObjectId)[]
  ) => {
    ids = ids.filter(id => {
      if(id == null) {
        return false
      }
      const str = String(id)
      if(str.length != 24 || str.match(/^[0-9a-f]{24}$/) == null) {
        console.error(str + " is not a valid id. Removing...")
        return false
      }
      return true;
    })

    // const projection = query['_fields']
    // if(projection === undefined || Object.keys(projection).length === 0) {
    //   console.warn("Query had no projection. Please call select to select the fields you need.")
    // }

    const [state, setState] = useState<DatabaseWaitType|T>(DatabaseWait)
    useEffect(() => subscribeListener(evt => {
      const any: any = evt
      if (
        ids.length &&
        any &&
        any.documentKey &&
        ids.some(id => id.toString() !== any.documentKey._id.toString())) {
        return
      }
      query.exec().then(d => setState(d))
    }), deps ?? [])
    return state
  }
}
