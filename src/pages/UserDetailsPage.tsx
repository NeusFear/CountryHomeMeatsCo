import * as React from "react"
import * as DummyDatabase from "../DummyDatabase"
import { useHistory } from 'react-router-dom';

export const UserDetailsPage = () => {
  const id = useHistory().location.state
  const user = DummyDatabase.getUserById(id)
  if(user === undefined) {
    return (<div>Error: User with id '{id}' was not found</div>)
  }
  return (
    <div>
      <div>ID: {user.id}</div>
      <div>Name: {user.name}</div>
    </div>
  )
}