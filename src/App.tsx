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

import { SvgCalendar, SvgHome, SvgDay, SvgUsers } from './assets/Icons'

const logo = require('./assets/logo.png');

import './styles/navbar.css'
import './styles/tailwind.scss'

const routes = [
    {
      path: "/",
      exact: true,
      page: () => <LandingPage />
    },
    {
      path: "/users",
      page: ({ addUserDetails }) => <UsersPage addUserDetails={addUserDetails}/>
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

const usersPage = "/users"

const UserEntry = ({details, onClick, selected} : {details: UserDetails, onClick: any, selected: boolean}) => {
  return (
    <div className={"hover:bg-blue-400" + (selected?" bg-blue-800" : "")} onClick={onClick}>{details.name}</div>
  )
}

const NavBar = ({ pinnedList, setSelected } : { pinnedList: UserPinnedList, setSelected: (details: UserDetails) => void}) => {
  const allPinned = pinnedList.allPinned
  const history = useHistory()
  
  const onDetailsClicked = (details: UserDetails) => {
    //Make sure the users page is selected
    if(history.location.pathname !== usersPage) {
      history.push(usersPage)
    }
    setSelected(details !== pinnedList.selected ? details : undefined)
  }
  
  return (
    <div className="bg-gray-400 w-2/12 h-full" style={{width: "20%", display: "flex", flexDirection: 'column', height: '100vh'}}>
      <ul>
        <li><Link to="/"><div className="bg-tomato-800 w-12/12 h-14"><img src={logo} className="ml-8 h-14" ></img></div></Link></li>
        <li><Link to="/"><NavPageButton Page="Home" Icon={SvgHome} /></Link></li>
        <li><Link to={usersPage}><NavPageButton Page="Users" Icon={SvgUsers} /></Link></li>
        <li><Link to="/today"><NavPageButton Page="Today" Icon={SvgDay} /></Link></li>
        <li><Link to="/calendar"><NavPageButton Page="Calendar" Icon={SvgCalendar} /></Link></li>
      </ul>
      <Switch>
        {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} /> ))}
      </Switch>

      <div style={{backgroundColor: '#15fa66', flexGrow: 1, marginTop: '5px', overflow: 'auto'}}>
        { allPinned && allPinned.map(d => 
          <UserEntry 
            key={d.id} 
            details={d} 
            onClick={() => onDetailsClicked(d)}
            selected={d === pinnedList.selected}
          />) 
        }
      </div>
    </div>
  )
}

const App = (props: any) => {
  const [pinnedList, setPinnedList]: [UserPinnedList, (list: UserPinnedList) => void] = React.useState<UserPinnedList>({ 
    allPinned: [],
    selected: null,
  })
  
  const addUserDetails = React.useCallback((details: UserDetails) => setPinnedList({
      allPinned: [].concat(details, ...pinnedList.allPinned),
      selected: pinnedList.selected
    }), [pinnedList])

  const setSelected = React.useCallback((details: UserDetails) => setPinnedList({
    allPinned: pinnedList.allPinned,
    selected: details
  }), [pinnedList])

  //When at a new route, deselect the current user info
  useHistory().listen(() => setSelected(undefined))
  
  return (
    <div className="flex">
      <NavBar pinnedList={pinnedList} setSelected={setSelected}/>
      <div className="flex-1">
        <Switch>
          {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} children={<route.page addUserDetails={addUserDetails}/>} /> ))}
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
  allPinned: UserDetails[];
  selected: UserDetails | null;
}