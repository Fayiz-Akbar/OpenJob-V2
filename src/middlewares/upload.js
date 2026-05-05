const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Menyimpan file ke folder uploads/documents
        cb(null, 'uploads/documents/');
    },
    filename: (req, file, cb) => {
        // Membuat nama file unik untuk mencegah bentrok
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('File is required and format must be PDF'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Batas 5 MB
    },
    fileFilter: fileFilter
});

module.exports = upload;