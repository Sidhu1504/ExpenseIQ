const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Apply the security middleware to all routes in this file
router.use(verifyToken); 

router.post('/', transactionController.addTransaction);
router.get('/', transactionController.getTransactions);

module.exports = router;
