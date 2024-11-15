const Vouchers = require('../models/voucher.model')

class VouchersService {
    static addVoucher = async ({ name, conditionText, conditionValue, percent, quantity, date }) => {
        try {
            const isExist = await Vouchers.findOne({ name }).lean();
            if (isExist) {
                return {
                    success: false,
                    message: "Already exist"
                }
            }

            const newVoucher = new Vouchers({
                name, conditionText, conditionValue, percent, quantity, date
            })
            return await newVoucher.save()
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getVoucher = async () => {
        try {
            return await Vouchers.find()
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getVoucherID = async ({ id }) => {
        try {
            return await Vouchers.findById(id)
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getVoucherByName = async ({name}) => {
        try {
            const existVoucher = await Vouchers.findOne({name: name})
            if (!existVoucher) {
                return {
                    success: false,
                    message: "Voucher don't exist"
                }
            }

            return existVoucher
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static updateVoucher = async ({ id }, { name, conditionText, conditionValue, percent, quantity, date }) => {
        try {
            return await Vouchers.findByIdAndUpdate(id, { name, conditionText, conditionValue, percent, quantity, date })
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteVoucher = async ({ id }) => {
        try {
            return await Vouchers.findByIdAndDelete(id)
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

}

module.exports = VouchersService