const db = require('../config/db');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: 'Error fetching suppliers', error: error.message });
  }
};

// Get single supplier
exports.getSupplierById = async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM suppliers WHERE sid = ?', [req.params.id]);
    if (suppliers.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, data: suppliers[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching supplier', error: error.message });
  }
};

// Create supplier
exports.createSupplier = async (req, res) => {
  try {
    const { suppliercode, fullname, location, phone } = req.body;

    const [result] = await db.query(
      'INSERT INTO suppliers (suppliercode, fullname, location, phone) VALUES (?, ?, ?, ?)',
      [suppliercode, fullname, location, phone]
    );

    console.log('Supplier created:', suppliercode);
    res.status(201).json({ success: true, message: 'Supplier created successfully', supplierId: result.insertId });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ success: false, message: 'Error creating supplier', error: error.message });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { fullname, location, phone, debit, credit } = req.body;

    await db.query(
      'UPDATE suppliers SET fullname = ?, location = ?, phone = ?, debit = ?, credit = ?, balance = ? WHERE sid = ?',
      [fullname, location, phone, debit, credit, debit - credit, req.params.id]
    );

    console.log('Supplier updated:', req.params.id);
    res.json({ success: true, message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, message: 'Error updating supplier', error: error.message });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    await db.query('DELETE FROM suppliers WHERE sid = ?', [req.params.id]);
    console.log('Supplier deleted:', req.params.id);
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ success: false, message: 'Error deleting supplier', error: error.message });
  }
};