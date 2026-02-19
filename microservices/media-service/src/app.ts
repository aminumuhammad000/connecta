import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import { errorHandler, NotFoundError } from '@connecta/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cors());

// Basic health check
app.get('/health', (req, res) => {
    res.status(200).send({ status: 'Media Service OK' });
});

import { mediaRouter } from './routes/media.routes';
app.use(mediaRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
