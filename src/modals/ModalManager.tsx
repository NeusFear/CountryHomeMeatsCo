import * as React from 'react';
import Modal from 'react-modal';

import { EditUserDetailsModal } from './EditUserDetailsModal'
import { SchueduleAnimalModal } from './ScheduleAnimalModal';

Modal.setAppElement("#root")
const customStyles = {
  content : { top : '50%', left : '50%', right : 'auto', bottom : 'auto', marginRight : '-50%', transform : 'translate(-50%, -50%)', padding : '0px', border : 'none' },
  overlay: { backgroundColor : 'rgba(33, 33, 33, 0.75)' }
}

export let setModal: (type: string, state?: any) => void = () => {}

export const editUserDetails = "edit-user-details"
export const scheduleAnimal = "schedule-animal"

const modals = {
  [editUserDetails]: state => <EditUserDetailsModal objectId={state} />,
  [scheduleAnimal]: state => <SchueduleAnimalModal userID={state} />
}


export const ModalManager = () => {
  const [activeModal, setActiveModal] = React.useState<{type: string, state: any}>(null)
  React.useEffect(() => {
    setModal = (type, state) => setActiveModal(type === null ? null : {type, state })
    return () => setModal = () => {}
  })

  if(activeModal === null) {
    return (<></>)
  }
  

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => setActiveModal(null)}
      style={customStyles}
      contentLabel="Example Modal"
    >
    { modals[activeModal.type](activeModal.state) }
    </Modal>
  )
}
