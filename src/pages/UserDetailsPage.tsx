import * as React from "react"
import { useHistoryListState } from "../AppHooks"

import * as DummyDatabase from "../DummyDatabase"

export const UserDetailsPage = () => {
  const id = useHistoryListState()
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

