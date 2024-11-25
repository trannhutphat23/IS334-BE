const productModel = require('../models/product.model')
const userModel = require('../models/user.model')
const getData = require('../utils/formatRes')
const cartModel = require('../models/cart.model')

class CartService {
    static addCart = async () => {
        try {
            const newCart = new cartModel({
            })

            const savedCart = await newCart.save()

            return savedCart.id
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getAllCart = async () => {
        try {
            const carts = await cartModel.find({}).populate({
                path: "userId",
                select: '_id name email address phone'
            }).populate('items.product')

            return carts
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getCartById = async ({ id }) => {
        try {
            const cart = await cartModel.findById(id).populate({
                path: "userId",
                select: '_id name email address phone'
            }).populate('items.product')

            if (!cart) {
                return {
                    success: false,
                    message: "wrong cart"
                }
            }

            return cart
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getCartByUserId = async ({ userId }) => {
        try {
            const cart = await cartModel.findOne({ userId: userId }).populate({
                path: "userId",
                select: '_id name email address phone'
            }).populate('items.product')

            if (!cart) {
                return {
                    success: false,
                    message: "wrong cart"
                }
            }

            return cart
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static addItemCart = async ({ userId, productId, size, quantity, note }) => {
        try {
            const product = await productModel.findById(productId)

            const user = await userModel.findById(userId)

            if (!user) {
                return {
                    success: false,
                    message: "wrong user"
                }
            }

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            if (!product.type.some(p => p.size == size)) {
                return {
                    success: false,
                    message: "wrong size"
                }
            }

            let cart = await cartModel.findOne({ userId: userId })

            if (!cart) {
                const newCart = new cartModel({
                    userId,
                })

                const savedCart = await newCart.save()
            }

            cart = await cartModel.findOne({ userId: userId })

            if (cart.items.some((item) => item.product == productId) && cart.items.some((item) => item.size == size)) {
                cart.items.forEach(item => {
                    if (item.product == productId && item.size == size) {
                        item.quantity += quantity
                        if(note){item.note = note}
                        product.type.forEach(p => {
                            if (p.size == size) {
                                item.price = p.price
                                item.discount = product.discount
                            }
                        })
                    }
                })

                await cart.save()

                return cart
            }
            else {
                product.type.forEach(p => {
                    if (p.size == size) {
                        cart.items.push({
                            "product": productId,
                            quantity,
                            size,
                            "price": p.price,
                            "discount": product.discount,
                            "note": note
                        })
                    }
                })

                await cart.save()

                return cart
            }

        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteItemCart = async ({ userId, productId, size, quantity }) => {
        try {
            const user = await userModel.findById(userId)
            const product = await productModel.findById(productId)

            if (!user) {
                return {
                    success: false,
                    message: "wrong user"
                }
            }

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            if (!product.type.some(p => p.size == size)) {
                return {
                    success: false,
                    message: "wrong size"
                }
            }

            const cart = await cartModel.findOne({ userId: userId })

            if (quantity) {
                if (cart.items.some((item) => item.product == productId) && cart.items.some((item) => item.size == size)) {
                    cart.items.forEach(item => {
                        if (item.product == productId && item.size == size) {
                            if (item.quantity > quantity) {
                                if(note){item.note = note}
                                item.quantity -= quantity
                            }
                        }
                    })

                    await cart.save()

                    return cart
                }
                else {
                    return {
                        success: false,
                        message: "product not found in cart"
                    }
                }
            }
            else {
                if (cart.items.some((item) => item.product == productId) && cart.items.some((item) => item.size == size)) {
                    cart.items.forEach((item, index) => {
                        if (item.product == productId && item.size == size) {
                            cart.items.splice(index, 1)
                        }
                    })

                    await cart.save()

                    return cart
                }
                else {
                    return {
                        success: false,
                        message: "product not found in cart"
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

    static addItemCartNoLogin = async ({ cartId, productId, size, quantity,note }) => {
        try {
            const product = await productModel.findById(productId)

            const cart = await cartModel.findById(cartId)

            if (!cart) {
                return {
                    success: false,
                    message: "wrong cart"
                }
            }

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            if (!product.type.some(p => p.size == size)) {
                return {
                    success: false,
                    message: "wrong size"
                }
            }

            if (cart.items.some((item) => item.product == productId) && cart.items.some((item) => item.size == size)) {
                cart.items.forEach(item => {
                    if (item.product == productId && item.size == size) {
                        item.quantity += quantity
                        product.type.forEach(p => {
                            if (p.size == size) {
                                item.price = p.price
                                item.discount = product.discount
                            }
                        })
                    }
                })

                await cart.save()

                return cart
            }
            else {
                product.type.forEach(p => {
                    if (p.size == size) {
                        cart.items.push({
                            "product": productId,
                            quantity,
                            size,
                            "price": p.price,
                            "discount": product.discount,
                            note
                        })
                    }
                })

                await cart.save()

                return cart
            }

        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteItemCartNoLogin = async ({ cartId, productId, size, quantity }) => {
        try {
            const cart = await cartModel.findById(cartId)

            const product = await productModel.findById(productId)

            if (!cart) {
                return {
                    success: false,
                    message: "wrong cart"
                }
            }

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            if (!product.type.some(p => p.size == size)) {
                return {
                    success: false,
                    message: "wrong size"
                }
            }

            if (quantity) {
                if (cart.items.some((item) => item.product == productId) && cart.items.some((item) => item.size == size)) {
                    cart.items.forEach(item => {
                        if (item.product == productId && item.size == size) {
                            if (item.quantity > quantity) {
                                item.quantity -= quantity
                            }
                        }
                    })

                    await cart.save()

                    return cart
                }
                else {
                    return {
                        success: false,
                        message: "product not found in cart"
                    }
                }
            }
            else {
                if (cart.items.some((item) => item.product == productId) && cart.items.some((item) => item.size == size)) {
                    cart.items.forEach((item, index) => {
                        if (item.product == productId && item.size == size) {
                            cart.items.splice(index, 1)
                        }
                    })

                    await cart.save()

                    return cart
                }
                else {
                    return {
                        success: false,
                        message: "product not found in cart"
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

module.exports = CartService;