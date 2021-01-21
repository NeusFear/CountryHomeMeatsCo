import { data } from "autoprefixer"
import { useEffect, useState } from "react"
import { UserDetails } from "./pages/UsersPage"

//This is just a dummy class to simulate the database for testing
const databaseUsers: UserDetails[] = []

const listeners = []
export const databaseChanged = () => listeners.forEach(l => l())

export const getUserById = (id: number) => databaseUsers.find(d => d.id === id)
export const addUserToDatabase = (details: UserDetails) => {
  databaseUsers.push(details)
  databaseChanged()
}
export const removeUserFromDatabase = (id: number) => {
  databaseUsers.splice(databaseUsers.findIndex(d => d.id === id), 1)
  databaseChanged()
}
export const getNextID = () => {
  for(let i = 0; i <= databaseUsers.length; i++) {
    if(!databaseUsers.some(d => d.id === i)) {
      return i
    }
  }
  //Impossible to get to? would only occur when the database has 2 entries with the same id
}

//React hook to automatically update the state when the database changes
export const useAllUsers = () => {
  const [users, setUsers] = useState(databaseUsers)
  useEffect(() => {
    const listener = () => {
      setUsers([...databaseUsers])
    }
    listeners.push(listener)
    return () => listeners.splice(listeners.indexOf(listener), 1)
  })
  return users
}