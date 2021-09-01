import { forwardRef, useImperativeHandle, useState } from "react";
import { SvgEmail, SvgPhone, SvgUser, SvgPlus, SvgCross } from "../assets/Icons";
import { EditorValidateInput, ValidatedString } from "../components/EditorValidateInput";
import { DatabaseWait } from "../database/Database";
import Vendor, { IVendor, useVendors } from "../database/types/Vendor";

import { ModalHandler as ModalHanler, setModal } from "./ModalManager";

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

export const EditVendorDetailsModal = forwardRef<ModalHanler, {objectId: string}>(({objectId}, ref) => {
  return objectId === undefined ? 
  (<EditVendorDetailsModalWithUser ref={ref} vendor={new Vendor({
    company: '',
    primaryContact: '',
    phoneNumbers: [{ name: '', number:'' }],
    emails: [''],
    notes: ''
  })}/>) : 
  (<EditVendorDetailsModalWithUserID ref={ref} id={objectId}/>)
})

const EditVendorDetailsModalWithUserID = forwardRef<ModalHanler, {id: string}>(({id}, ref) => {
  const vendor = useVendors(Vendor.findById(id), [id], id)
  return vendor === DatabaseWait ?
    (<div>Loading Vendor ID {id}</div>) :
    (<EditVendorDetailsModalWithUser ref={ref} vendor={vendor}/>)
})

const EditVendorDetailsModalWithUser = forwardRef<ModalHanler, {vendor: IVendor}>(({vendor}, ref) => {  

  const [companyData, setCompanyData] = useState<ValidatedString>(null) 
  const [primaryContactData, setPrimaryContactData] = useState<ValidatedString>(null) 
  const [phoneNumbers, setPhoneNumbers] = useState<{name: ValidatedString, number:ValidatedString, _id:number}[]>(() => 
    Array.from(vendor.phoneNumbers).map(d => {
      return {
        name: { text: d.name, valid: false },
        number: { text: d.number, valid: false },
        _id: Math.random()
      }
    })
  )
  const [emails, setEmails] = useState(() => [...vendor.emails].map(e => { return { text: e, valid: false, _id: Math.random() }}))
  
  const valid = 
    (companyData !== null && companyData.valid) && 
    (primaryContactData !== null && primaryContactData.valid) && 
    phoneNumbers.every(d => d.name.valid && d.number.valid) && 
    emails.every(e => e.valid)
  
  const trySubmitData = () => {
    if(!valid) {
      return
    }
    vendor.company = companyData.text
    vendor.primaryContact = primaryContactData.text
    vendor.phoneNumbers = phoneNumbers.map(n => {
      return {
        name: n.name.text,
        number: n.number.text
      }
    })
    vendor.emails = emails.map(e => e.text)
    vendor.save().then(() => setModal(null))
  }

  useImperativeHandle(ref, () => ({ onClose: trySubmitData }))

  return (
    <div className="flex flex-col" style={{width:'700px', height:'500px'}}>

      <div className="bg-gray-800 w-ful rounded-t-sm text-white p-2">
        { vendor.isNew ? 
          <span className="text-gray-300 font-semibold">Create New Vendor</span> :
          <span className="text-gray-300">Editing Vendor ID: {vendor.id}</span> 
        }
      </div>

      <div className="flex-grow overflow-auto">

        <div className="pt-4">
          <span className="ml-2 pr-2 text-gray-700"><SvgUser className="float-left mx-2" />Company:</span>
          <div>
            <EditorValidateInput label="Company Name" example="Company Inc." current={vendor.company} predicate={t => t.length >= 3} onChange={d => setCompanyData(d)} />
          </div>
        </div>

        <div className="pt-4">
          <span className="ml-2 pr-2 text-gray-700"><SvgUser className="float-left mx-2" />Primary Contact:</span>
          <div>
            <EditorValidateInput label="Contact Name" example="John Doe" current={vendor.primaryContact} predicate={t => t.length >= 3} onChange={d => setPrimaryContactData(d)} />
          </div>
        </div>

        <div className="pt-5">
          <span className="ml-2 pr-2 text-gray-700"><SvgPhone className="float-left mx-2" />Phone Numbers:</span>
          <div>
            {phoneNumbers.map(d=> (
              <div key={d._id}>
                <EditorValidateInput label="Name" example="Office" current={d.name.text} predicate={t => t.length >= 2} onChange={data => {
                  if(d.name.text !== data.text || d.name.valid !== data.valid) {
                    d.name = data
                    setPhoneNumbers([...phoneNumbers])
                  }
                }} />
                :
                <EditorValidateInput label="Number" example="4051234567" current={d.number.text} predicate={t => isValidPhoneNum(t)} onChange={data => {
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
          <span className="ml-2 pr-2 text-gray-700"><SvgEmail className="float-left mx-2" />Emails:</span>
          <div>
            {emails.map(email => (
            <div key={email._id}>
              <EditorValidateInput label="Email" example="someone@company.co" current={email.text} predicate={t => t.match(emailRegex) !== null} onChange={data => {
                if(email.text !== data.text || email.valid !== data.valid) {
                  email.text = data.text
                  email.valid = data.valid
                  setEmails([...emails])
                }
              }} />
              { emails.length === 1 ? <></> : 
                <span className="text-gray-800 hover:text-tomato-900 float-right flex items-center px-4 transform translate-y-3" onClick={() => {
                  emails.splice(emails.indexOf(email), 1)
                  setEmails([...emails])
                }}><SvgCross /></span>
              }
            </div>
            ))}
          </div>
          <div className="bg-gray-200 p-1, rounded-sm ml-2 w-60 text-gray-700 mt-0.5 hover:bg-gray-300" onClick={() => {
            emails.push({ text: '', valid: false, _id: Math.random() })
            setEmails([...emails])
          }}><SvgPlus className="float-left h-8 m-1 transform -translate-y-2" />Add New Email</div>
        </div>

        <button onClick={trySubmitData} className={`${valid ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : "bg-gray-200 text-gray-500 cursor-not-allowed"} py-1 mt-2 rounded-sm mb-2 px-4`}>Submit</button>

      </div>
    </div>
  )
})