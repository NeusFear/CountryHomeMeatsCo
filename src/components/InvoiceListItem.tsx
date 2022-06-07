import { MouseEvent } from "react"
import { Link } from "react-router-dom"
import { SvgRefresh } from "../assets/Icons"
import { DatabaseWait } from "../database/Database"
import Animal, { useAnimals } from "../database/types/Animal"
import { useConfig } from "../database/types/Configs"
import { generateInvoice, IInvoice } from "../database/types/Invoices"
import User, { useUsers } from "../database/types/User"
import { invoiceDetails } from "../NavBar"
import { formatQuaterText } from "../Util"
import DataTag from "./DataTag"

export default ({ invoice }: { invoice: IInvoice }) => {
  const user = useUsers(User.findById(invoice.user), [invoice.user], invoice.user)
  const animal = useAnimals(Animal.findById(invoice.animal), [invoice.animal], invoice.animal)
  const priceConfig = useConfig("PriceData")
  const cutInstructionUser = useUsers(User.findById(invoice.cutInstructionUser), [invoice.cutInstructionUser], invoice.cutInstructionUser)

  if (cutInstructionUser === DatabaseWait || user === DatabaseWait) {
    return <div>Loading Users...</div>
  }

  if (animal === DatabaseWait) {
    return <div>Loading Animal...</div>
  }

  if (priceConfig === DatabaseWait) {
    return <div>Loading Price Data...</div>
  }

  const regenerateInvoice = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    generateInvoice(
      animal, user, priceConfig.currentPrices, cutInstructionUser, invoice.cutInstructionId,
      cutInstructionUser.cutInstructions.find(c => c.id === invoice.cutInstructionId).instructions,
      invoice.invoiceId, invoice.numQuaters,
      invoice
    )

  }

  return (
    <Link to={{
      pathname: invoiceDetails,
      state: invoice.id
    }} className="group relative bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row">
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
      <div onClick={regenerateInvoice} className="m-0.5 p-0.5 absolute right-0 top-0 text-blue-300 hover:text-blue-800">
        <SvgRefresh className="w-4 h-4" />
      </div>
    </Link>
  )
}