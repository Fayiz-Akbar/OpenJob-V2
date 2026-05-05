const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');
const { addDocument, getAllDocuments, getDocumentById, deleteDocument } = require('../controllers/documentsController');

router.post('/', authMiddleware, (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ status: 'failed', message: err.message });
        }
        next();
    });
}, addDocument);

router.get('/', getAllDocuments);
router.get('/:id', getDocumentById);
router.delete('/:id', authMiddleware, deleteDocument);

module.exports = router;