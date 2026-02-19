import { Message } from 'amqplib';
import { Subjects, Listener, UserCreatedEvent } from '@connecta/common';
import { Profile } from '../../models/profile';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
    subject: Subjects.UserCreated = Subjects.UserCreated;
    queueGroupName = 'profile-service';

    async onMessage(data: UserCreatedEvent['data'], msg: Message) {
        const { id, email, role } = data;

        const profile = Profile.build({
            userId: id,
            email,
            role,
        });

        await profile.save();

        console.log(`[Profile Service] Profile created for user ${id}`);

        this.channel.ack(msg);
    }
}
