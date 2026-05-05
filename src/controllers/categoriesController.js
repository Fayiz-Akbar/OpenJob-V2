const pool = require('../config/database');

const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const id = `category-${Date.now()}`;

        const query = {
            text: 'INSERT INTO categories (id, name) VALUES($1, $2) RETURNING id',
            values: [id, name],
        };
        const result = await pool.query(query);

        res.status(201).json({ status: 'success', data: { id: result.rows[0].id } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name FROM categories');
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { addCategory, getAllCategories };
