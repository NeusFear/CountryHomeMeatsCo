import { useHistoryListState } from "../AppHooks";
import Animal, {  getSexes, useAnimals, AnimalSexes, PenLetter, validateEaters, IAnimal } from "../database/types/Animal";
import { SvgArrow } from "../assets/Icons";
import Autosuggest from 'react-autosuggest';
import User, { IUser, useUsers } from "../database/types/User";
import { useEffect, useMemo, useState } from "react";
import { invoiceDetails } from "../NavBar";
import { Link } from 'react-router-dom';

export const AnimalDetailsPage = () => {
  const id = useHistoryListState()
  const animal = useAnimals(Animal.findById(id), [id], id)
  const animalSexes = useMemo(() => animal === undefined ? [] : getSexes(animal), [animal])

  const currentState = useMemo(() => {
    if(!animal || !animal.confirmed) return 0
    if([ animal.liveWeight, animal.color, animal.sex, 
        animal.tagNumber, animal.penLetter].some(e => e === undefined)) return 1
    if(animal.dressWeight === undefined) return 2
    if(!validateEaters(animal.eaters)) return 3
    if(animal.processDate === undefined) return 4
    if(animal.pickedUp) return 5
    return 6
  }, [
    //To get from scheduled to confirmed
    animal?.confirmed,

    //To get from confirmed to arrived
    animal?.liveWeight, animal?.color, animal?.sex, animal?.tagNumber, animal?.penLetter,

    //To get from arrived to hanging
    animal?.dressWeight,

    //To get from hanging to ready-to-cut.
    //The stringify is as it needs to be one element, rather than several
    JSON.stringify(animal?.eaters.map(e => { return [e.id, e.portion, e.cutInstruction] })),

    //To get from ready-to-cut to ready-for-pickup
    animal?.processDate,

    //To get from ready-for-pickup to archived
    animal?.pickedUp
  ])

  if(animal === undefined) {
    return (<div>Loading Info for animal id {id}</div>)
  }
  if(animal === null) {
    return (<div>Error finding Info for animal id {id}</div>)
  }

  const nanToUndefined = (num: number) => isNaN(num) ? undefined : num

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">ANIMAL INFO</div>
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
            <div className="p-4">
                <span>Kill Date</span>
                <div className="bg-gray-100 p-2 font-semibold">{animal.killDate.toLocaleDateString()}</div>
                <div className="font-semibold">
                  Confirmed
                  <input type="checkbox" checked={animal.confirmed} onChange={e => {
                    animal.confirmed = e.target.checked
                    animal.save()
                  }}/>
                </div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg mt-4">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Living Info</div>
            </div>
            <div className="p-4">
                <div className="font-semibold">
                  <span>Live Weight:</span>
                  <input type="number" disabled={currentState < 1} defaultValue={animal.liveWeight} onChange={e => {
                    animal.liveWeight = nanToUndefined(e.target.valueAsNumber)
                    animal.save()
                  }}/>
                  <span>lb</span>
                </div>
                <div className="font-semibold">
                  <span>Color</span>
                  <input type="text" disabled={currentState < 1} defaultValue={animal.color} onChange={e => {
                    animal.color = e.target.value
                    animal.save()
                  }}/>
                </div>
                <div className="font-semibold">
                  <span>Sex</span>
                  <select disabled={currentState < 1} defaultValue={animal.sex ?? "__default"} onChange={e => {
                    animal.sex = e.target.value as AnimalSexes
                    animal.save()
                  }}>
                    <option hidden disabled value="__default"></option>
                    <option value={animalSexes[0]}>{animalSexes[0]}</option>
                    <option value={animalSexes[1]}>{animalSexes[1]}</option>
                    <option value={animalSexes[2]}>{animalSexes[2]}</option>
                    <option value={animalSexes[3]}>{animalSexes[3]}</option>
                  </select>
                </div>
                <div className="font-semibold">
                  <span>Tag Number</span>
                  <input type="number" disabled={currentState < 1} defaultValue={animal.tagNumber} onChange={e => {
                    animal.tagNumber = e.target.valueAsNumber
                    animal.save()
                  }}/>
                </div>
                <div className="font-semibold">
                  <span>Pen Letter</span>
                  <select disabled={currentState < 1} defaultValue={animal.penLetter ?? "__default"} onChange={e => {
                    animal.penLetter = e.target.value as PenLetter
                    animal.save()
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
          </div>
          <div className="bg-gray-200 rounded-lg mt-4">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Cutting Room Info</div>
            </div>
            <div className="p-4">
                <div className="font-semibold">
                  <span>Dress Weight</span>
                  <input type="number" disabled={currentState < 2} defaultValue={animal.dressWeight} onChange={e => {
                    animal.dressWeight = nanToUndefined(e.target.valueAsNumber)
                    animal.save()
                  }}/>
                  <span>lb</span>
                </div>
                <p className="font-semibold">Eaters:</p>
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
                <InvoiceListItem delivered={false} name="Jerry Henderson" id={1238293}/>
                <InvoiceListItem delivered={true} name="Guy Guuyerson" id={1442343}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const InvoiceListItem = ({delivered, name, id} : {delivered: boolean, name: string, id?: number}) => {
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
const StringUserTag = ({name, id} : {name: string, id?: number}) => {
    return (
      <div className="flex">
        <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300">{name}</p>
        {id && <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300">#{id}</p>}
      </div>
    )
}


type DummyEater = { 
  _rand: number
  foundUser?: IUser
  portion?: number, 
  cutInstruction?: number
}

const EaterList = ({animal, currentState}: {animal: IAnimal, currentState: number}) => {
  const [ eaters, setEaters] = useState<DummyEater[]>()

  const updateEaters = () => setEaters([...eaters])
  const allUsers = useUsers(User.find().select('name cutInstructions'))?.sort((a, b) => a.name.localeCompare(b.name))

  const saveDummyEaters = () => {
    animal.eaters = eaters
      .filter(e => e.foundUser !== undefined && e.cutInstruction !== undefined && e.portion !== undefined)
      .map(e => {
        return {
          id: e.foundUser._id,
          cutInstruction: e.cutInstruction,
          portion: e.portion
        }
      })
    animal.save()
  }

  useEffect(() => {
    if(eaters === undefined && allUsers !== undefined && animal !== undefined) {
      setEaters(animal.eaters.map(e => { return {
        _rand: Math.random(),
        foundUser: allUsers.find(u => u.id == e.id.toHexString()),
        id: e.id,
        portion: e.portion,
        cutInstruction: e.cutInstruction
      }}))
    }
  }, [allUsers, animal])

  if(eaters === undefined) {
    return (<div>Loading eaters...</div>)
  }

  return (
    <div>
      {eaters && eaters.map(eater =>
        <EaterPart save={saveDummyEaters} key={eater._rand} eater={eater} allUsers={allUsers} currentState={currentState}/>
      )}
      <div onClick={() => {
        eaters.push({ _rand: Math.random() })
        updateEaters()
      }}>New</div>
    </div>
  )
}

const EaterPart = ({save, eater, allUsers, currentState}: {save: () => void, eater: DummyEater, allUsers: IUser[], currentState: number}) => {
  const [ user, setUser ] = useState<IUser>(eater.foundUser)
  eater.foundUser = user
  return (
    <div className="flex flex-row">
      <WrappedAutoSuggest
        suggestion={allUsers}
        intial={eater.foundUser}
        disabled={currentState < 3}
        mappingFunc={(user: IUser) => user.name}
        save={save}
        onChange={user => setUser(user)}
      />
      <select disabled={eater.foundUser === undefined || currentState < 3} defaultValue={eater.portion ?? "__default"} onChange={e => { eater.portion = parseFloat(e.target.value); save() }}>
        <option hidden disabled value="__default"></option>
        <option value="0.25">0.25</option>
        <option value="0.5">0.5</option>
        <option value="1">1</option>
      </select>
      <select disabled={eater.foundUser === undefined || currentState < 3} defaultValue={eater.cutInstruction ?? "__default"} onChange={e => { eater.cutInstruction = parseInt(e.target.value); save() }}>
        <option hidden disabled value="__default"></option>
        { eater.foundUser && 
          eater.foundUser.cutInstructions.slice()
            .sort((a, b) => a.id - b.id)
            .map(c => <option key={c.id} value={c.id}>{c.id}</option>)
        }
      </select>
    </div>
  )
}

//Export this to a util function
const WrappedAutoSuggest = ({suggestion, disabled, intial, mappingFunc, save, onChange}: {
  suggestion: any[],
  disabled: boolean,
  intial: any,
  mappingFunc: (t: any) => string,
  save: () => void,
  onChange: (value: any, rawValue: string) => void
}) => {
  //console.log(intial)
  const [ suggestions, setSuggestions ] = useState(suggestion)
  const [ value, setValue ] = useState(intial ? mappingFunc(intial) : '')

  const onValueChanged = (_, { newValue }: { newValue: string }) => {
    setValue(newValue)
    onChange(suggestions.find(s => mappingFunc(s).toLowerCase() == newValue.toLowerCase()), newValue)
  }
  return (
    <Autosuggest 
    suggestions={suggestions}
    onSuggestionsFetchRequested={({value}: {value: string}) => {
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
