import * as React from 'react'

export const NavPageButton = ({ Page }) => {
  return (
    <div className="flex items-center space-x-3 text-gray-700 p-2 rounded-md font-medium hover:bg-gray-200 bg-gray-200 focus:shadow-outline">
      <span>{Page}</span>
    </div>
  )
}