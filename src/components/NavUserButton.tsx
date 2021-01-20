import * as React from 'react'
import * as DummyDatabase from "../DummyDatabase"
import { SvgCross } from "../assets/Icons"

export const NavUserButton = ({id, onClick, onRemove, selected, Icon} : {id: number, onClick: any, onRemove: any, selected: boolean, Icon: any}) => {
    let details = DummyDatabase.getUserById(id)
    return (
      <div className={"group bg-gray-200 shadow-sm hover:shadow-lg p-1 ml-1 mr-2 my-2 rounded-lg flex flex-row" + (selected?" bg-tomato-400" : "")} onClick={onClick}>
        <Icon className="text-gray-800 group-hover:text-tomato-900 w-8 h-8 float-left" />
        <span className="text-gray-800 group-hover:text-gray-900 flex-grow ml-4">{details.name}</span>
        <span className="text-gray-800 hover:text-tomato-900 float-right flex items-center" onClick={e => { onRemove(); e.stopPropagation() }} ><SvgCross /></span>
      </div>
    )
  }