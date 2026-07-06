import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response, NextFunction } from 'express';
import { requireRole } from './auth.middleware.js';

test('requireRole allows admins when the user has userType set to admin', () => {
  let nextCalled = false;

  const req = {
    user: {
      id: 'admin-1',
      userType: 'admin',
    },
  } as unknown as Request;

  const res = {
    status: (code: number) => ({
      json: (body: unknown) => {
        throw new Error(`Unexpected response: ${code} ${JSON.stringify(body)}`);
      },
    }),
  } as unknown as Response;

  const next = (() => {
    nextCalled = true;
  }) as NextFunction;

  requireRole(['admin'])(req, res, next);

  assert.equal(nextCalled, true);
});
