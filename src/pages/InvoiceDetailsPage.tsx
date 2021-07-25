import { ObjectId } from "mongoose"
import { useEffect, useState } from "react"
import { useHistoryListState } from "../AppHooks"
import { DatabaseWait } from "../database/Database"
import Animal, { AnimalType, IAnimal, useAnimals } from "../database/types/Animal"
import { PriceDataNumbers } from "../database/types/Configs"
import { BeefCutInstructions } from "../database/types/cut_instructions/Beef"
import { PorkCutInstructions } from "../database/types/cut_instructions/Pork"
import Invoice, { IInvoice, useInvoice } from "../database/types/Invoices"
import User, { useUsers } from "../database/types/User"

export const InvoiceDetailsPage = () => {
    const id = useHistoryListState()
    const invoice = useInvoice(Invoice.findById(id), [id], id as string)
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
                        <p className="text-right">#TODO#lbs (#TODO#% of dress)</p>
                    </div>
                </div>
            </div>

            <table className="table-fixed bg-gray-300 mt-4 border rounded-md">
                <thead className="bg-gray-800 rounded-md">
                    <tr className="rounded-md">
                        <th className="w-1/3 text-left font-semibold text-gray-200 p-2 rounded-tl-md">Part</th>
                        <th className="w-1/3 text-left font-semibold text-gray-200 p-2">Instructions Given</th>
                        <th className="w-1/3 text-left font-semibold text-gray-200 p-2">Quantity/Weight</th>
                    </tr>
                </thead>
                <tbody>
                    { cutInstruction.cutType === AnimalType.Beef ? 
                        <CowDataTable invoice={invoice} cutInstructions={cutInstruction} price={invoice.priceData.beef} /> :
                        <PigDataTable invoice={invoice} cutInstructions={cutInstruction} price={invoice.priceData.pork} />  
                    }
                </tbody>
            </table>

            <div className="w-full relative">
                <table className="bg-gray-300 mt-4 border rounded-md absolute right-0">
                    <thead className="bg-gray-800 rounded-md">
                        <tr className="rounded-md">
                            <th className="w-52 text-left font-semibold text-gray-200 p-2 rounded-tl-md">Charge Name</th>
                            <th className="w-96 text-left font-semibold text-gray-200 p-2">Price</th>
                            <th className="w-52 text-left font-semibold text-gray-200 p-2">Quantity</th>
                            <th className="w-52 text-left font-semibold text-gray-200 p-2">Charge</th>
                        </tr>
                    </thead>
                    <tbody>
                        { cutInstruction.cutType === AnimalType.Beef ? 
                            <CowChargesTable animal={animal} invoice={invoice} cutInstructions={cutInstruction} /> :
                            <PigChargesTable invoice={invoice} cutInstructions={cutInstruction} />  
                        }
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    )
}

export const PigDataTable = ({invoice, cutInstructions: c, price: p}: {invoice: IInvoice, cutInstructions: PorkCutInstructions, price: PriceDataNumbers["pork"]}) => {
    return (
    <> 
        <tr>
            <td>Table</td>
        </tr>
    </>)
    
}

export const PigChargesTable = ({invoice, cutInstructions}: {invoice: IInvoice, cutInstructions: PorkCutInstructions}) => {
    return (
    <> 
        <tr>
            <td>Table</td>
        </tr>
    </>)
    
}

export const CowChargesTable = ({animal, invoice, cutInstructions}: {animal: IAnimal, invoice: IInvoice, cutInstructions: BeefCutInstructions}) => {
    const runThenSave = (r: (v: number) => void) => {
        return (v: number) => {
            r(v)
            invoice.markModified('beefprices')
            invoice.save()
        }
    }
    const price = invoice.priceData.beef

    return (
    <> 
        <ChargesEntry 
            title="Processing Fee"
            price={`${price.processing.toFixed(2)} per lbs of dress weight. (Min $200.00)`}
            quantity={`${animal.dressWeight}lbs`}
            value={invoice.beefprices.processing}
            setValue={runThenSave(v => invoice.beefprices.processing = v)}
        />
        <ChargesEntry 
            title="Slaughter Fee"
            price={price.slaughter.toFixed(2)}
            quantity="1 Slaughter"
            value={invoice.beefprices.slaughter}
            setValue={runThenSave(v => invoice.beefprices.slaughter = v)}
        />
        <ChargesEntry 
            title="Split into halves"
            price={`${price.halves.toFixed(2)} per half`}
            quantity={invoice.half ? "1 Half" : "N/A"}
            value={invoice.beefprices.halving}
            setValue={runThenSave(v => invoice.beefprices.halving = v)}
        />
        <ChargesEntry 
            title="Divide a half in half"
            price={`${price.halvesToQuaters.toFixed(2)} per quater.`}
            quantity={invoice.secondaryUser ? "2 Quaters" : "N/A"}
            value={invoice.beefprices.quatering}
            setValue={runThenSave(v => invoice.beefprices.quatering = v)}
        />
        <ChargesEntry
            title="Patties"
            price={`${price.patties.toFixed(2)} per lbs`}
            quantity={`${invoice.beefdata.patties ?? 0}lbs`}
            value={invoice.beefprices.patties}
            setValue={runThenSave(v => invoice.beefprices.patties = v)}
        />
        <ChargesEntry 
            title="Cut Stew Meat"
            price={`${price.cutStewMeat.toFixed(2)} per lbs`}
            quantity={`${invoice.beefdata.stewmeat ?? 0}lbs`}
            value={invoice.beefprices.cutstewmeat}
            setValue={runThenSave(v => invoice.beefprices.cutstewmeat = v)}
        />
        <ChargesEntry 
            title="Bone and Tenderized"
            price={`${price.boneAndTenderizeRoundSteaks.toFixed(2)} per half`}
            quantity={invoice.beefdata.hasTenderized ? (invoice.half ? "1 Half" : "2 Halves") : "N/A"}
            value={invoice.beefprices.tenderized}
            setValue={runThenSave(v => invoice.beefprices.tenderized = v)}
        />
        <ChargesEntry 
            title="Make Cubes Steaks"
            price={`${price.makeCubedSteaks.toFixed(2)} per half`}
            quantity={invoice.beefdata.makeCubedSteaks ? (invoice.half ? "1 Half" : "2 Halves") : "N/A"}
            value={invoice.beefprices.cubedsteaks}
            setValue={runThenSave(v => invoice.beefprices.cubedsteaks = v)}
        />
        <ChargesEntry 
            title={`Bone Out Prime Rib`}
            price={`${price.boneOutPrimeRib.toFixed(2)} per half`}
            quantity="???"
            value={invoice.beefprices.boneoutrimerib}
            setValue={runThenSave(v => invoice.beefprices.boneoutrimerib = v)}
        />
        <ChargesEntry 
            title={`Bone Out Loin`}
            price={`${price.boneOutLoin.toFixed(2)} per half`}
            quantity="???"
            value={invoice.beefprices.boneoutloin}
            setValue={runThenSave(v => invoice.beefprices.boneoutloin = v)}
        />
    </>)
    
}

const ChargesEntry = ({title, price, quantity, value, setValue}: {title: string, price: number | string, quantity: number | string, value: number, setValue: (val: number) => void}) => {

    const getVal = () => String((value ?? 0).toFixed(2))
    const [internalValue, setInternalValue] = useState("")
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        if(!isEditing) {
            setInternalValue(getVal())
        }
    }, [value, isEditing])
    
    return (
        <tr>
            <td>{title}</td>
            <td>${price}</td>
            <td>{quantity}</td>
            <td>
                <input 
                    className="text-right focus:text-left"
                    value={internalValue} 
                    onChange={e => {
                        setInternalValue(e.currentTarget.value)
                        let val = parseFloat(e.currentTarget.value)
                        if(isNaN(val)) {
                            val = 0
                        }
                        setValue(val)
                    }}
                    onFocus={() => setIsEditing(true)}
                    onBlur={() => {
                        setIsEditing(false)
                        setInternalValue(getVal())
                    }}
                />$
            </td>
        </tr>
    )
}

export const CowDataTable = ({invoice, cutInstructions: c, price: p}: {invoice: IInvoice, cutInstructions: BeefCutInstructions, price: PriceDataNumbers["beef"]}) => {
    const runThenSave = (r: (v: number) => void, changesPrices = false) => {
        return (v: number) => {
            r(v)
            invoice.markModified('beefdata')
            if(changesPrices) {
                invoice.markModified('beefprices')
            }
            invoice.save()
        }
    }
        
    return (
    <>
        <NonEditableCutInstructionEntry 
            title="Round"
            cutInstructions={`${c.round.tenderizedAmount}  ${c.round.size} ${c.round.perPackage}`}
        />
        <NonEditableCutInstructionEntry 
            title="Sirloin Tip"
            cutInstructions={`${c.sirlointip.size} ${c.sirlointip.amount}`}
        />
        <NonEditableCutInstructionEntry 
            title="Flank"
            cutInstructions={c.flank}
        />
        <NonEditableCutInstructionEntry 
            title="Sirloin"
            cutInstructions={`${c.sirloin.size} ${c.sirloin.amount}`}
        />
        <NonEditableCutInstructionEntry 
            title="T-Bone"
            cutInstructions={`${c.tbone.bone} ${c.tbone.size} ${c.tbone.amount}`}
        />
        <NonEditableCutInstructionEntry 
            title="Rump"
            cutInstructions={c.rump}
        />
        <NonEditableCutInstructionEntry 
            title="Pikes Peak"
            cutInstructions={c.pikespeak}
        />
        <NonEditableCutInstructionEntry 
            title="Soup Bones"
            cutInstructions={c.soupbones}
        />
        <NonEditableCutInstructionEntry 
            title="Ground Beef"
            cutInstructions={c.groundbeef}
        />
        <NonEditableCutInstructionEntry 
            title="Chunk"
            cutInstructions={c.chuck}
        />
        <NonEditableCutInstructionEntry 
            title="Arm"
            cutInstructions={c.arm}
        />
        <NonEditableCutInstructionEntry 
            title="Ribs"
            cutInstructions={c.ribs}
        />
        <NonEditableCutInstructionEntry 
            title="Club"
            cutInstructions={`${c.club.bone} ${c.club.size} ${c.club.amount}`}
        />
        <NonEditableCutInstructionEntry 
            title="Brisket"
            cutInstructions={c.brisket}
        />
        <EditableCutInstructionEntry 
            title="Stew Meat"
            cutInstructions={`${c.stewmeat.amount} ${c.stewmeat.size}`}
            editableValue={invoice.beefdata.stewmeat}
            setEditableValue={runThenSave(v => {
                invoice.beefdata.stewmeat = v
                invoice.beefprices.cutstewmeat = v * p.cutStewMeat
            }, true)}
            editableSuffix="lbs"
        />
        <EditableCutInstructionEntry 
            title="Patties"
            cutInstructions={`${c.patties.weight} ${c.patties.amount}`}
            editableValue={invoice.beefdata.patties}
            setEditableValue={runThenSave(v => {
                invoice.beefdata.patties = v
                invoice.beefprices.patties = v * p.patties
            }, true)}
            editableSuffix="lbs"
        />
    </>)
}

export const NonEditableCutInstructionEntry = ({title, cutInstructions}: {title: string, cutInstructions: string}) => {
    return (
        <tr>
            <td>{title}</td>
            <td>{cutInstructions}</td>
            <td>---</td>
        </tr>
    )
}

export const EditableCutInstructionEntry = ({title, cutInstructions, editableValue, setEditableValue, editableSuffix}: {
    title: string, 
    cutInstructions: string,
    editableValue: number
    setEditableValue: (val: number) => void
    editableSuffix: string
}) => {
    const [state, setState] = useState(editableValue ?? 0)
    const set = (val: number) => {
        if(isNaN(val)) {
            val = 0
        }
        setState(val)
        setEditableValue(val)
    }

    return (
        <tr>
            <td>{title}</td>
            <td>{cutInstructions}</td>
            <td><input type="number" value={String(state)} onChange={e => set(e.currentTarget.valueAsNumber)}/>{editableSuffix}</td>
        </tr>
    )
}