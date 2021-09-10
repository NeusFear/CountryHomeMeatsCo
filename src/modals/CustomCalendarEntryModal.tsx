import { forwardRef, useImperativeHandle, useRef } from "react";
import { EditorValidateInput } from "../components/EditorValidateInput";
import { DatabaseWait } from "../database/Database";
import DayEvents, { ICustomEvent, useDayEvents } from "../database/types/DayEvents";
import { ModalHandler } from "./ModalManager";


export const CustomCalendarEntryModal = forwardRef<ModalHandler, { date?: Date, objectId?: string }>(({ date, objectId }, ref) => {
  return objectId === undefined ?
    (<CustomCalendarEntryModalWithEntry ref={ref} entry={new DayEvents({ date })} />) :
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
            <ColorOption color="bg-purple-400" selected={false} />
            <ColorOption color="bg-pink-400" selected={false} />
            <ColorOption color="bg-tomato-400" selected={false} />
            <ColorOption color="bg-yellow-400" selected={false} />
            <ColorOption color="bg-green-400" selected={false} />
            <ColorOption color="bg-blue-400" selected={false} />
            <ColorOption color="bg-indigo-400" selected={false} />
          </div>
        </div>
      </div>
    </div>
  )
})

const ColorOption = ({color, selected}: {color: string, selected: boolean}) => {
  return(
    <div className={color + ` w-8 h-8 rounded-md hover:border border-black mx-1`}>

    </div>
  )
}