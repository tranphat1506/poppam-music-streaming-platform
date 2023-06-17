const express = require('express')
const router = express.Router();
const userController = require('../controllers/user.controller');

// FE will fetch user info in this route
router.get('/info/:publicAddress', userController.getInfo)

// FE will fetch user library in this route
router.get('/library/:publicAddress', userController.getLibrary)


module.exports = router