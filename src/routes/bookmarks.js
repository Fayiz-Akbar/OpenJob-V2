const express = require('express');
const router = express.Router();

// Import controller yang sudah kita buat
const { 
    getBookmarks, 
    addBookmark, 
    deleteBookmark 
} = require('../controllers/bookmarksController');

// Import middleware autentikasi Anda (sesuaikan path dan namanya jika beda)
const authMiddleware = require('../middlewares/authMiddleware');

// 1. Route GET /bookmarks -> Ambil list bookmark dengan cache Redis
router.get('/', authMiddleware, getBookmarks);

// 2. Route POST /bookmarks -> Tambah bookmark baru & hapus cache
router.post('/', authMiddleware, addBookmark);

// 3. Route DELETE /bookmarks/:id -> Hapus bookmark & hapus cache
router.delete('/:id', authMiddleware, deleteBookmark);

module.exports = router;