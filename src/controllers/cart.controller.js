const CartService = require('../services/cart.service')

class CartController {
    addItemCart = async (req, res, next) => {
        try {
            return res.status(201).json(await CartService.addItemCart(req.body))
        } catch (error) {
            next(error)
        }
    }

    deleteItemCart = async (req, res, next) => {
        try {
            return res.status(201).json(await CartService.deleteItemCart(req.body))
        } catch (error) {
            next(error)
        }
    }

    getCart = async (req, res, next) => {
        try {
            return res.status(201).json(await CartService.getAllCart())
        } catch (error) {
            next(error)
        }
    }

    getCartByUserId = async (req, res, next) => {
        try {
            return res.status(201).json(await CartService.getCartByUserId(req.params))
        } catch (error) {
            next(error)
        }
    }

    getCartById = async (req, res, next) => {
        try {
            return res.status(201).json(await CartService.getCartById(req.params))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CartController()