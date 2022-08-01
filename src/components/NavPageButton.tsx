import { useHistoryUrl } from "../AppHooks"

export const NavPageButton = ({ to, Page, Icon }: { to: string, Page: string, Icon: (props: any) => JSX.Element }) => {
  const url = useHistoryUrl()
  return (
    <div className={(to === url ? "bg-blue-200" : "bg-gray-200") + " group shadow-sm hover:shadow-lg hover:border-transparent p-1 ml-1 mr-2 my-2 rounded-lg"}>
      <Icon className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 float-left mr-2 mt-0.5" />
      <p className="text-gray-800 group-hover:text-gray-900">{Page}</p>
    </div>
  )
}