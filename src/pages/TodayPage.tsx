import { PosPrintData } from "electron-pos-printer";
import { useMemo } from "react";
import { useHistory } from 'react-router-dom';
import { SvgCow, SvgEdit, SvgPig, SvgPrint } from "../assets/Icons";
import DataTag, { FeedbackTypes } from "../components/DataTag";
import UserTag from "../components/UserTag";
import { DatabaseWait } from "../database/Database";
import Animal, { AnimalStateFields, AnimalType, Eater, IAnimal, paddedAnimalId, useAnimals, useComputedAnimalState } from "../database/types/Animal";
import { PriceData, useConfig } from "../database/types/Configs";
import { BeefCutInstructions } from "../database/types/cut_instructions/Beef";
import { PorkCutInstructions } from "../database/types/cut_instructions/Pork";
import Invoice, { generateInvoice } from "../database/types/Invoices";
import User, { CutInstructions, IUser, useUsers } from "../database/types/User";
import { hangingAnimals, printGenericSheet, setModal } from "../modals/ModalManager";
import { animalDetailsPage } from "../NavBar";
import { formatDay, formatPhoneNumber, formatWhole, getDayNumber, normalizeDay } from "../Util";

export const TodayPage = () => {
  const today = useMemo(() => new Date(), [])
  return (
    <div className="w-full h-screen overflow-y-hidden">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">TODAY</div>
        <div className="text-gray-700 ml-1 text-3xl">
          {(today.getMonth() + 1).toString().padStart(2, '0')}
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

  const priceData = useConfig("PriceData")

  return (
    <div className="w-2/3 h-full flex-grow pl-4 pr-2 py-4">
      <div className="h-full bg-gray-200 rounded-lg">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Cut List</div>
          <div className="bg-blue-300 p-1 rounded-sm text-white text-xs flex flex-row cursor-pointer mr-2" onClick={() => animals !== DatabaseWait && priceData !== DatabaseWait && doPrintAll(animals, priceData)}>
            <SvgPrint className="mt-1 mr-1" />
            Print Cut List
          </div>
          <div className="bg-blue-300 p-1 rounded-sm text-white text-xs flex flex-row cursor-pointer mr-2" onClick={() => setModal(hangingAnimals)}>
            <SvgEdit className="mt-0.5 mr-1" />
            Edit Cut List
          </div>
        </div>
        {animals !== DatabaseWait && animals.map(a => <SelectedCutList key={a.id} animal={a} />)}
      </div>
    </div>
  )
}

const SelectedCutList = ({ animal }: { animal: IAnimal }) => {
  const history = useHistory()
  const allUsers = useMemo(() => [animal.bringer, ...animal.eaters.map(e => e.id)], [animal])
  const allFoundUsers = useUsers(User.where('_id').in(allUsers).select("name phoneNumbers cutInstructions"))

  const mainUser = allFoundUsers === DatabaseWait ? DatabaseWait : allFoundUsers.find(u => u.id === animal.bringer.toHexString())

  if (mainUser === DatabaseWait || allFoundUsers === DatabaseWait) {
    return (<div>Loading...</div>)
  }
  if (mainUser === null) {
    return (<div>Problem loading user with ID {animal.bringer.toHexString()}</div>)
  }

  const Tag = animal.animalType === AnimalType.Beef ? SvgCow : SvgPig
  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row" onClick={() => history.push(animalDetailsPage, animal.id)}>
      <div className="mr-1">
        <Tag className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-1 ml-4" />
        <DataTag name={`#${paddedAnimalId(animal)}`} />
      </div>
      <div>
        <div className="flex flex-row">
          <div className="text-gray-800 group-hover:text-gray-900">
            <p className="font-semibold">Bringer:</p>
            <div className="flex flex-row">
              <UserTag user={mainUser} />
              <DataTag name={"" + formatPhoneNumber(mainUser?.phoneNumbers[0].number) ?? "???"} />
            </div>
          </div>

          <div className="text-gray-800 group-hover:text-gray-900 ml-4">
            <p className="font-semibold">Living Info</p>
            <div className="flex flex-row">
              <DataTag name={String(animal.liveWeight ?? "???") + "lbs"} />
              <DataTag name={animal.color} />
              <DataTag name={animal.sex} />
              <DataTag name={"Tag #" + String(animal.tagNumber ?? "???")} />
              <DataTag name={"Pen " + animal.penLetter} />
              {animal.animalType === AnimalType.Beef &&
                <DataTag name={animal.older30Months ? "> 30 Months" : "< 30 Months"} feedback={animal.older30Months ? FeedbackTypes.positive : FeedbackTypes.negative} />
              }
              <DataTag name={animal.liverGood ? "Liver Good" : "Liver Bad"} feedback={animal.liverGood ? FeedbackTypes.positive : FeedbackTypes.negative} />
            </div>
          </div>
        </div>

        <div className="text-gray-800 group-hover:text-gray-900">
          <p className="font-semibold">Eaters:</p>
          <div className="flex flex-row">
            {
              animal.eaters.map((e, i) => {
                const user = allFoundUsers.find(u => String(u.id) === String(e.id))
                const halfUser = e.halfUser !== undefined ? allFoundUsers.find(u => String(u.id) === String(e.halfUser.id)) : undefined
                return (
                  <EatersBlock eater={e} user={user} halfUser={halfUser} index={i} />
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const EatersBlock = ({ eater, user, halfUser, index }: { eater: Eater, user: IUser, halfUser: IUser | undefined, index: number }) => {

  const cutInstructionName = user.cutInstructions.find(c => c.id === eater.cutInstruction)?.nickname ?? "???";

  const userName = user?.name ?? "???";
  const halfUserName = halfUser?.name ?? "???";

  const userTag = eater.tag === "" ? "" : ` (${eater.tag})`;
  const halfUserTag = eater.halfUser !== undefined ? eater.halfUser?.tag === "" ? "" : `(${eater.halfUser.tag})` : "";

  const userPhone = formatPhoneNumber(user?.phoneNumbers[0].number);
  const halfUserPhone = eater.halfUser !== undefined ? formatPhoneNumber(user?.phoneNumbers[0].number) : "???";

  return (
    <div key={index} className="flex flex-row">
      <DataTag key={`${index}a`} name={cutInstructionName} feedback={cutInstructionName !== "???" ? FeedbackTypes.positive : FeedbackTypes.warning} />
      <div>
        <DataTag key={`${index}b`} name={`${userName} ${userTag}`} />
        <DataTag key={`${index}ba`} name={userPhone} />
      </div>
      {halfUser !== undefined &&
        <div>
          <DataTag key={`${index}c`} name={`${halfUserName} ${halfUserTag}`} />
          <DataTag key={`${index}ca`} name={halfUserPhone} />
        </div>
      }
    </div>
  );
}

const ScheduledSlaughterList = () => {
  const now = normalizeDay()
  const scheduledToday = useAnimals(Animal.where('killDate', now).select("bringer eaters animalType confirmed animalId " + AnimalStateFields), [getDayNumber(now)])

  if (scheduledToday === DatabaseWait) {
    return (<div>Loading...</div>)
  }

  return (
    <div className="w-1/3 h-full pl-2 pr-4 py-4 flex-grow">
      <div className="h-full bg-gray-200 rounded-lg pb-14">
        <div className="bg-gray-700 p-1 mb-3 flex flex-row rounded-t-lg">
          <div className="flex-grow text-gray-200 pl-4 font-semibold">Today's Scheduled Slaughters</div>
        </div>
        <div className="overflow-y-scroll h-full">
          {scheduledToday.length > 0 ? scheduledToday.map((a, i) => <SlaughterInfo key={i} animal={a} />) : <p className="ml-4">No scheduled slaughters for today.</p>}
        </div>
      </div>
    </div>
  )
}

const SlaughterInfo = ({ animal }: { animal: IAnimal }) => {
  const allIds = useMemo(() => {
    if (animal.bringer === undefined || animal.eaters === undefined) {
      return []
    }
    const arr = [animal.bringer]
    animal.eaters.forEach(eater => arr.push(eater.id))
    return arr.map(e => { return { _id: e } })
  }, [animal])
  const allUsers = useUsers(User.where('_id').in(allIds).select("name"), [allIds], ...allIds.map(i => i._id))

  const user = allUsers === DatabaseWait ? DatabaseWait : allUsers.find(u => u.id === animal.bringer.toHexString())

  const history = useHistory();

  const state = useComputedAnimalState(animal);

  if (user === DatabaseWait) {
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
  <div style="${grow ? "flex-grow: 1; " : "text-align: center; "} margin: 5px 10px; text-transform: capitalize;">
      <div style="font-size: large; font-weight: bold;">${value}</div>
      ${key}
  </div>
`
}


const instructionDiv = (part: string, value: string) => {
  return `
  <div style="font-size: large; margin: 10px 0px">
      ${part}: 
      <span style="font-size: xx-large; font-weight: bold;">
        ${value
      .replace(/chicken fry/ig, "CF")
      .replace(/hamburger/ig, "HB")
      .replace(/tenderized/ig, "T")}
      </span>
  </div>
  `
}


const doPrintAll = async (animals: IAnimal[], currentPrices: PriceData) => {
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

  let nextLength = (await Invoice.find().select("invoiceId").exec()).reduce((p, c) => Math.max(p, c.invoiceId + 1), 0)

  const handledInvoices: string[] = []

  for (let i = 0; i < animals.length; i++) {
    const animal = animals[i];
    if (animal.eaters.length === 0) {
      alert("Animals has no eaters.")
    }
    const bringer = await User.findById(animal.bringer);
    if (bringer === null) {
      alert("Bringer not found.")
      continue
    }

    const numberOfAnimalsBroughtInSameDay = (await Animal
      .where("bringer", bringer.id)
      .where("animalType", animal.animalType)
      .where("killDate", animal.killDate.getTime())
      .exec()).length


    for (let j = 0; j < animal.eaters.length; j++) {
      const eater = animal.eaters[j]

      const user = await User.findById(eater.id)
      if (!user) {
        alert("Unable to find main user")
        continue
      }

      let subUser: IUser | null = null
      if (eater.halfUser) {
        subUser = await User.findById(eater.halfUser.id)
        if (!subUser) {
          alert("Unable to find subUser")
          continue
        }
      }

      const allUsers = subUser ? [user, subUser] : [user]

      const cutInstruction = user.cutInstructions.find(c => c.id === eater.cutInstruction)
      if (!cutInstruction) {
        alert("Unable to find cutInstruction with id " + eater.cutInstruction + " for user " + user.name + ". Page will be skipped.")
        continue
      }

      const quaters = eater.halfUser ? 1 : (animal.numEaters === 1 ? 4 : 2);
      if (animal.invoices.length === 0) {
        for (const u of allUsers) {
          await generateInvoice(animal, u, currentPrices.currentPrices, user, eater.cutInstruction!, cutInstruction.instructions, nextLength++, quaters)
          await u.save()
        }
        await animal.save()
      }

      for (const u of allUsers) {
        //It is impossible to query the invoice that this printing is doing, as there is not
        //enough identifiable information to do so.
        //Therefore, we can just ensure that we don't handle the same invoice twice with `handledInvoices`
        const invoices = (await Invoice
          .where("animal", animal.id)
          .where("user", u.id)
          .where("cutInstructionUser", user.id)
          .where("cutInstructionId", eater.cutInstruction)
          .where("numQuaters", quaters)
          .exec())
        const invoice = invoices.find(i => !handledInvoices.includes(i.id))
        if (!invoice) {
          console.log("Unable to find invoice for animal ", animal.id, " user ", u.id, " cutInstructionUser ", eater.id, " cutInstructionId ", eater.cutInstruction, " numQuaters ", quaters)
          alert("Unable to find invoice for animal " + animal.animalId)
          continue
        }
        handledInvoices.push(invoice.id)
        doPrint(data, animal, quaters, cutInstruction.instructions, eater, u, bringer, invoice.invoiceId, numberOfAnimalsBroughtInSameDay)
      }

    }

  }

  //Remove the last page break
  data.splice(data.length - 1, 1);

  setModal(printGenericSheet, {
    title: "Print Cut Lists",
    data
  })

}

const doPrint = (data: PosPrintData[], animal: IAnimal, quaters: number, cutInstruction: CutInstructions, eater: Eater, user: IUser, bringer: IUser, invoiceId: number, numberOfAnimals: number) => {
  const beef = cutInstruction as BeefCutInstructions
  const pork = cutInstruction as PorkCutInstructions


  //The top part of the invoice, containing the invoice id, and the animal id
  data.push({
    type: "text",
    value: `
    <div style="height: 30px"></div>
    <div style="display: flex; flex-direction: row; border-bottom: 1px solid black; text-align: center;">
        ${elementDiv(animal.animalId, "Animal ID")}
        <div style="flex-grow: 1; font-size: 4em; font-weight: bold; text-transform: capitalize;">
            ${animal.animalType.toUpperCase()} CUTTING SHEET
        </div>
        ${elementDiv(invoiceId, "Invoice ID")}
    </div>
    `
  })

  //The information about the bringer and the animal
  data.push({
    type: "text",
    value: `
    <div style="display: flex; flex-direction: row; border-bottom: 1px solid black; margin-top: 5px; margin-bottom: 5px;">
        ${elementDiv(`${bringer.name}<span style="margin-left: 5px; color: red;">${numberOfAnimals}</span>`, "Bringer", true)}
        ${elementDiv(formatDay(animal.killDate), "Date Killed")}
        ${elementDiv(animal.color, "Color")}
        ${elementDiv(animal.sex, "Sex")}
        ${elementDiv(animal.tagNumber, "Tag")}
        ${elementDiv(animal.penLetter, "Pen")}
        ${elementDiv(animal.liveWeight, "Live Weight")}
        ${elementDiv(animal.dressWeight, "Dressed Weight")}
        ${elementDiv(animal.liverGood ? "Yes" : "No", "Liver Good")}
    </div>
    `
  })

  //The information about the eaters
  data.push({
    type: "text",
    value: `
    <div style="display: flex; flex-direction: row; width: 100%; padding-bottom: 20px;  margin-top: 10px;">
        <div style="width: 100%; margin-left: 5px;">
          <div style="font-size: x-large; font-weight: bold;">
            ${user.name}${eater?.tag ? ` (${eater?.tag})` : ""}
          </div>
          Eater Name
          <div>
            ${user.emails.join("<br>")}<br>
            ${user.phoneNumbers.map(u => u.name + ": " + formatPhoneNumber(u.number)).join("<br>")}
          </div>
        </div>
        <div style="width: 100%">
            <div style="font-size: xx-large; font-weight: bold;">${formatWhole(quaters)}</div>
            <div>Portion</div>
            <div style="margin-top: 10px">
                <div style="display: flex; flex-direction: row;">
                  <span style="width: 150px">Instructions Taken By:</span>
                  <span>${cutInstruction.instructionsTakenBy ?? "???"}</span>
                </div>
                <div style="display: flex; flex-direction: row;">
                  <span style="width: 150px">Instructions Taken On:</span>
                  <span>${cutInstruction.instructionsTakenDate ?? "???"}</span>
                </div>
                <div style="display: flex; flex-direction: row;">
                  <span style="width: 150px">Instructions Given By:</span>
                  <span>${cutInstruction.personGivingInstructions ?? "???"}</span>
                </div>
            </div>
        </div>
    </div>
    <div style="border-bottom: 1px solid black; border-top: 1px solid black; height: 280px; width: 100%">
      <div style="font-size: x-large; margin-top: 5px">Comments:</div>
      ${cutInstruction.notes ?? ""}
    </div >
  `
  })

  const footer: PosPrintData[] = [
    {
      type: "text",
      value: `
    <br><br>
    <div style="display: flex; flex-direction: row; border-top: 2px solid black; padding-top: 10px">
      <div style="font-size: large; flex-grow: 1;">
        Take Home Weight:
      </div>
      <div style="font-size: large; width: 200px">
        Freezer:
      </div>
    </div>
    `
    },
    {
      type: "text",
      value: `<div class="page-break"></div>`
    }
  ]


  if (animal.animalType === AnimalType.Beef) {
    data.push(
      {
        type: "text",
        value: `
                  <div style="display: flex; flex-direction: row;">
                    <div style="width: 100%">
                        ${instructionDiv("Round", `${beef.round.keepAmount} ${beef.round.tenderized} ${beef.round.size} ${beef.round.perPackage} ${beef.round.howToUseRest}`)}
                        ${instructionDiv("Sirloin Tip", `${beef.sirlointip.size} ${beef.sirlointip.amount}`)}
                        ${instructionDiv("Flank", beef.flank)}
                        ${instructionDiv("Sirloin", `${beef.sirloin.size} ${beef.sirloin.amount}`)}
                        ${instructionDiv("T-Bone", `${beef.tbone.bone} ${beef.tbone.size} ${beef.tbone.amount}`)}
                        ${instructionDiv("Rump", beef.rump)}
                        ${instructionDiv("Pikes Peak", beef.pikespeak)}
                    </div>
                    <div style="width: 100%">
                      ${instructionDiv("Chuck", beef.chuck)}
                      ${instructionDiv("Arm", beef.arm)}
                      ${instructionDiv("Ribs", beef.ribs)}
                      ${instructionDiv("Club", `${beef.club.bone} ${beef.club.size} ${beef.club.amount}`)}
                      ${instructionDiv("Brisket", beef.brisket)}
                      ${instructionDiv("Soup Bones", beef.soupbones)}
                      ${instructionDiv("Stew Meat", `${beef.stewmeat.amount} ${beef.stewmeat.size}`)}
                    </div>
                  </div>
                  <div style="display: flex; flex-direction: row;">
                    <div style="width: 100%">
                        ${instructionDiv("Ground Beef", beef.groundbeef)}
                    </div>
                    <div style="width: 100%">
                      ${instructionDiv("Patties", `${beef.patties.weight} ${beef.patties.amount}`)}
                    </div>
                  </div>
              `
      }
    )
    data.push(...footer)
  } else {

    const getHalf = (n: number) => n + (n === 1 ? " Half" : " Halves")

    const generatePorkText = (fresh: boolean): PosPrintData => {
      const mapper = <T,>(obj: { fresh: T, cured: T }) => fresh ? obj.fresh : obj.cured

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
          ${fresh ? `
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