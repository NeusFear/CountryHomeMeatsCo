import * as React from 'react';
import { 
    BrowserRouter as Router,
    Switch,
    Route,
    Link 
} from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UsersPage } from './pages/UsersPage';
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
      page: () => <LandingPage NavBar={NavBar} />
    },
    {
      path: "/users",
      page: () => <UsersPage NavBar={NavBar} />
    },
    {
      path: "/today",
      page: () => <TodayPage NavBar={NavBar} />
    },
    {
      path: "/calendar",
      page: () => <CalendarPage NavBar={NavBar} />
    }
];

type NavProps = {
  widthHandled: boolean;
}
const NavBar = (props: NavProps) => {
  let style = { background: "#f0f0f0"}
  if(!props.widthHandled) {
    style['width'] = "20%";
  }
  return (
    <div style={style}>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        <li><Link to="/"><div className="bg-tomato-800 w-12/12 h-14"><img src={logo} className="ml-8 h-14" ></img></div></Link></li>
        <li><Link to="/"><NavPageButton Page="Home" Icon={SvgHome} /></Link></li>
        <li><Link to="/users"><NavPageButton Page="Users" Icon={SvgUsers} /></Link></li>
        <li><Link to="/today"><NavPageButton Page="Today" Icon={SvgDay} /></Link></li>
        <li><Link to="/calendar"><NavPageButton Page="Calendar" Icon={SvgCalendar} /></Link></li>
      </ul>
      <Switch>
        {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} /> ))}
      </Switch>
    </div>
  )
}
  
export const App = (props: any) => {
    return (
    <Router>
      <div>
        <Switch>
          {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} children={<route.page />} /> ))}
        </Switch>
      </div>
    </Router>
);
}