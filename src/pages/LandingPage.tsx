import { SvgAddressbook, SvgPrices, SvgTimesheets } from "../assets/Icons"

export const LandingPage = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">COUNTRY HOME MEATS</div>
      </div>
      <div className="flex-grow flex flex-col p-4">
        <div className="bg-gray-200 h-1/5 rounded-lg">
          No special events today.
        </div>
        <div className="flex flex-row mt-4 flex-grow">
          <div className="flex-grow bg-gray-200 h-full rounded-lg">
            <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1">Upcoming Events</div>
            <div className="bg-white m-2">
              Some notes go here<br />
              more notes<br />
              something else<br />
              <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
            </div>
          </div>
          <div className="flex-grow bg-gray-200 mx-4 h-full rounded-lg">
            <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1">Upcoming Events</div>
            <div className="flex flex-col overflow-y-scroll mb-4">

              <EventDivider label="Today" />
              <EventItem eventType={DaysEnum.scheduledBeef} eventName="7 Beef Scheduled"/>
              <EventItem eventType={DaysEnum.scheduledPig} eventName="7 Pork Scheduled" />
              <EventItem eventType={DaysEnum.somethingElse} eventName="Jessee's Birthday" />
              <EventDivider label="Tomorrow" />
              <EventItem eventType={DaysEnum.scheduledBeef} eventName="7 Beef Scheduled"/>
              <EventItem eventType={DaysEnum.scheduledPig} eventName="7 Pork Scheduled" />
              <EventItem eventType={DaysEnum.somethingElse} eventName="Someone's Birthday" />
              <EventItem eventType={DaysEnum.somethingElse} eventName="Someone's Anniversary" />

            </div>
          </div>
          <div className="w-1/5 h-full flex flex-col">
            <div className="rounded-lg flex-grow text-white text-7xl bg-green-600 hover:bg-green-500 text-center shadow-sm hover:shadow-md">
              <br />
              <SvgTimesheets className="w-full ml-1" />
              <p className="text-xl">Time Sheet</p>
            </div>
            <div className="rounded-lg my-4 flex-grow text-white text-7xl bg-tomato-600 hover:bg-tomato-500 text-center shadow-sm hover:shadow-md">
              <br /> 
              <SvgAddressbook className="w-full ml-1" />
              <p className="text-xl">Address Book</p>
            </div>
            <div className="rounded-lg flex-grow text-white text-7xl bg-blue-600 hover:bg-blue-500 text-center shadow-sm hover:shadow-md">
              <br />
              <SvgPrices className="w-full ml-1" />
              <p className="text-xl">Price List</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DaysEnum = Object.freeze({"scheduledBeef":"bg-tomato-800 group-hover:bg-tomato-700", "scheduledPig":"bg-green-400 group-hover:bg-green-300", "somethingElse":"bg-blue-700 group-hover:bg-blue-600"})

const EventItem = ({ eventName, eventType }: { eventName: string, eventType: any }) => {
  return (
    <div className="flex flex-row bg-white hover:bg-gray-100 h-5 mx-4 rounded-sm group mb-2 shadow-sm hover:shadow-md">
      <div className={`${eventType} w-2 rounded-l-md mr-2`}></div>
      <div className="text-sm">{eventName}</div>
    </div>
  )
}

const EventDivider = ({ label }: { label: string }) => {
  return (
    <div className="bg-gray-300 h-5 px-6 group mb-2 w-full">
      <div className="w-full text-sm">{label}</div>
    </div>
  )
}