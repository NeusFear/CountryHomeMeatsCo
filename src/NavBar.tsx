import * as React from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailsPage } from './pages/UserDetailsPage';
import { CalendarPage } from './pages/CalendarPage';
import { TodayPage } from './pages/TodayPage';
import { NavPageButton } from './components/NavPageButton';
import { useHistoryListState } from "./AppHooks"

import { SvgCalendar, SvgHome, SvgDay, SvgUsers, SvgUser } from './assets/Icons'
import { UserPinnedList } from './App';
import { NavPinnedUserEntry } from './components/NavPinnedUserEntry';

const logo = require('./assets/logo.png');

export const userDetailsPage = "/userdetails"
// export const editUserDetailsPage = "/edit/userdetails"

export const routes = [
  { path: "/", exact: true, page: () => <LandingPage /> },
  { path: "/users", page: ({ pinnedList }: { pinnedList: UserPinnedList }) => <UsersPage pinnedList={pinnedList}/> },
  { path: userDetailsPage, page: ({ pinnedList }: { pinnedList: UserPinnedList }) => <UserDetailsPage pinnedList={pinnedList} /> },
  // { path: editUserDetailsPage, page: () => <EditUserDetailsPage /> },
  { path: "/today", page: () => <TodayPage /> },
  { path: "/calendar", page: () => <CalendarPage /> }
];

export const NavBar = ({ pinnedList }: { pinnedList: UserPinnedList }) => {

  const allPinned = pinnedList.allPinned
  const history = useHistory()
  const selectedId = useHistoryListState()
  const onDetailsClicked = (id: string) => {
    //Select the user details page with the id as the state
    history.push(userDetailsPage, id)
  }

  return (
    <div className="bg-gray-100 w-2/12 flex flex-col h-full" style={{minWidth:"200px"}}>
      <ul>
        <li><Link to="/"><div className="bg-tomato-800 h-14"><img src={logo} className="ml-8 h-14" ></img></div></Link></li>
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