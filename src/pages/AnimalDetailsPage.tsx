import * as React from "react";
import { useHistoryListState } from "../AppHooks";
import { useHistory } from 'react-router-dom';
import Animal, {  useAnimals } from "../database/types/Animal";

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
    <div className="w-full h-screen">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">ANIMAL INFO</div>
      </div>
      <div className="flex flex-row w-full h-full">
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