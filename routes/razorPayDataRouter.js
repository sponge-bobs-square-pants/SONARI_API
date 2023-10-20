const express = require('express');
const { getRazerPayController, getRazerPayDataController } = require('../controllers/getRazerPay');
const router = express.Router();

router.route('/').post(getRazerPayDataController);

module.exports = router;