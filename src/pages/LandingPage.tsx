import { SvgAddressbook, SvgPrices, SvgTimesheets } from "../assets/Icons"
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import { timeSheet, addressBook, priceSheet } from "../NavBar";
import { IGlobalNotes, useConfig } from "../database/types/Configs";
import { DatabaseWait } from "../database/Database";
import { useRef, useState, useMemo } from "react";
import DayEvents, { ICustomEvent, useDayEvents } from "../database/types/DayEvents";
import { normalizeDay } from "../Util";
import Animal, { AnimalType, IAnimal, useAnimals } from "../database/types/Animal";
import { useCalandarDates } from "./CalendarPage";
import { CSSProperties } from "react"

export const LandingPage = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">COUNTRY HOME MEATS</div>
      </div>
      <div className="flex-grow flex flex-row p-4 overflow-hidden">
        <div className="w-2/5 flex-grow bg-gray-200 rounded-lg">
          <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1">Notes</div>
          <div className="bg-white m-2">
            <NotesEdit />
          </div>
        </div>
        <div className="w-2/5 flex-grow bg-gray-200 mx-4 h-full rounded-lg">
          <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1">Upcoming Events</div>
          <div className="flex flex-col mb-4 h-full">
            <UpcomingEvents />
          </div>
        </div>
        <div className="w-1/5 h-full flex-grow flex flex-col">
          <Link to={timeSheet} className="w-full h-1/3 rounded-lg text-white text-7xl bg-green-200 hover:bg-green-100 text-center shadow-sm hover:shadow-md border-4 border-green-600">
            <SvgTimesheets className="relative w-1/3 h-1/3 ml-1 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-2/3" />
            <p className="text-xl relative left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-3/4">Time Sheet</p>
          </Link>
          <Link to={addressBook} className="w-full h-1/3 rounded-lg my-4 text-white text-7xl bg-tomato-200 hover:bg-tomato-100 text-center shadow-sm hover:shadow-md border-4 border-tomato-600">
            <SvgAddressbook className="relative w-1/3 h-1/3 ml-1 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-2/3" />
            <p className="text-xl relative left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-3/4">Address Book</p>
          </Link>
          <Link to={priceSheet} className="w-full h-1/3 rounded-lg text-white text-7xl bg-blue-200 hover:bg-blue-100 text-center shadow-sm hover:shadow-md border-4 border-blue-600">
            <SvgPrices className="relative w-1/3 h-1/3 ml-1 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-2/3" />
            <p className="text-xl relative left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-3/4">Price List</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

const NotesEdit = () => {
  const notes = useConfig("GlobalNotes")
  if(notes === DatabaseWait) {
    return <span>Loading...</span>
  }
  return (
    <textarea className="w-full h-5/6" value={notes.globalNotes} onChange={v => {
      notes.globalNotes = v.currentTarget.value
      notes.save()
    }} />
  )
}

const UpcomingEvents = () => {

  const scrollParent = useRef<HTMLDivElement>()

  const time = normalizeDay().getTime()
  const customEvents = useDayEvents(DayEvents.where("endDate").gte(time))
  const scheduledAnimals = useAnimals(Animal.where("killDate").gte(time).select("killDate"))

  const [dates, setDates] = useState<Date[]>([])

  const loadMore = (num: number) => {
    const date = normalizeDay()
    date.setDate(date.getDate() - 1 + num)
    dates.push(date)
    setDates([...dates])
  }

  if(customEvents === DatabaseWait || scheduledAnimals === DatabaseWait) {
    return <div>Loading....</div>
  }

  return (
    <div ref={scrollParent} className="overflow-y-scroll h-full">
        <InfiniteScroll
        className="h-full"
        hasMore={true}
        loader={<div className="loader" key={-1}>Loading ...</div>}
        loadMore={loadMore}
        useWindow={false}
        getScrollParent={() => scrollParent.current}
      >
        {dates.map((d, i) => 
          <UpcomingDay key={i} date={d} customEvents={customEvents} scheduledAnimals={scheduledAnimals} />
        )}
      </InfiniteScroll>
    </div>
  )
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const UpcomingDay = ({date, customEvents, scheduledAnimals}: {date: Date, customEvents: ICustomEvent[], scheduledAnimals: IAnimal[]}) => {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const [daysAway, thisYear] = useMemo(() => {
    const now = normalizeDay()
    const time = date.getTime() - now.getTime()
    return [ time / (1000*60*60*24), date.getFullYear() === now.getFullYear() ] as const
  }, [])

  const events = useMemo(() => customEvents.filter(e => date.getTime() >= e.startDate.getTime() && date.getTime() <= e.endDate.getTime()), [date.getTime(), customEvents])
  const animals = useMemo(() => {
    const animals = scheduledAnimals.filter(e => e.killDate.getTime() === date.getTime())
    let pork = 0
    let beef = 0
    animals.forEach(a => {
      if(a.animalType === AnimalType.Beef) {
        beef++
      } else {
        pork++
      }
    })
    return { pork, beef }
  }, [date.getTime(), scheduledAnimals])
  const holidays = useCalandarDates(date)
  
  let dayLabel: string

  if(daysAway === 0) {
    dayLabel = "Today"
  } else if(daysAway === 1) {
    dayLabel = "Tommorow"
  } else {
    dayLabel = daysOfWeek[date.getDay()] + " " + String(date.getDate()).padStart(2, "0") + " " + monthsOfYear[date.getMonth()] + (thisYear ? "" : (" " + date.getFullYear()))
  }
  return (
    <div className="mb-3">
      <div className="bg-gray-300 px-6 mb-1 group w-full">
        <div className="w-full text-sm">{dayLabel}</div>
      </div>
      { !isWeekend && animals.beef > 0 &&
        <>
          <EventItem eventName={`${animals.beef} Beef Scheduled`} eventType="bg-tomato-400 group-hover:bg-tomato-300" />
        </>
      }
      { !isWeekend && animals.pork > 0 &&
        <>
          <EventItem eventName={`${animals.pork} Pork Scheduled`} eventType="bg-blue-300 group-hover:bg-blue-200" />
        </>
      }
  
      { events.map((e, i) => <EventItem key={i} eventName={e.eventName} eventStyle={{backgroundColor: e.eventColor}} />) }
      { holidays.map((e, i) => <EventItem key={i} eventName={e.name} eventType="bg-green-300 group-hover:bg-green-200" />) }

      {/* Maybe just move this to a minimum height ?? */}
      { ((isWeekend && events.length === 0 && holidays.length === 0 ) || (animals.beef <= 0 && animals.pork <= 0)) && <div className="h-5 rounded-sm group mt-3 mb-2 text-xs pl-8">Empty</div>}
    </div>
  )
}

const EventItem = ({ eventName, eventType, eventStyle }: { eventName: string, eventType?: string, eventStyle?: CSSProperties }) => {
  return (
    <div className="flex flex-row bg-white hover:bg-gray-100 h-5 mx-4 rounded-sm group mb-2 shadow-sm hover:shadow-md">
      <div className={`${eventType ?? ""} w-2 rounded-l-md mr-2`} style={eventStyle}></div>
      <div className="text-sm">{eventName}</div>
    </div>
  )
}
