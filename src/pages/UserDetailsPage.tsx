import { useHistoryListState } from "../AppHooks"
import { useHistory } from 'react-router-dom';
import { animalDetailsPage } from "../NavBar";
import { useMemo } from "react";
import { SvgCow, SvgEdit, SvgEmail, SvgNew, SvgPhone, SvgPig, SvgTack, SvgUser, SvgTrash } from "../assets/Icons";
import User, { CutInstructions, useUsers } from "../database/types/User";
import { UserPinnedList } from "../App";
import { editCutInstructions, editUserDetails, scheduleAnimal, setModal } from "../modals/ModalManager";
import Animal, { useAnimals, IAnimal, useComputedAnimalState, computeAnimalState, AnimalType } from "../database/types/Animal";

export const UserDetailsPage = ({ pinnedList }: { pinnedList: UserPinnedList }) => {
  const id = useHistoryListState()
  const user = useUsers(User.findById(id), [id], id)

  const usersAnimals = useAnimals(Animal.where('bringer', user?.id ?? null), [user, id])
  if (user === undefined || usersAnimals === undefined) {
    return (<div>Loading Info for user id {id}</div>)
  }
  if (user === null) {
    return (<div>Error finding Info for user id {id}</div>)
  }

  const groupedAnimals = Array.from(
    usersAnimals.reduce((map, a) => {
      const key = a.killDate + "@" + a.animalType + "#" + computeAnimalState(a)
      const arr = map.get(key) ?? []
      arr.push(a)
      map.set(key, arr)
      return map
    }, new Map<string, IAnimal[]>()).values()
  ).map(arr => {
    return {
      date: arr[0].killDate,
      type: arr[0].animalType,
      state: computeAnimalState(arr[0]),
      amount: arr.length,
    }
  })

  const PhoneNumber = ({ name, number }: { name: string, number: string }) => (<div>{name}: {number}</div>)
  const Email = ({ email }: { email: string }) => (<div>{email}</div>)

  return (
    <div className="w-full h-screen">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">{user.name.toUpperCase()}</div>
        <div className="text-gray-700 ml-1 text-xl">#</div>
        <div className="text-gray-700 ml-1 text-3xl">{user.id}</div>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full h-5/6 px-4 py-2">
        <div className="flex flex-col">

          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Contact Information</div>
              <SvgTack className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => pinnedList.updatePinned(id, true)} />
              <SvgEdit className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => setModal(editUserDetails, id)} />
            </div>
            <div className="bg-white rounded-md p-2 mx-4 mb-1 mt-4 flex flex-row"><SvgUser className="mt-1 mr-1 text-gray-400" />{user.name}</div>
            <div className="bg-white rounded-md p-2 mx-4 mb-1 flex flex-row"><SvgPhone className="mt-1 mr-1 text-gray-400" />
              <div className="flex flex-col">
                {user.phoneNumbers.map((ph, idx) => <PhoneNumber key={idx} name={ph.name} number={ph.number} />)}
              </div>
            </div>
            <div className="bg-white rounded-md p-2 mx-4 mb-4 flex flex-row"><SvgEmail className="mt-1 mr-1 text-gray-400" />
              <div className="flex flex-col">
                {user.emails.map((e, idx) => <Email key={idx} email={e} />)}
              </div>
            </div>
            <div className="bg-white rounded-md p-2 mx-4 mb-4">
              <textarea className="w-full border-gray-300 border"
                defaultValue={user.notes}
                onBlur={e => {
                  user.notes = e.target.value ?? ''
                  user.save()
                }}></textarea>
            </div>
          </div>

          <div className="bg-gray-200 rounded-lg flex-grow mt-4">
            <div className="bg-gray-700 p-1 mb-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Cut Instructions</div>
              <SvgNew className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => setModal(editCutInstructions, { id })} />
            </div>
            <div className="ml-2 mb-2 flex flex-col">
              {user.cutInstructions.map((i, _id) => <CutInstructionEntry onDelete={() => {
                user.cutInstructions.splice(_id, 1);
                user.save()
              }} key={_id} id={id} instructionID={i.id} instruction={i.instructions} />)}
            </div>
          </div>
        </div>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Animals Brought</div>
              <SvgNew className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => setModal(scheduleAnimal, id)} />
            </div>
            <div className="ml-2 mb-2 flex flex-col">
              {groupedAnimals.map((a, id) => <BroughtInAnimalEntry key={id} animal={a} />)}
            </div>
          </div>

          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-1 rounded-t-lg">
              <div className="text-gray-200 pl-4 font-semibold">Invoices</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

const CutInstructionEntry = ({ id, instructionID, instruction, onDelete }:
  {
    id: number,
    instructionID: number,
    instruction: CutInstructions,
    onDelete: () => void,
  }) => {
  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 flex flex-row hover:shadow-md" onClick={() => setModal(editCutInstructions, { id, instructionID })}>
      <div className="flex-grow">{instruction.cutType == "beef" ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
      <div className="mr-4">{instructionID}</div>
      <div className="pl-2" onClick={e => {
        onDelete()
        e.stopPropagation()
      }}><SvgTrash className="mt-0.5 h-4 w-4 text-gray-200 hover:text-tomato-400" /></div>
    </div>
  )
}

const BroughtInAnimalEntry = ({ animal: { date, type, state, amount } }: {
  animal: {
    date: Date;
    type: AnimalType;
    state: number;
    amount: number;
  }
}) => {
  const history = useHistory();
  const stateText = useMemo(() => {
    switch (state) {
      case 0:
        return "Scheduled"
      case 1:
        return "Confirmed"
      case 2:
        return "Arrived"
      case 3:
        return "Hanging"
      case 4:
        return "Ready to Cut"
      case 5:
        return "Ready to Pickup"
      case 6:
        return "Delivered"
    }
  }, [state])
  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 flex flex-row hover:shadow-md">{/* onClick={() => history.push(animalDetailsPage, animal.id)} */}
      <div>{type == "Cow" ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
      {amount !== 1 && <div>x {amount}</div> }
      <div className="flex-grow text-xs text-gray-600 mt-2 font-semibold ml-2">{stateText}</div>
      <div>{date.toLocaleDateString()}</div>
    </div>
  )
}
