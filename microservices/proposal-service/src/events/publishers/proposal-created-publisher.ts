import { Publisher, Subjects, ProposalCreatedEvent } from '@connecta/common';

export class ProposalCreatedPublisher extends Publisher<ProposalCreatedEvent> {
    subject: Subjects.ProposalCreated = Subjects.ProposalCreated;
}
