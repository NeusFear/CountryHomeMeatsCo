import { ObjectId } from "mongoose"
import { FC, useEffect, useState } from "react"
import { useHistoryListState } from "../AppHooks"
import { SvgPlus, SvgPrint, SvgTrash } from "../assets/Icons"
import { DatabaseWait } from "../database/Database"
import { Link } from "react-router-dom";
import Animal, { AnimalType, IAnimal, useAnimals } from "../database/types/Animal"
import { PriceDataNumbers } from "../database/types/Configs"
import { BeefCutInstructions } from "../database/types/cut_instructions/Beef"
import { PorkCutInstructions } from "../database/types/cut_instructions/Pork"
import Invoice, { AllCuredPorkDataPieces, BeefPricesList, IInvoice, PaymentType, PorkPricesList, useInvoice } from "../database/types/Invoices"
import User, { IUser, useUsers } from "../database/types/User"
import { formatDay, formatHalfs, formatPhoneNumber, formatQuaters, formatWhole, normalizeDay } from "../Util"
import { animalDetailsPage, userDetailsPage } from "../NavBar"
import { printGenericSheet, setModal } from "../modals/ModalManager"
import { GenericPrintModal } from "../modals/GenericPrintModal"
import { PosPrintData } from "electron-pos-printer"

export const InvoiceDetailsPage = () => {
    const id = useHistoryListState()
    const invoice = useInvoice(Invoice.findById(id), [id], id as string)
    const userID = invoice === DatabaseWait ? null : invoice.user
    const cutInstructionUserID = invoice === DatabaseWait ? null : invoice.cutInstructionUser
    const animalID = invoice === DatabaseWait ? null : invoice.animal
    const user = useUsers(User.findById(userID), [userID], userID)
    const cutInstructionUser = useUsers(User.findById(cutInstructionUserID), [cutInstructionUserID], cutInstructionUserID)
    const animal = useAnimals(Animal.findById(animalID), [animalID], animalID)

    if(invoice === DatabaseWait || user === DatabaseWait || animal == DatabaseWait || cutInstructionUser === DatabaseWait) {
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
    const subTotal = calculateSubTotal(animal, invoice)

    const amountPayed = invoice.paymentTypes.map(t => t.amount).reduce((a, b) => a + b, 0)
    
    const amountLeft = subTotal - amountPayed


    const cutInstruction = invoice.cutInstruction

    const paid = invoice.markedAsPaid

    return (
        <div className="w-full h-screen flex flex-col">
        <div className="flex flex-row w-full h-14 bg-gray-800 pt-1">
            <div className="text-white text-4xl font-bold ml-4 flex-grow">INVOICE</div>
            <div onClick={() => doPrint(invoice, user, animal)} className="transform cursor-pointer px-4 w-12 ml-1 pt-3 mr-4 mt-1 hover:bg-tomato-600 border-gray-300 rounded-md h-10 flex-initial bg-tomato-700 text-white"><SvgPrint /></div>
        </div>
        <div className="flex-grow flex flex-col p-4 overflow-y-scroll">
            
            <div className="flex flex-row h-auto">
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
                <div className="bg-gray-300 rounded-md shadow-md flex-grow mr-2">
                <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1 mb-2 flex flex-row">
                        <div className="mr-5">User Details</div>
                        <Link className="text-blue-500"
                            to={{
                                pathname: userDetailsPage,
                                state: userID.toHexString()
                              }}
                        >
                            Go To User
                        </Link>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Name:</p>
                        <p className="text-right">{user.name}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Phone Number:</p>
                        { user.phoneNumbers.map((num, i) => <div key={i} className="text-right">{formatPhoneNumber(num.number)}</div> ) }
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Email:</p>
                        { user.emails.map((email, i) => <div key={i} className="text-right">{email}</div> ) }
                    </div>
                </div>
                <div className="bg-gray-300 rounded-md shadow-md flex-grow">
                    <div className="bg-gray-800 font-semibold rounded-t-lg text-white px-2 py-1 mb-2 flex flex-row">
                        <div className="mr-5">Animal Details</div>
                        <Link className="text-blue-500"
                            to={{
                                pathname: animalDetailsPage,
                                state: animalID.toHexString()
                              }}
                        >
                            Go To Animal
                        </Link>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Type:</p>
                        <p className="text-right">{formatWhole(invoice.numQuaters)} {animal.animalType}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Date Killed:</p>
                        <p className="text-right">{formatDay(animal.killDate)}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Date Processed:</p>
                        <p className="text-right">{formatDay(animal.processDate)}</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Date Invoice Generated:</p>
                        <p className="text-right">{formatDay(animal.invoiceGeneratedDate)}</p>
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
                        <p className="font-semibold flex-grow">Portion Weight:</p>
                        <p className="text-right">{Math.round(animal.dressWeight * invoice.numQuaters/4)}lbs ({Math.round(invoice.numQuaters/4 * 100)}% of dress)</p>
                    </div>
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Liver Good:</p>
                        <p className="text-right">{animal.liverGood ? "Yes" : "No"}</p>
                    </div>
                    { animal.animalType === AnimalType.Beef &&
                        <div className="flex flex-row pl-2 pr-4">
                            <p className="font-semibold flex-grow">Older than 30 Months:</p>
                            <p className="text-right">{animal.older30Months ? "Yes" : "No"}</p>
                        </div>
                    }
                    <div className="flex flex-row pl-2 pr-4">
                        <p className="font-semibold flex-grow">Take Home Weight:</p>
                        <p className="text-right"><RightFacingNumberInput value={invoice.takeHomeWeight} setValue={v => {
                            invoice.takeHomeWeight = v
                            invoice.save()
                        }} />lbs ({String(Math.round((isNaN(invoice.takeHomeWeight) ? 0 : invoice.takeHomeWeight) / animal.dressWeight * 100))}% of dress)</p>
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
                <div className="flex-grow w-full ">
                    <CustomChargesPart invoice={invoice} />
                    <PaymentPart invoice={invoice} amountLeft={amountLeft}/>
                </div>
                <div className="flex-grow w-full pl-4 pt-4">
                    <div className="w-full bg-gray-300 rounded-b-md pb-2">
                        <div className="w-full bg-gray-800 rounded-t-md">
                            <p className="text-left font-semibold text-gray-200 p-2 rounded-tl-md">Totals</p>
                        </div>
                        <div className="p-4">
                            <FormattedCharge name="Calculated Cost" data={"$" + calcualtedTotal.toFixed(2)} />
                            <FormattedCharge name="Post Min Fee" data={"$" + total.toFixed(2)} />
                            <div className="w-full bg-gray-700 h-0.5 mb-2"></div>

                            { invoice.customcharges.length !== 0 &&
                                <>
                                    { (() => {
                                        var counter = total;
                                        return invoice.customcharges.map((c, i) => <FormattedCharge key={i} name={"Charge: " + c.name + " ($" + c.amount.toFixed(2) + ")"} data={"$" + (counter+=c.amount).toFixed(2)} />)
                                    })() }
                                    <div className="w-full bg-gray-700 h-0.5 mb-2"></div>
                                </>
                            }

                            <FormattedCharge name="Sub Total" data={"$" + subTotal.toFixed(2)} />

                            { invoice.paymentTypes.map((p, i) => <FormattedCharge key={i} name={"Payment: by " + p.type} data={"- $" + p.amount.toFixed(2)} />)} 

                            <div className="w-full bg-gray-700 h-0.5 mb-2"></div>
                            <FormattedCharge name="Total Due" data={"$" + amountLeft.toFixed(2)} />
                        </div>
                        <div 
                            className={(paid ? "bg-green-200 hover:bg-green-300" : "bg-tomato-200 hover:bg-tomato-300") + " mx-5 rounded-md p-2 cursor-pointer"}
                            onClick={() => {
                                invoice.markedAsPaid = !invoice.markedAsPaid
                                invoice.dateTimePaid = invoice.markedAsPaid ? new Date() : null
                                animal.pickedUp = invoice.markedAsPaid
                                animal.save()
                                invoice.save()
                            }}
                        >
                            {paid ? "Mark As Unpaid" : "Mark As Paid"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

const FormattedCharge = ({name, data}: {name: string, data: string}) => {
    return(
        <div className="flex flex-row"><p className="flex-grow">{name}</p>{data}</div>
    )
}

const CustomChargesPart = ({invoice}: {invoice: IInvoice}) => {
    return(
        <div className="bg-gray-300 mt-4 border rounded-md w-full pb-2">
            <table className="w-full">
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
                <tfoot>
                    <tr>
                        <td>
                            <span className="py-1 flex flex-row text-green bg-gray-300 px-4 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 cursor-pointer text-xs" onClick={() => {
                                invoice.customcharges.push({name:"New Charge", amount:0})
                                invoice.save()
                            }}>
                                <SvgPlus className="h-4 w-4 mr-2" /> Add Charge
                            </span>
                        </td>
                    </tr>
                   
                </tfoot>
            </table>
        </div>
    )
}

const PaymentPart = ({invoice, amountLeft}: {invoice: IInvoice, amountLeft: number}) => {
    const paid = invoice.markedAsPaid

    return (
        <div className="pt-10 mb-20 w-full rounded-b-md">
            <div className="w-full bg-gray-800 rounded-t-md">
                <p className="text-left font-semibold text-gray-200 p-2 rounded-tl-md">Payments {paid && <span>(Paid on {formatDay(invoice.dateTimePaid)} at {invoice.dateTimePaid.toLocaleTimeString()})</span>}</p>
            </div>
            <div className="bg-gray-300 pt-2 px-2 rounded-b-md">
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
                <div className="flex flex-row pb-2">
                    <div className="flex-grow">
                        <div className="float-left bg-gray-300">
                            <div className="py-1 flex flex-row text-green bg-gray-300 px-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-200 cursor-pointer text-xs" onClick={() => {
                                invoice.paymentTypes.push({ type:"cash", amount:amountLeft })
                                invoice.save()
                            }}>
                                <SvgPlus className="h-4 w-4 mr-2" /> Add Payment
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const InvoicePaymentEntry = ({type, onDelete, onSave}: {type: PaymentType, onDelete: () => void, onSave: () => void}) => {
    return (
        <div className="flex flex-row mb-1 bg-gray-100 rounded-md">
            <select className="flex-grow mx-4" value={type.type} onChange={e => {
                type.type = e.target.value as any
                onSave()
            }}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="check">Check</option>
            </select>
            <div className="mx-4">
                $<RightFacingNumberInput value={type.amount} fixed setValue={v => {
                    type.amount = v
                    onSave()
                }} />
            </div>
            { type.type !== "cash" &&
                <input
                    value={type.additionalData ?? ''}
                    onChange={v => {
                        v.currentTarget.value = v.currentTarget.value.replace(/[^0-9]/g, '')
                        type.additionalData = v.currentTarget.value
                        onSave()
                    }}
                    placeholder={type.type === "card" ? "Last 4 card digits" : "Check Number"}
                />
            }
            <span onClick={onDelete}><SvgTrash className="text-gray-700 hover:text-tomato-700 mr-2 mt-1" /></span>
        </div>
    )
}

export const calculateTotal = (animal: IAnimal, invoice: IInvoice) => {
    if(animal == null || invoice == null) {
        return { total: 0, calculateTotal: 0 }
    }
    const keyList = animal.animalType === AnimalType.Beef ? BeefPricesList : PorkPricesList
    const keyObject = animal.animalType === AnimalType.Beef ? invoice.beefprices : invoice.porkprices
    let total = 0
    for(let key of keyList) {
        total += keyObject[key] ?? 0
    }

    const minTotal = (animal.animalType === AnimalType.Beef ? invoice.priceData.beef : invoice.priceData.pork).minPrice
    const calcualtedTotal = total;
    if(total < minTotal) {
        total = minTotal
    }

    return { total, calcualtedTotal }
}

const calculateSubTotal = (animal: IAnimal, invoice: IInvoice) => {
    
    let total = calculateTotal(animal, invoice).total;

    (invoice.customcharges ?? []).forEach(c => total += c.amount)

    return total;
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
            quantity={`${Math.round(animal.dressWeight * invoice.numQuaters / 4 * 100) / 100}lbs`}
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
            quantity={`${Math.round(animal.dressWeight * invoice.numQuaters / 4 * 100) / 100}lbs`}
            value={invoice.beefprices.processing}
            setValue={runThenSave(v => invoice.beefprices.processing = v)}
        />
        <ChargesEntry 
            title="Split into halves"
            price={`${price.halves.toFixed(2)} per half`}
            quantity={formatHalfs(invoice.numQuaters)}
            value={invoice.beefprices.halving}
            setValue={runThenSave(v => invoice.beefprices.halving = v)}
        />
        <ChargesEntry 
            title="Divide a half in half"
            price={`${price.halvesToQuaters.toFixed(2)} per quater.`}
            quantity={formatQuaters(invoice.numQuaters)}
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
            quantity={invoice.beefdata.hasTenderized ? formatHalfs(invoice.numQuaters) : "N/A"}
            value={invoice.beefprices.tenderized}
            setValue={runThenSave(v => invoice.beefprices.tenderized = v)}
        />
        <ChargesEntry 
            title="Make Cubes Steaks"
            price={`${price.makeCubedSteaks.toFixed(2)} per half`}
            quantity={invoice.beefdata.makeCubedSteaks ? formatHalfs(invoice.numQuaters) : "N/A"}
            value={invoice.beefprices.cubedsteaks}
            setValue={runThenSave(v => invoice.beefprices.cubedsteaks = v)}
        />
        <ChargesEntry 
            title={`Bone Out Prime Rib`}
            price={`${price.boneOutPrimeRib.toFixed(2)} per half`}
            quantity={invoice.beefdata.boneoutprimerib ? "Yes" : "No"}
            value={invoice.beefprices.boneoutprimerib}
            setValue={runThenSave(v => invoice.beefprices.boneoutprimerib = v)}
        />
        <ChargesEntry 
            title={`Bone Out Loin`}
            price={`${price.boneOutLoin.toFixed(2)} per half`}
            quantity={invoice.beefdata.boneoutloin ? "Yes" : "No"}
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
                <input value={name} className="w-full ml-2" onFocus={e => e.target.select()} onChange={i => setName(i.currentTarget.value)} onBlur={() => {
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
                title="Chuck"
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

const doPrint = (invoice: IInvoice, user: IUser, animal: IAnimal) => {
    const data: PosPrintData[] = [
        {
            type: "text",
            value: `
              <style>
                @media print {
                  .page-break  { 
                    display:block; 
                    page-break-before:always; 
                  }
                }
                * {
                  font-family: Arial, Helvetica, sans-serif;
                }
              </style>
            `
        },
        {
            type: "text",
            value: `
                <div style="position: absolute">${logoImgString}</div>

                <div style="width: 100%; text-align: right; margin-top: 25px; margin-right: 50px; ">
                    <div style="font-size: 5em; font-weight: bold;">INVOICE</div>
                    <div>Todays Date: ${formatDay(new Date())}</div>
                    <div>Invoice #${invoice.invoiceId}</div>
                    <div>Animal #${animal.animalId}</div>
                </div>
                <div>
                    <span style="font-weight: bold">Country Home Meat Co</span><br>
                    2775 E. Waterloo Road<br>
                    Edmond<br>
                    Oklahoma<br>
                    73034<br>
                    USA<br>
                    (405) 341-0267
                </div>
                <br>
                Bill To:
                <div>
                    <span style="font-weight: bold">${user.name}</span><br>
                    ${user.emails.map(e => `${e}<br>`).join("")}
                    ${user.phoneNumbers.map(p => `${p.name}: ${formatPhoneNumber(p.number)}<br>`).join("")}
                </div>
            `
        }
    ]

    data.push({
        type: "text",
        value: `
        <style>
        td {
            text-align: left !important;
            border: 0.5px solid #ddd;
            padding: 0;
            margin: 0;
        }
        th, td {
            padding: 3px !important;
        }
        </style>
        `
    })

    const formatWeight = (num?: number) => {
        if(num === undefined || num === null) {
            return "0lbs"
        }
        return num + "lbs"
    }

    if(animal.animalType === AnimalType.Beef) {
        const beef = invoice.cutInstruction as BeefCutInstructions
        data.push({
            type: "table",

            tableHeader: ["Part", "Instruction Given", "Weight"],
            tableBody: [
                [ "Round", `${beef.round.tenderizedAmount} ${beef.round.size} ${beef.round.perPackage}`, "..." ],
                [ "Sirloin Tip", `${beef.sirlointip.size} ${beef.sirlointip.amount}`, "..." ],
                [ "Flank", beef.flank, "..." ],
                [ "Sirloin", `${beef.sirloin.size} ${beef.sirloin.amount}`, "..." ],
                [ "T-Bone", `${beef.tbone.bone} ${beef.tbone.size} ${beef.tbone.amount}`, "..." ],
                [ "Rump", beef.rump, "..." ],
                [ "Pikes Peak", beef.pikespeak, "..." ],
                [ "Soup Bones", beef.soupbones, "..." ],
                [ "Ground Beef", beef.groundbeef, "..." ],
                [ "Chuck", beef.chuck, "..." ],
                [ "Arm", beef.arm, "..." ],
                [ "Ribs", beef.ribs, "..." ],
                [ "Club", `${beef.club.bone} ${beef.club.size} ${beef.club.amount}`, "..." ],
                [ "Brisket", beef.brisket, "..." ],
                [ "Stew Meat", `${beef.stewmeat.amount} ${beef.stewmeat.size}`, formatWeight(invoice.beefdata.stewmeat) ],
                [ "Patties", `${beef.patties.weight} ${beef.patties.amount}`, formatWeight(invoice.beefdata.patties) ]
            ],
            tableHeaderStyle: 'background-color: #000; color: white; text-align: left',
            tableBodyStyle: 'border: 0.5px solid #ddd; text-align: left',
            style: "width: calc(100% - 50px); margin-left: 16px; margin-top: 10px"
        })
    } else {
        const getHalf = (n: number) => n + (n === 1 ? " Half" : " Halves")

        const pork = invoice.cutInstruction as PorkCutInstructions
        data.push({
            type: "table",

            tableHeader: ["Part", "Fresh Instruction Given", "Cured Instruction Given", "Cured Weight"],
            tableBody: [
                [ 
                    "Ham", 
                    `${getHalf(pork.ham.fresh.amount)} ${pork.ham.fresh.type} ${pork.ham.fresh.cutType} ${pork.ham.fresh.size} ${pork.ham.fresh.amountPerPackage}`, 
                    `${getHalf(pork.ham.cured.amount)} ${pork.ham.cured.type} ${pork.ham.cured.cutType} ${pork.ham.cured.size} ${pork.ham.cured.amountPerPackage}`,
                    formatWeight(invoice.porkdata.curedham)
                ], 
                [
                    "Bacon",
                    `${getHalf(pork.bacon.fresh.amount)} ${pork.bacon.fresh.cutType} ${pork.bacon.fresh.size}`,
                    `${getHalf(pork.bacon.cured.amount)} ${pork.bacon.cured.cutType} ${pork.bacon.cured.size}`,
                    formatWeight(invoice.porkdata.curedbacon)
                ],
                [
                    "Jowl",
                    `${getHalf(pork.jowl.fresh.amount)} ${pork.jowl.fresh.type}`,
                    `${getHalf(pork.jowl.cured.amount)} ${pork.jowl.cured.type}`,
                    formatWeight(invoice.porkdata.curedjowl)
                ],
                [
                    "Loin",
                    `${getHalf(pork.loin.fresh.amount)} ${pork.loin.fresh.size} ${pork.loin.fresh.packageAmount}`,
                    `${getHalf(pork.loin.cured.amount)} ${pork.loin.cured.size} ${pork.loin.cured.packageAmount}`,
                    formatWeight(invoice.porkdata.curedloin)
                ], 
                [
                    "Butt",
                    `${getHalf(pork.butt.fresh.amount)} ${pork.butt.fresh.type} ${pork.butt.fresh.packageAmount}`,
                    `${getHalf(pork.butt.cured.amount)} ${pork.butt.cured.type} ${pork.butt.cured.packageAmount}`,
                    formatWeight(invoice.porkdata.curedbutt)
                ],
                [
                    "Picnic",
                    `${getHalf(pork.picnic.fresh.amount)} ${pork.picnic.fresh.type} ${pork.picnic.fresh.packageAmount}`,
                    `${getHalf(pork.picnic.cured.amount)} ${pork.picnic.cured.type} ${pork.picnic.cured.packageAmount}`,
                    formatWeight(invoice.porkdata.curedpicnic)
                ]
            ],
            tableHeaderStyle: 'background-color: #000; color: white; text-align: left',
            tableBodyStyle: 'border: 0.5px solid #ddd; text-align: left',
            style: "width: calc(100% - 50px); margin-left: 16px; margin-top: 15px"
        })
        data.push({
            type: "table",
            tableHeader: ["Part", "Instruction Given", "Weight"],
            tableBody: [
                [ "Sausage", pork.sausage, formatWeight(invoice.porkdata.sausage)],
                [ "Ribs", pork.rib, "..." ],
                [ "Head", pork.head, "..." ],
                [ "Feet", pork.feet, "..." ],
                [ "Heart", pork.heart, "..." ],
                [ "Fat", pork.fat, "..." ],
            ],
            tableHeaderStyle: 'background-color: #000; color: white; text-align: left',
            tableBodyStyle: 'border: 0.5px solid #ddd; text-align: left',
            style: "width: calc(100% - 50px); margin-left: 16px; margin-top: 15px"
        })
    }

    const makeCharge = (name: string, rate: number, unit: string, quantity: string, charge: number) => {
        return [ 
            name, 
            `$${rate.toFixed(2)} ${unit}`.trim(),
            quantity,
            `$${(charge ?? 0).toFixed(2)}`     
        ]
    }
    if(animal.animalType === AnimalType.Beef) {
        const price = invoice.priceData.beef
        const costs = invoice.beefprices
        const beefdata = invoice.beefdata
        data.push({
            type: "table",
            tableHeader: ["Charge Name", "Rate", "Quantity", "Charge"],
            tableBody: [
                makeCharge("Slaughter Fee", price.slaughter, "", "1 Slaughter", costs.slaughter),
                makeCharge("Processing Fee", price.processing, "per lbs of dress weight. (Min $200.00)", `${Math.round(animal.dressWeight * invoice.numQuaters / 4 * 100) / 100}lbs`, costs.processing),
                makeCharge("Split into halves", price.halves, "per half", invoice.numQuaters === 4 ? "N/A" : "1 Halving", costs.halving),
                makeCharge("Divide a half in half", price.halvesToQuaters, "per quater", invoice.numQuaters === 1 ? "2 Quaters" : "N/A", costs.quatering),
                makeCharge("Patties", price.patties, "per lbs", `${beefdata.patties ?? 0}lbs`, costs.patties),
                makeCharge("Cut Stew Meat", price.cutStewMeat, "per lbs", `${beefdata.stewmeat ?? 0}lbs`, costs.cutstewmeat),
                makeCharge("Bone and Tenderized", price.boneAndTenderizeRoundSteaks, "per half", beefdata.hasTenderized ? formatHalfs(invoice.numQuaters) : "N/A", costs.tenderized),
                makeCharge("Make Cubes Steaks", price.makeCubedSteaks, "per half", beefdata.makeCubedSteaks ? formatHalfs(invoice.numQuaters) : "N/A", costs.cubedsteaks),
                makeCharge("Bone Out Prime Rib", price.boneOutPrimeRib, "per half", beefdata.boneoutprimerib ? "Yes" : "No", costs.boneoutprimerib),
                makeCharge("Bone Out Loin", price.boneOutLoin, "per half", beefdata.boneoutloin ? "Yes" : "No", costs.boneoutloin),
                ...invoice.customcharges.map(c => [ c.name, "---", "---", `$${c.amount.toFixed(2)}` ])
            ],
            tableHeaderStyle: 'background-color: #000; color: white; text-align: left',
            tableBodyStyle: 'border: 0.5px solid #ddd; text-align: left',
            style: "width: calc(100% - 50px); margin-left: 16px; margin-top: 15px"
        })
    } else {
        const price = invoice.priceData.pork
        const costs = invoice.porkprices
        const porkdata = invoice.porkdata
        data.push({
            type: "table",
            tableHeader: ["Charge Name", "Rate", "Quantity", "Charge"],
            tableBody: [
                makeCharge(`Slaughter Fee (${porkdata.over350lbs ? "Over 350lbs" : "Under 350lbs"})`, price.slaughter, "", "1 Slaughter", costs.slaughter),
                makeCharge("Processing Fee", price.processing, "per lbs of dress weight", `${Math.round(animal.dressWeight * invoice.numQuaters / 4 * 100) / 100}lbs`, costs.processing),
                makeCharge("Curing Fee", price.cure, "per lbs of cured pork", `${porkdata.totalcured}lbs`, costs.cured),
                makeCharge("Sausage Fee", price.sausage, "per lbs of sausage", `${porkdata.sausage}lbs`, costs.sausage),
                ...invoice.customcharges.map(c => [ c.name, "---", "---", `$${c.amount.toFixed(2)}` ])
            ],
            tableHeaderStyle: 'background-color: #000; color: white; text-align: left',
            tableBodyStyle: 'border: 0.5px solid #ddd; text-align: left',
            style: "width: calc(100% - 50px); margin-left: 16px; margin-top: 15px"
        })
    }

    const { total, calcualtedTotal } = calculateTotal(animal, invoice)
    const amountPayed = invoice.paymentTypes.map(t => t.amount).reduce((a, b) => a + b, 0)

    const subTotal = calculateSubTotal(animal, invoice)

    const formatPaymentMethod = (type: PaymentType) => {
        switch(type.type) {
            case "card":
                return `Card (####-####-####-${type.additionalData || "????"}) $${type.amount.toFixed(2)}`
            case "cash":
                return `Cash $${type.amount.toFixed(2)}`
            case "check":
                return `Check (#${type.additionalData || "?????"}) $${type.amount.toFixed(2)}`
        }
    }

    const charges = invoice.customcharges ?? []
    const payments = invoice.paymentTypes ?? []

    let chargeCounter = total
    let paymentCounter = subTotal
    data.push({
        type: "text",
        value: `
            <div style="margin-left: 50%; margin-top: 10px">
                <div style="display: flex; flex-direction: row;">
                    <span style="flex-grow: 1">Calculated Cost:</span>
                    <span>$${calcualtedTotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; flex-direction: row; margin:">
                    <span style="flex-grow: 1">Post Min:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                ${ charges.length === 0 ? "" : 
                `
                <div style="display: flex; flex-direction: row; border-top: solid 1px black">
                    <div style="flex-grow: 1">Custom Cost${charges.length === 1 ? "" : "s"}:</div>
                    <div style="flex-grow: 1;">
                        ${charges.map(charge => `
                            <div style="display: flex; flex-direction: row">
                                <span style="flex-grow: 1">${charge.name} ($${charge.amount.toFixed(2)}):</span>
                                <span>$${(chargeCounter+=charge.amount).toFixed(2)}</span>
                            </div>  
                        `).join("")}
                    </div>
                </div>
                `
                }
                <div style="display: flex; flex-direction: row; border-top: solid 1px black">
                    <span style="flex-grow: 1">Total:</span>
                    <span>$${subTotal.toFixed(2)}</span>
                </div>
                ${ payments.length === 0 ? "" : 
                `
                <div style="display: flex; flex-direction: row; border-top: solid 1px black">
                    <div style="flex-grow: 1">Payment${payments.length === 1 ? "" : "s"}:</div>
                    <div style="flex-grow: 1;">
                        ${payments.map(payment => `
                            <div style="display: flex; flex-direction: row">
                                <span style="flex-grow: 1">${formatPaymentMethod(payment)}</span>
                                <span>$${(paymentCounter-=payment.amount).toFixed(2)}</span>
                            </div>  
                        `).join("")}
                    </div>
                </div>
                `
                }
                <div style="display: flex; flex-direction: row;">
                    <span style="flex-grow: 1">Remaining Amount:</span>
                    <span>$${(subTotal - amountPayed).toFixed(2)}</span>
                </div>
            </div>
        `
    })


    setModal(printGenericSheet, {
      title: "Print Invoice",
      data
    })
}

const logoImgString = `<img width="120px" src="data:image/png;base64,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" alt="" />`