import { useCallback, useState } from 'react';
import { 
  MemoryRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import './styles/tailwind.scss'
import './styles/autosuggest.css'

import { NavBar, routes } from './NavBar';
import { connectToDB } from './database/Database';
import { ModalManager } from './modals/ModalManager';
import ReactTooltip from 'react-tooltip';
import { ConnectingPage } from './pages/ConnectingPage';

export const AppContainer = () => {
  let connectState = connectToDB("localhost")
  return (
    connectState.connected ? <App/> : <ConnectingPage details={connectState.details} />
  )
}

const App = () => {  
  const [pinnedList, setPinnedList] = useState<UserPinnedList>({ 
    allPinned: [],
    updatePinned: () => {},
  })

  pinnedList.updatePinned = useCallback((id: string, add: boolean) => {
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

  return (<>
    <Router>
      <ModalManager />
      <div className="flex w-full h-full">
        <NavBar pinnedList={pinnedList} />
        <div className="w-full h-full">
          <Switch>
            {routes.map((route, index) => ( <Route key={index} path={route.path} exact={route.exact} children={<route.page pinnedList={pinnedList}/>} /> ))}
          </Switch>
        </div>
      </div>
    </Router>
  </>)
}

export type UserPinnedList = {
  allPinned: string[];
  updatePinned: (id: string, add: boolean) => void;
}