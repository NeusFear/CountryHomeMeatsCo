import * as React from 'react'

export const UsersPage = ({ NavBar }) => {
  return (<>
    <div style={{display: "flex"}}>
      <div style={{width: "20%", display: "flex", flexDirection: 'column', height: '100vh'}}>
        <NavBar widthHandled={true} />
        <div style={{backgroundColor: '#15fa66', flexGrow: 1, marginTop: '5px'}}>
          AA
        </div>
      </div>
      <div onClick={() => console.log("clicked")}>New User</div>
    </div>
  </>)
}