import { Publisher, Subjects, JobCreatedEvent } from '@connecta/common';

export class JobCreatedPublisher extends Publisher<JobCreatedEvent> {
    subject: Subjects.JobCreated = Subjects.JobCreated;
}
