const express = require('express');
const { backendVerification } = require('../controllers/getRazerPay');
const router = express.Router();

router.route('/').post(backendVerification);

module.exports = router;
