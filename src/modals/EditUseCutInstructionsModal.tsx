import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react"
import User, { CutInstructions, useUsers } from "../database/types/User"
import { SvgCow, SvgPig } from "../assets/Icons"
import Animal, { AnimalType } from "../database/types/Animal"
import { useState } from "react";
import { BeefCutInstructions } from "../database/types/cut_instructions/Beef";
import { PorkCutInstructions } from "../database/types/cut_instructions/Pork";
import { ModalHandler, setModal } from "./ModalManager";
import { SelectInputType } from "../components/SelectInputType";


export const EditUseCutInstructionsModal = forwardRef<ModalHandler, {id: string, instructionID: number}>(({id, instructionID}, ref) => {
  const user = useUsers(User.findById(id).select('cutInstructions'), [id], id);
  const dbInstructionIndex = (user != null && instructionID !== undefined) ?
    user.cutInstructions.findIndex(c => c.id === instructionID) :
    undefined

  const dbInstrucionObject = dbInstructionIndex !== undefined ? user.cutInstructions[dbInstructionIndex] : undefined
  const dbInstructions = dbInstrucionObject?.instructions

  const [ animalType, setAnimalType ] = useState<"Cow"|"Pig">(instructionID === undefined ? "Cow" : undefined)

  if(dbInstructions !== undefined && animalType === undefined) {
    setAnimalType(dbInstructions.cutType === "beef" ? "Cow" : "Pig")
  }

  //Can be undefined if is a new instruction
  const cutInstruction: CutInstructions = useMemo(() => {
    if(instructionID === undefined) {
      if(animalType === "Cow") {
        return {
          cutType: "beef",
          round: {},
          sirlointip: {},
          sirloin: {},
          tbone: {},
          club: {},
          stewmeat: {},
          patties: {},
        } as BeefCutInstructions
      } else {
        const freshCuredObj = () => { return { fresh: { amount: 0 }, cured: { amount: 0 } } }
        return {
          cutType: "pork",
          ham: freshCuredObj(),
          bacon: freshCuredObj(),
          jowl: freshCuredObj(),
          loin: freshCuredObj(),
          butt: freshCuredObj(),
          picnic: freshCuredObj(),
        } as PorkCutInstructions
      }
    }
    return dbInstructions
  }, [instructionID, id, animalType, user !== undefined])

  const submit = () => {
    if(dbInstructions === undefined) {
      const ids = user.cutInstructions.map(i => i.id)
      let id = ids.length
      for(let i = 0; i < ids.length; i++) {
        if(!ids.includes(i)) {
          id = i
          break
        }
      }
      cutInstruction.cutType = animalType === "Cow" ? "beef" : "pork"
      user.cutInstructions.push({ id, instructions: cutInstruction })
    } else {
      //We need to update the field so it's actually synced
      user.cutInstructions[dbInstructionIndex] = {
        id: dbInstrucionObject.id,
        instructions: cutInstruction
      }
    }
    user.save()
    setModal(null)
  }

  useImperativeHandle(ref, () => ({ onClose: submit }))

  if(instructionID !== undefined && dbInstructions == undefined) {
    return (<div>Loading Cut Instructions...</div>)
  }

  if(user === undefined) {
    return (<div>Loading User...</div>)
  }
  
  if(user === null) {
    return (<div>Error loading User: {id}</div>)
  }

  return (
    <div className="flex flex-col overflow-clip" style={{width:'900px', height:'620px'}}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
          <span className="text-gray-300 font-semibold mt-1">Create new Cut Instruction</span>
      </div>
      <div className="grid grid-cols-5 bg-gray-200">
        { !dbInstructions && 
          <>
            <div></div>
            <div></div>
            <div className="flex flex-row">
              <AnimalTypeSelect Icon={SvgCow} onSelected={() => setAnimalType("Cow")} isSelected={animalType === AnimalType.Cow} />
              <AnimalTypeSelect Icon={SvgPig} onSelected={() => setAnimalType("Pig")} isSelected={animalType === AnimalType.Pig} />
            </div>
          </>
        }
        <div></div>
        <div></div>
      </div>
      <div className="p-4 overflow-y-scroll h-full flex flex-col">
        { animalType === AnimalType.Pig ? 
          <PorkInstructions instructions={cutInstruction as PorkCutInstructions} /> : 
          <BeefInstructions instructions={cutInstruction as BeefCutInstructions}/> }
        <div className="flex flex-col mt-5">
          Notes:
          <textarea className="w-full border-gray-300 border"
            style={{minHeight:'100px'}}
            defaultValue={cutInstruction.notes}
            onBlur={e => {
              cutInstruction.notes = e.target.value ?? ''
              user.save()
            }
          }></textarea>
        </div>
        <button onClick={submit} className="bg-blue-100 hover:bg-blue-200 cursor-pointer py-1 mt-5 rounded-sm mb-2 px-4 w-32">Submit</button>
      </div>
    </div>
  )
})

const PorkInstructions = ({instructions}: {instructions: PorkCutInstructions}) => {
  return (
    <div className="flex-grow overflow-show h-full">
      <div className="flex flex-row">
        <div className="flex-grow">
          <span className="ml-2 pr-2 text-gray-800 font-bold w-1/4">FRESH</span>
          <br />

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Ham:</span>
            <div className="flex flex-col">
              <div className="flex flex-row mb-0.5">
                <PorkFreshCuredOptions obj={instructions.ham.fresh} />
                <SelectInputType
                  initial={instructions.ham.fresh.type}
                  onChange={v => instructions.ham.fresh.type=v}
                  values={['Whole', '2pcs', 'Ends for Roast', 'Shank for Roast', 'Grind']} 
                  width={100} 
                />
              </div>
              <div className="flex flex-row">
                <SelectInputType 
                  initial={instructions.ham.fresh.cutType}
                  onChange={v => instructions.ham.fresh.cutType=v}
                  values={['Centers', 'Balance', 'Slice All']} 
                  width={65}
                />
                <SelectInputType 
                  initial={instructions.ham.fresh.size}
                  onChange={v => instructions.ham.fresh.size=v}
                  values={['1/2"']}
                  width={50} 
                />
                <SelectInputType
                  initial={instructions.ham.fresh.amountPerPackage}
                  onChange={v => instructions.ham.fresh.amountPerPackage=v}  
                  values={['2/Pkg']} 
                  width={50} 
                />
              </div>
              <br />
            </div>
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Bacon:</span>
            <PorkFreshCuredOptions obj={instructions.bacon.fresh} />
            <SelectInputType
              initial={instructions.bacon.fresh.cutType}
              onChange={v => instructions.bacon.fresh.cutType=v}
              values={['Slice Fresh', 'Grind']}
              width={100} 
            />
            <SelectInputType
              initial={instructions.bacon.fresh.size}
              onChange={v => instructions.bacon.fresh.size=v}
              values={['1.0 lb', '1.5 lb', '2.0 lb']}
              width={65}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Jowl:</span>
            <PorkFreshCuredOptions obj={instructions.jowl.fresh} />
            <SelectInputType 
              initial={instructions.jowl.fresh.type}
              onChange={v => instructions.jowl.fresh.type=v}
              values={['Grind', 'Whole', 'Slice']} 
              width={65} 
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Loin:</span>
            <PorkFreshCuredOptions obj={instructions.loin.fresh} />
            <SelectInputType 
              initial={instructions.loin.fresh.size}
              onChange={v => instructions.loin.fresh.size=v}
              values={['1/2"', '3/4"', '1"', '1 1/4"']} 
              width={65} 
            />
            <SelectInputType 
              initial={instructions.loin.fresh.packageAmount}
              onChange={v => instructions.loin.fresh.packageAmount=v}
              values={['2/Pkg', '3/Pkg', '4/Pkg', '5/Pkg', '6/Pkg']} 
              width={65} 
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Butt:</span>
            <PorkFreshCuredOptions obj={instructions.butt.fresh} />
            <SelectInputType 
              initial={instructions.butt.fresh.type}
              onChange={v => instructions.butt.fresh.type=v}
              values={['CSRibs', '3lb Roast', '4lb Roast', '5lb Roast', '2 Pieces', 'Whole', '1/2"', '3/4"', 'Grind']} 
              width={100} 
            />
            <SelectInputType
              initial={instructions.butt.fresh.packageAmount}
              onChange={v => instructions.butt.fresh.packageAmount=v}
              values={['2/Pkg', '3/Pkg', '4/Pkg']}
              width={65}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Picnic:</span>
            <PorkFreshCuredOptions obj={instructions.picnic.fresh} />
            <SelectInputType
              initial={instructions.picnic.fresh.type}
              onChange={v => instructions.picnic.fresh.type=v}
              values={['3lb Roast', '4lb Roast', '5lb Roast', '2 Pieces', 'Whole', '1/2"', '3/4"', 'Grind']}
              width={90}
            />
            <SelectInputType 
              initial={instructions.picnic.fresh.packageAmount}
              onChange={v => instructions.picnic.fresh.packageAmount=v}
              values={['2/Pkg', '3/Pkg', '4/Pkg']}
              width={65}
            />
          </div>
        </div>

        <div className="flex-grow">
          <span className="ml-2 pr-2 text-gray-800 font-bold w-1/4">CURED</span>
          <br/>
          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Ham:</span>
            <div className="flex flex-col">
              <div className="flex flex-row mb-0.5">
                <PorkFreshCuredOptions obj={instructions.ham.cured} />
                <SelectInputType
                  initial={instructions.ham.cured.type}
                  onChange={v => instructions.ham.cured.type=v}
                  values={['Whole', '2pcs', 'Ends for Roast', 'Shank for Roast', 'Grind']} 
                  width={130}
                />
              </div>
              <div className="flex flex-row">
                <SelectInputType
                  initial={instructions.ham.cured.cutType}
                  onChange={v => instructions.ham.cured.cutType=v}
                  values={['Centers', 'Balance', 'Slice All']} 
                  width={80} 
                />
                <SelectInputType
                  initial={instructions.ham.cured.size}
                  onChange={v => instructions.ham.cured.size=v}
                  values={['1/2"']} 
                  width={50} 
                />
                <SelectInputType 
                  initial={instructions.ham.cured.amountPerPackage}
                  onChange={v => instructions.ham.cured.amountPerPackage=v}
                  values={['2/Pkg']} 
                  width={65} 
                />
              </div>
              <br />
            </div>
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Bacon:</span>
            <PorkFreshCuredOptions obj={instructions.bacon.cured} />
            <SelectInputType
              initial={instructions.bacon.cured.cutType}
              onChange={v => instructions.bacon.cured.cutType=v}
              values={['Regular', 'Thick', 'Thin']} 
              width={80} 
            />
            <SelectInputType 
              initial={instructions.bacon.cured.size}
              onChange={v => instructions.bacon.cured.size=v}
              values={['1.0 lb', '1.5 lb', '2.0 lb']} 
              width={65} 
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Jowl:</span>
            <PorkFreshCuredOptions obj={instructions.jowl.cured} />
            <SelectInputType 
              initial={instructions.jowl.cured.type}
              onChange={v => instructions.jowl.cured.type=v}
              values={['Chunk', 'Whole', 'Slice']} 
              width={70} 
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Loin:</span>
            <PorkFreshCuredOptions obj={instructions.loin.cured} />
            <SelectInputType 
              initial={instructions.loin.cured.size}
              onChange={v => instructions.loin.cured.size=v}
              values={['1/2"', '3/4"', '1"', '1 1/4"']} 
              width={70} 
            />
            <SelectInputType
              initial={instructions.loin.cured.packageAmount}
              onChange={v => instructions.loin.cured.packageAmount=v}
              values={['2/Pkg', '3/Pkg', '4/Pkg', '5/Pkg', '6/Pkg']} 
              width={65} 
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Butt:</span>
            <PorkFreshCuredOptions obj={instructions.butt.cured} />
            <SelectInputType
              initial={instructions.butt.cured.type}
              onChange={v => instructions.butt.cured.type=v}
              values={['3lb Roast', '4lb Roast', '5lb Roast', '2 Pieces', 'Whole', '1/2"', '3/4"', 'Grind']}
              width={90}
            />
            <SelectInputType
              initial={instructions.butt.cured.packageAmount}
              onChange={v => instructions.butt.cured.packageAmount=v}
              values={['2/Pkg', '3/Pkg', '4/Pkg']}
              width={65}
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Picnic:</span>
            <PorkFreshCuredOptions obj={instructions.picnic.cured} />
            <SelectInputType
              initial={instructions.picnic.cured.type}
              onChange={v => instructions.picnic.cured.type=v}
              values={['3lb Roast', '4lb Roast', '5lb Roast', '2 Pieces', 'Whole', '1/2"', '3/4"', 'Grind']} 
              width={90} 
            />
            <SelectInputType
              initial={instructions.picnic.cured.packageAmount}
              onChange={v => instructions.picnic.cured.packageAmount=v}
              values={['2/Pkg', '3/Pkg', '4/Pkg']} 
              width={65} 
            />
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
              onChange={v => instructions.rib=v}
              values={['Whole', 'Split']} 
              width={70} 
            />
          </div>

          <div className="pt-4 flex flex-row">
            <span className="ml-2 pr-2 text-gray-700 w-1/4">Sausage:</span>
            <SelectInputType
              initial={instructions.sausage}
              onChange={v => instructions.sausage=v}
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

const BeefInstructions = ({instructions}: {instructions: BeefCutInstructions}) => {
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
                    initial={instructions.round.type}
                    onChange={v => instructions.round.type=v}
                    values={["25%", "50%", "75%", "100%"]} 
                    width={50}
                  />
                  <SelectInputType 
                    initial={instructions.round.tenderized}
                    onChange={v => instructions.round.tenderized=v}
                    values={["Not Tenderized", "Tenderized"]} 
                    width={150} 
                  />
                </div>
                <br />
                <div className="flex flex-row">
                  <SelectInputType
                    initial={instructions.round.size}
                    onChange={v => instructions.round.size=v}
                    values={['1/2"', '3/4"', '1"', 'Hamburger', 'Chicken Fry']} 
                    width={100} 
                  />
                  <SelectInputType 
                    initial={instructions.round.amount}
                    onChange={v => instructions.round.amount=v}
                    values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']} 
                    width={60} 
                  />
                </div>
                <br />
              </div>
            </div>
                  
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Sirloin Tip:</span>
              <SelectInputType 
                initial={instructions.sirlointip.size}
                onChange={v => instructions.sirlointip.size=v}
                values={['Chicken Fry', '3/4"', '1"', '1 1/4"', '3lb Roast"', 'Hamburger']} 
                width={100} 
              />
              <SelectInputType
                initial={instructions.sirlointip.amount}
                onChange={v => instructions.sirlointip.amount=v}
                values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']} 
                width={65} 
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Flank:</span>
              <SelectInputType 
                initial={instructions.flank}
                onChange={v => instructions.flank=v}
                values={['Chicken Fry', 'Whole', 'Hamburger']} 
                width={100} 
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Sirloin:</span>
              <SelectInputType 
                initial={instructions.sirloin.size}
                onChange={v => instructions.sirloin.size=v}
                values={['1/2"', '3/4"', '1"', '1 1/4"']} 
                width={65} 
              />
              <SelectInputType
                initial={instructions.sirloin.amount}
                onChange={v => instructions.sirloin.amount}
                values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']}
                width={65} 
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">T-Bone:</span>
              <SelectInputType
                initial={instructions.tbone.size}
                onChange={v => instructions.tbone.size=v}
                values={['1/2"', '3/4"', '1"', '1 1/4"']} 
                width={65} 
              />
              <SelectInputType
                initial={instructions.tbone.amount}
                onChange={v => instructions.tbone.amount=v}
                values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']} 
                width={65} 
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Rump:</span>
              <SelectInputType
                initial={instructions.rump}
                onChange={v => instructions.rump=v}
                values={['2lb', '2.5lb', '3lb', '3.5lb', '4lb', 'Hamburger']} 
                width={100} 
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Pikes Peak:</span>
              <SelectInputType
                initial={instructions.pikespeak}
                onChange={v => instructions.pikespeak=v}
                values={['2lb', '2.5lb', '3lb', '3.5lb', '4lb', 'Hamburger']}
                width={100}
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Ground Beef:</span>
              <SelectInputType
                initial={instructions.groundbeef}
                onChange={v => instructions.groundbeef=v}
                values={['1lb', '1.5lb', '2lb', '5lb', '10lb', 'half 1lb half 2lb']}
                width={100} 
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Patties:</span>
              <SelectInputType
                initial={instructions.patties.weight}
                onChange={v => instructions.patties.weight=v}
                values={['20lb', '30lb', '40lb', '25%', '33%', '50%']}
                width={65}
              />
              <SelectInputType
                initial={instructions.patties.amount}
                onChange={v => instructions.patties.amount=v}
                values={['3/Pkg', '4/Pkg', '5/Pkg', '6/Pkg']}
                width={65}
              />
            </div>
          </div>

          <div className="flex flex-col mr-4 w-5/12">
            <span className="ml-2 pr-2 text-gray-800 font-bold">FORE QUATER</span>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Chuck:</span>
              <SelectInputType
                initial={instructions.chuck}
                onChange={v => instructions.chuck=v}
                values={['2lb', '2.5lf', '3lb', '3.5lb', '4lb', 'Hamburger']}
                width={100}
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Arm:</span>
              <SelectInputType
                initial={instructions.arm}
                onChange={v => instructions.arm=v}
                values={['2lb', '2.5lf', '3lb', '3.5lb', '4lb', 'Hamburger']}
                width={100}
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Ribs:</span>
              <SelectInputType
                initial={instructions.ribs}
                onChange={v => instructions.ribs=v}
                values={['Keep All', 'Keep Part', 'All Hamburger', 'Hamburger if Possible']}
                width={100} 
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Club:</span>
              <SelectInputType
                initial={instructions.club.type}
                onChange={v => instructions.club.type=v}
                values={['Ribeye', 'Bone In']}
                width={65}
              />
              <SelectInputType
                initial={instructions.club.size}
                onChange={v => instructions.club.size=v}
                values={['1/2"', '3/4"', '1"', '1 1/4"']}
                width={65}
              />
              <SelectInputType
                initial={instructions.club.amount}
                onChange={v => instructions.club.amount=v}
                values={['1/Pkg', '2/Pkg', '3/Pkg', '4/Pkg']}
                width={65} 
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Brisket:</span>
              <SelectInputType
                initial={instructions.brisket}
                onChange={v => instructions.brisket=v}
                values={['Whole', 'Two Pieces', 'Hamburger']}
                width={100}
              />
            </div>
                    
            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Stew Meat:</span>
              <SelectInputType
                initial={instructions.stewmeat.amount}
                onChange={v => instructions.stewmeat.amount=v}
                values={['5 Packages', '10 Packages', '15 Packages']}
                width={100}
              />
              <SelectInputType
                initial={instructions.stewmeat.size}
                onChange={v => instructions.stewmeat.size=v}
                values={['1lb/Pkg', '1.5lb/Pkg', '2.0lb/Pkg']}
                width={100}
              />
            </div>

            <div className="pt-4 flex flex-row">
              <span className="ml-2 pr-2 text-gray-700 w-1/4">Soup Bones:</span>
              <SelectInputType
                initial={instructions.soupbones}
                onChange={v => instructions.soupbones=v}
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

const PorkFreshCuredOptions = ({obj}: { obj: { amount: number }}) => {
  const [value, setValue] = useState(obj.amount)

  return (
    <select className="bg-gray-200 border border-gray-500 rounded-md" value={value} onChange={e => setValue(obj.amount = parseInt(e.target.value))}>
      <option value="0">0</option>
      <option value="1">1</option>
      <option value="2">2</option>
    </select>
  )
}

const AnimalTypeSelect = ({Icon, onSelected, isSelected}: {Icon: any, onSelected:()=>void, isSelected:boolean}) => {
  return (
    <button className={"w-full flex flex-row rounded-md p-0.5 m-0.5 flex-shrink place-items-center border-2 border-gray-400" + (isSelected?" bg-blue-100":" bg-white")} name="animal" onClick={() => onSelected() }>
      <Icon className="w-8 h-8 transform translate-x-1/2 place-self-center"/>
    </button>
  )
}