const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    // 1. Cek keberadaan header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'failed', message: 'Missing authentication' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Cek apakah tokennya benar-benar ada isinya (bukan cuma "Bearer ")
    if (!token || token === 'undefined') {
        return res.status(401).json({ status: 'failed', message: 'Missing authentication' });
    }

    let decoded;
    try {
        // 3. Verifikasi token
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
        // RADAR DEBUGGING: Ini akan mencetak alasan ASLI kenapa token ditolak ke terminal VS Code kamu
        console.error("🔴 DEBUG TOKEN ERROR:", error.message); 
        return res.status(401).json({ status: 'failed', message: 'Invalid or expired token' });
    }

    // 4. Lanjut ke controller jika sukses
    req.user = decoded;
    next();
};

module.exports = authMiddleware;