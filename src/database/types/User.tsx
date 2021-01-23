import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { ChangeEventUpdate } from "mongodb"

import { createGetElement, createRefreshListener } from '../Database';
import { ChangeEvent } from 'react';

export interface IUser extends Document {
  name: string
  phoneNumbers: { name: string, number: Number }[]
  emails: string[]
}

const userSchmea = new Schema({
  name: { type: String, required: true },
  phoneNumbers: { type: [{ name: String, number: Number }], required: true },
  emails: {type: [String], required: true }
});

const User = mongoose.model<IUser>('User', userSchmea)

const refreshListener = createRefreshListener(User)
export const useUserById = createGetElement<IUser, string>(
  id => User.findById(id), 
  refreshListener, 
  (param, evt) => {
    const any: any = evt
    if(any.documentKey) {
      return param === any.documentKey._id.toString()
    }
    return false
  }
)
export const useAllUsers = createGetElement<Array<IUser>, any>(() => User.find(), refreshListener)
export default User