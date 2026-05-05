const jwt = require('jsonwebtoken');

const TokenManager = {
    generateAccessToken: (payload) => {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
            // Token diset aktif selama 1 jam agar aman selama proses pengujian
            expiresIn: process.env.ACCESS_TOKEN_AGE || '1h',
        });
    },
    generateRefreshToken: (payload) => {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
    },
    verifyRefreshToken: (refreshToken) => {
        try {
            const artifacts = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
            return artifacts;
        } catch (error) {
            throw new Error('Refresh token tidak valid');
        }
    },
};

module.exports = TokenManager;