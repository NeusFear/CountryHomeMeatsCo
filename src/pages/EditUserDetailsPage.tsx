import * as React from "react"
import { useHistoryListState } from "../AppHooks"
import { useHistory } from 'react-router-dom';

import * as DummyDatabase from "../DummyDatabase"

const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

//http://emailregex.com/
const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const EditUserDetailsPage = () => {
  const id = useHistoryListState()
  const user = DummyDatabase.useUserById(id)
  const history = useHistory()

  if(id !== undefined && user === undefined) {
    return (<div>Error: Could not find user with ID: {id}</div>)
  }
  
  const nameData = useValidatedInput(user?.name, t => t.length >= 3) //Name has to be 3 or more characters long
  const phoneData = useValidatedInput(user?.phoneNum, t => {
    try {
      return phoneUtil.isValidNumber(phoneUtil.parse(t, 'US'))
    } catch (error) {
      return false
    }
  })
  const emailData = useValidatedInput(user?.email, t => t.match(emailRegex) !== null)
  const valid = nameData.valid && phoneData.valid && emailData.valid

  const trySubmitData = () => {
    if(user === undefined) {
      DummyDatabase.addUserToDatabase({
        id: DummyDatabase.getNextID(),
        name: nameData.data,
        phoneNum: phoneData.data,
        email: emailData.data
      })
    } else {
      user.name = nameData.data
      user.phoneNum = phoneData.data
      user.email = emailData.data
      DummyDatabase.databaseChanged()
    }
    history.goBack()
  }

  return (
    <div>
      <div>
        { user !== undefined ? 
          <span>Editing User ID: {id}</span> : 
          <span>Create New User</span>
        }
      </div>
      <EditorValidateField display="Name" input={nameData} />
      <EditorValidateField display="Phone Number" input={phoneData} />
      <EditorValidateField display="Email" input={emailData} />
      <button onClick={valid?trySubmitData:undefined} className={`${valid ? "bg-blue-300 hover:bg-blue-500" : "bg-gray-300 text-gray-500"} p-1 mt-2 border-solid border-2 border-gray-900`}>Submit</button>
    </div>
  )
}

export const EditorValidateField = ({display, input}: { display: string, input: ValidatedInput }) => {
  return (
    <div className="pt-2">
      <span className="pr-2">{display}:</span>
      <input className={input.valid?"bg-blue-200":"bg-red-200"} type="text" onChange={e => input.onChange(e.target.value)} value={input.data || ''}/>
    </div>
  )
}

type ValidatedInput = {
  onChange: (text: string) => void
  data: string
  valid: boolean
}
export const useValidatedInput = (current: string, predicate: (test: string) => boolean): ValidatedInput => {
  current = current ?? ''
  const [data, setData] = React.useState(current)
  const [valid, setValid] = React.useState(predicate(current))

  return {
    onChange: (text: string) => {
      setValid(predicate(text))
      setData(text)
    },
    data,
    valid
  }

}