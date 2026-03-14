const db = require('../config/db');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.*, s.fullname as supplier_name 
      FROM products p 
      LEFT JOIN suppliers s ON p.suppliercode = s.suppliercode 
      ORDER BY p.created_at DESC
    `);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products WHERE pid = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: products[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { productcode, productname, suppliercode, quantity, costprice, sellingprice, brand, category } = req.body;
    const image = req.file ? req.file.filename : null;
    const date = new Date().toISOString().split('T')[0];

    // Insert product
    const [result] = await db.query(
      `INSERT INTO products (productcode, productname, suppliercode, date, quantity, costprice, sellingprice, brand, category, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productcode, productname, suppliercode, date, quantity, costprice, sellingprice, brand, category, image]
    );

    // Update or create current stock
    const [existingStock] = await db.query('SELECT * FROM currentstocks WHERE productcode = ?', [productcode]);
    
    if (existingStock.length > 0) {
      await db.query(
        'UPDATE currentstocks SET quantity = quantity + ?, productname = ? WHERE productcode = ?',
        [quantity, productname, productcode]
      );
    } else {
      await db.query(
        'INSERT INTO currentstocks (productcode, productname, quantity) VALUES (?, ?, ?)',
        [productcode, productname, quantity]
      );
    }

    console.log('Product created:', productcode);
    res.status(201).json({ success: true, message: 'Product created successfully', productId: result.insertId });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Error creating product', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { productname, suppliercode, quantity, costprice, sellingprice, brand, category } = req.body;
    const image = req.file ? req.file.filename : null;

    let query = `UPDATE products SET productname = ?, suppliercode = ?, quantity = ?, costprice = ?, sellingprice = ?, brand = ?, category = ?`;
    let params = [productname, suppliercode, quantity, costprice, sellingprice, brand, category];

    if (image) {
      query += `, image = ?`;
      params.push(image);
    }

    query += ` WHERE pid = ?`;
    params.push(req.params.id);

    await db.query(query, params);

    console.log('Product updated:', req.params.id);
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE pid = ?', [req.params.id]);
    console.log('Product deleted:', req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
  }
};

// Get current stocks
exports.getCurrentStocks = async (req, res) => {
  try {
    const [stocks] = await db.query('SELECT * FROM currentstocks ORDER BY productname');
    res.json({ success: true, data: stocks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stocks', error: error.message });
  }
};