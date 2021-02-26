import { ObjectId } from "mongoose"
import { SvgCow, SvgPig } from "../assets/Icons"
import Animal, { AnimalType, IAnimal, useAnimals } from "../database/types/Animal"
import { useHistory } from 'react-router-dom';
import { animalDetailsPage } from "../NavBar";
import User, { useUsers } from "../database/types/User";

export const MultipleCalendarEntryModal = ({ state }:
{ 
  state: { 
    animalIds: ObjectId[], 
    type: AnimalType, 
    day: Date,
    userID: string,
  }
}) => {
  const { animalIds, type, day, userID } = state
  const animals = useAnimals(Animal.where('_id').in(animalIds).select('confirmed'), [JSON.stringify(animalIds)])
  const user = useUsers(User.findById(userID).select('name phoneNumbers'), [userID], userID)

  const confirmAll = () => {
    animals.forEach(a => {
      a.confirmed = true
      a.save()
    })
  }

  if(user === undefined) {
    return (<div>Loading user...</div>)
  }

  if(user === null) {
    return (<div>Error loading user {userID}</div>)
  }

  return (
    <div style={{width:'450px', height:'400px'}}>
      <div className="flex flex-row">
        <div>{user.name} for {day.getMonth()}/{day.getDate()}/{day.getFullYear()}</div>
        <div>{type === AnimalType.Cow?<SvgCow/>:<SvgPig/>}</div>
      </div>
      <div>
        Numbers:
        {user.phoneNumbers.map((pn, i) => <div key={i}>{pn.name}: {pn.number}</div>)}
      </div>
      <div className="cursor-pointer mt-5 bg-red-500 hover:bg-red-900" onClick={confirmAll}>Confirm all</div>
      <div className="mt-5">
        {animals === undefined ? 'Loading...' : 
          animals.map((a, i) => <AnimalEntry key={i} animal={a} />)
        }
      </div>
    </div>
  )
}

const AnimalEntry = ({animal}: {animal: IAnimal}) => {
  const history = useHistory()
  return (
    <div className={`cursor-pointer 
      bg-${animal.confirmed?'green':'tomato'}-500
      hover:bg-${animal.confirmed?'green':'tomato'}-700
    `} onClick={() => history.push(animalDetailsPage, animal.id)}>
      Confirmed: {animal.confirmed?'Yes':'No'}
    </div>
  )
}