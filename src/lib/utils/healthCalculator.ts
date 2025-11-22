import { HealthScore, HealthStatus } from '../models';

const DECAY_FACTOR = 2.0;

export function calculateHealth(
  lastInteractionTimestamp: number | null,
  lastInteractionWeight: number | null,
  expectedIntervalDays: number,
  currentTimestamp: number
): HealthScore {
  if (lastInteractionTimestamp === null || lastInteractionWeight === null) {
    return {
      contactId: 0, // Will be set by caller
      score: 0.0,
      status: 'red' as HealthStatus,
      lastInteractionTimestamp: null,
      expectedIntervalDays,
    };
  }

  const daysElapsed = Math.floor((currentTimestamp - lastInteractionTimestamp) / 86400);
  const decayRate = 1.0 / (expectedIntervalDays * DECAY_FACTOR);
  const score = lastInteractionWeight * Math.exp(-decayRate * daysElapsed);

  let status: HealthStatus;
  if (score >= 0.5) {
    status = 'green';
  } else if (score >= 0.2) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    contactId: 0, // Will be set by caller
    score,
    status,
    lastInteractionTimestamp,
    expectedIntervalDays,
  };
}

