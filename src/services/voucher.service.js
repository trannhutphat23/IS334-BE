const voucherModel = require('../models/voucher.model')
const {InternalServerError, BadRequestError, ConflictRequestError} = require('../utils/error.response')

class VouchersService {
    // [POST]/v1/api/user/vouchers
    static addVoucher = async ({ name, startDay, endDay, type, value }) => {
        try {
            const isExist = await voucherModel.findOne({ name }).lean();
            if (isExist) {
                return new ConflictRequestError('Already exist')
            }

            [startDay, endDay] = [new Date(startDay), new Date(endDay)]
            if (startDay > endDay) {
                return new BadRequestError('Start date must be before end date')
            }

            const newVoucher = new voucherModel({
                name, startDay, endDay, type, value
            })
            
            return await newVoucher.save()
        } catch (error) {
            // Validation error "type"
            if (error.name === 'ValidationError') {
                return new BadRequestError('Invalid input for type')
            }

            throw new InternalServerError(error.message)
        }
    }

    // [GET]/v1/api/user/vouchers
    static getVoucher = async () => {
        try {
            return await voucherModel.find()
        } catch (error) {
            throw new InternalServerError(error.message)
        }
    }

    // [GET]/v1/api/user/vouchers/:id
    static getVoucherID = async ({ id }) => {
        try {
            const voucher = await voucherModel.findById(id)
            if (!voucher) {
                return new ConflictRequestError(`Voucher doesn't exist`)
            }

            return voucher
        } catch (error) {
            throw new InternalServerError(error.message)
        }
    }

    // [PUT]/v1/api/user/vouchers/:id
    static updateVoucher = async ({id} , { name, startDay, endDay, type, value }) => {
        try {
            [startDay, endDay] = [new Date(startDay), new Date(endDay)]
            if (startDay > endDay) {
                return new BadRequestError('Start date must be before end date')
            }

            const voucher = await voucherModel.findByIdAndUpdate(id, { name, startDay, endDay, type, value }, {
                new: true,
                runValidators: true
            })

            if (!voucher) {
                return new ConflictRequestError(`Voucher doesn't exist`)
            }

            return voucher
        } catch (error) {
            // duplicate key error
            if (error.code === 11000) {
                return new ConflictRequestError('Voucher name already exists')
            }

            throw new InternalServerError(error.message)
        }
    }

    // [DEL]/v1/api/user/vouchers/:id
    static deleteVoucher = async ({ id }) => {
        try {
            const voucher = await voucherModel.findByIdAndDelete(id)
            if (!voucher) {
                return new ConflictRequestError(`Voucher doesn't exist`)
            }

            return {
                success: true,
                message: 'Voucher deleted successfully'
            }
        } catch (error) {
            // duplicate key error
            if (error.code === 11000) {
                return new ConflictRequestError('Voucher name already exists')
            }

            throw new InternalServerError(error.message)
        }
    }

}

module.exports = VouchersService