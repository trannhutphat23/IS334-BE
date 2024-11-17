const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        items: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                },
                size: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true
                },
                discount: {
                    type: Number,
                    required: true
                },
            }
        ],
        // tien truoc, tinh % sau
        voucher: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Voucher',
            }
        ],
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
            enum: ['pending', 'confirmed', 'systemCancel', 'customerCancel', 'doing', 'shipping', 'success', 'fail'],
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);