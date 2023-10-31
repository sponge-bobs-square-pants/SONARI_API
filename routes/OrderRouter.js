const express = require('express');
const {OrderController} = require('../controllers/products')
const router = express.Router();


router.route('/').get(OrderController)

module.exports = router;