import { Publisher, Subjects, UserCreatedEvent } from '@connecta/common';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
    subject: Subjects.UserCreated = Subjects.UserCreated;
}
