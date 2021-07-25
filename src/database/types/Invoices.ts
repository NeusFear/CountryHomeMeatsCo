import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'bson'

import { createResultWatcher } from '../Database';
import { animalDatabaseName, invoiceDatabaseName, userDatabaseName } from '../DatabaseNames';
import { AnimalType, IAnimal } from './Animal';
import { CutInstructions, CutInstructionsSchema, IUser } from './User';
import { PriceData, PriceDataNumbers, PriceDataSchema } from './Configs';


export interface IInvoice extends Document {
    invoiceId: number,
    user: ObjectId,
    secondaryUser?: ObjectId,
    cutInstructionId: number,
    cutInstruction: CutInstructions,
    priceData: PriceDataNumbers
    animal: ObjectId,
    half: boolean,
    numQuaters: number,

    dateTimePaid?: Date,
    
    beefdata?: {
        makeCubedSteaks: boolean
        hasTenderized: boolean
        stewmeat?: number,
        patties?: number,
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
        boneoutrimerib?: number
        boneoutloin?: number
    }
}

const invoiceSchema = new Schema({
    invoiceId: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: userDatabaseName, required: true },
    secondaryUser: { type: Schema.Types.ObjectId, ref: userDatabaseName },
    cutInstructionId: { type: Number, required: true },
    cutInstruction: { type: CutInstructionsSchema, required: true },
    priceData: { type: PriceDataSchema, required: true },
    animal: { type: Schema.Types.ObjectId, ref: animalDatabaseName, required: true },
    half: { type: Boolean, required: true },
    numQuaters: { type: Number, required: true },

    dateTimePaid: { type: Schema.Types.Date },

    beefdata: { type: {
        makeCubedSteaks: { type: Boolean, required: true },
        hasTenderized: { type: Boolean, required: true },
        stewmeat: { type: Number },
        patties: { type: Number },
    }},

    beefprices: { type: {
        slaughter: { type: Number },
        processing: { type: Number },
        halving: { type: Number },
        quatering: { type: Number },
        tenderized: { type: Number },
        patties: { type: Number },
        cutstewmeat: { type: Number },
        cubedsteaks: { type: Number },
        boneoutrimerib: { type: Number },
        boneoutloin: { type: Number },
    }},
});

const Invoice = mongoose.model<IInvoice>(invoiceDatabaseName, invoiceSchema)

export const generateInvoice = (animal: IAnimal, primaryUser: IUser, secondaryUser: IUser | undefined, priceData: PriceDataNumbers, cutInstructionId: number, cutInstruction: CutInstructions, id: number, half: boolean) => {
    let numQuaters: number
    const numHalves = half ? 1 : 2;
    if(half) {
        numQuaters = secondaryUser !== undefined ? 1 : 2
    } else {
        numQuaters = 4
    }

    
    const invoice = new Invoice({
        invoiceId: id,
        user: new ObjectId(primaryUser.id),
        secondaryUser: secondaryUser === undefined ? undefined : new ObjectId(secondaryUser.id),
        cutInstructionId: cutInstructionId,
        cutInstruction: cutInstruction,
        priceData: priceData,
        animal: new ObjectId(animal.id),
        half: half,
        numQuaters: numQuaters
    })

    

    if(cutInstruction.cutType === AnimalType.Beef) {
        invoice.beefdata = {
            makeCubedSteaks: cutInstruction.round.size.toLowerCase() == "chicken fry" || cutInstruction.sirlointip.size.toLowerCase() == "chicken fry" || cutInstruction.flank.toLowerCase() == "chicken fry",
            hasTenderized: false
        }
        invoice.beefprices = {}

        invoice.beefprices.processing = Math.max(animal.dressWeight * priceData.beef.processing, 200)
        invoice.beefprices.slaughter = priceData.beef.slaughter
        if(invoice.half) {
            invoice.beefprices.halving = priceData.beef.halves
        }
        if(invoice.secondaryUser) {
            invoice.beefprices.quatering = numQuaters * priceData.beef.halvesToQuaters
        }
        runIfGroup(
            cutInstruction.round.tenderizedAmount, /(\d+.?\d+?)%/,
            amount => {
                invoice.beefprices.tenderized = priceData.beef.boneAndTenderizeRoundSteaks * (parseFloat(amount) / 100) * numHalves
                invoice.beefdata.hasTenderized = true;
            }
        )
        if(invoice.beefdata.makeCubedSteaks) {
            invoice.beefprices.cubedsteaks = numHalves * priceData.beef.makeCubedSteaks
        }
    }

    animal.invoices.push(invoice.id)
    animal.save()
    primaryUser.invoices.push(invoice.id)
    primaryUser.save()
    if(secondaryUser !== undefined) {
        secondaryUser.invoices.push(invoice.id)
        secondaryUser.save()
    }

    invoice.save()
}

const runIfGroup = (val: string, regex: RegExp, onPresent: (val: string) => void) => {
    const res = val.match(regex)
    if(res === null) {
        return null
    }
    onPresent(res[0])
}

export const useInvoice = createResultWatcher(Invoice)
export default Invoice