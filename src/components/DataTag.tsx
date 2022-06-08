import { capitalizeFirstLetter } from "../Util";

export type Feedback = { name: string, color: string }

export const FeedbackTypes = {
  positive: { name: "positive", color: "bg-green-300 hover:bg-green-400 text-white" },
  warning: { name: "warning", color: "bg-orange-200 hover:bg-orange-300 text-black" },
  neutral: { name: "neutral", color: "bg-gray-200 hover:bg-gray-300 text-black" },
  negative: { name: "negative", color: "bg-tomato-300 hover:bg-tomato-400 text-black" },
}

const DataTag = ({ name, feedback, onClick, fill }: { name: string, feedback?: Feedback, onClick?: () => void, fill?: boolean }) => {

  return (
    <div className={"flex " + fill && "w-full"} onClick={onClick ? e => { e.stopPropagation(); onClick() } : null}>
      <p className={((feedback !== undefined && feedback.color) || FeedbackTypes.neutral.color) + " px-2 pt-1 rounded-lg text-sm mt-0.5 cursor-pointer mr-1 truncate h-7"}>{capitalizeFirstLetter(name)}</p>
    </div>
  )
}

export default DataTag;