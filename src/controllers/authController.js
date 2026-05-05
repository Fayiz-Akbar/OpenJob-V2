const bcrypt = require('bcrypt');
const pool = require('../config/database');
const TokenManager = require('../utils/tokenManager');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = {
            text: 'SELECT id, password, role FROM users WHERE email = $1',
            values: [email],
        };
        const result = await pool.query(query);

        if (!result.rows.length) {
            return res.status(401).json({ status: 'failed', message: 'Kredensial yang Anda berikan salah' });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ status: 'failed', message: 'Kredensial yang Anda berikan salah' });
        }

        const accessToken = TokenManager.generateAccessToken({ id: user.id, role: user.role });
        const refreshToken = TokenManager.generateRefreshToken({ id: user.id, role: user.role });

        await pool.query('INSERT INTO authentications (token) VALUES($1)', [refreshToken]);

        // Postman script membutuhkan kembalian data persis seperti ini
        res.status(200).json({
            status: 'success',
            data: { accessToken, refreshToken },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};


const refreshAuth = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ status: 'failed', message: 'Refresh token tidak boleh kosong' });
        }

        // Verifikasi token di database
        const query = {
            text: 'SELECT token FROM authentications WHERE token = $1',
            values: [refreshToken],
        };
        const result = await pool.query(query);

        if (!result.rows.length) {
            return res.status(400).json({ status: 'failed', message: 'Refresh token tidak valid di database' });
        }

        // Verifikasi signature JWT
        try {
            const { id, role } = TokenManager.verifyRefreshToken(refreshToken);
            const accessToken = TokenManager.generateAccessToken({ id, role });

            res.status(200).json({
                status: 'success',
                data: { accessToken },
            });
        } catch (error) {
            return res.status(400).json({ status: 'failed', message: 'Refresh token tidak valid' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ status: 'failed', message: 'Refresh token tidak boleh kosong' });
        }

        // Cek dulu apakah token ada di database (sesuai skenario Postman)
        const checkQuery = {
            text: 'SELECT token FROM authentications WHERE token = $1',
            values: [refreshToken],
        };
        const checkResult = await pool.query(checkQuery);

        if (!checkResult.rows.length) {
            return res.status(400).json({ status: 'failed', message: 'Refresh token tidak ditemukan di database' });
        }

        // Hapus token
        await pool.query('DELETE FROM authentications WHERE token = $1', [refreshToken]);

        res.status(200).json({ status: 'success', message: 'Refresh token berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { login, refreshAuth, logout};