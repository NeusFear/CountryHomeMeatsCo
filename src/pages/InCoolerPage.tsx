import Animal, { IAnimal, useAnimals } from "../database/types/Animal"

export const InCoolerPage = () => {
  const animals = useAnimals(Animal.where("pickedUp", false).where("liveWeight").ne(null))

  const cows: (IAnimal)[] = []
  const pigs = []
  animals?.forEach(a => (a.animalType === "Cow" ? cows : pigs).push(a))

  return (
    <div className="flex flex-row">
      <div className="flex flex-col w-full">
        <div>Cows:</div>
        {cows.map(c => <AnimalInfoEntry key={c.id} animal={c} />)}
      </div>
      <div className="flex flex-col w-full">
        <div>Pigs:</div>
        {pigs.map(c => <AnimalInfoEntry key={c.id} animal={c} />)}
      </div>
    </div>
  )
}

const AnimalInfoEntry = ({ animal }: { animal: IAnimal }) => {
  return (
    <div>
      #{animal.tagNumber}
    </div>
  )
}