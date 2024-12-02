const Orders = require('../models/order.model')
const voucherModel = require('../models/voucher.model')
const productModel = require('../models/product.model')
const userModel = require('../models/user.model')
const cartModel = require('../models/cart.model')
const getData = require('../utils/formatRes')
const voucherService = require('../services/voucher.service')
const { InternalServerError, BadRequestError, ConflictRequestError } = require('../utils/error.response')
const _ = require('lodash');
const orderModel = require('../models/order.model')
class OrdersServices {

    static addOrder = async ({ user, items, voucher, paymentStatus, paymentMethod, deliveryStatus, note, name, address, phone }) => {
        // method is bank and cast
        try {
            // check exist user
            if (user) {
                const existUser = await userModel.findById(user)
                if (!existUser) {
                    return new ConflictRequestError(`User does't exist`)
                }
            }

            let total = items.reduce((total, item) => {
                return total + (item.price - item.price * item.discount / 100) * item.quantity;
            }, 0);
            let totalPrice = total

            // check exist list voucher
            let usedVoucher = []
            if (user && voucher && voucher.length != 0) {
                for (let ele of voucher) {
                    const existVoucher = await voucherModel.findById(ele);

                    if (!existVoucher) {
                        return {
                            success: false,
                            message: "voucher can not found"
                        }
                    }

                    const currentTime = new Date().getTime()

                    if (existVoucher.startDay.getTime() <= currentTime && existVoucher.endDay.getTime() >= currentTime) {
                        if (existVoucher.customerUsed.some(u => u.toString() == user.toString())) {
                            return {
                                success: false,
                                message: "voucher can only be used once"
                            }
                        }
                    }
                    else {
                        if (existVoucher.startDay.getTime() > currentTime) {
                            return {
                                success: false,
                                message: "voucher cannot be used yet"
                            }
                        }

                        if (existVoucher.endDay.getTime() < currentTime) {
                            return {
                                success: false,
                                message: "voucher expires"
                            }
                        }
                    }

                }


                for (const item of voucher) {
                    let check = await voucherService.checkVoucher(item, user)

                    if (check.success) {
                        let { type } = check.voucher

                        if (type === 'chain') {
                            let val = check.voucher.value

                            if (total - val < totalPrice * 0.5) {
                                break
                            }

                            let res = await voucherService.confirmVoucher(item, user)
                            let { value } = (res.success) ? res.voucher : {}

                            usedVoucher.push(item)

                            total -= value
                        }
                    }
                }

                for (const item of voucher) {
                    let check = await voucherService.checkVoucher(item, user)

                    if (check.success) {
                        let { type } = check.voucher

                        if (type === 'trade') {
                            let val = check.voucher.value

                            if (total - (total * val) / 100 < totalPrice * 0.5) {
                                break
                            }

                            let res = await voucherService.confirmVoucher(item, user)
                            let { value } = (res.success) ? res.voucher : {}

                            usedVoucher.push(item)

                            total -= (total * value) / 100
                        }
                    }
                }
            }

            let voucherLeft = []
            if (voucher) {
                voucherLeft = [
                    ...voucher.filter(item => !usedVoucher.includes(item))
                ]
            }

            const order = new orderModel({
                "user": user,
                "items": items,
                "voucher": usedVoucher,
                "paymentStatus": paymentStatus,
                "paymentMethod": paymentMethod,
                "deliveryStatus": deliveryStatus,
                "note": note,
                "total": total,
                name,
                address,
                phone
            })

            const savedOrder = await order.save()

            savedOrder.voucherLeft = [...voucherLeft]

            return savedOrder
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static updateOrder = async ({ id }, { paymentStatus, deliveryStatus, note }) => {
        try {
            if (deliveryStatus) {
                const order = await orderModel.findById(id)

                if (order.deliveryStatus == 'pending') {
                    if (deliveryStatus != 'confirmed' && deliveryStatus != 'systemCancel' && deliveryStatus != 'customerCancel') {
                        return {
                            success: false,
                            message: "wrong delivery route"
                        }
                    }
                }

                if (order.deliveryStatus == 'confirmed') {
                    if (deliveryStatus != 'doing') {
                        return {
                            success: false,
                            message: "wrong delivery route"
                        }
                    }
                }

                if (order.deliveryStatus == 'doing') {
                    if (deliveryStatus != 'shipping') {
                        return {
                            success: false,
                            message: "wrong delivery route"
                        }
                    }
                }

                if (order.deliveryStatus == 'shipping') {
                    if (deliveryStatus != 'success' && deliveryStatus != 'fail') {
                        return {
                            success: false,
                            message: "wrong delivery route"
                        }
                    }
                    else {
                        if (deliveryStatus == 'success') {
                            order.paymentStatus = 'paid'

                            await order.save()
                        }
                    }
                }

                if (order.deliveryStatus == 'systemCancel' || order.deliveryStatus == 'customerCancel' || order.deliveryStatus == 'success' || order.deliveryStatus == 'fail') {
                    if (deliveryStatus != order.deliveryStatus) {
                        return {
                            success: false,
                            message: "wrong delivery route"
                        }
                    }
                }
            }

            return await orderModel.findByIdAndUpdate({ _id: id }, { paymentStatus, deliveryStatus, note }, {
                new: true,
                runValidators: true,
            })
        } catch (error) {
            if (error.name === 'ValidationError') {
                return new BadRequestError('Invalid data')
            }
            throw new InternalServerError(error.message)
        }
    }

    static changeStatus = async ({ id }, { deliveryStatus }) => {
        try {
            const existOrder = await orderModel.findById(id)
            if (!existOrder) {
                return {
                    success: false,
                    message: "Order don't exist"
                }
            }

            if (existOrder.deliveryStatus == 'pending') {
                if (deliveryStatus != 'confirmed' && deliveryStatus != 'systemCancel' && deliveryStatus != 'customerCancel') {
                    return {
                        success: false,
                        message: "wrong delivery route"
                    }
                }
            }

            if (existOrder.deliveryStatus == 'confirmed') {
                if (deliveryStatus != 'doing') {
                    return {
                        success: false,
                        message: "wrong delivery route"
                    }
                }
            }

            if (existOrder.deliveryStatus == 'doing') {
                if (deliveryStatus != 'shipping') {
                    return {
                        success: false,
                        message: "wrong delivery route"
                    }
                }
            }

            if (existOrder.deliveryStatus == 'shipping') {
                if (deliveryStatus != 'success' && deliveryStatus != 'fail') {
                    return {
                        success: false,
                        message: "wrong delivery route"
                    }
                }
                else {
                    if (deliveryStatus == 'success') {
                        existOrder.paymentStatus = 'paid'

                        await existOrder.save()
                    }
                }
            }

            if (existOrder.deliveryStatus == 'systemCancel' || existOrder.deliveryStatus == 'customerCancel' || existOrder.deliveryStatus == 'success' || existOrder.deliveryStatus == 'fail') {
                if (deliveryStatus != existOrder.deliveryStatus) {
                    return {
                        success: false,
                        message: "wrong delivery route"
                    }
                }
            }

            return await orderModel.findByIdAndUpdate({ _id: id }, { deliveryStatus }, {
                new: true,
                runValidators: true,
            })
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteOrder = async ({ id }) => {
        try {
            await orderModel.findByIdAndDelete(id)

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

    static deleteOrderNoAccount = async ({ itemId, amount }) => {
        try {
            const existItem = await productModel.findById(itemId)
            if (!existItem) {
                return {
                    success: false,
                    message: "Item don't exist"
                }
            }
            const remainQuantity = Number(existItem.quantity) - Number(amount)
            return {
                item: await productModel.findByIdAndUpdate(existItem._id, { quantity: remainQuantity }, { new: true }),
                amount: amount
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getOrder = async () => {
        try {
            const orders = await orderModel.find({})
                .populate("voucher").populate('items.product')
            return orders;
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getOrderID = async ({ id }) => {
        try {
            const existOrder = await Orders.findById(id).populate("voucher").populate('items.product');
            if (!existOrder) {
                return {
                    success: false,
                    message: "Don't exist"
                }
            }

            return existOrder
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getOrdersByUserId = async ({ userId }) => {
        try {
            const existUser = await userModel.findById(userId)
            if (!existUser) {
                return {
                    success: false,
                    message: "user don't exist"
                }
            }
            return await Orders.find({ user: userId }).populate("voucher").populate('items.product')
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static paymentOrder = async ({ amount, orderInfo, items, voucher, userId, method, from, name, phone, address, note }) => {
        try {
            // test momo:
            // NGUYEN VAN A
            // 9704 0000 0000 0018
            // 03/07
            // OTP
            // các thông tin đổi để hiện trên Hóa đơn thanh toán: orderInfo, ,amount, orderID,...
            //Đổi redirectURL, ipnURL theo trang web của mình
            var accessKey = 'F8BBA842ECF85';
            var secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';//key để test // không đổi
            var partnerCode = 'MOMO';
            var redirectUrl = 'http://localhost:3000/checkout'; // Link chuyển hướng tới sau khi thanh toán hóa đơn
            var ipnUrl = 'http://localhost:3000/checkout';   //trang truy vấn kết quả, để trùng với redirect
            var requestType = "payWithMethod";
            // var amount = '1000'; // Lượng tiền của hóa  <lượng tiền test ko dc cao quá>
            var orderId = partnerCode + new Date().getTime(); // mã Đơn hàng, có thể đổi
            var requestId = orderId;
            // var extraData = `items-${JSON.stringify(items)}+voucher-${voucher}+userId-${userId}+method-${method}+from-${from}+name-${name}+phone-${phone}+address-${address}`; // đây là data thêm của doanh nghiệp (địa chỉ, mã COD,....)
            var extraData = encodeURIComponent(
                JSON.stringify({
                    items: items,
                    voucher: voucher,
                    userId: userId,
                    name: name,
                    phone: phone,
                    address: address,
                    note: note
                })
            )
            var paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
            var orderGroupId = '';
            var autoCapture = true;
            var lang = 'vi'; // ngôn ngữ
            console.log("res==================", extraData)

            // không đụng tới dòng dưới
            var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType;
            //puts raw signature
            console.log("--------------------RAW SIGNATURE----------------")
            console.log(rawSignature)
            //chữ ký (signature)
            const crypto = require('crypto');
            var signature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');
            console.log("--------------------SIGNATURE----------------")
            console.log(signature)

            // data gửi đi dưới dạng JSON, gửi tới MoMoEndpoint
            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                partnerName: "Test",
                storeId: "MomoTestStore",
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                lang: lang,
                requestType: requestType,
                autoCapture: autoCapture,
                extraData: extraData,
                orderGroupId: orderGroupId,
                signature: signature
            });
            // tạo object https
            const https = require('https');
            const options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/v2/gateway/api/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            }
            //gửi yêu cầu tới momo, nhận lại kết quả trả về 
            // Link chuyển hướng tới momo là payUrl, trong phần body của data trả về
            return new Promise((resolve, reject) => {
                const req = https.request(options, res => {
                    console.log(`Status: ${res.statusCode}`);
                    console.log(`Headers: ${JSON.stringify(res.headers)}`);
                    res.setEncoding('utf8');
                    res.on('data', (body) => {
                        console.log('Body: ');
                        console.log(body);
                        resolve(JSON.parse(body));
                        console.log('resultCode: ');
                        console.log(JSON.parse(body).resultCode);
                    });
                    res.on('end', () => {
                        console.log('No more data in response.');
                    });
                })

                req.on('error', (e) => {
                    console.log(`problem with request: ${e.message}`);
                    reject(error)
                });
                // write data to request body
                console.log("Sending....")
                req.write(requestBody);
                req.end();
            })
            // dữ liệu trả về khi thành công: ?partnerCode=MOMO&orderId=MOMO1713984978976&requestId=MOMO1713984978976&amount=1000&orderInfo=30k&orderType=momo_wallet&transId=4029232035&resultCode=0&message=Thành+công.&payType=credit&responseTime=1713985045244&extraData=&signature=0d6f0e650eb5d320c3a65df17a620f01c09d0eae742d3eb7e84177b2ebda6fe0
        } catch (error) {
            return {
                success: false,
                message: error.message,
            }
        }
    }
}

module.exports = OrdersServices