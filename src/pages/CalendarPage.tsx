import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Property } from 'csstype';
import InfiniteScroll from 'react-infinite-scroller';
import { IFullDaysConfig, useConfig } from '../database/types/Configs';
import { SvgArrow, SvgCow, SvgPig, SvgPlus } from '../assets/Icons';
import Animal, { AnimalType, IAnimal, useAnimals } from '../database/types/Animal';
import { normalizeDay } from '../Util';
import { list } from 'postcss';
import { ObjectId } from 'bson'
import User, { useUsers } from '../database/types/User';
import { useHistory } from 'react-router-dom';
import { animalDetailsPage } from '../NavBar';
import { calendarDayEntry, customDay, setModal } from '../modals/ModalManager';
import DayEvents, { useDayEvents, ICustomEvent } from '../database/types/DayEvents';
import { DatabaseWait, DatabaseWaitType } from '../database/Database';


const daysEqual = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

const daysBefore = (d1: Date, d2: Date) => {
  if (d1.getFullYear() < d2.getFullYear()) {
    return false;
  }
  if (d1.getDate() > d2.getDate() && d1.getMonth() >= d2.getMonth() && d1.getFullYear() >= d2.getFullYear()) {
    return true
  }
  if (d1.getMonth() <= d2.getMonth() && d1.getFullYear() <= d2.getFullYear()) {
    return false;
  }
  return true;
}

export const CalendarPage = () => {

  const users = useUsers(User.find().select("name"))
  const allUser = users === DatabaseWait ? DatabaseWait : users.reduce((map, u) => map.set(u.id, u.name), new Map<string, string>())
  const getUsername = (id: string) => allUser === DatabaseWait ? 'Loading' : allUser.get(id) ?? '???'

  const [items, setItems] = useState<{ weekEntry: number, start: Date }[]>([])
  const config = useConfig("FullDays")

  const todayElement = useRef<HTMLDivElement>()
  const scrollParent = useRef<HTMLDivElement>()

  if (allUser === DatabaseWait) {
    return (<div>Loading User Info</div>)
  }
  if (config === DatabaseWait) {
    return (<div>Loading Config</div>)
  }

  const loadMore = (num: number) => {
    const date = normalizeDay(new Date())
    date.setDate(date.getDate() - date.getDay() + (num - 5) * 7)
    const len = items.length
    items.push({ weekEntry: len, start: date })
    setItems([...items])
  }

  return (
    <>
      <div className="bg-tomato-300 transform -rotate-90 text-4xl w-12 h-12 rounded-full text-center absolute text-white bottom-8 right-12 z-50 shadow-lg cursor-pointer hover:bg-tomato-400 hover:shadow-xl" onClick={() => {
        if (todayElement.current !== undefined) {
          todayElement.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
      }}>
        <SvgArrow className="transform translate-x-1.5 translate-y-1.5" />
      </div>
      <div className="h-full flex flex-col">
        <div className="flex flex-row pt-3 pb-3 h-14 bg-gray-800">
          <div className="w-36 text-white font-semibold text-sm text-center pt-2 border-r border-white ml-2">SUNDAY</div>
          <div className="w-36 text-white font-semibold text-sm text-center pt-2 border-r border-white">MONDAY</div>
          <div className="w-36 text-white font-semibold text-sm text-center pt-2 border-r border-white">TUESDAY</div>
          <div className="w-36 text-white font-semibold text-sm text-center pt-2 border-r border-white">WEDNESDAY</div>
          <div className="w-36 text-white font-semibold text-sm text-center pt-2 border-r border-white">THURSDAY</div>
          <div className="w-36 text-white font-semibold text-sm text-center pt-2 border-r border-white">FRIDAY</div>
          <div className="w-36 text-white font-semibold text-sm text-center pt-2 border-r border-white">SATURDAY</div>
          <div className="w-36 text-white flex-grow font-semibold text-sm pt-2 border-r border-white pl-6 flex flex-row">
            <div className="flex-grow">
              SUMMARY
            </div>
          </div>
        </div>

        <div ref={scrollParent} className="flex-grow" style={{ overflowY: 'overlay' as Property.OverflowY }}>
          <InfiniteScroll
            hasMore={true}
            loader={<div className="loader" key={-1}>Loading ...</div>}
            loadMore={loadMore}
            useWindow={false}
            getScrollParent={() => scrollParent.current}
          >
            {items.map((d, i) => 
              <GridWeekEntry key={i} ref={todayElement} weekEntry={d.weekEntry} start={d.start} config={config} getUsername={getUsername} />
            )}
          </InfiniteScroll>
        </div>
      </div>
    </>
  )
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const

const DaysEnum = Object.freeze({"scheduledBeef":"bg-tomato-400 group-hover:bg-tomato-300", "scheduledPig":"bg-blue-300 group-hover:bg-blue-200", "somethingElse":"bg-green-300 group-hover:bg-green-200"})

const EventItem = ({ eventName, eventType }: { eventName: string, eventType: any }) => {
  return (
    <div className="flex flex-row bg-gray-200 h-4 ml-1 rounded-r-sm rounded-l-md mb-0.5 shadow-sm">
      <div className={`${eventType} w-2 rounded-l-md mr-2`}></div>
      <div className="text-xs">{eventName}</div>
    </div>
  )
}

const GridWeekEntry = forwardRef<HTMLDivElement,
  {
    weekEntry: number,
    start: Date,
    config: IFullDaysConfig,
    getUsername: (id: string) => string
  }
>
  (({ getUsername, weekEntry, start, config }, todayRef) => {
    const addDay = (day: number) => {
      const date = new Date(start)
      date.setDate(date.getDate() + day)
      return date
    }

    const nextWeek = useMemo(() => {
      const week = new Date(start)
      week.setDate(week.getDate() + 7)
      return week
    }, [start.getTime()])

    const borderSummary = useMemo(() => {
      const end = new Date(start)
      end.setDate(start.getDate() + 6)

      const endNextWeek = new Date(end)
      endNextWeek.setDate(end.getDate() + 7)

      if (weekEntry !== 0 && end.getDate() <= 7) {
        return "border-t"
      } else if (endNextWeek.getDate() <= 7) {
        return "border-b"
      }
      return ""
    }, [start.getTime(), weekEntry])

    const isThisWeek = useMemo(() => {
      const msBetween = new Date().getTime() - start.getTime()
      return msBetween >= 0 && msBetween <= 1000 * 60 * 60 * 24 * 7
    }, [start.getTime()])

    const isWeekFull = config.dates.some(d => daysEqual(d, start))

    //This is a weird way of doing what we want. Oh well
    const holidays = Array(7).fill(0).map((_, i) => useCalandarDates(addDay(i)))


    const customDays = useDayEvents(DayEvents.where('startDate').lt(nextWeek.getTime()).where("endDate").gte(start.getTime()).select("eventName eventColor startDate endDate noWork"), [ start.getTime() ])
    const getCustomsForDay: (day: number) => (DatabaseWaitType | ICustomEvent[]) = day => {
      if(customDays == DatabaseWait) {
        return DatabaseWait
      }
      const date = addDay(day)
      return customDays.filter(d => date.getTime() >= d.startDate.getTime() && date.getTime() <= d.endDate.getTime())
    }

    const animals = useAnimals(
      Animal.where('killDate').gte(start.getTime()).lt(nextWeek.getTime()).select('animalType bringer confirmed killDate'),
      [start.getTime()]
    )
    const getAnimalsForDay: (day: number) => (DatabaseWaitType | IAnimal[]) = day => {
      if(animals == DatabaseWait) {
        return DatabaseWait
      }
      const date = addDay(day)
      return animals.filter(d => d.killDate.getTime() == date.getTime())
    }

    


    const niceCustomDays = customDays === DatabaseWait ? [] : customDays
    const allHolidays = niceCustomDays.map(d => d.eventName).concat(holidays.flatMap(arr => arr.map(a => a.name)))

    const numBeef = animals === DatabaseWait ? '??' : animals.filter(a => a.animalType === AnimalType.Beef).length;
    const numPork = animals === DatabaseWait ? '??' : animals.filter(a => a.animalType === AnimalType.Pork).length;

    return (
      <div className="relative pl-2">
        <div ref={isThisWeek ? todayRef : null} className="flex flex-row">
          <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={0} day={addDay(0)} isWeekFull={isWeekFull} holidays={holidays[0]} customDays={getCustomsForDay(0)} animals={getAnimalsForDay(0)} />
          <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={1} day={addDay(1)} isWeekFull={isWeekFull} holidays={holidays[1]} customDays={getCustomsForDay(1)} animals={getAnimalsForDay(1)} />
          <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={2} day={addDay(2)} isWeekFull={isWeekFull} holidays={holidays[2]} customDays={getCustomsForDay(2)} animals={getAnimalsForDay(2)} />
          <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={3} day={addDay(3)} isWeekFull={isWeekFull} holidays={holidays[3]} customDays={getCustomsForDay(3)} animals={getAnimalsForDay(3)} />
          <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={4} day={addDay(4)} isWeekFull={isWeekFull} holidays={holidays[4]} customDays={getCustomsForDay(4)} animals={getAnimalsForDay(4)} />
          <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={5} day={addDay(5)} isWeekFull={isWeekFull} holidays={holidays[5]} customDays={getCustomsForDay(5)} animals={getAnimalsForDay(5)} />
          <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={6} day={addDay(6)} isWeekFull={isWeekFull} holidays={holidays[6]} customDays={getCustomsForDay(6)} animals={getAnimalsForDay(6)} />
          <div className={"p-1.5 w-28 h-36 flex-grow flex flex-col border-solid border-tomato-900 " + borderSummary}>
            <div className={`${isWeekFull ? 'bg-tomato-300' : 'bg-gray-300'} text-gray-900 flex-grow pt-1 pr-4`}>
              <div className="flex flex-row pr-4 transform -translate-y-3 absolute right-0 bottom-0">
                <div className="text-xs mt-1.5 mr-1">Full:</div>
                <input className="mt-1 h-5 w-5 rounded-md mr-2" type="checkbox" checked={isWeekFull} onChange={e => {
                  if (e.target.checked) {
                    config.dates.push(start)
                  } else {
                    config.dates = config.dates.filter(d => !daysEqual(d, start))
                  }
                  config.save()
                }} />
              </div>
              <EventItem eventType={DaysEnum.scheduledBeef} eventName={ numBeef + " Beef Scheduled"}/>
              <EventItem eventType={DaysEnum.scheduledPig} eventName={ numPork + " Pork Scheduled"} />
              {allHolidays.map((holiday, i) => <EventItem key={i} eventType={DaysEnum.somethingElse} eventName={holiday} /> )}
            </div>
          </div>
        </div>
        {nextWeek.getMonth() !== start.getMonth() &&
          <div className="absolute pt-0 z-10 px-2 text-xs font-semibold ml-4" style={{
            transform: 'translate(0, -50%)',
            backgroundImage: 'linear-gradient(to bottom, transparent, transparent 40%, white 40%, white 60%, transparent 60%)'
          }}>{months[nextWeek.getMonth()].toUpperCase().substring(0, 3) + ' ' + nextWeek.getFullYear()}</div>
        }
      </div>
    )
  })

type SingleEntry = {
  id: string
  allConfirmed: boolean,
  arrived: boolean,
  animalIds: ObjectId[]
  type: AnimalType
}

type SortedNameEntry = SingleEntry & { name: string }

export type AnimalEntriesType = {
  user: string;
  type: AnimalType;
  ids: ObjectId[];
}[]

const GridDayEntry = ({ entry, weekEntry, day, getUsername, isWeekFull, holidays, customDays, animals }: { entry: number, weekEntry: number, day: Date, getUsername: (id: string) => string, isWeekFull: boolean, holidays: HolidayEntry[], customDays: (DatabaseWaitType | ICustomEvent[]), animals: (DatabaseWaitType | IAnimal[]) } ) => {

  const sortedNamedEntries = animals === DatabaseWait ? [] :
    Array.from(animals
      //Create a map that essentially filters by id and type
      .reduce((map, animal) => {
        const str = animal.bringer.toHexString()
        const key = str + '#' + animal.animalType
        const old = map.get(key)
        const arr = old?.animalIds ?? []
        arr.push(animal.id)
        map.set(key, {
          id: str,
          animalIds: arr,
          allConfirmed: (old?.allConfirmed ?? true) && animal.confirmed,
          arrived: animal.arriveDate !== undefined,
          type: animal.animalType
        }
        )
        return map
      }, new Map<string, SingleEntry>())
      //Convert that to entries or get an empty array
      .values()
    )
      //Convert the map entries to a { name id count type } object
      .map(v => { return { name: getUsername(v.id), ...v } })
      //Sort by count
      .sort((a, b) => b.animalIds.length - a.animalIds.length)
      //Get the first 5 elements
      .slice(0, 5)

  const allUserAnimalEntries = sortedNamedEntries.map(e => {
    return {
      user: e.id,
      type: e.type,
      ids: e.animalIds
    }
  })


  // const customDays = useDayEvents(DayEvents.where('date', day).select("eventName eventColor"), [day.getTime()])

  const [hovering, setHovering] = useState(false)

  const borderClassText = useMemo(() => {
    const tommorow = new Date(day)
    tommorow.setDate(tommorow.getDate() + 1)

    const week = new Date(day)
    week.setDate(week.getDate() + 7)

    let result = ""
    if (entry !== 0 && day.getDate() === 1) {
      result += "border-l "
    } else if (entry !== 6 && tommorow.getDate() === 1) {
      result += "border-r "
    }

    if (weekEntry !== 0 && day.getDate() <= 7) {
      result += "border-t"
    } else if (week.getDate() <= 7) {
      result += "border-b"
    }

    return result
  }, [entry, day.getTime()])

  const isToday = useMemo(() => daysEqual(new Date(), day), [day.getTime()])
  const isBeforeToday = useMemo(() => daysBefore(new Date(), day), [day.getTime()])

  let bg;
  if(isWeekFull || (customDays !== DatabaseWait && customDays.some(d => d.noWork))) {
    if(isBeforeToday) {
      bg = "border-tomato-400 bg-gray-400"
    } else {
      bg = "border-tomato-100 bg-gray-100"
    }
  } else {
    if(isBeforeToday) {
      bg = "border-transparent bg-gray-400"
    } else {
      bg = "border-transparent bg-gray-100"
    }
  }

  return (
    <div className={"flex flex-col p-1.5 w-36 h-36 border-solid border-tomato-900 text-xs font-semibold " + borderClassText.toUpperCase()}>
      <div onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)} className={`${isToday ? 'border-2 border-solid border-blue-500' : ''} ${bg} border-2 text-gray-900 flex-grow relative`}>
        <div className="flex flex-col p-1">
          {sortedNamedEntries.map((e, i) => <GridDayAnimalEntry key={i} day={day} dayData={allUserAnimalEntries} {...e} />)}
          {customDays !== DatabaseWait && customDays.map((e, i) => <CustomDayEntry key={i} event={e} />)}
          {holidays.map((e, i) => <GridHolidayEntry key={i} holiday={e} />)}
        </div>
        <div className="absolute bottom-0 right-1">
          {day.getDate()}
        </div>
        {hovering && <div className="absolute -left-0 -bottom-0 cursor-pointer bg-blue-300 p-1 rounded-sm text-white" onClick={() => setModal(customDay, { date: day })}><SvgPlus /></div>}
      </div>
    </div>
  )
}

const CustomDayEntry = ({ event }: { event: ICustomEvent }) => {
  return (
    <div onClick={() => setModal(customDay, { objectId: event.id })} className="flex flex-row cursor-pointer mt-0.5 rounded-sm " style={{
      backgroundColor: event.eventColor
    }}>
      <div className="w-1.5 mr-0.5 rounded-l-sm bg-gray-600 hover:bg-gray-500"></div>
      <div className="flex-grow flex flex-col">
        <div>{event.eventName}</div>
      </div>
    </div>
  )
}

const GridDayAnimalEntry = ({ name, animalIds, id, type, allConfirmed, arrived, day, dayData }: SortedNameEntry & { day: Date, dayData: AnimalEntriesType }) => {

  const isBeforeToday = useMemo(() => daysBefore(new Date(), day), [day.getTime()])
  let confBg = '';
  if (isBeforeToday) {
    confBg = "bg-gray-700";
  } else if (allConfirmed) {
    confBg = "bg-green-500";
  } else {
    confBg = "bg-tomato-400";
  }

  let background = '';
  if (isBeforeToday) {
    background = "bg-gray-600 hover:bg-gray-500";
  } else if (type === AnimalType.Beef) {
    background = "bg-tomato-200 hover:bg-tomato-100";
  } else {
    background = "bg-blue-200 hover:bg-blue-100";
  }

  return (
    <div className={`flex flex-row cursor-pointer mt-0.5 rounded-sm ${background}`} onClick={() => {
      setModal(calendarDayEntry, { day, selectedType: type, selectedUserID: id, dayData })
    }}>
      <div className={`w-1.5 mr-0.5 rounded-l-sm ${confBg}`}></div>
      <div className="flex-grow flex flex-col">
        <div className="pl-1 pr-2 text-base flex flex-row">{type === AnimalType.Beef ? <SvgCow /> : <SvgPig />} <p className="text-xs ml-2">{animalIds.length} {arrived ? " Arrived" : ""}</p></div>
        <div>{name}</div>
      </div>
    </div>
  )
}

const GridHolidayEntry = ({ holiday }: { holiday: HolidayEntry }) =>
  <div className="flex flex-row mt-0.5 rounded-sm bg-green-200">
    <div>{holiday.name}</div>
  </div>

const calandarCache = new Map<number, Promise<HolidayEntry[]>>()

const disabledDays = [
  "First Day of Women's History Month",
  "First Day of Asian American and Pacific Islander Heritage Month",
  "Juneteenth",
  "Day off for Christmas Day",
  "Day off for New Year's Day",
  "First Day of Black History Month",
  "Easter Monday",
  "Native American Heritage Day",
  "Day off for Juneteenth",
  "First Day of Hispanic Heritage Month",
  "Indigenous Peoples' Day"
]

export const useCalandarDates = (date: Date) => {
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const normalized = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)).toISOString()
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 0)).toISOString()

  if (!calandarCache.has(normalized.getTime())) {
    const url = "https://www.googleapis.com/calendar/v3/calendars/en.usa%23holiday%40group.v.calendar.google.com/events"
    const key = "AIzaSyDAPB2hFIxAtXgD1KEIJvoNJg6J-JWm64s"

    console.log(`fetching: ${start} ==> ${end}`)
    const promise = fetch(`${url}?key=${key}&timeMin=${start}&timeMax=${end}`)
      .then(r => r.json())
      .then(json => {
        const arr: HolidayEntry[] = []

        json.items.forEach(item => {
          if (!disabledDays.includes(item.summary)) {
            arr.push({
              name: item.summary.replace("(regional holiday)", "").replace("Martin Luther King Jr. Day", "MLK Jr. Day").replace("Thanksgiving Day", "Thanksgiving"),
              date: new Date(item.start.date)
            })
          }
        })

        promise['resolvedArray'] = arr
        return arr
      })
    calandarCache.set(normalized.getTime(), promise)
  }

  const getDatesFromMonth = (dates: HolidayEntry[]) => dates.filter(d => d.date.getTime() == date.getTime())

  const promise = calandarCache.get(normalized.getTime())
  const resolved = promise['resolvedArray'] !== undefined
  const [state, setState] = useState(() => {
    if (resolved) {
      return getDatesFromMonth(promise['resolvedArray'])
    }
    return []
  })

  if (!resolved) {
    promise.then(r => setState(getDatesFromMonth(r)))
  }

  return state
}

type HolidayEntry = {
  name: string,
  date: Date
}