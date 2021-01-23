import * as React from "react"
import { useHistoryListState } from "../AppHooks"
import { useHistory } from 'react-router-dom';

import User, { createEmptyUser, IUser, useUserById } from "../database/types/User";

const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const isValidPhoneNum = (text: string) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parse(text, 'US'))
  } catch (error) {
    return false
  }
}

//http://emailregex.com/
const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const EditUserDetailsPage = () => {
  const objectId: string = useHistoryListState()

  return objectId === undefined ? 
  (<EditUserDetailsPageWithUser user={createEmptyUser()}/>) : 
  (<EditUserDetailsPageWithUserID id={objectId}/>)
}

const EditUserDetailsPageWithUserID = ({id}: {id: string}) => {
  const user = useUserById(id)
  return user === undefined ?
    (<div>Loading User ID {id}</div>) :
    (<EditUserDetailsPageWithUser user={user}/>)
}

type ValidatedString = {
  text: string
  valid: boolean
}

const EditUserDetailsPageWithUser = ({user}: {user: IUser}) => {
  const history = useHistory()
  
  const [nameData, setNameData] = React.useState<ValidatedString>(null) 
  const [phoneNumbers, setPhoneNumbers] = React.useState<{name: ValidatedString, number:ValidatedString}[]>(() => 
    [...user.phoneNumbers].map(d => {
      return {
        name: { text: d.name, valid: false },
        number: { text: d.number, valid: false }
      }
    })
  )
  const [emails, setEmails] = React.useState(() => [...user.emails].map(e => { return { text: e, valid: false }}))
  
  const valid = 
    (nameData !== null && nameData.valid) && 
    phoneNumbers.every(d => d.name.valid && d.number.valid) && 
    emails.every(e => e.valid)
  
  const trySubmitData = () => {
    user.name = nameData.text
    user.phoneNumbers = phoneNumbers.map(n => {
      return {
        name: n.name.text,
        number: n.number.text
      }
    })
    user.emails = emails.map(e => e.text)
    user.save().then(() => history.goBack())
  }

  return (
    <div>
      <div>
        { user !== undefined ? 
          <span>Editing User ID: {user.id}</span> : 
          <span>Create New User</span>
        }
      </div>

      <div className="pt-4">
        <span className="pr-2">Name:</span>
        <EditorValidateInput current={user?.name} predicate={t => t.length >= 3} onChange={d => setNameData(d)} />
      </div>

      <div className="pt-5">
        <span className="pr-2">Phone Numbers:</span>
        <div>
          <span className="w-60 inline-block">Name</span>
          <span>Number</span>
        </div>
        <div>
          {phoneNumbers.map((d, i) => (
            <div key={i}>
              <EditorValidateInput current={d.name.text} predicate={t => t.length >= 2} onChange={data => {
                if(d.name.text !== data.text || d.name.valid !== data.valid) {
                  d.name = data
                  setPhoneNumbers([...phoneNumbers])
                }
              }} />
              :
              <EditorValidateInput current={d.number.text} predicate={t => isValidPhoneNum(t)} onChange={data => {
                if(d.number.text !== data.text || d.number.valid !== data.valid) {
                  d.number = data
                  setPhoneNumbers([...phoneNumbers])
                }
              }}/>
              {phoneNumbers.length === 1 ? <></> : 
                <span onClick={() => {
                  phoneNumbers.splice(i, 1)
                  setPhoneNumbers([...phoneNumbers])
                }}>Del</span>
              }
            </div>
          ))}
        </div>
        <div onClick={() => {
          phoneNumbers.push({
            name: { text: '', valid: false },
            number: { text: '', valid: false }
          })
          setPhoneNumbers([...phoneNumbers])
        }}>New</div>
      </div>

      <div className="pt-5">
        <span className="pr-2">Emails:</span>
        <div>
          {emails.map((email, i) => (
          <div key={i}>
            <EditorValidateInput current={email.text} predicate={t => t.match(emailRegex) !== null} onChange={data => {
              if(email.text !== data.text || email.valid !== data.valid) {
                emails[i] = data
                setEmails([...emails])
              }
            }} />
            { emails.length === 1 ? <></> : 
              <span onClick={() => {
                emails.splice(i, 1)
                setEmails([...emails])
              }}>Del</span>
            }
          </div>
          ))}
        </div>
        <div onClick={() => {
          emails.push({ text: '', valid: false })
          setEmails([...emails])
        }}>New</div>
      </div>

      <button onClick={valid?trySubmitData:undefined} className={`${valid ? "bg-blue-300 hover:bg-blue-500" : "bg-gray-300 text-gray-500"} p-1 mt-2 border-solid border-2 border-gray-900`}>Submit</button>
    </div>
  )
}



const EditorValidateInput = ({current, predicate, onChange}: 
  { 
    current: string, 
    predicate: (test: string) => boolean,
    onChange: (data: ValidatedString) => void
  }
  ) => {
  current = current??''
  const [data, setData] = React.useState(undefined)
  const [valid, setValid] = React.useState(undefined)

  const onInputChange = (text: string) => {
    const valid = predicate(text)
    setValid(valid)
    setData(text)
    onChange({ text, valid })
  }

  React.useEffect(() => {
    if(data === undefined) {
      onInputChange(current)
    }
  })

  return (    
    <input className={"w-60 " + (valid?"bg-blue-200":"bg-red-200")} type="text" onChange={e => onInputChange(e.target.value)} value={data || ''}/>
  )
}