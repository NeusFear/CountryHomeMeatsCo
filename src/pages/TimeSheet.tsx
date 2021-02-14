export const TimeSheet = () => {
  
    return (
    <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
          <div className="text-white text-4xl font-bold ml-4">TIME SHEETS</div>
        </div>
        <div className="bg-gray-400 px-1 py-0.5 shadow-sm mb-2">
          <span className="ml-2 text-gray-700">Clock in clock out start stop lunch etc.</span>
        </div>
        <div className="px-4 mt-4 h-full overflow-y-scroll">
          <EmployeeEntry />
        </div>
      </div>
    )
}

const EmployeeEntry = () => {
    return (
        <div>some employee goes here</div>
    )
}