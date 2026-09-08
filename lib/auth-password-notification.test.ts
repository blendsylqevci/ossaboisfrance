import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getPasswordChangeNotificationTargets,
  hasDirectPasswordUpdate,
} from './auth-password-notification.ts'

test('detects only non-empty direct password updates', () => {
  assert.equal(hasDirectPasswordUpdate({ data: { password: 'new-secret' } }), true)
  assert.equal(hasDirectPasswordUpdate({ data: { password: '' } }), false)
  assert.equal(hasDirectPasswordUpdate({ data: { password: null } }), false)
  assert.equal(hasDirectPasswordUpdate({ data: { role: 'admin' } }), false)
  assert.equal(hasDirectPasswordUpdate(null), false)
})

test('resetPassword returns its authenticated user exactly once', () => {
  assert.deepEqual(
    getPasswordChangeNotificationTargets({
      args: { data: { password: 'new-secret', token: 'private-token' } },
      operation: 'resetPassword',
      result: { user: { id: 7, email: ' admin@example.com ' } },
    }),
    [{ id: 7, email: 'admin@example.com' }]
  )
})

test('updateByID detects an admin/API password edit and preserves an id fallback', () => {
  assert.deepEqual(
    getPasswordChangeNotificationTargets({
      args: { id: 'user-1', data: { password: 'new-secret' } },
      operation: 'updateByID',
      result: { role: 'admin' },
    }),
    [{ id: 'user-1' }]
  )
})

test('bulk update notifies successful documents only', () => {
  assert.deepEqual(
    getPasswordChangeNotificationTargets({
      args: { data: { password: 'new-secret' } },
      operation: 'update',
      result: {
        docs: [
          { id: 1, email: 'one@example.com' },
          { id: 2, email: 'two@example.com' },
        ],
        errors: [{ id: 3, message: 'failed' }],
      },
    }),
    [
      { id: 1, email: 'one@example.com' },
      { id: 2, email: 'two@example.com' },
    ]
  )
})

test('unrelated updates and account creation never trigger the changed alert', () => {
  assert.deepEqual(
    getPasswordChangeNotificationTargets({
      args: { data: { role: 'editor' } },
      operation: 'updateByID',
      result: { id: 1, email: 'one@example.com' },
    }),
    []
  )
  assert.deepEqual(
    getPasswordChangeNotificationTargets({
      args: { data: { password: 'initial-secret' } },
      operation: 'create',
      result: { id: 1, email: 'one@example.com' },
    }),
    []
  )
})
