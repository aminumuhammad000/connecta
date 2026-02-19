"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobCreatedPublisher = void 0;
const common_1 = require("@connecta/common");
class JobCreatedPublisher extends common_1.Publisher {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.JobCreated;
    }
}
exports.JobCreatedPublisher = JobCreatedPublisher;
