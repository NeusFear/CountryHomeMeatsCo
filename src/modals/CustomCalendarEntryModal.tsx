import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import DayPicker from "react-day-picker"
import { DayPickerCaption, fromMonth, toMonth } from "../components/DayPickerCaption";
import { EditorValidateInput } from "../components/EditorValidateInput";
import { DatabaseWait } from "../database/Database";
import DayEvents, { ICustomEvent, useDayEvents } from "../database/types/DayEvents";
import { ModalHandler, setModal } from "./ModalManager";

const colours = [
  '#FCA5A5', //Red
  '#FDBA74', //Orange
  '#FDE047', //Yellow
  '#BEF264', //Green
  '#5EEAD4', //Light Blue
  '#7DD3FC', //Dark Blue
  '#C4B5FD', //Purple
  '#F9A8D4', //Pink
] as const


const style = `
.DayPicker-Day {
  border-radius: 0
}
.DayPicker-Day--isHighlighted {
  background-color: var(--yellow-300)
}
.DayPicker-Day--isSelected {
  background-color: var(--blue-300)
}
.DayPicker-Day:hover {
  background-color: var(--blue-100) !important
}
`

export const CustomCalendarEntryModal = forwardRef<ModalHandler, { date?: Date, objectId?: string }>(({ date, objectId }, ref) => {
  return objectId === undefined ?
    (<CustomCalendarEntryModalWithEntry ref={ref} entry={new DayEvents({ startDate: date, endDate: date, eventColor: colours[0], noWork: false })} />) :
    (<CustomCalendarEntryModalWithID ref={ref} id={objectId} />)
})

const CustomCalendarEntryModalWithID = forwardRef<ModalHandler, { id: string }>(({ id }, ref) => {
  const entry = useDayEvents(DayEvents.findById(id), [id], id)
  return entry === DatabaseWait ?
    (<div>Loading User ID {id}</div>) :
    (<CustomCalendarEntryModalWithEntry ref={ref} entry={entry} />)
})

const CustomCalendarEntryModalWithEntry = forwardRef<ModalHandler, { entry: ICustomEvent }>(({ entry }, ref) => {
  const runThenSave = <T,>(run: (arg: T) => void) => {
    return (arg: T) => {
      run(arg)
      if(!entry.isNew) {
        entry.save()
      }
      
    }
  }

  const [startDate, setStartDate] = useState(entry.startDate)
  const [endDate, setEndDate] = useState(entry.endDate)

  const swapIfNeededAndUpdate = () => {
    if(entry.startDate.getTime() > entry.endDate.getTime()) {
      const temp = entry.startDate
      entry.startDate = entry.endDate
      entry.endDate = temp
    }
    setStartDate(entry.startDate)
    setEndDate(entry.endDate)
  }

  useImperativeHandle(ref, () => ({
    onClose: () => entry.save()
  }))

  const [selectedColour, setSelectedColour] = useState(entry.eventColor)
  
  return (
    <div className="flex flex-col" style={{ width: '700px', height: '650px' }}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        {entry.isNew ?
          <span className="text-gray-300 font-semibold">Create New Event</span> :
          <span className="text-gray-300">Editing Event</span>
        }
      </div>
      <div className="flex-grow overflow-auto">
        <div className="pt-4">
          <EditorValidateInput label="Name" example="vacation" current={entry.eventName} predicate={t => t.length >= 3} onChange={d => entry.eventName = d.text} />
        </div>
        <div className="flex flex-row w-full">
          <style>{style}</style>
          <div className="m-2 bg-gray-200 border border-gray-600 rounded-md">
            <p className="ml-4">Event Start:</p>
            <DayPickerWrapper date={startDate} entry={entry} setDate={runThenSave(d => {
              entry.startDate = d
              swapIfNeededAndUpdate()
            })} />
          </div>
          <div className="m-2 bg-gray-200 border border-gray-600 rounded-md">
            <p className="ml-4">Event End:</p>
            <DayPickerWrapper date={endDate} entry={entry} setDate={runThenSave(d => {
              entry.endDate = d
              swapIfNeededAndUpdate()
            })}/>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="pt-4">
            <span className="ml-2 pr-2 text-gray-700">Color:</span>
            <div className="flex flex-row ml-6">
              { colours.map((colour, i) => <ColorOption key={i} color={colour} selected={selectedColour === colour} setSelected={() => {
                entry.eventColor = colour
                setSelectedColour(colour)
                if(!entry.isNew) {
                  entry.save()
                }
              }}  />) }
            </div>
          </div>
          <div className="pt-4 flex flex-row ml-4 mt-6">
            <p className="mr-2">Day Off:</p>
            <input className="mt-1 h-5 w-5 rounded-md mr-2" type="checkbox" checked={entry.noWork} onChange={runThenSave(e => entry.noWork = e.target.checked)} />
          </div>
        </div>
      </div>
      <div className="bg-tomato-200 cursor-pointer m-2 rounded-md shadow text-white hover:bg-tomato-300 text-center p-2" onClick={() => {
        entry.delete()
        setModal(null)
      }}>Delete</div>
    </div>
  )
})

const ColorOption = ({color, selected, setSelected}: {color: string, selected: boolean, setSelected: () => void}) => {
  return <div
    className={`w-8 h-8 rounded-md border hover:border-gray-800 mx-1 ${selected ? 'border-black' : 'border-white'}`} 
    onClick={setSelected}
    style={{backgroundColor: color}} 
  />
}

const DayPickerWrapper = ({date, setDate, entry}: {date: Date, setDate: (date: Date) => void, entry: ICustomEvent}) => {
  const [selectedMonth, setSelectedMonth] = useState(date)

  return (
    <DayPicker
      onDayClick={setDate}
      month={selectedMonth}
      captionElement={({ date, localeUtils }) =>
        <DayPickerCaption date={date} locale={localeUtils} onChange={setSelectedMonth} />
      }
      onMonthChange={setSelectedMonth}
      modifiers={{
        isSelected: d => d.getTime() === date.getTime(),
        isHighlighted: d => d.getTime() >= entry.startDate.getTime() && d.getTime() <= entry.endDate.getTime()
      }}
      fromMonth={fromMonth}
      toMonth={toMonth}
      renderDay={day => {
        return (
          <div
            //Below is some hacks to make this div take up the entire parent area.
            //This is to have the data-tip take up the whole area
            style={{ margin: '-8px', padding: '8px' }}
          >
            {day.getDate()}
          </div>
        )
      }}
    />
  )
}