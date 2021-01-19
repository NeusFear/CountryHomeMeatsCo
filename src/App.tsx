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
      <div className="flex">
        <div className="bg-gray-400 w-2/12 h-full">
          <ul>
            <li><Link to="/"><NavPageButton Page="Home" Icon={SvgHome} /></Link></li>
            <li><Link to="/users"><NavPageButton Page="Users" Icon={SvgUsers} /></Link></li>
            <li><Link to="/today"><NavPageButton Page="Today" Icon={SvgDay} /></Link></li>
            <li><Link to="/calendar"><NavPageButton Page="Calendar" Icon={SvgCalendar} /></Link></li>
          </ul>

          <Switch>
            {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} /> ))}
          </Switch>
        </div>

        <div className="flex-1">
          <Switch>
            {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} children={<route.page />} /> ))}
          </Switch>
        </div>
      </div>
    </Router>
);
}