import { useMemo, useState } from "react";
import { useHistory } from 'react-router-dom';
import { useSearchState } from "../AppHooks";
import { SvgCow, SvgPig, SvgSearch } from "../assets/Icons";
import DataTag, { FeedbackTypes } from "../components/DataTag";
import { DatabaseWait } from "../database/Database";
import Animal, { AnimalType, Eater, IAnimal, paddedAnimalId, useAnimals } from "../database/types/Animal";
import { IUser } from "../database/types/User";
import { animalDetailsPage } from "../NavBar";
import { formatPhoneNumber, normalizeDay } from "../Util";

export const InCoolerPage = () => {

  const [tab, toggleTab] = useState(true);

  const animals = useAnimals(Animal
    .where("pickedUp", false)
    .where("liveWeight").ne(null)
    .populate("bringer", "name cutInstructions phoneNumbers")
    .populate("eaters.id", "name cutInstructions phoneNumbers")
    .populate("eaters.halfUser.id", "name cutInstructions phoneNumbers")
  )

  const beef: (IAnimal)[] = []
  const pork = []
  if (animals !== DatabaseWait) {
    animals.sort((a, b) => b.killDate.getTime() - a.killDate.getTime())
    animals.forEach(a => (a.animalType === AnimalType.Beef ? beef : pork).push(a))
  }

  const [search, setSearch, regExp] = useSearchState()
  const searchedAsDate = useMemo(() => {
    try {
      const date = normalizeDay(new Date(search))
      if (isNaN(date.getTime())) return null
      return date
    } catch {
      return null
    }
  }, [search])

  const list = (tab ? beef : pork)
    .filter(a => {
      if (searchedAsDate !== null) {
        return a.killDate.getTime() === searchedAsDate.getTime()
      }

      //We project `animal.bringer` and `animal.eaters` to be of type `IUser` when we query the database
      //Cba to fix typescript errors
      const names = [a.bringer.name, ...a.eaters.map(e => e.id.name), ...a.eaters.map(e => e.halfUser?.id?.name)]
      return names.some(n => n !== undefined && regExp.test(n))
    })

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-gray-800 py-2 px-2 flex flex-row justify-end">
        <div className="relative rounded-md shadow-sm flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">
              <SvgSearch />
            </span>
          </div>
          <input type="text" name="search" className="block w-full pl-9 pr-12 border-gray-300 rounded-md h-10" placeholder="Search" onChange={e => setSearch(e.target.value)} value={search} />
        </div>
      </div>
      <div className="flex flex-row">
        <div className="text-white h-8 px-2 py-1 mt-2 rounded-md bg-tomato-300 hover:bg-tomato-400 mx-4 cursor-pointer" onClick={() => toggleTab(true)}>View Beef</div>
        <div className="text-white h-8 px-2 py-1 mt-2 rounded-md bg-green-300 hover:bg-green-400 cursor-pointer" onClick={() => toggleTab(false)}>View Pork</div>
      </div>
      <div className="pt-2">
        <div className="w-auto bg-gray-200 mx-4 h-full rounded-lg">
          <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1" >{(tab ? "BEEF: " : "PORK: ") + list.length}</div>
          {animals === DatabaseWait ? "Loading..." :
            list.map(c => <AnimalInfoEntry key={c.id} animal={c} />)
          }
        </div>
      </div>
    </div>
  )
}

const AnimalInfoEntry = ({ animal }: { animal: IAnimal }) => {
  const history = useHistory()


  //We project `animal.bringer` and `animal.eaters` to be of type `IUser` when we query the database
  const mainUser = animal.bringer as unknown as IUser

  const Tag = animal.animalType === AnimalType.Beef ? SvgCow : SvgPig

  var firstPhoneNumber = mainUser?.phoneNumbers[0];
  var formattedPhoneNumber = (firstPhoneNumber !== null && firstPhoneNumber !== undefined) ? formatPhoneNumber(firstPhoneNumber.number) : "???"

  return (
    <div className="group bg-gray-100 shadow-sm hover:shadow-lg hover:border-transparent p-1 mx-4 mt-1 my-2 rounded-lg flex flex-row">
      <div className="mr-1">
        <Tag className="text-gray-800 group-hover:text-tomato-900 w-5 h-5 mr-2 mt-1 ml-4" />
        <DataTag name={`#${paddedAnimalId(animal)}`} />
        <p className="font-semibold ml-2">Killed</p>
        <DataTag name={String(animal.killDate.toDateString())}
      </div>
      <div>
        <div className="flex flex-row" onClick={() => history.push(animalDetailsPage, animal.id)}>
          <div className="text-gray-800 group-hover:text-gray-900 flex-shrink pr-4">
            <p className="font-semibold">Bringer</p>
            <div className="flex flex-row">
              <DataTag name={mainUser?.name ?? "???"} />
              <DataTag name={formattedPhoneNumber} />
            </div>
          </div>
          <div className="text-gray-800 group-hover:text-gray-900 mx-2 w-auto mr-2">
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
          <div className="text-gray-800 group-hover:text-gray-900 mx-2 w-auto mr-2">
            <p className="font-semibold">Dress Info</p>
            <div className="flex flex-row">
              <DataTag name={String(animal.dressWeight ?? "???") + "lbs"} />
            </div>
          </div>
        </div>
        <div className="flex flex-row">
          <div className="text-gray-800 group-hover:text-gray-900 w-48 mr-4">
            <p className="font-semibold">Eaters</p>
            <div className="flex flex-row">
              {animal.eaters.map((e, i) => {
                //We project `animal.bringer` and `animal.eaters` to be of type `IUser` when we query the database
                const user = e.id as unknown as IUser
                const halfUser = e.halfUser !== undefined ? e.halfUser.id as unknown as IUser : undefined
                return (
                  <EatersBlock eater={e} user={user} halfUser={halfUser} index={i} />
                )
              })}
            </div>
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

  const userPhone = user?.phoneNumbers[0] ? formatPhoneNumber(user?.phoneNumbers[0].number) : "???";
  const halfUserPhone = halfUser !== undefined ? halfUser?.phoneNumbers[0] !== null ? formatPhoneNumber(halfUser?.phoneNumbers[0].number) : "???" : "???";

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