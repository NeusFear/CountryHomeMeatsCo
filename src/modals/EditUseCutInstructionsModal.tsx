import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import ReactTooltip from "react-tooltip";
import { SvgCow, SvgCross, SvgPig, SvgPlus } from "../assets/Icons";
import { SelectInputType } from "../components/SelectInputType";
import { DatabaseWait, DatabaseWaitType } from "../database/Database";
import { AnimalType } from "../database/types/Animal";
import { BeefCutInstructions } from "../database/types/cut_instructions/Beef";
import { PorkCutInstructions } from "../database/types/cut_instructions/Pork";
import User, { CutInstructions, useUsers } from "../database/types/User";
import { formatDay } from "../Util";
import { ModalHandler, setModal } from "./ModalManager";


export const EditUseCutInstructionsModal = forwardRef<ModalHandler, { id: string, instructionID: number }>(({ id, instructionID }, ref) => {
  const user = useUsers(User.findById(id).select('cutInstructions'), [id], id);

  const dbInstructionIndex = (user !== DatabaseWait && instructionID !== undefined) ?
    user.cutInstructions.findIndex(c => c.id === instructionID) :
    undefined

  const [nickname, setNickname] = useState("New Cut Instruction")
  const [takenBy, setTakenBy] = useState("")

  const dbInstrucionObject = user !== DatabaseWait ? user.cutInstructions[dbInstructionIndex] : undefined
  const dbInstructions = dbInstrucionObject?.instructions

  const [animalType, setAnimalType] = useState<AnimalType | DatabaseWaitType>(() => {
    if (instructionID === undefined) { //New instructions
      return AnimalType.Beef
    }
    if (dbInstructions === undefined) { //Not New, but waiting on database result
      return DatabaseWait
    }
    return dbInstructions.cutType
  })

  if (dbInstructions !== undefined && animalType === DatabaseWait) {
    setAnimalType(dbInstructions.cutType)
    setNickname(dbInstrucionObject.nickname)
    setTakenBy(dbInstructions.instructionsTakenBy ?? "")
  }

  const testFreshCured = (ins: { fresh: { amount: number }, cured: { amount: number } }) => ins.fresh.amount + ins.cured.amount === 2
  const testPigFreshCured = (ins: PorkCutInstructions) =>
    testFreshCured(ins.ham) && testFreshCured(ins.bacon) && testFreshCured(ins.jowl) &&
    testFreshCured(ins.loin) && testFreshCured(ins.butt) && testFreshCured(ins.picnic)

  //Can be undefined if is a new instruction
  const cutInstruction: CutInstructions = useMemo(() => {
    if (instructionID === undefined) {
      if (animalType === AnimalType.Beef) {
        return {
          cutType: AnimalType.Beef,
          round: {},
          sirlointip: {},
          sirloin: {},
          tbone: {},
          club: {},
          stewmeat: {},
          patties: {}
        } as BeefCutInstructions
      } else {
        const freshCuredObj = (fresh = true) => {
          return {
            fresh: { amount: fresh ? 2 : 0 },
            cured: { amount: fresh ? 0 : 2 }
          }
        }
        return {
          cutType: AnimalType.Pork,
          ham: freshCuredObj(false),
          bacon: freshCuredObj(false),
          jowl: freshCuredObj(),
          loin: freshCuredObj(),
          butt: freshCuredObj(),
          picnic: freshCuredObj(),
        } as PorkCutInstructions
      }
    }
    return dbInstructions
  }, [instructionID, id, animalType, user !== DatabaseWait])

  const genIfCanSubmit = (nick = nickname, taken = takenBy) => nick !== "" && taken !== "" && animalType !== DatabaseWait && (animalType === AnimalType.Beef || testPigFreshCured(cutInstruction as PorkCutInstructions))

  const [canSubmit, setCanSubmit] = useState(genIfCanSubmit)
  const refreshCanSubmit = () => setCanSubmit(genIfCanSubmit())

  //Make sure that when the animalType goes from DatabaseWait to whatever, we refresh the submit status
  useEffect(() => refreshCanSubmit(), [animalType])


  const submit = () => {
    if (user === DatabaseWait || !canSubmit || animalType === DatabaseWait) {
      return
    }
    cutInstruction.instructionsTakenBy = takenBy
    if (dbInstructions === undefined) {
      const ids = user.cutInstructions.map(i => i.id)
      let id = ids.length
      for (let i = 0; i < ids.length; i++) {
        if (!ids.includes(i)) {
          id = i
          break
        }
      }
      cutInstruction.cutType = animalType
      user.cutInstructions.push({ id, instructions: cutInstruction, nickname })
    } else {
      //We need to update the field so it's actually synced
      user.cutInstructions[dbInstructionIndex] = {
        id: dbInstrucionObject.id,
        instructions: cutInstruction,
        nickname,
      }
    }
    user.save()
    setModal(null)
  }

  useImperativeHandle(ref, () => ({ onClose: submit }))

  const [currentTypedDate, setCurrentTypedDate] = useState<string>("")
  useEffect(() => {
    if (dbInstructions?.instructionsTakenDate !== undefined) {
      setCurrentTypedDate(dbInstructions?.instructionsTakenDate)
    }
  }, [dbInstructions?.instructionsTakenDate])

  if (instructionID !== undefined && dbInstructions == undefined) {
    return (<div>Loading Cut Instructions...</div>)
  }

  if (user === DatabaseWait) {
    return (<div>Loading User...</div>)
  }

  if (user === null) {
    return (<div>Error loading User: {id}</div>)
  }


  return (
    <div className="flex flex-col overflow-clip" style={{ width: '900px', height: '620px' }}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        <span className="text-gray-300 font-semibold mt-1">{instructionID === undefined ? "Create new Cut Instruction" : "Edit Cut Instructions"}</span>
      </div>
      <div className="grid grid-cols-5 bg-gray-200">
        {!dbInstructions &&
          <>
            <div></div>
            <div></div>
            <div className="flex flex-row">
              <AnimalTypeSelect Icon={SvgCow} onSelected={() => setAnimalType(AnimalType.Beef)} isSelected={animalType === AnimalType.Beef} />
              <AnimalTypeSelect Icon={SvgPig} onSelected={() => setAnimalType(AnimalType.Pork)} isSelected={animalType === AnimalType.Pork} />
            </div>
          </>
        }
        <div></div>
        <div></div>
      </div>
      <div className="px-4 py-1">
        Nickname: <input className={nickname === "" ? "bg-tomato-200" : "bg-blue-200"} value={nickname} onChange={e => {
          const val = e.target.value
          setNickname(val)
          setCanSubmit(genIfCanSubmit(val))
        }} />
      </div>
      <div className="px-4 py-1">
        Instructions Taken By:  <input className={takenBy === "" ? "bg-tomato-200" : "bg-blue-200"} value={takenBy} onChange={e => {
          const val = e.target.value
          setTakenBy(val)
          setCanSubmit(genIfCanSubmit(undefined, val))
        }} />
      </div>
      <div className="px-4 py-1">
        Instructions Given By: <input className={"bg-blue-200"} defaultValue={cutInstruction.personGivingInstructions} onBlur={e => {
          cutInstruction.personGivingInstructions = e.target.value
        }} />
      </div>
      <div className="px-4 py-1">
        Instructions Taken At: <input className={"bg-blue-200"} value={currentTypedDate} onChange={e => {
          const val = e.target.value
          cutInstruction.instructionsTakenDate = val
          setCurrentTypedDate(val)
        }} />
        <button
          onClick={() => {
            const val = formatDay(new Date())
            cutInstruction.instructionsTakenDate = val
            setCurrentTypedDate(val)
          }}
          className="bg-blue-100 hover:bg-blue-200 cursor-pointer rounded-sm h-full px-4 ml-2"
        >Set To Today</button>
      </div>
      <div className="p-4 overflow-y-scroll h-full flex flex-col">
        {animalType !== DatabaseWait && (
          animalType === AnimalType.Pork ?
            <PorkInstructions instructions={cutInstruction as PorkCutInstructions} refreshSubmit={refreshCanSubmit} /> :
            <BeefInstructions instructions={cutInstruction as BeefCutInstructions} />
        )}
        <div className="flex flex-col mt-5">
          Notes:
          <textarea className="w-full border-gray-300 border"
            style={{ minHeight: '100px' }}
            defaultValue={cutInstruction.notes}
            onBlur={e => {
              cutInstruction.notes = e.target.value ?? ''
              user.save()
            }
            }></textarea>
        </div>
        <button disabled={!canSubmit} onClick={submit} className={(canSubmit ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-100 hover:bg-gray-200") + " cursor-pointer py-1 mt-5 rounded-sm mb-2 px-4 w-32"}>Submit</button>
      </div>
    </div>
  )
})

const PorkInstructions = ({ instructions, refreshSubmit }: { instructions: PorkCutInstructions, refreshSubmit: () => void }) => {
  const [state, setState] = useState(0)
  const refreshCanSubmit = () => {
    refreshSubmit()
    setState(state + 1) //Just force a re-render. We *should* have a way that only the valid parts update, but thats to do another time
  }
  return (
    <div className="flex-grow overflow-show">
      <div className="flex flex-row">
        <div className="flex-grow">
          <span className="ml-2 pr-2 text-gray-800 font-bold w-1/4">FRESH</span>
          <br />
          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Ham:</span>
            <div className="flex flex-col">
              <div className="flex flex-row mb-0.5">
                <PorkFreshCuredOptions obj={instructions.ham.fresh} refreshCanSubmit={refreshCanSubmit} />
                <SelectInputType
                  initial={instructions.ham.fresh.type}
                  onChange={v => instructions.ham.fresh.type = v}
                  values={['Whole', '2pcs', 'Ends for Roast', 'Shank for Roast', 'Grind']}
                  width={100}
                  disabled={instructions.ham.fresh.amount === 0}
                />
              </div>
              <div className="flex flex-row">
                <SelectInputType
                  initial={instructions.ham.fresh.cutType}
                  onChange={v => instructions.ham.fresh.cutType = v}
                  values={['Centers', 'Balance', 'Slice All']}
                  width={65}
                  disabled={instructions.ham.fresh.amount === 0}
                />
                <SelectInputType
                  initial={instructions.ham.fresh.size}
                  onChange={v => instructions.ham.fresh.size = v}
                  values={['1/2"']}
                  width={50}
                  disabled={instructions.ham.fresh.amount === 0}
                />
                <SelectInputType
                  initial={instructions.ham.fresh.amountPerPackage}
                  onChange={v => instructions.ham.fresh.amountPerPackage = v}
                  values={['2/Pkg']}
                  width={50}
                  disabled={instructions.ham.fresh.amount === 0}
                />
              </div>
              <br />
            </div>
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Bacon:</span>
            <PorkFreshCuredOptions obj={instructions.bacon.fresh} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.bacon.fresh.cutType}
              onChange={v => instructions.bacon.fresh.cutType = v}
              values={['Slice Fresh', 'Grind']}
              width={100}
              disabled={instructions.bacon.fresh.amount === 0}
            />
            <SelectInputType
              initial={instructions.bacon.fresh.size}
              onChange={v => instructions.bacon.fresh.size = v}
              values={['1.0 lb', '1.5 lb', '2.0 lb']}
              width={65}
              disabled={instructions.bacon.fresh.amount === 0}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Jowl:</span>
            <PorkFreshCuredOptions obj={instructions.jowl.fresh} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.jowl.fresh.type}
              onChange={v => instructions.jowl.fresh.type = v}
              values={['Grind', 'Whole', 'Slice']}
              width={65}
              disabled={instructions.jowl.fresh.amount === 0}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Loin:</span>
            <PorkFreshCuredOptions obj={instructions.loin.fresh} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.loin.fresh.size}
              onChange={v => instructions.loin.fresh.size = v}
              values={['1/2"', '3/4"', '1"', '1 1/4"']}
              width={65}
              defaultValue='3/4"'
              disabled={instructions.loin.fresh.amount === 0}
            />
            <SelectInputType
              initial={instructions.loin.fresh.packageAmount}
              onChange={v => instructions.loin.fresh.packageAmount = v}
              values={['2/Pkg', '3/Pkg', '4/Pkg', '5/Pkg', '6/Pkg']}
              width={65}
              defaultValue="4/Pkg"
              disabled={instructions.loin.fresh.amount === 0}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Butt:</span>
            <PorkFreshCuredOptions obj={instructions.butt.fresh} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.butt.fresh.type}
              onChange={v => instructions.butt.fresh.type = v}
              values={['CSRibs', '3lb Roast', '4lb Roast', '5lb Roast', '2 Pieces', 'Whole', '1/2"', '3/4"', 'Grind']}
              width={100}
              disabled={instructions.butt.fresh.amount === 0}
            />
            <SelectInputType
              initial={instructions.butt.fresh.packageAmount}
              onChange={v => instructions.butt.fresh.packageAmount = v}
              values={['2/Pkg', '3/Pkg', '4/Pkg']}
              width={65}
              defaultValue='3/Pkg'
              disabled={instructions.butt.fresh.amount === 0}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Picnic:</span>
            <PorkFreshCuredOptions obj={instructions.picnic.fresh} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.picnic.fresh.type}
              onChange={v => instructions.picnic.fresh.type = v}
              values={['3lb Roast', '4lb Roast', '5lb Roast', '2 Pieces', 'Whole', '1/2"', '3/4"', 'Grind']}
              width={90}
              disabled={instructions.picnic.fresh.amount === 0}
            />
            <SelectInputType
              initial={instructions.picnic.fresh.packageAmount}
              onChange={v => instructions.picnic.fresh.packageAmount = v}
              values={['2/Pkg', '3/Pkg', '4/Pkg']}
              width={65}
              defaultValue=""
              disabled={instructions.picnic.fresh.amount === 0}
            />
          </div>
        </div>

        <div className="flex-grow">
          <span className="ml-2 pr-2 text-gray-800 font-bold w-1/4">CURED</span>
          <br />
          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Ham:</span>
            <div className="flex flex-col">
              <div className="flex flex-row mb-0.5">
                <PorkFreshCuredOptions obj={instructions.ham.cured} refreshCanSubmit={refreshCanSubmit} />
                <SelectInputType
                  initial={instructions.ham.cured.type}
                  onChange={v => instructions.ham.cured.type = v}
                  values={['Whole', '2pcs', 'Ends for Roast', 'Shank for Roast', 'Grind']}
                  width={130}
                  defaultValue="Ends for Roast"
                  disabled={instructions.ham.cured.amount === 0}
                />
              </div>
              <div className="flex flex-row">
                <SelectInputType
                  initial={instructions.ham.cured.cutType}
                  onChange={v => instructions.ham.cured.cutType = v}
                  values={['Centers', 'Balance', 'Slice All']}
                  width={80}
                  disabled={instructions.ham.cured.amount === 0}
                />
                <SelectInputType
                  initial={instructions.ham.cured.size}
                  onChange={v => instructions.ham.cured.size = v}
                  values={['1/2"']}
                  width={50}
                  disabled={instructions.ham.cured.amount === 0}
                />
                <SelectInputType
                  initial={instructions.ham.cured.amountPerPackage}
                  onChange={v => instructions.ham.cured.amountPerPackage = v}
                  values={['2/Pkg']}
                  width={65}
                  disabled={instructions.ham.cured.amount === 0}
                />
              </div>
              <br />
            </div>
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Bacon:</span>
            <PorkFreshCuredOptions obj={instructions.bacon.cured} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.bacon.cured.cutType}
              onChange={v => instructions.bacon.cured.cutType = v}
              values={['Regular', 'Thick', 'Thin']}
              width={80}
              disabled={instructions.bacon.cured.amount === 0}
            />
            <SelectInputType
              initial={instructions.bacon.cured.size}
              onChange={v => instructions.bacon.cured.size = v}
              values={['1.0 lb', '1.5 lb', '2.0 lb']}
              width={65}
              defaultValue="1.5 lb"
              disabled={instructions.bacon.cured.amount === 0}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Jowl:</span>
            <PorkFreshCuredOptions obj={instructions.jowl.cured} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.jowl.cured.type}
              onChange={v => instructions.jowl.cured.type = v}
              values={['Chuck', 'Whole', 'Slice']}
              width={70}
              disabled={instructions.jowl.cured.amount === 0}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Loin:</span>
            <PorkFreshCuredOptions obj={instructions.loin.cured} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.loin.cured.size}
              onChange={v => instructions.loin.cured.size = v}
              values={['1/2"', '3/4"', '1"', '1 1/4"']}
              width={70}
              disabled={instructions.loin.cured.amount === 0}
            />
            <SelectInputType
              initial={instructions.loin.cured.packageAmount}
              onChange={v => instructions.loin.cured.packageAmount = v}
              values={['2/Pkg', '3/Pkg', '4/Pkg', '5/Pkg', '6/Pkg']}
              width={65}
              disabled={instructions.loin.cured.amount === 0}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Butt:</span>
            <PorkFreshCuredOptions obj={instructions.butt.cured} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.butt.cured.type}
              onChange={v => instructions.butt.cured.type = v}
              values={['3lb Roast', '4lb Roast', '5lb Roast', '2 Pieces', 'Whole', '1/2"', '3/4"', 'Grind']}
              width={90}
              disabled={instructions.butt.cured.amount === 0}
            />
            <SelectInputType
              initial={instructions.butt.cured.packageAmount}
              onChange={v => instructions.butt.cured.packageAmount = v}
              values={['2/Pkg', '3/Pkg', '4/Pkg']}
              width={65}
              disabled={instructions.butt.cured.amount === 0}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Picnic:</span>
            <PorkFreshCuredOptions obj={instructions.picnic.cured} refreshCanSubmit={refreshCanSubmit} />
            <SelectInputType
              initial={instructions.picnic.cured.type}
              onChange={v => instructions.picnic.cured.type = v}
              values={['3lb Roast', '4lb Roast', '5lb Roast', '2 Pieces', 'Whole', '1/2"', '3/4"', 'Grind']}
              width={90}
              disabled={instructions.picnic.cured.amount === 0}
            />
            <SelectInputType
              initial={instructions.picnic.cured.packageAmount}
              onChange={v => instructions.picnic.cured.packageAmount = v}
              values={['2/Pkg', '3/Pkg', '4/Pkg']}
              width={65}
              disabled={instructions.picnic.cured.amount === 0}
            />
          </div>
        </div>
        <div className="flex-grow">
          <span className="ml-2 pr-2 text-gray-800 font-bold w-1/4">VALID</span>
          <br />
          <div className="pt-4 flex flex-row">
            <PartValid instruction={instructions.ham} />
          </div>

          <div className="pt-16 flex flex-row">
            <PartValid instruction={instructions.bacon} />
          </div>

          <div className="pt-5 flex flex-row">
            <PartValid instruction={instructions.jowl} />
          </div>

          <div className="pt-5 flex flex-row">
            <PartValid instruction={instructions.loin} />
          </div>

          <div className="pt-5 flex flex-row">
            <PartValid instruction={instructions.butt} />
          </div>

          <div className="pt-5 flex flex-row">
            <PartValid instruction={instructions.picnic} />
          </div>
        </div>
      </div>
      <br />
      <br />
      <span className="ml-2 pr-2 text-gray-800 font-bold w-full">ALL</span>
      <br />

      <div className="flex flex-row">
        <div className="flex flex-col w-1/2">
          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Ribs:</span>
            <SelectInputType
              initial={instructions.rib}
              onChange={v => instructions.rib = v}
              values={['Whole', 'Split']}
              width={70}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Sausage:</span>
            <SelectInputType
              initial={instructions.sausage}
              onChange={v => instructions.sausage = v}
              values={['Regular', 'Hot', 'No Seasoning', 'No Preservatives']}
              width={150}
            />
          </div>
        </div>
        <div className="flex flex-col w-1/2 pl-2">
          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Head:</span>
            <SelectInputType
              initial={instructions.head}
              onChange={v => instructions.head = v}
              values={['No', 'Yes']}
              width={50}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Feet:</span>
            <SelectInputType
              initial={instructions.feet}
              onChange={v => instructions.feet = v}
              values={['No', 'Yes']}
              width={50}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Heart:</span>
            <SelectInputType
              initial={instructions.heart}
              onChange={v => instructions.heart = v}
              values={['No', 'Yes']}
              width={50}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Fat:</span>
            <SelectInputType
              initial={instructions.fat}
              onChange={v => instructions.fat = v}
              values={['No', 'Yes']}
              width={50}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const PartValid = ({ instruction }: {
  instruction: {
    fresh: { amount: number }
    cured: { amount: number }
  }
}) => {
  const amount = (instruction.fresh.amount + instruction.cured.amount)
  const valid = amount === 2
  return (
    <div className={"ml-2 pr-2 flex flex-row h-6 " + (valid ? "text-green-500" : "text-tomato-500")}>
      {valid ?
        <SvgPlus /> :
        <>
          <SvgCross data-tip={`Fresh and Cured should add up<br>to 2 halves. Currently is ${amount} ${amount === 1 ? "half" : "halves"}`} />
          <ReactTooltip delayShow={200} multiline />
        </>
      }
    </div>
  )
}

const BeefInstructions = ({ instructions }: { instructions: BeefCutInstructions }) => {
  return (
    <div>
      <div className="flex-grow overflow-visible flex flex-row">
        <div className="flex-grow flex flex-row">
          <div className="flex flex-col w-7/12">
            <span className="ml-2 pr-2 text-gray-800 font-bold">HIND QUATER</span>
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Round:</span>
              <div className="flex flex-col">
                <div className="flex flex-row mb-1">
                  <SelectInputType
                    initial={instructions.round.keepAmount}
                    onChange={v => instructions.round.keepAmount = v}
                    values={["100%", "0%", "25%", "50%", "75%"]}
                    width={50}
                  />
                  <SelectInputType
                    initial={instructions.round.tenderized}
                    onChange={v => instructions.round.tenderized = v}
                    values={["Tenderized"]}
                    width={100}
                  />
                </div>
                <div className="flex flex-row">
                  <SelectInputType
                    initial={instructions.round.size}
                    onChange={v => instructions.round.size = v}
                    values={['1/2"', '3/4"', '1"']}
                    width={50}
                  />
                  <SelectInputType
                    initial={instructions.round.perPackage}
                    onChange={v => instructions.round.perPackage = v}
                    values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']}
                    width={60}
                  />
                  <SelectInputType
                    initial={instructions.round.howToUseRest}
                    onChange={v => instructions.round.howToUseRest = v}
                    values={['', 'Hamburger', 'Chicken Fry']}
                    width={100}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Sirloin Tip:</span>
              <SelectInputType
                initial={instructions.sirlointip.size}
                onChange={v => instructions.sirlointip.size = v}
                values={['Chicken Fry', '3/4"', '1"', '1 1/4"', '3lb Roast"', 'Hamburger']}
                width={100}
              />
              <SelectInputType
                initial={instructions.sirlointip.amount}
                onChange={v => instructions.sirlointip.amount = v}
                values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']}
                width={65}
                defaultValue="4/Pkg"
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Flank:</span>
              <SelectInputType
                initial={instructions.flank}
                onChange={v => instructions.flank = v}
                values={['Chicken Fry', 'Whole', 'Hamburger']}
                width={100}
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Sirloin:</span>
              <SelectInputType
                initial={instructions.sirloin.size}
                onChange={v => instructions.sirloin.size = v}
                values={['1/2"', '3/4"', '1"', '1 1/4"']}
                width={65}
                defaultValue='1"'
              />
              <SelectInputType
                initial={instructions.sirloin.amount}
                onChange={v => instructions.sirloin.amount = v}
                values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']}
                width={65}
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">T-Bone:</span>
              <SelectInputType
                initial={instructions.tbone.bone}
                onChange={v => instructions.tbone.bone = v}
                values={['Bone Out', 'Bone In']}
                width={65}
                defaultValue=""
              />
              <SelectInputType
                initial={instructions.tbone.size}
                onChange={v => instructions.tbone.size = v}
                values={['1/2"', '3/4"', '1"', '1 1/4"']}
                width={65}
                defaultValue='1"'
              />
              <SelectInputType
                initial={instructions.tbone.amount}
                onChange={v => instructions.tbone.amount = v}
                values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']}
                width={65}
                defaultValue="2/Pkg"
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Rump:</span>
              <SelectInputType
                initial={instructions.rump}
                onChange={v => instructions.rump = v}
                values={['2lb', '2.5lb', '3lb', '3.5lb', '4lb', 'Hamburger']}
                width={100}
                defaultValue='3lb'
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Pikes Peak:</span>
              <SelectInputType
                initial={instructions.pikespeak}
                onChange={v => instructions.pikespeak = v}
                values={['2lb', '2.5lb', '3lb', '3.5lb', '4lb', 'Hamburger']}
                width={100}
                defaultValue='3lb'
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Ground Beef:</span>
              <SelectInputType
                initial={instructions.groundbeef}
                onChange={v => instructions.groundbeef = v}
                values={['1lb', '1.5lb', '2lb', '5lb', '10lb', 'half 1lb half 2lb']}
                width={100}
                defaultValue='1lb'
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Patties:</span>
              <SelectInputType
                initial={instructions.patties.weight}
                onChange={v => instructions.patties.weight = v}
                values={['20lb', '30lb', '40lb', '25%', '33%', '50%']}
                width={65}
                defaultValue=""
              />
              <SelectInputType
                initial={instructions.patties.amount}
                onChange={v => instructions.patties.amount = v}
                values={['3/Pkg', '4/Pkg', '5/Pkg', '6/Pkg']}
                width={65}
                defaultValue=""
              />
            </div>
          </div>

          <div className="flex flex-col mr-4 w-5/12">
            <span className="ml-2 pr-2 text-gray-800 font-bold">FORE QUATER</span>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Chuck:</span>
              <SelectInputType
                initial={instructions.chuck}
                onChange={v => instructions.chuck = v}
                values={['2lb', '2.5lb', '3lb', '3.5lb', '4lb', 'Hamburger']}
                width={100}
                defaultValue="3lb"
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Arm:</span>
              <SelectInputType
                initial={instructions.arm}
                onChange={v => instructions.arm = v}
                values={['2lb', '2.5lf', '3lb', '3.5lb', '4lb', 'Hamburger']}
                width={100}
                defaultValue="3lb"
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Ribs:</span>
              <SelectInputType
                initial={instructions.ribs}
                onChange={v => instructions.ribs = v}
                values={['BBQ', 'Part BBQ', 'Slabs', 'Hamburger']}
                width={100}
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Club:</span>
              <SelectInputType
                initial={instructions.club.bone}
                onChange={v => instructions.club.bone = v}
                values={['Ribeye', 'Bone In']}
                width={65}
              />
              <SelectInputType
                initial={instructions.club.size}
                onChange={v => instructions.club.size = v}
                values={['1/2"', '3/4"', '1"', '1 1/4"']}
                width={65}
                defaultValue='1"'
              />
              <SelectInputType
                initial={instructions.club.amount}
                onChange={v => instructions.club.amount = v}
                values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']}
                width={65}
                defaultValue="2/Pkg"
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Brisket:</span>
              <SelectInputType
                initial={instructions.brisket}
                onChange={v => instructions.brisket = v}
                values={['Whole', 'Two Pieces', 'Hamburger']}
                width={100}
                defaultValue="Two Pieces"
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Stew Meat:</span>
              <SelectInputType
                initial={instructions.stewmeat.amount}
                onChange={v => instructions.stewmeat.amount = v}
                values={['', '5 Packages', '10 Packages', '15 Packages']}
                width={100}
              />
              <SelectInputType
                initial={instructions.stewmeat.size}
                onChange={v => instructions.stewmeat.size = v}
                values={['', '1lb/Pkg', '1.5lb/Pkg', '2.0lb/Pkg']}
                width={100}
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Soup Bones:</span>
              <SelectInputType
                initial={instructions.soupbones}
                onChange={v => instructions.soupbones = v}
                values={['Yes', 'No', 'Shank Only', 'Marrow Only']}
                width={100}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PorkFreshCuredOptions = ({ obj, refreshCanSubmit }: { obj: { amount: number }, refreshCanSubmit: () => void }) => {
  const [value, setValue] = useState(obj.amount)

  return (
    <select className="bg-gray-200 border border-gray-500 rounded-md" value={value} onChange={e => {
      setValue(obj.amount = parseInt(e.target.value))
      refreshCanSubmit()
    }}>
      <option value="0">0</option>
      <option value="1">1</option>
      <option value="2">2</option>
    </select>
  )
}

const AnimalTypeSelect = ({ Icon, onSelected, isSelected }: { Icon: any, onSelected: () => void, isSelected: boolean }) => {
  return (
    <button className={"w-full flex flex-row rounded-md p-0.5 m-0.5 flex-shrink place-items-center border-2 border-gray-400" + (isSelected ? " bg-blue-100" : " bg-white")} name="animal" onClick={() => onSelected()}>
      <Icon className="w-8 h-8 transform translate-x-1/2 place-self-center" />
    </button>
  )
}