const CartModel = require('../models/cart.model')
const UserModel = require('../models/user.model')
const ProductModel = require('../models/product.model')
const userModel = require('../models/user.model')
const getData = require('../utils/formatRes')

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

    static getCartById = async ({ id }) => {
        try {
            const cart = await CartModel.findById(id).populate({
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
            const cart = await CartModel.findOne({ userId: userId }).populate({
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

    static addItemCart = async ({ userId, productId, size, quantity }) => {
        try {
            const product = await ProductModel.findById(productId)
            
            if(userId){

                const user = await UserModel.findById(userId)
                
                if (!user) {
                    return {
                        success: false,
                        message: "wrong user"
                    }
                }
            }
            else{
                userId = ""
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

            if(userId){
                let cart = await CartModel.findOne({ userId: userId })
                
                if (!cart) {
                    const newCart = new CartModel({
                        userId,
                    })
                    
                    const savedCart = await newCart.save()
                }
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