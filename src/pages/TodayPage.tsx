import { ObjectId } from "mongoose"
import ReactTooltip from "react-tooltip"
import { useHistory } from 'react-router-dom';
import { SvgCow, SvgEdit, SvgPig, SvgPrint } from "../assets/Icons"
import Animal, { IAnimal, useAnimals, validateEaters } from "../database/types/Animal"
import User, { IUser, useUsers } from "../database/types/User"
import { hangingAnimals, scheduleAnimal, setModal } from "../modals/ModalManager"
import { SchueduleAnimalModal } from "../modals/ScheduleAnimalModal"
import { getDayNumber, printPage } from "../Util"
import { userDetailsPage, animalDetailsPage } from "../NavBar";
import { useMemo } from "react";

export const TodayPage = () => {
  const today = useMemo(() => new Date(), [])
  return (
    <div className="w-full h-screen">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">TODAY</div>
        <div className="text-gray-700 ml-1 text-3xl">
          {(today.getMonth()+1).toString().padStart(2, '0')}
          /
          {today.getDate().toString().padStart(2, '0')}
          /
          {today.getFullYear()}</div>
      </div>
      <div className="flex flex-row w-full h-full">
        <TodaysCutList />
        <ScheduledSlaughterList />
      </div>
    </div>
  )
}

const TodaysCutList = () => {
  const animals = useAnimals(Animal
    .where('processDate').ne(null)
    .where('pickedUp', false)
  )?.filter(validateEaters) //TODO remove this comment when the eaters are added 
  return (
    <div className="h-5/6 flex-grow pl-4 pr-2 py-4">
      <div className="h-5/6 bg-gray-200 rounded-lg">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Cut List</div>
          <SvgPrint className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => printPage("test.pdf")}/>
          <SvgEdit className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => setModal(hangingAnimals)}/>
        </div>
        {animals && animals.map(a => <SelectedCutList key={a.id} animal={a} />)}
      </div>
    </div>
  )
}

const SelectedCutList = ({animal}: {animal: IAnimal}) => {
  const allUsers = useMemo(() => [animal.bringer, ...animal.eaters.map(e => e.id)], [animal])
  const allFoundUsers = useUsers(User.where('_id').in(allUsers))

  const mainUser = allFoundUsers === undefined ? undefined :allFoundUsers.find(u => u.id === animal.bringer.toHexString())

  if(mainUser === undefined) {
    return (<div>Loading...</div>)
  }
  if(mainUser === null) {
    return (<div>Problem loading user with ID {animal.bringer.toHexString()}</div>)
  }

  const Tag = animal.animalType === "Cow" ? SvgCow : SvgPig
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => console.log("go to animal")}>
      <div className="w-20">
        <Tag className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-0.5 ml-4 transform translate-y-1/2" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag user={mainUser} />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Eaters:</p>
        {animal.eaters.map((eater, i) => <UserTag key={i} user={allFoundUsers.find(u => u.id === eater.id.toHexString())} id={eater.cutInstruction}/>)}
      </div>
    </div>
  )
}

const ScheduledSlaughterList = () => {
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  const scheduledToday = useAnimals(Animal.where('killDate', now), [ getDayNumber(now) ])

  if(scheduledToday === undefined) {
    return (<div>Loading...</div>)
  }

  return (
    <div className="h-5/6 pl-2 pr-4 py-4 flex-grow">
      <div className="h-5/6 bg-gray-200 rounded-lg pb-4">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Scheduled Slaughters</div>
        </div>
        { scheduledToday.length > 0 ? scheduledToday.map((a, i) => <SlaughterInfo animal={a} />) : <p className="ml-4">No scheduled slaughters for today.</p> }
      </div>
    </div>
  )
}

const SlaughterInfo = ({animal}: {animal: IAnimal}) => {
  const allIds = useMemo(() => {
    if(animal.bringer === undefined || animal.eaters === undefined) {
      return []
    }
    const arr = [animal.bringer]
    animal.eaters.forEach(eater => arr.push(eater.id))
    return arr.map(e => { return { _id: e }})
  }, [animal])
  const allUsers = useUsers(User.where('_id').in(allIds), [allIds], ...allIds.map(i => i._id))
  
  const user = allUsers?.find(u => u.id === animal.bringer.toHexString())

  const history = useHistory();

  if(user === undefined) {
    return (<div>Loading...</div>)
  }
  
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => history.push(animalDetailsPage, animal.id)}>
      <div className="w-20">
        <SvgCow className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-0.5 ml-4 transform translate-y-1/2" />
      </div>
      <div className="w-1/2 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag user={user} />
      </div>
      <div className="w-1/2 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Confirmed:</p>
        <p className={`font-semibold ${animal.confirmed ? "text-green-400" : "text-tomato-400"}`}>{animal.confirmed ? "Yes" : "No"}</p>
      </div>
    </div>
  )
}

const UserTag = ({user, id} : {user: IUser, id?: number}) => {
  const history = useHistory();
  return (
    <div className="flex flex-row">
      <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={e => {history.push(userDetailsPage, user.id); e.stopPropagation();}}>{user.name}</p>
      {id && <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={() => console.log("go to sub user's individual cut instructions")}>#{id}</p>}
    </div>
  )
}
