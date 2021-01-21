import * as React from "react"
import { UserPinnedList } from "../App"
import { useHistory } from 'react-router-dom';
import * as DummyDatabase from "../DummyDatabase"
import { editUserDetailsPage, userDetailsPage } from "../NavBar";
import { SvgNewUser, SvgSearch, SvgTack, SvgTrash } from "../assets/Icons";

const UserEntry = ({ details, addPinnedUserDetails, deleteUserDetails }: {details: UserDetails, addPinnedUserDetails: (id: number) => void, deleteUserDetails: (id: number) => void}) => {
  const history = useHistory()
  return (
    <div key={details.id} className="bg-gray-100 hover:shadow-md rounded-lg px-2 py-2 shadow-sm flex flex-row mb-2" onClick={() => history.push(userDetailsPage, details.id)}>
      <span className="pr-2 flex-1">{details.name}<span className="text-gray-500 ml-1">#{details.id}</span></span>
      <span className="pr-2 flex-1">{details.phoneNum}</span>
      <span className="pr-2 flex-1">{details.email}</span>
      <span className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-2 flex-shrink pt-1.5" onClick={e => {addPinnedUserDetails(details.id); e.stopPropagation()}}>
        <SvgTack />
      </span>
      <span className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-1 flex-shrink pt-1" onClick={e => {deleteUserDetails(details.id); e.stopPropagation()}}>
        <SvgTrash />
      </span>
    </div>
  )
}

export const UsersPage = ({ pinnedList }: { pinnedList: UserPinnedList }) => {
  const users = DummyDatabase.useAllUsers()
  const history = useHistory()

  const deleteEntry = (id: number) => {
    DummyDatabase.removeUserFromDatabase(id)
    pinnedList.updatePinned(id, false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 py-2 px-2 flex flex-row justify-end">
        <div className="relative rounded-md shadow-sm flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">
              <SvgSearch />
            </span>
          </div>
          <input type="text" name="search" id="search" className="block w-full pl-9 pr-12 border-gray-300 rounded-md h-10" placeholder="Search" />
        </div>
        <div className="transform cursor-pointer px-4 w-12 ml-1 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgSearch /></div>
        <div className="transform cursor-pointer px-4 w-12 ml-1 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white" onClick={() => history.push(editUserDetailsPage, /*In production, don't have this*/createDebugUserDetails())}><SvgNewUser /></div>
      </div>
      <div className="bg-gray-400 px-1 py-0.5 shadow-sm flex flex-row mb-2">
        <span className="ml-6 pr-2 flex-1 text-gray-700">Name<span className="text-gray-600 ml-1">#ID</span></span>
        <span className="pr-2 flex-1 text-gray-700 ml-2">Phone Number</span>
        <span className="pr-2 flex-1 text-gray-700 ml-4">Email</span>
        <span className="w-24"></span>
      </div>
      <div className="px-4 mt-4 h-full overflow-y-scroll">
        { users.map(d => <UserEntry key={d.name} details={d} addPinnedUserDetails={id => pinnedList.updatePinned(id, true)} deleteUserDetails={deleteEntry} />)}
      </div>
    </div>
  )
}

export type UserDetails = {
  id: number;
  name: string;
  phoneNum: string;
  email: string;
}

//Creates a debug user info, used for testing as it makes it quicker.
function createDebugUserDetails(): number {
  let id = DummyDatabase.getNextID()
  DummyDatabase.addUserToDatabase({
    id,
    name: ["Mr", "Mrs", "Ms", "Dr"][Math.floor(4*Math.random())] + " " + [
       "order", "credibility", "remain", "steam", "exaggerate", "explode", "abundant", "rhythm", 
       "rare", "prescription", "damn", "bee", "wall", "arm", "compete", "football", "justify", 
       "pumpkin", "reduction", "cupboard", "criticism", "blast", "series", "stumble", "agency", 
       "cower", "pluck", "member", "branch", "excitement", "row", "squeeze"
    ][Math.floor(32*Math.random())],
    phoneNum: Math.floor(1000000000 + Math.random()*8999999999).toString(),
    email: Math.random().toString(36).substring(7) + "@someemail.com"
  })
  return id
}
