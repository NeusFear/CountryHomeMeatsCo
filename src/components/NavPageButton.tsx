import * as React from 'react'

export const NavPageButton = ({ Page, Icon }) => {
  return (
    <div className="group bg-gray-200 shadow-sm hover:shadow-lg hover:border-transparent p-1 ml-1 mr-2 my-2 rounded-lg">
      <Icon className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 float-left mr-2 mt-0.5" />
      <p className="text-gray-800 group-hover:text-gray-900">{Page}</p>
    </div>
  )
}