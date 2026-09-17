import { describe, it, expect } from 'vitest';
import { validateQuartzCron, validateCron } from './cron-validator';

describe('validateQuartzCron', () => {
  it('returns invalid for empty string', () => {
    expect(validateQuartzCron('').isValid).toBe(false);
  });

  it('returns invalid for null', () => {
    expect(validateQuartzCron(null as any).isValid).toBe(false);
  });

  it('returns invalid for 5 fields', () => {
    const r = validateQuartzCron('* * * * *');
    expect(r.isValid).toBe(false);
    expect(r.error).toMatch(/7 fields/);
  });

  it('accepts a valid 7-field expression', () => {
    expect(validateQuartzCron('0 0 8 ? * MON-FRI *')).toMatchObject({
      isValid: true,
      format: 'quartz',
    });
  });

  // Second field
  it('rejects second > 59', () => {
    expect(validateQuartzCron('60 * * * * ? *').isValid).toBe(false);
  });

  // Day field — Quartz special characters
  it('accepts L for last day of month', () => {
    expect(validateQuartzCron('0 0 0 L * ? *').isValid).toBe(true);
  });

  it('accepts LW for last weekday of month', () => {
    expect(validateQuartzCron('0 0 0 LW * ? *').isValid).toBe(true);
  });

  it('accepts L-n format (L-3)', () => {
    expect(validateQuartzCron('0 0 0 L-3 * ? *').isValid).toBe(true);
  });

  it('rejects L-0 (0 is not valid for L-n)', () => {
    expect(validateQuartzCron('0 0 0 L-0 * ? *').isValid).toBe(false);
  });

  it('rejects L-32 (too large for L-n)', () => {
    expect(validateQuartzCron('0 0 0 L-32 * ? *').isValid).toBe(false);
  });

  it('accepts nW format (15W)', () => {
    expect(validateQuartzCron('0 0 0 15W * ? *').isValid).toBe(true);
  });

  it('rejects 0W (day 0 is invalid for nW)', () => {
    expect(validateQuartzCron('0 0 0 0W * ? *').isValid).toBe(false);
  });

  it('rejects 32W (day 32 is invalid for nW)', () => {
    expect(validateQuartzCron('0 0 0 32W * ? *').isValid).toBe(false);
  });

  // Day-of-week field — Quartz special characters
  it('accepts named day (MON)', () => {
    expect(validateQuartzCron('0 0 0 ? * MON *').isValid).toBe(true);
  });

  it('accepts named day range (MON-FRI)', () => {
    expect(validateQuartzCron('0 0 0 ? * MON-FRI *').isValid).toBe(true);
  });

  it('accepts n#m format (2#3 = 3rd Tuesday)', () => {
    expect(validateQuartzCron('0 0 0 ? * 2#3 *').isValid).toBe(true);
  });

  it('rejects invalid n#m (day > 7)', () => {
    expect(validateQuartzCron('0 0 0 ? * 8#3 *').isValid).toBe(false);
  });

  it('rejects invalid n#m (occurrence > 5)', () => {
    expect(validateQuartzCron('0 0 0 ? * 2#6 *').isValid).toBe(false);
  });

  it('accepts nL format (6L = last Friday)', () => {
    expect(validateQuartzCron('0 0 0 ? * 6L *').isValid).toBe(true);
  });

  it('rejects invalid nL (day 0 is out of Quartz DOW range 1-7)', () => {
    expect(validateQuartzCron('0 0 0 ? * 0L *').isValid).toBe(false);
  });

  it('rejects invalid nL (day 8 is out of Quartz DOW range)', () => {
    expect(validateQuartzCron('0 0 0 ? * 8L *').isValid).toBe(false);
  });

  // DOW comma list with day names
  it('accepts comma list of day names (MON,WED,FRI)', () => {
    expect(validateQuartzCron('0 0 0 ? * MON,WED,FRI *').isValid).toBe(true);
  });

  it('accepts comma list with day-name ranges (MON-TUE,THU-FRI)', () => {
    expect(validateQuartzCron('0 0 0 ? * MON-TUE,THU-FRI *').isValid).toBe(true);
  });

  it('rejects invalid day name in comma list', () => {
    expect(validateQuartzCron('0 0 0 ? * MON,INVALID *').isValid).toBe(false);
  });

  // Year field (7th field)
  it('accepts valid year (2025)', () => {
    expect(validateQuartzCron('0 0 8 ? * MON 2025').isValid).toBe(true);
  });

  it('rejects year before 1970', () => {
    expect(validateQuartzCron('0 0 8 ? * MON 1969').isValid).toBe(false);
  });

  it('rejects year after 2099', () => {
    expect(validateQuartzCron('0 0 8 ? * MON 2100').isValid).toBe(false);
  });
});

describe('validateCron', () => {
  it('returns invalid for empty string', () => {
    expect(validateCron('').isValid).toBe(false);
  });

  it('returns invalid for null', () => {
    expect(validateCron(null as any).isValid).toBe(false);
  });

  it('validates a 7-field Quartz expression', () => {
    expect(validateCron('0 0 8 ? * MON-FRI *')).toMatchObject({ isValid: true, format: 'quartz' });
  });

  it('returns invalid for unsupported field count (3 fields)', () => {
    const r = validateCron('* * *');
    expect(r.isValid).toBe(false);
    expect(r.error).toMatch(/expected 7 \(Quartz\) fields/);
  });

  it('returns invalid for unsupported field count (8 fields)', () => {
    expect(validateCron('0 0 0 ? * MON * extra').isValid).toBe(false);
  });

  it('returns error detail from field-level validation when invalid', () => {
    const r = validateCron('99 * * * * * *');
    expect(r.isValid).toBe(false);
    expect(r.error).toBeTruthy();
  });
});

describe('validateQuartzCron — non-numeric, non-name token in DOW comma list', () => {
  it('rejects a DOW comma list containing a non-numeric, non-day-name token', () => {
    const r = validateQuartzCron('0 0 0 ? * 1,XYZ *');
    expect(r.isValid).toBe(false);
    expect(r.error).toMatch(/XYZ/);
  });
});
