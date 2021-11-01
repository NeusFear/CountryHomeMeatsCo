import Animal, { AnimalType, IAnimal, paddedAnimalId, useAnimals } from "../database/types/Animal"
import { useHistory } from 'react-router-dom';
import User, { useUsers } from "../database/types/User"
import { animalDetailsPage } from "../NavBar"
import { DatabaseWait } from "../database/Database";
import { useState } from "react";
import { AnimalDetailsPage } from "./AnimalDetailsPage";

export const InCoolerPage = () => {

  const [tab, toggleTab] = useState(true);

  const animals = useAnimals(Animal.where("pickedUp", false).where("liveWeight").ne(null))

  const beef: (IAnimal)[] = []
  const pork = []
  if (animals !== DatabaseWait) {
    animals.forEach(a => (a.animalType === AnimalType.Beef ? beef : pork).push(a))
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">IN THE COOLER</div>
        <div className="text-white h-8 px-2 py-1 mt-2 rounded-md bg-tomato-300 hover:bg-tomato-400 mx-4 cursor-pointer" onClick={() => toggleTab(true)}>View Beef</div>
        <div className="text-white h-8 px-2 py-1 mt-2 rounded-md bg-green-300 hover:bg-green-400 cursor-pointer" onClick={() => toggleTab(false)}>View Pork</div>
      </div>
      <div className="pt-4">
        <div className="w-auto bg-gray-200 mx-4 h-full rounded-lg">
          <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1" >{tab ? "BEEF: " + beef.length : "PORK: " + pork.length}</div>
          {animals === DatabaseWait ? "Loading..." :
            (tab ? beef : pork).map(c => <AnimalInfoEntry key={c.id} animal={c} />)
          }
        </div>
      </div>
    </div>
  )
}

const AnimalInfoEntry = ({ animal }: { animal: IAnimal }) => {
  const usersToFind = [animal.bringer]
  animal.eaters.forEach(e => {
    usersToFind.push(e.id)
    if (e.halfUser) usersToFind.push(e.halfUser.id)
  })

  const users = useUsers(User.where("_id").in(usersToFind).select("name"), usersToFind, ...usersToFind)
  const history = useHistory()

  if (users === DatabaseWait) {
    return <p>Loading users...</p>
  }

  if (users === null) {
    return <p>Error loading user.</p>
  }

  const mainUser = users.find(u => String(u.id) === animal.bringer.toHexString())

  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => history.push(animalDetailsPage, animal.id)}>
      <div className="text-gray-800 group-hover:text-gray-900 flex-shrink">
        <p>Bringer</p>
        <DataTag name={mainUser?.name ?? "???"} />
      </div>
      <div className="text-gray-800 group-hover:text-gray-900 w-20 mr-4">
        <p>Animal ID</p>
        <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300 w-full">#{paddedAnimalId(animal)}</p>
      </div>
      <div className="text-gray-800 group-hover:text-gray-900 w-20 mr-4">
        <p>Eaters</p>
        {animal.eaters.map((e, i) => {
          const user = users.find(u => String(u.id) === String(e.id))
          return <p key={i} className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300 w-full">{user?.name ?? "???"}</p>
        })}
      </div>
      <div className="text-gray-800 group-hover:text-gray-900 flex-shrink mr-2">
        <p>Type</p>
        <p className={`${animal.animalType == AnimalType.Beef ? "bg-tomato-300 hover:bg-tomato-400" : "bg-green-300 hover:bg-green-400"} w-20 px-2 text-white py-1 rounded-lg text-sm mt-0.5 cursor-pointer`}>{animal.animalType == AnimalType.Beef ? "Beef" : "Pork"}</p>
      </div>
      <div className="text-gray-800 group-hover:text-gray-900 mx-2 w-auto mr-2">
        <p>Living Info</p>
        <div className="flex flex-row">
          <DataTag name={String(animal.liveWeight ?? "???") + "lbs"} />
          <DataTag name={animal.color} />
          <DataTag name={animal.sex} />
          <DataTag name={"Tag #" + String(animal.tagNumber ?? "???")} />
          <DataTag name={"Pen " + animal.penLetter} />
          {animal.animalType === AnimalType.Beef &&
            <HilightTag name={animal.older30Months ? "> 30 Months" : "< 30 Months"} good={!animal.older30Months} />
          }
          <HilightTag name={animal.liverGood ? "Liver Good" : "Liver Bad"} good={animal.liverGood} />
        </div>
      </div>
      <div className="text-gray-800 group-hover:text-gray-900 mx-2 w-auto mr-2">
        <p>Dress Info</p>
        <div className="flex flex-row">
          <DataTag name={String(animal.dressWeight ?? "???") + "lbs"} />
        </div>
      </div>
    </div>
  )
}

const DataTag = ({ name }: { name: string }) => {
  return (
    <div className="flex">
      <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300 mr-1">{name}</p>
    </div>
  )
}

const HilightTag = ({ name, good }: { name: string, good: boolean }) => {
  return (
    <div className="flex">
      <p className={(good ? `bg-green-100 hover:bg-green-200 text-white` : `bg-tomato-100 hover:bg-tomato-200`) + ` px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer mr-1`}>{name}</p>
    </div>
  )
}