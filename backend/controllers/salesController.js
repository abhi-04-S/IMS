// const db = require('../config/db');

// // Create sale
// exports.createSale = async (req, res) => {
//   const connection = await db.getConnection();
  
//   try {
//     await connection.beginTransaction();

//     const { customercode, productcode, quantity, soldby } = req.body;
//     const date = new Date().toISOString().split('T')[0];

//     // Get product details
//     const [products] = await connection.query('SELECT * FROM products WHERE productcode = ?', [productcode]);
//     if (products.length === 0) {
//       await connection.rollback();
//       return res.status(404).json({ success: false, message: 'Product not found' });
//     }

//     const product = products[0];
//     const revenue = product.sellingprice * quantity;

//     // Check stock availability
//     const [stocks] = await connection.query('SELECT * FROM currentstocks WHERE productcode = ?', [productcode]);
//     if (stocks.length === 0 || stocks[0].quantity < quantity) {
//       await connection.rollback();
//       return res.status(400).json({ success: false, message: 'Insufficient stock' });
//     }

//     // Insert sale record
//     await connection.query(
//       'INSERT INTO salesreport (date, customercode, productcode, quantity, revenue, soldby) VALUES (?, ?, ?, ?, ?, ?)',
//       [date, customercode, productcode, quantity, revenue, soldby]
//     );

//     // Update current stock
//     await connection.query(
//       'UPDATE currentstocks SET quantity = quantity - ? WHERE productcode = ?',
//       [quantity, productcode]
//     );

//     // Update customer balance (debit increases)
//     await connection.query(
//       'UPDATE customers SET debit = debit + ?, balance = debit - credit WHERE customercode = ?',
//       [revenue, customercode]
//     );

//     await connection.commit();
//     console.log('Sale created:', productcode, 'Qty:', quantity);
//     res.status(201).json({ success: true, message: 'Sale recorded successfully', revenue });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Create sale error:', error);
//     res.status(500).json({ success: false, message: 'Error recording sale', error: error.message });
//   } finally {
//     connection.release();
//   }
// };

// // Get all sales
// exports.getAllSales = async (req, res) => {
//   try {
//     const [sales] = await db.query(`
//       SELECT s.*, c.fullname as customer_name, p.productname 
//       FROM salesreport s
//       LEFT JOIN customers c ON s.customercode = c.customercode
//       LEFT JOIN products p ON s.productcode = p.productcode
//       ORDER BY s.created_at DESC
//     `);
//     res.json({ success: true, data: sales });
//   } catch (error) {
//     console.error('Get sales error:', error);
//     res.status(500).json({ success: false, message: 'Error fetching sales', error: error.message });
//   }
// };

// // Get sales by date range
// exports.getSalesByDateRange = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const [sales] = await db.query(
//       `SELECT s.*, c.fullname as customer_name, p.productname 
//        FROM salesreport s
//        LEFT JOIN customers c ON s.customercode = c.customercode
//        LEFT JOIN products p ON s.productcode = p.productcode
//        WHERE s.date BETWEEN ? AND ?
//        ORDER BY s.date DESC`,
//       [startDate, endDate]
//     );
//     res.json({ success: true, data: sales });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching sales', error: error.message });
//   }
// };

// // Get sales summary
// exports.getSalesSummary = async (req, res) => {
//   try {
//     const [totalSales] = await db.query('SELECT SUM(revenue) as total FROM salesreport');
//     const [todaySales] = await db.query('SELECT SUM(revenue) as today FROM salesreport WHERE date = CURDATE()');
//     const [monthlySales] = await db.query('SELECT SUM(revenue) as monthly FROM salesreport WHERE MONTH(date) = MONTH(CURDATE())');
    
//     res.json({
//       success: true,
//       data: {
//         total: totalSales[0].total || 0,
//         today: todaySales[0].today || 0,
//         monthly: monthlySales[0].monthly || 0
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching summary', error: error.message });
//   }
// };

// ============================================
// FILE: backend/controllers/salesController.js - REPLACE ENTIRE FILE
// ============================================
const db = require('../config/db');

// Create sale
exports.createSale = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { customercode, productcode, quantity, soldby } = req.body;
    const date = new Date().toISOString().split('T')[0];

    // Get product details
    const [products] = await connection.query('SELECT * FROM products WHERE productcode = ?', [productcode]);
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = products[0];
    const revenue = product.sellingprice * quantity;

    // Check stock availability in currentstocks table
    const [stocks] = await connection.query('SELECT * FROM currentstocks WHERE productcode = ?', [productcode]);
    if (stocks.length === 0 || stocks[0].quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Available: ${stocks[0]?.quantity || 0} units` 
      });
    }

    // Insert sale record
    await connection.query(
      'INSERT INTO salesreport (date, customercode, productcode, quantity, revenue, soldby) VALUES (?, ?, ?, ?, ?, ?)',
      [date, customercode, productcode, quantity, revenue, soldby]
    );

    // ✅ UPDATE 1: Update current stock table
    await connection.query(
      'UPDATE currentstocks SET quantity = quantity - ? WHERE productcode = ?',
      [quantity, productcode]
    );

    // ✅ UPDATE 2: Update products table quantity (THIS WAS MISSING!)
    await connection.query(
      'UPDATE products SET quantity = quantity - ? WHERE productcode = ?',
      [quantity, productcode]
    );

    // Update customer balance (debit increases)
    await connection.query(
      'UPDATE customers SET debit = debit + ?, balance = debit - credit WHERE customercode = ?',
      [revenue, customercode]
    );

    await connection.commit();
    console.log('✅ Sale created:', productcode, 'Qty:', quantity);
    res.status(201).json({ 
      success: true, 
      message: 'Sale recorded successfully', 
      revenue,
      remainingStock: stocks[0].quantity - quantity
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Create sale error:', error);
    res.status(500).json({ success: false, message: 'Error recording sale', error: error.message });
  } finally {
    connection.release();
  }
};

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT s.*, c.fullname as customer_name, p.productname 
      FROM salesreport s
      LEFT JOIN customers c ON s.customercode = c.customercode
      LEFT JOIN products p ON s.productcode = p.productcode
      ORDER BY s.created_at DESC
    `);
    res.json({ success: true, data: sales });
  } catch (error) {
    console.error('❌ Get sales error:', error);
    res.status(500).json({ success: false, message: 'Error fetching sales', error: error.message });
  }
};

// Get sales by date range
exports.getSalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const [sales] = await db.query(
      `SELECT s.*, c.fullname as customer_name, p.productname 
       FROM salesreport s
       LEFT JOIN customers c ON s.customercode = c.customercode
       LEFT JOIN products p ON s.productcode = p.productcode
       WHERE s.date BETWEEN ? AND ?
       ORDER BY s.date DESC`,
      [startDate, endDate]
    );
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sales', error: error.message });
  }
};

// Get sales summary
exports.getSalesSummary = async (req, res) => {
  try {
    const [totalSales] = await db.query('SELECT SUM(revenue) as total FROM salesreport');
    const [todaySales] = await db.query('SELECT SUM(revenue) as today FROM salesreport WHERE date = CURDATE()');
    const [monthlySales] = await db.query('SELECT SUM(revenue) as monthly FROM salesreport WHERE MONTH(date) = MONTH(CURDATE())');
    
    res.json({
      success: true,
      data: {
        total: totalSales[0].total || 0,
        today: todaySales[0].today || 0,
        monthly: monthlySales[0].monthly || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching summary', error: error.message });
  }
};