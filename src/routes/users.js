const express = require('express');
const router = express.Router();
const { addUser, getUserById } = require('../controllers/usersController');

router.post('/', addUser);
router.get('/:id', getUserById);

module.exports = router;