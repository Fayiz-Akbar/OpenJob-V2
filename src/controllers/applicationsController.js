const pool = require('../config/database');
const redisClient = require('../config/redis');
const { sendMessage } = require('../services/rabbitmq'); // Import fungsi RabbitMQ

const addApplication = async (req, res) => {
    try {
        const { coverLetter, jobId } = req.body;
        const userId = req.user.id; 
        const id = `application-${Date.now()}`;

        // 1. Simpan ke PostgreSQL
        const query = {
            text: 'INSERT INTO applications (id, cover_letter, user_id, job_id) VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, coverLetter, userId, jobId],
        };
        const result = await pool.query(query);
        const applicationId = result.rows[0].id;

        // 2. Hapus Cache (Redis)
        await redisClient.del(`applications:user:${userId}`);
        await redisClient.del(`applications:job:${jobId}`);

        // 3. PUBLISH KE RABBITMQ (Poin Basic Kriteria 3)
        // Queue name misalnya: 'export:applications' atau 'notification:application'
        const queueName = 'notification:application';
        const messagePayload = JSON.stringify({ application_id: applicationId });
        
        await sendMessage(queueName, messagePayload);

        res.status(201).json({ status: 'success', data: { id: applicationId } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `application:${id}`;

        const cached = await redisClient.get(cacheKey);
        if (cached) {
            res.setHeader('X-Data-Source', 'cache');
            return res.status(200).json({ status: 'success', data: JSON.parse(cached) });
        }

        const query = { text: 'SELECT * FROM applications WHERE id = $1', values: [id] };
        const result = await pool.query(query);

        if (!result.rows.length) return res.status(404).json({ status: 'failed', message: 'Lamaran tidak ditemukan' });

        await redisClient.set(cacheKey, JSON.stringify(result.rows[0]), { EX: 3600 });
        res.status(200).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // misal mengubah status lamaran

        // Ambil data lamaran dulu untuk mengetahui userId dan jobId agar bisa menghapus cache list
        const checkQuery = { text: 'SELECT user_id, job_id FROM applications WHERE id = $1', values: [id] };
        const checkResult = await pool.query(checkQuery);
        
        if (!checkResult.rows.length) return res.status(404).json({ status: 'failed', message: 'Lamaran tidak ditemukan' });
        
        const { user_id: userId, job_id: jobId } = checkResult.rows[0];

        // Update ke database
        const updateQuery = {
            text: 'UPDATE applications SET status = $1 WHERE id = $2 RETURNING id',
            values: [status, id]
        };
        await pool.query(updateQuery);

        // Kriteria Advanced: Hapus cache detail dan cache list
        await redisClient.del(`application:${id}`);
        await redisClient.del(`applications:user:${userId}`);
        await redisClient.del(`applications:job:${jobId}`);

        res.status(200).json({ status: 'success', message: 'Lamaran berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getApplicationsByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const cacheKey = `applications:user:${userId}`;

        const cached = await redisClient.get(cacheKey);
        if (cached) {
            res.setHeader('X-Data-Source', 'cache');
            return res.status(200).json({ status: 'success', data: JSON.parse(cached) });
        }

        const query = { text: 'SELECT * FROM applications WHERE user_id = $1', values: [userId] };
        const result = await pool.query(query);

        await redisClient.set(cacheKey, JSON.stringify(result.rows), { EX: 3600 });
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { addApplication, getApplicationById, updateApplication, getApplicationsByUser };