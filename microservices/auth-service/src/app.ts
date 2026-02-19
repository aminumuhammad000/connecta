import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';

import { errorHandler, NotFoundError } from '@connecta/common';
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { refreshTokenRouter } from './routes/refresh-token';
import { passwordRecoveryRouter } from './routes/password-recovery';
import { resendOtpRouter } from './routes/resend-otp';

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

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(refreshTokenRouter);
app.use(passwordRecoveryRouter);
app.use(resendOtpRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
