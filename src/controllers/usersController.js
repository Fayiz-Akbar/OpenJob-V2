const bcrypt = require('bcrypt');
const pool = require('../config/database');

const addUser = async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // Validasi payload
        if (!name || !email || !password) {
            return res.status(400).json({ status: 'failed', message: 'Payload tidak lengkap atau tidak valid' });
        }

        const id = `user-${Date.now()}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = {
            text: 'INSERT INTO users (id, name, email, password, role) VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, name, email, hashedPassword, role],
        };

        const result = await pool.query(query);

        res.status(201).json({
            status: 'success',
            data: { id: result.rows[0].id },
        });
    } catch (error) {
        if (error.code === '23505') { // 23505 adalah kode error PostgreSQL untuk Unique Violation (Email sudah ada)
            return res.status(400).json({ status: 'failed', message: 'Email sudah digunakan' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = {
            text: 'SELECT id, name, email, role FROM users WHERE id = $1',
            values: [id],
        };
        const result = await pool.query(query);

        if (!result.rows.length) {
            return res.status(404).json({ status: 'failed', message: 'User tidak ditemukan' });
        }

        res.status(200).json({
            status: 'success',
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { addUser, getUserById };