import React, { useMemo } from "react"
import { useState } from "react";
import Autosuggest from 'react-autosuggest';

export const SelectInputType = ({initial, onChange, values, width, defaultValue}: {
  initial: string,
  onChange: (value: string) => void,
  values: string[], 
  width: number,
  defaultValue?: string
}) => {
  const insertedValues = values.slice()
  insertedValues.unshift("")
  const computedInitial = useMemo(() => {
    if(defaultValue !== undefined) {
      onChange(defaultValue)
      return defaultValue
    }
    if(initial === undefined) {
      onChange(insertedValues[0])
      return insertedValues[0]
    }
    return initial
  }, [initial])

  const [ value, setValue ] = useState(computedInitial)
  
  const onValueChanged = (_, { newValue }: { newValue: string }) => {
    setValue(newValue)
    onChange(newValue)
  }

  const findSuggestions = (value: string) => {
    // const lowerValue = value.toLowerCase().trim()
    // return lowerValue === '' ? insertedValues : insertedValues.filter(s => s.toLowerCase().startsWith(lowerValue))
    return insertedValues
  }

  const [ suggestions, setSuggestions ] = useState(findSuggestions(value))

  const widthInPx = width

  return (
    <div style={{width: `${widthInPx}px`}}>
      <Autosuggest 
        suggestions={suggestions}
        onSuggestionsFetchRequested={({value}: {value: string}) => setSuggestions(findSuggestions(value))}        
        onSuggestionsClearRequested={() => setSuggestions(insertedValues)}
        shouldRenderSuggestions={() => true}
        getSuggestionValue={t => t}
        renderSuggestion={t => {
          return t === "" ? <div>&nbsp;</div> : <div>{t}</div>
        }}
        inputProps={{
          className: "bg-gray-200 border border-gray-500 rounded-md w-full",
          value,
          onChange: onValueChanged
        }}
      />
    </div>
  )
}