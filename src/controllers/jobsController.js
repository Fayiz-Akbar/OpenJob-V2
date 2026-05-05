const pool = require('../config/database');

const addJob = async (req, res) => {
    try {
        const { title, description, companyId } = req.body;
        const createdBy = req.user.id; 
        const id = `job-${Date.now()}`;

        const query = {
            text: 'INSERT INTO jobs (id, title, description, company_id, created_by) VALUES($1, $2, $3, $4, $5) RETURNING id',
            values: [id, title, description, companyId, createdBy],
        };
        const result = await pool.query(query);

        res.status(201).json({ status: 'success', data: { id: result.rows[0].id } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getAllJobs = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, title, description, company_id FROM jobs');
        res.status(200).json({ status: 'success', data: result.rows });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { addJob, getAllJobs };