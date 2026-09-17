/**
 * Barrel import test — ensures src/lib/index.ts is executed at runtime
 * so V8 coverage counts it. Each named export is verified to be defined.
 */
import { describe, it, expect } from 'vitest';
import Cron, {
  HEADER,
  cronstrue,
  validateCron,
} from './index';

describe('src/lib/index.ts barrel exports', () => {
  it('exports the Cron component as default', () => {
    expect(Cron).toBeDefined();
    expect(typeof Cron).toBe('function');
  });

  it('exports cronstrue', () => {
    expect(cronstrue).toBeDefined();
    expect(typeof cronstrue.toString).toBe('function');
  });

  it('exports validateCron utility', () => {
    expect(typeof validateCron).toBe('function');
    const result = validateCron('0 0/5 * * * ? *');
    expect(result.isValid).toBe(true);
  });
});
