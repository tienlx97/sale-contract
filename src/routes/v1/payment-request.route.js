const express = require('express');
const paymentRequestController = require('../../controllers/paymentRequest.controller');

const router = express.Router();

router.route('/').post(paymentRequestController.createPaymentRequest);

module.exports = router;
