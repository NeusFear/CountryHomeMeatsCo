import { ObjectId } from "mongoose"
import * as React from "react"
import ReactTooltip from "react-tooltip"
import { SvgCow, SvgEdit, SvgPig } from "../assets/Icons"
import Animal, { IAnimal, useAnimals, validateEaters } from "../database/types/Animal"
import User, { useUsers } from "../database/types/User"
import { editAnimalEaters, scheduleAnimal, setModal } from "../modals/ModalManager"
import { SchueduleAnimalModal } from "../modals/ScheduleAnimalModal"
import { getDayNumber } from "../Util"

export const TodayPage = () => {
  const today = React.useMemo(() => new Date(), [])
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
        <div className="h-5/6 flex-grow pl-4 pr-2 py-4">
          <div className="h-5/6 bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Cut List</div>
              <SvgEdit className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => console.log("view list of hanging animals to select from")}/>
            </div>
            <SelectedCutList />
            <SelectedCutList />
            <SelectedCutList />
          </div>
        </div>
        <ScheduledSlaughterList />
      </div>
    </div>
  )
}

const SelectedCutList = () => {
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => console.log("go to animal")}>
      <div className="w-20">
        <SvgCow className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-0.5 ml-4 transform translate-y-1/2" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag name="The Bringer Name" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Eaters:</p>
        <UserTag name="Some Name" id={4} />
        <UserTag name="Some Other Name" id={2} />
      </div>
    </div>
  )
}

const ScheduledSlaughterList = () => {
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  const scheduledToday = useAnimals(() => Animal.where('killDate', now), [ getDayNumber(now) ]))

  if(scheduledToday === undefined) {
    return (<div>Loading...</div>)
  }

  return (
    <div className="h-5/6 pl-2 pr-4 py-4 flex-grow">
      <div className="h-5/6 bg-gray-200 rounded-lg pb-4">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Scheduled Slaughters</div>
        </div>
        { scheduledToday.map((a, i) => <SlaughterInfo key={`${i}:${a.eaters?.length}`} animal={a} />) }
      </div>
    </div>
  )
}

const SlaughterInfo = ({animal}: {animal: IAnimal}) => {
  const allIds = React.useMemo(() => {
    if(animal.bringer === undefined || animal.eaters === undefined) {
      return []
    }
    const arr = [animal.bringer]
    animal.eaters.forEach(eater => arr.push(eater.id))
    return arr.map(e => { return { _id: e }})
  }, [animal])
  const allUsers = useUsers(() => User.where('_id').in(allIds), [allIds], ...allIds.map(i => i._id))
  
  const user = allUsers?.find(u => u.id === animal.bringer.toHexString())
  const sortedEaters = allUsers !== undefined ? undefined : animal.eaters.map(e => {
    return {
      name: allUsers.find(user => user.id === e.id.toHexString()).name,
      amount: e.portion,
      card: e.recordCard,
    }
  })

  const eatersValid = validateEaters(animal.eaters)

  if(user === undefined) {
    return (<div>Loading...</div>)
  }
  
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => console.log("go to animal")}>
      <ReactTooltip delayShow={200} /> 
      <div className="w-20">
        <SvgCow className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-0.5 ml-4 transform translate-y-1/2" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag name={user.name} />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Eaters:</p>
        {!eatersValid && <span data-tip="Invalid Eaters. Click to fix" onClick={() => setModal(editAnimalEaters, animal.id)} className="px-2 bg-red-200 text-tomato-700">!</span> }
        {sortedEaters && sortedEaters.map(e => <UserTag name={e.name} id={e.card}/>)}
      </div>
    </div>
  )
}

const UserTag = ({name, id} : {name: string, id?: number}) => {
  return (
    <div className="flex">
      <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={() => console.log("go to bringer")}>{name}</p>
      {id && <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={() => console.log("go to sub user's individual cut instructions")}>#{id}</p>}
    </div>
  )
}