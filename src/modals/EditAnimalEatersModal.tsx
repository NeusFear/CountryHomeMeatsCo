import * as React from "react"
import { ObjectId } from "mongoose";
import Animal, { useAnimals, Eater, validateEaters } from "../database/types/Animal";
import User, { IUser, useUsers } from "../database/types/User";
import Autosuggest from 'react-autosuggest';

type DummyEater = { 
  _rand: number
  id: string, 
  portion: number, 
  recordCard: number
}
export const EditAnimalEatersModal = ({id}: {id: ObjectId}) => {
  const animal = useAnimals(() => Animal.findById(id), [id], id)
  const [ eaters, setEaters] = React.useState<DummyEater[]>()
  
  React.useEffect(() => {
    if(eaters === undefined && animal !== undefined) {
      setEaters(animal.eaters.map(e => { return {
        _rand: Math.random(),
        id: e.id.toHexString(), 
        portion: e.portion,
        recordCard: e.recordCard
      }}))
    }
  }, [animal])

  const updateEaters = () => setEaters([...eaters])
  const allUsers = useUsers(() => User.find().select('name recordCards'))?.sort((a, b) => a.name.localeCompare(b.name))

  if(animal === undefined || allUsers === undefined || eaters === undefined) {
    return (<div>Loading...</div>)
  }
  return (
    <div style={{width:'600px', height:'600px'}}>
      <div>Edit Eaters</div>
      {eaters && eaters.map(e => <EaterPart key={e._rand} eater={e} allUsers={allUsers}/>)}
      <div onClick={() => {
        eaters.push({ _rand: Math.random(), id:'', portion:-1, recordCard:-1 })
        updateEaters()
      }}>New</div>
    </div>
  )
}

const EaterPart = ({eater, allUsers}: {eater: DummyEater, allUsers: IUser[]}) => {

  return (
    <div>
      <WrappedAutoSuggest 
        suggestion={allUsers}
        mappingFunc={(user: IUser) => user.name}
        onChange={(value: IUser) => console.log(value)}
      />
    </div>
  )
}

//Export this to a util function
const WrappedAutoSuggest = ({suggestion, mappingFunc, onChange}: {
  suggestion: any[],
  mappingFunc: (t: any) => string,
  onChange: (value: any, rawValue: string) => void
}) => {
  const [ suggestions, setSuggestions ] = React.useState(suggestion)
  const [ value, setValue ] = React.useState('')

  const onValueChanged = (_, { newValue }: { newValue: string }) => {
    setValue(newValue)
    onChange(suggestions.find(s => mappingFunc(s).toLowerCase() == newValue.toLowerCase()), newValue)
  }
  return (
    <Autosuggest 
    suggestions={suggestions}
    onSuggestionsFetchRequested={({value}: {value: string}) => {
      const lowerValue = value.toLowerCase().trim()
      setSuggestions(suggestion.filter(s => mappingFunc(s).toLowerCase().startsWith(lowerValue)))
    }}
    onSuggestionsClearRequested={() => setSuggestions([])}
    getSuggestionValue={t => mappingFunc(t)}
    renderSuggestion={t => <div>{mappingFunc(t)}</div>}
    inputProps={{
      value,
      placeholder: 'Type a Name',
      onChange: onValueChanged
    }}
  />
  )
}
