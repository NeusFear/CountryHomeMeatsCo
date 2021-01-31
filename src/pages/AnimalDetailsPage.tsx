import * as React from "react";
import { useHistoryListState } from "../AppHooks";
import { useHistory } from 'react-router-dom';
import Animal, {  useAnimals } from "../database/types/Animal";
import { SvgArrow } from "../assets/Icons";

export const AnimalDetailsPage = () => {
  const id = useHistoryListState()
  const animal = useAnimals(() => Animal.findById(id), [id], id)

  if(animal === undefined) {
    return (<div>Loading Info for animal id {id}</div>)
  }
  if(animal === null) {
    return (<div>Error finding Info for animal id {id}</div>)
  }

  const currentState = 4;

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">ANIMAL INFO</div>
      </div>
      <div className="flex flex-row w-full mt-4 font-bold text-center">
        <div className={`flex-grow p-2 rounded-md shadow-md my-1 mr-1 ml-4 border-4 ${currentState > 1 ? "border-green-500" : "border-gray-600"}`}>Scheduled</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState > 2 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState > 2 ? "border-green-500" : "border-gray-600"}`}>Confirmed</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState > 3 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState > 3 ? "border-green-500" : "border-gray-600"}`}>Arrived</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState > 4 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState > 4 ? "border-green-500" : "border-gray-600"}`}>Hanging</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState > 5 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState > 5 ? "border-green-500" : "border-gray-600"}`}>Ready to Cut</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState > 6 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md m-1 border-4 ${currentState > 6 ? "border-green-500" : "border-gray-600"}`}>Ready to Pickup</div>
        <SvgArrow className={`mx-2 h-6 w-8 transform translate-y-2/3 ${currentState > 7 ? "text-green-300" : "text-gray-400"}`} />
        <div className={`flex-grow p-2 rounded-md shadow-md my-1 ml-1 mr-2 border-4 ${currentState > 7 ? "border-green-500" : "border-gray-600"}`}>Delivered</div>
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
                <p className="font-semibold">Live Weight</p>
                <p className="font-semibold">Color</p>
                <p className="font-semibold">Sex</p>
                <p className="font-semibold">Tag Number</p>
                <p className="font-semibold">Pen Letter</p>
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