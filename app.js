    require('dotenv').config();
    // async errors
    require('express-async-errors');
    const express = require('express');
    const cors = require('cors');
    const app = express();

    // const Razorpay = require('razorpay')
    // const shortid = require('shortid')

    const notFoundMiddleware = require('./middleware/not-found');
    const errorMiddleware = require('./middleware/error-handler');
    const connectDB = require('./db/connect');
    const productsRouter = require('./routes/products');
    const razorRouter = require('./routes/razorRouter')
    const razorPayDataRouter = require('./routes/razorPayDataRouter')
    const port = process.env.PORT || 5000
  
    const formAuthMiddleware = require('./middleware/formAuthMiddleware')
    const formEntryRouter = require('./routes/formEntryRouter')
    // const razorpay = new Razorpay({ key_id:process.env.RAZOR_PAY_ID, key_secret: process.env.RAZOR_PAY_SECRET })
    //middleware

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

