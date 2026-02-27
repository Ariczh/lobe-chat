import { describe, expect, it } from 'vitest';

import {
  errorCauseFrom,
  errorMessageFrom,
  errorNameFrom,
  errorStackFrom,
  isError,
  isErrorLike,
} from './error';

// ---------------------------------------------------------------------------
// isError
// ---------------------------------------------------------------------------

describe('isError', () => {
  it('returns true for a native Error instance', () => {
    expect(isError(new Error('boom'))).toBe(true);
  });

  it('returns true for subclasses of Error', () => {
    expect(isError(new TypeError('type error'))).toBe(true);
    expect(isError(new RangeError('range error'))).toBe(true);
    expect(isError(new ReferenceError('ref error'))).toBe(true);
  });

  it('returns false for null', () => {
    expect(isError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isError(undefined)).toBe(false);
  });

  it('returns false for a plain object that looks like an error', () => {
    expect(isError({ message: 'oops', name: 'Error' })).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isError('error string')).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isError(42)).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(isError({})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isErrorLike
// ---------------------------------------------------------------------------

describe('isErrorLike', () => {
  it('returns true for a native Error', () => {
    expect(isErrorLike(new Error('boom'))).toBe(true);
  });

  it('returns true for a plain object with name and message strings', () => {
    expect(isErrorLike({ message: 'something went wrong', name: 'CustomError' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isErrorLike(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isErrorLike(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isErrorLike('error')).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isErrorLike(0)).toBe(false);
  });

  it('returns false for an object missing the name property', () => {
    expect(isErrorLike({ message: 'oops' })).toBe(false);
  });

  it('returns false for an object missing the message property', () => {
    expect(isErrorLike({ name: 'Error' })).toBe(false);
  });

  it('returns false when name is not a string', () => {
    expect(isErrorLike({ message: 'oops', name: 42 })).toBe(false);
  });

  it('returns false when message is not a string', () => {
    expect(isErrorLike({ message: 42, name: 'Error' })).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(isErrorLike({})).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// errorNameFrom
// ---------------------------------------------------------------------------

describe('errorNameFrom', () => {
  it('returns the name of a native Error', () => {
    expect(errorNameFrom(new Error('boom'))).toBe('Error');
  });

  it('returns the name of a TypeError', () => {
    expect(errorNameFrom(new TypeError('type'))).toBe('TypeError');
  });

  it('returns the name from an error-like plain object', () => {
    expect(errorNameFrom({ message: 'oops', name: 'CustomError' })).toBe('CustomError');
  });

  it('returns undefined for null', () => {
    expect(errorNameFrom(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(errorNameFrom(undefined)).toBeUndefined();
  });

  it('returns undefined for a plain string', () => {
    expect(errorNameFrom('error')).toBeUndefined();
  });

  it('returns undefined for a non-error object', () => {
    expect(errorNameFrom({ foo: 'bar' })).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// errorMessageFrom
// ---------------------------------------------------------------------------

describe('errorMessageFrom', () => {
  it('returns the message of a native Error', () => {
    expect(errorMessageFrom(new Error('something failed'))).toBe('something failed');
  });

  it('returns the message from an error-like plain object', () => {
    expect(errorMessageFrom({ message: 'bad input', name: 'ValidationError' })).toBe('bad input');
  });

  it('returns undefined for null', () => {
    expect(errorMessageFrom(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(errorMessageFrom(undefined)).toBeUndefined();
  });

  it('returns undefined for a string', () => {
    expect(errorMessageFrom('an error string')).toBeUndefined();
  });

  it('returns undefined for a non-error object', () => {
    expect(errorMessageFrom({ foo: 'bar' })).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// errorStackFrom
// ---------------------------------------------------------------------------

describe('errorStackFrom', () => {
  it('returns the stack from a native Error that has one', () => {
    const err = new Error('with stack');
    const stack = errorStackFrom(err);
    // Node.js always generates a stack for new Error(...)
    expect(typeof stack).toBe('string');
    expect(stack).toContain('Error: with stack');
  });

  it('falls back to a generated stack when stack is absent on an error-like object', () => {
    const errorLike = { message: 'no stack here', name: 'FakeError', stack: null };
    const stack = errorStackFrom(errorLike);
    // Should still return a string (generated from new Error(message))
    expect(typeof stack).toBe('string');
  });

  it('returns undefined for null', () => {
    expect(errorStackFrom(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(errorStackFrom(undefined)).toBeUndefined();
  });

  it('returns undefined for a plain string', () => {
    expect(errorStackFrom('oops')).toBeUndefined();
  });

  it('returns undefined for a non-error object', () => {
    expect(errorStackFrom({ foo: 'bar' })).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// errorCauseFrom
// ---------------------------------------------------------------------------

describe('errorCauseFrom', () => {
  it('returns the cause from an Error with a cause', () => {
    const cause = new Error('root cause');
    const err = new Error('outer', { cause });
    expect(errorCauseFrom(err)).toBe(cause);
  });

  it('returns the cause from an error-like plain object with a cause', () => {
    const causeValue = { code: 404 };
    const errorLike = { cause: causeValue, message: 'not found', name: 'HttpError' };
    expect(errorCauseFrom(errorLike)).toBe(causeValue);
  });

  it('returns undefined when cause is absent', () => {
    const err = new Error('no cause');
    expect(errorCauseFrom(err)).toBeUndefined();
  });

  it('returns undefined when cause is null', () => {
    const errorLike = { cause: null, message: 'null cause', name: 'Error' };
    expect(errorCauseFrom(errorLike)).toBeUndefined();
  });

  it('returns undefined for null input', () => {
    expect(errorCauseFrom(null)).toBeUndefined();
  });

  it('returns undefined for undefined input', () => {
    expect(errorCauseFrom(undefined)).toBeUndefined();
  });

  it('returns undefined for a plain string', () => {
    expect(errorCauseFrom('error string')).toBeUndefined();
  });

  it('returns undefined for a non-error object', () => {
    expect(errorCauseFrom({ foo: 'bar' })).toBeUndefined();
  });

  it('correctly types the returned cause with a generic type argument', () => {
    const errorLike = { cause: 42, message: 'typed cause', name: 'Error' };
    const cause = errorCauseFrom<number>(errorLike);
    expect(cause).toBe(42);
  });
});
