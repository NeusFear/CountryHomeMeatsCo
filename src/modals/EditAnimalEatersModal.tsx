import * as React from "react"
import { ObjectId } from "mongoose";
import Animal, { useAnimals, Eater } from "../database/types/Animal";
import User, { IUser, useUsers } from "../database/types/User";

type DummyEater = { 
  _rand: number
  id: string, 
  portion: number, 
  recordCard: number
}
export const EditAnimalEatersModal = ({id}: {id: ObjectId}) => {
  const animal = useAnimals(() => Animal.findById(id), [id], id)
  const [ eaters, setEaters] = React.useState<DummyEater[]>()
  
  React.useEffect(() => {
    if(eaters === undefined && animal !== undefined) {
      setEaters(animal.eaters.map(e => { return {
        _rand: Math.random(),
        id: e.id.toHexString(), 
        portion: e.portion,
        recordCard: e.recordCard
      }}))
    }
  }, [animal])

  const updateEaters = () => setEaters([...eaters])
  const allUsers = useUsers(() => User.find().select('name recordCards'))

  if(animal === undefined || allUsers === undefined || eaters === undefined) {
    return (<div>Loading...</div>)
  }
  return (
    <div>
      <div>Edit Eaters</div>
      {eaters && eaters.map(e => <EaterPart key={e._rand} eater={e} allUsers={allUsers}/>)}
      <div onClick={() => {
        eaters.push({ _rand: Math.random(), id:'', portion:-1, recordCard:-1 })
        updateEaters()
      }}>New</div>
    </div>
  )
}

const EaterPart = ({eater, allUsers}: {eater: DummyEater, allUsers: IUser[]}) => {
  console.log(eater)
  return (
    <div className="w-10 h-3 bg-red-200">
      
    </div>
  )
}