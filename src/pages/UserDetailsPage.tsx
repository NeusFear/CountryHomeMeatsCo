import { ObjectId } from "bson";
import { useHistory } from 'react-router-dom';
import { UserPinnedList } from "../App";
import { useHistoryListState } from "../AppHooks";
import { SvgCow, SvgEdit, SvgEmail, SvgNew, SvgNotes, SvgPhone, SvgPig, SvgTack, SvgTrash, SvgUser } from "../assets/Icons";
import InvoiceListItem from "../components/InvoiceListItem";
import { DatabaseWait } from "../database/Database";
import Animal, { AnimalStateFields, AnimalType, computeAnimalState, IAnimal, paddedAnimalId, useAnimals, useAnimalStateText } from "../database/types/Animal";
import Invoice, { useInvoice } from "../database/types/Invoices";
import User, { CutInstructions, IUser, useUsers } from "../database/types/User";
import { editCutInstructions, editUserDetails, scheduleAnimal, setModal } from "../modals/ModalManager";
import { animalDetailsPage } from "../NavBar";
import { formatPhoneNumber } from "../Util";

export const UserDetailsPage = ({ pinnedList }: { pinnedList: UserPinnedList }) => {
  const id = useHistoryListState() as ObjectId
  const user = useUsers(User.findById(id).select("name phoneNumbers emails notes cutInstructions invoices"), [id], id)

  const usersAnimals = useAnimals(Animal.where('bringer', user !== DatabaseWait ? user?.id : null).select("killDate animalType animalId penLetter " + AnimalStateFields), [user, id])
  if (user === DatabaseWait || usersAnimals === DatabaseWait) {
    return (<div>Loading Info for user id {id}</div>)
  }
  if (user === null) {
    return (<div>Error finding Info for user id {id}</div>)
  }

  const groupedAnimals = Array.from(
    usersAnimals.reduce((map, a) => {
      const animalState = computeAnimalState(a)
      const key = animalState <= 1 ? (a.killDate + "@" + a.animalType + "#" + animalState) : a.id
      const arr = map.get(key) ?? []
      arr.push(a)
      map.set(key, arr)
      return map
    }, new Map<string, IAnimal[]>()).values()
  ).sort(
    (a, b) => b[0].killDate.getTime() - a[0].killDate.getTime() //Reverse sort to show most recent first
  )

  const PhoneNumber = ({ name, number }: { name: string, number: string }) => (<div>{name}: {formatPhoneNumber(number)}</div>)
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
              <SvgTack className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={e => { pinnedList.updatePinned(user.id, true); e.stopPropagation() }} />
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
              }} key={_id} id={id} instructionNickname={i.nickname} instructionID={i.id} instruction={i.instructions} />)}
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
              {groupedAnimals.map((a, id) => <BroughtInAnimalEntry key={id} animals={a} />)}
            </div>
          </div>

          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-1 rounded-t-lg">
              <div className="text-gray-200 pl-4 font-semibold">Invoices</div>
            </div>
            <div className="ml-2 mb-2 flex flex-col">
              <InvoiceList user={user} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

const InvoiceList = ({ user }: { user: IUser }) => {
  const invoices = useInvoice(Invoice.where("_id").in(user.invoices.map(i => i.toHexString())), [user.invoices, String(user.invoices)], ...user.invoices)
  if (invoices === DatabaseWait) {
    return <p>Loading...</p>
  }


  return (<>
    {invoices.map(i => <InvoiceListItem key={i.id} invoice={i} />)}
  </>)
}

const CutInstructionEntry = ({ id, instructionNickname, instructionID, instruction, onDelete }:
  {
    id: ObjectId,
    instructionNickname: string,
    instructionID: number,
    instruction: CutInstructions,
    onDelete: () => void,
  }) => {
  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 flex flex-row hover:shadow-md" onClick={() => setModal(editCutInstructions, { id, instructionID })}>
      <div >{instruction.cutType === AnimalType.Beef ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
      <div className="px-2 ml-2 bg-gray-200 rounded-md">{instruction.cutType === AnimalType.Beef ? "Beef" : "Pork"}</div>
      <div className="bg-gray-200 rounded-md px-2 ml-1 text-xs pt-1">{instructionNickname}</div>
      <div className="bg-gray-200 rounded-md px-2 ml-1 text-xs pt-1">#{instructionID}</div>
      <div className="flex-grow"></div>
      {instruction.notes != undefined && instruction.notes.length > 0 && <SvgNotes className="mt-0.5 h-4 w-4 text-gray-600" />}
      <div className="pl-2" onClick={e => {
        onDelete()
        e.stopPropagation()
      }}><SvgTrash className="mt-0.5 h-4 w-4 text-gray-600 hover:text-tomato-400" /></div>
    </div>
  )
}

const BroughtInAnimalEntry = ({ animals }: {
  animals: IAnimal[]
}) => {
  const history = useHistory();

  const amount = animals.length
  const firstEntry = animals[0]
  const date = firstEntry.killDate
  const type = firstEntry.animalType
  const state = computeAnimalState(firstEntry)
  const stateText = useAnimalStateText(state)

  return (
    <div className="bg-white rounded-md p-2 mx-3 mt-1 hover:shadow-md" onClick={() => history.push(animalDetailsPage, firstEntry.id)}>
      <div className="flex flex-row">
        <div>{type == AnimalType.Beef ? <SvgCow className="mt-1 mr-1 text-gray-400 w-5 h-5" /> : <SvgPig className="mt-1 mr-1 text-gray-400 w-6 h-6" />}</div>
        {amount !== 1 && <div>x {amount}</div>}
        <div className="flex-grow text-xs text-blue-600 mt-2 font-semibold ml-2">
          {stateText}
          {amount === 1 &&
            <span className="text-gray-700 ml-1">#{paddedAnimalId(firstEntry)}</span>
          }

        </div>
        {state === 0 && <div className=" mt-1 pt-0.5 bg-green-200 hover:bg-green-300 text-xs cursor-pointer px-2 rounded-sm text-white mr-2 truncate" onClick={e => {
          animals.forEach(a => {
            a.confirmed = true
            a.save()
          })
          e.stopPropagation()
          e.preventDefault()
        }}>Click to Confirm</div>}

        {(state !== 0 && amount > 1) && <div className=" mt-0.5 bg-gray-600 text-xs cursor-pointer px-2 rounded-sm text-white mr-2 truncate">Click to add Slaughter Info<br />for one of the Animals</div>}

        <div>{date.toLocaleDateString()}</div>
      </div>
      {
        amount === 1 &&
        <div className="flex flex-row">
          <InfoTag missingInfo={false} value={"ID #" + paddedAnimalId(firstEntry)} />
          <InfoTag missingInfo={!firstEntry.liveWeight} value={(firstEntry.liveWeight ?? "?") + " lbs"} />
          <InfoTag missingInfo={!firstEntry.color} value={(firstEntry.color ?? "Color?")} />
          <InfoTag missingInfo={!firstEntry.sex} value={(firstEntry.sex ?? "Sex?")} />
          <InfoTag missingInfo={!firstEntry.tagNumber} value={"Tag #" + (firstEntry.tagNumber ?? "tag# ?")} />
          <InfoTag missingInfo={!firstEntry.penLetter} value={"Pen " + (firstEntry.penLetter === "" ? "??" : firstEntry.penLetter)} alwaysValid />
        </div>
      }
    </div>
  )
}

const InfoTag = ({ missingInfo, value, alwaysValid = false }: { missingInfo: boolean, value: string, alwaysValid?: boolean }) => {
  return (
    <div className={((missingInfo && !alwaysValid) ? "bg-tomato-100" : "bg-gray-200") + " rounded text-xs py-0.5 px-1 mx-1"}>{value}</div>
  )
}