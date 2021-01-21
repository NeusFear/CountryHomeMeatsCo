import * as React from "react"
import { UserPinnedList } from "../App"
import { useHistory } from 'react-router-dom';
import * as DummyDatabase from "../DummyDatabase"
import { editUserDetailsPage, userDetailsPage } from "../NavBar";
import { SvgNewUser, SvgSearch } from "../assets/Icons";

const UserEntry = ({ details, addPinnedUserDetails, deleteUserDetails }: {details: UserDetails, addPinnedUserDetails: (id: number) => void, deleteUserDetails: (id: number) => void}) => {
  const history = useHistory()
  return (
    <div className="hover:bg-indigo-300" onClick={() => history.push(userDetailsPage, details.id)}>
      <span className="pr-2">{details.id}</span>
      <span className="pr-2">{details.name}</span>
      <span className="bg-indigo-100" onClick={e => {addPinnedUserDetails(details.id); e.stopPropagation()}}>
        Pin On Left
      </span>
      <span className="bg-indigo-500" onClick={e => {deleteUserDetails(details.id); e.stopPropagation()}}>
        Delete
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

  return (<>
    <div className="bg-gray-800 py-2 px-4 flex flex-row">
      <div className="relative rounded-md shadow-sm w-11/12">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">
            <SvgSearch />
          </span>
        </div>
        <input type="text" name="search" id="search" className="block w-5/6 pl-9 pr-12 border-gray-300 rounded-md h-10" placeholder="Search" />
      </div>
      <div className="transform -translate-x-64 cursor-pointer px-4 w-12 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgSearch /></div>
      <div className="transform -translate-x-60 cursor-pointer px-4 w-12 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white" onClick={() => history.push(editUserDetailsPage, /*In production, don't have this*/createDebugUserDetails())}><SvgNewUser /></div>
    </div>
    <div>
      { users.map(d => <UserEntry key={d.name} details={d} addPinnedUserDetails={id => pinnedList.updatePinned(id, true)} deleteUserDetails={deleteEntry} />)}
    </div>
  </>)
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
