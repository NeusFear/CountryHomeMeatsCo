import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip';
import { EditUseCutInstructionsModal } from './EditUseCutInstructionsModal';

import { EditUserDetailsModal } from './EditUserDetailsModal'
import { HangingAnimalsModal } from './HangingAnimalsModal';
import { SchueduleAnimalModal } from './ScheduleAnimalModal';

Modal.setAppElement("#root")
const customStyles = {
  content : { top : '50%', left : '50%', right : 'auto', bottom : 'auto', marginRight : '-50%', transform : 'translate(-50%, -50%)', padding : '0px', border : 'none' },
  overlay: { backgroundColor : 'rgba(33, 33, 33, 0.75)' }
}

export let setModal: (type: string, state?: any) => void = () => {}

export const editUserDetails = "edit-user-details"
export const scheduleAnimal = "schedule-animal"
export const hangingAnimals = "hanging-animals"
export const editCutInstructions = "edit-cut-instructions"

const modals = {
  [editUserDetails]: state => <EditUserDetailsModal objectId={state} />,
  [scheduleAnimal]: state => <SchueduleAnimalModal userID={state} />,
  [hangingAnimals]: () => <HangingAnimalsModal />,
  [editCutInstructions]: state => <EditUseCutInstructionsModal {...state} />
}


export const ModalManager = () => {
  const [activeModal, setActiveModal] = useState<{type: string, state: any}>(null)
  useEffect(() => {
    setModal = (type, state) => setActiveModal(type === null ? null : {type, state })
    return () => setModal = () => {}
  })

  if(activeModal === null) {
    return (<></>)
  }
  

  return (
    <Modal
      isOpen
      onRequestClose={() => setActiveModal(null)}
      style={customStyles}
      contentLabel="Example Modal"
    >
    <ReactTooltip delayShow={200} multiline /> 
    { modals[activeModal.type](activeModal.state) }
    </Modal>
  )
}
