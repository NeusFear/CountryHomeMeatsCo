import { SvgSearch } from "../assets/Icons";

export const InvoicesPage = () => {

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
        </div>
        <div className="bg-gray-400 px-1 py-0.5 shadow-sm flex flex-row mb-2 pr-10">
          <span className="ml-6 text-gray-700 mr-8">Invoice</span>
          <span className="pl-2 text-gray-700 ml-2 w-1/6">User(s)</span>
          <span className="text-gray-700 w-1/6">Status</span>
          <span className="text-gray-700">Ammount</span>
          <span className="text-gray-700 ml-6">Portion</span>
          <span className="pr-2 flex-grow text-gray-700 ml-6">Eaters</span>
          <span className="w-24"></span>
        </div>
        <div className="px-4 mt-4 h-full overflow-y-scroll">
          <InvoiceEntry name="John Doe" id={8} status={false} ammount={800} />
          <InvoiceEntry name="John Bow" id={7} status={false} ammount={880} />
          <InvoiceEntry name="Joe Doe" id={4} status={false} ammount={750} />
          <InvoiceEntry name="Kale Doe" id={6} status={true} ammount={810} />
          <InvoiceEntry name="John Guy" id={5} status={true} ammount={8990} />
          <InvoiceEntry name="Guy Joe" id={3} status={true} ammount={943} />
          <InvoiceEntry name="Yer Nan" id={2} status={true} ammount={723} />
          <InvoiceEntry name="Yer GrandNan" id={1} status={true} ammount={812} />
        </div>
      </div>
    )
  }

const InvoiceEntry = ({ name, id, status, ammount }: {name: string, id: number, status: boolean, ammount: number}) => {
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row">
        <div className="text-gray-800 group-hover:text-gray-900 w-20 mr-2">
            <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300 w-full">#{id}</p>
        </div>
        <div className="text-gray-800 group-hover:text-gray-900 w-1/6">
          <div className="flex flex-row">
            <DataTag name={name} />
            <p className="mt-2 mx-1 text-xs">&</p>
            <DataTag name="Seccondary User" />
          </div>
        </div>
        <div className="text-gray-800 group-hover:text-gray-900 w-1/6">
          <p className={`${status ? "bg-green-100 hover:bg-green-200" : "bg-tomato-100 hover:bg-tomato-200"} px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer`}>{status ? "Paid" : "Pending"}</p>
        </div>
        <div className="text-gray-800 group-hover:text-gray-900 mx-2 w-20 mr-2">
          <p className="bg-orange-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-orange-300">${ammount}</p>
        </div>
        <div className="mx-4 text-gray-800 group-hover:text-gray-900">
            <DataTag name="Half" />
        </div>
        <div className="flex-grow text-gray-800 group-hover:text-gray-900">
          <div className="flex flex-row">
            <EaterTag name="Bobby Fresh" id={8} />
            <EaterTag name="Jonny Cache" id={2} />
            <EaterTag name="Wyns Mom" id={3} />
            <EaterTag name="Floppy Fish" id={1} />
          </div>
        </div>
      </div>
  )
}

const DataTag = ({ name }: { name: string }) => {
    return (
      <div className="flex">
        <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300">{name}</p>
      </div>
    )
}

const EaterTag = ({name, id}: {name: string, id: number}) => {
    return(
        <div className="flex flex-row">
            <div className="px-2 ml-2 bg-gray-200 rounded-md p-0.5 cursor-pointer hover:bg-gray-300">{name}</div>
            <div className="bg-gray-200 rounded-md px-2 mr-2 text-xs p-0.5 pt-1.5 cursor-pointer hover:bg-gray-300">#{id}</div>
        </div>
    )
}