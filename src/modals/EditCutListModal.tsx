import { SvgArrow, SvgCow, SvgPig } from "../assets/Icons"
import DataTag from "../components/DataTag"
import { DatabaseWait } from "../database/Database"
import Animal, { AnimalType, IAnimal, useAnimals, validateEaters, ValidateEatersFields } from "../database/types/Animal"
import User, { useUsers } from "../database/types/User"
import { normalizeDay } from "../Util"
import { hangingAnimals, setModal } from "./ModalManager"

export const EditCutListModal = () => {

  const animalsHanging = useAnimals(Animal.where('processDate', null).sort('killDate').select('killDate animalType bringer animalId liveWeight color sex tagNumber penLetter ' + ValidateEatersFields))

  const animalsToCut = useAnimals(Animal
    .where('processDate').ne(null)
    .where('pickedUp', false)
    .select("bringer processDate animalType killDate animalId liveWeight color sex tagNumber penLetter")
  )

  return (
    <div className="flex flex-row h-full" style={{ width: '900px', height: '400px' }}>
      <div style={{ width: '450px' }}>
        <div className="bg-gray-700 p-3 mb-3 rounded-tl-lg text-gray-200 font-semibold">HANGING</div>
        {animalsHanging !== DatabaseWait && animalsHanging.map(a => <HangingAnimalEntry key={a.id} animal={a} />)}
      </div>
      <div className="flex flex-col" style={{ width: '450px' }}>
        <div className="bg-gray-700 p-3 mb-3 rounded-tr-lg text-gray-200 font-semibold">TO CUT</div>
        <div className="border-l border-gray-200 pl-3 flex-grow">
          {animalsToCut !== DatabaseWait && animalsToCut.map(a => <CutAnimalEntry key={a.id} animal={a} />)}
        </div>
      </div>
    </div>
  )
}

const HangingAnimalEntry = ({ animal }: { animal: IAnimal }) => {
  const user = useUsers(User.findById(animal.bringer).select("name"), [animal.bringer], animal.bringer)
  const eatersValid = validateEaters(animal);
  const processAnimalToday = () => {
    if (eatersValid) {
      animal.processDate = normalizeDay()
      animal.save().then(() => setModal(hangingAnimals))
    }
  }
  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 hover:shadow-md border border-gray-200 group" onClick={processAnimalToday}>
      <div className="flex flex-row">
        <div>{animal.animalType === AnimalType.Beef ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
        <p className="bg-gray-300 rounded-md text-xs py-1 px-2 text-gray-700">#{animal.animalId}</p>
        <div className="ml-1 font-semibold rounded-md flex-grow">{user === DatabaseWait ? 'Loading...' : user.name}</div>
        <div className={(eatersValid ? "bg-green-300" : "bg-tomato-300") + " ml-1 font-semibold rounded-md px-1 text-white mr-2 transform translate-y-2"}>{eatersValid ? 'Eaters Confirmed' : 'Eaters Invalid'}</div>
        <SvgArrow className="text-white group-hover:text-green-100 h-6 w-6 transform translate-y-2" />
      </div>
      <div className="flex-grow text-xs text-gray-600 mt-0.5 font-semibold ml-2">{animal.animalType} Killed {animal.killDate.toDateString()}</div>
      <div className="flex flex-row w-full">
        <DataTag name={String(animal.liveWeight ?? "???") + "lbs"} />
        <DataTag name={animal.color} />
        <DataTag name={animal.sex} />
        <DataTag name={"Tag #" + String(animal.tagNumber ?? "???")} />
        <DataTag name={"Pen " + animal.penLetter} />
      </div>
    </div>
  )
}

const CutAnimalEntry = ({ animal }: { animal: IAnimal }) => {
  const user = useUsers(User.findById(animal.bringer).select("name"), [animal.bringer], animal.bringer)
  const processAnimalToday = () => {
    animal.processDate = undefined
    animal.save().then(() => setModal(hangingAnimals))
  }
  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 hover:shadow-md border border-gray-200 group" onClick={processAnimalToday}>
      <div className="flex flex-row">
        <div>{animal.animalType == AnimalType.Beef ? <SvgCow className="mb-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
        <p className="bg-gray-300 rounded-md text-xs py-1 px-2 text-gray-700">#{animal.animalId}</p>
        <div className="ml-1 font-semibold flex-grow">{user === DatabaseWait ? 'Loading...' : user.name}</div>
        <SvgArrow className="text-white group-hover:text-tomato-300 h-6 w-6 transform translate-y-2 rotate-180" />
      </div>
      <div className="flex-grow text-xs text-gray-600 mt-0.5 font-semibold ml-2">{animal.animalType} Killed {animal.killDate.toDateString()}</div>
      <div className="flex flex-row w-full">
        <DataTag name={String(animal.liveWeight ?? "???") + "lbs"} />
        <DataTag name={animal.color} />
        <DataTag name={animal.sex} />
        <DataTag name={"Tag #" + String(animal.tagNumber ?? "???")} />
        <DataTag name={"Pen " + animal.penLetter} />
      </div>
    </div>
  )
}