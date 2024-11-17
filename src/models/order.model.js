const mongoose = require('mongoose');
const userModel = require('./user.model');
const Schema = mongoose.Schema;
const voucherService = require('../services/voucher.service')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

const orderSchema = new Schema(
    {
        user: {
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
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'unpaid'],
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['momo', 'cod'],
            required: true,
        },
        deliveryStatus: {
            type: String,
            required: true,
            enum: ['pending', 'confirmed','systemCancel','customerCancel','doing', 'shipping', 'success','fail'],
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

orderSchema.pre('save', async function (next) {
    this.total = this.items.reduce((total, item) => {
        return total + (item.price - item.price*item.discount/100) * item.quantity;
    }, 0);

    const totalPrice = this.total

    if (this.user) {
        for (const item of this.voucher) {
            let check = await voucherService.checkVoucher(item, this.user)
            let {value, type} = (check.success) ? check.voucher : {}

            if (type === 'chain'){
                let res = await voucherService.confirmVoucher(item, this.user)
                if (!res.success) {
                    return next(res)
                }
                let {value, type} = (res.success) ? res.voucher : {}
                
                if (this.total - value < totalPrice*0.5) {
                    break
                }
                this.total -= value
            }
        }

        for (const item of this.voucher) {
            let check = await voucherService.checkVoucher(item, this.user)
            let {value, type} = (check.success) ? check.voucher : {}

            if (type === 'trade'){
                let res = await voucherService.confirmVoucher(item, this.user)
                let {value, type} = (res.success) ? res.voucher : {}
                if (this.total - (this.total*value)/100 < totalPrice*0.5) {
                    break
                }
                this.total -= (this.total*value)/100
            }
        }
    }

    next();
});

module.exports = mongoose.model(DOCUMENT_NAME, orderSchema);