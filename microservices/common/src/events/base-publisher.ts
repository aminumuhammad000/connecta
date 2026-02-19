import { Channel } from 'amqplib';

interface Event {
    subject: string;
    data: any;
}

export abstract class Publisher<T extends Event> {
    abstract subject: T['subject'];
    protected channel: Channel;

    constructor(channel: Channel) {
        this.channel = channel;
    }

    async publish(data: T['data']): Promise<void> {
        await this.channel.assertExchange('connecta_events', 'topic', { durable: true });

        const content = Buffer.from(JSON.stringify(data));
        this.channel.publish('connecta_events', this.subject, content);

        console.log(`[Publisher] Event published to subject: ${this.subject}`);
    }
}
