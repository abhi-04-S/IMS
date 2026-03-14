const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', auth, productController.getAllProducts);
router.get('/stocks', auth, productController.getCurrentStocks);
router.get('/:id', auth, productController.getProductById);
router.post('/', auth, upload.single('image'), productController.createProduct);
router.put('/:id', auth, upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;