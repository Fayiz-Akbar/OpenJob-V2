const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');
const { addDocument, getAllDocuments, getDocumentById, deleteDocument } = require('../controllers/documentsController');

// CREATE: Upload dengan Auth & Multer middleware
router.post('/', authMiddleware, (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ status: 'failed', message: err.message });
        }
        next();
    });
}, addDocument);

// READ: Ambil semua dokumen
router.get('/', getAllDocuments);

// READ: Lihat/Download dokumen spesifik berdasarkan ID
router.get('/:id', getDocumentById);

// DELETE: Hapus dokumen (Membutuhkan Auth)
router.delete('/:id', authMiddleware, deleteDocument);

module.exports = router;