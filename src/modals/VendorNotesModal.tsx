import { forwardRef, useImperativeHandle, useRef } from "react";
import { ModalHandler } from "./ModalManager";

export const VendorNotesModal = forwardRef<ModalHandler, { value: string, setValue: (val: string) => void }>(({ value, setValue }, ref) => {

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(ref, () => ({
    onClose: () => {
      if(textAreaRef.current !== null) {
        setValue(textAreaRef.current.value ?? '')
      }
    }
  }))

  return (
    <div className="rounded-md overflow-hidden" style={{height: "50vh", width: "50vw"}}>
      <div className="bg-gray-800 text-white rounded-t-md">Notes</div>
      <div className="p-4 h-full overflow-hidden">
        <textarea
          className="w-full h-full"
          ref={textAreaRef}
          defaultValue={value}
          onBlur={e => {
            setValue(e.currentTarget.value ?? '')
          }}
        />
      </div>
    </div>
  )
})