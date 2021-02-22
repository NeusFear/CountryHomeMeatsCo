import { useEffect, useState } from "react"

export const EditorValidateInput = ({placeholder, current, predicate = () => true, onChange}: 
{ 
  placeholder: string,
  current: string, 
  predicate?: (test: string) => boolean,
  onChange: (data: ValidatedString) => void
}) => {
  current = current??''
  const [data, setData] = useState(undefined)
  const [valid, setValid] = useState(undefined)

  const onInputChange = (text: string) => {
    const valid = predicate(text)
    setValid(valid)
    setData(text)
    onChange({ text, valid })
  }

  useEffect(() => {
    if(data === undefined) {
      onInputChange(current)
    }
  })

  return (    
    <input placeholder={placeholder} className={`${valid ? "border-blue-500 bg-blue-100" : "border-red-500 bg-tomato-100"} placeholder-gray-700 w-60 border-2 rounded-sm p-1 my-1 mx-2 text-gray-800`} type="text" onChange={e => onInputChange(e.target.value)} value={data || ''}/>
  )
}

export type ValidatedString = {
  text: string
  valid: boolean
}