const express = require('express')
const router = express.Router();
// import { formDataEntry } from '../controllers/formController';
const {formDataEntry} = require('../controllers/formController')

router.route('/').post(formDataEntry)

module.exports = router;
