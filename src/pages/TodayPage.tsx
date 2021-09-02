import { ObjectId } from "mongoose"
import ReactTooltip from "react-tooltip"
import { useHistory } from 'react-router-dom';
import { SvgCow, SvgEdit, SvgPig, SvgPrint } from "../assets/Icons"
import Animal, { AnimalStateFields, AnimalType, IAnimal, useAnimals, useComputedAnimalState, validateEaters } from "../database/types/Animal"
import User, { IUser, useUsers } from "../database/types/User"
import { hangingAnimals, scheduleAnimal, setModal } from "../modals/ModalManager"
import { SchueduleAnimalModal } from "../modals/ScheduleAnimalModal"
import { getDayNumber, normalizeDay, printPage } from "../Util"
import { userDetailsPage, animalDetailsPage } from "../NavBar";
import { useMemo } from "react";
import { DatabaseWait } from "../database/Database";
import UserTag from "../components/UserTag";

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
    .where('processDate').ne(undefined)
    .where('pickedUp', false)
    .select("bringer animalType eaters animalId")
  )

  return (
    <div className="h-5/6 flex-grow pl-4 pr-2 py-4">
      <div className="h-5/6 bg-gray-200 rounded-lg">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Cut List</div>
          <SvgPrint className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => printPage("test.pdf")}/>
          <SvgEdit className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => setModal(hangingAnimals)}/>
        </div>
        {animals !== DatabaseWait && animals.map(a => <SelectedCutList key={a.id} animal={a} />)}
      </div>
    </div>
  )
}

const SelectedCutList = ({animal}: {animal: IAnimal}) => {
  const allUsers = useMemo(() => [animal.bringer, ...animal.eaters.map(e => e.id)], [animal])
  const allFoundUsers = useUsers(User.where('_id').in(allUsers).select("name"))

  const mainUser = allFoundUsers === DatabaseWait ? DatabaseWait : allFoundUsers.find(u => u.id === animal.bringer.toHexString())

  if(mainUser === DatabaseWait || allFoundUsers === DatabaseWait) {
    return (<div>Loading...</div>)
  }
  if(mainUser === null) {
    return (<div>Problem loading user with ID {animal.bringer.toHexString()}</div>)
  }

  const Tag = animal.animalType === AnimalType.Beef ? SvgCow : SvgPig
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => console.log("go to animal")}>
      <div className="w-14 mr-1">
        <Tag className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-1 ml-4" />
        <p className="bg-gray-200 rounded-md text-xs py-1 px-2 text-gray-700 mt-1">#{animal.animalId}</p>
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag user={mainUser} />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Eaters:</p>
        {animal.eaters.length > 0 ? animal.eaters.map((eater, i) => 
          <div className="flex flex-row" key={i} >
            <p className="flex-grow bg-gray-200 rounded-md text-xs py-1 px-2 text-gray-700 mt-1 mr-1">{allFoundUsers.find(u => eater.id.toHexString()).name}</p>
            <p className="bg-gray-200 rounded-md text-xs py-1 px-2 text-gray-700 mt-1">#{eater.cutInstruction}</p>
          </div> ) : <p className="font-semibold text-tomato-400">Error</p>}
      </div>
    </div>
  )
}

const ScheduledSlaughterList = () => {
  const now = normalizeDay()
  const scheduledToday = useAnimals(Animal.where('killDate', now).select("bringer eaters animalType confirmed animalId " + AnimalStateFields), [ getDayNumber(now) ])

  if(scheduledToday === DatabaseWait) {
    return (<div>Loading...</div>)
  }

  return (
    <div className="h-5/6 pl-2 pr-4 py-4 flex-grow">
      <div className="h-5/6 bg-gray-200 rounded-lg pb-4">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Scheduled Slaughters</div>
        </div>
        { scheduledToday.length > 0 ? scheduledToday.map((a, i) => <SlaughterInfo key={i} animal={a} />) : <p className="ml-4">No scheduled slaughters for today.</p> }
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
  const allUsers = useUsers(User.where('_id').in(allIds).select("name"), [allIds], ...allIds.map(i => i._id))
  
  const user = allUsers === DatabaseWait ? DatabaseWait : allUsers.find(u => u.id === animal.bringer.toHexString())

  const history = useHistory();

  const state = useComputedAnimalState(animal);

  if(user === DatabaseWait) {
    return (<div>Loading...</div>)
  }
  
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => history.push(animalDetailsPage, animal.id)}>
      <div className="w-14 mr-1">
        {animal.animalType === AnimalType.Beef ? <SvgCow className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-1 ml-4" /> : <SvgPig className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-1 ml-4" />}
        <p className="bg-gray-200 rounded-md text-xs py-1 px-2 text-gray-700 mt-1">#{animal.animalId}</p>
      </div>
      <div className="w-1/2 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag user={user} />
      </div>
      <div className="w-1/2 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Confirmed:</p>
        <p className={`font-semibold ${animal.confirmed ? "text-green-400" : "text-tomato-400"}`}>{animal.confirmed ? "Yes" : "No"}</p>
      </div>
      <div className="w-1/2 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Done:</p>
        <p className={`font-semibold ${state >= 2 ? "text-green-400" : "text-tomato-400"}`}>{state >= 2 ? "Yes" : "No"}</p>
      </div>
    </div>
  )
}

