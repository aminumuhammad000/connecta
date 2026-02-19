import { Channel, ConsumeMessage } from 'amqplib';

interface Event {
    subject: string;
    data: any;
}

export abstract class Listener<T extends Event> {
    abstract subject: T['subject'];
    abstract queueGroupName: string;
    abstract onMessage(data: T['data'], msg: ConsumeMessage): void;
    protected channel: Channel;

    constructor(channel: Channel) {
        this.channel = channel;
    }

    async listen() {
        await this.channel.assertExchange('connecta_events', 'topic', { durable: true });

        const q = await this.channel.assertQueue(this.queueGroupName, { durable: true });

        await this.channel.bindQueue(q.queue, 'connecta_events', this.subject);

        console.log(`[Listener] Listening for ${this.subject} on queue ${this.queueGroupName}`);

        this.channel.consume(q.queue, (msg) => {
            if (!msg) {
                return;
            }

            console.log(`[Listener] Message received: ${this.subject} / ${this.queueGroupName}`);

            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg);
        });
    }

    parseMessage(msg: ConsumeMessage) {
        const data = msg.content.toString();
        return JSON.parse(data);
    }
}
