const express = require('express');
const { getAllProductsStatic, getAllProducts, getSingleProduct } = require('../controllers/products');
// const {getRazerPay} = require('../controllers/getRazerPay')
const router = express.Router();

router.route('/').get(getAllProducts);
router.route('/static').get(getAllProductsStatic)
router.route('/:id').get(getSingleProduct)
// router.route('/').post(getRazerPay)
module.exports = router;