const jwt = require('jsonwebtoken');

const TokenManager = {
    generateAccessToken: (payload) => {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
            expiresIn: process.env.ACCESS_TOKEN_AGE || '30m', // default 30 menit
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