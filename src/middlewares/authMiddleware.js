const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Postman mengirimkan token melalui Header Authorization
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 'failed', message: 'Missing authentication' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        // Jika token berbeda signature atau expired, akan masuk ke sini
        return res.status(401).json({ status: 'failed', message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;