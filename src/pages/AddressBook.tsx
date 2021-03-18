import { SvgNewUser, SvgNotes, SvgSearch, SvgTrash } from "../assets/Icons";

export const AddressBook = () => {
  
    return (
      <div className="flex flex-col h-full">
        <div className="bg-gray-800 py-2 px-2 flex flex-row justify-end">
          <div className="relative rounded-md shadow-sm flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                <SvgSearch />
              </span>
            </div>
            <input type="text" name="search" className="block w-full pl-9 pr-12 border-gray-300 rounded-md h-10" placeholder="Search" />
          </div>
          <div className="transform cursor-pointer px-4 w-12 ml-1 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgSearch /></div>
          <div className="transform cursor-pointer px-4 w-12 ml-1 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgNewUser /></div>
        </div>
        <div className="bg-gray-400 px-1 py-0.5 shadow-sm flex flex-row mb-2">
          <span className="ml-4 pr-2 flex-1 text-gray-700">Company</span>
          <span className="pr-2 flex-1 text-gray-700 ml-2">Primary Contact</span>
          <span className="pr-2 flex-1 text-gray-700 ml-2">Phone Number</span>
          <span className="pr-2 flex-1 text-gray-700 ml-2">Email</span>
          <span className="w-24"></span>
        </div>
        <div className="px-4 mt-4 h-full overflow-y-scroll">
          <AddressBookEntry />
        </div>
    </div>
    )
}

const AddressBookEntry = () => {
    return (
      <div className="cursor-pointer bg-gray-100 hover:shadow-md rounded-lg px-2 py-2 shadow-sm flex flex-row mb-2">
        <span className="pr-2 flex-1">Amazon</span>
        <span className="pr-2 flex-1 flex flex-row">Jeff Bezos</span>
        <span className="pr-2 flex-1 flex flex-row">(123)456-789</span>
        <span className="pr-2 flex-1 flex flex-row">something@email.com</span>
        <span className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-1 flex-shrink pt-1">
          <SvgNotes />
        </span>
        <span className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-1 flex-shrink pt-1">
          <SvgTrash />
        </span>
      </div>
    )
  }