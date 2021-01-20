import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

//Returns a state of the history list state
export const useHistoryListState = () => {
  const history = useHistory()
  const [state, setState] = useState(history.location.state)
  //history.listen returns a function that makes it not listen,
  //so we want to return that in the use effect
  useEffect(() => history.listen(d => setState(d.state)))
  return state
}