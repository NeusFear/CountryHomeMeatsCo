import { atRule } from "postcss"
import * as React from "react"
import DayPicker from "react-day-picker"
import { SvgCow, SvgPig } from "../assets/Icons"
import { createEmptyAnimal } from "../database/types/Animal"


export const SchueduleAnimalModal = ({ userID }: { userID: string }) => {
  const [ newAnimal ] = React.useState(createEmptyAnimal(userID))

  const [ animalType, setAnimalType ] = React.useState<String>()


  function isDayAvailable(date: Date) {
    return false
  }
  
  //TODO: actually link this to the database.
  //Note this shouldn't querty the database every time, and isntead
  //use a cahce
  function getOrdersForDay(date: Date) {
    return ((date.getTime()/8.64e+7)^51) % 9
  }

  const isOrdersBetween = (date: Date, min: number, max: number): boolean => {
    //Don't look for days on weekends.
    if(date.getDay() === 0 || date.getDay() === 6) {
      return false
    }
    const num = getOrdersForDay(date)
    return num >= min && num <= max
  }

  return (
    <div className="flex flex-row" style={{height: '400px', width:'400px'}}>
      <div className="mr-5">
        Animal Type:
        <div className="flex flex-row">
          <div className="mr-2">
            <SvgCow />
            Cow
          </div>
          <div>
            <SvgPig />
            Pig
          </div>
        </div>
      </div>
      <div>
        Date:
        <style>{`
          .DayPicker-Day {
            border-radius: 0
          }
          .DayPicker-Day--isQuietDay {
            background-color: var(--green-100)
          } 
          .DayPicker-Day--isNormalDay {
            background-color: var(--yellow-100)
          } 
          .DayPicker-Day--isBusyDay {
            background-color: var(--tomato-100)
          } 
        `}</style>
        <DayPicker 
          modifiers={{
            isQuietDay: date => isOrdersBetween(date, 1, 3),
            isNormalDay: date => isOrdersBetween(date, 4, 6),
            isBusyDay: date => isOrdersBetween(date, 7, 9),
          }}
          fixedWeeks
          disabledDays={[{ daysOfWeek: [0, 6] }, date => isDayAvailable(date)]}
        />
      </div>
    </div>
  )
}