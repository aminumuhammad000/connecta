
import { Subjects } from './subjects';

export interface ProposalCreatedEvent {
    subject: Subjects.ProposalCreated;
    data: {
        id: string;
        jobId: string;
        freelancerId: string;
        bidAmount: number;
        duration: string;
        status: string;
        version: number;
    };
}
