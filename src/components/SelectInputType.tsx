import React, { useMemo } from "react"
import { useState } from "react";
import Autosuggest from 'react-autosuggest';

export const SelectInputType = ({ initial, onChange, values, width, defaultValue, disabled = false, className, removeEmpty }: {
  initial: string,
  onChange: (value: string) => void,
  values: string[],
  width?: number,
  defaultValue?: string,
  disabled?: boolean,
  className?: string,
  removeEmpty?: boolean
}) => {
  const insertedValues = values.slice()
  if (!removeEmpty) {
    insertedValues.unshift("")
  }
  const computedInitial = useMemo(() => {
    if (defaultValue !== undefined) {
      onChange(defaultValue)
      return defaultValue
    }
    if (initial === undefined) {
      onChange(values[0])
      return values[0]
    }
    return initial
  }, [initial])

  const [value, setValue] = useState(computedInitial)

  const onValueChanged = (_, { newValue }: { newValue: string }) => {
    setValue(newValue)
    onChange(newValue)
  }

  const findSuggestions = (value: string) => {
    // const lowerValue = value.toLowerCase().trim()
    // return lowerValue === '' ? insertedValues : insertedValues.filter(s => s.toLowerCase().startsWith(lowerValue))
    return insertedValues
  }

  const [suggestions, setSuggestions] = useState(findSuggestions(value))

  const widthInPx = width

  return (
    <div style={width === undefined ? null : { width: `${widthInPx}px` }}>
      <Autosuggest
        suggestions={disabled ? [] : suggestions}
        onSuggestionsFetchRequested={({ value }: { value: string }) => setSuggestions(findSuggestions(value))}
        onSuggestionsClearRequested={() => setSuggestions(insertedValues)}
        shouldRenderSuggestions={() => true}
        getSuggestionValue={t => t}
        renderSuggestion={t => {
          return t === "" ? <div>&nbsp;</div> : <div>{t}</div>
        }}
        inputProps={{
          className: className ?? "bg-gray-200 border border-gray-500 rounded-md w-full",
          value: disabled ? "" : value,
          onChange: onValueChanged
        }}
      />
    </div>
  )
}