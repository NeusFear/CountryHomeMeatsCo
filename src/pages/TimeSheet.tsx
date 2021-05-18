import { useEffect, useMemo, useRef, useState } from "react";
import { SvgNewUser, SvgTimesheets } from "../assets/Icons";
import { DatabaseWait } from "../database/Database";
import Employee, { useEmployees, ClockInState, IEmployee, computeEmployeeDay } from "../database/types/Employee";
import { editEmployeeDetails, printTimeSheet, setModal } from "../modals/ModalManager";
import { normalizeDay } from "../Util";

export const TimeSheet = () => {
  const allEmployees = useEmployees(Employee.find().select("clockInEvents firstName lastName"))
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4 flex-grow">TIME SHEETS</div>
        <div className="hover:text-gray-100 hover:shadow-md cursor-pointer text-4xl w-16 h-11 text-center text-gray-300 bg-tomato-700 rounded-md py-1 px-4 mr-1 mt-1" onClick={() => setModal(editEmployeeDetails)}><SvgNewUser /></div>
        <div className="hover:text-gray-100 hover:shadow-md cursor-pointer text-4xl w-16 h-11 text-center text-gray-300 bg-tomato-700 rounded-md py-1 px-4 mr-2 mt-1" onClick={() => setModal(printTimeSheet)}><SvgTimesheets /></div>
      </div>
      <div className="bg-gray-400 px-1 py-0.5 shadow-sm mb-2">
        <span className="ml-2 text-gray-700">This page is used to keep track of employee hours</span>
      </div>
      <div className="px-4 mt-4 h-full overflow-y-scroll">
        {allEmployees !== DatabaseWait && allEmployees.map(e => <EmployeeEntry key={e.id} employee={e} />)}
      </div>
    </div>
  )
}

const EmployeeEntry = ({ employee }: { employee: IEmployee }) => {
  let stateClasses = "";
  let stateText = "invalid state";

  const eventList = useMemo(() => {
    const day = normalizeDay()
    const found = employee.clockInEvents.find(e => e.day.getTime() === day.getTime())
    if (found === undefined) {
      employee.clockInEvents.push({ day, events: [] })
      employee.save()
      return []
    }
    return found.events
  }, [employee])

  const state = eventList.length === 0 ? ClockInState.ClockedOut : eventList[eventList.length - 1].state

  if (state === ClockInState.ClockedIn) {
    stateClasses = "ml-1 mt-1 text-green-500"
    stateText = "Clocked In"
  } else if (state === ClockInState.OnBreak) {
    stateClasses = "ml-1 mt-1 text-blue-500"
    stateText = "On Break"
  } else if (state === ClockInState.ClockedOut) {
    stateClasses = "ml-1 mt-1 text-tomato-600"
    stateText = "Clocked Out"
  }

  const computeMsSinceLastBreak = () => {
    if (eventList.length !== 0) {
      return Date.now() - eventList[eventList.length - 1].time.getTime()
    }
    return 0
  }
  const [msSinceLastEvent, setMsSinceLastBreak] = useState(computeMsSinceLastBreak)
  const previousState = useRef(state)
  let timeWorked = useMemo(() => computeEmployeeDay(eventList), [eventList])
  if (state == ClockInState.ClockedIn) {
    timeWorked += msSinceLastEvent
  }

  useEffect(() => {
    if (previousState.current !== state) {
      setMsSinceLastBreak(computeMsSinceLastBreak())
      previousState.current = state
    }

    let timer: NodeJS.Timeout
    const periodicRun = () => {
      setMsSinceLastBreak(computeMsSinceLastBreak());
      timer = setTimeout(periodicRun, 5000)
    }
    timer = setTimeout(periodicRun, 5000)
    return () => clearTimeout(timer)
  })


  const hours = Math.floor(timeWorked / 3600000)
  const minutes = Math.floor(timeWorked / 60000) % 60

  const getIfS = (num: number) => num === 1 ? "" : "s"

  return (
    <div className="bg-gray-200 hover:shadow-md rounded-lg px-2 py-2 shadow-sm flex flex-row mb-2">
      <span className="flex-1 flex flex-col ml-6">
        <div className="flex flex-row">
          <div className="font-semibold text-xl">{`${employee.firstName} ${employee.lastName}`}</div>
          <div className={stateClasses}> {stateText}
            {state === ClockInState.OnBreak && <span className="pl-1 text-blue-200">for {Math.floor(msSinceLastEvent / 60000)} minutes.</span>}
          </div>
        </div>
        <div className="text-gray-600">{hours} hour{getIfS(hours)} {minutes} minute{getIfS(minutes)} today.</div>
      </span>
      <EmployeeTimeEntry
        employee={employee}
        eventList={eventList}
        currentState={state}
        state={ClockInState.ClockedOut}
        targetState={ClockInState.ClockedIn}
        colour="green"
        text="Clock In"
      />
      <EmployeeTimeEntry
        employee={employee}
        eventList={eventList}
        currentState={state}
        state={ClockInState.ClockedIn}
        targetState={ClockInState.OnBreak}
        colour="blue"
        text="Start Break"
      />
      <EmployeeTimeEntry
        employee={employee}
        eventList={eventList}
        currentState={state}
        state={ClockInState.OnBreak}
        targetState={ClockInState.ClockedIn}
        colour="red"
        text="End Break"
      />
      <EmployeeTimeEntry
        employee={employee}
        eventList={eventList}
        currentState={state}
        state={ClockInState.ClockedIn}
        targetState={ClockInState.ClockedOut}
        colour="tomato"
        text="Clock Out"
      />
    </div>
  )
}

const EmployeeTimeEntry = ({ employee, currentState, eventList, state, targetState, colour, text }:
  {
    employee: IEmployee,
    eventList: { time: Date; state: number; }[],
    currentState: number
    state: number,
    targetState: number,
    colour: string,
    text: string
  }) => {
  const isActive = currentState === state
  const onClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (isActive) {
      eventList.push({ time: new Date(), state: targetState })
      console.log(employee)
      employee.save()
    }
    e.stopPropagation()
  }
  return (
    <span onClick={onClick} className={"flex flex-shrink p-4 mx-2 my-1 rounded-md font-semibold " + (isActive ? `hover:shadow-md hover:bg-${colour}-400 bg-${colour}-300 cursor-pointer` : "bg-gray-600 cursor-not-allowed text-gray-300")}>{text}</span>
  )
}