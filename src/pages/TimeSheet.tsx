import { SvgNewUser, SvgTimesheets } from "../assets/Icons";
import Employee, { useEmployees, ClockInState, IEmployee } from "../database/types/Employee";
import { editEmployeeDetails, setModal } from "../modals/ModalManager";

export const TimeSheet = () => {
  const allEmployees = useEmployees(Employee.find())

  return (
    <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row h-14 bg-gray-800 pt-1">
          <div className="text-white text-4xl font-bold ml-4 flex-grow">TIME SHEETS</div>
          <div className="hover:text-gray-100 hover:shadow-md cursor-pointer text-4xl w-16 h-11 text-center text-gray-300 bg-tomato-700 rounded-md py-1 px-4 mr-1 mt-1" onClick={() => setModal(editEmployeeDetails)}><SvgNewUser /></div>
          <div className="hover:text-gray-100 hover:shadow-md cursor-pointer text-4xl w-16 h-11 text-center text-gray-300 bg-tomato-700 rounded-md py-1 px-4 mr-2 mt-1"><SvgTimesheets /></div>
        </div>
        <div className="bg-gray-400 px-1 py-0.5 shadow-sm mb-2">
          <span className="ml-2 text-gray-700">This page is used to keep track of employee hours</span>
        </div>
        <div className="px-4 mt-4 h-full overflow-y-scroll">
          {allEmployees && allEmployees.map(e => <EmployeeEntry key={e.id} employee={e}/>)}
        </div>
      </div>
    )
}

const EmployeeEntry = ({ employee }: { employee: IEmployee }) => {
  let stateClasses = "";
  let stateText = "invalid state";

  const state = employee.clockInState ?? ClockInState.ClockedOut

  if (state === ClockInState.ClockedIn) {
    stateClasses = "ml-1 mt-1 text-green-500"
    stateText = "Clocked In"
  } else if (state === ClockInState.OnBreak) {
    stateClasses = "ml-1 mt-1 text-blue-500"
    stateText = "On Break"
  } else if (state === ClockInState.ClockedOut) {
    stateClasses = "ml-1 mt-1 text-tomato-600"
    stateText = "Clocked Out"
  }

  return (
    <div className="bg-gray-200 hover:shadow-md rounded-lg px-2 py-2 shadow-sm flex flex-row mb-2">
      <span className="flex-1 flex flex-col ml-6">
        <div className="flex flex-row">
          <div className="font-semibold text-xl">{`${employee.firstName} ${employee.lastName}`}</div>
          <div className={stateClasses}> {stateText}</div>
        </div>
        <div className="text-gray-600">{Math.round(employee.hours * 100) / 100} hours this period.</div>
      </span>
      <EmployeeTimeEntry employee={employee} state={ClockInState.ClockedOut} targetState={ClockInState.ClockedIn} colour="green" text="Clocked In" />
      <EmployeeTimeEntry employee={employee} state={ClockInState.ClockedIn} targetState={ClockInState.OnBreak} colour="blue" text="Start Break" />
      <EmployeeTimeEntry employee={employee} state={ClockInState.OnBreak} targetState={ClockInState.ClockedIn} colour="red" text="End Break" />
      <EmployeeTimeEntry employee={employee} state={ClockInState.ClockedIn} targetState={ClockInState.ClockedOut} colour="tomato" text="Clocked Out" />
    </div>
  )
}

const EmployeeTimeEntry = ({employee, state, targetState, colour, text}: 
{
  employee: IEmployee,
  state: number,
  targetState: number,
  colour: string,
  text: string
}) => {
  const isActive = (employee.clockInState ?? ClockInState.ClockedOut) === state
  const onClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    employee.clockInState = targetState
    if(targetState === ClockInState.ClockedIn) {
      employee.clockInTime = Date.now()
    } else {
      employee.hours += (Date.now() - employee.clockInTime) / (1000*60*60)
    }
    employee.save()
    e.stopPropagation()
  }
  return (
    <span onClick={onClick} className={"flex flex-shrink p-4 mx-2 my-1 rounded-md font-semibold " + (isActive?`hover:shadow-md hover:bg-${colour}-400 bg-${colour}-300 cursor-pointer`:"bg-gray-600 cursor-not-allowed text-gray-300")}>{text}</span>
  )
}