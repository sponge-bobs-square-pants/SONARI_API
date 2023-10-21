// const Product = require('../models/product');
const Razorpay = require('razorpay')
require('dotenv').config()
const axios = require('axios')
const shortid = require('shortid')
const razorpay = new Razorpay({ key_id:process.env.RAZOR_PAY_ID, key_secret:process.env.RAZOR_PAY_SECRET })
const crypto = require('crypto')
const FormEntry = require('../FormEntry');
let razorpayTotalAmount = 0;

const getRazerPayDataController = async (req, res) => {
    const data = req.body;
    let totalAmount = 0;
    try {
        const productRequests = data.cart.map(async (item) => {
            const itemId = item.id.replace(/[^0-9]/g, '');
            const productResponse = await axios.get(`https://sonari-api.onrender.com/api/v1/products/${itemId}`);
            const productData = productResponse.data;
            // console.log(item.amount, productData.product.Price);
            let itemTotalAmount = item.amount * productData.product.Price;
            totalAmount += itemTotalAmount
            return itemTotalAmount;
        });
        const totalAmounts = await Promise.all(productRequests);
        totalAmount = totalAmounts.reduce((acc, itemTotalAmount) => acc + itemTotalAmount, 0);
        // console.log('Total Amount:', totalAmount);
        // getRazerPayController(req, res, totalAmount);
        razorpayTotalAmount = totalAmount;
        // console.log(razorpayTotalAmount);
        res.json({ msg: 'ok' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching prices and calculating total amount.' });
    }
}
// console.log(totalAmount);
const getRazerPayController = async (req, res) => {
    // console.log(razorpayTotalAmount, 'Max max');
    const payment_capture = 1;
    let amount = razorpayTotalAmount * 9 /10; 
    // console.log(amount, 'This is thr amount');
    const currency = 'INR';
    const options = {
        amount:amount,
        currency,
        receipt:`order_id_${shortid.generate()}`,
        payment_capture,
    }
        const response = await razorpay.orders.create(options)

        // console.log(response);
        // res.status(200).json({msg: 'everything is ok so far'})
        res.json({
            order_id:response.id,
            currency:response.currency,
            amount:response.amount
        })
   
}
const backendVerification = async (req, res) => {
    const SECRET = process.env.RAZOR_BACKEND_SECRET
    const {payload} = req.body
    // console.log(payload.payment.entity.order_id, payload.payment.entity.contact);
    const contact = payload.payment.entity.contact;
    const orderId = payload.payment.entity.order_id;
 
    const shasum = crypto.createHmac('sha256', SECRET)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest('hex')

    if(digest === req.headers['x-razorpay-signature']){
        // console.log('request is legit.do your shit here');
        try {
            const result = await FormEntry.findOneAndUpdate(
                {orderID:orderId},
                {$set: {isPaymentSuccessful: true, phoneNumber:contact}}
            );
            if(result){
               return res.json({status: 'ok'})
            }else{
                return res.status(404).json({error: 'Document not found'})
            }
        } catch (error) {
            return res.status(500).json({error: 'An error occurred while updating'})
        }
        
    }else{
        res.status(400).json({msg: 'u are messing with the wrong person'})
    }
    
}

module.exports = {
    getRazerPayController,
    getRazerPayDataController,
    backendVerification
}