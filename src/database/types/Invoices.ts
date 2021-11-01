import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'bson'

import { createResultWatcher } from '../Database';
import { animalDatabaseName, invoiceDatabaseName, userDatabaseName } from '../DatabaseNames';
import { AnimalType, IAnimal } from './Animal';
import { CutInstructions, CutInstructionsSchema, IUser } from './User';
import { PriceData, PriceDataNumbers, PriceDataSchema } from './Configs';

export const BeefPricesList: (keyof IInvoice['beefprices'])[] = [
    "slaughter", "processing", "halving", "quatering", "tenderized", "patties",
    "cutstewmeat", "extraboning", "cubedsteaks", "boneoutprimerib", "boneoutloin",
]

export const PorkPricesList: (keyof IInvoice['porkprices'])[] = ["slaughter", "processing", "cured", "sausage",]

export const AllCuredPorkDataPieces = ["curedham", "curedbacon", "curedjowl", "curedloin", "curedbutt", "curedpicnic",] as const

export type PaymentType = {
    type: "check" | "card" | "cash";
    amount: number;
    additionalData?: string;
}

export interface IInvoice extends Document {
    invoiceId: number,
    user: ObjectId,
    cutInstructionUser: ObjectId,
    cutInstructionId: number,
    cutInstruction: CutInstructions,
    priceData: PriceDataNumbers
    animal: ObjectId,
    numQuaters: number,

    takeHomeWeight: number,

    beefdata?: {
        makeCubedSteaks: boolean
        hasTenderized: boolean
        tenderizedAmount?: number
        stewmeat?: number,
        patties?: number,
        boneoutprimerib: boolean
        boneoutloin: boolean
    }
    beefprices?: {
        slaughter?: number
        processing?: number
        halving?: number
        quatering?: number
        tenderized?: number
        patties?: number
        cutstewmeat?: number
        extraboning?: number
        cubedsteaks?: number
        boneoutprimerib?: number
        boneoutloin?: number
    }

    porkdata?: {
        over350lbs: boolean
        totalcured: number
        sausage?: number
        curedham?: number
        curedbacon?: number
        curedjowl?: number
        curedloin?: number
        curedbutt?: number
        curedpicnic?: number
    }
    porkprices?: {
        slaughter?: number
        processing?: number
        cured?: number
        sausage?: number
    }

    customcharges: {
        name: string,
        amount: number
    }[]

    dateTimePaid?: Date,
    markedAsPaid: boolean,
    paymentTypes: PaymentType[]
}

const invoiceSchema = new Schema({
    invoiceId: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: userDatabaseName, required: true },
    cutInstructionUser: { type: Schema.Types.ObjectId, ref: userDatabaseName },
    cutInstructionId: { type: Number, required: true },
    cutInstruction: { type: CutInstructionsSchema, required: true },
    priceData: { type: PriceDataSchema, required: true },
    animal: { type: Schema.Types.ObjectId, ref: animalDatabaseName, required: true },
    numQuaters: { type: Number, required: true },

    takeHomeWeight: { type: Number },

    beefdata: {
        type: {
            makeCubedSteaks: { type: Boolean, required: true },
            hasTenderized: { type: Boolean, required: true },
            tenderizedAmount: { type: Number },
            stewmeat: { type: Number },
            patties: { type: Number },
            boneoutprimerib: { type: Boolean, required: true },
            boneoutloin: { type: Boolean, required: true },
        }
    },
    beefprices: {
        type: {
            slaughter: { type: Number },
            processing: { type: Number },
            halving: { type: Number },
            quatering: { type: Number },
            tenderized: { type: Number },
            patties: { type: Number },
            cutstewmeat: { type: Number },
            cubedsteaks: { type: Number },
            boneoutprimerib: { type: Number },
            boneoutloin: { type: Number },
        }
    },

    porkdata: {
        type: {
            over350lbs: { type: Boolean, required: true },
            totalcured: { type: Number, required: true },
            sausage: { type: Number },
            curedham: { type: Number },
            curedbacon: { type: Number },
            curedjowl: { type: Number },
            curedloin: { type: Number },
            curedbutt: { type: Number },
            curedpicnic: { type: Number },
        }
    },
    porkprices: {
        type: {
            slaughter: { type: Number },
            processing: { type: Number },
            cured: { type: Number },
            sausage: { type: Number }
        }
    },

    customcharges: {
        type: [{
            name: { type: String },
            amount: { type: Number }
        }]
    },

    dateTimePaid: { type: Schema.Types.Date },
    markedAsPaid: { type: Boolean },
    paymentTypes: {
        type: [{
            type: { type: String, enum: ["check", "card", "cash"] },
            amount: { type: Number },
            additionalData: { type: String },
        }]
    },
});

const Invoice = mongoose.model<IInvoice>(invoiceDatabaseName, invoiceSchema)

export const generateInvoice = (animal: IAnimal, user: IUser, priceData: PriceDataNumbers, cutInstructionUser: IUser, cutInstructionId: number, cutInstruction: CutInstructions, id: number, numQuaters) => {
    const numWhole = numQuaters / 4
    const numHalves = numQuaters / 2

    const invoice = new Invoice({
        invoiceId: id,
        user: new ObjectId(user.id),
        cutInstructionUser: new ObjectId(cutInstructionUser.id),
        cutInstructionId: cutInstructionId,
        cutInstruction: cutInstruction,
        priceData: priceData,
        animal: new ObjectId(animal.id),
        numQuaters: numQuaters,

        customcharges: [],

        markedAsPaid: false,
        paymentTypes: [],
    })



    if (cutInstruction.cutType === AnimalType.Beef) {
        invoice.beefdata = {
            makeCubedSteaks: cutInstruction.round.size.toLowerCase() == "chicken fry" || cutInstruction.sirlointip.size.toLowerCase() == "chicken fry" || cutInstruction.flank.toLowerCase() == "chicken fry",
            hasTenderized: false,
            boneoutprimerib: cutInstruction.club.bone.toLowerCase() == "ribeye",
            boneoutloin: cutInstruction.tbone.bone.toLowerCase() == "bone out",
        }
        invoice.beefprices = {}

        invoice.beefprices.processing = Math.max(animal.dressWeight * priceData.beef.processing, 200) * numWhole
        invoice.beefprices.slaughter = priceData.beef.slaughter * numWhole
        if (invoice.numQuaters !== 4) {
            invoice.beefprices.halving = priceData.beef.halves * numHalves
        }
        if (numQuaters === 1) {
            invoice.beefprices.quatering = numQuaters * priceData.beef.halvesToQuaters
        }
        if (cutInstruction.round.tenderized.toLowerCase() == "tenderized") {
            runIfGroup(
                cutInstruction.round.keepAmount, /(\d+.?\d+?)%/,
                amount => {
                    const val = parseFloat(amount)
                    invoice.beefdata.tenderizedAmount = val
                    invoice.beefprices.tenderized = priceData.beef.boneAndTenderizeRoundSteaks * (val / 100) * numHalves
                    invoice.beefdata.hasTenderized = true;
                }
            )
        }
        if (invoice.beefdata.makeCubedSteaks) {
            invoice.beefprices.cubedsteaks = numHalves * priceData.beef.makeCubedSteaks
        }

        if (invoice.beefdata.boneoutprimerib) {
            invoice.beefprices.boneoutprimerib = priceData.beef.boneOutPrimeRib * numHalves
        }
        if (invoice.beefdata.boneoutloin) {
            invoice.beefprices.boneoutloin = priceData.beef.boneOutLoin * numHalves
        }
    } else {
        invoice.porkdata = {
            over350lbs: animal.liveWeight >= 350,
            totalcured: 0,
            sausage: 0
        }

        invoice.porkprices = {
            processing: animal.dressWeight * priceData.pork.processing * numWhole,
            slaughter: (invoice.porkdata.over350lbs ? priceData.pork.slaughterOver150lb : priceData.pork.slaughter) * numWhole
        }


    }

    animal.invoices.push(invoice.id)
    user.invoices.push(invoice.id)

    invoice.save()
}

const runIfGroup = (val: string, regex: RegExp, onPresent: (val: string) => void) => {
    const res = val.match(regex)
    if (res === null) {
        return null
    }
    onPresent(res[1])
}

export const useInvoice = createResultWatcher(Invoice)
export default Invoice