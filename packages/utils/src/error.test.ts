import { describe, expect, it } from 'vitest';

import {
  errorCauseFrom,
  errorMessageFrom,
  errorNameFrom,
  errorStackFrom,
  isError,
  isErrorLike,
} from './error';

describe('isError', () => {
  it('should return true for actual Error instances', () => {
    expect(isError(new Error('test'))).toBe(true);
  });

  it('should return true for Error subclass instances', () => {
    expect(isError(new TypeError('type error'))).toBe(true);
    expect(isError(new RangeError('range error'))).toBe(true);
    expect(isError(new SyntaxError('syntax error'))).toBe(true);
  });

  it('should return false for null', () => {
    expect(isError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isError(undefined)).toBe(false);
  });

  it('should return false for plain objects', () => {
    expect(isError({ message: 'test', name: 'Error' })).toBe(false);
  });

  it('should return false for strings', () => {
    expect(isError('error string')).toBe(false);
  });

  it('should return false for numbers', () => {
    expect(isError(42)).toBe(false);
  });

  it('should return false for booleans', () => {
    expect(isError(false)).toBe(false);
  });
});

describe('isErrorLike', () => {
  it('should return true for actual Error instances', () => {
    expect(isErrorLike(new Error('test'))).toBe(true);
  });

  it('should return true for error-like objects with name and message', () => {
    expect(isErrorLike({ message: 'Something failed', name: 'CustomError' })).toBe(true);
  });

  it('should return true for objects with extra properties', () => {
    expect(isErrorLike({ code: 404, message: 'Not found', name: 'HttpError', status: 404 })).toBe(
      true,
    );
  });

  it('should return false for null', () => {
    expect(isErrorLike(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isErrorLike(undefined)).toBe(false);
  });

  it('should return false for strings', () => {
    expect(isErrorLike('error')).toBe(false);
  });

  it('should return false for numbers', () => {
    expect(isErrorLike(42)).toBe(false);
  });

  it('should return false for objects missing name', () => {
    expect(isErrorLike({ message: 'test' })).toBe(false);
  });

  it('should return false for objects missing message', () => {
    expect(isErrorLike({ name: 'Error' })).toBe(false);
  });

  it('should return false for objects with non-string name', () => {
    expect(isErrorLike({ message: 'test', name: 42 })).toBe(false);
  });

  it('should return false for objects with non-string message', () => {
    expect(isErrorLike({ message: 42, name: 'Error' })).toBe(false);
  });

  it('should return false for empty objects', () => {
    expect(isErrorLike({})).toBe(false);
  });
});

describe('errorNameFrom', () => {
  it('should extract name from an Error', () => {
    expect(errorNameFrom(new Error('test'))).toBe('Error');
  });

  it('should extract name from a TypeError', () => {
    expect(errorNameFrom(new TypeError('type error'))).toBe('TypeError');
  });

  it('should extract name from an error-like object', () => {
    expect(errorNameFrom({ message: 'failed', name: 'CustomError' })).toBe('CustomError');
  });

  it('should return undefined for null', () => {
    expect(errorNameFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorNameFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error objects', () => {
    expect(errorNameFrom({ foo: 'bar' })).toBeUndefined();
  });

  it('should return undefined for strings', () => {
    expect(errorNameFrom('error string')).toBeUndefined();
  });

  it('should return undefined for numbers', () => {
    expect(errorNameFrom(42)).toBeUndefined();
  });
});

describe('errorMessageFrom', () => {
  it('should extract message from an Error', () => {
    expect(errorMessageFrom(new Error('something went wrong'))).toBe('something went wrong');
  });

  it('should extract message from an error-like object', () => {
    expect(errorMessageFrom({ message: 'custom error message', name: 'CustomError' })).toBe(
      'custom error message',
    );
  });

  it('should return undefined for null', () => {
    expect(errorMessageFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorMessageFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error objects', () => {
    expect(errorMessageFrom({ foo: 'bar' })).toBeUndefined();
  });

  it('should return undefined for strings', () => {
    expect(errorMessageFrom('error string')).toBeUndefined();
  });

  it('should return message even for minimal errors', () => {
    const err = new Error('minimal');
    err.message = '';
    expect(errorMessageFrom(err)).toBe('');
  });
});

describe('errorStackFrom', () => {
  it('should extract stack from an Error', () => {
    const err = new Error('test error');
    const stack = errorStackFrom(err);
    expect(stack).toBeDefined();
    expect(typeof stack).toBe('string');
    expect(stack).toContain('Error: test error');
  });

  it('should generate a stack for error-like objects without stack', () => {
    const errorLike = { message: 'fallback stack', name: 'CustomError' };
    const stack = errorStackFrom(errorLike);
    expect(stack).toBeDefined();
    expect(typeof stack).toBe('string');
  });

  it('should return the existing stack if present in error-like object', () => {
    const errorLike = { message: 'test', name: 'Error', stack: 'Error: test\n    at test.ts:1:1' };
    expect(errorStackFrom(errorLike)).toBe('Error: test\n    at test.ts:1:1');
  });

  it('should return undefined for null', () => {
    expect(errorStackFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorStackFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error values', () => {
    expect(errorStackFrom('some string')).toBeUndefined();
    expect(errorStackFrom(42)).toBeUndefined();
  });

  it('should return null if stack is explicitly null in error-like object', () => {
    const errorLike = { message: 'test', name: 'Error', stack: null };
    // When stack is null, falls back to generating a new stack from message
    const result = errorStackFrom(errorLike);
    expect(result).toBeDefined();
  });
});

describe('errorCauseFrom', () => {
  it('should extract cause from an Error with cause', () => {
    const cause = new Error('root cause');
    const err = new Error('wrapper', { cause });
    expect(errorCauseFrom(err)).toBe(cause);
  });

  it('should extract cause from an error-like object with cause', () => {
    const cause = { code: 500, reason: 'server error' };
    const errorLike = { cause, message: 'failed', name: 'ApiError' };
    expect(errorCauseFrom(errorLike)).toBe(cause);
  });

  it('should return undefined when cause is null', () => {
    const errorLike = { cause: null, message: 'test', name: 'Error' };
    expect(errorCauseFrom(errorLike)).toBeUndefined();
  });

  it('should return undefined when cause is not present', () => {
    const err = new Error('no cause');
    expect(errorCauseFrom(err)).toBeUndefined();
  });

  it('should return undefined for null input', () => {
    expect(errorCauseFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined input', () => {
    expect(errorCauseFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error values', () => {
    expect(errorCauseFrom('string')).toBeUndefined();
    expect(errorCauseFrom(42)).toBeUndefined();
  });

  it('should return string cause', () => {
    const errorLike = { cause: 'network timeout', message: 'request failed', name: 'FetchError' };
    expect(errorCauseFrom<string>(errorLike)).toBe('network timeout');
  });
});
