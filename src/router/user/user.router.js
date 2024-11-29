const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

multer({
    limits: { fieldSize: 25 * 1024 * 1024 }
})

const ProductController = require('../../controllers/product.controller')
const VouchersController = require('../../controllers/voucher.controller')
const OrderController = require('../../controllers/order.controller')
const CartController = require('../../controllers/cart.controller')
const AccessController = require('../../controllers/access.controller')
const AuthController = require('../../controllers/auth.controller')
const CategoryController = require('../../controllers/category.controller')

// get verification code
router.post('/verification', AccessController.getVerificationCode)
//check expire verification code
router.post('/verification/check', AccessController.checkVerification)
// change password
router.put('/password/change', AccessController.changePassword)
// update info 
router.put('/users/update/:userId', AccessController.updateInfo)
// refresh token
router.post('/refreshToken', AuthController.handleRefreshToken)
// logout
router.post('/logout', AccessController.logout)
// contact
router.post('/contact', AccessController.contact)

//product
router.get('/products', ProductController.getProduct)
router.get('/products/categories', ProductController.listCategoryOfProduct)
router.get('/products/:id', ProductController.getProductID)
router.post('/products', upload.single('image'), ProductController.addProduct)
router.put('/products/:id', upload.single('image'), ProductController.updateProduct)
router.put('/products/name/:id', ProductController.updateProductNameById)
router.delete('/products/:id', ProductController.deleteProduct)

//vouchers
router.post('/vouchers', VouchersController.addVoucher)
router.get('/vouchers', VouchersController.getVoucher)
// router.get('/vouchers/:name', VouchersController.getVoucherByName)
router.get('/vouchers/:id', VouchersController.getVoucherID)
router.put('/vouchers/:id', VouchersController.updateVoucher)
router.delete('/vouchers/:id', VouchersController.deleteVoucher)
router.post('/vouchers/confirmVoucher', VouchersController.confirmVoucher)
router.post('/vouchers/checkVoucher', VouchersController.checkVoucher)
router.post('/vouchers/getTotalUsedVouchers', VouchersController.getTotalUsedVouchers)
router.post('/vouchers/vouchersToId', VouchersController.vouchersToId)

//orders
router.post('/orders', OrderController.addOrder)
router.get('/orders', OrderController.getOrder)
router.get('/orders/:id', OrderController.getOrderID)
router.get('/orders/users/:userId', OrderController.getOrdersByUserId)
router.put('/orders/:id', OrderController.updateOrder)
router.delete('/orders/:id', OrderController.deleteOrder)
router.delete('/ordersAnonymus', OrderController.deleteOrderNoAccount)
router.post('/orders/payment', OrderController.paymentOrder)
router.put('/orders/changeStatus/:id', OrderController.changeStatus)

//cart
router.post('/carts/addCart', CartController.addCart)
router.post('/carts/addItemCart', CartController.addItemCart)
router.delete('/carts/deleteItemCart', CartController.deleteItemCart)
router.post('/carts/addItemCartNoLogin', CartController.addItemCartNoLogin)
router.delete('/carts/deleteItemCartNoLogin', CartController.deleteItemCartNoLogin)
router.get('/carts', CartController.getCart)
router.get('/carts/getCartByUserId/:userId', CartController.getCartByUserId)
router.get('/carts/getCartById/:id', CartController.getCartById)
router.put('/carts/updateQuantity', CartController.updateQuantity)
router.put('/carts/updateQuantityNoLog', CartController.updateQuantityNoLog)
router.delete('/carts/clearCartById/:id', CartController.clearCartById)
router.delete('/carts/clearCartByUserId/:userId', CartController.clearCartByUserId)

//admin
router.get('/users', AccessController.getUsers)
router.get('/users/:id', AccessController.getUserById)

//category
router.get('/categories', CategoryController.getAllCategory)
router.get('/categories/:id', CategoryController.getCategoryById)
router.get('/categories/name/:name', CategoryController.getCategoryByName)
router.post('/categories', CategoryController.addCategory)
router.put('/categories/:id', CategoryController.updateCategory)
router.delete('/categories/:id', CategoryController.deleteCategory)

module.exports = router