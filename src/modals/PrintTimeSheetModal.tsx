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

export const PrintTimeSheetModal = () => {
  const employees = useEmployees(Employee.find().select("firstName lastName clockInEvents"))
  const [printer, setPrinter] = useState<PrinterInfo>(null)
  const [toDate, setToDate] = useState(normalizeDay())
  const [fromDate, setFromDate] = useState(() => {
    const day = normalizeDay()
    day.setDate(day.getDate() - 14)
    return day
  })

  return (
    <div className="bg-gray-200 h-full rounded-lg">
      <div className="bg-gray-800 font-semibold rounded-t-md text-white px-2 py-1" >Print Time Sheets</div>
      <div className="flex flex-row" style={{ width: '700px', height: '500px' }}>
        
        <div className="flex flex-col flex-grow">
        <div className="w-full bg-gray-400 text-black mt-2 text-center">Select Start of Pay Period</div>
          <div><DayPickerEntry date={fromDate} setDate={setFromDate} /></div>
        </div>
        <div className="flex flex-col flex-grow">
          <div className="w-full bg-gray-400 text-black mt-2 text-center">Select End of Pay Period</div>
          <div><DayPickerEntry date={toDate} setDate={setToDate} /></div>
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

const DayPickerEntry = ({ date, setDate, }: { date: Date, setDate: (day: Date) => void }) => {
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
      fromMonth={fromMonth}
      toMonth={toMonth}
      disabledDays={[{ daysOfWeek: [0, 6] }]}
    />
  )
}



const perRow = 5
const doPrint = (printerName: string, employees: IEmployee[], from: Date, to: Date) => {
  const numberOfBlocks = Math.ceil((to.getTime() - from.getTime()) / 8.64e+7 / perRow)

  const data: PosPrintData[] = [{
    type: "text",
    value: "<style>td { border: 0.5px solid #ddd; height: 1px; }</style>"
  } as PosPrintData]
    .concat(Array.from({ length: numberOfBlocks }).flatMap((_, i) => {
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
    }))

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