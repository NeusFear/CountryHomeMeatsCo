import { ObjectId } from "mongoose"
import { useEffect, useState } from "react"
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
                    { cutInstruction.cutType === "beef" ? 
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
                            <th className="w-96 text-left font-semibold text-gray-200 p-2">Calculation</th>
                            <th className="w-52 text-left font-semibold text-gray-200 p-2">Charge</th>
                        </tr>
                    </thead>
                    <tbody>
                        { cutInstruction.cutType === "beef" ? 
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
            title={`Processing Fee`}
            calculation={`$${price.processing} x Dress Weight - ${animal.dressWeight}lbs (Min $200)`}
            value={invoice.beefprices.processing}
            setValue={runThenSave(v => invoice.beefprices.processing = v)}
        />
        <ChargesEntry 
            title={`Slaughter Fee`}
            calculation={`$${price.slaughter}`}
            value={invoice.beefprices.slaughter}
            setValue={runThenSave(v => invoice.beefprices.slaughter = v)}
        />
        <ChargesEntry 
            title={`Split into halves - ${invoice.half ? "Yes" : "No"}`}
            calculation={`$${price.halves} x ${invoice.half ? "2 Halves" : "1 Half"} (if applicable)`}
            value={invoice.beefprices.halving}
            setValue={runThenSave(v => invoice.beefprices.halving = v)}
        />
        <ChargesEntry 
            title={`Divide a half in half - ${invoice.half ? "Yes" : "No"}`}
            calculation={`$${price.halvesToQuaters} x ${invoice.numQuaters} Quater${invoice.numQuaters === 1 ? "" : "s"} (if applicable)`}
            value={invoice.beefprices.quatering}
            setValue={runThenSave(v => invoice.beefprices.quatering = v)}
        />
        <ChargesEntry 
            title={`Extra Boning`} //- ${invoice.beefdata.tboneBoneOut ? `TBone (${invoice.beefdata.tbone ?? 0}lbs) ` : ""}${invoice.beefdata.clubRibeye ? `Ribeye (${invoice.beefdata.club ?? 0}lbs) ` : ""}
            // calculation={`$${price.extraBoning} x ${(invoice.beefdata.tboneBoneOut ? invoice.beefdata.tbone ?? 0 : 0) + (invoice.beefdata.clubRibeye ? invoice.beefdata.club ?? 0 : 0)}lbs`}
            calculation={`???`}
            value={invoice.beefprices.extraboning}
            setValue={runThenSave(v => invoice.beefprices.extraboning = v)}
        />
        <ChargesEntry
            title={`Patties - ${invoice.beefdata.patties ?? 0}lbs`}
            calculation={`$${price.patties} x ${invoice.beefdata.patties ?? 0}lb`}
            value={invoice.beefprices.patties}
            setValue={runThenSave(v => invoice.beefprices.patties = v)}
        />
        <ChargesEntry 
            title={`Cut Stew Meat - ${invoice.beefdata.stewmeat ?? 0}lbs`}
            calculation={`$${price.cutStewMeat} x ${invoice.beefdata.stewmeat ?? 0}lb`}
            value={invoice.beefprices.cutstewmeat}
            setValue={runThenSave(v => invoice.beefprices.cutstewmeat = v)}
        />
        <ChargesEntry 
            title={`Bone and Tenderized - ${cutInstructions.round.tenderizedAmount}`}
            calculation={`$${price.boneAndTenderizeRoundSteaks} x ${invoice.half ? "2 Halves" : "1 Half"} (if applicable)`}
            value={invoice.beefprices.tenderized}
            setValue={runThenSave(v => invoice.beefprices.tenderized = v)}
        />
        <ChargesEntry 
            title={`Make Cubes Steaks - ${invoice.beefdata.makeCubedSteaks ? "Yes" : "No"}`}
            calculation={`$${price.makeCubedSteaks} x ${invoice.half ? "1 Half" : "2 Halves"} (if applicable)`}
            value={invoice.beefprices.cubedsteaks}
            setValue={runThenSave(v => invoice.beefprices.cubedsteaks = v)}
        />
        <ChargesEntry 
            title={`Bone Out Prime Rib`}
            calculation={`???`}
            value={invoice.beefprices.boneoutrimerib}
            setValue={runThenSave(v => invoice.beefprices.boneoutrimerib = v)}
        />
        <ChargesEntry 
            title={`Bone Out Loin`}
            calculation={`???`}
            value={invoice.beefprices.boneoutloin}
            setValue={runThenSave(v => invoice.beefprices.boneoutloin = v)}
        />
    </>)
    
}

const ChargesEntry = ({title, calculation, value, setValue}: {title: string, calculation: string, value: number, setValue: (val: number) => void}) => {

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
            <td>{calculation}</td>
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
        <EditableDatabaseEntry 
            title="Round"
            cutInstructions={`${c.round.tenderizedAmount}  ${c.round.size} ${c.round.perPackage}`}
            editableValue={invoice.beefdata.round}
            setEditableValue={runThenSave(v => invoice.beefdata.round = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Sirloin Tip"
            cutInstructions={`${c.sirlointip.size} ${c.sirlointip.amount}`}
            editableValue={invoice.beefdata.sirlointip}
            setEditableValue={runThenSave(v => invoice.beefdata.sirlointip = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Flank"
            cutInstructions={c.flank}
            editableValue={invoice.beefdata.flank}
            setEditableValue={runThenSave(v => invoice.beefdata.flank = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Sirloin"
            cutInstructions={`${c.sirloin.size} ${c.sirloin.amount}`}
            editableValue={invoice.beefdata.sirloin}
            setEditableValue={runThenSave(v => invoice.beefdata.sirloin = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="T-Bone"
            cutInstructions={`${c.tbone.bone} ${c.tbone.size} ${c.tbone.amount}`}
            editableValue={invoice.beefdata.tbone}
            setEditableValue={runThenSave(v => invoice.beefdata.tbone = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Rump"
            cutInstructions={c.rump}
            editableValue={invoice.beefdata.rump}
            setEditableValue={runThenSave(v => invoice.beefdata.rump = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Pikes Peak"
            cutInstructions={c.pikespeak}
            editableValue={invoice.beefdata.pikespeak}
            setEditableValue={runThenSave(v => invoice.beefdata.pikespeak = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Soup Bones"
            cutInstructions={c.soupbones}
            editableValue={invoice.beefdata.soupbones}
            setEditableValue={runThenSave(v => invoice.beefdata.soupbones = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Ground Beef"
            cutInstructions={c.groundbeef}
            editableValue={invoice.beefdata.groundbeef}
            setEditableValue={runThenSave(v => invoice.beefdata.groundbeef = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Chunk"
            cutInstructions={c.chuck}
            editableValue={invoice.beefdata.chuck}
            setEditableValue={runThenSave(v => invoice.beefdata.chuck = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Arm"
            cutInstructions={c.arm}
            editableValue={invoice.beefdata.arm}
            setEditableValue={runThenSave(v => invoice.beefdata.arm = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Ribs"
            cutInstructions={c.ribs}
            editableValue={invoice.beefdata.ribs}
            setEditableValue={runThenSave(v => invoice.beefdata.ribs = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Club"
            cutInstructions={`${c.club.bone} ${c.club.size} ${c.club.amount}`}
            editableValue={invoice.beefdata.club}
            setEditableValue={runThenSave(v => invoice.beefdata.club = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Brisket"
            cutInstructions={c.brisket}
            editableValue={invoice.beefdata.brisket}
            setEditableValue={runThenSave(v => invoice.beefdata.brisket = v)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
            title="Stew Meat"
            cutInstructions={`${c.stewmeat.amount} ${c.stewmeat.size}`}
            editableValue={invoice.beefdata.stewmeat}
            setEditableValue={runThenSave(v => {
                invoice.beefdata.stewmeat = v
                invoice.beefprices.cutstewmeat = v * p.cutStewMeat
            }, true)}
            editableSuffix="lbs"
        />
        <EditableDatabaseEntry 
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

export const EditableDatabaseEntry = ({title, cutInstructions, editableValue, setEditableValue, editableSuffix}: {
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