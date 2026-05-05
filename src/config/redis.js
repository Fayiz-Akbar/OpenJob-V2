const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
    }
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.on('connect', () => console.log('Connected to Redis'));

client.connect();

module.exports = client;