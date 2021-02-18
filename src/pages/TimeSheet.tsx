export const TimeSheet = () => {
  
    return (
    <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
          <div className="text-white text-4xl font-bold ml-4">TIME SHEETS</div>
        </div>
        <div className="bg-gray-400 px-1 py-0.5 shadow-sm mb-2">
          <span className="ml-2 text-gray-700">This page is used to keep track of employee hours</span>
        </div>
        <div className="px-4 mt-4 h-full overflow-y-scroll">
          <EmployeeEntry name="John Doe" hours={32.4} state={1} />
          <EmployeeEntry name="Jim Joe" hours={41.4} state={2} />
          <EmployeeEntry name="Jake Lowe" hours={12.4} state={3} />
        </div>
      </div>
    )
}

//States:
//1 - clocked in
//2 - on break
//3 - clocked out

const EmployeeEntry = ({ name, hours, state }: {name: String, hours: number, state: number}) => {

  let stateClasses = "";
  let stateText = "invalid state";

  if (state == 1) {
    stateClasses = "ml-1 mt-1 text-green-500"
    stateText = "Clocked In"
  } else if (state == 2) {
    stateClasses = "ml-1 mt-1 text-blue-500"
    stateText = "On Break"
  } else if (state == 3) {
    stateClasses = "ml-1 mt-1 text-tomato-600"
    stateText = "Clocked Out"
  }

  return (
    <div className="bg-gray-200 hover:shadow-md rounded-lg px-2 py-2 shadow-sm flex flex-row mb-2">
      <span className="flex-1 flex flex-col ml-6">
        <div className="flex flex-row">
          <div className="font-semibold text-xl">{name}</div>
          <div className={stateClasses}> {stateText}</div>
        </div>
        <div className="text-gray-600">{hours} hours this period.</div>
      </span>
      <span className={"flex flex-shrink p-4 mx-2 my-1 rounded-md font-semibold " + (state==3?"hover:shadow-md hover:bg-green-500 bg-green-400 cursor-pointer":"bg-gray-600 cursor-not-allowed text-gray-300")}>Clock In</span>
      <span className={"flex flex-shrink p-4 mx-2 my-1 rounded-md font-semibold " + (state==1?"hover:shadow-md hover:bg-blue-500 bg-blue-400 cursor-pointer":"bg-gray-600 cursor-not-allowed text-gray-300")}>Start Break</span>
      <span className={"flex flex-shrink p-4 mx-2 my-1 rounded-md font-semibold " + (state==2?"hover:shadow-md hover:bg-red-400 bg-red-300 cursor-pointer":"bg-gray-600 cursor-not-allowed text-gray-300")}>End Break</span>
      <span className={"flex flex-shrink p-4 mx-2 my-1 rounded-md font-semibold " + (state==1?"hover:shadow-md hover:bg-tomato-700 bg-tomato-600 cursor-pointer":"bg-gray-600 cursor-not-allowed text-gray-300")}>Clock Out</span>
    </div>
  )
}