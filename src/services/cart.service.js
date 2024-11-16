const CartModel = require('../models/cart.model')
const UserModel = require('../models/user.model')
const ProductModel = require('../models/product.model')
const userModel = require('../models/user.model')
const getData = require('../utils/formatRes')
const {InternalServerError, BadRequestError, ConflictRequestError} = require('../utils/error.response')

class CartService {
    static getAllCart = async () => {
        try {
            const carts = await CartModel.find({}).populate({
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

    static getCartByUserId = async ({ userId }) => {
        try {
            const cart = await CartModel.findOne({ userId: userId }).populate({
                path: "userId",
                select: '_id name email address phone'
            }).populate('items.product')

            if (!cart) {
                return new BadRequestError('Wrong cart', 400)
            }

            return cart
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static addItemCart = async ({ userId, productId, size, quantity }) => {
        try {
            const user = await UserModel.findById(userId)
            const product = await ProductModel.findById(productId)

            if (!user) {
                return new BadRequestError('Wrong user', 400)
            }

            if (!product) {
                return new BadRequestError('Wrong product', 400)
            }

            if (!product.type.some(p => p.size == size)) {
                return new BadRequestError('Wrong size', 400)
            }

            let cart = await CartModel.findOne({ userId: userId })

            if (!cart) {
                const newCart = new CartModel({
                    userId,
                })

                const savedCart = await newCart.save()
            }

            cart = await CartModel.findOne({ userId: userId })

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
                            "discount": product.discount
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
            const product = await ProductModel.findById(productId)

            if (!user) {
                return new BadRequestError('Wrong user', 400)
            }

            if (!product) {
                return new BadRequestError('Wrong product', 400)
            }

            if (!product.type.some(p => p.size == size)) {
                return new BadRequestError('Wrong size', 400)
            }

            const cart = await CartModel.findOne({ userId: userId })

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
                    return new BadRequestError('Product not found in cart', 400)
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
                    return new BadRequestError('Product not found in cart', 400)
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