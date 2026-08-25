import { describe, expect, it } from 'vitest';
import { isValidUUID, sanitizeTagName } from './validation';

describe('isValidUUID', () => {
  it('accepts image ids and uuids', () => {
    expect(isValidUUID('20260825-abcd1234')).toBe(true);
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('not-an-id')).toBe(false);
  });
});

describe('sanitizeTagName', () => {
  it('lowercases and strips illegal characters', () => {
    expect(sanitizeTagName(' Nature! ')).toBe('nature');
  });
});
