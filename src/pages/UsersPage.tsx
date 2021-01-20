import * as React from "react"

export const UsersPage = ({ addUserDetails }) => {
  return (<>
    <div onClick={() => addUserDetails(createDebugUserDetails())}>New User</div>
  </>)
}

//Used just for debug stuff
function createDebugUserDetails(): UserDetails {
  return {
    id: Math.random(),
    name: Math.random().toString(36).substring(2)
  }
}

export type UserDetails = {
  id: number;
  name: string;  
}