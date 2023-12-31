const Product = require('../models/product');


const getAllProductsStatic = async (req, res) => {
    res.status(200).json({msg: `Products testing route`});
 
}
const getSingleProduct = async (req, res) => {
//  res.status(200).json({msg: req.params.id})
    const productID = req.params.id;
    const product = await Product.findById(productID);
    if(!product){
        return res.status(404).json({msg:`No task with the id: ${productID}`})
    }
    return res.status(200).json({product});
}

const getAllProducts = async (req, res) => {
    // res.status(200).json({msg: `Products route`});
    // const data = await Product.find({});
    // return res.status(200).json({data})
    const {Featured,id, Company, ProductName, sort, page, limit, Category} = req.query;
    const queryObject = {};
    
    if(Featured){
        queryObject.Featured = Featured === 'true' ? true : false
    }
    if(id){
        queryObject._id = id;
    }
    if(Company){
        queryObject.Company = Company;
    }
    if(Category){
        queryObject.Category = Category;
    }
    if(ProductName){
        queryObject.ProductName = {$regex: ProductName, $options: 'i'}
    }
   
    let response =  Product.find(queryObject);
    if(sort){
        let sortList = sort.split(',').join(' ');
        
        response = response.sort(sortList);
    }
    else{
        response = response.sort('Price')
    }
    if(page && limit){
        const parsedPage = Number(page) || 1;
        const parsedLimit = Number(limit) || 9;
        const skip = (page - 1) * limit;
        response = response.skip(skip).limit(limit);
    
    }
    const data = await response
    // console.log(data);
    return res.status(200).json({data, nbHits: data.length});
    }

const OrderController = async (req, res) => {
    const FormEntry = require('../FormEntry');
    const id = req.query.id
    const product = await FormEntry.find({userId: id})
    // console.log(product);
    // const waybill = product.filter(product => product.isPaymentSuccessful === true).map(product => product.waybill)
    // const cartArray = product.filter(product => product.isPaymentSuccessful === true).map(product => product.cart);
    const cartArray = product.filter(product => product.isPaymentSuccessful === true);
    const orderDetails = cartArray.map((product) => ({
        order: product.cart,
        waybill:product.waybill
    }));
    // console.log(orderDetails);
    // console.log(waybill.length, cartArray.length);
    return res.json({orders: orderDetails})
}
    

module.exports = {
    getAllProductsStatic,
    getAllProducts,
    getSingleProduct,
    OrderController,
}