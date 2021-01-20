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
  
  const [pinnedList, setPinnedList]: [UserPinnedList, (list: UserPinnedList) => void] = React.useState<UserPinnedList>({ 
    allPinned: [],
    updatePinned: () => {},
  })

  pinnedList.updatePinned = React.useCallback((id: number, add: boolean) => {
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
      //Do we even need this? it gets overritten anyway
      updatePinned: pinnedList.updatePinned,
    })
  }, [pinnedList])


  return (
    <Router>
      <div className="flex">
        <NavBar pinnedList={pinnedList} />
        <div>
          <Switch>
            {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} children={<route.page pinnedList={pinnedList}/>} /> ))}
          </Switch>
        </div>
      </div>
    </Router>
);
}

export type UserPinnedList = {
  allPinned: number[];
  updatePinned: (id: number, add: boolean) => void;
}