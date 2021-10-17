import { useHistoryListState } from "../AppHooks";
import Animal, { getSexes, useAnimals, AnimalSexes, PenLetter, IAnimal, useComputedAnimalState, AnimalType, paddedAnimalId, validateEaters } from "../database/types/Animal";
import { SvgArrow, SvgCalendar, SvgEdit } from "../assets/Icons";
import Autosuggest from 'react-autosuggest';
import User, { CutInstructions, IUser, useUsers } from "../database/types/User";
import { useEffect, useMemo, useState } from "react";
import { invoiceDetails, userDetailsPage } from "../NavBar";
import { Link } from 'react-router-dom';
import { normalizeDay } from "../Util";
import { ObjectId } from 'bson'
import { useHistory } from 'react-router-dom';
import { editUserDetails } from "../modals/ModalManager";
import { DatabaseWait } from "../database/Database";
import Invoice, { generateInvoice, IInvoice, useInvoice } from "../database/types/Invoices";
import { useConfig } from "../database/types/Configs";
import InvoiceListItem from "../components/InvoiceListItem";

type DummyEater = {
  _rand: number
  foundUser?: IUser,
  tag?: string
  halfUser?: {
    foundUser?: IUser
    tag?: string
  }
  cutInstruction?: number
  foundCutInstruction?: CutInstructions
}

export const AnimalDetailsPage = () => {
  const id = useHistoryListState()
  const animal = useAnimals(Animal.findById(id).select(""), [id], id as ObjectId)

  const bringer = animal === DatabaseWait ? null : animal?.bringer
  const user = useUsers(User.findById(bringer).select("name"), [bringer], bringer)
  const animalSexes = useMemo(() => animal === DatabaseWait ? [] : getSexes(animal), [animal])
  const users = useUsers(User.find().select('name cutInstructions invoices'))

  const priceData = useConfig("PriceData")

  const currentState = useComputedAnimalState(animal)

  const [eaters, setEaters] = useState<DummyEater[]>()
  const databaseLength = useInvoice(Invoice.countDocuments())

  const history = useHistory()

  if(priceData === DatabaseWait) {
    return <div>Loading Price Data</div>
  }

  if (animal === DatabaseWait) {
    return (<div>Loading Info for animal id {String(id)}</div>)
  }
  if (animal === null) {
    return (<div>Error finding Info for animal id {String(id)}</div>)
  }

  if(user === DatabaseWait) {
    return <p>Loading user...</p>
  }
  if(users === DatabaseWait || databaseLength == DatabaseWait) {
    return <p>Loading users...</p>
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
        <div className="text-white text-4xl font-bold ml-4">{animal.animalType.toUpperCase() + " #" + paddedAnimalId(animal)}</div>
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
        <div className={`flex-grow p-2 rounded-md shadow-md my-1 ml-1 mr-2 border-4 ${currentState >= 6 ? "border-green-500" : "border-gray-600"}`}>Delivered</div>
      </div>
      <div className="flex-grow flex flex-row w-full">
        <div className="flex-grow pl-4 pr-2 py-4 flex flex-col">
          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Schedule</div>
            </div>
            <div className="p-4 font-semibold flex flex-row relative">
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
              { animal && !animal.confirmed &&
                <div className="font-semibold mx-2 absolute right-0">
                  <button className="mt-1 rounded-md mr-2 bg-tomato-500 p-5" onClick={e => {
                    if(confirm("Are you sure you to delete? This cannot be undone.")) {
                      animal.delete()
                      const toDelete = animal.invoices.map(i => i.toHexString())
                      Invoice.deleteMany().where("_id").in(toDelete).exec()
                      history.length = history.length - 1
                      history.entries.pop()
                      history.goBack()
                    }
                  }}>Delete Animal</button>
                </div>
              }
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
              <EaterList eaters={eaters} setEaters={setEaters} users={users} animal={animal} currentState={currentState} />
            </div>
          </div>
        </div>
        <div className="flex-grow pl-4 pr-2 py-4">
          <div className="bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Related Invoices</div>
              { <button className="bg-blue-200 rounded" disabled={currentState < 4} onClick={() => {
                if(animal.invoices.length === 0 || confirm("This will remove all current invoices.")) {
                  const toRemove = animal.invoices.map(i => String(i))
                  animal.invoices = []
                  const toSave = new Set<IUser>()
                  eaters.forEach((e, i) => {
                    e.foundUser.invoices = e.foundUser.invoices.filter(i => !toRemove.includes(String(i)))
                    if(e.halfUser) {
                      e.halfUser.foundUser.invoices = e.halfUser.foundUser.invoices.filter(i => !toRemove.includes(String(i)))
                    }
                    generateInvoice(animal, e.foundUser, e.halfUser?.foundUser, priceData.currentPrices, e.cutInstruction, e.foundCutInstruction, databaseLength + 1 + i, eaters.length > 1)
                    toSave.add(e.foundUser)
                    if(e.halfUser) {
                      toSave.add(e.halfUser?.foundUser)
                    }
                  })
                  Invoice.deleteMany().where("_id").in(toRemove).exec()
                  toSave.forEach(u => u.save())
                  animal.invoiceGeneratedDate = normalizeDay()
                  animal.save()
                }
              }}>Generate</button> }
            </div>
            <div className="py-4">
              <InvoiceList animal={animal}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const InvoiceList = ({animal}: {animal: IAnimal}) => {
  const invoices = useInvoice(Invoice.where("_id").in(animal.invoices.map(i => i.toHexString())), [animal.invoices, String(animal.invoices)], ...animal.invoices)
  if(invoices === DatabaseWait) {
    return <p>Loading...</p>
  }
  return (<> 
    { invoices.map(i => <InvoiceListItem key={i.id} invoice={i} />) }  
  </>)
}


const EaterList = ({ eaters, setEaters, users, animal, currentState }: { eaters: DummyEater[], setEaters: (e: DummyEater[]) => void, users: IUser[], animal: IAnimal, currentState: number }) => {
  const [numEaters, setNumEaters] = useState(animal.numEaters ?? 1)

  const allUsers = users.sort((a, b) => a.name.localeCompare(b.name))

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
  

    eaters.forEach(eat => {
      eat.foundCutInstruction = eat.foundUser?.cutInstructions?.find(c => c.id === eat.cutInstruction)?.instructions
    })
  }
  useEffect(() => {
    const eaters: DummyEater[] = []
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

    animal.eaters.forEach((e, i) => {
      const eat = eaters[i]
      if (eat !== undefined) {
        eat.foundUser = allUsers.find(u => u.id == e.id.toHexString())
        eat.tag = e.tag
        eat.cutInstruction = e.cutInstruction
        eat.foundCutInstruction = eat.foundUser?.cutInstructions?.find(c => c.id === e.cutInstruction)?.instructions

        if (e.halfUser !== undefined && eat.halfUser !== undefined) {
          eat.halfUser.foundUser = allUsers.find(u => u.id == e.halfUser.id.toHexString())
          eat.halfUser.tag = e.halfUser.tag
        }
      }
    })
    setEaters(eaters)
  }, [numEaters, allUsers])

  if (eaters === undefined) {
    return (<div>Loading eaters...</div>)
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
          <p className="w-36 ml-2">Record Name</p>
        </div>
        {eaters && eaters.map((eater, i) =>
          <EaterPart save={saveDummyEaters} key={eater._rand} eater={eater} allUsers={allUsers} currentState={currentState} animalType={animal.animalType}/>
        )}
      </div>
    </div>
  )
}

const EaterPart = ({ save, eater, allUsers, currentState, animalType }: { save: () => void, eater: DummyEater, allUsers: IUser[], currentState: number, animalType: AnimalType }) => {
  const [user, setUser] = useState<IUser>(eater.foundUser)
  eater.foundUser = user
  const [halfUser, setHalfUser] = useState<IUser>(eater.halfUser?.foundUser)
  if (eater.halfUser !== undefined) {
    eater.halfUser.foundUser = halfUser
  }

  return (
    <div>
      <div className="flex flex-row">
        <EaterSelectPart save={save} part={eater} allUsers={allUsers} currentState={currentState} user={user} setUser={u => {
          if(!u) {
            eater.cutInstruction = undefined
            eater.foundCutInstruction = undefined
            eater.foundUser = undefined
          }
          setUser(u)
        }} />
        <select 
        key={user?.id?? "null"}
        className="w-48 border-gray-700 border rounded-md ml-2 px-1" 
        disabled={eater.foundUser === undefined || currentState < 3} defaultValue={eater.cutInstruction ?? "__default"} 
        onChange={e => { eater.cutInstruction = parseInt(e.target.value); save() }}>
          <option hidden disabled value="__default"></option>
          {eater.foundUser &&
            eater.foundUser.cutInstructions.slice()
              .sort((a, b) => a.id - b.id)
              .filter(a => a.instructions.cutType === animalType)
              .map(c => <option key={c.id} value={c.id}>{c.nickname} - #{c.id}</option>)
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
        mappingFunc={(user: IUser) => user.name}
        save={save}
        onChange={u => {
          if(!u) {
            part.tag = ""
          }
          setUser(u)
        }}
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
const WrappedAutoSuggest = ({ suggestion, disabled = false, intial, mappingFunc, save, onChange }: {
  suggestion: any[],
  disabled?: boolean,
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
        setSuggestions(suggestion.filter(s => mappingFunc(s).toLowerCase().includes(lowerValue)))
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
