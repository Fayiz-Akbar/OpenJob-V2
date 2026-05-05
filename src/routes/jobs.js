const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { addJob, getAllJobs } = require('../controllers/jobsController');

router.post('/', authMiddleware, addJob);
router.get('/', getAllJobs);

module.exports = router;