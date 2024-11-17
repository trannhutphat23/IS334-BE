const ProductModel = require('../models/product.model')
const uploadImage = require('../utils/uploadImage.utils')
const deleteImage = require('../utils/deleteImage.utils');
const productModel = require('../models/product.model');

class ProductService {
    static addProduct = async (file, { name, type, description, category, discount, }) => {
        try {
            const product = await ProductModel.findOne({ name }).lean();
            if (product) {
                return {
                    success: false,
                    message: "Already exist"
                }
            }

            if (type) {
                type = JSON.parse(type)
            }

            const cloudinaryFolder = 'Cafe/Product';
            const imageLink = await uploadImage(file.path, cloudinaryFolder);

            const newProduct = new ProductModel({
                "image": imageLink,
                name, type, description, category, discount
            })

            const savedProduct = await newProduct.save()

            return savedProduct
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getProduct = async () => {
        try {
            const products = await ProductModel.find({})

            return products
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getProductID = async ({ id }) => {
        try {
            const product = await ProductModel.findById(id)

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            return product
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static updateProduct = async (id, file, { type, description, category, discount, }) => {
        try {
            const product = await ProductModel.findById(id)

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            if (file) {
                const cloudinaryFolder = 'Cafe/Product';
                const imageLink = await uploadImage(file.path, cloudinaryFolder);
                deleteImage(product.image)

                product.image = imageLink
            }

            if (type) {
                type = JSON.parse(type)

                product.type = type
            }

            if (description)
                product.description = description

            if (category)
                product.category = category

            if (discount)
                product.discount = discount

            const savedProduct = await product.save()

            return savedProduct
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteProduct = async ({ id }) => {
        try {
            await productModel.findByIdAndDelete(id)
            return {
                success: true,
                message: "delete successfully"
            } 
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }
}

module.exports = ProductService