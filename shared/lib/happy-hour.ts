import { HappyHourConfig } from '@prisma/client';
import { DEFAULT_BONUS_PERCENT } from './checkout-pricing';

function parseHm(s: string): { h: number; m: number } {
  const [h, m] = s.split(':').map((x) => Number(x));
  return { h: h || 0, m: m || 0 };
}

function toMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function getAccrualBonusPercent(
  now: Date,
  happy: HappyHourConfig | null,
): { percent: number; happyHour: boolean } {
  if (!happy || !happy.enabled) {
    return { percent: DEFAULT_BONUS_PERCENT, happyHour: false };
  }

  const cur = toMinutes(now);
  const start = parseHm(happy.startTime);
  const end = parseHm(happy.endTime);
  const startM = start.h * 60 + start.m;
  const endM = end.h * 60 + end.m;

  let inside = false;
  if (startM <= endM) {
    inside = cur >= startM && cur <= endM;
  } else {
    inside = cur >= startM || cur <= endM;
  }

  if (inside) {
    return { percent: happy.bonusPercent, happyHour: true };
  }

  return { percent: DEFAULT_BONUS_PERCENT, happyHour: false };
}
