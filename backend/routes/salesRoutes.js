const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { auth } = require('../middleware/auth');

router.post('/', auth, salesController.createSale);
router.get('/', auth, salesController.getAllSales);
router.get('/summary', auth, salesController.getSalesSummary);
router.get('/daterange', auth, salesController.getSalesByDateRange);

module.exports = router;