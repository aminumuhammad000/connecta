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
const app_1 = require("./app");
// import { sequelize } from './config/database'; // Using models directly syncs them, but we should init DB first
const database_1 = require("./config/database");
const rabbitmq_wrapper_1 = require("./rabbitmq-wrapper");
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    /*
  if (!process.env.DB_HOST) {
    throw new Error('DB_HOST must be defined');
  }
  */
    if (!process.env.RABBITMQ_URL) {
        throw new Error('RABBITMQ_URL must be defined');
    }
    try {
        yield rabbitmq_wrapper_1.rabbitMQWrapper.connect(process.env.RABBITMQ_URL);
        yield database_1.sequelize.authenticate();
        console.log('Connected to Postgres (Proposal Service)');
        // Sync models
        // await sequelize.sync(); 
        // In actual implementation, we might call this or let the model file do it. 
        // The model file we wrote calls .sync() at the end, so it might be redundant or safe to call here.
    }
    catch (err) {
        console.error(err);
    }
    app_1.app.listen(3000, () => {
        console.log('Proposal Service listening on port 3000');
    });
});
start();
