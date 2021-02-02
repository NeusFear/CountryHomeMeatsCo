import React, { useMemo } from "react"
import User, { useUsers } from "../database/types/User"

export const EditUseCutInstructionsModal = ({id, instructionID}: {id: string, instructionID: number}) => {
  const user = useUsers(User.findById(id).select('cutInstructions'), [id], id)
  
  //Can be undefined if is a new instruction
  const cutInstruction = instructionID === undefined ? undefined : user.cutInstructions.find(c => c.id === instructionID)

  const valid = true;

  return (
    <div className="flex flex-col" style={{width:'700px', height:'500px'}}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
          <span className="text-gray-300 font-semibold mt-1">Create new Cut Instruction</span>
      </div>
      <div className="flex-grow overflow-auto">
        
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Round:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">25%</option>
              <option value="B">50%</option>
              <option value="C">75%</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Not Tenderized</option>
              <option value="B">Tenderized</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">.5"</option>
              <option value="B">.75"</option>
              <option value="C">1"</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Hamburger</option>
              <option value="B">Chicken Fry</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Sirloin Tip:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">.75"</option>
              <option value="B">1"</option>
              <option value="C">1.25"</option>
              <option value="D">3lb Roast"</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="1">1 per Package</option>
              <option value="2">2 per Package</option>
              <option value="3">3 per Package</option>
              <option value="4">4 per Package</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Hamburger</option>
              <option value="B">Chicken Fry</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Flank:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Hamburger</option>
              <option value="B">Chicken Fry</option>
              <option value="C">Whole</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Sirloin:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">.5"</option>
              <option value="B">.75"</option>
              <option value="C">1"</option>
              <option value="C">1.25"</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="1">1 per Package</option>
              <option value="2">2 per Package</option>
              <option value="3">3 per Package</option>
              <option value="4">4 per Package</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">T-Bone:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">.5"</option>
              <option value="B">.75"</option>
              <option value="C">1"</option>
              <option value="D">1.25"</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="1">1 per Package</option>
              <option value="2">2 per Package</option>
              <option value="3">3 per Package</option>
              <option value="4">4 per Package</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Rump:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">2lb</option>
              <option value="B">2.5lb</option>
              <option value="C">3lb</option>
              <option value="D">3.5lb</option>
              <option value="E">4lb</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="1">Hamburger</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Pikes Peak:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">2lb</option>
              <option value="B">2.5lb</option>
              <option value="C">3lb</option>
              <option value="D">3.5lb</option>
              <option value="E">4lb</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="1">Hamburger</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Soup Bones:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Yes</option>
              <option value="B">No</option>
              <option value="C">Shank Only</option>
              <option value="D">Marrow Only</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Ground Beef:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">1lb</option>
              <option value="B">1.5lb</option>
              <option value="C">2lb</option>
              <option value="D">5lb</option>
              <option value="D">10lb</option>
              <option value="D">half 1lb half 2lb</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Chuck:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">2lb</option>
              <option value="B">2.5lf</option>
              <option value="C">3lb</option>
              <option value="D">3.5lb</option>
              <option value="D">4lb</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Hamburger</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Arm:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">2lb</option>
              <option value="B">2.5lf</option>
              <option value="C">3lb</option>
              <option value="D">3.5lb</option>
              <option value="D">4lb</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Hamburger</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Ribs:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Keep All</option>
              <option value="B">Keep Part</option>
              <option value="C">All Hamburger</option>
              <option value="D">Hamburger if Possible</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Club:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Ribeye</option>
              <option value="B">Bone In</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">.5"</option>
              <option value="B">.75"</option>
              <option value="C">1"</option>
              <option value="D">1.25"</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="1">1 per Package</option>
              <option value="2">2 per Package</option>
              <option value="3">3 per Package</option>
              <option value="4">4 per Package</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Brisket:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">Whole</option>
              <option value="B">Halved</option>
              <option value="C">Hamburger</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Stew Meat:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">5 per Package</option>
              <option value="B">10 per Package</option>
              <option value="C">15 per Package</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">1lb per Package</option>
              <option value="B">1.5lb per Package</option>
              <option value="C">2.0lb per Package</option>
            </select>
          </div>
        </div>
                
        <div className="pt-4 flex flex-row">
          <span className="ml-2 pr-2 text-gray-700 w-1/4">Patties:</span>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">20lb</option>
              <option value="B">30lb</option>
              <option value="C">40lb</option>
              <option value="D">25%</option>
              <option value="D">33%</option>
              <option value="D">50%</option>
            </select>
          </div>
          <div>
            <select className="bg-gray-200 border border-gray-500 rounded-md">
              <option value="A">3</option>
              <option value="B">4</option>
              <option value="C">5</option>
              <option value="D">6</option>
            </select>
          </div>
        </div>

        <button className={`${valid ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"} py-1 mt-2 rounded-sm mb-2 px-4`}>Submit</button>

      </div>
    </div>
  )
}