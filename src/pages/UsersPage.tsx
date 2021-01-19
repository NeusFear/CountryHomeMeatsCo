import * as React from "react"

type UserDetails = {
  id: number;
  name: string;  
}
const UserEntry = (details: UserDetails) => {
  return (
    <div>{details.name}</div>
  )
}

export const UsersPage = ({ NavBar }) => {

  const [userDetails, setUserDetails]: [UserDetails[], any] = React.useState<UserDetails[]>([])
  const addUserDetails = (details: UserDetails) => {
    setUserDetails([].concat(details, ...userDetails))
  }

  return (<>
    <div style={{display: "flex"}}>

      <div style={{width: "20%", display: "flex", flexDirection: 'column', height: '100vh'}}>
        <NavBar style={{width: "100%"}} />

        <div style={{backgroundColor: '#15fa66', flexGrow: 1, marginTop: '5px', overflow: 'auto'}}>
          { userDetails && userDetails.map(d => <UserEntry key={d.id} {...d} />) }
        </div>
      </div>

      <div onClick={() => addUserDetails(createDebugUserDetails())}>New User</div>
    </div>
  </>)
}

//Used just for debug stuff
function createDebugUserDetails(): UserDetails {
  return {
    id: Math.random(),
    name: Math.random().toString(36).substring(2)
  }
}