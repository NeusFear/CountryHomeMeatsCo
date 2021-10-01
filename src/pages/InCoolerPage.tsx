import Animal, { AnimalType, IAnimal, paddedAnimalId, useAnimals } from "../database/types/Animal"
import { useHistory } from 'react-router-dom';
import User, { useUsers } from "../database/types/User"
import { animalDetailsPage } from "../NavBar"
import { DatabaseWait } from "../database/Database";
import { useState } from "react";

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
          {(tab ? beef : pork).map(c => <AnimalInfoEntry key={c.id} animal={c} />)}
        </div>
      </div>
    </div>
  )
}

const AnimalInfoEntry = ({ animal }: { animal: IAnimal }) => {

  const user = useUsers(User.findById(animal.bringer).select("name"), [animal.bringer], animal.bringer)
  const history = useHistory()

  if (user === DatabaseWait) {
    return <p>Loading users...</p>
  }

  if (user === null) {
    return <p>Error loading user.</p>
  }

  return (
    <div className="bg-gray-100 rounded-md p-2 flex flex-row text-xs my-1 mx-2 hover:bg-gray-300" onClick={() => history.push(animalDetailsPage, animal.id)}>
      <p>{user.name}</p>
      <p>#{paddedAnimalId(animal)}</p>
    </div>
  )
}