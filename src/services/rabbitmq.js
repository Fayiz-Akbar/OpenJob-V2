const amqp = require('amqplib');
require('dotenv').config();

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const amqpUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${rabbitmqHost}:${process.env.RABBITMQ_PORT}`;

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(amqpUrl);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
    }
};

const sendMessage = async (queueName, message) => {
    if (!channel) {
        console.error('RabbitMQ channel is not initialized');
        return;
    }
    
    // Pastikan queue exist sebelum mengirim (durable: true agar queue tidak hilang jika server mati)
    await channel.assertQueue(queueName, { durable: true });
    
    // Kirim pesan dalam bentuk Buffer
    channel.sendToQueue(queueName, Buffer.from(message));
};

module.exports = { connectRabbitMQ, sendMessage };