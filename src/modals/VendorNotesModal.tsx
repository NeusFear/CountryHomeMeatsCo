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
    <div>
      <textarea
        ref={textAreaRef}
        defaultValue={value}
        onBlur={e => {
          setValue(e.currentTarget.value ?? '')
        }}
      />
    </div>
  )
})