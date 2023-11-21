    require('dotenv').config();
    // async errors
    require('express-async-errors');
    const express = require('express');
    const cors = require('cors');
    const app = express();
    const axios = require('axios')
    const notFoundMiddleware = require('./middleware/not-found');
    const errorMiddleware = require('./middleware/error-handler');
    const connectDB = require('./db/connect');
    const productsRouter = require('./routes/products');
    const razorRouter = require('./routes/razorRouter')
    const razorPayDataRouter = require('./routes/razorPayDataRouter')
    const port = process.env.PORT || 5000
    const backendPaymentVerification = require('./routes/backendPaymentVerification')
    const formAuthMiddleware = require('./middleware/formAuthMiddleware')
    const formEntryRouter = require('./routes/formEntryRouter');
    const OrderRouter = require('./routes/OrderRouter')
    const FormEntry = require('./FormEntry');




    app.use(express.json());
    app.use(cors());
    app.get('/', (req, res) => {
        res.send(`<h1>Store API</h1><a href='/api/v1/products'>products route</a>`);
    })

    app.use('/api/v1/products', productsRouter)
    // app.use('/api/v1/razorpayRouter', razorpayRouter)
    app.use('/api/v1/razorpaydata', razorPayDataRouter)
    app.use('/api/v1/razorpay', razorRouter)
    app.use('/api/v1/submitForm',formAuthMiddleware, formEntryRouter);
    app.use('/api/v1/verification', backendPaymentVerification)
    app.use('/api/v1/Order',formAuthMiddleware, OrderRouter)
    app.get('/api/v1/packages', async (req, res) => {
        const waybill = req.query.waybills
        // console.log(waybill);
        const url =`https://staging-express.delhivery.com/api/v1/packages/json/?waybill=${waybill}`
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${process.env.DELIVERY_TOKEN}`,
            }
        }
        try {
            const response = await axios.get(url, config);
            // console.log(response.data.ShipmentData);

            const statusData = response.data.ShipmentData
            if(statusData.length > 0){
                const firstShipment = statusData[0];
                // const Details = firstShipment?.Shipment?.Scans;
                const status = firstShipment?.Shipment?.Status;
                if (status) {
                    res.status(200).json({Status: status})
                    // console.log(Shipment);
                } else {
                    console.log('Status not found in the response');
                }
            
            }else {
                console.log('No shipment data in the response');
              }
            // console.log(status);
           
        } catch (error) {
            console.log(error);
        }
        // res.json({msg: waybills})
    })


    app.get('/api/v1/OrderAdmin', formAuthMiddleware, async (req, res) => {
        const orders = await FormEntry.find({isPaymentSuccessful: true});
        const nbHits = orders.length;
        res.json({orders, nbHits})
    })

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);


    const start = async () =>{
        try {
            await connectDB(process.env.MONGO_URI)
            app.listen(port, console.log(`Server is listening on port ${port}...`));
        } catch (error) {
            console.log(error);
        }
    }

    start()

