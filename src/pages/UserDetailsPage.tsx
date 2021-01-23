import * as React from "react"
import { useHistoryListState } from "../AppHooks"
import { useHistory } from 'react-router-dom';

import { editUserDetailsPage } from "../NavBar";
import { SvgEdit, SvgEmail, SvgNew, SvgPhone, SvgTack, SvgUser } from "../assets/Icons";
import { useUserById } from "../database/types/User";
import { UserPinnedList } from "../App";

export const UserDetailsPage = ({ pinnedList }: { pinnedList: UserPinnedList }) => {
  const history = useHistory()
  const id = useHistoryListState()
  const user = useUserById(id)
  if(user === undefined) {
    return (<div>Loading Info for user id {id}</div>)
  }
  if(user === null) {
    return (<div>Error finding Info for user id {id}</div>)
  }

  const PhoneNumber = ({name, number}: {name: string, number: string}) => (<div>{name}: {number}</div>)
  const Email = ({email}: {email: string}) => (<div>{email}</div>)

  return (
    <div className="w-full h-screen">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">{user.name.toUpperCase()}</div>
        <div className="text-gray-700 ml-1 text-xl">#</div>
        <div className="text-gray-700 ml-1 text-3xl">{user.id}</div>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full h-5/6 px-4 py-2">
        <div className="flex flex-col">

          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Contact Information</div>
              <SvgTack className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => pinnedList.updatePinned(id, true)}/>
              <SvgEdit className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => history.push(editUserDetailsPage, id)}/>
            </div>
            <div className="bg-white rounded-md p-2 mx-4 mb-1 mt-4 flex flex-row"><SvgUser className="mt-1 mr-1 text-gray-400" />{user.name}</div>
            <div className="bg-white rounded-md p-2 mx-4 mb-1 flex flex-row"><SvgPhone className="mt-1 mr-1 text-gray-400" />
              <div className="flex flex-col">
                {user.phoneNumbers.map((ph, idx) => <PhoneNumber key={idx} name={ph.name} number={ph.number} />)}
              </div>
            </div>
            <div className="bg-white rounded-md p-2 mx-4 mb-4 flex flex-row"><SvgEmail className="mt-1 mr-1 text-gray-400" />
              <div className="flex flex-col">
                {user.emails.map((e, idx) => <Email key={idx} email={e}/>)}
              </div>
            </div>
          </div>

          <div className="bg-gray-200 rounded-lg flex-grow mt-4">
            <div className="bg-gray-700 p-1 mb-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Record Sheets</div>
              <SvgNew className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => console.log("new cut instructions modal")}/>
            </div>
          </div>

        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">

          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Animals Brought</div>
              <SvgNew className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => console.log("queue new animal info")}/>
            </div>
          </div>

          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-1 rounded-t-lg">
              <div className="text-gray-200 pl-4 font-semibold">Invoices</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
