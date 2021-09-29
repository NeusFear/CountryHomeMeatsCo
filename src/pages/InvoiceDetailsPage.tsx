import { ObjectId } from "mongoose"
import { FC, useEffect, useState } from "react"
import { useHistoryListState } from "../AppHooks"
import { SvgPlus, SvgPrint, SvgTrash } from "../assets/Icons"
import { DatabaseWait } from "../database/Database"
import Animal, { AnimalType, IAnimal, useAnimals } from "../database/types/Animal"
import { PriceDataNumbers } from "../database/types/Configs"
import { BeefCutInstructions } from "../database/types/cut_instructions/Beef"
import { PorkCutInstructions } from "../database/types/cut_instructions/Pork"
import Invoice, { AllCuredPorkDataPieces, BeefPricesList, IInvoice, PaymentType, PorkPricesList, useInvoice } from "../database/types/Invoices"
import User, { useUsers } from "../database/types/User"
import { formatDay, normalizeDay } from "../Util"

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

    const { total, calcualtedTotal } = calculateTotal(animal, invoice)
    
    const cutInstruction = invoice.cutInstruction

    return (
        <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
            <div className="text-white text-4xl font-bold ml-4 flex-grow">INVOICE</div>
            <div className="transform cursor-pointer px-4 w-12 ml-1 pt-3 mr-4 mt-1 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgPrint /></div>
        </div>
        <div className="flex-grow flex flex-col p-4 overflow-y-scroll">
            
            <div className="flex flex-row h-40">
                {/* <div className="bg-gray-300 rounded-md shadow-md flex-grow">
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
                </div> */}
                <div className="bg-gray-300 rounded-md shadow-md flex-grow">
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
                        <p className="text-right"><RightFacingNumberInput value={invoice.takeHomeWeight} setValue={v => {
                            invoice.takeHomeWeight = v
                            invoice.save()
                        }} />lbs ({String(Math.round((isNaN(invoice.takeHomeWeight) ? 0 : invoice.takeHomeWeight) / animal.dressWeight * 100)).padStart(3, "0")}% of dress)</p>
                    </div>
                </div>
            </div>

            { cutInstruction.cutType === AnimalType.Beef ? 
                <CowDataTable invoice={invoice} cutInstructions={cutInstruction} price={invoice.priceData.beef} /> :
                <PigDataTable invoice={invoice} cutInstructions={cutInstruction} price={invoice.priceData.pork} />
            }
            <table className="table-fixed bg-gray-300 mt-4 border rounded-md">
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
                            <CowChargesTable animal={animal} invoice={invoice} /> :
                            <PigChargesTable animal={animal} invoice={invoice} />  
                        }
                    </tbody>
            </table>
            <div className="flex flex-row">
                <div className="flex-grow">
                    <table className="bg-gray-300 mt-4 border rounded-md w-full">
                            <thead className="bg-gray-800 rounded-md w-full">
                                <tr className="rounded-md w-full">
                                    <th className="text-left font-semibold text-gray-200 p-2 rounded-tl-md">Charge Name</th>
                                    <th className="text-left font-semibold text-gray-200 p-2 rounded-tr-md">Charge Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    (invoice.customcharges ?? []).map((c, i) =>
                                        <CustomChargesEntry key={i} charge={c} 
                                        onSave={() => {
                                            invoice.markModified("customcharges")
                                            invoice.save()
                                        }} 
                                        onRemove={() => {
                                            invoice.customcharges.splice(i, 1)
                                            invoice.markModified("customcharges")
                                            invoice.save()
                                        }} />    
                                    )
                                }
                            </tbody>
                    </table>
                    <div className="float-left mt-4 bg-gray-300">
                        <div className="py-1 flex flex-row text-green bg-gray-300 px-4 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 cursor-pointer text-xs" onClick={() => {
                            invoice.customcharges.push({name:"New Charge", amount:0})
                            invoice.save()
                        }}>
                            <SvgPlus className="h-4 w-4 mr-2" /> Add Charge
                        </div>
                    </div>
                </div>
                <div className="flex-grow flex relative">
                    <div className="mt-4 absolute right-0 bottom-0 flex flex-col">
                        <div className="flex flex-row">
                            <p className="bg-gray-600 px-2 rounded-l-md text-base text-white">TOTAL BEFORE MIN</p>
                            <p className="bg-gray-300 rounded-r-sm px-2 text-base">${calcualtedTotal.toFixed(2)}</p>
                        </div>
                        <br />
                        <div className="flex flex-row">
                            <p className="bg-tomato-700 px-2 rounded-l-md text-3xl text-white">TOTAL</p>
                            <p className="bg-gray-300 rounded-r-sm px-2 text-3xl">${total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <PaymentPart animal={animal} invoice={invoice}/>
        </div>
        </div>
    )
}

const PaymentPart = ({animal, invoice}: {animal: IAnimal, invoice: IInvoice}) => {
    const paid = invoice.markedAsPaid

    const { total } = calculateTotal(animal, invoice)
    const amountPayed = invoice.paymentTypes.map(t => t.amount).reduce((a, b) => a + b, 0)

    return (
        <div className="pt-24 w-full">
            <div className="w-full bg-gray-800 rounded-md">
                <p className="text-left font-semibold text-gray-200 p-2 rounded-tl-md">Payment {paid && <span>(Paid on {formatDay(invoice.dateTimePaid)} at {invoice.dateTimePaid.toLocaleTimeString()})</span>}</p>
            </div>
            <div className="bg-gray-300">
                { invoice.paymentTypes.map((p, i) => 
                    <InvoicePaymentEntry key={i} type={p} 
                        onSave={() => {
                            invoice.markModified("paymentTypes")
                            invoice.save()
                        }} 
                        onDelete={() => {
                            invoice.paymentTypes.splice(i, 1)
                            invoice.markModified("paymentTypes")
                            invoice.save()
                        }} 
                    />
                ) }  
            </div>
            <div className="flex flex-row">
                <div className="flex-grow">
                    <div className="float-left mt-4 bg-gray-300">
                        <div className="py-1 flex flex-row text-green bg-gray-300 px-4 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 cursor-pointer text-xs" onClick={() => {
                            invoice.paymentTypes.push({ type:"cash", amount:0 })
                            invoice.save()
                        }}>
                            <SvgPlus className="h-4 w-4 mr-2" /> Add Charge
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row">
                <div>Unpaid: ${(total - amountPayed).toFixed(2)}</div>
                <div 
                    className={(paid ? "bg-green-400" : "bg-tomato-400") + " ml-5"}
                    onClick={() => {
                        invoice.markedAsPaid = !invoice.markedAsPaid
                        invoice.dateTimePaid = invoice.markedAsPaid ? new Date() : null
                        invoice.save()
                    }}
                >
                    {paid ? "Mark As Unpaid" : "Mark As Paid"}
                </div>
            </div>
        </div>
    )
}

const InvoicePaymentEntry = ({type, onDelete, onSave}: {type: PaymentType, onDelete: () => void, onSave: () => void}) => {
    return (
        <div className="flex flex-row">
            <span onClick={onDelete}><SvgTrash className="text-gray-700 hover:text-tomato-700 mr-2" /></span>
            <select value={type.type} onChange={e => {
                type.type = e.target.value as any
                onSave()
            }}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="check">Check</option>
            </select>
            $<RightFacingNumberInput value={type.amount} fixed setValue={v => {
                type.amount = v
                onSave()
            }} />
            { type.type !== "cash" &&
                <input
                    value={type.additionalData ?? ''}
                    onChange={v => {
                        v.currentTarget.value = v.currentTarget.value.replace(/[^0-9]/g, '')
                        type.additionalData = v.currentTarget.value
                        onSave()
                    }}
                    placeholder={type.type === "card" ? "Last 4 card digets" : "Check Number"}
                />
            }
        </div>
    )
}

const calculateTotal = (animal: IAnimal, invoice: IInvoice) => {
    const keyList = animal.animalType === AnimalType.Beef ? BeefPricesList : PorkPricesList
    const keyObject = animal.animalType === AnimalType.Beef ? invoice.beefprices : invoice.porkprices
    let total = 0
    for(let key of keyList) {
        total += keyObject[key] ?? 0
    }

    (invoice.customcharges ?? []).forEach(c => total += c.amount)

    const minTotal = (animal.animalType === AnimalType.Beef ? invoice.priceData.beef : invoice.priceData.pork).minPrice
    const calcualtedTotal = total;
    if(total < minTotal) {
        total = minTotal
    }

    return { total, calcualtedTotal }

}

const DataTableWrapper: FC = ({children}) => {
    return (
        <table className="table-fixed w-full bg-gray-300 mt-4 border rounded-md">
            <thead className="bg-gray-800 rounded-md">
                <tr className="rounded-md">
                    <th className="w-1/3 text-left font-semibold text-gray-200 p-2 rounded-tl-md">Part</th>
                    <th className="w-1/3 text-left font-semibold text-gray-200 p-2">Instructions Given</th>
                    <th className="w-1/3 text-left font-semibold text-gray-200 p-2">Weight</th>
                </tr>
            </thead>
            <tbody>
                {children}
            </tbody>
        </table>
    )
}

const PigDataTablePart = ({title, mapper, DatabaseCreator, invoice, cutInstructions: c, price: p}: {
    title: string,
    mapper: <T>(obj: {fresh: T, cured: T}) => T,
    DatabaseCreator: (props: {
        title: string, 
        cutInstructions: string,
        editableValue: number
        setEditableValue: (val: number) => void
    }) => JSX.Element,
    invoice: IInvoice, 
    cutInstructions: PorkCutInstructions, 
    price: PriceDataNumbers["pork"]
}) => {
    const runThenSave = (r: (v: number) => void) => {
        return (v: number) => {
            r(v)
            invoice.markModified('porkdata')
            invoice.markModified('porkprices')
            invoice.save()
        }
    }

    const updateTotalCuredValue = () => {
        let total = 0
        for(let k of AllCuredPorkDataPieces) {
            total += invoice.porkdata[k] ?? 0
        }
        invoice.porkdata.totalcured = total
        invoice.porkprices.cured = total * p.cure
    }

    const hamIns = mapper(c.ham)
    const baconIns = mapper(c.bacon)
    const jowlIns = mapper(c.jowl)
    const loinIns = mapper(c.loin)
    const buttIns = mapper(c.butt)
    const picnicIns = mapper(c.picnic)

    const getHalf = (n: number) => n + (n === 1 ? " Half" : " Halves")

    return (
        <div className="flex-grow">
            <div>{title}</div>
            <DataTableWrapper>
                <DatabaseCreator 
                    title={`${title} Ham`}
                    cutInstructions={`${getHalf(hamIns.amount)} ${hamIns.type} ${hamIns.cutType} ${hamIns.size} ${hamIns.amountPerPackage}`}
                    editableValue={invoice.porkdata.curedham}
                    setEditableValue={runThenSave(v => {
                        invoice.porkdata.curedham = v
                        updateTotalCuredValue()
                    })}
                />
                <DatabaseCreator 
                    title={`${title} Bacon`}
                    cutInstructions={`${getHalf(baconIns.amount)} ${baconIns.cutType} ${baconIns.size}`}
                    editableValue={invoice.porkdata.curedbacon}
                    setEditableValue={runThenSave(v => {
                        invoice.porkdata.curedbacon = v
                        updateTotalCuredValue()
                    })}
                />
                <DatabaseCreator 
                    title={`${title} Jowl`}
                    cutInstructions={`${getHalf(jowlIns.amount)} ${jowlIns.type}`}
                    editableValue={invoice.porkdata.curedjowl}
                    setEditableValue={runThenSave(v => {
                        invoice.porkdata.curedjowl = v
                        updateTotalCuredValue()
                    })}
                />
                <DatabaseCreator 
                    title={`${title} Loin`}
                    cutInstructions={`${getHalf(loinIns.amount)} ${loinIns.size} ${loinIns.packageAmount}`}
                    editableValue={invoice.porkdata.curedloin}
                    setEditableValue={runThenSave(v => {
                        invoice.porkdata.curedloin = v
                        updateTotalCuredValue()
                    })}
                />
                <DatabaseCreator 
                    title={`${title} Butt`}
                    cutInstructions={`${getHalf(buttIns.amount)} ${buttIns.type} ${buttIns.packageAmount}`}
                    editableValue={invoice.porkdata.curedbutt}
                    setEditableValue={runThenSave(v => {
                        invoice.porkdata.curedbutt = v
                        updateTotalCuredValue()
                    })}
                />
                <DatabaseCreator 
                    title={`${title} Picnic`}
                    cutInstructions={`${getHalf(picnicIns.amount)} ${picnicIns.type} ${picnicIns.packageAmount}`}
                    editableValue={invoice.porkdata.curedpicnic}
                    setEditableValue={runThenSave(v => {
                        invoice.porkdata.curedpicnic = v
                        updateTotalCuredValue()
                    })}
                />
            </DataTableWrapper>
        </div>
    )
}
const PigDataTable = (props: {invoice: IInvoice, cutInstructions: PorkCutInstructions, price: PriceDataNumbers["pork"]}) => {
    const runThenSave = (r: (v: number) => void) => {
        return (v: number) => {
            r(v)
            props.invoice.markModified('porkdata')
            props.invoice.markModified('porkprices')
            props.invoice.save()
        }
    }

    return (<>
        <div className="flex flex-row">
            <PigDataTablePart title={"Fresh"} mapper={o => o.fresh} DatabaseCreator={NonEditableCutInstructionEntry} {...props} />
            <PigDataTablePart title={"Cured"} mapper={o => o.cured} DatabaseCreator={EditableCutInstructionEntry} {...props} />
        </div>
        <DataTableWrapper>
            <EditableCutInstructionEntry 
                title="Sausage"
                cutInstructions={props.cutInstructions.sausage}
                editableValue={props.invoice.porkdata.sausage}
                setEditableValue={runThenSave(v => {
                    props.invoice.porkdata.sausage = v
                    props.invoice.porkprices.sausage = v * props.price.sausage
                })}
            />
            <NonEditableCutInstructionEntry 
                title="Ribs"
                cutInstructions={props.cutInstructions.rib}
            />
            <NonEditableCutInstructionEntry 
                title="Head"
                cutInstructions={props.cutInstructions.head}
            />
            <NonEditableCutInstructionEntry 
                title="Feet"
                cutInstructions={props.cutInstructions.feet}
            />
            <NonEditableCutInstructionEntry 
                title="Heart"
                cutInstructions={props.cutInstructions.heart}
            />
            <NonEditableCutInstructionEntry 
                title="Fat"
                cutInstructions={props.cutInstructions.fat}
            />
        </DataTableWrapper>
    </>)
}

const PigChargesTable = ({animal, invoice}: {animal: IAnimal, invoice: IInvoice}) => {
    const runThenSave = (r: (v: number) => void) => {
        return (v: number) => {
            r(v)
            invoice.markModified('porkprices')
            invoice.save()
        }
    }
    const price = invoice.priceData.pork

    return (
    <> 
        <ChargesEntry 
            title={`Slaughter Fee (${invoice.porkdata.over350lbs ? "Over 350lbs" : "Under 350lbs"})`}
            price={(invoice.porkdata.over350lbs ? price.slaughterOver150lb : price.slaughter).toFixed(2)}
            quantity="1 Slaughter"
            value={invoice.porkprices.slaughter}
            setValue={runThenSave(v => invoice.porkprices.slaughter = v)}
        />
        <ChargesEntry 
            title="Processing Fee"
            price={`${price.processing.toFixed(2)} per lbs of dress weight.`}
            quantity={`${animal.dressWeight}lbs`}
            value={invoice.porkprices.processing}
            setValue={runThenSave(v => invoice.porkprices.processing = v)}
        />
        <ChargesEntry 
            title="Curing Fee"
            price={`${price.cure.toFixed(2)} per lbs of cured pork.`}
            quantity={`${invoice.porkdata.totalcured}lbs`}
            value={invoice.porkprices.cured}
            setValue={runThenSave(v => invoice.porkprices.cured = v)}
        />
        <ChargesEntry 
            title="Sausage Fee"
            price={`${price.sausage.toFixed(2)} per lbs of sausage.`}
            quantity={`${invoice.porkdata.sausage}lbs`}
            value={invoice.porkprices.sausage}
            setValue={runThenSave(v => invoice.porkprices.sausage = v)}
        />
    </>)
    
}

const CowChargesTable = ({animal, invoice}: {animal: IAnimal, invoice: IInvoice}) => {
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
            title="Slaughter Fee"
            price={price.slaughter.toFixed(2)}
            quantity="1 Slaughter"
            value={invoice.beefprices.slaughter}
            setValue={runThenSave(v => invoice.beefprices.slaughter = v)}
        />
        <ChargesEntry 
            title="Processing Fee"
            price={`${price.processing.toFixed(2)} per lbs of dress weight. (Min $200.00)`}
            quantity={`${animal.dressWeight}lbs`}
            value={invoice.beefprices.processing}
            setValue={runThenSave(v => invoice.beefprices.processing = v)}
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

const CustomChargesEntry = ({charge, onSave, onRemove}: {charge: { name: string, amount: number }, onSave: () => void, onRemove: () => void }) => {
    const [name, setName] = useState(charge.name)
    return (
        <tr className="m-1">
            <td className="m-1">
                <input value={name} className="w-full ml-2" onChange={i => setName(i.currentTarget.value)} onBlur={() => {
                    charge.name = name
                    onSave()
                }} />
            </td>
            <td className="flex flex-row m-1">
                <div className="flex-grow ml-3">
                    $<RightFacingNumberInput value={charge.amount} fixed setValue={val => {
                        charge.amount = val
                        onSave()
                    }}/>
                </div>
                <div onClick={onRemove}>
                    <SvgTrash className="text-gray-700 hover:text-tomato-700 mr-2" />
                </div>
            </td>
        </tr>
    )
}



const RightFacingNumberInput = ({value, setValue, fixed}: {value: number, setValue: (val: number) => void, fixed?: boolean }) => {
    const getVal = () => String((value ?? 0).toFixed(fixed ? 2 : 0))
    const [internalValue, setInternalValue] = useState("")
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        if(!isEditing) {
            setInternalValue(getVal())
        }
    }, [value, isEditing])

    return (
        <input 
            className="text-right focus:text-left w-16"
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
        />
    )
}

const ChargesEntry = ({title, price, quantity, value, setValue}: {title: string, price: number | string, quantity: number | string, value: number, setValue: (val: number) => void}) => {
    return (
        <tr>
            <td>{title}</td>
            <td>${price}</td>
            <td>{quantity}</td>
            <td>
                <RightFacingNumberInput value={value} setValue={setValue} fixed/>$
            </td>
        </tr>
    )
}

const CowDataTable = ({invoice, cutInstructions: c, price: p}: {invoice: IInvoice, cutInstructions: BeefCutInstructions, price: PriceDataNumbers["beef"]}) => {
    const runThenSave = (r: (v: number) => void ) => {
        return (v: number) => {
            r(v)
            invoice.markModified('beefdata')
            invoice.markModified('beefprices')
            invoice.save()
        }
    }
        
    return (
        <DataTableWrapper>
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
                })}
            />
            <EditableCutInstructionEntry 
                title="Patties"
                cutInstructions={`${c.patties.weight} ${c.patties.amount}`}
                editableValue={invoice.beefdata.patties}
                setEditableValue={runThenSave(v => {
                    invoice.beefdata.patties = v
                    invoice.beefprices.patties = v * p.patties
                })}
            />
        </DataTableWrapper>
    )

}

const NonEditableCutInstructionEntry = ({title, cutInstructions}: {title: string, cutInstructions: string}) => {
    return (
        <tr>
            <td>{title}</td>
            <td>{cutInstructions}</td>
            <td>---</td>
        </tr>
    )
}

const EditableCutInstructionEntry = ({title, cutInstructions, editableValue, setEditableValue}: {
    title: string, 
    cutInstructions: string,
    editableValue: number
    setEditableValue: (val: number) => void
}) => {
    return (
        <tr>
            <td>{title}</td>
            <td>{cutInstructions}</td>
            <td><RightFacingNumberInput value={editableValue} setValue={setEditableValue} />lbs</td>
        </tr>
    )
}

