import { SvgAddressbook, SvgPrices, SvgTimesheets } from "../assets/Icons"
import { Link } from 'react-router-dom';
import { timeSheet, addressBook, priceSheet } from "../NavBar";
import { IGlobalNotes, useConfig } from "../database/types/Configs";
import { DatabaseWait } from "../database/Database";
import { useState } from "react";

export const LandingPage = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
        <div className="text-white text-4xl font-bold ml-4">COUNTRY HOME MEATS</div>
      </div>
      <div className="flex-grow flex flex-col p-4 overflow-hidden">
        <div className="flex flex-row mt-4 h-full">
          <div className="flex-grow bg-gray-200 rounded-lg">
            <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1">Notes</div>
            <div className="bg-white m-2">
              <NotesEdit />
            </div>
          </div>
          <div className="flex-grow bg-gray-200 mx-4 h-full rounded-lg">
            <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1">Upcoming Events</div>
            <div className="flex flex-col overflow-y-scroll mb-4 h-full">

              <EventDivider daysAway={0} />
              <EventItem eventType={DaysEnum.scheduledBeef} eventName="7 Beef Scheduled"/>
              <EventItem eventType={DaysEnum.scheduledPig} eventName="7 Pork Scheduled" />
              <EventItem eventType={DaysEnum.somethingElse} eventName="Jessee's Birthday" />
              <EventDivider daysAway={1} />
              <EventItem eventType={DaysEnum.scheduledBeef} eventName="7 Beef Scheduled"/>
              <EventItem eventType={DaysEnum.scheduledPig} eventName="7 Pork Scheduled" />
              <EventItem eventType={DaysEnum.somethingElse} eventName="Someone's Birthday" />
              <EventItem eventType={DaysEnum.somethingElse} eventName="Someone's Anniversary" />
              <EventDivider daysAway={2} />
              <EventItem eventType={DaysEnum.scheduledBeef} eventName="7 Beef Scheduled"/>
              <EventItem eventType={DaysEnum.scheduledPig} eventName="7 Pork Scheduled" />
              <EventDivider daysAway={3} />
              <EventItem eventType={DaysEnum.scheduledBeef} eventName="7 Beef Scheduled"/>
              <EventItem eventType={DaysEnum.scheduledPig} eventName="7 Pork Scheduled" />
              <EventDivider daysAway={4} />
              <EventItem eventType={DaysEnum.scheduledBeef} eventName="7 Beef Scheduled"/>
              <EventItem eventType={DaysEnum.scheduledPig} eventName="7 Pork Scheduled" />

            </div>
          </div>
          <div className="w-1/5 h-full flex flex-col">
            <Link to={timeSheet} className="w-full h-1/3 rounded-lg text-white text-7xl bg-green-200 hover:bg-green-100 text-center shadow-sm hover:shadow-md border-4 border-green-600">
              <SvgTimesheets className="relative w-1/3 h-1/3 ml-1 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-2/3" />
              <p className="text-xl relative left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-3/4">Time Sheet</p>
            </Link>
            <Link to={addressBook} className="w-full h-1/3 rounded-lg my-4 text-white text-7xl bg-tomato-200 hover:bg-tomato-100 text-center shadow-sm hover:shadow-md border-4 border-tomato-600">
              <SvgAddressbook className="relative w-1/3 h-1/3 ml-1 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-2/3" />
              <p className="text-xl relative left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-3/4">Address Book</p>
            </Link>
            <Link to={priceSheet} className="w-full h-1/3 rounded-lg text-white text-7xl bg-blue-200 hover:bg-blue-100 text-center shadow-sm hover:shadow-md border-4 border-blue-600">
              <SvgPrices className="relative w-1/3 h-1/3 ml-1 left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-2/3" />
              <p className="text-xl relative left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-3/4">Price List</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const NotesEdit = () => {
  const notes = useConfig("GlobalNotes")
  if(notes === DatabaseWait) {
    return <span>Loading...</span>
  }
  return (
    <textarea className="w-full h-5/6" value={notes.globalNotes} onChange={v => {
      notes.globalNotes = v.currentTarget.value
      notes.save()
    }} />
  )
}

const DaysEnum = Object.freeze({"scheduledBeef":"bg-tomato-400 group-hover:bg-tomato-300", "somethingElse":"bg-green-300 group-hover:bg-green-200", "scheduledPig":"bg-blue-300 group-hover:bg-blue-200"})

const EventItem = ({ eventName, eventType }: { eventName: string, eventType: any }) => {
  return (
    <div className="flex flex-row bg-white hover:bg-gray-100 h-5 mx-4 rounded-sm group mb-2 shadow-sm hover:shadow-md">
      <div className={`${eventType} w-2 rounded-l-md mr-2`}></div>
      <div className="text-sm">{eventName}</div>
    </div>
  )
}

const EventDivider = ({ daysAway }: { daysAway: number }) => {

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  var date = new Date();
  date.setDate(date.getDate() + daysAway);

  var dd = date.getDate();
  var day;
  var mm = date.getMonth()+1; 
  var yyyy = date.getFullYear();
  dd < 10 ? day = "0" + dd : day = dd;

  var dateLabel = months[mm] + " " + dd + ", " + yyyy;

  var label;

  if (daysAway == 0) label = "Today"
  if (daysAway == 1) label = "Tomorrow"
  if (daysAway > 1) label = dateLabel;

  return (
    <div className="bg-gray-300 h-5 px-6 group mb-2 w-full">
      <div className="w-full text-sm">{label}</div>
    </div>
  )
}