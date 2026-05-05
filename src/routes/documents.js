const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { addDocument, getDocumentById } = require('../controllers/documentsController');

// Penanganan khusus agar jika file > 5MB atau bukan PDF, API mengembalikan format JSON (bukan HTML error)
router.post('/', (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ status: 'failed', message: err.message });
        }
        next();
    });
}, addDocument);

router.get('/:id', getDocumentById);

module.exports = router;