import { setModal } from "./ModalManager";
import * as React from "react"
import DayPicker from "react-day-picker"
import { SvgCow, SvgPig } from "../assets/Icons"
import Animal, { AnimalType, createEmptyAnimal, useAnimals } from "../database/types/Animal"
import ReactTooltip from "react-tooltip";
import { getDayNumber } from "../Util";

const style = `
.DayPicker-Day {
  border-radius: 0
}
.DayPicker-Day--isQuietDay {
  background-color: var(--green-100)
} 
.DayPicker-Day--isNormalDay {
  background-color: var(--yellow-200)
} 
.DayPicker-Day--isBusyDay {
  background-color: var(--tomato-100)
} 
.DayPicker-Day--isSelected {
  background-color: var(--blue-300)
}
.DayPicker-Day:hover {
  background-color: var(--blue-100) !important
}
`
export const SchueduleAnimalModal = ({ userID }: { userID: string }) => {
  const [ newAnimal ] = React.useState(() => createEmptyAnimal(userID))

  const [ animalType, setAnimalType ] = React.useState<"Cow"|"Pig">()
  const [ scheduledDate, setScheduledDate ] = React.useState<Date>()

  const dayNumber = getDayNumber()
  const allAnimals = useAnimals(() => Animal.where('killDate').gte(Date.now()), [dayNumber])
  
  function isDayAvailable(date: Date) {
    return getDayNumber(date) >= dayNumber
  }
  

  function getOrdersForDay(date: Date) {
    if(allAnimals === undefined) {
      return 0
    }
    return allAnimals.filter(a => getDayNumber(a.killDate) == getDayNumber(date)).length
  }

  const isOrdersBetween = (date: Date, min: number, max: number): boolean => {
    //Don't look for days on weekends.
    if(date.getDay() === 0 || date.getDay() === 6) {
      return false
    }
    const num = getOrdersForDay(date)
    return num >= min && num <= max
  }

  const valid = animalType !== undefined && scheduledDate !== null
  const trySubmitData = () => {
    newAnimal.animalType = animalType
    newAnimal.killDate = scheduledDate
    newAnimal.save().then(() => setModal(null))
  }

  return (
    <div>
      <div className="bg-gray-800 w-full rounded-t-sm text-white p-2 font-semibold">
        Schedule a New Animal
      </div>
      <div className="flex flex-row min-w-0">
        <div className="pr-2 mr-5 bg-gray-100 ml-2 flex flex-col">
          <div className="flex-grow">
            Animal Type:
            <div>
              <AnimalTypeSelect Icon={SvgCow} onSelected={() => setAnimalType("Cow")} isSelected={animalType === AnimalType.Cow} />
              <AnimalTypeSelect Icon={SvgPig} onSelected={() => setAnimalType("Pig")} isSelected={animalType === AnimalType.Pig} />
            </div>
          </div>
          <button onClick={valid?trySubmitData:undefined} className={`${valid ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"} py-1 mt-2 rounded-sm mb-2 px-4`}>Submit</button>
        </div>
        <div>
          <style>{style}</style>
          <DayPicker 
            onDayClick={setScheduledDate}
            modifiers={{
              isSelected: date => date.getTime() === scheduledDate?.getTime(),
              isQuietDay: date => isOrdersBetween(date, 1, 3),
              isNormalDay: date => isOrdersBetween(date, 4, 6),
              isBusyDay: date => isOrdersBetween(date, 7, 9),
            }}
            fixedWeeks
            disabledDays={[{ daysOfWeek: [0, 6] }, date => !isDayAvailable(date)]}
            renderDay={day => {
              const orders = getOrdersForDay(day)
              return (
                <span data-tip={`${orders} Order${orders===1?'':'s'}`}>
                  {day.getDate()}
                </span>
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}

const AnimalTypeSelect = ({Icon, onSelected, isSelected}: {Icon: any, onSelected:()=>void, isSelected:boolean}) => {
  return (
    <button className={"w-full flex flex-row rounded-md p-1" + (isSelected?" bg-blue-100":"")} name="animal" onClick={() => onSelected() }>
      <Icon className="w-8 h-8 transform translate-x-1/2"/>
    </button>
  )
}