import { createContext, useContext, useRef, useState } from "react"
import { SvgEdit } from "../assets/Icons"
import { DatabaseWait } from "../database/Database"
import { useConfig } from "../database/types/Configs"

const GlobalEdit = createContext(false)

export const PriceSheet = () => {
  const priceData = useConfig('PriceData')
  const [globalEdit, setGlobalEdit] = useState(false)

  if(priceData === DatabaseWait) {
    return (<div>Loading Price List...</div>)
  }

  const thenSave = (setter: (val: number) => void) => {
    return (val: number) => {
      setter(val)
      //To check if a object as changed, mongoose does == on the object,
      //And == on it's children. As we have 3 inner objects, we need to mark the field
      //as changed. This is slow and can be optimised.
      priceData.markModified('currentPrices')
      priceData.save()
    }
  }

  const { beef, pork } = priceData.currentPrices

  return (
    <div className="w-full h-screen flex flex-col">
      <GlobalEdit.Provider value={globalEdit}>
        <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
          <div className="text-white text-4xl font-bold ml-4">PRICE SHEET</div>
        </div>
        <div className="bg-gray-400 px-1 py-0.5 shadow-sm mb-2 flex flex-row">
          <div className="ml-2 text-gray-700 flex-grow">This page's prices are used to calculate processing invoices</div>
          <div className="mr-2 text-gray-700 hover:text-gray-800 border-none flex flex-row font-semibold" onClick={() => setGlobalEdit(!globalEdit)}><SvgEdit className="h-6 w-6 mr-1" /></div>
        </div>
        <div className="px-4 mt-4 h-full overflow-y-scroll">

        <table className="table-fixed border-collapse w-full bg-gray-100">
            <thead>
              <tr className="bg-gray-500 rounded-t-md font-bold text-center">
                <th className="w-1/2 text-left pl-2 rounded-t-md">BEEF</th>
                <th className="w-1/8"></th>
                <th className="w-3/8"></th>
              </tr>
            </thead>
            <tbody>
              <PriceEntry description="Slaughter Fee" currentPrice={beef.slaughter} onChange={thenSave(v => beef.slaughter = v)} unit="per Animal"/>
              <PriceEntry description="Processing Fee" currentPrice={beef.processing} onChange={thenSave(v => beef.processing = v)} unit="per Pound * Dressed Weight"/>
              <PriceEntry description="Make Patties" currentPrice={beef.patties} onChange={thenSave(v => beef.patties = v)} unit="per Pound"/>
              <PriceEntry description="Split into Halves" currentPrice={beef.halves} onChange={thenSave(v => beef.halves = v)} unit="per Half"/>
              <PriceEntry description="Divide Halves into Quaters" currentPrice={beef.halvesToQuaters} onChange={thenSave(v => beef.halvesToQuaters = v)} unit="per Quarter"/>
              <PriceEntry description="Extra Boning" currentPrice={beef.extraBoning} onChange={thenSave(v => beef.extraBoning = v)} unit="per Quarter"/>
              <PriceEntry description="Cut Stew Meat" currentPrice={beef.cutStewMeat} onChange={thenSave(v => beef.cutStewMeat = v)} unit="per Pound"/>
              <PriceEntry description="Bone and Tenderize Round Steaks" currentPrice={beef.boneAndTenderizeRoundSteaks} onChange={thenSave(v => beef.boneAndTenderizeRoundSteaks = v)} unit="per Half"/>
              <PriceEntry description="Make Cubed Steaks" currentPrice={beef.makeCubedSteaks} onChange={thenSave(v => beef.makeCubedSteaks = v)} unit="per Half"/>
              <PriceEntry description="Bone Or Prime Rib" currentPrice={beef.boneOrPrimeRib} onChange={thenSave(v => beef.boneOrPrimeRib = v)} unit="per Half"/>
              <PriceEntry description="Bone out Loin" currentPrice={beef.boneOutLoin} onChange={thenSave(v => beef.boneOutLoin = v)} unit="per Half"/>
            </tbody>
          </table>

          <br />

          <table className="table-fixed border-collapse w-full bg-gray-100">
            <thead>
              <tr className="bg-gray-400 rounded-t-md font-bold text-center">
                <th className="w-1/2 text-left pl-2 rounded-t-md">PORK</th>
                <th className="w-1/8"></th>
                <th className="w-3/8"></th>
              </tr>
            </thead>
            <tbody>
              <PriceEntry description="Slaughter Fee < 150lbs" currentPrice={pork.slaughter} onChange={thenSave(v => pork.slaughter = v)} unit="per Animal"/>
              <PriceEntry description="Slaughter Fee > 150lbs" currentPrice={pork.slaughter150lb} onChange={thenSave(v => pork.slaughter150lb = v)} unit="per Animal"/>
              <PriceEntry description="Processing" currentPrice={pork.processing} onChange={thenSave(v => pork.processing = v)} unit="Per Pound * Dressed Weight"/>
              <PriceEntry description="Cure" currentPrice={pork.cure} onChange={thenSave(v => pork.cure = v)} unit="Per Pound of Cured Meat"/>
              <PriceEntry description="Sausage" currentPrice={pork.sausage} onChange={thenSave(v => pork.sausage = v)} unit="per Pound of Sausage"/>
            </tbody>
          </table>
        </div>
      </GlobalEdit.Provider>
    </div>
  )
}

const PriceEntry = ({ description, currentPrice, onChange, unit }: {description: string, currentPrice: number, onChange: (val:number)=>void,unit: string}) => {
  const [editing, setEditing] = useState(false)
  const [displayValue, setDisplayValue] = useState(currentPrice.toFixed(2))
  const [value, setValue] = useState(currentPrice.toFixed(2))
  const globalEdit = useContext(GlobalEdit)
  const displayRef = useRef<HTMLSpanElement>()
  const inputRef = useRef<HTMLInputElement>()

  const isEdit = globalEdit || editing

  if(globalEdit && editing) {
    setEditing(false)
  }

  const doChange = (s: string) => {
    setValue(s)
    const v = parseFloat(s)
    if(!isNaN(v)) {
      onChange(v)
      setDisplayValue(v.toFixed(2))
    }
  }

  if(displayRef.current !== undefined) {
    const w = displayRef.current.getBoundingClientRect().width
    if(w !== 0) {
      inputRef.current.style.width = w+'px'
    }
  }

  return (
      <tr>
        <td className="border-t border-gray-600 pl-2 pr-4">{description}</td>
        <td className="border-t border-gray-600 w-20 text-right pr-4">
          $
          <span ref={displayRef} className={isEdit?'hidden':''} onDoubleClick={e => {
            if(globalEdit) {
              return
            }
            inputRef.current.classList.remove('hidden') //Can't be hidden to focus
            inputRef.current.focus()
            setEditing(true)
            e.preventDefault()
            e.stopPropagation()
          }}>{displayValue}</span>
          <input 
            ref={inputRef}
            className={(isEdit?'':'hidden ') + " bg-tomato-100"}
            value={value} 
            onKeyDown={e => e.key === 'Enter' ? setEditing(false) : false}
            onChange={e => doChange(e.target.value)} 
            onBlur={() => setEditing(false)} 
          />
        </td>
        <td className="border-t border-gray-600 px-4">{unit}</td>
      </tr>
    )
}