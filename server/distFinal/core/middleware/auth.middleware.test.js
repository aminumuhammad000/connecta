import test from 'node:test';
import assert from 'node:assert/strict';
import { requireRole } from './auth.middleware.js';
test('requireRole allows admins when the user has userType set to admin', () => {
    let nextCalled = false;
    const req = {
        user: {
            id: 'admin-1',
            userType: 'admin',
        },
    };
    const res = {
        status: (code) => ({
            json: (body) => {
                throw new Error(`Unexpected response: ${code} ${JSON.stringify(body)}`);
            },
        }),
    };
    const next = (() => {
        nextCalled = true;
    });
    requireRole(['admin'])(req, res, next);
    assert.equal(nextCalled, true);
});
