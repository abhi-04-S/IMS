const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, fullname, location, phone, role, created_at FROM user ORDER BY created_at DESC');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, fullname, location, phone, role, created_at FROM user WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { fullname, location, phone, role, password } = req.body;
    
    let query = 'UPDATE user SET fullname = ?, location = ?, phone = ?, role = ?';
    let params = [fullname, location, phone, role];
    
    // If password is provided, hash it and include in update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      params.push(hashedPassword);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await db.query(query, params);
    
    console.log('User updated:', req.params.id);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    
    await db.query('DELETE FROM user WHERE id = ?', [req.params.id]);
    console.log('User deleted:', req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
};