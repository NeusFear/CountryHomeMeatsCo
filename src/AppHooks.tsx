import { useEffect, useState, useMemo } from 'react';
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

export const useSearchState = () => {
  const [search, setSearch] = useState<string>('')
  const regExp = useMemo(() => {
    try {
      return new RegExp(search.split(' ').filter(s => s.trim().length !== 0).map(s => `(${s})`).join('|'), 'i')
    } catch {
      return new RegExp("")
    }
  }, [search])
  return [search, setSearch, regExp] as const
}