import { MutableRefObject, useEffect, useRef, useState } from 'react';
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

const modals: {[name: string]: (state: any, ref: MutableRefObject<ModalHanle>) => JSX.Element} = {
  [editUserDetails]: (state, ref) => <EditUserDetailsModal ref={ref} objectId={state} />,
  [scheduleAnimal]: (state, ref) => <SchueduleAnimalModal ref={ref} userID={state} />,
  [hangingAnimals]: () => <HangingAnimalsModal />,
  [editCutInstructions]: (state, ref) => <EditUseCutInstructionsModal ref={ref} {...state} />
}


export const ModalManager = () => {
  const [activeModal, setActiveModal] = useState<{type: string, state: any}>(null)
  useEffect(() => {
    setModal = (type, state) => setActiveModal(type === null ? null : {type, state })
    return () => setModal = () => {}
  })

  const childRef = useRef<ModalHanle>()

  if(activeModal === null || childRef === undefined) {
    return (<></>)
  }

  return (
    <Modal
      isOpen
      onRequestClose={() => {
        setActiveModal(null)
        if(childRef.current !== undefined) {
          childRef.current.onClose()
        }
      }}
      style={customStyles}
      contentLabel="Example Modal"
    >
    <ReactTooltip delayShow={200} multiline /> 
    { modals[activeModal.type](activeModal.state, childRef) }
    </Modal>
  )
}

export type ModalHanle = {
  onClose?: () => void
}
