import { ObjectId } from "mongoose"
import ReactTooltip from "react-tooltip"
import { useHistory } from 'react-router-dom';
import { SvgCow, SvgEdit, SvgPig, SvgPrint } from "../assets/Icons"
import Animal, { AnimalStateFields, AnimalType, IAnimal, useAnimals, useComputedAnimalState, validateEaters } from "../database/types/Animal"
import User, { IUser, useUsers } from "../database/types/User"
import { hangingAnimals, printGenericSheet, scheduleAnimal, setModal } from "../modals/ModalManager"
import { SchueduleAnimalModal } from "../modals/ScheduleAnimalModal"
import { formatDay, getDayNumber, normalizeDay, printPage } from "../Util"
import { userDetailsPage, animalDetailsPage } from "../NavBar";
import { useMemo } from "react";
import { DatabaseWait } from "../database/Database";
import UserTag from "../components/UserTag";
import { PosPrintData } from "electron-pos-printer";
import { PorkCutInstructions } from "../database/types/cut_instructions/Pork";
import { BeefCutInstructions } from "../database/types/cut_instructions/Beef";
import Invoice, { IInvoice } from "../database/types/Invoices";

export const TodayPage = () => {
  const today = useMemo(() => new Date(), [])
  return (
    <div className="w-full h-screen overflow-y-hidden">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">TODAY</div>
        <div className="text-gray-700 ml-1 text-3xl">
          {(today.getMonth()+1).toString().padStart(2, '0')}
          /
          {today.getDate().toString().padStart(2, '0')}
          /
          {today.getFullYear()}</div>
      </div>
      <div className="flex flex-row w-full h-full pb-14">
        <TodaysCutList />
        <ScheduledSlaughterList />
      </div>
    </div>
  )
}

const TodaysCutList = () => {
  const animals = useAnimals(Animal
    .where('processDate').ne(undefined)
    .where('pickedUp', false)
  )

  return (
    <div className="w-1/2 h-full flex-grow pl-4 pr-2 py-4">
      <div className="h-full bg-gray-200 rounded-lg">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Cut List</div>
          <div className="bg-blue-300 p-1 rounded-sm text-white text-xs flex flex-row cursor-pointer mr-2">
            <SvgPrint className="mt-1 mr-1" onClick={() => animals !== DatabaseWait && doPrintAll(animals)}/>
            Print Cut List
          </div>
          <div className="bg-blue-300 p-1 rounded-sm text-white text-xs flex flex-row cursor-pointer mr-2">
            <SvgEdit className="mt-0.5 mr-1" onClick={() => setModal(hangingAnimals)}/>
            Edit Cut List
          </div>
        </div>
        {animals !== DatabaseWait && animals.map(a => <SelectedCutList key={a.id} animal={a} />)}
      </div>
    </div>
  )
}

const SelectedCutList = ({animal}: {animal: IAnimal}) => {
  const allUsers = useMemo(() => [animal.bringer, ...animal.eaters.map(e => e.id)], [animal])
  const allFoundUsers = useUsers(User.where('_id').in(allUsers).select("name"))

  const mainUser = allFoundUsers === DatabaseWait ? DatabaseWait : allFoundUsers.find(u => u.id === animal.bringer.toHexString())

  if(mainUser === DatabaseWait || allFoundUsers === DatabaseWait) {
    return (<div>Loading...</div>)
  }
  if(mainUser === null) {
    return (<div>Problem loading user with ID {animal.bringer.toHexString()}</div>)
  }

  const Tag = animal.animalType === AnimalType.Beef ? SvgCow : SvgPig
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => console.log("go to animal")}>
      <div className="w-14 mr-1">
        <Tag className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-1 ml-4" />
        <p className="bg-gray-200 rounded-md text-xs py-1 px-2 text-gray-700 mt-1">#{animal.animalId}</p>
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag user={mainUser} />
      </div>
      <div className="flex-grow text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Eaters:</p>
        {animal.eaters.length > 0 ? animal.eaters.map((eater, i) => 
          <div className="flex flex-row" key={i} >
            <p className="flex-grow bg-gray-200 rounded-md text-xs py-1 px-2 text-gray-700 mt-1 mr-1">{allFoundUsers.find(u => eater.id.toHexString()).name}</p>
            <p className="bg-gray-200 rounded-md text-xs py-1 px-2 text-gray-700 mt-1">#{eater.cutInstruction}</p>
          </div> ) : <p className="font-semibold text-tomato-400">Error</p>}
      </div>
    </div>
  )
}

const ScheduledSlaughterList = () => {
  const now = normalizeDay()
  const scheduledToday = useAnimals(Animal.where('killDate', now).select("bringer eaters animalType confirmed animalId " + AnimalStateFields), [ getDayNumber(now) ])

  if(scheduledToday === DatabaseWait) {
    return (<div>Loading...</div>)
  }

  return (
    <div className="w-1/2 h-full pl-2 pr-4 py-4 flex-grow">
      <div className="h-full bg-gray-200 rounded-lg pb-14">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Scheduled Slaughters</div>
        </div>
        <div className="overflow-y-scroll h-full">
          { scheduledToday.length > 0 ? scheduledToday.map((a, i) => <SlaughterInfo key={i} animal={a} />) : <p className="ml-4">No scheduled slaughters for today.</p> }
        </div>
      </div>
    </div>
  )
}

const SlaughterInfo = ({animal}: {animal: IAnimal}) => {
  const allIds = useMemo(() => {
    if(animal.bringer === undefined || animal.eaters === undefined) {
      return []
    }
    const arr = [animal.bringer]
    animal.eaters.forEach(eater => arr.push(eater.id))
    return arr.map(e => { return { _id: e }})
  }, [animal])
  const allUsers = useUsers(User.where('_id').in(allIds).select("name"), [allIds], ...allIds.map(i => i._id))
  
  const user = allUsers === DatabaseWait ? DatabaseWait : allUsers.find(u => u.id === animal.bringer.toHexString())

  const history = useHistory();

  const state = useComputedAnimalState(animal);

  if(user === DatabaseWait) {
    return (<div>Loading...</div>)
  }
  
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => history.push(animalDetailsPage, animal.id)}>
      <div className="w-14 mr-1">
        {animal.animalType === AnimalType.Beef ? <SvgCow className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-1 ml-4" /> : <SvgPig className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-1 ml-4" />}
        <p className="bg-gray-200 rounded-md text-xs py-1 px-2 text-gray-700 mt-1">#{animal.animalId}</p>
      </div>
      <div className="w-1/2 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Bringer:</p>
        <UserTag user={user} />
      </div>
      <div className="w-1/2 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Confirmed:</p>
        <p className={`font-semibold ${animal.confirmed ? "text-green-400" : "text-tomato-400"}`}>{animal.confirmed ? "Yes" : "No"}</p>
      </div>
      <div className="w-1/2 text-gray-800 group-hover:text-gray-900">
        <p className="font-semibold">Done:</p>
        <p className={`font-semibold ${state >= 2 ? "text-green-400" : "text-tomato-400"}`}>{state >= 2 ? "Yes" : "No"}</p>
      </div>
    </div>
  )
}


const elementDiv = (value: any, key: string, grow = false) => {
  return `
  <div style="${grow ? "flex-grow: 1; " : "text-align: center;"} margin: 5px 10px;">
      <div style="font-size: large;">${value}</div>
      ${key}
  </div>
`
}

const formatEater = (user: IUser, tag?: string) => {
  return `
  <div style="margin-left: 5px">
      <div style="font-size: x-large;">
          ${user.name}${(tag) ? ` (${tag})` : ""}
      </div>
      <div>
          ${user.emails.join("<br>")}<br>
          ${user.phoneNumbers.map(u => u.name + ": " + u.number).join("<br>")}
      </div>
  </div>
  `
}

const instructionDiv = (part: string, value: string) => {
  return `
  <div style="font-size: large; margin: 10px 0px">
      ${part}: <span style="font-size: xx-large; font-weight: bold;">${value}</span>
  </div>
  `
}


const doPrintAll = async(animals: IAnimal[]) => {
  const data: PosPrintData[] = [{
    type: "text",
    value: `
      <style>
        @media print {
          .page-break  { 
            display:block; 
            page-break-before:always; 
          }
        }
        * {
          font-family: Arial, Helvetica, sans-serif;
        }
      </style>
    `
  }]

  for (let i = 0; i < animals.length; i++) {
    const animal = animals[i];
    for (let j = 0; j < animal.invoices.length; j++) {
      const invoice = await Invoice.findById(animal.invoices[j]);
      if(!invoice) {
        alert("Unable to find invoice data.")
        continue

      }
      
      const user = await User.findById(invoice.user)
      if(!user) {
        alert("Unable to find main user")
        continue
      }

      let subUser: IUser
      if(invoice.secondaryUser) {
        subUser = await User.findById(invoice.secondaryUser)
        if(!subUser) {
          alert("Unable to find subUser")
          continue
        }
      }
      doPrint(data, animal, invoice, user, subUser)
    }
  }

  //Remove the last page break
  data.splice(data.length - 1, 1);

  setModal(printGenericSheet, {
    title: "Print Cut Lists",
    data
  })

}

const doPrint = async(data: PosPrintData[], animal: IAnimal, invoice: IInvoice, user: IUser, subUser?: IUser) => {
  const eater = animal.eaters.find(e => e.id.toHexString() == user.id)
  if(!eater) {
      console.error(`Unable to find cut instruction for user ${user.id} in animal ${animal.id}(${animal.animalId}). Found ${animal.eaters.map(e => e.id)} instead `)
  }

  const beef = invoice.cutInstruction as BeefCutInstructions
  const pork = invoice.cutInstruction as PorkCutInstructions

  //The top part of the invoice, containing the invoice id, and the animal id
  data.push({
    type: "text",
    value: `
    <div style="display: flex; flex-direction: row; border-bottom: 1px solid black; text-align: center; ">
        ${elementDiv(animal.animalId, "Animal ID")}
        <div style="flex-grow: 1; font-size: 4em;">
            Cutting Sheet
        </div>
        ${elementDiv(invoice.invoiceId, "Invoice ID")}
    </div>
    `
  })
  
  //The information about the bringer and the animal
  data.push({
    type: "text",
    value:  `
    <div style="display: flex; flex-direction: row; border-bottom: 1px solid black; ">
        ${elementDiv(user.name, "Bringer", true)}
        ${elementDiv(`<span style="font-size: large; font-weight: bold;">${invoice.half ? "Half" : "Whole"}</span>`, "Portion")}
        ${elementDiv(formatDay(animal.killDate), "Date Killed")}
        ${elementDiv(animal.color, "Color")}
        ${elementDiv(animal.sex, "Sex")}
        ${elementDiv(animal.tagNumber, "Tag")}
        ${elementDiv(animal.penLetter, "Pen")}
        ${elementDiv(animal.liveWeight, "Live Weight")}
        ${elementDiv("__________", "Dressed Weight")}
    </div>
    `
  })

  //The information about the eaters
  data.push({
    type: "text",
    value:  `
    <div style="display: flex; flex-direction: row; width: 100%; padding-bottom: 20px">
        <div style="width: 100%">
            Main Eater:
            ${formatEater(user, eater?.tag)}
        </div>
        <div style="width: 100%">
            Sharer (If Half of Half)
            ${subUser ? formatEater(subUser, eater?.halfUser?.tag) : `<div style="margin-left: 5px; font-size: xx-large">No Half of Half</div>`}
        </div>
    </div>
    `
  })

  const footer: PosPrintData[] = [
    {
      type: "text",
      value: `
      <br><br><br>
      <span style="style="font-size: large;"">Take Home Weight: _______________</span>
      `
    },
    {
      type: "text",
      value: `<div class="page-break"></div>`
    }
  ] 


  if(animal.animalType === AnimalType.Beef) {
      data.push(
          {
              type: "text",
              value: `
                  <div>
                      ${instructionDiv("Round", `${beef.round.tenderizedAmount} ${beef.round.size} ${beef.round.perPackage}`)}
                      ${instructionDiv("Sirloin Tip", `${beef.sirlointip.size} ${beef.sirlointip.amount}`)}
                      ${instructionDiv("Flank", beef.flank)}
                      ${instructionDiv("Sirloin", `${beef.sirloin.size} ${beef.sirloin.amount}`)}
                      ${instructionDiv("T-Bone", `${beef.tbone.bone} ${beef.tbone.size} ${beef.tbone.amount}`)}
                      ${instructionDiv("Rump", beef.rump)}
                      ${instructionDiv("Pikes Peak", beef.pikespeak)}

                      ${instructionDiv("Stew Meat", `${beef.stewmeat.amount} ${beef.stewmeat.size}`)}
                      ${instructionDiv("Patties", `${beef.patties.weight} ${beef.patties.amount}`)}
                  </div>
              `
          }
      )
      data.push(...footer)
  } else {

      const getHalf = (n: number) => n + (n === 1 ? " Half" : " Halves")

      const generatePorkText = (fresh: boolean): PosPrintData => {
          const mapper = <T,>(obj: {fresh: T, cured: T}) => fresh ? obj.fresh : obj.cured

          const hamIns = mapper(pork.ham)
          const baconIns = mapper(pork.bacon)
          const jowlIns = mapper(pork.jowl)
          const loinIns = mapper(pork.loin)
          const buttIns = mapper(pork.butt)
          const picnicIns = mapper(pork.picnic)
          return {
              type: "text",
              value: `
              <div>
                  <div style="font-size: x-large; font-weight: bold;">${fresh ? "Fresh" : "Cured"}</div>
                  <div>
                      ${instructionDiv("Ham", `${getHalf(hamIns.amount)} ${hamIns.type} ${hamIns.cutType} ${hamIns.size} ${hamIns.amountPerPackage}`)}
                      ${instructionDiv("Bacon", `${getHalf(baconIns.amount)} ${baconIns.cutType} ${baconIns.size}`)}
                      ${instructionDiv("Jowl", `${getHalf(jowlIns.amount)} ${jowlIns.type}`)}
                      ${instructionDiv("Loin", `${getHalf(loinIns.amount)} ${loinIns.size} ${loinIns.packageAmount}`)}
                      ${instructionDiv("Butt", `${getHalf(buttIns.amount)} ${buttIns.type} ${buttIns.packageAmount}`)}
                      ${instructionDiv("Picnic", `${getHalf(picnicIns.amount)} ${picnicIns.type} ${picnicIns.packageAmount}`)}
                      <br>
                      ${
                          fresh ? `
                              ${instructionDiv("Ribs", pork.rib)}
                              ${instructionDiv("Head", pork.head)}
                              ${instructionDiv("Feet", pork.feet)}
                              ${instructionDiv("Heart", pork.heart)}
                              ${instructionDiv("Fat", pork.fat)}
                          ` : `
                              ${instructionDiv("Sausage", pork.sausage)}
                          `
                      }
                  </div>
              </div>
          `
          }
      }

      const copiedHeader = Array.from(data)

      data.push(generatePorkText(true))
      data.push(...footer)

      data.push(...copiedHeader)
      data.push(generatePorkText(false))
      data.push(...footer)

  }
}