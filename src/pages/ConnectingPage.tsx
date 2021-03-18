import { SvgServer } from "../assets/Icons"

export const ConnectingPage = ({ details }: { details: String }) => {
    return (
        <span className="flex w-full h-full place-items-center flex-row text-tomato-700">
            <div className="flex-grow"></div>
            <SvgServer className="w-24 h-24 animate-bounce mt-4" />
            <div>
                <div className="font-bold text-6xl ml-8 animate-pulse">Connecting to Database...</div>
                <p className="ml-24 font-semibold text-xl text-gray-700">{details}</p>
            </div>
            <div className="flex-grow"></div>
        </span>
    )
}