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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitMQWrapper = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class RabbitMQWrapper {
    get client() {
        if (!this._client) {
            throw new Error('Cannot access RabbitMQ client before connecting');
        }
        return this._client;
    }
    get channel() {
        if (!this._channel) {
            throw new Error('Cannot access RabbitMQ channel before connecting');
        }
        return this._channel;
    }
    connect(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!url) {
                throw new Error('RabbitMQ URL is required');
            }
            console.log(`[RabbitMQ] Connecting to ${url}...`);
            this._client = yield amqplib_1.default.connect(url);
            this._channel = yield this._client.createChannel();
            console.log('[RabbitMQ] Connected to RabbitMQ');
            // Handle connection close
            this._client.on('close', () => {
                console.log('[RabbitMQ] Connection closed!');
                process.exit();
            });
            this._client.on('error', (err) => {
                console.error('[RabbitMQ] Connection error', err);
            });
        });
    }
}
exports.rabbitMQWrapper = new RabbitMQWrapper();
