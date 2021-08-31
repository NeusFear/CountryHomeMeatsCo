import Animal, { AnimalType, IAnimal, paddedAnimalId, useAnimals } from "../database/types/Animal"
import { useHistory } from 'react-router-dom';
import User, { useUsers } from "../database/types/User"
import { animalDetailsPage } from "../NavBar"
import { DatabaseWait } from "../database/Database";

export const InCoolerPage = () => {
  const animals = useAnimals(Animal.where("pickedUp", false).where("liveWeight").ne(null))

  const cows: (IAnimal)[] = []
  const pigs = []
  if (animals !== DatabaseWait) {
    animals.forEach(a => (a.animalType === AnimalType.Beef ? cows : pigs).push(a))
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">IN THE COOLER</div>
      </div>
      <div className="flex flex-row pt-4">
        <div className="flex-grow bg-gray-200 mx-4 h-full rounded-lg">
          <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1" >BEEF: {cows.length}</div>
          {cows.map(c => <AnimalInfoEntry key={c.id} animal={c} />)}
        </div>
        <div className="flex-grow bg-gray-200 mx-4 h-full rounded-lg">
          <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1" >PORK: {pigs.length}</div>
          {pigs.map(c => <AnimalInfoEntry key={c.id} animal={c} />)}
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