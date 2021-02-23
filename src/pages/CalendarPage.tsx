import { useMemo, useRef, useState } from 'react';
import { Property } from 'csstype';
import InfiniteScroll from 'react-infinite-scroller';

export const CalendarPage = () => {
  const [items, setItems] = useState<JSX.Element[]>([])

  const loadMore = (num: number) => {
    const date = new Date()
    date.setDate(date.getDate() - date.getDay() + (num-1)*7)
    items.push(
      <GridWeekEntry key={items.length} weekEntry={items.length} start={date}/>
    )
    setItems([...items])
  }

  const scrollParent = useRef()

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-row pt-3 pb-3">
        <div className="ml-4 w-24 bg-gray-600 text-gray-300">SUNDAY</div>
        <div className="ml-4 w-24 bg-gray-600 text-gray-300">MONDAY</div>
        <div className="ml-4 w-24 bg-gray-600 text-gray-300">TUESDAY</div>
        <div className="ml-4 w-24 bg-gray-600 text-gray-300">WEDNESDAY</div>
        <div className="ml-4 w-24 bg-gray-600 text-gray-300">THURSDAY</div>
        <div className="ml-4 w-24 bg-gray-600 text-gray-300">FRIDAY</div>
        <div className="ml-4 w-24 bg-gray-600 text-gray-300">SATURDAY</div>
        <div className="ml-4 mr-6 w-24 bg-gray-600 text-gray-300 flex-grow">SUMMERY</div>
      </div>

      <div ref={scrollParent} className="flex-grow" style={{overflowY:'overlay' as Property.OverflowY}}>
        <InfiniteScroll 
          hasMore={true}
          loader={<div className="loader" key={0}>Loading ...</div>} 
          loadMore={loadMore}
          useWindow={false}
          getScrollParent={() => scrollParent.current}
        >
          {items}
        </InfiniteScroll>
      </div>
    </div>
  )
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const

const GridWeekEntry = ({weekEntry, start}: {weekEntry: number, start: Date}) => {
  const addDay = (day: number) => {
    const date = new Date(start)
    date.setDate(date.getDate() + day)
    return date
  }

  const nextWeek = useMemo(() => {
    const week = new Date(start)
    week.setDate(week.getDate() + 7)
    return week
  }, [start.getMilliseconds()])

  const isDiffYear = useMemo(() => nextWeek.getFullYear() !== new Date().getFullYear(), [nextWeek.getMilliseconds()])

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
  }, [start.getMilliseconds(), weekEntry])

  return (
    <div className="relative pl-2">
      <div className="flex flex-row">  
        <GridDayEntry weekEntry={weekEntry} entry={0} day={addDay(0)}/>
        <GridDayEntry weekEntry={weekEntry} entry={1} day={addDay(1)}/>
        <GridDayEntry weekEntry={weekEntry} entry={2} day={addDay(2)}/>
        <GridDayEntry weekEntry={weekEntry} entry={3} day={addDay(3)}/>
        <GridDayEntry weekEntry={weekEntry} entry={4} day={addDay(4)}/>
        <GridDayEntry weekEntry={weekEntry} entry={5} day={addDay(5)}/>
        <GridDayEntry weekEntry={weekEntry} entry={6} day={addDay(6)}/>
        <div className={"pl-1 pr-1 pt-2 pb-2 w-28 h-24 flex-grow flex flex-col border-solid border-tomato-900 " + borderSummary}>
          <div className="bg-gray-600 text-gray-300 flex-grow">
            SUMMERY
          </div>
        </div>
      </div>
      {nextWeek.getMonth() !== start.getMonth() && 
        <div className="absolute pt-0 z-10 pr-2" style={{
          transform:'translate(0, -50%)',
          backgroundImage:'linear-gradient(to bottom, transparent, transparent 40%, white 40%, white 60%, transparent 60%)'
        }}>{months[nextWeek.getMonth()] + (isDiffYear?(' '+nextWeek.getFullYear()):'')}</div>
      }
    </div>
  )
}

const GridDayEntry = ({entry, weekEntry, day}: {entry: number, weekEntry: number, day: Date}) => {
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
  }, [entry, day.getMilliseconds()])
  return (
    <div className={"flex flex-col pl-1 pr-1 pt-2 pb-2 w-28 h-24 border-solid border-tomato-900 " + borderClassText}>
      <div className="bg-gray-600 text-gray-300 flex-grow">
      {day.getDate()}/{day.getMonth()+1}
      </div>
    </div>
  )
}