import * as React from "react"
import * as DummyDatabase from "../DummyDatabase"
const UserEntry = ({ details, addPinnedUserDetails, deleteUserDetails }: {details: UserDetails, addPinnedUserDetails: (id: number) => void, deleteUserDetails: (id: number) => void}) => {
  return (
    <div>
      <span className="pr-2">{details.id}</span>
      <span className="pr-2">{details.name}</span>
      <span className="bg-indigo-100" onClick={() => addPinnedUserDetails(details.id)}>
        Pin On Left
      </span>
      <span className="bg-indigo-500" onClick={() => deleteUserDetails(details.id)}>
        Delete
      </span>
    </div>
  )
}
export const UsersPage = ({ addPinnedUserDetails, removePinned }: { addPinnedUserDetails:(id:number)=>void, removePinned:(id:number)=>void }) => {
  let users = DummyDatabase.useAllUsers()

  let deleteEntry = (id: number) => {
    DummyDatabase.removeUserFromDatabase(id)
    removePinned(id)
  }

  return (<>
    <div className="bg-red-200" onClick={() => DummyDatabase.addUserToDatabase(createDebugUserDetails())}>New User</div>
    <div>
      { users.map(d => <UserEntry key={d.name} details={d} addPinnedUserDetails={addPinnedUserDetails} deleteUserDetails={deleteEntry} />)}
    </div>
  </>)
}

//Used just for debug stuff
let debugCounter = 0
function createDebugUserDetails(): UserDetails {
  let id = debugCounter++
  return {
    id,
    name: ["Mr", "Mrs", "Ms", "Dr"][Math.floor(4*Math.random())] + " " + [
       "order", "credibility", "remain", "steam", "exaggerate", "explode", "abundant", "rhythm", 
       "rare", "prescription", "damn", "bee", "wall", "arm", "compete", "football", "justify", 
       "pumpkin", "reduction", "cupboard", "criticism", "blast", "series", "stumble", "agency", 
       "cower", "pluck", "member", "branch", "excitement", "row", "squeeze"
    ][Math.floor(32*Math.random())]
  }
}

export type UserDetails = {
  id: number;
  name: string;  
}