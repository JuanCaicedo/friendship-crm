import { calculateHealth } from '@/lib/utils/healthCalculator';
import { HealthStatus } from '@/lib/models';

describe('HealthCalculator', () => {
  const now = Math.floor(Date.now() / 1000);

  describe('calculateHealth', () => {
    it('returns red status for contacts with no interactions', () => {
      const score = calculateHealth(null, null, 14, now);

      expect(score.status).toBe('red');
      expect(score.score).toBe(0);
      expect(score.lastInteractionTimestamp).toBeNull();
    });

    it('calculates green status for recent high-weight interaction', () => {
      const sevenDaysAgo = now - 7 * 86400;
      const score = calculateHealth(sevenDaysAgo, 6, 14, now); // hangout weight, 14 day interval

      expect(score.status).toBe('green');
      expect(score.score).toBeGreaterThan(0.5);
      expect(score.lastInteractionTimestamp).toBe(sevenDaysAgo);
    });

    it('calculates yellow status for moderately old interaction', () => {
      // For weight=3, interval=7, decayRate=1/(7*2)=0.0714
      // Yellow status (0.2 <= score < 0.5) occurs around 25-38 days elapsed
      const thirtyDaysAgo = now - 30 * 86400;
      const score = calculateHealth(thirtyDaysAgo, 3, 7, now); // call weight, 7 day interval

      expect(score.status).toBe('yellow');
      expect(score.score).toBeGreaterThanOrEqual(0.2);
      expect(score.score).toBeLessThan(0.5);
    });

    it('calculates red status for very old interaction', () => {
      const thirtyDaysAgo = now - 30 * 86400;
      const score = calculateHealth(thirtyDaysAgo, 1, 7, now); // text weight, 7 day interval

      expect(score.status).toBe('red');
      expect(score.score).toBeLessThan(0.2);
    });

    it('handles text interaction weight correctly', () => {
      const oneDayAgo = now - 1 * 86400;
      const score = calculateHealth(oneDayAgo, 1, 7, now); // text weight

      expect(score.score).toBeGreaterThan(0);
      expect(score.lastInteractionTimestamp).toBe(oneDayAgo);
    });

    it('handles call interaction weight correctly', () => {
      const oneDayAgo = now - 1 * 86400;
      const score = calculateHealth(oneDayAgo, 3, 7, now); // call weight

      expect(score.score).toBeGreaterThan(0);
      expect(score.score).toBeGreaterThan(calculateHealth(oneDayAgo, 1, 7, now).score);
    });

    it('handles hangout interaction weight correctly', () => {
      const oneDayAgo = now - 1 * 86400;
      const score = calculateHealth(oneDayAgo, 6, 7, now); // hangout weight

      expect(score.score).toBeGreaterThan(0);
      expect(score.score).toBeGreaterThan(calculateHealth(oneDayAgo, 3, 7, now).score);
    });

    it('respects expected interval days in calculation', () => {
      const sevenDaysAgo = now - 7 * 86400;
      const shortInterval = calculateHealth(sevenDaysAgo, 6, 7, now);
      const longInterval = calculateHealth(sevenDaysAgo, 6, 14, now);

      // Longer expected interval should result in higher score for same elapsed time
      expect(longInterval.score).toBeGreaterThan(shortInterval.score);
    });

    it('returns correct expectedIntervalDays', () => {
      const sevenDaysAgo = now - 7 * 86400;
      const score = calculateHealth(sevenDaysAgo, 6, 14, now);

      expect(score.expectedIntervalDays).toBe(14);
    });

    it('handles edge case: interaction exactly at expected interval', () => {
      const fourteenDaysAgo = now - 14 * 86400;
      const score = calculateHealth(fourteenDaysAgo, 6, 14, now);

      expect(score.score).toBeGreaterThan(0);
      expect(typeof score.status).toBe('string');
      expect(['green', 'yellow', 'red']).toContain(score.status);
    });

    it('handles very recent interaction', () => {
      const oneHourAgo = now - 3600;
      const score = calculateHealth(oneHourAgo, 6, 14, now);

      expect(score.status).toBe('green');
      expect(score.score).toBeCloseTo(6, 1); // Should be very close to the weight
    });
  });
});

