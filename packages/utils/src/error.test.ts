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
  it('should return true for Error instances', () => {
    expect(isError(new Error('test'))).toBe(true);
  });

  it('should return true for subclass Error instances', () => {
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
    expect(isError({ message: 'error', name: 'Error' })).toBe(false);
  });

  it('should return false for strings', () => {
    expect(isError('error message')).toBe(false);
  });

  it('should return false for numbers', () => {
    expect(isError(42)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isError([])).toBe(false);
  });
});

describe('isErrorLike', () => {
  it('should return true for Error instances', () => {
    expect(isErrorLike(new Error('test'))).toBe(true);
  });

  it('should return true for plain objects with name and message strings', () => {
    expect(isErrorLike({ name: 'CustomError', message: 'something went wrong' })).toBe(true);
  });

  it('should return true for error-like objects with extra properties', () => {
    expect(
      isErrorLike({ code: 500, message: 'server error', name: 'ServerError', stack: 'at ...' }),
    ).toBe(true);
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
    expect(isErrorLike({ message: 'something' })).toBe(false);
  });

  it('should return false for objects missing message', () => {
    expect(isErrorLike({ name: 'Error' })).toBe(false);
  });

  it('should return false for objects with non-string name', () => {
    expect(isErrorLike({ message: 'error', name: 42 })).toBe(false);
  });

  it('should return false for objects with non-string message', () => {
    expect(isErrorLike({ message: 42, name: 'Error' })).toBe(false);
  });

  it('should return false for empty objects', () => {
    expect(isErrorLike({})).toBe(false);
  });
});

describe('errorNameFrom', () => {
  it('should return the name from an Error instance', () => {
    expect(errorNameFrom(new Error('test'))).toBe('Error');
  });

  it('should return the name from TypeError', () => {
    expect(errorNameFrom(new TypeError('type error'))).toBe('TypeError');
  });

  it('should return the name from an error-like object', () => {
    expect(errorNameFrom({ message: 'something', name: 'CustomError' })).toBe('CustomError');
  });

  it('should return undefined for null', () => {
    expect(errorNameFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorNameFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for strings', () => {
    expect(errorNameFrom('not an error')).toBeUndefined();
  });

  it('should return undefined for plain objects without name', () => {
    expect(errorNameFrom({ message: 'something' })).toBeUndefined();
  });
});

describe('errorMessageFrom', () => {
  it('should return the message from an Error instance', () => {
    expect(errorMessageFrom(new Error('test message'))).toBe('test message');
  });

  it('should return the message from an error-like object', () => {
    expect(errorMessageFrom({ message: 'custom message', name: 'CustomError' })).toBe(
      'custom message',
    );
  });

  it('should return empty string for Error with empty message', () => {
    // eslint-disable-next-line unicorn/error-message
    expect(errorMessageFrom(new Error(''))).toBe('');
  });

  it('should return undefined for null', () => {
    expect(errorMessageFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorMessageFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for strings', () => {
    expect(errorMessageFrom('error text')).toBeUndefined();
  });

  it('should return undefined for plain objects without message', () => {
    expect(errorMessageFrom({ name: 'Error' })).toBeUndefined();
  });
});

describe('errorStackFrom', () => {
  it('should return the stack from an Error instance', () => {
    const err = new Error('test');
    const stack = errorStackFrom(err);
    expect(stack).toBeDefined();
    expect(typeof stack).toBe('string');
    expect(stack).toContain('Error');
  });

  it('should return stack from an error-like object with stack property', () => {
    const errLike = { message: 'custom', name: 'CustomError', stack: 'at custom:1:1' };
    expect(errorStackFrom(errLike)).toBe('at custom:1:1');
  });

  it('should fall back to a generated stack when stack is null', () => {
    const errLike = { message: 'fallback message', name: 'CustomError', stack: null };
    const stack = errorStackFrom(errLike);
    expect(stack).toBeDefined();
    expect(typeof stack).toBe('string');
  });

  it('should fall back to a generated stack when stack is undefined', () => {
    const errLike = { message: 'fallback message', name: 'CustomError' };
    const stack = errorStackFrom(errLike);
    expect(stack).toBeDefined();
    expect(typeof stack).toBe('string');
  });

  it('should return undefined for null', () => {
    expect(errorStackFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorStackFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error values', () => {
    expect(errorStackFrom('error')).toBeUndefined();
    expect(errorStackFrom(42)).toBeUndefined();
  });
});

describe('errorCauseFrom', () => {
  it('should return the cause from an Error with cause', () => {
    const cause = new Error('root cause');
    const err = new Error('wrapper', { cause });
    expect(errorCauseFrom(err)).toBe(cause);
  });

  it('should return the cause from an error-like object', () => {
    const cause = { code: 'NOT_FOUND' };
    const errLike = { cause, message: 'not found', name: 'NotFoundError' };
    expect(errorCauseFrom(errLike)).toBe(cause);
  });

  it('should return primitive causes', () => {
    const errLike = { cause: 'string cause', message: 'error', name: 'Error' };
    expect(errorCauseFrom(errLike)).toBe('string cause');
  });

  it('should return undefined when cause is null', () => {
    const errLike = { cause: null, message: 'error', name: 'Error' };
    expect(errorCauseFrom(errLike)).toBeUndefined();
  });

  it('should return undefined when cause is undefined', () => {
    const errLike = { cause: undefined, message: 'error', name: 'Error' };
    expect(errorCauseFrom(errLike)).toBeUndefined();
  });

  it('should return undefined when no cause property', () => {
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
    expect(errorCauseFrom('error')).toBeUndefined();
    expect(errorCauseFrom(42)).toBeUndefined();
  });
});
