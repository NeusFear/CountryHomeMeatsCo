import { Link } from "react-router-dom"
import { DatabaseWait } from "../database/Database"
import { IInvoice } from "../database/types/Invoices"
import User, { useUsers } from "../database/types/User"
import { invoiceDetails } from "../NavBar"
import { formatQuaterText } from "../Util"

export default ({invoice}: {invoice: IInvoice}) => {
    const cutInstructionUser = useUsers(User.findById(invoice.cutInstructionUser), [invoice.cutInstructionUser], invoice.cutInstructionUser)
   
    if(cutInstructionUser === DatabaseWait) {
      return <div>Loading Users...</div>
    }
  
    return (
      <Link to={{
        pathname: invoiceDetails,
        state: invoice.id
      }} className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row">
        <div className="w-1/6 text-gray-800 group-hover:text-gray-900">
          <p className="font-semibold">Invoice:</p>
          <DataTag name={String(invoice.invoiceId)} />
        </div>
        <div className="w-1/5 text-gray-800 group-hover:text-gray-900">
          <p className="font-semibold">Status:</p>
          <p className={`${invoice.dateTimePaid ? "bg-green-100 hover:bg-green-200" : "bg-tomato-100 hover:bg-tomato-200"} px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer`}>{invoice.dateTimePaid ? "Paid" : "Pending"}</p>
        </div>
        <div className="w-1/6 mx-4 text-gray-800 group-hover:text-gray-900">
            <p className="font-semibold">Portion:</p>
            <DataTag name={formatQuaterText(invoice.numQuaters)} />
        </div>
        <div className="flex-grow text-gray-800 group-hover:text-gray-900">
          <p className="font-semibold">Cut List:</p>
          <div className="flex flex-row">
            <div className="px-2 ml-2 bg-gray-200 rounded-md p-0.5">{cutInstructionUser?.name}</div>
            <div className="bg-gray-200 rounded-md px-2 ml-1 text-xs p-0.5 pt-1.5">{cutInstructionUser?.cutInstructions?.find(c => c.id === invoice.cutInstructionId)?.nickname ?? `#${invoice.cutInstructionId}`}</div>
          </div>
        </div>
      </Link>
    )
}

const DataTag = ({ name }: { name: string }) => {
    return (
      <div className="flex">
        <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300">{name}</p>
      </div>
    )
}