const cartModel = require('../models/cart.model')
const userModel = require('../models/user.model')
const productModel = require('../models/product.model')
const {InternalServerError, BadRequestError, ConflictRequestError} = require('../utils/error.response')

class CartService {
    // [POST]/v1/api/users/carts
    static addCart = async ({userId, productId, size, amount}) => {
        try {
            const existUser = await userModel.findById(userId)
            if (!existUser) {
                return new ConflictRequestError(`User doesn't exist`)
            }

            const existProduct = await productModel.findById(productId)
            if (!existProduct) {
                return new ConflictRequestError(`Product doesn't exist`)
            }

            const existCart = await cartModel.findOne({user: existUser._id})
            // if (!existCart) {
                
            // }
            // if (!existCart){
            //     const tempObj = {
            //         item: itemId,
            //         amount: amount,
            //         price: amount*(existItem.price - existItem.price*existItem.tag)
            //     }
            //     const newCart = new CartModel({
            //         customer: existUser._id,
            //         items: [tempObj]
            //     })

            //     const savedCart = newCart.save()
            //     return (await savedCart).populate('items.item')
            // }
            // // check exist item in cart with customer id
            // let checkNew = true;
            // for (const ele of existCart.items){
            //     if (ele.item == itemId){
            //         checkNew = false
            //         ele.amount += amount
            //         ele.price += amount*(existItem.price - existItem.price*existItem.tag)
            //         await CartModel.findOneAndUpdate({customer: existUser._id}, {$set: {items: existCart.items}})
            //         return existCart.populate('items.item')
            //     }
            // }
            // if (checkNew){
            //     const updatedCart = await CartModel.findOneAndUpdate({customer: existUser._id}, {$push: {items: {item: itemId, amount: amount, price: amount*(existItem.price - existItem.price*existItem.tag)}}}, {new: true})
            //     return updatedCart.populate('items.item')
            // }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getCart = async ({id}) => {
        try {
            const existCart = await CartModel.findOne({customer: id})
            if (!existCart) {
                const newCart = new CartModel({
                    customer: id,
                    items: []
                })
                const savedNewCart = newCart.save()
                return (await savedNewCart).populate('items.item')
            }

            return existCart.populate('items.item')
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteCart = async ({customerId, itemId}) => {
        try {
            const existUser = await CustomerModel.findById(customerId)
            if (!existUser) {
                return {
                    success: false,
                    message: "Customer don't exist"
                }
            }

            const existItemInCart = await CartModel.findOne({customer: customerId, 'items._id': itemId})
            if (!existItemInCart){
                return {
                    success: false,
                    message: "Item don't exist in cart"
                }
            }
            let isDeleted = false;
            const items = existItemInCart.items
            for (const ele of items){
                if (itemId === ele._id.toString()){
                    isDeleted = true;
                    const existItem = await ItemsModels.findById(ele.item)
                    const remainQuantity = existItem.quantity + ele.amount
                    await ItemsModels.findOneAndUpdate({_id: ele.item}, {$set: {quantity: remainQuantity}})

                    const updatedCart = await CartModel.findOneAndUpdate({customer: existUser._id}, {$pull: {items: {_id: itemId}}}, {new: true})
                    return updatedCart.populate('items.item')
                }
            }
            if (isDeleted === false) {
                return {
                    success: false,
                    message: "Item don't exist in cart"
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