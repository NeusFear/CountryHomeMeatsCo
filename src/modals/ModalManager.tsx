import { MutableRefObject, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import ReactTooltip from 'react-tooltip';
import { EditEmployeeDetailsModal } from './EditEmployeeDetailsModal';
import { EditUseCutInstructionsModal } from './EditUseCutInstructionsModal';
import { EditMultipleAnimals } from './EditMultipleAnimals'
import { EditUserDetailsModal } from './EditUserDetailsModal'
import { EditVendorDetailsModal } from './EditVendorDetailsModal'
import { EditCutListModal } from './EditCutListModal';
import { CalendarDayModal } from './CalendarDayEntryModal';
import { SchueduleAnimalModal } from './ScheduleAnimalModal';
import { useHistory } from 'react-router-dom';
import { VendorNotesModal } from './VendorNotesModal';
import { CustomCalendarEntryModal } from './CustomCalendarEntryModal';

Modal.setAppElement("#root")
const customStyles = {
  content : { top : '50%', left : '50%', right : 'auto', bottom : 'auto', marginRight : '-50%', transform : 'translate(-50%, -50%)', padding : '0px', border : 'none' },
  overlay: { backgroundColor : 'rgba(33, 33, 33, 0.75)', zIndex: 999 }
}

export let setModal: (type: string, state?: any) => void = () => {}

export const editUserDetails = "edit-user-details"
export const editVendorDetails = "edit-vendor-details"
export const scheduleAnimal = "schedule-animal"
export const hangingAnimals = "hanging-animals"
export const editCutInstructions = "edit-cut-instructions"
export const editEmployeeDetails = "edit-employee-details"
export const calendarDayEntry = "calendar-day-entry"
export const vendorNotes = "vendor-notes"
export const customDay = "custom-day"
export const editMultipleAnimals = "edit-multiple-animals"

const modals: {[name: string]: (state: any, ref: MutableRefObject<ModalHandler>) => JSX.Element} = {
  [editUserDetails]: (state, ref) => <EditUserDetailsModal ref={ref} objectId={state} />,
  [editVendorDetails]: (state, ref) => <EditVendorDetailsModal ref={ref} objectId={state} />,
  [scheduleAnimal]: (state, ref) => <SchueduleAnimalModal ref={ref} userID={state} />,
  [hangingAnimals]: () => <EditCutListModal />,
  [editCutInstructions]: (state, ref) => <EditUseCutInstructionsModal ref={ref} {...state} />,
  [editEmployeeDetails]: (state, ref) => <EditEmployeeDetailsModal ref={ref} objectId={state} />,
  [calendarDayEntry]: (state) => <CalendarDayModal state={state} />,
  [vendorNotes]: (state, ref) => <VendorNotesModal ref={ref} value={state.value} setValue={state.setValue} />,
  [customDay]: (state, ref) => <CustomCalendarEntryModal ref={ref} objectId={state.objectId} date={state.date}  />,
  [editMultipleAnimals]: (state) => <EditMultipleAnimals ids={state}  />
}


export const ModalManager = () => {
  const [activeModal, setActiveModal] = useState<{type: string, state: any}>(null)
  useEffect(() => {
    setModal = (type, state) => setActiveModal(type === null ? null : {type, state })
    return () => {
      setModal = () => {}
    }
  })
  const childRef = useRef<ModalHandler>(null)

  const close = () => {
    setActiveModal(null)
    if(childRef.current !== null) {
      childRef.current.onClose()
    }
  }

  const history = useHistory()
  useEffect(() => history.listen(close))

  if(activeModal === null || childRef === undefined) {
    return (<></>)
  }

  return (
    <Modal
      isOpen
      onRequestClose={close}
      style={customStyles}
      contentLabel="Example Modal"
    >
    <ReactTooltip delayShow={200} multiline /> 
    { modals[activeModal.type](activeModal.state, childRef) }
    </Modal>
  )
}

export type ModalHandler = {
  onClose?: () => void
}
