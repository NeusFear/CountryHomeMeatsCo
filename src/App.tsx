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

import CalendarSvg from './assets/icons/calendar.svg'

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
      page: () => <UsersPage />
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
  
export const App = (props: any) => {
    return (
    <Router>
      <div style={{ display: "flex" }}>
        <div style={{ width: "20%", background: "#f0f0f0" }}>

          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/today">Today</Link></li>
            <li><Link to="/calendar"><NavPageButton Page="Calendar" Icon={CalendarSvg} /></Link></li>
          </ul>

          <Switch>
            {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} /> ))}
          </Switch>
        </div>

        <div style={{ flex: 1 }}>
          <Switch>
            {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} children={<route.page />} /> ))}
          </Switch>
        </div>
      </div>
    </Router>
);
}