const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema(
    {
        cartId: {
            type: Schema.Types.ObjectId,
            ref: 'Cart',
        },
        // tien truoc, tinh % sau
        voucher: {
            type: Schema.Types.ObjectId,
            ref: 'Voucher',
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        deliveryStatus: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);