import { useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

export const CalendarPage = () => {
  const [items, setItems] = useState<JSX.Element[]>([])

  const loadMore = (num: number) => {
    console.log(num)
    const date = new Date()
    date.setDate(date.getDate() - date.getDay() + (num-1)*7)
    items.push(
      <GridWeekEntry key={items.length} start={date}/>
    )
    setItems([...items])
  }

  const scrollParent = useRef()

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-row pt-3 pl-3">
        <div className="w-24 bg-gray-600 text-gray-300">SUNDAY</div>
        <div className="ml-2 w-24 bg-gray-600 text-gray-300">MONDAY</div>
        <div className="ml-2 w-24 bg-gray-600 text-gray-300">TUESDAY</div>
        <div className="ml-2 w-24 bg-gray-600 text-gray-300">WEDNESDAY</div>
        <div className="ml-2 w-24 bg-gray-600 text-gray-300">THURSDAY</div>
        <div className="ml-2 w-24 bg-gray-600 text-gray-300">FRIDAY</div>
        <div className="ml-2 w-24 bg-gray-600 text-gray-300">SATURDAY</div>
        <div className="ml-2 mr-6 w-24 bg-gray-600 text-gray-300 flex-grow">SUMMERY</div>
      </div>

      <div ref={scrollParent} className="flex-grow" style={{overflowY:'overlay'}}> {/* Ignore the error lol */}
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

const GridWeekEntry = ({start}: {start: Date}) => {
  const addDay = (day: number) => {
    const date = new Date(start)
    date.setDate(date.getDate() + day)
    return date
  }

  return (
    <div className="flex flex-row pt-3 pl-1">
      <GridDayEntry day={addDay(0)}/>
      <GridDayEntry day={addDay(1)}/>
      <GridDayEntry day={addDay(2)}/>
      <GridDayEntry day={addDay(3)}/>
      <GridDayEntry day={addDay(4)}/>
      <GridDayEntry day={addDay(5)}/>
      <GridDayEntry day={addDay(6)}/>
      <div className="ml-2 mr-6 w-24 bg-gray-600 text-gray-300 flex-grow">SUMMERY</div>
    </div>
  )
}

const GridDayEntry = ({day}: {day: Date}) => {
  return (
    <div className="ml-2 w-24 h-24 bg-gray-600 text-gray-300">
      Day: {day.getDay()}
    </div>
  )
}