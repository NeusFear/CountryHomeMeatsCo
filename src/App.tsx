import * as React from 'react';
import { 
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useHistory
} from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UsersPage, UserDetails } from './pages/UsersPage';
import { CalendarPage } from './pages/CalendarPage';
import { TodayPage } from './pages/TodayPage';
import { NavPageButton } from './components/NavPageButton';

import * as DummyDatabase from "./DummyDatabase"

import { SvgCalendar, SvgHome, SvgDay, SvgUsers } from './assets/Icons'

const logo = require('./assets/logo.png');

import './styles/navbar.css'
import './styles/tailwind.scss'
import { UserDetailsPage } from './pages/UserDetailsPage';

const userDetailsPage = "/userdetails"

const routes = [
    {
      path: "/",
      exact: true,
      page: () => <LandingPage />
    },
    {
      path: "/users",
      page: ({ pinUserDetails, removePinned }: { pinUserDetails:(id:number)=>void, removePinned:(id:number)=>void }) => <UsersPage addPinnedUserDetails={pinUserDetails} removePinned={removePinned}/>
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

const PinnedUserEntry = ({id, onClick, onRemove, selected} : {id: number, onClick: any, onRemove: any, selected: boolean}) => {
  let details = DummyDatabase.getUserById(id)
  return (
    <div className={"hover:bg-blue-400" + (selected?" bg-blue-800" : "")} onClick={onClick}>
      <span>{details.name}</span>
      <span onClick={e => { onRemove(); e.stopPropagation() }} className="float-right">X</span>
    </div>
  )
}

const NavBar = ({ pinnedList, setSelected, removePinned } : { pinnedList: UserPinnedList, setSelected: (id: number) => void, removePinned: (id: number) => void}) => {
  const allPinned = pinnedList.allPinned
  const history = useHistory()
  
  const onDetailsClicked = (id: number) => {
    //Make sure the user details page is selected
    history.push(userDetailsPage, id)

    setSelected(id !== pinnedList.selected ? id : undefined)
  }
  
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
            onRemove={() => removePinned(id)}
            selected={id === pinnedList.selected}
          />) 
        }
      </div>
    </div>
  )
}

const App = (props: any) => {
  //TODO: maybe move this to a navbar component. It seems a bit weird having it all here.
  //The only thing we need to figure out is how to pin/unpin a user from the users page,
  //As how would we reference the child state.

  const [pinnedList, setPinnedList]: [UserPinnedList, (list: UserPinnedList) => void] = React.useState<UserPinnedList>({ 
    allPinned: [],
    selected: null,
  })
  
  const pinUserDetails = React.useCallback((id: number) => {
    let newArray = [...pinnedList.allPinned]

    //Remove the element if it alreadt exists, then add it at the start of the list
    let existIndex = newArray.indexOf(id)
    if(existIndex !== -1) {
      newArray.splice(existIndex, 1)[0]
    }
    newArray.unshift(id)

    setPinnedList({
      allPinned: newArray,
      selected: pinnedList.selected
    })
  }, [pinnedList])

  const removePinned = React.useCallback((id: number) => {
    let newArray = [...pinnedList.allPinned]

    let existIndex = newArray.indexOf(id)
    if(existIndex !== -1) {
      newArray.splice(existIndex, 1)
    }

    setPinnedList({
      allPinned: newArray,
      selected: pinnedList.selected
    })
  }, [pinnedList])

  const setSelected = React.useCallback((id: number) => setPinnedList({
    allPinned: pinnedList.allPinned,
    selected: id
  }), [pinnedList])

  //When at a new route, deselect the current user info
  useHistory().listen(() => setSelected(undefined))
  
  return (
    <div className="flex">
      <NavBar pinnedList={pinnedList} setSelected={setSelected} removePinned={removePinned}/>
      <div>
        <Switch>
          {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} children={<route.page pinUserDetails={pinUserDetails} removePinned={removePinned}/>} /> ))}
        </Switch>
      </div>
    </div>
);
}

//Needed to be a seperate container, as App uses `useHistory()` which will be null if not inside a <Router>
export const AppContainer = (props: any) => {
  return (
    <Router>
      <App />
    </Router>
  )
}

export type UserPinnedList = {
  allPinned: number[];
  selected: number | null;
}