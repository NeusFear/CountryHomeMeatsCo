import { PosPrintData, PosPrintOptions } from "electron-pos-printer";
import { PrinterInfo } from "electron/main";
import { useState, useEffect } from "react";
import { ipcRenderer, webContents } from "electron";

export const GenericPrintModal = ({ title, data }: { title: string, data: PosPrintData[] }) => {
  const [printer, setPrinter] = useState<PrinterInfo>(null)

  return (
    <div className="bg-gray-200 h-full rounded-lg" style={{ width: '700px', height: '500px' }}>
      <div className="bg-gray-800 font-semibold rounded-t-md text-white px-2 py-1" >{title}</div>
      <div className="flex flex-row bg-gray-100 p-2 mx-10 rounded-sm">
        <div className="flex-grow">Select Printer:</div>
        <div><PrinterDropdownBox setPrinter={setPrinter} /></div>
      </div>
      <button
        disabled={printer === null}
        onClick={() => {
          const options: PosPrintOptions = {
            // preview: true,
            width: "775px",
            printerName: printer.name,
            silent: true
          }
          ipcRenderer.send("do-print", [data, options])
        }}
        className={printer === null ? "bg-tomato-500 hover:bg-gray-600" : "bg-green-200 hover:bg-green-300" + " w-full rounded-sm py-2 mt-4"}
      >
        Print
      </button>
    </div>
  )
}

export const PrinterDropdownBox = ({ setPrinter }: { setPrinter: (p: PrinterInfo) => void }) => {
  const getPrinter = (): PrinterInfo[] => ipcRenderer.sendSync("get-printers")
  const [printers, setPrinters] = useState(getPrinter)

  useEffect(() => {
    let timer: NodeJS.Timeout
    const periodicRun = () => {
      setPrinters(getPrinter());
      timer = setTimeout(periodicRun, 1000)
    }
    timer = setTimeout(periodicRun, 1000)
    return () => clearTimeout(timer)
  })

  const defaultPrinterIndex = printers.findIndex(p => p.isDefault)
  useEffect(() => {
    if (defaultPrinterIndex !== -1) {
      setPrinter(printers[defaultPrinterIndex])
    }
  }, [])

  return (
    <select defaultValue={defaultPrinterIndex} onChange={e => setPrinter(printers[e.currentTarget.value])} className="bg-gray-200">
      <option className="hidden">Select A Printer</option>
      {printers.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
    </select>
  )
}