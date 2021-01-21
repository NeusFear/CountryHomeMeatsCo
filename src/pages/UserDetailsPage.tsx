import * as React from "react"
import { useHistoryListState } from "../AppHooks"
import { useHistory } from 'react-router-dom';

import * as DummyDatabase from "../DummyDatabase"
import { editUserDetailsPage } from "../NavBar";

export const UserDetailsPage = () => {
  const history = useHistory()
  const id = useHistoryListState()
  const user = DummyDatabase.getUserById(id)
  if(user === undefined) {
    return (<div>Error: User with id '{id}' was not found</div>)
  }
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div className="col-span-3 w-full h-14 bg-gray-800">
        <div>ID: {user.id}</div>
        <div>Name: {user.name}</div>
      </div>
      <div className="flex flex-col">
        <div className="bg-tomato-400" onClick={() => history.push(editUserDetailsPage, id)}>edit</div>
        <div className="bg-tomato-600 flex-grow mt-4">cut insttructions</div>
      </div>
      <div className="col-span-2 grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-green-400">queue history</div>
        <div className="bg-blue-300">pickup</div>
        <div className="bg-blue-600">invoices</div>
      </div>
    </div>
  )
}
