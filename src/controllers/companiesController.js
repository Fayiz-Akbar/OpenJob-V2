const pool = require('../config/database');
const redisClient = require('../config/redis');

const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `company:${id}`;

        const cached = await redisClient.get(cacheKey);
        if (cached) {
            res.setHeader('X-Data-Source', 'cache');
            return res.status(200).json({ status: 'success', data: JSON.parse(cached) });
        }

        const query = { text: 'SELECT * FROM companies WHERE id = $1', values: [id] };
        const result = await pool.query(query);

        if (!result.rows.length) return res.status(404).json({ status: 'failed', message: 'Company tidak ditemukan' });

        await redisClient.set(cacheKey, JSON.stringify(result.rows[0]), { EX: 3600 });
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const query = {
            text: 'UPDATE companies SET name = $1, description = $2 WHERE id = $3 RETURNING id',
            values: [name, description, id]
        };
        const result = await pool.query(query);
        
        if (!result.rows.length) return res.status(404).json({ status: 'failed', message: 'Company tidak ditemukan' });

        // Invalidate cache perusahaan
        await redisClient.del(`company:${id}`);

        res.status(200).json({ status: 'success', message: 'Company updated' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const addCompany = async (req, res) => {
    try {
        const { name, description = '' } = req.body;
        const id = `company-${Date.now()}`;

        const query = {
            text: 'INSERT INTO companies (id, name, description) VALUES($1, $2, $3) RETURNING id',
            values: [id, name, description],
        };
        const result = await pool.query(query);

        res.status(201).json({
            status: 'success',
            data: { id: result.rows[0].id },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { getCompanyById, updateCompany, addCompany };