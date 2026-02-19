import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';

import { errorHandler, NotFoundError } from '@connecta/common';
import { createProposalRouter } from './routes/create-proposal';
import { getProposalsRouter } from './routes/get-proposals';
import { manageProposalsRouter } from './routes/manage-proposals';

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

app.use(createProposalRouter);
app.use(getProposalsRouter);
app.use(manageProposalsRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
