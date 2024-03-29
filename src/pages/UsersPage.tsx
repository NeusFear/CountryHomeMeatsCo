import { useHistory } from 'react-router-dom';
import { UserPinnedList } from "../App";
import { useSearchState } from "../AppHooks";
import { SvgNewUser, SvgNotes, SvgSearch, SvgTack } from "../assets/Icons";
import { DatabaseWait } from "../database/Database";
import User, { IUser, useUsers } from "../database/types/User";
import { editUserDetails, setModal } from "../modals/ModalManager";
import { userDetailsPage } from "../NavBar";
import { formatPhoneNumber } from "../Util";

const UserEntry = ({ details, addPinnedUserDetails }: { details: IUser, addPinnedUserDetails: (id: string) => void }) => {
  const history = useHistory()
  return (
    <div className="cursor-pointer bg-gray-100 hover:shadow-md rounded-lg px-2 py-2 shadow-sm flex flex-row mb-2" onClick={() => history.push(userDetailsPage, details.id)}>
      <span className="pr-2 flex-1">{details.name}</span>
      <span className="pr-2 flex-1 flex flex-row">{formatPhoneNumber(details.phoneNumbers[0]?.number)}{details.phoneNumbers.length > 1 ? <p className="ml-3 pt-0.5 text-xs bg-gray-200 rounded-md px-1"> +{details.phoneNumbers.length - 1}</p> : <></>}</span>
      <span className="pr-2 flex-1 flex flex-row">{details.emails[0] ?? 'No Email'}{details.emails.length > 1 ? <p className="ml-3 pt-0.5 text-xs bg-gray-200 rounded-md px-1"> +{details.emails.length - 1}</p> : <></>}</span>
      <span className="text-gray-600 h-6 w-6 mr-2 flex-shrink pt-1.5">
        {details.notes.length > 0 && <SvgNotes />}
      </span>
      <span className="hover:text-tomato-400 text-gray-600 h-6 w-6 mr-2 flex-shrink pt-1.5" onClick={e => { addPinnedUserDetails(details.id); e.stopPropagation() }}>
        <SvgTack />
      </span>
    </div>
  )
}

export const UsersPage = ({ pinnedList }: { pinnedList: UserPinnedList }) => {
  const [search, setSearch, regExp] = useSearchState()
  const users = useUsers(User.where('name').regex(regExp).select("name phoneNumbers emails notes"), [search])

  // const deleteEntry = (user: IUser) => {
  //   user.delete()
  //   pinnedList.updatePinned(user.id, false)
  // }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 py-2 px-2 flex flex-row justify-end">
        <div className="relative rounded-md shadow-sm flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">
              <SvgSearch />
            </span>
          </div>
          <input type="text" name="search" className="block w-full pl-9 pr-12 border-gray-300 rounded-md h-10" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div onClick={() => setModal(editUserDetails)} className="transform cursor-pointer px-4 w-12 ml-1 pt-3 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgNewUser /></div>
      </div>
      <div className="bg-gray-400 px-1 py-0.5 shadow-sm flex flex-row mb-2">
        <span className="ml-6 flex-1 text-gray-700">Name</span>
        <span className="flex-1 text-gray-700">Phone Number</span>
        <span className="pr-2 flex-1 text-gray-700">Email</span>
        <span className="w-24"></span>
      </div>
      <div className="px-4 mt-4 h-full overflow-y-scroll">
        {users !== DatabaseWait && users.map(d => <UserEntry key={d.id} details={d} addPinnedUserDetails={id => pinnedList.updatePinned(id, true)} />)}
      </div>
    </div>
  )
}