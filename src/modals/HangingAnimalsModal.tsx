import * as React from "react"
import Animal, { IAnimal, useAnimals } from "../database/types/Animal"
import User, { useUsers } from "../database/types/User"
import { setModal } from "./ModalManager"

export const HangingAnimalsModal = () => {
  const animals = useAnimals(Animal.where('processDate', null).sort('killDate').select('killDate animalType bringer'))

  return (
    <div style={{width:'450px', height:'400px'}}>
      {animals && animals.map(a => <HangingAnimalEntry key={a.id} animal={a} />)}
    </div>
  )
}

const HangingAnimalEntry = ({animal}: {animal: IAnimal}) => {
  const user = useUsers(User.findById(animal.bringer), [animal.bringer], animal.bringer)
  const processAnimalToday = () => {
    animal.processDate = new Date()
    animal.save().then(() => setModal(null))
  }
  return (
    <div className="bg-tomato-300" onClick={processAnimalToday}>
      {user?.name ?? 'Loading...'}: {animal.animalType} @ {animal.killDate.toDateString()}
    </div>
  )
}