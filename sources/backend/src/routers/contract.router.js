const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');

router.post('/info/:version', contractController.getContractInfo);

module.exports = router;