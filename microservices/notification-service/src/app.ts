import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import { errorHandler, NotFoundError } from '@connecta/common';
import { notificationRouter } from './routes/notification.routes';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'Notification Service OK' });
});

app.use(notificationRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
