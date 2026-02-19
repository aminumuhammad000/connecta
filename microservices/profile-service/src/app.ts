import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';

import { errorHandler, NotFoundError } from '@connecta/common';
import { showProfileRouter } from './routes/show-profile';
import { updateProfileRouter } from './routes/update-profile';

const app = express();
app.set('trust proxy', true);

app.use(json());
app.use(cors());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);

app.use(showProfileRouter);
app.use(updateProfileRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
