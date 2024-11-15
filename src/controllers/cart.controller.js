const CartService = require('../services/cart.service')

class CartController {
    addCart = async (req, res, next) => {
        try {
            return res.status(201).json(await CartService.addCart(req.body))
        } catch (error) {
            next(error)
        }
    }

    getCart = async (req, res, next) => {
        try {
            return res.status(201).json(await CartService.getCart(req.params))
        } catch (error) {
            next(error)
        }
    }

    deleteCart = async (req, res, next) => {
        try {
            return res.status(201).json(await CartService.deleteCart(req.query))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CartController()