// const Product = require('../models/product');
const Razorpay = require('razorpay')
require('dotenv').config()
const axios = require('axios')
const shortid = require('shortid')
const qs = require('qs');
const razorpay = new Razorpay({ key_id:process.env.RAZOR_PAY_ID, key_secret:process.env.RAZOR_PAY_SECRET })
const crypto = require('crypto')
const FormEntry = require('../FormEntry');
const QueryString = require('qs');
let razorpayTotalAmount = 0;

const getRazerPayDataController = async (req, res) => {
    const data = req.body;
    let totalAmount = 0;
    try {
        const productRequests = data.map(async (item) => {
            const itemId = item.id.replace(/[^0-9]/g, '');
            const productResponse = await axios.get(`https://sonari-api.onrender.com/api/v1/products/${itemId}`);
            const productData = productResponse.data;
            // console.log(item.amount, productData.product.Price);
            let itemTotalAmount = item.amount * productData.product.Price;
            totalAmount += itemTotalAmount;  
            return itemTotalAmount;
        });
        const totalAmounts = await Promise.all(productRequests);
        totalAmount = totalAmounts.reduce((acc, itemTotalAmount) => acc + itemTotalAmount, 0);
        totalAmount = (totalAmount * 9 / 10);
        res.json({
            amount:`${totalAmount}`,
            order_id:`order_id_${shortid.generate()}`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching prices and calculating total amount.' });
    }
}
// console.log(totalAmount);
// function generateTransactionID() {
//     const timestamp= Date.now();
//     const RandomNum = Math.floor(Math.random() * 1000000)
//     const MerchantPrefix = 'K';
//     const transactionID = `SONARIONLINE${MerchantPrefix}${timestamp}${RandomNum}`
//     return transactionID
// }
// const transactionID = generateTransactionID();


// const merchantaID=`${process.env.PHONE_PE_MERCHANT_ID}`
const merchantaID = 'PGTESTPAYUAT'
const getRazerPayController = async (req, res) => {
    console.log('hello motto');
    const {phone,orderID,email,address,pincode,state,city,amount,name, userId, transactionID} = req.body;
    const finalAmount = parseInt(amount)
    console.log(finalAmount);
    const data = {  
        "merchantId":`${merchantaID}`,
        "merchantTransactionId":transactionID,
        "merchantUserId":`${userId}`,
        "name":`${name}`,
        "amount":finalAmount,
        "merchantOrderId":`${orderID}`,
        "mobileNumber":`${phone}`,
        "redirectUrl":`https://sonari-api.onrender.com/api/v1/verification?merchantId=${merchantaID}&transcationId=${transactionID}&merchantOrderId=${orderID}`,
        // "redirectUrl": `https://0676-194-61-40-52.ngrok.io/api/v1/verification?merchantId=${merchantaID}&transcationId=${transactionID}`,
        "redirectMode": "POST",
        "callbackUrl": "https://sonarinightwear.netlify.app/Products",
        // "message":`payment for order ${orderID}`,
        // "email":`${email}`,
        "paymentInstrument": {
            "type": "PAY_PAGE"
          }
     }
     const payload = JSON.stringify(data)
     const payloadMain = Buffer.from(payload).toString('base64');
    //  const key = `${process.env.PHONE_PE_KEY}`;
        const key = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'
     const keyIndex = 1;
     const string = payloadMain + '/pg/v1/pay' + key;
     const sha256 = crypto.createHash('sha256').update(string).digest('hex');
     const checksum = sha256 + '###' + keyIndex
     const config = {
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        }
     }

    // try {
    //     const response = await axios.post('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', payloadMain, config)
    //     return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url)
    // } catch (error) {
    //     console.log(error);
    // }
     
     const URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'
     const options ={
        method: 'POST',
        url: URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data:{
            request:payloadMain
        }
     };
     try {
        const response = await axios(options);
        // console.log(response.data);
        return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url);
      } catch (error) {
        console.log(error);
      }
    //  axios.request(options).then(function(response){
    //     // console.log(response.data);
    //     return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url)
    //  }).catch(function(error){
    //     console.log(error);
    //  })
}

const createDelhiveryShipment = async (formDetails, orderId) => {
    
    const fetchWayBills = async () => {
        const url = `https://staging-express.delhivery.com/waybill/api/bulk/json/?count=1`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${process.env.DELIVERY_TOKEN}`,
            }
        }

        try {
            const response = await axios.get(url, config);
            const trackingDetails = response.data;
            // console.log(trackingDetails, formDetails);
            console.log('Before findOneAndUpdate:', formDetails, orderId);
            const trackDetails = await FormEntry.findOneAndUpdate(
                { orderID: orderId },
                { $set: { waybill: trackingDetails } }
            );
            console.log('After findOneAndUpdate:', trackDetails);
            if (trackDetails) {
                return trackingDetails;
            } else {
                // Handle the case where the document is not found
                throw new Error('Waybill error: Document not found');
            }
        } catch (error) {
            console.error('Delhivery API request error', error);
            // Handle and rethrow the error
            throw error;
        }
    }
    // console.log(formDetails);
    const createShipment = async (trackingDetails) => {
        const url = 'https://staging-express.delhivery.com/api/cmu/create.json';
    // const waybill = formDetails.waybill.toString();
    const createData = {
        format: "json", 
        data:  JSON.stringify({
            "shipments": [
              {
                "name": `${formDetails.name}`,
                "add": `${formDetails.address}`,
                "pin": `${formDetails.pincode}`,
                "city": `${formDetails.city}`,
                "state": `${formDetails.state}`,
                "country": "India",
                "phone": "9016528043",
                "order": `${trackingDetails}`,
                "payment_mode": "Prepaid",
                "return_pin": "",
                "return_city": "",
                "return_phone": "",
                "return_add": "",
                "return_state": "",
                "return_country": "",
                "products_desc": `${formDetails.orderID}`,
                "hsn_code": "",
                "cod_amount": "0",
                "order_date": null,
                "total_amount": `${formDetails.amount}`,
                "seller_add": "",
                "seller_name": "",
                "seller_inv": "",
                "quantity": "",
                "waybill": `${trackingDetails}`,
                "shipment_width": "",
                "shipment_height": "",
                "weight": "500",
                "seller_gst_tin": "24AHZPC4690G1Z0",
                "shipping_mode": "Surface",
                "address_type": "home"
              }
            ],
            "pickup_location": {
              "name": "KRISHNA SURFACE",
              "add": "SONARI NIGHT WEAR SNEH SUDHA COMPLEX MUSIC COLLEGE ROAD OPP SURSAGAR LAKE DANDIABAZAR",
              "city": "Vadodara",
              "pin_code": 390001,
              "country": "India",
              "phone": "9427542349"
            }
          })
    };
    const formData = qs.stringify(createData);
    const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Token ${process.env.DELIVERY_TOKEN}`,
        }

          try {
            const response = await axios.post(url, formData, { headers });
            return response.data
            console.log('Response:', response.data);
            return response.data
          } catch (error) {
            console.error('Error:', error);

          }
    }


    try {
        const trackingDetails = await fetchWayBills();
        console.log(trackingDetails);
        const createShipmentData = await createShipment(trackingDetails);
        console.log(createShipmentData);
        return trackingDetails;
    } catch (error) {
        // Handle the error and return an appropriate response
        return { error: error.message };
    }

}


const backendVerification = async (req, res) => {
   const merchantTransactionId=req.query.transactionId;
    const orderId=req.query.merchantOrderId;
   const merchantId=req.query.merchantId;
   const keyIndex = 1;
//    const key = `${process.env.PHONE_PE_KEY}`;
    const key ='099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'
   const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + key;
   const sha256 = crypto.createHash('sha256').update(string).digest('hex');
   const checksum = sha256 + "###" + keyIndex;
   const maxRetries = 10;
    let retries = 0;
    while(retries <maxRetries){
        try {
            const URL = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`
           const options ={
            method:'GET',
            url:URL,
            headers:{
                accept: 'application/json',
                'Content-Type':'application/json',
                'X-VERIFY':checksum,
                'X-MERCHANT-ID': `${merchantId}`
            }
           }
           const response = await axios(options);
           console.log(response.data.success);
        
           if (response.data.success === true) {
               const url = 'https://sonarinightwear.netlify.app/OrderHistory';
               console.log('Hello world this is message after a successful transaction');
               
               const result = await FormEntry.findOneAndUpdate(
                            {orderID:orderId},
                            {$set: {isPaymentSuccessful: true}}
                        );
               
                // console.log('Before findOneAndUpdate:', result, orderId);
                if(result){
                    const trackingDetails = await createDelhiveryShipment(result, orderId);
                    if (trackingDetails){

                        
                        return res.redirect(url);
                    }else{
                        return res.status(500).json({ error: 'Failed to create shipment' });
                    }
                    
                }
                else{
                    return res.status(500).json({ error: 'Error Updating the Form.' });
                }
           } else {
               const url = 'https://sonarinightwear.netlify.app/HomePage';
               return res.redirect(url);
           }
           } catch (error) {
            
            if (error.response && error.response.status === 429) {
                // Retry after a delay
                retries++;
                await new Promise(resolve => setTimeout(resolve, 4000)); // 2 second delay
            } else {
                // Handle other errors
                console.log(error);
                break;
            }
           }
    }
    return res.status(500).json({ error: 'Max retries reached, unable to process the request' });
   
}

module.exports = {
    getRazerPayController,
    getRazerPayDataController,
    backendVerification
}