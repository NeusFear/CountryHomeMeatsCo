import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { EditorValidateInput } from "../components/EditorValidateInput";
import { DatabaseWait } from "../database/Database";
import DayEvents, { ICustomEvent, useDayEvents } from "../database/types/DayEvents";
import { ModalHandler } from "./ModalManager";

const colours = [
  '#f66353', //Red
  '#f6a253', //Orange
  '#f6eb53', //Yellow
  '#56f653', //Green
  '#53cbf6', //Light Blue
  '#5361f6', //Dark Blue
  '#aa53f6', //Purple
  '#f653ba', //Pink
] as const

export const CustomCalendarEntryModal = forwardRef<ModalHandler, { date?: Date, objectId?: string }>(({ date, objectId }, ref) => {
  return objectId === undefined ?
    (<CustomCalendarEntryModalWithEntry ref={ref} entry={new DayEvents({ date, eventColor: colours[0] })} />) :
    (<CustomCalendarEntryModalWithID ref={ref} id={objectId} />)
})

const CustomCalendarEntryModalWithID = forwardRef<ModalHandler, { id: string }>(({ id }, ref) => {
  const entry = useDayEvents(DayEvents.findById(id), [id], id)
  return entry === DatabaseWait ?
    (<div>Loading User ID {id}</div>) :
    (<CustomCalendarEntryModalWithEntry ref={ref} entry={entry} />)
})

const CustomCalendarEntryModalWithEntry = forwardRef<ModalHandler, { entry: ICustomEvent }>(({ entry }, ref) => {

  useImperativeHandle(ref, () => ({
    onClose: () => entry.save()
  }))

  const [selectedColour, setSelectedColour] = useState(entry.eventColor)
  
  return (
    <div className="flex flex-col" style={{ width: '700px', height: '500px' }}>
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
        <div className="flex flex-row w-full h-56">
          <div className="m-2 bg-gray-300">
            Start Day Picker (default: today)
          </div>
          <div className="m-2 bg-gray-300">
            End Day Picker (default: today)
          </div>
        </div>
        <div className="pt-4">
          <span className="ml-2 pr-2 text-gray-700">Color:</span>
          <div className="flex flex-row ml-6">
            { colours.map((colour, i) => <ColorOption key={i} color={colour} selected={selectedColour === colour} setSelected={() => {
              entry.eventColor = colour
              setSelectedColour(colour)
              entry.save()
            }}  />) }
          </div>
        </div>
      </div>
      <div>Delete</div>
    </div>
  )
})

const ColorOption = ({color, selected, setSelected}: {color: string, selected: boolean, setSelected: () => void}) => {
  return <div
    className={`w-8 h-8 rounded-md border-2 hover:border-tomato-600 mx-1 ${selected ? 'border-blue-500' : 'border-black'}`} 
    onClick={setSelected}
    style={{backgroundColor: color}} 
  />
}