const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const {
    addApplication,
    getApplicationById,
    updateApplication,
    getApplicationsByUser
} = require('../controllers/applicationsController');

router.post('/', authMiddleware, addApplication);
router.get('/user', authMiddleware, getApplicationsByUser); // Sesuai GET /applications/user
router.get('/:id', authMiddleware, getApplicationById);
router.put('/:id', authMiddleware, updateApplication);

module.exports = router;