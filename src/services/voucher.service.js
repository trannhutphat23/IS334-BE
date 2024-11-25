const voucherModel = require('../models/voucher.model');
const userModel = require('../models/user.model');
const { InternalServerError, BadRequestError, ConflictRequestError } = require('../utils/error.response')

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
                name, startDay, endDay, type, value, "customerUsed": []
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
            return await voucherModel.find().populate({
                path: "customerUsed",
                select: '_id name email address phone'
            })
        } catch (error) {
            throw new InternalServerError(error.message)
        }
    }

    // [GET]/v1/api/user/vouchers/:id
    static getVoucherID = async ({ id }) => {
        try {
            const voucher = await voucherModel.findById(id).populate({
                path: "customerUsed",
                select: '_id name email address phone'
            })
            if (!voucher) {
                return new ConflictRequestError(`Voucher doesn't exist`)
            }

            return voucher
        } catch (error) {
            throw new InternalServerError(error.message)
        }
    }

    // [PUT]/v1/api/user/vouchers/:id
    static updateVoucher = async ({ id }, { name, startDay, endDay, type, value }) => {
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

    static confirmVoucher = async (id, userId) => {
        try {
            const user = await userModel.findById(userId)

            if (!user) {
                return {
                    success: false,
                    message: "wrong user"
                }
            }

            const voucher = await voucherModel.findById(id)

            if (voucher) {
                const currentTime = new Date().getTime()

                if (voucher.startDay.getTime() <= currentTime && voucher.endDay.getTime() >= currentTime) {

                    if (voucher.customerUsed.some(user => user.toString() == userId.toString())) {
                        return {
                            success: false,
                            message: "voucher can only be used once"
                        }
                    }
                    else {

                        voucher.customerUsed.push(userId)

                        await voucher.save()

                        return {
                            success: true,
                            message: "used successfully",
                            voucher: {
                                type: voucher.type,
                                value: voucher.value
                            }
                        }
                    }
                }
                else {
                    if (voucher.startDay.getTime() > currentTime) {
                        return {
                            success: false,
                            message: "voucher cannot be used yet"
                        }
                    }

                    if (voucher.endDay.getTime() < currentTime) {
                        return {
                            success: false,
                            message: "voucher expires"
                        }
                    }
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static checkVoucher = async (id, userId) => {
        try {
            const user = await userModel.findById(userId)

            if (!user) {
                return {
                    success: false,
                    message: "wrong user"
                }
            }

            const voucher = await voucherModel.findById(id)

            if (voucher) {
                const currentTime = new Date().getTime()

                if (voucher.startDay.getTime() <= currentTime && voucher.endDay.getTime() >= currentTime) {
                    if (voucher.customerUsed.some(user => user.toString() == userId.toString())) {
                        return {
                            success: false,
                            message: "voucher can only be used once"
                        }
                    }
                    else {
                        return {
                            voucher: {
                                type: voucher.type,
                                value: voucher.value
                            }
                        }
                    }
                }
                else {
                    if (voucher.startDay.getTime() > currentTime) {
                        return {
                            success: false,
                            message: "voucher cannot be used yet"
                        }
                    }

                    if (voucher.endDay.getTime() < currentTime) {
                        return {
                            success: false,
                            message: "voucher expires"
                        }
                    }
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static checkStatusVoucher = async ({id}) => {
        try {
            const voucher = await voucherModel.findById(id)

            if (voucher) {
                const currentTime = new Date().getTime()

                if (voucher.startDay.getTime() <= currentTime && voucher.endDay.getTime() >= currentTime) {
                    return {
                        voucher: {
                            success: true,
                            message: "available"
                        }
                    }
                }
                else {
                    if (voucher.startDay.getTime() > currentTime) {
                        return {
                            success: false,
                            message: "pending"
                        }
                    }

                    if (voucher.endDay.getTime() < currentTime) {
                        return {
                            success: false,
                            message: "expire"
                        }
                    }
                }
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }
}

module.exports = VouchersService