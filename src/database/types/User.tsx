import mongoose, { Schema, Document } from 'mongoose';

import { createGetElement, createRefreshListener } from '../Database';

export interface IUser extends Document {
  name: string
  phoneNumbers: { name: string, number: string }[]
  emails: string[]
}

const userSchmea = new Schema({
  name: { type: String, required: true },
  phoneNumbers: { type: [{ name: String, number: String }], required: true },
  emails: {type: [String], required: true }
});

const User = mongoose.model<IUser>('User', userSchmea)

export const createEmptyUser = (): IUser => {
  return new User({
    name: '',
    phoneNumbers: [{ name: '', number:'' }],
    emails: ['']
  })
}

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