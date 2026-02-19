import { Subjects } from './subjects';

export interface JobCreatedEvent {
    subject: Subjects.JobCreated;
    data: {
        id: string;
        title: string;
        description: string;
        budget: number;
        userId: string;
        version: number;
    };
}
