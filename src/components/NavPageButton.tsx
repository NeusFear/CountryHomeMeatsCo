import * as React from 'react'

type Props = {
  page: string;
  icon: string;
}

export const NavPageButton = (props: Props) => {
  return (
    <div className="flex items-center space-x-3 text-gray-700 p-2 rounded-md font-medium hover:bg-gray-200 bg-gray-200 focus:shadow-outline">
      <img className="text-gray-600 w-8 h-8 bg-gray-700 hover:bg-gray-800" src={require(`./assets/icons/${props.icon}.svg`)} />
      <span>{props.page}</span>
    </div>
  )
}