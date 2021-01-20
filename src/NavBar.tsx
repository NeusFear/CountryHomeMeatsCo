import * as React from 'react';
import { Switch, Route, Link, useHistory } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UsersPage } from './pages/UsersPage';
import { UserDetailsPage } from './pages/UserDetailsPage';
import { CalendarPage } from './pages/CalendarPage';
import { TodayPage } from './pages/TodayPage';
import { NavPageButton } from './components/NavPageButton';

import * as DummyDatabase from "./DummyDatabase"

import { SvgCalendar, SvgHome, SvgDay, SvgUsers } from './assets/Icons'

const logo = require('./assets/logo.png');

const userDetailsPage = "/userdetails"

export const routes = [
    {
      path: "/",
      exact: true,
      page: () => <LandingPage />
    },
    {
      path: "/users",
      page: ({ updatePinned }: { updatePinned:(id:number, add: boolean )=> void }) => <UsersPage updatePinned={updatePinned}/>
    },
    {
      path: userDetailsPage,
      page: () => <UserDetailsPage />
    },
    {
      path: "/today",
      page: () => <TodayPage />
    },
    {
      path: "/calendar",
      page: () => <CalendarPage />
    }
];

export const NavBar = ({ setUserPinCallback }) => {

  const [pinnedList, setPinnedList]: [UserPinnedList, (list: UserPinnedList) => void] = React.useState<UserPinnedList>({ 
    allPinned: [],
    selected: null,
  })

  const updatePinned = React.useCallback((id: number, add: boolean) => {
    let newArray = [...pinnedList.allPinned]

    let existIndex = newArray.indexOf(id)
    if(existIndex !== -1) {
      newArray.splice(existIndex, 1)
    }
    if(add) {
      newArray.unshift(id)
    }

    setPinnedList({
      allPinned: newArray,
      selected: pinnedList.selected
    })
  }, [pinnedList])

  //Set the callback. This is a weird way to do it, but it works.
  setUserPinCallback(updatePinned)

  const setSelected = React.useCallback((id: number) => setPinnedList({
    allPinned: pinnedList.allPinned,
    selected: id
  }), [pinnedList])

  const allPinned = pinnedList.allPinned
  const history = useHistory()
  const onDetailsClicked = (id: number) => {
    //Make sure the user details page is selected
    history.push(userDetailsPage, id)

    setSelected(id !== pinnedList.selected ? id : undefined)
  }

  //When at a new route, deselect the current user info
  history.listen(() => setSelected(undefined))
  
  return (
    <div className="bg-gray-400 w-2/12 h-full" style={{width: "20%", display: "flex", flexDirection: 'column', height: '100vh'}}>
      <ul>
        <li><Link to="/"><div className="bg-tomato-800 w-12/12 h-14"><img src={logo} className="ml-8 h-14" ></img></div></Link></li>
        <li><Link to="/"><NavPageButton Page="Home" Icon={SvgHome} /></Link></li>
        <li><Link to="/users"><NavPageButton Page="Users" Icon={SvgUsers} /></Link></li>
        <li><Link to="/today"><NavPageButton Page="Today" Icon={SvgDay} /></Link></li>
        <li><Link to="/calendar"><NavPageButton Page="Calendar" Icon={SvgCalendar} /></Link></li>
      </ul>
      <Switch>
        {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} /> ))}
      </Switch>

      <div style={{backgroundColor: '#15fa66', flexGrow: 1, marginTop: '5px', overflow: 'auto'}}>
        { allPinned && allPinned.map(id => 
          <PinnedUserEntry 
            key={id} 
            id={id} 
            onClick={() => onDetailsClicked(id)}
            onRemove={() => updatePinned(id, false)}
            selected={id === pinnedList.selected}
          />) 
        }
      </div>
    </div>
  )
}

const PinnedUserEntry = ({id, onClick, onRemove, selected} : {id: number, onClick: any, onRemove: any, selected: boolean}) => {
  let details = DummyDatabase.getUserById(id)
  return (
    <div className={"hover:bg-blue-400" + (selected?" bg-blue-800" : "")} onClick={onClick}>
      <span>{details.name}</span>
      <span onClick={e => { onRemove(); e.stopPropagation() }} className="float-right">X</span>
    </div>
  )
}

export type UserPinnedList = {
  allPinned: number[];
  selected: number | null;
}