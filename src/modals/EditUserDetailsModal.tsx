import * as React from "react"
import { SvgEmail, SvgPhone, SvgUser, SvgPlus, SvgCross } from "../assets/Icons";

import { createEmptyUser, IUser, useUserById } from "../database/types/User";
import { setModal } from "../modals/ModalManager";

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

export const EditUserDetailsModal = ({objectId}: {objectId: string}) => {
  return objectId === undefined ? 
  (<EditUserDetailsModalWithUser user={createEmptyUser()}/>) : 
  (<EditUserDetailsModalWithUserID id={objectId}/>)
}

const EditUserDetailsModalWithUserID = ({id}: {id: string}) => {
  const user = useUserById(id)
  return user === undefined ?
    (<div>Loading User ID {id}</div>) :
    (<EditUserDetailsModalWithUser user={user}/>)
}

type ValidatedString = {
  text: string
  valid: boolean
}

const EditUserDetailsModalWithUser = ({user}: {user: IUser}) => {  
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
    user.save().then(() => setModal(null))
  }

  return (
    <div>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        { user.isNew ? 
          <span className="text-gray-300 font-semibold">Create New User</span> :
          <span className="text-gray-300">Editing User ID: {user.id}</span> 
        }
      </div>

      <div className="pt-4">
        <span className="ml-2 pr-2 text-gray-700"><SvgUser className="float-left mx-2" />Name:</span>
        <div>
          <EditorValidateInput placeholder="Name" current={user.name} predicate={t => t.length >= 3} onChange={d => setNameData(d)} />
        </div>
      </div>

      <div className="pt-5">
        <span className="ml-2 pr-2 text-gray-700"><SvgPhone className="float-left mx-2" />Phone Numbers:</span>
        <div>
          {phoneNumbers.map((d, i) => (
            <div key={i}>
              <EditorValidateInput placeholder="Name" current={d.name.text} predicate={t => t.length >= 2} onChange={data => {
                if(d.name.text !== data.text || d.name.valid !== data.valid) {
                  d.name = data
                  setPhoneNumbers([...phoneNumbers])
                }
              }} />
              :
              <EditorValidateInput placeholder="Number" current={d.number.text} predicate={t => isValidPhoneNum(t)} onChange={data => {
                if(d.number.text !== data.text || d.number.valid !== data.valid) {
                  d.number = data
                  setPhoneNumbers([...phoneNumbers])
                }
              }}/>
              {phoneNumbers.length === 1 ? <></> : 
                <span className="text-gray-800 hover:text-tomato-900 float-right flex items-center px-4 transform translate-y-3"  onClick={() => {
                  phoneNumbers.splice(i, 1)
                  setPhoneNumbers([...phoneNumbers])
                }}><SvgCross /></span>
              }
            </div>
          ))}
        </div>
        <div className="bg-gray-200 p-1, rounded-sm ml-2 w-60 text-gray-700 mt-0.5 hover:bg-gray-300" onClick={() => {
          phoneNumbers.push({
            name: { text: '', valid: false },
            number: { text: '', valid: false }
          })
          setPhoneNumbers([...phoneNumbers])
        }}><SvgPlus className="float-left h-8 m-1 transform -translate-y-2" />Add New Phone</div>
      </div>

      <div className="pt-5">
        <span className="ml-2 pr-2 text-gray-700"><SvgEmail className="float-left mx-2" />Emails:</span>
        <div>
          {emails.map((email, i) => (
          <div key={i}>
            <EditorValidateInput placeholder="Email" current={email.text} predicate={t => t.match(emailRegex) !== null} onChange={data => {
              if(email.text !== data.text || email.valid !== data.valid) {
                emails[i] = data
                setEmails([...emails])
              }
            }} />
            { emails.length === 1 ? <></> : 
              <span className="text-gray-800 hover:text-tomato-900 float-right flex items-center px-4 transform translate-y-3" onClick={() => {
                emails.splice(i, 1)
                setEmails([...emails])
              }}><SvgCross /></span>
            }
          </div>
          ))}
        </div>
        <div className="bg-gray-200 p-1, rounded-sm ml-2 w-60 text-gray-700 mt-0.5 hover:bg-gray-300" onClick={() => {
          emails.push({ text: '', valid: false })
          setEmails([...emails])
        }}><SvgPlus className="float-left h-8 m-1 transform -translate-y-2" />Add New Email</div>
      </div>

      <button onClick={valid?trySubmitData:undefined} className={`${valid ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"} py-1 mt-2 rounded-sm mb-2 px-4`}>Submit</button>
    </div>
  )
}

const EditorValidateInput = ({placeholder, current, predicate, onChange}: 
  { 
    placeholder: string,
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
    <input placeholder={placeholder} className={`${valid ? "border-blue-500 bg-blue-100" : "border-red-500 bg-tomato-100"} w-60 border-2 rounded-sm p-1 my-1 mx-2 text-gray-800`} type="text" onChange={e => onInputChange(e.target.value)} value={data || ''}/>
  )
}