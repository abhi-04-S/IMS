const db = require('../config/db');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Error fetching customers', error: error.message });
  }
};

// Get single customer
exports.getCustomerById = async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM customers WHERE cid = ?', [req.params.id]);
    if (customers.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customers[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customer', error: error.message });
  }
};

// Create customer
exports.createCustomer = async (req, res) => {
  try {
    const { customercode, fullname, location, phone } = req.body;

    const [result] = await db.query(
      'INSERT INTO customers (customercode, fullname, location, phone) VALUES (?, ?, ?, ?)',
      [customercode, fullname, location, phone]
    );

    console.log('Customer created:', customercode);
    res.status(201).json({ success: true, message: 'Customer created successfully', customerId: result.insertId });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ success: false, message: 'Error creating customer', error: error.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { fullname, location, phone, debit, credit } = req.body;

    await db.query(
      'UPDATE customers SET fullname = ?, location = ?, phone = ?, debit = ?, credit = ?, balance = ? WHERE cid = ?',
      [fullname, location, phone, debit, credit, debit - credit, req.params.id]
    );

    console.log('Customer updated:', req.params.id);
    res.json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ success: false, message: 'Error updating customer', error: error.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    await db.query('DELETE FROM customers WHERE cid = ?', [req.params.id]);
    console.log('Customer deleted:', req.params.id);
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, message: 'Error deleting customer', error: error.message });
  }
};