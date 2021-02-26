import { Switch, Route, Link, useHistory } from 'react-router-dom';
import { AnimalDetailsPage } from './pages/AnimalDetailsPage';
import { LandingPage } from './pages/LandingPage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailsPage } from './pages/UserDetailsPage';
import { CalendarPage } from './pages/CalendarPage';
import { TodayPage } from './pages/TodayPage';
import { TimeSheet } from './pages/TimeSheet';
import { AddressBook } from './pages/AddressBook';
import { PriceSheet } from './pages/PriceSheet';
import { InvoiceDetailsPage } from './pages/InvoiceDetailsPage';
import { NavPageButton } from './components/NavPageButton';
import { useHistoryListState } from "./AppHooks";

import { SvgCalendar, SvgHome, SvgDay, SvgUsers, SvgArrow } from './assets/Icons';
import { UserPinnedList } from './App';
import { NavPinnedUserEntry } from './components/NavPinnedUserEntry';
import { useEffect, useState } from 'react';

const logo = require('./assets/logo.png');

export const animalDetailsPage = "/animaldetails"
export const userDetailsPage = "/userdetails"
export const timeSheet = "/timesheets"
export const addressBook = "/addressbook"
export const priceSheet = "/prices"
export const invoiceDetails = "/invoice"
// export const editUserDetailsPage = "/edit/userdetails"

export const routes = [
  { path: "/", exact: true, page: () => <LandingPage /> },
  { path: "/users", page: ({ pinnedList }: { pinnedList: UserPinnedList }) => <UsersPage pinnedList={pinnedList}/> },
  { path: userDetailsPage, page: ({ pinnedList }: { pinnedList: UserPinnedList }) => <UserDetailsPage pinnedList={pinnedList} /> },
  { path: animalDetailsPage, page: () => <AnimalDetailsPage />},
  { path: timeSheet, page: () => <TimeSheet /> },
  { path: addressBook, page: () => <AddressBook /> },
  { path: priceSheet, page: () => <PriceSheet /> },
  { path: invoiceDetails, page: () => <InvoiceDetailsPage /> },
  // { path: editUserDetailsPage, page: () => <EditUserDetailsPage /> },
  { path: "/today", page: () => <TodayPage /> },
  { path: "/calendar", page: () => <CalendarPage /> }
];

export const NavBar = ({ pinnedList }: { pinnedList: UserPinnedList }) => {

  const allPinned = pinnedList.allPinned
  const history = useHistory()
  const selectedId = useHistoryListState()
  const fb = useHistoryForwardBackwards()
  const onDetailsClicked = (id: string) => {
    //Select the user details page with the id as the state
    history.push(userDetailsPage, id)
  }

  return (
    <div className="bg-gray-100 w-6/12 flex flex-col h-full md:w-4/14 lg:w-2/12">
      <div className="bg-tomato-800 h-14 flex flex-row">
        <div className="m-2" onClick={() => fb.back?history.go(-1):false}><SvgArrow className={`hover:text-${fb.back?"tomato":"gray"}-800 text-${fb.back?"tomato":"gray"}-500 hover:shadow-md cursor-pointer text-4xl w-10 h-10 bg-white rounded-full p-0.5 transform rotate-180`} /></div>
        <div className="m-2" onClick={() => fb.forward?history.go(1):false}><SvgArrow className={`hover:text-${fb.forward?"tomato":"gray"}-800 text-${fb.forward?"tomato":"gray"}-500 hover:shadow-md cursor-pointer text-4xl w-10 h-10 bg-white rounded-full p-0.5`} /></div>
      </div>
      <ul>
        <li><Link to="/"><NavPageButton Page="Home" Icon={SvgHome} /></Link></li>
        <li><Link to="/users"><NavPageButton Page="Users" Icon={SvgUsers} /></Link></li>
        <li><Link to="/today"><NavPageButton Page="Today" Icon={SvgDay} /></Link></li>
        <li><Link to="/calendar"><NavPageButton Page="Calendar" Icon={SvgCalendar} /></Link></li>
      </ul>
      <Switch>
        {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} /> ))}
      </Switch>

      <div className="bg-gray-100 flex-grow mt-2 overflow-auto">
        { allPinned && allPinned.map(id => 
          <NavPinnedUserEntry 
            key={id} 
            id={id} 
            onClick={() => onDetailsClicked(id)}
            onRemove={() => pinnedList.updatePinned(id, false)}
            selected={id === selectedId}
          />) 
        }
      </div>
    </div>
  )
}

const useHistoryForwardBackwards: () => { 
  forward: boolean,
  back: boolean
} = () => {
  const history = useHistory()
  const create = () => { return {forward: history.canGo(1), back: history.canGo(-1)} }
  const [state, setState] = useState(create())
  useEffect(() => history.listen(() => setState(create())))
  return state
}