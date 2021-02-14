import { SvgTrash } from "../assets/Icons";

export const AddressBook = () => {
  
    return (
    <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
          <div className="text-white text-4xl font-bold ml-4">Address Book</div>
        </div>
        <div className="bg-gray-400 px-1 py-0.5 shadow-sm mb-2">
          <span className="ml-2 text-gray-700">This page keeps track of all the vendor and insurance phone numbers and things that are needed often.</span>
        </div>
        <div className="px-4 mt-4 h-full overflow-y-scroll">
          <PhoneEntry />
        </div>
      </div>
    )
}

const PhoneEntry = () => {
    return (
      <div className="cursor-pointer bg-gray-100 hover:shadow-md rounded-lg px-2 py-2 shadow-sm flex flex-row mb-2">
        <span className="pr-2 flex-1">Name</span>
        <span className="pr-2 flex-1 flex flex-row">(123)456-789</span>
        <span className="pr-2 flex-1 flex flex-row">something@email.com</span>
        <span className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-1 flex-shrink pt-1">
          <SvgTrash />
        </span>
      </div>
    )
  }