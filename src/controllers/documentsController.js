const path = require('path');
const fs = require('fs');

const addDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'failed',
                message: 'File is required'
            });
        }

        const { filename, originalname, size } = req.file;
        const documentId = `document-${Date.now()}`;

        // TODO Nanti: Insert documentId, filename, originalname, size ke tabel database PostgreSQL kamu di sini

        res.status(201).json({
            status: 'success',
            data: {
                documentId,
                filename,
                originalName: originalname,
                size
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;

        // TODO Nanti: Ambil 'filename' dan 'original_name' dari tabel database berdasarkan ID dokumen
        // Untuk sekarang, kita bypass logika DB agar endpoint bisa diuji dulu
        const filenameDariDB = req.file ? req.file.filename : 'dummy.pdf'; 
        const originalNameDariDB = req.file ? req.file.originalname : 'dummy.pdf';

        const filePath = path.join(__dirname, '../../uploads/documents/', filenameDariDB);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${originalNameDariDB}"`);
            res.sendFile(filePath);
        } else {
            res.status(404).json({ status: 'failed', message: 'Document not found' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { addDocument, getDocumentById };