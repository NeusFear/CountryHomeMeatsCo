import React, { useMemo } from "react"
import { useState } from "react";
import Autosuggest from 'react-autosuggest';

export const SelectInputType = ({initial, onChange, values, width}: {
  initial: string,
  onChange: (value: string) => void,
  values: string[], 
  width: number
}) => {

  const computedInitial = useMemo(() => {
    if(initial === undefined) {
      onChange(values[0])
      return values[0]
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
    // return lowerValue === '' ? values : values.filter(s => s.toLowerCase().startsWith(lowerValue))
    return values
  }

  const [ suggestions, setSuggestions ] = useState(findSuggestions(value))

  const widthInPx = width

  return (
    <div style={{width: `${widthInPx}px`}}>
      <Autosuggest 
        suggestions={suggestions}
        onSuggestionsFetchRequested={({value}: {value: string}) => setSuggestions(findSuggestions(value))}        
        onSuggestionsClearRequested={() => setSuggestions(values)}
        shouldRenderSuggestions={() => true}
        getSuggestionValue={t => t}
        renderSuggestion={t => t}
        inputProps={{
          className: "bg-gray-200 border border-gray-500 rounded-md w-full absolute",
          value,
          onChange: onValueChanged
        }}
      />
    </div>
  )
}