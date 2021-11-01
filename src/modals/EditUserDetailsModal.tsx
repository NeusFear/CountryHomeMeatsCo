import { forwardRef, useImperativeHandle, useState } from "react";
import { SvgEmail, SvgPhone, SvgUser, SvgPlus, SvgCross } from "../assets/Icons";
import { EditorValidateInput, ValidatedString } from "../components/EditorValidateInput";
import { DatabaseWait } from "../database/Database";

import User, { IUser, useUsers } from "../database/types/User";
import { ModalHandler, setModal } from "../modals/ModalManager";

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

export const EditUserDetailsModal = forwardRef<ModalHandler, { objectId: string }>(({ objectId }, ref) => {
  return objectId === undefined ?
    (<EditUserDetailsModalWithUser ref={ref} user={new User({
      name: '',
      phoneNumbers: [{ name: '', number: '' }],
      emails: [],
      notes: ''
    })} />) :
    (<EditUserDetailsModalWithUserID ref={ref} id={objectId} />)
})

const EditUserDetailsModalWithUserID = forwardRef<ModalHandler, { id: string }>(({ id }, ref) => {
  const user = useUsers(User.findById(id), [id], id)
  return user === DatabaseWait ?
    (<div>Loading User ID {id}</div>) :
    (<EditUserDetailsModalWithUser ref={ref} user={user} />)
})

const EditUserDetailsModalWithUser = forwardRef<ModalHandler, { user: IUser }>(({ user }, ref) => {
  const [nameData, setNameData] = useState<ValidatedString>(null)
  const [phoneNumbers, setPhoneNumbers] = useState<{ name: ValidatedString, number: ValidatedString, _id: number }[]>(() =>
    [...user.phoneNumbers].map(d => {
      return {
        name: { text: d.name, valid: false },
        number: { text: d.number, valid: false },
        _id: Math.random()
      }
    })
  )
  const [emails, setEmails] = useState(() => [...user.emails].map(e => { return { text: e, valid: false, _id: Math.random() } }))

  const valid =
    (nameData !== null && nameData.valid) &&
    phoneNumbers.every(d => d.name.valid && d.number.valid) &&
    emails.every(e => e.valid)

  const trySubmitData = () => {
    if (!valid) {
      return
    }
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

  useImperativeHandle(ref, () => ({ onClose: trySubmitData }))

  return (
    <div className="flex flex-col" style={{ width: '700px', height: '500px' }}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        {user.isNew ?
          <span className="text-gray-300 font-semibold">Create New User</span> :
          <span className="text-gray-300">Editing User ID: {user.id}</span>
        }
      </div>
      <div className="flex-grow overflow-auto">
        <div className="pt-4">
          <span className="ml-2 pr-2 text-gray-700"><SvgUser className="float-left mx-2" />Name:</span>
          <div>
            <EditorValidateInput label="Name" example="John Doe" current={user.name} predicate={t => t.length >= 3} onChange={d => setNameData(d)} />
          </div>
        </div>

        <div className="pt-5">
          <span className="ml-2 pr-2 text-gray-700"><SvgPhone className="float-left mx-2" />Phone Numbers:</span>
          <div>
            {phoneNumbers.map(d => (
              <div key={d._id}>
                <EditorValidateInput label="Name" example="cell" current={d.name.text} predicate={t => t.length >= 2} onChange={data => {
                  if (d.name.text !== data.text || d.name.valid !== data.valid) {
                    d.name = data
                    setPhoneNumbers([...phoneNumbers])
                  }
                }} />
                :
                <EditorValidateInput label="Number" example="4051234567" current={d.number.text} predicate={t => isValidPhoneNum(t)} onChange={data => {
                  if (d.number.text !== data.text || d.number.valid !== data.valid) {
                    d.number = data
                    setPhoneNumbers([...phoneNumbers])
                  }
                }} />
                {phoneNumbers.length === 1 ? <></> :
                  <span className="text-gray-800 hover:text-tomato-900 float-right flex items-center px-4 transform translate-y-3" onClick={() => {
                    phoneNumbers.splice(phoneNumbers.indexOf(d), 1)
                    setPhoneNumbers([...phoneNumbers])
                  }}><SvgCross /></span>
                }
              </div>
            ))}
          </div>
          <div className="bg-gray-200 p-1, rounded-sm ml-2 w-60 text-gray-700 mt-0.5 hover:bg-gray-300" onClick={() => {
            phoneNumbers.push({
              name: { text: '', valid: false },
              number: { text: '', valid: false },
              _id: Math.random()
            })
            setPhoneNumbers([...phoneNumbers])
          }}><SvgPlus className="float-left h-8 m-1 transform -translate-y-2" />Add Another Phone</div>
        </div>

        <div className="pt-5">
          <span className="ml-2 pr-2 text-gray-700"><SvgEmail className="float-left mx-2" />Emails:</span>
          <div>
            {emails.map(email => (
              <div key={email._id}>
                <EditorValidateInput label="Email" example="someone@example.com" current={email.text} predicate={t => t.match(emailRegex) !== null} onChange={data => {
                  if (email.text !== data.text || email.valid !== data.valid) {
                    email.text = data.text
                    email.valid = data.valid
                    setEmails([...emails])
                  }
                }} />
                <span className="text-gray-800 hover:text-tomato-900 float-right flex items-center px-4 transform translate-y-3" onClick={() => {
                  emails.splice(emails.indexOf(email), 1)
                  setEmails([...emails])
                }}><SvgCross /></span>
              </div>
            ))}
          </div>
          <div className="bg-gray-200 p-1, rounded-sm ml-2 w-60 text-gray-700 mt-0.5 hover:bg-gray-300" onClick={() => {
            emails.push({ text: '', valid: false, _id: Math.random() })
            setEmails([...emails])
          }}><SvgPlus className="float-left h-8 m-1 transform -translate-y-2" />Add Email</div>
        </div>

        <button onClick={trySubmitData} className={`${valid ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"} py-1 mt-2 rounded-sm mb-2 px-4`}>Submit</button>

      </div>
    </div>
  )
})