const bcrypt = require('bcrypt');
const pool = require('../config/database');
const redisClient = require('../config/redis'); // Sesuaikan path

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
        const cacheKey = `user:${id}`;

        // 1. Cek apakah ada data di Cache Redis
        const cachedUser = await redisClient.get(cacheKey);
        
        if (cachedUser) {
            // Jika ada di cache, set custom header dan kembalikan data darinya
            res.setHeader('X-Data-Source', 'cache');
            return res.status(200).json({
                status: 'success',
                data: JSON.parse(cachedUser),
            });
        }

        // 2. Jika tidak ada di cache, load dari database
        const query = {
            text: 'SELECT id, name, email, role FROM users WHERE id = $1',
            values: [id],
        };
        const result = await pool.query(query);

        if (!result.rows.length) {
            return res.status(404).json({ status: 'failed', message: 'User tidak ditemukan' });
        }

        const userData = result.rows[0];

        // 3. Simpan hasil query ke cache dengan expired 1 jam (3600 detik)
        await redisClient.set(cacheKey, JSON.stringify(userData), {
            EX: 3600 
        });

        res.status(200).json({
            status: 'success',
            data: userData,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role = 'user' } = req.body;

        // Validasi payload
        if (!name || !email || !password) {
            return res.status(400).json({ status: 'failed', message: 'Payload tidak lengkap atau tidak valid' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = {
            text: 'UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5',
            values: [name, email, hashedPassword, role, id],
        };

        const result = await pool.query(query);

        if (!result.rows.length) {
            return res.status(404).json({ status: 'failed', message: 'User tidak ditemukan' });
        }

        // Hapus cache yang terkait user tersebut
        await redisClient.del(`user:${id}`);

        res.status(200).json({
            status: 'success',
            data: { id },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { addUser, getUserById, updateUser };