import { useState } from "react"
import { useHistoryListState } from "../AppHooks"
import { DatabaseWait } from "../database/Database"
import Animal, { IAnimal, useAnimals } from "../database/types/Animal"
import { PriceDataNumbers } from "../database/types/Configs"
import { BeefCutInstructions } from "../database/types/cut_instructions/Beef"
import { PorkCutInstructions } from "../database/types/cut_instructions/Pork"
import Invoice, { IInvoice, useInvoice } from "../database/types/Invoices"
import User, { useUsers } from "../database/types/User"

export const InvoiceDetailsPage = () => {
    const id = useHistoryListState()
    const invoice = useInvoice(Invoice.findById(id), [id], id)
    const userID = invoice === DatabaseWait ? null : invoice.user
    const animalID = invoice === DatabaseWait ? null : invoice.animal
    const user = useUsers(User.findById(userID), [userID], userID)
    const animal = useAnimals(Animal.findById(animalID), [animalID], animalID)

    if(invoice === DatabaseWait || user === DatabaseWait || animal == DatabaseWait) {
        return <div>Loading...</div>
    }

    if(invoice === null) {
        return <div>Error: Invoice with id {id} was not found</div>
    }
    if(user === null) {
        return <div>Error: User with id {userID.toHexString()} was not found</div>
    }
    if(animal === null) {
        return <div>Error: Animal with id {animalID.toHexString()} was not found</div>
    }


    const cutInstruction = invoice.cutInstruction

    return (
        <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
            <div className="text-white text-4xl font-bold ml-4">INVOICE</div>
        </div>
        <div className="flex-grow flex flex-col p-4">
            
            <div className="flex flex-row h-40">
                <div className="bg-gray-300 rounded-md shadow-md flex-grow">
                    <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1 mb-2">Invoice Details</div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Date Paid:</p>
                        <p className="text-right">{invoice.dateTimePaid ? invoice.dateTimePaid.toDateString() : "N/A"}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Time Paid:</p>
                        <p className="text-right">{invoice.dateTimePaid ? invoice.dateTimePaid.toTimeString() : "N/A"}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">How Paid:</p>
                        <p className="text-right">#TODO#</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Check Number:</p>
                        <p className="text-right">#TODO#</p>
                    </div>
                </div>
                <div className="bg-gray-300 rounded-md shadow-md flex-grow mx-4">
                    <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1 mb-2">User Details</div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Name:</p>
                        <p className="text-right">{user.name}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Phone Number:</p>
                        { user.phoneNumbers.map((num, i) => <div key={i} className="text-right">{num.number}</div> ) }
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Email:</p>
                        { user.emails.map((email, i) => <div key={i} className="text-right">{email}</div> ) }
                    </div>
                </div>
                <div className="bg-gray-300 rounded-md shadow-md flex-grow">
                    <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1 mb-2">Animal Details</div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Type:</p>
                        <p className="text-right">{invoice.half ? "Half " : ""}{animal.animalType}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Date Killed:</p>
                        <p className="text-right">{animal.killDate.toDateString()}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Live Weight:</p>
                        <p className="text-right">{animal.liveWeight}lbs</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Dress Weight:</p>
                        <p className="text-right">{animal.dressWeight}lbs ({Math.round(animal.dressWeight / animal.liveWeight * 100)}% of live)</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Take Home Weight:</p>
                        <p className="text-right">400lbs (66% of dress)</p>
                    </div>
                </div>
            </div>

            <table className="table-fixed bg-gray-300 mt-4 border rounded-md">
                <thead className="bg-gray-800 rounded-md">
                    <tr className="rounded-md">
                        <th className="w-1/6 text-left font-semibold text-gray-200 p-2 rounded-tl-md">Part</th>
                        <th className="w-1/4 text-left font-semibold text-gray-200 p-2">Instructions Given</th>
                        <th className="w-14 text-left font-semibold text-gray-200 p-2">Quantity/Weight</th>
                        <th className="w-1/4 text-left font-semibold text-gray-200 p-2">Charges Associated</th>
                        <th className="w-14 text-left font-semibold text-gray-200 p-2 rounded-tr-md">Total Charge</th>
                    </tr>
                </thead>
                <tbody>
                    { cutInstruction.cutType === "beef" ? 
                        <CowTable animal={animal} invoice={invoice} cutInstructions={cutInstruction} price={invoice.priceData.beef} /> :
                        <PigTable animal={animal} invoice={invoice} cutInstructions={cutInstruction} price={invoice.priceData.pork} />  
                    }
                </tbody>
            </table>
        </div>
        </div>
    )
}

export const PigTable = ({animal, invoice, cutInstructions: c, price: p}: {animal: IAnimal, invoice: IInvoice, cutInstructions: PorkCutInstructions, price: PriceDataNumbers["pork"]}) => {
    return (
    <> 
        <tr>
            <td>Table</td>
        </tr>
    </>)
    
}

export const CowTable = ({animal, invoice, cutInstructions: c, price: p}: {animal: IAnimal, invoice: IInvoice, cutInstructions: BeefCutInstructions, price: PriceDataNumbers["beef"]}) => {
    const runThenSave = (r: (v: number) => void) => {
        return (v: number) => {
            r(v)
            invoice.save()
        }
    }

    let numQuaters: number
    if(invoice.half) {
        numQuaters = invoice.secondaryUser ? 1 : 2
    } else {
        numQuaters = 4
    }
    
    const numHalves = numQuaters / 2;
    return (
    <> 
        <tr>
            {
                c.round.tenderized === "Tenderized" ? 
                // <EditableDatabaseEntry 
                //     title="Round"
                //     cutInstructions={`${c.round.amount} ${c.round.tenderized} ${c.round.size} ${c.round.perPackage}`}
                //     editableValue={invoice.beefData.roundTenderizedAmount}
                //     setEditableValue={runThenSave(v => invoice.beefData.roundTenderizedAmount = v)}
                //     editableSuffix="lbs"
                //     charges={"Tenderized " + p.boneAndTenderizeRoundSteaks + "/lb"}
                //     chargeAsNumber={p.boneAndTenderizeRoundSteaks}
                // />
                <PortionBasedDatabaseEntry 
                    title="Round"
                    cutInstructions={`${c.round.amount} ${c.round.tenderized} ${c.round.size} ${c.round.perPackage}`}
                    portion={numHalves}
                    portionText={numHalves === 1 ? "Half" : "Halves"}
                    charges={"Tenderized " + p.boneAndTenderizeRoundSteaks + " Per Half"}
                    chargeAsNumber={p.boneAndTenderizeRoundSteaks}
                />
                :
                <EmptyDatabaseEntry 
                    title="Round"
                    cutInstructions={`${c.round.amount} ${c.round.tenderized} ${c.round.size} ${c.round.perPackage}`}
                />
            }
        </tr>
        <tr>
            <td>Sirloin Tip</td>
            <td>1" 1/pkg</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Flank</td>
            <td>Chicken Fry</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Sirloin</td>
            <td>1/2" 2/pkg</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>T-Bone</td>
            <td>1/2" 1/pkg</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Rump</td>
            <td>2lb Roast</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Round</td>
            <td>25% Tenderized 1" 1/pkg</td>
            <td>25lbs</td>
            <td>tenderized $3/lb</td>
            <td>$75</td>
        </tr>
        <tr>
            <td>Pikes Peak</td>
            <td>4lb</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Ground Beef</td>
            <td>Half 1lb Half 2lb</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Patties</td>
            <td>25% 3/pkg</td>
            <td>25lbs</td>
            <td>patties $0.45/lb</td>
            <td>$11.25</td>
        </tr>
        <tr>
            <td>Chuck</td>
            <td>2lb</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Arm</td>
            <td>2lb</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Ribs</td>
            <td>Keep All</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Club</td>
            <td>Ribeye 1/2" 1/pkg</td>
            <td>25lbs</td>
            <td>extra boning?</td>
            <td>$??</td>
        </tr>
        <tr>
            <td>Brisket</td>
            <td>Whole</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Stew Meat</td>
            <td>5pkgs 1lb/pkg</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
        <tr>
            <td>Soup Bones</td>
            <td>Yes</td>
            <td>---</td>
            <td>---</td>
            <td>$0</td>
        </tr>
    </>)
}

export const EmptyDatabaseEntry = ({title, cutInstructions}: {title: string, cutInstructions: string})  => {
    return <>
    <td>{title}</td>
    <td>{cutInstructions}</td>
    <td>---</td>
    <td>---</td>
    <td>$0</td>
</>
}

export const PortionBasedDatabaseEntry = ({title, cutInstructions, portion, portionText, charges, chargeAsNumber}: {
    title: string, 
    cutInstructions: string,
    portion: number,
    portionText: string,
    charges: string,
    chargeAsNumber: number
}) => {
    return <>
        <td>{title}</td>
        <td>{cutInstructions}</td>
        <td>{portion} {portionText}</td>
        <td>{charges}</td>
        <td>${portion * chargeAsNumber}</td>
    </>
}

export const EditableDatabaseEntry = ({title, cutInstructions, editableValue, setEditableValue, editableSuffix, charges, chargeAsNumber}: {
    title: string, 
    cutInstructions: string,
    editableValue: number
    setEditableValue: (val: number) => void
    editableSuffix: string,
    charges: string,
    chargeAsNumber: number
}) => {
    const [state, setState] = useState(editableValue)
    const set = (val: number) => {
        if(isNaN(val)) {
            val = 0
        }
        setState(val)
        setEditableValue(val)
    }

    return <>
        <td>{title}</td>
        <td>{cutInstructions}</td>
        <td><input type="number" value={String(state)} onChange={e => set(e.currentTarget.valueAsNumber)}/>{editableSuffix}</td>
        <td>{charges}</td>
        <td>${Math.round(state * chargeAsNumber * 100) / 100}</td>
    </>
}