import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
  it('combines class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    expect(cn('foo', null, 'bar')).toBe('foo bar');
    expect(cn('foo', { bar: true })).toBe('foo bar');
    expect(cn('foo', { bar: false })).toBe('foo');
  });

  it('merges tailwind classes correctly', () => {
    // Test that later classes override earlier ones
    expect(cn('p-4', 'p-5')).toBe('p-5');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('px-4 py-2', 'p-4')).toBe('p-4');
  });

  it('handles conditional classes', () => {
    const condition = true;
    expect(cn('base', condition && 'active')).toBe('base active');
    expect(cn('base', !condition && 'inactive')).toBe('base');
  });
}); 