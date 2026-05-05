const pool = require('../config/database');
const redisClient = require('../config/redis');

const getBookmarks = async (req, res) => {
    try {
        const userId = req.user.id;
        const cacheKey = `bookmarks:${userId}`;

        const cached = await redisClient.get(cacheKey);
        if (cached) {
            res.setHeader('X-Data-Source', 'cache');
            return res.status(200).json({ status: 'success', data: JSON.parse(cached) });
        }

        const query = { text: 'SELECT * FROM bookmarks WHERE user_id = $1', values: [userId] };
        const result = await pool.query(query);

        await redisClient.set(cacheKey, JSON.stringify(result.rows), { EX: 3600 });
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const addBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { jobId } = req.body;
        const id = `bookmark-${Date.now()}`;

        const query = {
            text: 'INSERT INTO bookmarks (id, user_id, job_id) VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, jobId]
        };
        await pool.query(query);

        // Invalidate cache bookmarks list karena data berubah (bertambah)
        await redisClient.del(`bookmarks:${userId}`);

        res.status(201).json({ status: 'success', message: 'Bookmark ditambahkan' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const deleteBookmark = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const query = { text: 'DELETE FROM bookmarks WHERE id = $1 AND user_id = $2', values: [id, userId] };
        await pool.query(query);

        // Invalidate cache bookmarks list karena data berubah (berkurang)
        await redisClient.del(`bookmarks:${userId}`);

        res.status(200).json({ status: 'success', message: 'Bookmark dihapus' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { getBookmarks, addBookmark, deleteBookmark };