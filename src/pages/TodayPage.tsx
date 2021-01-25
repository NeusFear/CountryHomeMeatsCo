import * as React from "react"
import { SvgCow, SvgEdit, SvgPig } from "../assets/Icons"
import { AnimalType, createEmptyAnimal, IAnimal } from "../database/types/Animal"

export const TodayPage = () => {
  return (
    <div className="w-full h-screen">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">TODAY</div>
        <div className="text-gray-700 ml-1 text-3xl">00/00/0000</div>
      </div>
      <div className="flex flex-row w-full h-full">
        <div className="h-5/6 flex-grow pl-4 pr-2 py-4">
          <div className="h-5/6 bg-gray-200 rounded-lg">
            <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Cut List</div>
              <SvgEdit className="mt-1 mr-1 text-gray-600 cursor-pointer hover:text-tomato-300" onClick={() => console.log("view list of hanging animals to select from")}/>
            </div>
            <SelectedCutList />
            <SelectedCutList />
            <SelectedCutList />
          </div>
        </div>
        <div className="h-5/6 pl-2 pr-4 py-4 flex-grow">
          <div className="h-5/6 bg-gray-200 rounded-lg pb-4">
            <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
              <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Scheduled Slaughters</div>
            </div>
            <SlaughterInfo />
            <SlaughterInfo />
          </div>
        </div>
      </div>
    </div>
  )
}

const SelectedCutList = () => {
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => console.log("go to animal")}>
      <div className="w-20">
        <SvgCow className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-0.5 ml-4 transform translate-y-1/2" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag name="The Bringer Name" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Eaters:</p>
        <UserTagAndNumber name="Some Name" id={4} />
        <UserTagAndNumber name="Some Other Name" id={2} />
      </div>
    </div>
  )
}

const SlaughterInfo = () => {
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => console.log("go to animal")}>
      <div className="w-20">
        <SvgCow className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-0.5 ml-4 transform translate-y-1/2" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag name="The Bringer Name" />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Eaters:</p>
        <UserTag name="Some Name" />
        <UserTag name="Some Other Name" />
      </div>
    </div>
  )
}

const UserTag = ({name} : {name: string}) => {
  return (
    <div className="flex">
      <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={() => console.log("go to bringer")}>{name}</p>
    </div>
  )
}

const UserTagAndNumber = ({name, id} : {name: string, id: number}) => {
  return (
    <div className="flex flex-row w-6/12 group">
      <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={() => console.log("go to sub user")}>{name}</p>
      <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={() => console.log("go to sub user's individual cut instructions")}>#{id}</p>
    </div>
  )
}