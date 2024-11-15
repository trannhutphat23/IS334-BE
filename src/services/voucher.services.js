const voucherModel = require('../models/voucher.model')
const {InternalServerError, BadRequestError, ConflictRequestError} = require('../utils/error.response')

class VouchersService {
    static addVoucher = async ({ name, startDay, endDay, type, value }) => {
        try {
            const isExist = await Vouchers.findOne({ name }).lean();
            if (isExist) {
                return new BadRequestError('Already exist')
            }

            const newVoucher = new Vouchers({
                name, startDay, endDay, type, value
            })
            
            return await newVoucher.save()
        } catch (error) {
            throw new InternalServerError(error.message)
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