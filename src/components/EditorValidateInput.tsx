import { useEffect, useState } from "react"

export const EditorValidateInput = ({ label, current, example, predicate = () => true, onChange }:
  {
    label: string,
    current: string,
    example: string,
    predicate?: (test: string) => boolean,
    onChange: (data: ValidatedString) => void
  }) => {
  current = current ?? ''
  const [data, setData] = useState(undefined)
  const [valid, setValid] = useState(undefined)

  const onInputChange = (text: string) => {
    const valid = predicate(text)
    setValid(valid)
    setData(text)
    onChange({ text, valid })
  }

  useEffect(() => {
    if (data === undefined) {
      onInputChange(current)
    }
  })

  return (
    <div className="inline-block">
      <p className="ml-2 text-xs text-black">{label}</p>
      <input placeholder={"ex: " + example} className={`${valid ? "border-black bg-blue-100" : "border-black bg-tomato-100"} bg-opacity-40 placeholder-gray-700 placeholder-opacity-50 w-60 border-2 rounded-sm p-1 my-1 mx-2 text-gray-800`} type="text" onChange={e => onInputChange(e.target.value)} value={data || ''} />
    </div>
  )
}

export type ValidatedString = {
  text: string
  valid: boolean
}