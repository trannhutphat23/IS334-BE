const productModel = require('../models/product.model')
const categoryModel = require('../models/category.model')
const uploadImage = require('../utils/uploadImage.utils')
const deleteImage = require('../utils/deleteImage.utils');
const cartModel = require('../models/cart.model');
const { BadRequestError, InternalServerError } = require('../utils/error.response');

class ProductService {
    static getNameProductById = async ({ id }) => {
        try {
            const product = await productModel.findById(id).populate('categoryId')

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            return product.name
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static addProduct = async (file, { name, type, description, categoryId, discount }) => {
        try {
            const product = await productModel.findOne({ name }).lean();
            const category = await categoryModel.findById(categoryId).lean();

            if (product) {
                return {
                    success: false,
                    message: "Already exist"
                }
            }

            if (!category) {
                return {
                    success: false,
                    message: "wrong category"
                }
            }

            if (type) {
                type = JSON.parse(type)

                const priceSizeL = type.find(ele => ele.size === "L")
                const priceSizeM = type.find(ele => ele.size === "M")
                const priceSizeS = type.find(ele => ele.size === "S")

                if (priceSizeL && priceSizeM && priceSizeS && priceSizeL.price !== undefined && priceSizeM.price !== undefined && priceSizeS.price !== undefined) {
                    if (priceSizeL.price >= priceSizeM.price && priceSizeM.price >= priceSizeS.price) {
                    } else {
                        return new BadRequestError("Incorrect condition L >= M >= S");
                    }
                } else if (priceSizeL && priceSizeM && priceSizeL.price !== undefined && priceSizeM.price !== undefined) {
                    if (priceSizeL.price >= priceSizeM.price) {
                    } else {
                        return new BadRequestError("Incorrect condition L >= M");
                    }
                } else if (priceSizeM && priceSizeS && priceSizeM.price !== undefined && priceSizeS.price !== undefined) {
                    if (priceSizeM.price >= priceSizeS.price) {
                    } else {
                        return new BadRequestError("Incorrect condition M >= S");
                    }
                } else if (priceSizeS && priceSizeL && priceSizeL.price !== undefined && priceSizeS.price !== undefined) {
                    if (priceSizeL.price >= priceSizeS.price) {
                    } else {
                        return new BadRequestError("Incorrect condition L >= S");
                    }
                }
            }

            const cloudinaryFolder = 'Cafe/Product';
            const imageLink = await uploadImage(file.path, cloudinaryFolder);

            const newProduct = new productModel({
                "image": imageLink,
                name, type, description, categoryId, discount
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
            const products = await productModel.find({}).populate('categoryId')

            // products.forEach(p => {
            //     console.log('{id: ObjectId("' + p.id + '"), type:[' + p.type + ']},')
            // })

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
            const product = await productModel.findById(id).populate('categoryId')

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

    static updateProduct = async (id, file, { name, type, description, categoryId, discount, isStock }) => {
        try {
            const product = await productModel.findById(id)
            const category = await categoryModel.findById(categoryId).lean();

            if (name) {
                const existProduct = await productModel.findOne({ name: name })
                if (existProduct) {
                    if (existProduct.id.toString() != id) {
                        return {
                            success: false,
                            message: "name exist"
                        }
                    }
                }
            }

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            if (!category) {
                return {
                    success: false,
                    message: "wrong category"
                }
            }

            if (file) {
                const cloudinaryFolder = 'Cafe/Product';
                const imageLink = await uploadImage(file.path, cloudinaryFolder);

                const linkArr = product.image.split('/')
                const imgName = linkArr[linkArr.length - 1]
                const imgID = imgName.split('.')[0]
                const result = "Cafe/Product/" + imgID
                await deleteImage(result)

                product.image = imageLink
            }

            if (type) {
                type = JSON.parse(type)

                const priceSizeL = type.find(ele => ele.size === "L")
                const priceSizeM = type.find(ele => ele.size === "M")
                const priceSizeS = type.find(ele => ele.size === "S")

                if (priceSizeL && priceSizeM && priceSizeS && priceSizeL.price !== undefined && priceSizeM.price !== undefined && priceSizeS.price !== undefined) {
                    if (priceSizeL.price >= priceSizeM.price && priceSizeM.price >= priceSizeS.price) {
                    } else {
                        return new BadRequestError("Incorrect condition L >= M >= S");
                    }
                } else if (priceSizeL && priceSizeM && priceSizeL.price !== undefined && priceSizeM.price !== undefined) {
                    if (priceSizeL.price >= priceSizeM.price) {
                    } else {
                        return new BadRequestError("Incorrect condition L >= M");
                    }
                } else if (priceSizeM && priceSizeS && priceSizeM.price !== undefined && priceSizeS.price !== undefined) {
                    if (priceSizeM.price >= priceSizeS.price) {
                    } else {
                        return new BadRequestError("Incorrect condition M >= S");
                    }
                } else if (priceSizeS && priceSizeL && priceSizeL.price !== undefined && priceSizeS.price !== undefined) {
                    if (priceSizeL.price >= priceSizeS.price) {
                    } else {
                        return new BadRequestError("Incorrect condition L >= S");
                    }
                }

                product.type = type
            }

            if (name)
                product.name = name

            if (description)
                product.description = description

            if (categoryId)
                product.categoryId = categoryId

            if (discount)
                product.discount = discount

            if (isStock)
                product.isStock = isStock

            const savedProduct = await product.save()

            const carts = await cartModel.find({ "items.product": savedProduct.id })

            if (carts) {
                for (let cart of carts) {
                    cart.items.forEach(async (item, index) => {
                        if (savedProduct.type.some(t => t.size == item.size)) {
                            savedProduct.type.forEach(t => {
                                if (t.size == item.size) {
                                    item.price = t.price
                                    item.discount = savedProduct.discount
                                }
                            })
                        }
                        else {
                            cart.items.splice(index, 1)
                        }
                    })

                    await cart.save()
                }
            }

            return savedProduct
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static updateProductNameById = async (id, { name }) => {
        try {
            const product = await productModel.findById(id)

            if (!product) {
                return {
                    success: false,
                    message: "wrong product"
                }
            }

            if (name.trim().length === 0) {
                return {
                    success: false,
                    message: "Invalid product name"
                }
            }

            product.name = name

            const savedProduct = await product.save()

            return {
                success: true,
                product: savedProduct
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteProduct = async ({ id }) => {
        try {
            const product = await productModel.findByIdAndDelete(id)

            const carts = await cartModel.find({ "items.product": product.id })

            if (carts) {
                for (let cart of carts) {
                    cart.items.forEach(async (item, index) => {
                        if (product.type.some(t => t.size == item.size)) {
                            product.type.forEach(t => {
                                if (t.size == item.size) {
                                    item.price = t.price
                                    item.discount = product.discount
                                }
                            })
                        }
                        else {
                            cart.items.splice(index, 1)
                        }
                    })

                    await cart.save()
                }
            }

            const linkArr = product.image.split('/')
            const imgName = linkArr[linkArr.length - 1]
            const imgID = imgName.split('.')[0]
            const result = "Cafe/Product/" + imgID
            await deleteImage(result)

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

    static listCategoryOfProduct = async () => {
        try {
            const result = await productModel.aggregate([
                {
                    $group: {
                        _id: "$categoryId",
                        name: { $first: "" },
                        products: {
                            $push: {
                                _id: "$_id",
                                name: "$name",
                                image: "$image",
                                description: "$description",
                                type: "$type",
                                discount: "$discount",
                                isStock: "$isStock",
                            },
                        },
                    },
                },
                {
                    $sort: { _id: 1 },
                },
            ])

            for (const cateId of result) {
                const category = await categoryModel.findById(cateId._id)
                if (category) {
                    cateId.name = category.name
                }
            }

            return result
        } catch (error) {
            return new InternalServerError(error.message)
        }
    }
}

module.exports = ProductService