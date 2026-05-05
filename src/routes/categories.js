const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { addCategory, getAllCategories } = require('../controllers/categoriesController');

router.post('/', authMiddleware, addCategory);
router.get('/', getAllCategories);

module.exports = router;
