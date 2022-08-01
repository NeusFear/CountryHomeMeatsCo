import { Link, Route, Switch, useHistory } from 'react-router-dom';
import { useHistoryListState } from "./AppHooks";
import { NavPageButton } from './components/NavPageButton';
import { AddressBook } from './pages/AddressBook';
import { AnimalDetailsPage } from './pages/AnimalDetailsPage';
import { CalendarPage } from './pages/CalendarPage';
import { InvoiceDetailsPage } from './pages/InvoiceDetailsPage';
import { LandingPage } from './pages/LandingPage';
import { PriceSheet } from './pages/PriceSheet';
import { TimeSheet } from './pages/TimeSheet';
import { TodayPage } from './pages/TodayPage';
import { UserDetailsPage } from './pages/UserDetailsPage';
import { UsersPage } from './pages/UsersPage';

import React, { useEffect, useState } from 'react';
import { UserPinnedList } from './App';
import { SvgArrow, SvgCalendar, SvgDay, SvgHome, SvgNotes, SvgSnowman, SvgUsers } from './assets/Icons';
import { NavPinnedUserEntry } from './components/NavPinnedUserEntry';
import { InCoolerPage } from './pages/InCoolerPage';
import { InvoicesPage } from './pages/InvoicesPage';

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
  { path: "/users", page: ({ pinnedList }: { pinnedList: UserPinnedList }) => <UsersPage pinnedList={pinnedList} /> },
  { path: userDetailsPage, page: ({ pinnedList }: { pinnedList: UserPinnedList }) => <UserDetailsPage pinnedList={pinnedList} /> },
  { path: animalDetailsPage, page: () => <AnimalDetailsPage /> },
  { path: timeSheet, page: () => <TimeSheet /> },
  { path: addressBook, page: () => <AddressBook /> },
  { path: priceSheet, page: () => <PriceSheet /> },
  { path: invoiceDetails, page: () => <InvoiceDetailsPage /> },
  // { path: editUserDetailsPage, page: () => <EditUserDetailsPage /> },
  { path: "/today", page: () => <TodayPage /> },
  { path: "/calendar", page: () => <CalendarPage /> },
  { path: "/incooler", page: () => <InCoolerPage /> },
  { path: "/invoices", page: () => <InvoicesPage /> }
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
        <div className="m-2" onClick={() => fb.back ? history.go(-1) : false}><SvgArrow className={`hover:text-${fb.back ? "tomato" : "gray"}-800 text-${fb.back ? "tomato" : "gray"}-500 hover:shadow-md cursor-pointer text-4xl w-10 h-10 bg-white rounded-full p-0.5 transform rotate-180`} /></div>
        <div className="m-2" onClick={() => fb.forward ? history.go(1) : false}><SvgArrow className={`hover:text-${fb.forward ? "tomato" : "gray"}-800 text-${fb.forward ? "tomato" : "gray"}-500 hover:shadow-md cursor-pointer text-4xl w-10 h-10 bg-white rounded-full p-0.5`} /></div>
      </div>
      <ul>
        <NavLink to="/" Page="Home" Icon={SvgHome} />
        <NavLink to="/users" Page="Users" Icon={SvgUsers} />
        <NavLink to="/today" Page="Today" Icon={SvgDay} />
        <NavLink to="/calendar" Page="Calendar" Icon={SvgCalendar} />
        <NavLink to="/incooler" Page="Cooler" Icon={SvgSnowman} />
        <NavLink to="/invoices" Page="Invoices" Icon={SvgNotes} />
      </ul>
      <Switch>
        {routes.map((route, index) => (<Route key={index} path={route.path} exact={route.exact} />))}
      </Switch>

      <div className="bg-gray-100 flex-grow mt-2 overflow-auto">
        {allPinned && allPinned.map(id =>
          <NavPinnedUserEntry
            key={id}
            id={id}
            onClick={() => onDetailsClicked(id)}
            onRemove={() => pinnedList.updatePinned(id, false)}
            selected={id === selectedId}
          />)
        }
      </div>
    </div >
  )
}

const NavLink = ({ to, Page, Icon }: { to: string, Page: string, Icon: (props: any) => JSX.Element }) => {
  return (
    <li>
      <Link to={to}>
        <NavPageButton Page={Page} to={to} Icon={Icon} />
      </Link>
    </li>
  )
}

const useHistoryForwardBackwards: () => {
  forward: boolean,
  back: boolean
} = () => {
  const history = useHistory()
  const create = () => { return { forward: history.canGo(1), back: history.canGo(-1) } }
  const [state, setState] = useState(create())
  useEffect(() => history.listen(() => setState(create())))
  return state
}