import { Channel, Connection } from 'amqplib';
const amqp = require('amqplib');

class RabbitMQWrapper {
    private _client?: any;
    private _channel?: any;

    get client() {
        if (!this._client) {
            throw new Error('Cannot access RabbitMQ client before connecting');
        }
        return this._client;
    }

    get channel() {
        if (!this._channel) {
            throw new Error('Cannot access RabbitMQ channel before connecting');
        }
        return this._channel;
    }

    async connect(url: string) {
        if (!url) {
            throw new Error('RabbitMQ URL is required');
        }

        console.log(`[RabbitMQ] Connecting to ${url}...`);
        this._client = await amqp.connect(url);
        this._channel = await this._client.createChannel();

        console.log('[RabbitMQ] Connected to RabbitMQ');

        // Handle connection close
        this._client.on('close', () => {
            console.log('[RabbitMQ] Connection closed!');
            process.exit();
        });

        this._client.on('error', (err: any) => {
            console.error('[RabbitMQ] Connection error', err);
        });
    }
}

export const rabbitMQWrapper = new RabbitMQWrapper();
