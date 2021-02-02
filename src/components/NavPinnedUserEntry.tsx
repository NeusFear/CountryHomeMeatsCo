import { SvgUser, SvgCross } from "../assets/Icons"
import User, { useUsers } from '../database/types/User'

export const NavPinnedUserEntry = ({id, onClick, onRemove, selected} : {id: string, onClick: any, onRemove: any, selected: boolean}) => {
  const details = useUsers(User.findById(id), [id], id)
  if(details === undefined) {
    return (<div>Loading Info...</div>)
  }
  return (
      <div className={"group bg-gray-200 shadow-sm hover:shadow-lg p-1 ml-1 mr-2 my-2 rounded-lg flex flex-row cursor-pointer" + (selected?" bg-tomato-400" : "")} onClick={onClick}>
        <SvgUser className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 float-left" />
        <span className="text-gray-800 group-hover:text-gray-900 flex-grow ml-4">{details.name}</span>
        <span className="text-gray-800 hover:text-tomato-900 float-right flex items-center" onClick={e => { onRemove(); e.stopPropagation() }} ><SvgCross /></span>
      </div>
    )
  }