import { useHistoryListState } from "../AppHooks";
import Animal, { getSexes, useAnimals, AnimalSexes, PenLetter, IAnimal, useComputedAnimalState, AnimalType, paddedAnimalId } from "../database/types/Animal";
import { SvgArrow, SvgCalendar, SvgEdit } from "../assets/Icons";
import Autosuggest from 'react-autosuggest';
import User, { IUser, useUsers } from "../database/types/User";
import { useEffect, useMemo, useState } from "react";
import { invoiceDetails, userDetailsPage } from "../NavBar";
import { Link } from 'react-router-dom';
import { normalizeDay } from "../Util";
import { ObjectId } from 'bson'
import { useHistory } from 'react-router-dom';
import { editUserDetails } from "../modals/ModalManager";
import { DatabaseWait } from "../database/Database";


export const AnimalDetailsPage = () => {
  const id = useHistoryListState()
  const animal = useAnimals(Animal.findById(id).select(""), [id], id)
  console.log(animal)
  const bringer = animal === DatabaseWait ? null : animal.bringer
  const user = useUsers(User.findById(bringer).select("name"), [bringer], bringer)
  const animalSexes = useMemo(() => animal === DatabaseWait ? [] : getSexes(animal), [animal])

  const currentState = useComputedAnimalState(animal)

  if (animal === DatabaseWait) {
    return (<div>Loading Info for animal id {String(id)}</div>)
  }
  if (animal === null) {
    return (<div>Error finding Info for animal id {String(id)}</div>)
  }

  if(user === DatabaseWait) {
    return <p>Loading user...</p>
  }
  if(user === null) {
    return <p>Error loading user.</p>
  }

  const nanToUndefined = (num: number) => isNaN(num) ? undefined : num

  const setAnimalArriveDateAndSave = () => {
    if (animal.arriveDate === undefined) {
      animal.arriveDate = normalizeDay()
    }
    animal.save()
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">{(animal.animalType === AnimalType.Cow ? "BEEF" : "PORK") + " #" + paddedAnimalId(animal)}</div>
      </div>
      <div className="flex flex-row w-full mt-4 font-bold text-center">
        <div className={`flex-grow p-2 rounded-md shadow-md my-1 mr-1 ml-4 border-4 ${currentState >= 0 ? "border-green-500" : "border-gray-600"}`}>Scheduled</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState >= 1 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState >= 1 ? "border-green-500" : "border-gray-600"}`}>Confirmed</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState >= 2 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState >= 2 ? "border-green-500" : "border-gray-600"}`}>Arrived</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState >= 3 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState >= 3 ? "border-green-500" : "border-gray-600"}`}>Hanging</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState >= 4 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState >= 4 ? "border-green-500" : "border-gray-600"}`}>Ready to Cut</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState >= 5 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState >= 5 ? "border-green-500" : "border-gray-600"}`}>Ready to Pickup</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState >= 6 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md my-1 ml-1 mr-2 border-4 ${currentState >= 7 ? "border-green-500" : "border-gray-600"}`}>Delivered</div>
      </div>
      <div className="flex-grow flex flex-row w-full">
        <div className="flex-grow pl-4 pr-2 py-4 flex flex-col">
          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Schedule</div>
            </div>
            <div className="p-4 font-semibold flex flex-row">
              <div className="mr-2">
                <span>Bringer</span>
                <div className="bg-gray-100 p-2 font-semibold flex flex-row">{user.name}</div>
              </div>
              <div className="w-44">
                <span>Kill Date</span>
                <div className="bg-gray-100 p-2 font-semibold flex flex-row"><p className="flex-grow">{animal.killDate.toLocaleDateString()}</p> <SvgEdit className="w-6 h-6 hover:text-gray-700 text-gray-600" /></div>
              </div>
              <div className="font-semibold mx-2">
                <p>Called</p>
                <input className="mt-1 h-8 w-8 rounded-md mr-2" type="checkbox" checked={animal.called} onChange={e => {
                  animal.called = e.target.checked
                  animal.save()
                }} />
              </div>
              <div className="font-semibold mx-2">
                <p>Confirmed</p>
                <input className="mt-1 h-8 w-8 rounded-md mr-2" type="checkbox" checked={animal.confirmed} onChange={e => {
                  animal.confirmed = e.target.checked
                  animal.save()
                }} />
              </div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg mt-4">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Living Info</div>
            </div>
            <div className="p-4 flex flex-row">
              <div className="font-semibold flex flex-col p-1">
                <span>Live Weight:</span>
                <input className="border-gray-700 border rounded-md px-2" type="number" disabled={currentState < 1} defaultValue={animal.liveWeight} onChange={e => {
                  animal.liveWeight = nanToUndefined(e.target.valueAsNumber)
                  setAnimalArriveDateAndSave()
                }} />
              </div>
              <div className="font-semibold flex flex-col p-1">
                <span>Color</span>
                <input className="border-gray-700 border rounded-md px-2" type="text" disabled={currentState < 1} defaultValue={animal.color} onChange={e => {
                  animal.color = e.target.value
                  setAnimalArriveDateAndSave()
                }} />
              </div>
              <div className="font-semibold flex flex-col p-1">
                <span>Sex</span>
                <select className="border-gray-700 border rounded-md px-1" disabled={currentState < 1} defaultValue={animal.sex ?? "__default"} onChange={e => {
                  animal.sex = e.target.value as AnimalSexes
                  setAnimalArriveDateAndSave()
                }}>
                  <option hidden disabled value="__default"></option>
                  <option value={animalSexes[0]}>{animalSexes[0]}</option>
                  <option value={animalSexes[1]}>{animalSexes[1]}</option>
                  <option value={animalSexes[2]}>{animalSexes[2]}</option>
                  <option value={animalSexes[3]}>{animalSexes[3]}</option>
                </select>
              </div>
              <div className="font-semibold flex flex-col p-1">
                <span>Tag Number</span>
                <input className="border-gray-700 border rounded-md px-2" type="number" disabled={currentState < 1} defaultValue={animal.tagNumber} onChange={e => {
                  animal.tagNumber = e.target.valueAsNumber
                  setAnimalArriveDateAndSave()
                }} />
              </div>
              <div className="font-semibold flex flex-col p-1">
                <span>Pen Letter</span>
                <select className="border-gray-700 border rounded-md px-1" disabled={currentState < 1} defaultValue={animal.penLetter ?? "__default"} onChange={e => {
                  animal.penLetter = e.target.value as PenLetter
                  setAnimalArriveDateAndSave()
                }}>
                  <option hidden disabled value="__default"></option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="G">G</option>
                  <option value="H">H</option>
                  <option value="I">I</option>
                  <option value="J">J</option>
                </select>
              </div>
            </div>
            <div className="flex flex-row">
              <div className="font-semibold flex flex-row p-1">
                <span>Liver Good</span>
                <input className="mt-1 h-8 w-8 rounded-md mr-2" type="checkbox" checked={animal.liverGood} onChange={e => {
                  animal.liverGood = e.target.checked
                  setAnimalArriveDateAndSave()
                }} />
              </div>
              <div className="font-semibold flex flex-row p-1">
                <span>Older than 30 Months</span>
                <input className="mt-1 h-8 w-8 rounded-md mr-2" type="checkbox" checked={animal.older30Months} onChange={e => {
                  animal.older30Months = e.target.checked
                  setAnimalArriveDateAndSave()
                }} />
              </div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg mt-4">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Cutting Room Info</div>
            </div>
            <div className="p-4 flex flex-row">
              <div className="font-semibold flex flex-col mr-4">
                <span>Dress Weight</span>
                <input className="border-gray-700 border rounded-md px-2 w-48" type="number" disabled={currentState < 2} defaultValue={animal.dressWeight} onChange={e => {
                  animal.dressWeight = nanToUndefined(e.target.valueAsNumber)
                  animal.save()
                }} />
              </div>
              <EaterList animal={animal} currentState={currentState} />
            </div>
          </div>
        </div>
        <div className="flex-grow pl-4 pr-2 py-4">
          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Related Invoices</div>
            </div>
            <div className="py-4">
              <InvoiceListItem delivered={false} name="Jerry Henderson" id={1238293} />
              <InvoiceListItem delivered={true} name="Guy Guuyerson" id={1442343} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const InvoiceListItem = ({ delivered, name, id }: { delivered: boolean, name: string, id?: number }) => {
  return (
    <Link to={invoiceDetails} className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row">
      <div className="w-1/6 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Invoice:</p>
        <StringUserTag name={id.toString()} />
      </div>
      <div className="w-1/5 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Status:</p>
        <p className={`${delivered ? "bg-green-100 hover:bg-green-200" : "bg-tomato-100 hover:bg-tomato-200"} px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer`}>{delivered ? "Paid" : "Pending"}</p>
      </div>
      <div className="w-1/6 mx-4 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Portion:</p>
        <StringUserTag name="Half" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Cut List:</p>
        <StringUserTag name={name} id={4} />
      </div>
    </Link>
  )
}

//Delete this once the placeholder stuff for the cut list users is removed and replace with UserTag.
const StringUserTag = ({ name, id }: { name: string, id?: number }) => {
  return (
    <div className="flex">
      <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300">{name}</p>
      {id && <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300">#{id}</p>}
    </div>
  )
}


type DummyEater = {
  _rand: number
  foundUser?: IUser,
  tag?: string
  halfUser?: {
    foundUser?: IUser
    tag?: string
  }
  cutInstruction?: number
}

const EaterList = ({ animal, currentState }: { animal: IAnimal, currentState: number }) => {
  const [eaters, setEaters] = useState<DummyEater[]>()
  const [numEaters, setNumEaters] = useState(animal.numEaters ?? 1)

  const users = useUsers(User.find().select('name cutInstructions'))
  const allUsers = users === DatabaseWait ? DatabaseWait : users.sort((a, b) => a.name.localeCompare(b.name))

  const saveDummyEaters = () => {
    animal.eaters =
      eaters.filter(e => e.foundUser !== undefined && e.cutInstruction !== undefined)
        .map(e => {
          return {
            id: e.foundUser._id,
            tag: e.tag,
            cutInstruction: e.cutInstruction,
            halfUser: (
              e.halfUser === undefined ||
              e.halfUser.foundUser === undefined
            ) ? undefined : {
              id: e.halfUser.foundUser._id,
              tag: e.halfUser.tag
            }
          }
        })
    animal.save()
  }

  useEffect(() => {
    const eaters = []
    eaters.length = numEaters === 2 ? 2 : Math.round(numEaters / 2)
    for (let i = 0; i < eaters.length; i++) {
      if (eaters[i] === undefined) {
        eaters[i] = { _rand: Math.random() }
      }
      if (i * 2 !== numEaters - 1 && numEaters !== 2) {
        eaters[i].halfUser = {}
      } else {
        eaters[i].halfUser = undefined
      }
    }

    if (allUsers !== DatabaseWait) {
      animal.eaters.forEach((e, i) => {
        const eat = eaters[i]
        if (eat !== undefined) {
          eat.foundUser = allUsers.find(u => u.id == e.id.toHexString())
          eat.tag = e.tag
          eat.cutInstruction = e.cutInstruction

          if (e.halfUser !== undefined && eat.halfUser !== undefined) {
            eat.halfUser.foundUser = allUsers.find(u => u.id == e.halfUser.id.toHexString())
            eat.halfUser.tag = e.halfUser.tag
          }
        }
      })
    }
    setEaters(eaters)
  }, [numEaters, allUsers])

  if (eaters === undefined) {
    return (<div>Loading eaters...</div>)
  }

  if (allUsers === DatabaseWait) {
    return (<div>Loading Users...</div>)
  }

  return (
    <div>
      <div className="flex flex-row">
        <div><p className="font-semibold">Eaters:</p></div>
        <div className="ml-2">
          <select className="w-24 ml-2 border-gray-700 border rounded-md px-2" disabled={currentState < 3} defaultValue={numEaters} onChange={e => {
            const value = parseInt(e.target.value)
            setNumEaters(value)
            animal.numEaters = value
            animal.save()
          }}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      </div>
      <div>
        <div className="flex flex-row font-semibold">
          <p className="w-44">Eater Name</p>
          <p className="w-36 ml-2">Identifier</p>
          <p className="w-36 ml-2">Record Number</p>
        </div>
        {eaters && eaters.map(eater =>
          <EaterPart save={saveDummyEaters} key={eater._rand} eater={eater} allUsers={allUsers} currentState={currentState} />
        )}
      </div>
    </div>
  )
}

const EaterPart = ({ save, eater, allUsers, currentState }: { save: () => void, eater: DummyEater, allUsers: IUser[], currentState: number }) => {
  const [user, setUser] = useState<IUser>(eater.foundUser)
  eater.foundUser = user
  const [halfUser, setHalfUser] = useState<IUser>(eater.halfUser?.foundUser)
  if (eater.halfUser !== undefined) {
    eater.halfUser.foundUser = halfUser
  }

  return (
    <div>
      <div className="flex flex-row">
        <EaterSelectPart save={save} part={eater} allUsers={allUsers} currentState={currentState} user={user} setUser={setUser} />
        <select className="w-48 border-gray-700 border rounded-md ml-2 px-1" disabled={eater.foundUser === undefined || currentState < 3} defaultValue={eater.cutInstruction ?? "__default"} onChange={e => { eater.cutInstruction = parseInt(e.target.value); save() }}>
          <option hidden disabled value="__default"></option>
          {eater.foundUser &&
            eater.foundUser.cutInstructions.slice()
              .sort((a, b) => a.id - b.id)
              .map(c => <option key={c.id} value={c.id}>{c.id}</option>)
          }
        </select>
      </div>
      { eater.halfUser !== undefined &&
        <div className="flex flex-row pb-2">
          <EaterSelectPart save={save} part={eater.halfUser} allUsers={allUsers} currentState={currentState} user={halfUser} setUser={setHalfUser} />
        </div>
      }
    </div>
  )
}

const EaterSelectPart = ({ save, part, allUsers, currentState, user, setUser }: {
  save: () => void,
  part: { foundUser?: IUser, tag?: string },
  allUsers: IUser[],
  currentState: number,
  user: IUser
  setUser: (user: IUser) => void,
}) => {
  const [tag, setUserTag] = useState(part.tag ?? '')

  part.foundUser = user
  part.tag = tag

  return (
    <>
      <WrappedAutoSuggest
        suggestion={allUsers}
        intial={part.foundUser}
        disabled={currentState < 3}
        mappingFunc={(user: IUser) => user.name}
        save={save}
        onChange={u => setUser(u)}
      />

      <input
        className="w-36 border-gray-700 border rounded-md ml-2 px-2"
        type="text"
        value={part.tag}
        disabled={currentState < 3}
        onChange={e => setUserTag(e.target.value)}
        onBlur={save}
        placeholder="Identifier"
      />
    </>
  )
}

//Export this to a util function
const WrappedAutoSuggest = ({ suggestion, disabled, intial, mappingFunc, save, onChange }: {
  suggestion: any[],
  disabled: boolean,
  intial: any,
  mappingFunc: (t: any) => string,
  save: () => void,
  onChange: (value: any, rawValue: string) => void
}) => {
  const [suggestions, setSuggestions] = useState(suggestion)
  const [value, setValue] = useState(intial ? mappingFunc(intial) : '')

  const onValueChanged = (_, { newValue }: { newValue: string }) => {
    setValue(newValue)
    onChange(suggestions.find(s => mappingFunc(s).toLowerCase() == newValue.toLowerCase()), newValue)
  }
  return (
    <Autosuggest
      className="border-gray-700 border rounded-md ml-2"
      suggestions={suggestions}
      onSuggestionsFetchRequested={({ value }: { value: string }) => {
        const lowerValue = value.toLowerCase().trim()
        setSuggestions(suggestion.filter(s => mappingFunc(s).toLowerCase().startsWith(lowerValue)))
      }}
      onSuggestionsClearRequested={() => setSuggestions([])}
      getSuggestionValue={t => mappingFunc(t)}
      renderSuggestion={t => <div>{mappingFunc(t)}</div>}
      inputProps={{
        value,
        disabled,
        placeholder: 'Type a Name',
        onChange: onValueChanged,
        onBlur: save,
      }}
    />
  )
}
