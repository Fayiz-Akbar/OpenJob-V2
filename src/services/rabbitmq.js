const amqp = require('amqplib');
require('dotenv').config();

const connectRabbitMQ = async () => {
    try {
        const url = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
        const connection = await amqp.connect(url);
        console.log('Connected to RabbitMQ');
        return connection;
    } catch (error) {
        console.error('RabbitMQ Connection Error:', error);
        throw error;
    }
};

module.exports = connectRabbitMQ;