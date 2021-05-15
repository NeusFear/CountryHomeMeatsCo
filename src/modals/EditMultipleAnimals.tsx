import { SvgCow, SvgPig } from "../assets/Icons"
import { useHistory } from 'react-router-dom';
import Animal, { IAnimal, useAnimals, useAnimalStateText, useComputedAnimalState } from "../database/types/Animal"
import { animalDetailsPage } from "../NavBar";

export const EditMultipleAnimals = ({ ids }: { ids: string[] }) => {
  const animals = useAnimals(Animal.where("_id").in(ids), [ids])
  return (
    <div>
      Edit Multiple Animals
      <div style={{ width: '450px', height: '400px' }}>
        {animals && animals.map(a => <AnimalEntry animal={a} />)}
      </div>
    </div>
  )
}

const AnimalEntry = ({ animal }: { animal: IAnimal }) => {
  const history = useHistory()
  let stateText = useAnimalStateText(useComputedAnimalState(animal))

  if(animal.tagNumber !== undefined) {
    stateText += " #" + animal.tagNumber
  }

  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 flex flex-row hover:shadow-md" onClick={() => history.push(animalDetailsPage, animal.id)} >
      <div>{animal.animalType == "Cow" ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
      <div className="flex-grow text-xs text-gray-600 mt-2 font-semibold ml-2">{stateText}</div>
    </div>
  )
}