import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';

import { errorHandler, NotFoundError } from '@connecta/common';
import { createJobRouter } from './routes/create-job';
import { showJobRouter } from './routes/show-job';
import { indexJobRouter } from './routes/index-job';
import { manageJobsRouter } from './routes/manage-jobs';

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

app.use(createJobRouter);
app.use(showJobRouter);
app.use(indexJobRouter);
app.use(manageJobsRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
