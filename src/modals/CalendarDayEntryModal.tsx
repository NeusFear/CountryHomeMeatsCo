import { ObjectId } from "mongoose"
import { SvgCow, SvgPig, SvgUser } from "../assets/Icons"
import Animal, { AnimalType, IAnimal, useAnimals } from "../database/types/Animal"
import { useHistory } from 'react-router-dom';
import { animalDetailsPage, userDetailsPage } from "../NavBar";
import User, { IUser, useUsers } from "../database/types/User";
import { useMemo, useState } from "react";
import { AnimalEntriesType } from "../pages/CalendarPage";
import { DatabaseWait } from "../database/Database";
import { formatDay } from "../Util";
import { formatPhoneNumber } from "../Util";

export const CalendarDayModal = ({ state }:
  {
    state: {
      day: Date,
      selectedUserID: string,
      selectedType: AnimalType,
      dayData: AnimalEntriesType
    }
  }) => {
  const history = useHistory()

  const { day, dayData } = state

  const [[selectedUser, selectedType], setSelected] = useState([state.selectedUserID, state.selectedType])

  const users = useMemo(() => dayData.map(d => d.user), [dayData])
  const animalIds = useMemo(() => dayData.map(d => d.ids).reduce((a, b) => a.concat(b)), [dayData])

  const animals = useAnimals(Animal.where('_id').in(animalIds).select('confirmed animalType called'), [animalIds])
  const allUsers = useUsers(User.where('_id').in(users).select('name phoneNumbers emails notes'), [users])

  if (allUsers === DatabaseWait || animals === DatabaseWait) {
    return (<div>Loading users...</div>)
  }

  if (allUsers === null) {
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

  const callAll = () => {
    selectedAnimalModels?.forEach(a => {
      a.called = true
      a.save()
    })
  }

  return (
    <div style={{ width: '750px', height: '400px' }}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        <span className="text-gray-300 font-semibold mt-1">Showing Events for {formatDay(day)}</span>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col px-2 pt-1 mt-1 w-1/3 border-r border-black" style={{ height: '350px' }}>
          {dayData.map(d =>
            <UserListItem
              key={d.user}
              user={allUsers.find(u => u.id === d.user)}
              amount={d.ids.length}
              type={d.type}
              selected={d.user === selectedUser && d.type === selectedType}
              onClick={() => setSelected([d.user, d.type])}
            />
          )}
        </div>
        <div className="w-1/3 p-2 border-r border-black flex flex-col">
          <div className="font-bold">{selectedUserModel.name}</div>
          <div className="flex-grow">
            <div className="my-2">
              {selectedUserModel.phoneNumbers.map((pn, i) => <div className="flex flex-row" key={i}><p className="flex-grow">{pn.name}:</p>{formatPhoneNumber(pn.number)}</div>)}
            </div>
            {selectedUserModel.emails.map((em, i) => <div key={i}>{em}</div>)}
            {selectedUserModel.notes}
          </div>
          <div className="cursor-pointer mt-5 bg-green-200 hover:bg-green-300 rounded-sm px-2 shadow text-center" onClick={() => history.push(userDetailsPage, selectedUser)}>Go to User</div>
        </div>
        <div className="w-1/3 p-2">
          <div className="cursor-pointer mt-1 bg-gray-200 hover:bg-gray-300 rounded-sm px-2 shadow" onClick={callAll}>Mark all Called</div>
          <div className="cursor-pointer mt-1 bg-gray-200 hover:bg-gray-300 rounded-sm px-2 shadow" onClick={confirmAll}>Confirm all</div>
          <div className="mt-5">
            {selectedAnimalModels === undefined ? 'Loading...' :
              selectedAnimalModels.map((a, i) => <AnimalEntry key={i} animal={a} />)
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const UserListItem = ({ user, amount, type, selected, onClick }: { user: IUser, amount: number, type: AnimalType, selected: boolean, onClick: () => void }) => {
  const Icon = type === AnimalType.Beef ? SvgCow : SvgPig
  return (
    <div onClick={onClick} className={`group bg-${selected ? 'blue' : 'gray'}-100 shadow-sm hover:shadow-lg hover:border-transparent rounded-lg flex flex-row mb-2`}>
      <div className="w-10">
        <SvgUser className="text-gray-800 group-hover:text-tomato-900 w-3 h-3 ml-2 transform translate-y-1/2" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        {user.name}
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900 flex flex-row">
        {amount} <Icon className="mt-1 ml-2" />
      </div>
    </div>
  )
}

const AnimalEntry = ({ animal }: { animal: IAnimal }) => {

  const history = useHistory()

  const confirmedClasses = "bg-green-200 hover:bg-green-300 mr-1"
  const unconfirmedClasses = "bg-tomato-200 hover:bg-tomato-300 mr-1"

  const toggleConfirmation = () => {
    animal.confirmed = !animal.confirmed
    animal.save()
  }

  const toggleCalled = () => {
    animal.called = !animal.called
    animal.save()
  }

  return (
    <div className="cursor-pointer rounded-sm shadow px-2 hover:bg-gray-200 mb-1">
      <div className="flex flex-row" onClick={() => history.push(animalDetailsPage, animal.id)}>
        <p className="flex-grow text-xs font-bold">{animal.animalType === AnimalType.Beef ? "Beef " : "Pork "}</p>
        <div className={`text-xs rounded-sm shadow text-center mt-0.5 px-1 + ${animal.called ? confirmedClasses : unconfirmedClasses}`}
          onClick={e => {
            toggleCalled()
            e.stopPropagation()
          }}>{animal.called ? 'Called' : 'Not Called'}</div>
        <div className={`text-xs rounded-sm shadow text-center mt-0.5 px-1 + ${animal.confirmed ? confirmedClasses : unconfirmedClasses}`}
          onClick={e => {
            toggleConfirmation()
            e.stopPropagation()
          }}>{animal.confirmed ? 'Confirmed' : 'Not Confirmed'}</div>
      </div>
      <p className="text-xs">ID: {animal.id}</p>
    </div>
  )
}