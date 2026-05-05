const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const {
    addCompany,
    getCompanyById,
    updateCompany
} = require('../controllers/companiesController');

router.get('/:id', getCompanyById); // Biasanya detail company bersifat public
router.put('/:id', authMiddleware, updateCompany); // Update butuh login
router.post('/', addCompany); // Tambahkan route ini

module.exports = router;