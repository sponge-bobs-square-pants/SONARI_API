const express = require('express');
const { getRazerPayController } = require('../controllers/getRazerPay');
const router = express.Router();

router.route('/').post(getRazerPayController);

module.exports = router;
