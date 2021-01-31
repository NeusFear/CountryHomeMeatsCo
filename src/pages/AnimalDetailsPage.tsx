import * as React from "react";
import { useHistoryListState } from "../AppHooks";
import { useHistory } from 'react-router-dom';
import Animal, {  getSexes, useAnimals, AnimalSexes, PenLetter, validateEaters } from "../database/types/Animal";
import { SvgArrow } from "../assets/Icons";

export const AnimalDetailsPage = () => {
  const id = useHistoryListState()
  const animal = useAnimals(() => Animal.findById(id), [id], id)
  const animalSexes = React.useMemo(() => animal === undefined ? [] : getSexes(animal), [animal])

  const currentState = React.useMemo(() => {
    if(!animal || !animal.confirmed) return 0
    if([ animal.liveWeight, animal.color, animal.sex, 
        animal.tagNumber, animal.penLetter].some(e => e === undefined)) return 1
    if(animal.dressWeight === undefined) return 2
    if(validateEaters(animal.eaters)) return 3
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
    JSON.stringify(animal?.eaters.map(e => { return [e.id, e.portion, e.recordCard] })),

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
                <p>Kill Date</p>
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
                <p className="font-semibold">
                  Live Weight: 
                  <input type="number" disabled={currentState < 1} defaultValue={animal.liveWeight} onChange={e => {
                    animal.liveWeight = nanToUndefined(e.target.valueAsNumber)
                    animal.save()
                  }}/>
                  lb
                </p>
                <p className="font-semibold">
                  Color
                  <input type="text" disabled={currentState < 1} defaultValue={animal.color} onChange={e => {
                    animal.color = e.target.value
                    animal.save()
                  }}/>
                </p>
                <p className="font-semibold">
                  Sex
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
                </p>
                <p className="font-semibold">
                  Tag Number
                  <input type="number" disabled={currentState < 1} defaultValue={animal.tagNumber} onChange={e => {
                    animal.tagNumber = e.target.valueAsNumber
                    animal.save()
                  }}/>
                </p>
                <p className="font-semibold">
                  Pen Letter
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
                </p>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg mt-4">
            <div className="bg-gray-700 p-1 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Cutting Room Info</div>
            </div>
            <div className="p-4">
                <p className="font-semibold">Dress Weight</p>
                <p className="font-semibold">Eaters:</p>
                <StringUserTag name="Some Name" id={4} />
                <StringUserTag name="Some Other Name" id={2} />
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
        <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => console.log("go to animal")}>
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
            <p className="font-semibold">Record Card:</p>
            <StringUserTag name={name} id={4} />
          </div>
        </div>
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