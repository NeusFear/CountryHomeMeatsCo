import { useState } from "react"
import { SvgServer } from "../assets/Icons"

export const ConnectingPage = ({ defaultIP, defaultPort, details, address, refreshState }: { defaultIP: string, defaultPort: number, details: String, address: string, refreshState: (ip: string, port: number) => void }) => {

    const [ip, setIP] = useState(defaultIP)
    const [port, setPort] = useState(defaultPort)

    return (
        <span className="flex w-full h-full justify-center items-center flex-col text-tomato-700">
            <div className="flex flex-row">
                <div className="flex-grow"></div>
                <SvgServer className="w-24 h-24 animate-bounce mt-4" />
                <div>
                    <div className="font-bold text-6xl ml-8 animate-pulse">Connecting to Database...</div>
                    <p className="ml-24 font-semibold text-xl text-gray-700">{details}</p>
                    <p className="ml-24 font-semibold text-xl text-gray-700">{address}</p>
                </div>
                <div className="flex-grow"></div>
            </div>
            <div>
                <div>
                    IP:
                    <input className="bg-gray-500" value={ip} onChange={e => setIP(e.target.value)} type="text" />
                </div>
                <div>
                    Port:
                    <input className="bg-gray-500" value={port} onChange={e => !isNaN(e.target.valueAsNumber) && setPort(e.target.valueAsNumber)} type="number" />
                </div>
                <div>
                    <button className="bg-blue-200 rounded border-black border" onClick={() => refreshState(ip, port)}>Reconnect</button>
                </div>
            </div>
        </span>
    )
}