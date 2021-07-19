import mongoose, { Schema, Document } from 'mongoose';
import { ObjectId } from 'bson'

import { createResultWatcher } from '../Database';
import { animalDatabaseName, invoiceDatabaseName, userDatabaseName } from '../DatabaseNames';
import { IAnimal } from './Animal';
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

    dateTimePaid?: Date,
    
    beefData: {
        roundTenderizedAmount: number
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

    dateTimePaid: { type: Schema.Types.Date },

    beefData: { type: {
        roundTenderizedAmount: { type: Number, required: true },
    }},
});

const Invoice = mongoose.model<IInvoice>(invoiceDatabaseName, invoiceSchema)

export const generateInvoice = (animal: IAnimal, primaryUser: IUser, secondaryUser: IUser | undefined, priceData: PriceDataNumbers, cutInstructionId: number, cutInstruction: CutInstructions, id: number, half: boolean) => {
    const invoice = new Invoice({
        invoiceId: id,
        user: new ObjectId(primaryUser.id),
        secondaryUser: secondaryUser === undefined ? undefined : new ObjectId(secondaryUser.id),
        cutInstructionId: cutInstructionId,
        cutInstruction: cutInstruction,
        priceData: priceData,
        animal: new ObjectId(animal.id),
        half: half,

        beefData: {
            roundTenderizedAmount: 0
        }
    })
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

export const useInvoice = createResultWatcher(Invoice)
export default Invoice