const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const addDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'failed', message: 'File is required' });
        }

        const { filename, originalname, size } = req.file;
        const documentId = `document-${Date.now()}`;

        // Insert ke database
        const query = {
            text: 'INSERT INTO documents (id, filename, original_name, size) VALUES($1, $2, $3, $4)',
            values: [documentId, filename, originalname, size],
        };
        await pool.query(query);

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

const getAllDocuments = async (req, res) => {
    try {
        const query = 'SELECT id, filename, original_name, size FROM documents';
        const result = await pool.query(query);

        res.status(200).json({
            status: 'success',
            data: {
                documents: result.rows
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cek data di database
        const result = await pool.query('SELECT filename, original_name FROM documents WHERE id = $1', [id]);

        if (!result.rows.length) {
            return res.status(404).json({ status: 'failed', message: 'Document not found' });
        }

        const document = result.rows[0];
        const filePath = path.join(__dirname, '../../uploads/documents/', document.filename);

        // Kirim file PDF jika ada di lokal folder
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${document.original_name}"`);
            res.sendFile(filePath);
        } else {
            res.status(404).json({ status: 'failed', message: 'File physically not found on server' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ambil nama file dari DB dulu
        const result = await pool.query('SELECT filename FROM documents WHERE id = $1', [id]);

        if (!result.rows.length) {
            return res.status(404).json({ status: 'failed', message: 'Document not found' });
        }

        const filename = result.rows[0].filename;
        const filePath = path.join(__dirname, '../../uploads/documents/', filename);

        // Hapus file fisik dari folder uploads/documents
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Hapus data dari database
        await pool.query('DELETE FROM documents WHERE id = $1', [id]);

        res.status(200).json({ status: 'success', message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { addDocument, getAllDocuments, getDocumentById, deleteDocument };