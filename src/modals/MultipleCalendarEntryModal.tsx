import { ObjectId } from "mongoose"
import { SvgCow, SvgPig, SvgUser } from "../assets/Icons"
import Animal, { AnimalType, IAnimal, useAnimals } from "../database/types/Animal"
import { useHistory } from 'react-router-dom';
import { animalDetailsPage } from "../NavBar";
import User, { useUsers } from "../database/types/User";

export const MultipleCalendarEntryModal = ({ state }:
{ 
  state: { 
    animalIds: ObjectId[], 
    type: AnimalType, 
    day: Date,
    userID: string,
  }
}) => {
  const { animalIds, type, day, userID } = state
  const animals = useAnimals(Animal.where('_id').in(animalIds).select('confirmed'), [JSON.stringify(animalIds)])
  const user = useUsers(User.findById(userID).select('name phoneNumbers'), [userID], userID)

  const confirmAll = () => {
    animals.forEach(a => {
      a.confirmed = true
      a.save()
    })
  }

  if(user === undefined) {
    return (<div>Loading user...</div>)
  }

  if(user === null) {
    return (<div>Error loading user {userID}</div>)
  }

  return (
    <div style={{width:'750px', height:'400px'}}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        <span className="text-gray-300 font-semibold mt-1">Showing Events for {day.getMonth()}/{day.getDate()}/{day.getFullYear()}</span>
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col px-2 pt-1 mt-1 w-1/3 border-r border-black" style={{height: '350px'}}>
          <UserListItem />
          <UserListItem />
          <UserListItem />
        </div>
        <div className="p-2">
          <div>{user.name}</div>
          <div>
            {user.phoneNumbers.map((pn, i) => <div key={i}>{pn.name}: {pn.number}</div>)}
          </div>
          <div className="cursor-pointer mt-5 bg-red-500 hover:bg-red-900" onClick={confirmAll}>Confirm all</div>
          <div className="mt-5">
            {animals === undefined ? 'Loading...' : 
              animals.map((a, i) => <AnimalEntry key={i} animal={a} />)
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const UserListItem = () => {
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent rounded-lg flex flex-row mb-2">
      <div className="w-10">
        <SvgUser className="text-gray-800 group-hover:text-tomato-900 w-3 h-3 ml-2 transform translate-y-1/2" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        Example User
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900 flex flex-row">
        4 <SvgCow className="mt-1 ml-2"/>
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