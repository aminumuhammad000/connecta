"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalCreatedPublisher = void 0;
const common_1 = require("@connecta/common");
class ProposalCreatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.ProposalCreated;
    }
}
exports.ProposalCreatedPublisher = ProposalCreatedPublisher;
