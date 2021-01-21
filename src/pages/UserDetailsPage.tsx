import * as React from "react"
import { useHistoryListState } from "../AppHooks"
import { useHistory } from 'react-router-dom';

import * as DummyDatabase from "../DummyDatabase"
import { editUserDetailsPage } from "../NavBar";
import { SvgEdit, SvgEmail, SvgPhone, SvgUser } from "../assets/Icons";

export const UserDetailsPage = () => {
  const history = useHistory()
  const id = useHistoryListState()
  const user = DummyDatabase.useUserById(id)
  if(user === undefined) {
    return (<div>Error: User with id '{id}' was not found</div>)
  }
  return (
    <div className="w-full h-screen">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-2">{user.name.toUpperCase()}</div>
        <div className="text-gray-700 ml-1 text-xl">#</div>
        <div className="text-gray-700 ml-1 text-3xl">{user.id}</div>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full h-5/6 px-4 py-2">
        <div className="flex flex-col">
          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Contact Information</div>
              <SvgEdit className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => history.push(editUserDetailsPage, id)}/>
            </div>
            <div className="bg-white rounded-md p-2 mx-4 mb-1 mt-4 flex flex-row"><SvgUser className="mt-1 mr-1 text-gray-400" />{user.name}</div>
            <div className="bg-white rounded-md p-2 mx-4 mb-1 flex flex-row"><SvgPhone className="mt-1 mr-1 text-gray-400" />{user.phoneNum}</div>
            <div className="bg-white rounded-md p-2 mx-4 mb-4 flex flex-row"><SvgEmail className="mt-1 mr-1 text-gray-400" />{user.email}</div>
          </div>
          <div className="bg-gray-200 flex-grow mt-4 rounded-lg">cut insttructions</div>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-gray-200 rounded-lg">queue & history</div>
          <div className="bg-gray-200 rounded-lg">pickup</div>
          <div className="bg-gray-200 rounded-lg">invoices</div>
        </div>
      </div>
    </div>
  )
}
