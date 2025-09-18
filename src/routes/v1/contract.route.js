const express = require('express');
const contractController = require('../../controllers/contract.controller');

const router = express.Router();

router.route('/').post(contractController.createContract);

module.exports = router;
