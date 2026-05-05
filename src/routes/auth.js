const express = require('express');
const router = express.Router();
const { login, refreshAuth, logout } = require('../controllers/authController');

router.post('/', login);
router.put('/', refreshAuth);
router.delete('/', logout);

module.exports = router;