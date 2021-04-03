import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Property } from 'csstype';
import InfiniteScroll from 'react-infinite-scroller';
import { IFullDaysConfig, useConfig } from '../database/types/Configs';
import { SvgArrow, SvgCow, SvgPig } from '../assets/Icons';
import Animal, { AnimalType, useAnimals } from '../database/types/Animal';
import { normalizeDay } from '../Util';
import { list } from 'postcss';
import { ObjectId } from 'bson'
import User, { useUsers } from '../database/types/User';
import { useHistory } from 'react-router-dom';
import { animalDetailsPage } from '../NavBar';
import { calendarDayEntry, setModal } from '../modals/ModalManager';


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

  const allUser = useUsers(User.find().select("name"))?.reduce((map, u) => map.set(u.id, u.name), new Map<string, string>())
  const getUsername = (id: string) => allUser.get(id) ?? '???'

  const [items, setItems] = useState<(() => JSX.Element)[]>([])
  const config = useConfig("FullDays")

  const todayElement = useRef<HTMLDivElement>()

  const loadMore = (num: number) => {
    const date = normalizeDay(new Date())
    date.setDate(date.getDate() - date.getDay() + (num-5)*7)
    const len = items.length
    items.push(
      () => <GridWeekEntry ref={todayElement} key={len} weekEntry={len} start={date} config={config} getUsername={getUsername}/>
    )
    setItems([...items])
  }

  const scrollParent = useRef<HTMLDivElement>()

  if(allUser === undefined) {
    return (<div>Loading User Info</div>)
  }
  if(config === undefined) {
    return (<div>Loading Config</div>)
  }

  return (
    <>
      <div className="bg-tomato-300 transform -rotate-90 text-4xl w-12 h-12 rounded-full text-center absolute text-white bottom-8 right-12 z-50 shadow-lg cursor-pointer hover:bg-tomato-400 hover:shadow-xl" onClick={() => {
          if(todayElement.current !== undefined) {
            todayElement.current.scrollIntoView( { block: 'center', behavior: 'smooth' } )
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

        <div ref={scrollParent} className="flex-grow" style={{overflowY:'overlay' as Property.OverflowY}}>
          <InfiniteScroll 
            hasMore={true}
            loader={<div className="loader" key={0}>Loading ...</div>} 
            loadMore={loadMore}
            useWindow={false}
            getScrollParent={() => scrollParent.current}
          >
            {items.map(f => f())}
          </InfiniteScroll>
        </div>
      </div>
    </>
  )
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const

const GridWeekEntry = forwardRef<HTMLDivElement, 
{ 
  weekEntry: number, 
  start: Date, 
  config: IFullDaysConfig,
  getUsername: (id: string) => string
}>(({getUsername, weekEntry, start, config}, todayRef) => {
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

    if(weekEntry !== 0 && end.getDate() <= 7) {
      return "border-t"
    } else if(endNextWeek.getDate() <= 7) {
      return "border-b"
    }
    return ""
  }, [start.getTime(), weekEntry])

  const isThisWeek = useMemo(() => {
    const msBetween = new Date().getTime()- start.getTime()
    return msBetween >= 0 && msBetween <= 1000*60*60*24*7
  }, [start.getTime()])

  const isWeekFull = config.dates.some(d => daysEqual(d, start))

  return (
    <div className="relative pl-2">
      <div ref={isThisWeek?todayRef:null} className="flex flex-row">  
        <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={0} day={addDay(0)}/>
        <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={1} day={addDay(1)}/>
        <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={2} day={addDay(2)}/>
        <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={3} day={addDay(3)}/>
        <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={4} day={addDay(4)}/>
        <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={5} day={addDay(5)}/>
        <GridDayEntry getUsername={getUsername} weekEntry={weekEntry} entry={6} day={addDay(6)}/>
        <div className={"p-1.5 w-28 h-36 flex-grow flex flex-col border-solid border-tomato-900 " + borderSummary}>
          <div className={`${isWeekFull?'bg-tomato-600':'bg-gray-300'} text-gray-900 flex-grow`}>
            Full: <input type="checkbox" checked={isWeekFull} onChange={e => {
              if(e.target.checked) {
                config.dates.push(start)
              } else {
                config.dates = config.dates.filter(d => !daysEqual(d, start))
              }
              config.save()
            }} />
          </div>
        </div>
      </div>
      {nextWeek.getMonth() !== start.getMonth() && 
        <div className="absolute pt-0 z-10 px-2 text-xs font-semibold ml-4" style={{
          transform:'translate(0, -50%)',
          backgroundImage:'linear-gradient(to bottom, transparent, transparent 40%, white 40%, white 60%, transparent 60%)'
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

const GridDayEntry = ({entry, weekEntry, day, getUsername}: {entry: number, weekEntry: number, day: Date, getUsername: (id: string) => string}) => {
  const holidays = useCalandarDates(day)
  
  const sortedNamedEntries = 
  Array.from(
    //Get the animals killed today
    useAnimals(
      Animal.where('killDate', day).select('animalType bringer confirmed'), 
      [day.getTime()]
    )
    //Create a map that essentially filters by id and type
    ?.reduce((map, animal) => {
      const str = animal.bringer.toHexString()
      const key = str+'#'+animal.animalType
      const old = map.get(key)
      const arr = old?.animalIds ?? []
      arr.push(animal.id)
      map.set(key, {
        id: str,
        animalIds: arr,
        allConfirmed: (old?.allConfirmed ?? true) && animal.confirmed,
        arrived: animal.arriveDate !== undefined,
        type: animal.animalType }
      )
      return map
    }, new Map<string, SingleEntry>())
    //Convert that to entries or get an empty array
    ?.values() ?? [],
    
    //Convert the map entries to a { name id count type } object
    v => { return { name: getUsername(v.id), ...v }}
  )
  //Sort by count
  .sort((a, b) => b.animalIds.length-a.animalIds.length)  
  //Get the first 5 elements
  .slice(0, 5)

  const allUserAnimalEntries = sortedNamedEntries.map(e => { return {
    user: e.id,
    type: e.type,
    ids: e.animalIds
  }})

  const borderClassText = useMemo(() => {
    const tommorow = new Date(day)
    tommorow.setDate(tommorow.getDate() + 1)

    const week = new Date(day)
    week.setDate(week.getDate() + 7)

    let result = ""
    if(entry !== 0 && day.getDate() === 1) {
      result += "border-l "
    } else if(entry !== 6 && tommorow.getDate() === 1) {
      result += "border-r "
    }
    
    if(weekEntry !== 0 && day.getDate() <= 7) {
      result += "border-t"
    } else if(week.getDate() <= 7) {
      result += "border-b"
    }

    return result
  }, [entry, day.getTime()])

  const isToday = useMemo(() => daysEqual(new Date(), day), [day.getTime()])
  const isBeforeToday = useMemo(() => daysBefore(new Date(), day), [day.getTime()])
  return (
    <div className={"flex flex-col p-1.5 w-36 h-36 border-solid border-tomato-900 text-xs font-semibold " + borderClassText.toUpperCase()}>
      <div className={`${isToday?'border-2 border-solid border-blue-500':''} ${isBeforeToday?'bg-gray-400':'bg-gray-200'} text-gray-900 flex-grow relative`}>
        <div className="flex flex-col p-1">
          {sortedNamedEntries.map((e, i) => <GridDayAnimalEntry key={i} day={day} dayData={allUserAnimalEntries} {...e} />)}
          {holidays.map((e, i) => <GridHolidayEntry key={i} holiday={e} />)}
        </div>
        <div className="absolute bottom-0 right-1">
          {day.getDate()}
        </div>
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
  } else if (type === AnimalType.Cow) {
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
        <div className="pl-1 pr-2 text-base flex flex-row">{type === AnimalType.Cow ? <SvgCow /> : <SvgPig />} <p className="text-xs ml-2">{animalIds.length} {arrived ? " Arrived":""}</p></div>
        <div>{name}</div>
      </div>
    </div>
  )
}

const GridHolidayEntry = ({holiday}: {holiday: HolidayEntry}) => 
  <div className="flex flex-row cursor-pointer mt-0.5 rounded-sm bg-green-200 hover:bg-green-100">
    <div>{holiday.name}</div>
  </div>

const calandarCache = new Map<number, Promise<HolidayEntry[]>>()
const useCalandarDates = (date: Date) => {
  const normalized = new Date(date.getFullYear(), date.getMonth(), 0, 0, 0, 0, 0)
  if(!calandarCache.has(normalized.getTime())) {
    const url = "https://www.googleapis.com/calendar/v3/calendars/en.usa%23holiday%40group.v.calendar.google.com/events"
    const key = "AIzaSyDAPB2hFIxAtXgD1KEIJvoNJg6J-JWm64s"
    const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0).toISOString()
    const end = new Date(date.getFullYear(), date.getMonth()+1, -1, 59, 59, 59, 0).toISOString()

    const promise = fetch(`${url}?key=${key}&timeMin=${start}&timeMax=${end}`)
    .then(r => r.json())
    .then(json => {
      const arr: HolidayEntry[] = []

      json.items.forEach(item => {
        if (item.summary !== "First Day of Women's History Month" && item.summary !== "Juneteenth" && item.summary !== "Day off for Christmas Day" && item.summary !== "Day off for New Year's Day" && item.summary !== "First Day of Black History Month" && item.summary !== "Easter Monday" && item.summary !== "Native American Heritage Day") {
          arr.push({
            name: item.summary.replace("(regional holiday)", "").replace("Martin Luther King Jr. Day", "MKL Jr. Day").replace("Thanksgiving Day", "Thanksgiving"),
            date: new Date(item.start.date)
          })
        }
      })

      promise['resolvedArray'] = arr
      return arr
    })
    calandarCache.set(normalized.getTime(), promise)
  }

  const getDatesFromMonth = (dates: HolidayEntry[]) => dates.filter(d => d.date.getDate() == date.getDate())

  const promise = calandarCache.get(normalized.getTime())
  const resolved = promise['resolvedArray'] !== undefined
  const [ state, setState ] = useState(() => {
    if(resolved) {
      return getDatesFromMonth(promise['resolvedArray'])
    }
    return []
  })

  if(!resolved) {
    promise.then(r => setState(getDatesFromMonth(r)))
  }
  
  return state
}

type HolidayEntry = {
  name: String,
  date: Date
}