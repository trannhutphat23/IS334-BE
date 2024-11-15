const Orders = require('../models/order.model')
const Vouchers = require('../models/voucher.model')
const ItemsModel = require('../models/product.model')
const CustomerModel = require('../models/customer.model')
const CartModel = require('../models/cart.model')
const getData = require('../utils/formatRes')
const _ = require('lodash');
class OrdersServices {
    
    static addOrder = async ({ deliveryFee, items, customer, userId, voucher, method, from }) => {
        // method is bank and cast
        try {
            // check exist voucher
            const existVoucher = await Vouchers.findById(voucher)

            const existUser = await CustomerModel.findById(userId)
            if (!existUser){
                return {
                    success: false,
                    message: "Customer don't exist"
                }
            }

            // check exist list item
            const results = await Promise.all(
                items.map(async (ele) => {
                    const existItem = await ItemsModel.findById(ele.item);
                    return !!existItem;
                })
            );

            const allExistItem = results.every(exist => exist);

            if (!allExistItem) {
                return {
                    success: false,
                    message: "One or more items don't exist",
                };
            }

            const checkPaymentStatus = method === "cash" ? "Chua thanh toan" : "Da thanh toan"

            let firstPrice = items.reduce((total, item) => {
                return total + item.price;
            }, 0);

            let totalPrice = 0;
            if (existVoucher){
                totalPrice = (firstPrice*existVoucher.percent)/100; 
            }

            totalPrice = totalPrice + deliveryFee;
            if (from == "cart"){
                await CartModel.updateOne({customer: userId}, {$set: {items: []}})
            }else{
                const updatedItem = await ItemsModel.findById(items[0].item) 
                const remainQuantity = updatedItem.quantity - items[0].amount
                await ItemsModel.findByIdAndUpdate({_id: items[0].item}, {quantity: remainQuantity})
            }

            const newOrder = new Orders({
                total: totalPrice,
                intoMoney: firstPrice,
                deliveryStatus: "Dang van chuyen",
                paymentStatus: checkPaymentStatus,
                paymentMethod: method,
                deliveryFee,
                items: items,
                customer,
                user: userId,
                voucher
            })

            const savedOrder = newOrder.save()

            return (await (await (await savedOrder).populate('voucher')).populate('items.item')).populate('user')
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static addOrderNoAccount = async ({quantity}, {itemId}) => {
        try {
            const existItem = await ItemsModel.findById(itemId)
            if (!existItem) {
                return {
                    success: false,
                    message: "Item don't exist"
                }
            }
            const remainQuantity = existItem.quantity - quantity

            return {
                item: await ItemsModel.findByIdAndUpdate(existItem._id, {quantity: remainQuantity}, {new: true}),
                amount: quantity
            }
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static updateOrder = async ({ id }) => {
        try {
            return await Orders.findByIdAndUpdate({ id }, { total, intoMoney, date, deliveryStatus, paymentStatus })
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static changeStatus = async ({id}) => {
        try {
            const existOrder = await Orders.findById(id)
            if (!existOrder) {
                return {
                    success: false,
                    message: "Order don't exist"
                }
            }
            if (existOrder.deliveryStatus === 'Dang van chuyen'){
                return await Orders.findByIdAndUpdate( existOrder._id, { deliveryStatus: "Đã hoàn thành" })
            }
            return existOrder
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteOrder = async ({ id }) => {
        try {
            return await Orders.findByIdAndDelete(id)
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static deleteOrderNoAccount = async ({itemId, amount}) => {
        try {
            const existItem = await ItemsModel.findById(itemId)
            if (!existItem) {
                return {
                    success: false,
                    message: "Item don't exist"
                }
            }
            const remainQuantity = Number(existItem.quantity) - Number(amount)
            return {
                item: await ItemsModel.findByIdAndUpdate(existItem._id, {quantity: remainQuantity}, {new: true}),
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
            const orders = await Orders.find({})
                        .populate("voucher").populate('items.item').populate('user')
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
            const existOrder = await Orders.findById(id);
            if (!existOrder){
                return {
                    success: false,
                    message: "Don't exist"
                }
            }
            
            return (await existOrder.populate('voucher')).populate('items.item');
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static getOrdersByUserId = async ({userId}) => {
        try {
            const existUser = await CustomerModel.findById(userId)
            if (!existUser) {
                return {
                    success: false,
                    message: "Customer don't exist"
                }
            }
            return await Orders.find({user: userId}).populate('items.item')
        } catch (error) {
            return {
                success: false,
                message: error.message
            }
        }
    }

    static paymentOrder = async ({amount, orderInfo, deliveryFee, items, voucher, customer, userId, method, from}) => {
        try {
            console.log("hahahahaha", items)
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
            var redirectUrl = 'http://localhost:5173/hoa-don'; // Link chuyển hướng tới sau khi thanh toán hóa đơn
            var ipnUrl = 'http://localhost:5173/hoa-don';   //trang truy vấn kết quả, để trùng với redirect
            var requestType = "payWithMethod";
            // var amount = '1000'; // Lượng tiền của hóa  <lượng tiền test ko dc cao quá>
            var orderId = partnerCode + new Date().getTime(); // mã Đơn hàng, có thể đổi
            var requestId = orderId;
            var extraData =`deliveryFee-${deliveryFee}+items-${JSON.stringify(items)}+voucher-${voucher}+customer-${JSON.stringify(customer)}+userId-${userId}+method-${method}+from-${from}`; // đây là data thêm của doanh nghiệp (địa chỉ, mã COD,....)
            var paymentCode = 'T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==';
            var orderGroupId ='';
            var autoCapture =true;
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
                partnerCode : partnerCode,
                partnerName : "Test",
                storeId : "MomoTestStore",
                requestId : requestId,
                amount : amount,
                orderId : orderId,
                orderInfo : orderInfo,
                redirectUrl : redirectUrl,
                ipnUrl : ipnUrl,
                lang : lang,
                requestType: requestType,
                autoCapture: autoCapture,
                extraData : extraData,
                orderGroupId: orderGroupId,
                signature : signature
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