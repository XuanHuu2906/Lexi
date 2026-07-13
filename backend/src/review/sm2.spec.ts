import { sm2 } from './sm2';

describe('sm2', () => {
  const now = new Date('2026-01-01T00:00:00Z');
  const fresh = { interval: 1, easeFactor: 2.5, repetitions: 0 };

  it('first correct review → interval 1 day, repetitions 1', () => {
    const r = sm2(fresh, 5, now);
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(1);
    expect(r.nextReviewAt).toEqual(new Date('2026-01-02T00:00:00Z'));
  });

  it('second correct review → compressed to 3 days', () => {
    const r = sm2({ interval: 1, easeFactor: 2.5, repetitions: 1 }, 4, now);
    expect(r.interval).toBe(3);
    expect(r.repetitions).toBe(2);
  });

  it('third correct review → round(prev × ease × modifier)', () => {
    const r = sm2({ interval: 6, easeFactor: 2.5, repetitions: 2 }, 5, now);
    expect(r.interval).toBe(11); // round(6 × 2.5 × 0.7) = round(10.5)
    expect(r.repetitions).toBe(3);
  });

  it('interval is capped at the 21-day study window', () => {
    const r = sm2({ interval: 20, easeFactor: 2.5, repetitions: 5 }, 5, now);
    expect(r.interval).toBe(21); // round(20 × 2.5 × 0.7)=35 → clamped to 21
    expect(r.nextReviewAt).toEqual(new Date('2026-01-22T00:00:00Z'));
  });

  it('failed recall (q < 3) resets interval and repetitions', () => {
    const r = sm2({ interval: 15, easeFactor: 2.5, repetitions: 5 }, 1, now);
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(0);
  });

  it('ease factor never drops below 1.3', () => {
    let state = { interval: 1, easeFactor: 1.3, repetitions: 0 };
    for (let i = 0; i < 5; i++) {
      const r = sm2(state, 0, now);
      expect(r.easeFactor).toBeGreaterThanOrEqual(1.3);
      state = r;
    }
  });

  it('ease factor is capped at 2.5, even on repeated easy reviews', () => {
    let state = fresh;
    for (let i = 0; i < 5; i++) {
      state = sm2(state, 5, now);
      expect(state.easeFactor).toBeLessThanOrEqual(2.5);
    }
    expect(state.easeFactor).toBe(2.5);
  });

  it('a hard review (q=3) lowers the ease factor', () => {
    const r = sm2(fresh, 3, now);
    expect(r.easeFactor).toBeLessThan(2.5);
  });
});
