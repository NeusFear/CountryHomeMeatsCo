import { useEffect, useMemo, useState } from "react";
import { normalizeDay } from "../Util";
import DayPicker from "react-day-picker"
import { DayPickerCaption, fromMonth, toMonth } from "../components/DayPickerCaption";
import Employee, { ClockInState, computeEmployeeDay, IEmployee, useEmployees } from "../database/types/Employee";
import { ipcRenderer, webContents } from "electron";
import { PosPrintData, PosPrintOptions } from "electron-pos-printer";
import { PrinterInfo } from "electron/main";
import { DatabaseWait } from "../database/Database";
import { PrinterDropdownBox } from "./GenericPrintModal";
import { atRule } from "postcss";
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

export const PrintTimeSheetModal = () => {
  const employees = useEmployees(Employee.find().select("firstName lastName clockInEvents"))
  const [printer, setPrinter] = useState<PrinterInfo>(null)
  const [toDate, setToDate] = useState(normalizeDay())
  const [fromDate, setFromDate] = useState(() => {
    const day = normalizeDay()
    day.setDate(day.getDate() - 14)
    return day
  })

  if(fromDate.getTime() > toDate.getTime()) {
    setFromDate(toDate)
    setToDate(fromDate)
  }


  return (
    <div className="bg-gray-200 h-full rounded-lg">
      <style>{style}</style>
      <div className="bg-gray-800 font-semibold rounded-t-md text-white px-2 py-1" >Print Time Sheets</div>
      <div className="flex flex-row" style={{ width: '700px', height: '500px' }}>
        
        <div className="flex flex-col flex-grow">
        <div className="w-full bg-gray-400 text-black mt-2 text-center">Select Start of Pay Period</div>
          <div><DayPickerEntry date={fromDate} setDate={setFromDate} startDate={fromDate} endDate={toDate} /></div>
        </div>
        <div className="flex flex-col flex-grow">
          <div className="w-full bg-gray-400 text-black mt-2 text-center">Select End of Pay Period</div>
          <div><DayPickerEntry date={toDate} setDate={setToDate} startDate={fromDate} endDate={toDate} /></div>
        </div>
      </div>
      <div className="flex flex-row bg-gray-100 p-2 mx-10 rounded-sm">
        <div className="flex-grow">Select Printer:</div>
        <div><PrinterDropdownBox setPrinter={setPrinter} /></div>
      </div>
      <button
        disabled={printer === null}
        onClick={() => {
          if (employees !== DatabaseWait) {
            doPrint(printer.name, employees, fromDate, toDate)
          }
        }}
        className={printer === null ? "bg-tomato-500 hover:bg-gray-600" : "bg-green-200 hover:bg-green-300" + " w-full rounded-sm py-2 mt-4"}
      >
        Print
      </button>
    </div>
  )
}

const DayPickerEntry = ({ date, setDate, startDate, endDate, }: { date: Date, setDate: (day: Date) => void, startDate: Date, endDate: Date }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  return (
    <DayPicker
      onDayClick={setDate}
      month={selectedMonth}
      selectedDays={date}
      captionElement={({ date, localeUtils }) =>
        <DayPickerCaption date={date} locale={localeUtils} onChange={setSelectedMonth} />
      }
      onMonthChange={setSelectedMonth}
      modifiers={{
        isSelected: d => d.getTime() === date.getTime(),
        isHighlighted: d => d.getTime() >= startDate.getTime() && d.getTime() <= endDate.getTime()
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
      disabledDays={[{ daysOfWeek: [0, 6] }]}
    />
  )
}



const perRow = 5
const doPrint = (printerName: string, employees: IEmployee[], from: Date, to: Date) => {
  const numberOfBlocks = Math.max(Math.ceil((to.getTime() - from.getTime()) / 8.64e+7 / perRow), 1)

  const computeAllDates = (e: IEmployee) => {
    const date = new Date(from)
    let total = 0
    while(date.getTime() <= to.getTime()) {
      total += computeEmployeeDay(e.clockInEvents.find(d => d.day.getTime() === date.getTime())?.events ?? [])
      date.setDate(date.getDate() + 1)
    }
    const hours = String(Math.floor(total / 3600000)).padStart(2, "0")
    const minutes = String(Math.floor(total / 60000) % 60).padStart(2, "0")
    return hours + ":" + minutes
  }

  const generateTable = (employees: IEmployee[]) => Array.from({ length: numberOfBlocks }).flatMap((_, i) => {
    const ret: PosPrintData[] = []
    if (i !== 0) {
      ret.push({
        type: "text",
        value: `<div style="width: 100%; height: 2px; background-color: #ddd; margin-top: 10px; margin-bottom: 10px" />`
      })
    }

    const days: Date[] = []
    for (let j = 0; j < perRow; j++) {
      const date = new Date(from)
      date.setDate(date.getDate() + i * perRow + j)
      if (date <= to) {
        days.push(date)
      }
    }

    ret.push({
      type: "table",
      tableHeader: ["Employee"].concat(days.map(d => d.toDateString())),
      tableBody: genEmployeeData(employees, days),
      tableHeaderStyle: 'background-color: #000; color: white;',
      tableBodyStyle: 'border: 0.5px solid #ddd',
    })

    return ret
  })

  const data: PosPrintData[] = [{
    type: "text",
    value: `
    <style>
      td { 
        border: 0.5px solid #ddd; 
        height: 1px; 
      }
      @media print {
        .page-break  { 
          display:block; 
          page-break-before:always; 
        }
      }
      * {
        font-family: Arial, Helvetica, sans-serif;
      }
    </style>`
  } as PosPrintData, {
    type: "text",
    value: `
      <h2>Total Hours</h2>
      ${employees.map(e => e.firstName + " " + e.lastName + ": " + computeAllDates(e) + "<br>").join("")}
      <br>
      <br>
    `
  } as PosPrintData].concat(generateTable(employees))

  employees.forEach(employee => {
    const hasEvents = employee.clockInEvents.some(e => e.day.getTime() >= from.getTime() && e.day.getTime() <= to.getTime() && e.events.length !== 0)
    if(!hasEvents) {
      return
    }
    data.push({
      type: "text",
      value: `
      <div class="page-break" />
      <h2>Hours for ${employee.firstName} ${employee.middleName ?? ""} ${employee.lastName}</h2>
      Total Time Worked: ${computeAllDates(employee)}
      `
    })
    data.push(...generateTable([employee]))
  })

  const options: PosPrintOptions = {
    // preview: true,
    width: "775px",
    printerName,
    silent: true
  }
  ipcRenderer.send("do-print", [data, options])
}

const genEmployeeData = (employees: IEmployee[], days: Date[]) => {
  return employees.map(employee =>
    [employee.firstName + " " + employee.lastName].concat(days.map(day => {
      let out = ""
      const found = employee.clockInEvents.find(evt => evt.day.getTime() === day.getTime())
      if (found !== undefined) {
        let previousEvent: { time: Date; state: number; } = null
        const getTime = (date: Date) => String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0")
        for (let event of found.events) {
          let entry: string | null = null
          if (event.state === ClockInState.ClockedIn) {
            if (previousEvent !== null && previousEvent.state === ClockInState.OnBreak) {
              entry = "Break: " + getTime(previousEvent.time) + " - " + getTime(event.time)
            } else {
              entry = "Clock In: " + getTime(event.time)
            }
          }
          if (event.state === ClockInState.ClockedOut) {
            entry = "Clock Out: " + getTime(event.time)
          }

          if (entry !== null) {
            out += `<div>${entry}</div>`
          }
          previousEvent = event
        }

        const timeWorked = computeEmployeeDay(found.events)
        const hours = String(Math.floor(timeWorked / 3600000))
        const minutes = String(Math.floor(timeWorked / 60000) % 60)

        out += "<br><br><br>"
        out += `<span style="position: absolute; bottom: 0; width: max-content; padding: 0 10px">Time Worked: ${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}</span>`
      }


      return `<span style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        min-width: 130px;"
      >${out}</span>`
    }))
  )
}