import { ModalHandler, setModal } from "./ModalManager";
import DayPicker from "react-day-picker"
import { SvgCow, SvgPig } from "../assets/Icons"
import Animal, { AnimalType, createEmptyAnimal, IAnimal, useAnimals } from "../database/types/Animal"
import ReactTooltip from "react-tooltip";
import { getDayNumber, normalizeDay } from "../Util";
import User, { useUsers } from "../database/types/User";
import { DayPickerCaption, fromMonth, toMonth } from "../components/DayPickerCaption";
import { mongo } from "mongoose";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useConfig } from "../database/types/Configs";
import { DatabaseWait } from "../database/Database";
import DayEvents, { useDayEvents } from "../database/types/DayEvents";

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
.DayPicker-Day--isFullDay {
  background-color: #de6f6f
}

.DayPicker-Day--isSelected {
  background-color: var(--blue-300)
}
.DayPicker-Day:hover {
  background-color: var(--blue-100) !important
}
`
export const SchueduleAnimalModal = forwardRef<ModalHandler, { userID: string }>(({ userID }, ref) => {
  const [animalType, setAnimalType] = useState<AnimalType>()
  const [scheduledDate, setScheduledDate] = useState<Date>()

  const fullDays = useConfig("FullDays")
  const disabledDays = fullDays === DatabaseWait ? DatabaseWait : fullDays.dates.map(d => d.getTime())
  const dayNumber = getDayNumber()
  const allAnimals = useAnimals(Animal.where('killDate').gte(Date.now()).select('killDate bringer'), [dayNumber])

  const allUsers = useUsers(User.find().select('name'))
  const allUserNames = allUsers === DatabaseWait ? undefined : allUsers.reduce((map, obj) => map.set(obj.id, obj.name), new Map<string, string>())

  const databaseLength = useAnimals(Animal.count())

  const [quantity, setQuantity] = useState(1)

  function getOrdersForDay(date: Date) {
    if (allAnimals === DatabaseWait) {
      return []
    }
    return allAnimals.filter(a => getDayNumber(a.killDate) == getDayNumber(date))
  }

  const isOrdersBetween = (date: Date, min: number, max: number): boolean => {
    //Don't look for days on weekends.
    if (date.getDay() === 0 || date.getDay() === 6) {
      return false
    }
    const num = getOrdersForDay(date).length
    return num >= min && num <= max
  }

  const valid = animalType !== undefined && scheduledDate !== null
  const trySubmitData = () => {
    if(databaseLength === DatabaseWait) {
      return
    }
    for (let i = 0; i < quantity; i++) {
      const newAnimal = createEmptyAnimal(userID)
      newAnimal.animalId = databaseLength + i
      newAnimal.animalType = animalType
      newAnimal.killDate = normalizeDay(scheduledDate)
      newAnimal.save().then(() => setModal(null))
    }

  }

  useImperativeHandle(ref, () => ({ onClose: () => valid ? trySubmitData() : false }))

  const [selectedMonth, setSelectedMonth] = useState(new Date())


  const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 0, 12, 0, 0, 0)
  const monthEnd = new Date(monthStart.getTime())
  monthEnd.setMonth(monthEnd.getMonth() + 1)
  const customDays = useDayEvents(
    DayEvents.
      where('startDate').lt(monthEnd.getTime()).
      where("endDate").gte(monthStart.getTime()).
      select("eventName eventColor startDate endDate noWork"), 
    [ monthStart.getTime() ]
  )

  const isDayFull = (date: Date) => {
    if(customDays !== DatabaseWait && customDays.some(d => d.noWork && date.getTime() >= d.startDate.getTime() && date.getTime() < d.endDate.getTime())) {
      return true
    }

    if(disabledDays !== DatabaseWait) {
      const normalizedDay = normalizeDay(date)
      normalizedDay.setDate(normalizedDay.getDate() - normalizedDay.getDay())
      if(disabledDays.includes(normalizedDay.getTime())) {
        return true
      }
    }

    return false
   
  }

  useEffect(() => {
    ReactTooltip.rebuild()
    console.log("rebyild")
  }, [selectedMonth.getTime()])

  return (
    <div style={{ width: '450px', height: '400px' }}>
      <div className="bg-gray-800 w-full rounded-t-sm text-white p-2 font-semibold">
        Schedule a New Animal
      </div>
      <div className="flex flex-row min-w-0">
        <div className="pr-2 mr-5 bg-gray-100 ml-2 flex flex-col">
          <div className="flex-grow">
            Animal Type:
            <div>
              <AnimalTypeSelect Icon={SvgCow} onSelected={() => setAnimalType(AnimalType.Beef)} isSelected={animalType === AnimalType.Beef} />
              <AnimalTypeSelect Icon={SvgPig} onSelected={() => setAnimalType(AnimalType.Pork)} isSelected={animalType === AnimalType.Pork} />
            </div>
          </div>
          <div className="flex flex-row">
            <span>Quantity: </span>
            <input className="flex-grow mx-3 w-10 bg-gray-500" type="number" value={quantity} onChange={e => setQuantity(e.currentTarget.valueAsNumber)} />
          </div>
          <button onClick={valid ? trySubmitData : undefined} className={`${valid ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"} py-1 mt-2 rounded-sm mb-2 px-4`}>Submit</button>
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
              isFullDay: date => isDayFull(date)
            }}
            month={selectedMonth}
            captionElement={({ date, localeUtils }) =>
              <DayPickerCaption date={date} locale={localeUtils} onChange={setSelectedMonth} />
            }
            onMonthChange={setSelectedMonth}
            fromMonth={fromMonth}
            toMonth={toMonth}
            disabledDays={[{ daysOfWeek: [0, 6] }, date => getDayNumber(date) < dayNumber ]}
            renderDay={day => {
              const orders = getOrdersForDay(day)
              const orderMap = new Map<string, number>()
              orders.forEach(order => {
                if (allUserNames === undefined) {
                  return
                }
                const key = allUserNames.get(order.bringer.toHexString())
                if (orderMap.has(key)) {
                  orderMap.set(key, orderMap.get(key) + 1)
                } else {
                  orderMap.set(key, 1)
                }
              })

              const tipLines = Array.from(orderMap).map(o => `${o[1]}x ${o[0]}`)

              if(isDayFull(day)) {
                tipLines.unshift("Day Marked As Full")
              }

              return (
                <div data-tip={tipLines.join("<br>")}
                  //Below is some hacks to make this div take up the entire parent area.
                  //This is to have the data-tip take up the whole area
                  style={{ margin: '-8px', padding: '8px' }}>
                  {day.getDate()}
                </div>
              )
            }}
          />
        </div>
      </div>
    </div>
  )
})

const AnimalTypeSelect = ({ Icon, onSelected, isSelected }: { Icon: any, onSelected: () => void, isSelected: boolean }) => {
  return (
    <button className={"w-full flex flex-row rounded-md p-1" + (isSelected ? " bg-blue-100" : "")} name="animal" onClick={() => onSelected()}>
      <Icon className="w-8 h-8 transform translate-x-1/2" />
    </button>
  )
}