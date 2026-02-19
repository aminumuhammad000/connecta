"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedListener = void 0;
const common_1 = require("@connecta/common");
const profile_1 = require("../../models/profile");
class UserCreatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.UserCreated;
        this.queueGroupName = 'profile-service';
    }
    onMessage(data, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, email, role } = data;
            const profile = profile_1.Profile.build({
                userId: id,
                email,
                role,
            });
            yield profile.save();
            console.log(`[Profile Service] Profile created for user ${id}`);
            this.channel.ack(msg);
        });
    }
}
exports.UserCreatedListener = UserCreatedListener;
