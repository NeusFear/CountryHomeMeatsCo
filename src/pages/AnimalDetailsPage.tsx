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
    return (<div>Error finding Info for user id {id}</div>)
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">ANIMAL INFO</div>
      </div>
      <div className="flex flex-row w-full mt-4 font-bold text-center">
        <div className="flex-grow p-2 rounded-md shadow-md my-1 mr-1 ml-4 border-4 border-tomato-600">Scheduled</div>
        <SvgArrow className="mx-2 h-6 w-8 transform translate-y-2/3 text-gray-400" />
        <div className="flex-grow p-2 rounded-md shadow-md m-1 border-4 border-orange-500">Confirmed</div>
        <SvgArrow className="mx-2 h-6 w-8 transform translate-y-2/3 text-gray-400" />
        <div className="flex-grow p-2 rounded-md shadow-md m-1 border-4 border-yellow-500">Arrived</div>
        <SvgArrow className="mx-2 h-6 w-8 transform translate-y-2/3 text-gray-400" />
        <div className="flex-grow p-2 rounded-md shadow-md m-1 border-4 border-indigo-200">Hanging</div>
        <SvgArrow className="mx-2 h-6 w-8 transform translate-y-2/3 text-gray-400" />
        <div className="flex-grow p-2 rounded-md shadow-md m-1 border-4 border-blue-700">Ready to Cut</div>
        <SvgArrow className="mx-2 h-6 w-8 transform translate-y-2/3 text-gray-400" />
        <div className="flex-grow p-2 rounded-md shadow-md m-1 border-4 border-teal-300">Ready to Pickup</div>
        <SvgArrow className="mx-2 h-6 w-8 transform translate-y-2/3 text-gray-400" />
        <div className="flex-grow p-2 rounded-md shadow-md my-1 ml-1 mr-2 border-4 border-green-600">Delivered</div>
      </div>
      <div className="flex-grow flex flex-row w-full">
        <div className="h-5/6 flex-grow pl-4 pr-2 py-4">
          <div className="h-5/6 bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Details</div>
            </div>
            {animal.animalType}
          </div>
        </div>
      </div>
    </div>
  )
}