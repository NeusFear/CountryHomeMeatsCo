import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { SvgEmail, SvgPhone, SvgUser, SvgPlus, SvgCross } from "../assets/Icons";
import { EditorValidateInput, ValidatedString } from "../components/EditorValidateInput";
import { DatabaseWait } from "../database/Database";
import Employee, { IEmployee, useEmployees } from "../database/types/Employee";

import { ModalHandler, setModal } from "./ModalManager";

const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const isValidPhoneNum = (text: string) => {
  try {
    return phoneUtil.isValidNumber(phoneUtil.parse(text, 'US'))
  } catch (error) {
    return false
  }
}

const dateRegex = /^\d\d?\/\d\d?\/\d\d\d\d$/
export const EditEmployeeDetailsModal = forwardRef<ModalHandler, {objectId: string}>(({objectId}, ref) => {
  return objectId === undefined ? 
  (<EditUserDetailsModalWithUser ref={ref} user={new Employee({
    phoneNumbers: [{ name: '', number:'' }],
    clockInEvents: []
  })}/>) : 
  (<EditUserDetailsModalWithUserID ref={ref} id={objectId}/>)
})

const EditUserDetailsModalWithUserID = forwardRef<ModalHandler, {id: string}>(({id}, ref) => {
  const user = useEmployees(Employee.findById(id), [id], id)
  return user === DatabaseWait ?
    (<div>Loading User ID {id}</div>) :
    (<EditUserDetailsModalWithUser ref={ref} user={user}/>)
})

const EditUserDetailsModalWithUser = forwardRef<ModalHandler, {user: IEmployee}>(({user}, ref) => {  
  const [firstName, setFirstName] = useState<ValidatedString>(null) 
  const [middleName, setMiddleName] = useState<ValidatedString>(null) 
  const [lastName, setLastName] = useState<ValidatedString>(null) 
  const [phoneNumbers, setPhoneNumbers] = useState<{name: ValidatedString, number:ValidatedString, _id:number}[]>(() => 
    [...user.phoneNumbers].map(d => {
      return {
        name: { text: d.name, valid: false },
        number: { text: d.number, valid: false },
        _id: Math.random()
      }
    })
  )
  const [address, setAddress] = useState<ValidatedString[]>([])
  const [startDate, setStartDate] = useState<ValidatedString>(null)
  const [birthday, setBirthday] = useState<ValidatedString>(null)
  
  const valid = 
    firstName !== null && firstName.valid && 
    middleName !== null && middleName.valid && 
    lastName !== null && lastName.valid && 
    phoneNumbers.every(d => d.name.valid && d.number.valid) && 
    address.length === 3 && address.every(a => a.valid) &&
    startDate !== null && startDate.valid && 
    birthday !== null && birthday.valid 
  
    const trySubmitData = () => {
      if(!valid) {
        return
      }
      user.firstName = firstName.text
      user.middleName = middleName.text
      user.lastName = lastName.text
      user.phoneNumbers = phoneNumbers.map(n => {
        return {
          name: n.name.text,
          number: n.number.text
        }
      })
      user.address = address.map(a => a.text)
      user.startDate = new Date(startDate.text)
      user.birthday = new Date(birthday.text)
      user.save().then(() => setModal(null))
    }

  useImperativeHandle(ref, () => ({ onClose: trySubmitData }))

  const validateDate = (str: string) => !isNaN(new Date(str).getTime()) && str.match(dateRegex) !== null

  return (
    <div className="flex flex-col" style={{width:'700px', height:'500px'}}>
      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        { user.isNew ? 
          <span className="text-gray-300 font-semibold">Create Employee User</span> :
          <span className="text-gray-300">Editing Employee ID: {user.id}</span> 
        }
      </div>
      <div className="flex-grow overflow-auto">
        <div className="pt-4">
          <span className="ml-2 pr-2 text-gray-700"><SvgUser className="float-left mx-2" />Name:</span>
          <div>
            <EditorValidateInput placeholder="First Name" current={user.firstName} predicate={t => t.length >= 3} onChange={d => setFirstName(d)} />
          </div>
          <div>
            <EditorValidateInput placeholder="Middle Name (if any)" current={user.middleName} onChange={d => setMiddleName(d)} />
          </div>
          <div>
            <EditorValidateInput placeholder="Last Name" current={user.lastName} predicate={t => t.length >= 3} onChange={d => setLastName(d)} />
          </div>
        </div>

        <div className="pt-5">
          <span className="ml-2 pr-2 text-gray-700"><SvgPhone className="float-left mx-2" />Phone Numbers:</span>
          <div>
            {phoneNumbers.map(d=> (
              <div key={d._id}>
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
          }}><SvgPlus className="float-left h-8 m-1 transform -translate-y-2" />Add New Phone</div>
        </div>

        <div className="pt-5">
          <span className="ml-2 pr-2 text-gray-700"><SvgEmail className="float-left mx-2" />Address:</span>
          <div>
            <EditorValidateInput placeholder="Address Line 1" current={user.address[0]} predicate={t => t.length >= 5} onChange={d => {address[0] = d; setAddress([...address])}} />
          </div>
          <div>
            <EditorValidateInput placeholder="Address Line 2" current={user.address[1]} predicate={t => t.length >= 5} onChange={d => {address[1] = d; setAddress([...address])}} />
          </div>
          <div>
            <EditorValidateInput placeholder="Address Line 3" current={user.address[2]} predicate={t => t.length >= 5} onChange={d => {address[2] = d; setAddress([...address])}} />
          </div>
         </div>

         <div className="pt-4">
          <span className="ml-2 pr-2 text-gray-700"><SvgUser className="float-left mx-2" />Start Date:</span>
          <div>
            <EditorValidateInput placeholder="MM/DD/YYYY" current={user.startDate===undefined?undefined:`${user.startDate.getMonth()+1}/${user.startDate.getDate()}/${user.startDate.getFullYear()}`} predicate={validateDate} onChange={d => setStartDate(d)} />
          </div>
        </div>

        <div className="pt-4">
          <span className="ml-2 pr-2 text-gray-700"><SvgUser className="float-left mx-2" />Birthday:</span>
          <div>
            <EditorValidateInput placeholder="MM/DD/YYYY" current={user.birthday===undefined?undefined:`${user.birthday.getMonth()+1}/${user.startDate.getDate()}/${user.startDate.getFullYear()}`} predicate={validateDate} onChange={d => setBirthday(d)} />
          </div>
        </div>


        <button onClick={trySubmitData} className={`${valid ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"} py-1 mt-2 rounded-sm mb-2 px-4`}>Submit</button>

      </div>
    </div>
  )
})