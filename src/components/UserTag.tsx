import { useHistory } from "react-router-dom";
import { IUser } from "../database/types/User";
import { userDetailsPage } from "../NavBar";

export default ({ user, id }: { user: IUser, id?: number }) => {
  const history = useHistory();
  return (
    <div className="flex flex-row">
      <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={e => { history.push(userDetailsPage, user.id); e.stopPropagation(); }}>{user.name}</p>
      {id && <p className="bg-gray-200 px-2 py-1 rounded-lg text-sm mt-0.5 cursor-pointer hover:bg-gray-300" onClick={() => console.log("go to sub user's individual cut instructions")}>#{id}</p>}
    </div>
  )
}
