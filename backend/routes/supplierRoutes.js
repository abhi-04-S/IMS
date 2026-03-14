const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { auth } = require('../middleware/auth');

router.get('/', auth, supplierController.getAllSuppliers);
router.get('/:id', auth, supplierController.getSupplierById);
router.post('/', auth, supplierController.createSupplier);
router.put('/:id', auth, supplierController.updateSupplier);
router.delete('/:id', auth, supplierController.deleteSupplier);

module.exports = router;