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

  it('should return true for Error subclass instances', () => {
    expect(isError(new TypeError('type error'))).toBe(true);
    expect(isError(new RangeError('range error'))).toBe(true);
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
});

describe('isErrorLike', () => {
  it('should return true for Error instances', () => {
    expect(isErrorLike(new Error('test'))).toBe(true);
  });

  it('should return true for plain objects with name and message', () => {
    expect(isErrorLike({ message: 'test error', name: 'CustomError' })).toBe(true);
  });

  it('should return true for objects with name, message, and cause', () => {
    expect(isErrorLike({ cause: new Error('inner'), message: 'outer', name: 'OuterError' })).toBe(
      true,
    );
  });

  it('should return false for null', () => {
    expect(isErrorLike(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isErrorLike(undefined)).toBe(false);
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

  it('should return false for strings', () => {
    expect(isErrorLike('error message')).toBe(false);
  });

  it('should return false for numbers', () => {
    expect(isErrorLike(42)).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isErrorLike([])).toBe(false);
  });
});

describe('errorNameFrom', () => {
  it('should return the error name from an Error instance', () => {
    expect(errorNameFrom(new Error('test'))).toBe('Error');
  });

  it('should return the error name from a TypeError', () => {
    expect(errorNameFrom(new TypeError('type'))).toBe('TypeError');
  });

  it('should return the name from an error-like object', () => {
    expect(errorNameFrom({ message: 'test', name: 'CustomError' })).toBe('CustomError');
  });

  it('should return undefined for null', () => {
    expect(errorNameFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorNameFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error values', () => {
    expect(errorNameFrom('not an error')).toBeUndefined();
    expect(errorNameFrom(42)).toBeUndefined();
    expect(errorNameFrom({ message: 'no name' })).toBeUndefined();
  });
});

describe('errorMessageFrom', () => {
  it('should return the message from an Error instance', () => {
    expect(errorMessageFrom(new Error('test message'))).toBe('test message');
  });

  it('should return the message from an error-like object', () => {
    expect(errorMessageFrom({ message: 'custom message', name: 'Error' })).toBe('custom message');
  });

  it('should return undefined for null', () => {
    expect(errorMessageFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorMessageFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error values', () => {
    expect(errorMessageFrom('not an error')).toBeUndefined();
    expect(errorMessageFrom(42)).toBeUndefined();
  });

  it('should return the message for an error with a whitespace message', () => {
    const err = Object.assign(new Error('placeholder'), { message: '' });
    expect(errorMessageFrom(err)).toBe('');
  });
});

describe('errorStackFrom', () => {
  it('should return the stack from an Error instance', () => {
    const err = new Error('test');
    const stack = errorStackFrom(err);
    expect(stack).toContain('Error: test');
  });

  it('should return the stack from an error-like object with stack', () => {
    const errorLike = { message: 'test', name: 'Error', stack: 'Error: test\n  at somewhere' };
    expect(errorStackFrom(errorLike)).toBe('Error: test\n  at somewhere');
  });

  it('should generate a stack when error-like object has no stack', () => {
    const errorLike = { message: 'test message', name: 'Error', stack: null };
    const stack = errorStackFrom(errorLike);
    expect(typeof stack).toBe('string');
  });

  it('should return undefined for null', () => {
    expect(errorStackFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorStackFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error values', () => {
    expect(errorStackFrom('not an error')).toBeUndefined();
    expect(errorStackFrom(42)).toBeUndefined();
  });
});

describe('errorCauseFrom', () => {
  it('should return the cause from an Error with cause', () => {
    const cause = new Error('inner error');
    const err = new Error('outer error', { cause });
    expect(errorCauseFrom(err)).toBe(cause);
  });

  it('should return the cause from an error-like object', () => {
    const cause = { code: 404 };
    const errorLike = { cause, message: 'not found', name: 'NotFoundError' };
    expect(errorCauseFrom(errorLike)).toBe(cause);
  });

  it('should return undefined when cause is null', () => {
    const errorLike = { cause: null, message: 'test', name: 'Error' };
    expect(errorCauseFrom(errorLike)).toBeUndefined();
  });

  it('should return undefined when cause is absent', () => {
    expect(errorCauseFrom(new Error('no cause'))).toBeUndefined();
  });

  it('should return undefined for null', () => {
    expect(errorCauseFrom(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(errorCauseFrom(undefined)).toBeUndefined();
  });

  it('should return undefined for non-error values', () => {
    expect(errorCauseFrom('not an error')).toBeUndefined();
    expect(errorCauseFrom(42)).toBeUndefined();
  });

  it('should return string cause correctly', () => {
    const errorLike = { cause: 'string cause', message: 'test', name: 'Error' };
    expect(errorCauseFrom<string>(errorLike)).toBe('string cause');
  });
});
