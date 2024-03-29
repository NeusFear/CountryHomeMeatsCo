import { useHistory } from "react-router";
import { useSearchState } from "../AppHooks";
import { SvgSearch } from "../assets/Icons";
import DataTag, { FeedbackTypes } from "../components/DataTag";
import { DatabaseWait } from "../database/Database";
import Animal, { useAnimals } from "../database/types/Animal";
import Invoice, { IInvoice, useInvoice } from "../database/types/Invoices";
import User, { useUsers } from "../database/types/User";
import { editCutInstructions, setModal } from "../modals/ModalManager";
import { invoiceDetails, userDetailsPage } from "../NavBar";
import { formatQuaterText, paddedID } from "../Util";
import { calculateTotal } from "./InvoiceDetailsPage";

export const InvoicesPage = () => {
  const [search, setSearch, regExp] = useSearchState()
  const invoices = useInvoice(Invoice.find())
  const users = useUsers(User.where('name').regex(regExp).select(""), [search])

  const userIds = users === DatabaseWait ? DatabaseWait : users.map(u => u._id.toHexString())

  const filteredInvoices = invoices === DatabaseWait ? DatabaseWait : invoices.filter(i =>
    userIds.includes(i.user.toHexString()) ||
    regExp.test(`#${i.invoiceId}`)
  );

  const notPaidInvoices: IInvoice[] = []
  const paidInvoices: IInvoice[] = []

  if (filteredInvoices !== DatabaseWait) {
    filteredInvoices.forEach(i => (i.markedAsPaid ? paidInvoices : notPaidInvoices).push(i))
  }

  const sorter = (a: IInvoice, b: IInvoice) => a.invoiceId - b.invoiceId
  notPaidInvoices.sort(sorter)
  paidInvoices.sort(sorter)

  const combined = Array<IInvoice>().concat(notPaidInvoices, paidInvoices)


  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 py-2 px-2 flex flex-row justify-end">
        <div className="relative rounded-md shadow-sm flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">
              <SvgSearch />
            </span>
          </div>
          <input type="text" name="search" value={search} onChange={e => setSearch(e.target.value)} className="block w-full pl-9 pr-12 border-gray-300 rounded-md h-10" placeholder="Search" />
        </div>
      </div>
      <div className="bg-gray-400 px-1 py-0.5 shadow-sm flex flex-row mb-2 pr-10">
        <span className="ml-6 text-gray-700 mr-8">Invoice</span>
        <span className="pl-2 text-gray-700 ml-2 w-1/6">User(s)</span>
        <span className="text-gray-700 w-1/6">Status</span>
        <span className="text-gray-700">Amount</span>
        <span className="text-gray-700 ml-6">Portion</span>
        <span className="pr-2 flex-grow text-gray-700 ml-6">Eaters</span>
        <span className="w-24"></span>
      </div>
      <div className="px-4 mt-4 h-full overflow-y-scroll">
        {
          combined.map((invoice, i) => <InvoiceEntry key={i} invoice={invoice} />)
        }
      </div>
    </div>
  )
}

// const SearchBar

const InvoiceEntry = ({ invoice }: { invoice: IInvoice }) => {
  const history = useHistory()
  const animal = useAnimals(Animal.findById(invoice.animal), [invoice.animal], invoice.animal)
  const userIds = [invoice.user].filter(a => a != null)
  if (animal !== DatabaseWait) {
    animal?.eaters?.forEach(eater => {
      userIds.push(eater.id)
      if (eater.halfUser) {
        userIds.push(eater.halfUser.id)
      }
    })
  }
  const users = useUsers(User.where("_id").in(userIds).select("name cutInstructions"), [invoice.user, animal])

  const totalCost = animal === DatabaseWait ? 0 : calculateTotal(animal, invoice).total

  //This is a hacky way to find the invoice number by getting the genrated invoice amount.
  const invoiceNumber = animal === DatabaseWait ? undefined : animal.invoices.indexOf(invoice.id)
  const invoiceTagList = animal === DatabaseWait ? undefined : [animal.eaters[0]?.tag, animal.eaters[0]?.halfUser?.tag, animal.eaters[1]?.tag, animal.eaters[1]?.halfUser?.tag].filter(t => t !== undefined)

  const foundTag = animal === DatabaseWait ? "???" : invoiceTagList[invoiceNumber]

  const mainUser = users === DatabaseWait ? DatabaseWait : users.find(u => u._id == invoice.user.toHexString())
  const mainUserName = mainUser === DatabaseWait ? DatabaseWait : mainUser?.name ?? "???"
  // const subUserName = users === DatabaseWait || !invoice.secondaryUser ? DatabaseWait : users.find(u => u._id == invoice.secondaryUser.toHexString()).name ?? "???"

  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => history.push(invoiceDetails, invoice.id)}>
      <div className="text-gray-800 group-hover:text-gray-900 w-20 mr-2">
        <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300 w-full">#{paddedID(invoice.invoiceId)}</p>
      </div>
      <div className="text-gray-800 group-hover:text-gray-900 w-1/6">
        <div className="flex flex-row">
          {mainUserName !== DatabaseWait &&
            <>
              <DataTag name={mainUserName} onClick={() => history.push(userDetailsPage, invoice.user.toHexString())} />
              {/* { subUserName !== DatabaseWait &&
                 <>
                  <p className="mt-2 mx-1 text-xs">&</p>
                  <DataTag name={subUserName} onClick={() => history.push(userDetailsPage, invoice.secondaryUser.toHexString())} />
                 </>
                } */}
            </>
          }
        </div>
      </div>
      <div className="text-gray-800 group-hover:text-gray-900 w-1/6">
        <DataTag fill={true} name={invoice.markedAsPaid ? "Paid" : "Pending"} feedback={invoice.markedAsPaid ? FeedbackTypes.positive : FeedbackTypes.negative} />
      </div>
      <div className="text-gray-800 group-hover:text-gray-900 mx-2 w-20 mr-2">
        <DataTag name={`$${totalCost}`} feedback={FeedbackTypes.warning} />
      </div>
      <div className="mx-4 text-gray-800 group-hover:text-gray-900">
        <DataTag name={formatQuaterText(invoice.numQuaters)} />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <div className="flex flex-row">
          {mainUser !== DatabaseWait && mainUserName !== DatabaseWait &&
            <>
              <EaterTag
                name={mainUserName}
                tag={foundTag}
                cutInstruction={mainUser?.cutInstructions?.find(c => c.id === invoice.cutInstructionId)?.nickname ?? `#${invoice.cutInstructionId}`}
                onClick={() => history.push(userDetailsPage, invoice.user.toHexString())}
                onInstructionClicked={() => setModal(editCutInstructions, { id: invoice.user.toHexString(), instructionID: invoice.cutInstructionId })}
              />
              {/* { foundEater.halfUser != undefined && subUserName !== DatabaseWait &&
                 <>
                  <p className="mt-2 mx-1 text-xs">&</p>
                  <EaterTag name={subUserName} tag={foundEater.halfUser.tag} onClick={() => history.push(userDetailsPage, invoice.secondaryUser.toHexString())} />
                 </>
                } */}
            </>
          }
        </div>
      </div>
    </div>
  )
}

const EaterTag = ({ name, tag, cutInstruction, onClick, onInstructionClicked }: { name: string, tag: string, cutInstruction?: string, onClick?: () => void, onInstructionClicked?: () => void }) => {
  return (
    <div className="flex flex-row" onClick={e => { e.stopPropagation(); onClick() }}>
      <DataTag name={`${name} (${tag})`} />
      {cutInstruction !== undefined &&
        <DataTag name={cutInstruction} onClick={onInstructionClicked} />
      }
    </div>
  )
}