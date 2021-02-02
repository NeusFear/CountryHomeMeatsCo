import React, { useMemo } from "react"
import User, { useUsers } from "../database/types/User"

export const EditUseCutInstructionsModal = ({id, instructionID}: {id: string, instructionID: number}) => {
  const user = useUsers(User.findById(id).select('cutInstructions'), [id], id)
  
  //Can be undefined if is a new instruction
  const cutInstruction = instructionID === undefined ? undefined : user.cutInstructions.find(c => c.id === instructionID)
  return (
    <div style={{width:'450px', height:'400px'}}>
      Modal to edit cut instructions
    </div>
  )
}