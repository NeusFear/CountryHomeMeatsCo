import { SvgCow, SvgPig } from "../assets/Icons"
import Animal, { IAnimal, useAnimals, validateEaters } from "../database/types/Animal"
import User, { useUsers } from "../database/types/User"
import { hangingAnimals, setModal } from "./ModalManager"

export const EditCutListModal = () => {

  const animalsHanging = useAnimals(Animal.where('processDate', null).sort('killDate').select('killDate animalType bringer'))

  const animalsToCut = useAnimals(Animal
    .where('processDate').ne(null)
    .where('pickedUp', false)
  )

  return (
    <div className="flex flex-row h-full" style={{width:'900px', height:'400px'}}>
      <div className="flex-grow">
        <div className="bg-gray-700 p-3 mb-3 rounded-t-lg text-gray-200 font-semibold">HANGING</div>
        {animalsHanging && animalsHanging.map(a => <HangingAnimalEntry key={a.id} animal={a} />)}
      </div>
      <div className="flex-grow flex flex-col">
        <div className="bg-gray-700 p-3 mb-3 rounded-t-lg text-gray-200 font-semibold">TO CUT</div>
        <div className="border-l border-gray-200 pl-3 flex-grow">
        {animalsToCut && animalsToCut.map(a => <CutAnimalEntry key={a.id} animal={a} />)}
        </div>
      </div>
    </div>
  )
}

const HangingAnimalEntry = ({animal}: {animal: IAnimal}) => {
  const user = useUsers(User.findById(animal.bringer), [animal.bringer], animal.bringer)
  const eatersValid = validateEaters(animal);
  const processAnimalToday = () => {
    if (eatersValid) {
      animal.processDate = new Date()
      animal.save().then(() => setModal(hangingAnimals))
    }
  }
  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 hover:shadow-md border border-gray-200" onClick={processAnimalToday}>
      <div className="flex flex-row">
        <div>{animal.animalType == "Cow" ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
        <div className="ml-1 font-semibold">{user?.name ?? 'Loading...'} {eatersValid ? '(Eaters Confirmed)' : '(Eaters Invalid)'}</div>
      </div>
      <div className="flex-grow text-xs text-gray-600 mt-0.5 font-semibold ml-2">{animal.animalType} Killed {animal.killDate.toDateString()}</div>
    </div>
  )
}

const CutAnimalEntry = ({animal}: {animal: IAnimal}) => {
  const user = useUsers(User.findById(animal.bringer), [animal.bringer], animal.bringer)
  const processAnimalToday = () => {
    animal.processDate = undefined
    animal.save().then(() => setModal(hangingAnimals))
  }
  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 hover:shadow-md border border-gray-200" onClick={processAnimalToday}>
      <div className="flex flex-row">
        <div>{animal.animalType == "Cow" ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
        <div className="ml-1 font-semibold">{user?.name ?? 'Loading...'}</div>
      </div>
      <div className="flex-grow text-xs text-gray-600 mt-0.5 font-semibold ml-2">{animal.animalType} Killed {animal.killDate.toDateString()}</div>
    </div>
  )
}