import { ObjectId } from "mongoose"
import { SvgCow, SvgPig, SvgUser } from "../assets/Icons"
import Animal, { AnimalType, IAnimal, useAnimals } from "../database/types/Animal"
import { useHistory } from 'react-router-dom';
import { animalDetailsPage } from "../NavBar";
import User, { IUser, useUsers } from "../database/types/User";
import { useMemo, useState } from "react";
import { AnimalEntriesType } from "../pages/CalendarPage";
import { DatabaseWait } from "../database/Database";

export const CalendarDayModal = ({ state }:
{ 
  state: { 
    day: Date,
    selectedUserID: string,
    selectedType: AnimalType,
    dayData: AnimalEntriesType
  }
}) => {
  const { day, dayData } = state

  const [ [selectedUser, selectedType], setSelected ] = useState([state.selectedUserID, state.selectedType])

  const users = useMemo(() => dayData.map(d => d.user), [dayData])
  const animalIds = useMemo(() => dayData.map(d => d.ids).reduce((a, b) => a.concat(b)), [dayData])

  const animals = useAnimals(Animal.where('_id').in(animalIds).select('confirmed'), [animalIds])
  const allUsers = useUsers(User.where('_id').in(users).select('name phoneNumbers'), [users])

  if(allUsers === DatabaseWait || animals === DatabaseWait) {
    return (<div>Loading users...</div>)
  }

  if(allUsers === null) {
    return (<div>Error loading users</div>)
  }

  const selectedTarget = dayData.find(d => d.user === selectedUser && d.type === selectedType)
  const selectedAnimalIDs = selectedTarget?.ids
  const selectedUserModel = allUsers.find(u => u.id === selectedUser)
  const selectedAnimalModels = selectedAnimalIDs === undefined ? undefined : animals.filter(a => selectedAnimalIDs.includes(a.id))

  const confirmAll = () => {
    selectedAnimalModels?.forEach(a => {
      a.confirmed = true
      a.save()
    })
  }

  return (
    <div style={{width:'750px', height:'400px'}}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        <span className="text-gray-300 font-semibold mt-1">Showing Events for {day.getMonth()}/{day.getDate()}/{day.getFullYear()}</span>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col px-2 pt-1 mt-1 w-1/3 border-r border-black" style={{height: '350px'}}>
          { dayData.map(d => 
            <UserListItem 
              key={d.user} 
              user={allUsers.find(u => u.id === d.user)} 
              amount={d.ids.length} 
              type={d.type}
              selected={d.user === selectedUser && d.type === selectedType}
              onClick={() => setSelected([d.user, d.type])}
            /> 
          ) }
        </div>
        { selectedUser && 
          <div className="p-2">
            <div>{selectedUserModel.name}</div>
            <div>
              {selectedUserModel.phoneNumbers.map((pn, i) => <div key={i}>{pn.name}: {pn.number}</div>)}
            </div>
            <div className="cursor-pointer mt-5 bg-red-500 hover:bg-red-900" onClick={confirmAll}>Confirm all</div>
            <div className="mt-5">
              {selectedAnimalModels === undefined ? 'Loading...' : 
                selectedAnimalModels.map((a, i) => <AnimalEntry key={i} animal={a} />)
              }
            </div>
          </div>
        }
      </div>
    </div>
  )
}

const UserListItem = ({user, amount, type, selected, onClick}: {user: IUser, amount: number, type: AnimalType, selected: boolean, onClick: ()=>void}) => {
  const Icon = type === AnimalType.Beef ? SvgCow : SvgPig
  return (
    <div onClick={onClick} className={`group bg-${selected?'blue':'gray'}-100 shadow-sm hover:shadow-lg hover:border-transparent rounded-lg flex flex-row mb-2`}>
      <div className="w-10">
        <SvgUser className="text-gray-800 group-hover:text-tomato-900 w-3 h-3 ml-2 transform translate-y-1/2" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        {user.name}
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900 flex flex-row">
        {amount} <Icon className="mt-1 ml-2"/>
      </div>
    </div>
  )
}

const AnimalEntry = ({animal}: {animal: IAnimal}) => {
  const history = useHistory()
  return (
    <div className={`cursor-pointer 
      bg-${animal.confirmed?'green':'tomato'}-500
      hover:bg-${animal.confirmed?'green':'tomato'}-700
    `} onClick={() => history.push(animalDetailsPage, animal.id)}>
      Confirmed: {animal.confirmed?'Yes':'No'}
    </div>
  )
}