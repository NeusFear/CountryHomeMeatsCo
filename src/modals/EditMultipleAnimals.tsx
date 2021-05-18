import { SvgCow, SvgPig } from "../assets/Icons"
import { useHistory } from 'react-router-dom';
import Animal, { AnimalType, IAnimal, useAnimals, useAnimalStateText, useComputedAnimalState } from "../database/types/Animal"
import { animalDetailsPage } from "../NavBar";

export const EditMultipleAnimals = ({ ids }: { ids: string[] }) => {
  const animals = useAnimals(Animal.where("_id").in(ids).select("tagNumber animalType"), [ids])
  return (
    <div>
      Edit Multiple Animals
      <div style={{ width: '450px', height: '400px' }}>
        {animals && animals.map(a => <AnimalEntry key={a.id} animal={a} />)}
      </div>
    </div>
  )
}

const AnimalEntry = ({ animal }: { animal: IAnimal }) => {

  const history = useHistory();
  let stateText = useAnimalStateText(useComputedAnimalState(animal))

  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 hover:shadow-md" onClick={() => history.push(animalDetailsPage, animal.id)}>
      <div className="flex flex-row">
        <div>{animal.animalType === AnimalType.Cow ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
        <div className="flex-grow text-xs text-blue-600 mt-2 font-semibold ml-2">{stateText}</div>
      </div>
      <div className="flex flex-row">
        {animal.liveWeight ? <InfoTag value={animal?.liveWeight + "lbs"} /> : <InfoTag value={"? lbs"} />}
        {animal.color ? <InfoTag value={animal?.color} /> : <InfoTag value={"? col"} />}
        {animal.sex ? <InfoTag value={animal?.sex} /> : <InfoTag value={"? sex"} />}
        {animal.tagNumber ? <InfoTag value={"Tag #" + animal?.tagNumber} /> : <InfoTag value={"? tag"} />}
        {animal.penLetter ? <InfoTag value={"Pen " + animal?.penLetter} /> : <InfoTag value={"? pen"} />}
      </div>
    </div>
  )
}

const InfoTag = ({value}: {value: string}) => {
  return(
    <div className="bg-gray-200 rounded text-xs py-0.5 px-1 mx-1">{value}</div>
  )
}