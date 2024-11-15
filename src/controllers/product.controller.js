const ProductService = require('../services/product.service')

class ProductController {

    addProduct = async (req, res, next) => {
        try {
            return res.status(201).json(await ProductService.addProduct(req.file, req.body))
        } catch (error) {
            next(error)
        }
    }

    getProduct = async (req, res, next) => {
        try {
            return res.status(201).json(await ProductService.getProduct())
        } catch (error) {
            next(error)
        }
    }

    getProductID = async (req, res, next) => {
        try {
            return res.status(201).json(await ProductService.getProductID(req.params))
        } catch (error) {
            next(error)
        }
    }

    updateProduct = async (req, res, next) => {
        try {
            return res.status(201).json(await ProductService.updateProduct(req.params.id, req.file, req.body))
        } catch (error) {
            next(error)
        }
    }

    deleteProduct = async (req, res, next) => {
        try {
            return res.status(201).json(await ProductService.deleteProduct(req.params))
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new ProductController()