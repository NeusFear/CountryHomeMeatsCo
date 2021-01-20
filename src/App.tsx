import * as React from 'react';
import { 
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import './styles/navbar.css'
import './styles/tailwind.scss'
import { NavBar, routes } from './NavBar';

export const App = () => {

  //This weird stuff is to allow the users page to call functions on the navbar. 
  //There HAS to be a better way of doing this
  let userPinCallback: (id: number, add: boolean) => void
  const updatePinned = (id: number, add: boolean) => userPinCallback(id, add)

  return (
    <Router>
      <div className="flex">
        <NavBar setUserPinCallback={callback => userPinCallback = callback}/>
        <div>
          <Switch>
            {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} children={<route.page updatePinned={updatePinned}/>} /> ))}
          </Switch>
        </div>
      </div>
    </Router>
);
}