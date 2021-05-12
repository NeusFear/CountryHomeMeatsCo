import { useMemo, useState } from "react";
import { SvgEdit, SvgNewUser, SvgNotes, SvgSearch, SvgTrash } from "../assets/Icons";
import Vendor, { IVendor, useVendors } from "../database/types/Vendor";
import { editUserDetails, editVendorDetails, setModal } from "../modals/ModalManager";

export const AddressBook = () => {

  const [search, setSearch] = useState<string>('')
  const regExp = useMemo(() => new RegExp(search.split(' ').filter(s => s.trim().length !== 0).map(s => `(${s})`).join('|'), 'i'), [search])
  const vendors = useVendors(Vendor.find().or([{ company: regExp }, { primaryContact: regExp }]), [search])

  const deleteEntry = (vendor: IVendor) => {
    vendor.delete()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 py-2 px-2 flex flex-row justify-end">
        <div className="relative rounded-md shadow-sm flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">
              <SvgSearch />
            </span>
          </div>
          <input type="text" name="search" className="block w-full pl-9 pr-12 border-gray-300 rounded-md h-10" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="transform cursor-pointer px-4 w-12 ml-1 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgSearch /></div>
        <div onClick={() => setModal(editVendorDetails)} className="transform cursor-pointer px-4 w-12 ml-1 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgNewUser /></div>
      </div>
      <div className="bg-gray-400 px-1 py-0.5 shadow-sm flex flex-row mb-2">
        <span className="ml-4 pr-2 flex-1 text-gray-700">Company</span>
        <span className="pr-2 flex-1 text-gray-700 ml-2">Primary Contact</span>
        <span className="pr-2 flex-1 text-gray-700 ml-2">Phone Number</span>
        <span className="pr-2 flex-1 text-gray-700 ml-2">Email</span>
        <span className="w-24"></span>
      </div>
      <div className="px-4 mt-4 h-full overflow-y-scroll">
        {vendors !== undefined && vendors.map(d => <AddressBookEntry key={d.id} details={d} deleteUserDetails={() => deleteEntry(d)} />)}
      </div>
    </div>
  )
}

const AddressBookEntry = ({ details, deleteUserDetails }: { details: IVendor, deleteUserDetails: () => void }) => {
  return (
    <div className="cursor-pointer bg-gray-100 hover:shadow-md rounded-lg px-2 py-2 shadow-sm flex flex-row mb-2">
      <span className="pr-2 flex-1">{details.company}</span>
      <span className="pr-2 flex-1 flex flex-row">{String(details.primaryContact)}</span>
      <span className="pr-2 flex-1 flex flex-col">{
        details.phoneNumbers.map((number, i) => <div key={i}>{number.name}: {number.number}</div>)
      }</span>
      <span className="pr-2 flex-1 flex flex-col">{
        details.emails.map((email, i) => <div key={i}>{email}</div>)
      }</span>
      <span onClick={() => setModal(editVendorDetails, details.id)} className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-1 flex-shrink pt-1">
        <SvgEdit />
      </span>
      <span className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-1 flex-shrink pt-1">
        <SvgNotes />
      </span>
      <span className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-1 flex-shrink pt-1">
        <SvgTrash />
      </span>
    </div>
  )
}