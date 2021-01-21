import * as React from "react"
import { UserPinnedList } from "../App"
import { useHistory } from 'react-router-dom';
import * as DummyDatabase from "../DummyDatabase"
import { editUserDetailsPage, userDetailsPage } from "../NavBar";

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
    <div className="bg-red-200" onClick={() => history.push(editUserDetailsPage, /*In production, don't have this*/createDebugUserDetails())}>New User</div>
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
