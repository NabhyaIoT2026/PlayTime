/**
 * Playtime Core Calculation Utilities
 */

/**
 * Formats seconds into HH:MM:SS or MM:SS
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatClockTime(totalSeconds) {
  const sec = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/**
 * Formats seconds into human readable breakdown:
 * e.g., "7 hours 53 minutes" or "1 day 4 hours"
 * @param {number} totalSeconds
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, formatted: string, concise: string }}
 */
export function formatDetailedDuration(totalSeconds) {
  const sec = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const days = Math.floor(sec / 86400);
  const remDay = sec % 86400;
  const hours = Math.floor(remDay / 3600);
  const remHour = remDay % 3600;
  const minutes = Math.floor(remHour / 60);
  const seconds = remHour % 60;

  const parts = [];
  const conciseParts = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    conciseParts.push(`${days}d`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hr' : 'hrs'}`);
    conciseParts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
    conciseParts.push(`${minutes}m`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} ${seconds === 1 ? 'sec' : 'secs'}`);
    conciseParts.push(`${seconds}s`);
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    formatted: parts.join(' '),
    concise: conciseParts.join(' ') || '0s',
  };
}

/**
 * Calculates playback speed statistics for any given speed multiplier.
 * Formula:
 * Adjusted watch time = Total video duration / Playback speed
 * Time saved = Original watch time - Adjusted watch time
 * Percentage saved = (Time saved / Original watch time) * 100
 *
 * @param {number} totalSeconds
 * @param {number} speed
 * @returns {object}
 */
export function calculateSpeedStats(totalSeconds, speed) {
  const total = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const mult = Math.max(0.1, Number(speed) || 1);

  if (total === 0) {
    return {
      speed: mult,
      adjustedSeconds: 0,
      savedSeconds: 0,
      percentSaved: 0,
      clockTime: '00:00',
      detailed: formatDetailedDuration(0),
      savedDetailed: formatDetailedDuration(0),
    };
  }

  const adjustedSeconds = Math.round(total / mult);
  const savedSeconds = Math.max(0, total - adjustedSeconds);
  const percentSaved = Math.min(100, Math.max(0, (savedSeconds / total) * 100));

  return {
    speed: mult,
    adjustedSeconds,
    savedSeconds,
    percentSaved: Math.round(percentSaved * 10) / 10,
    clockTime: formatClockTime(adjustedSeconds),
    detailed: formatDetailedDuration(adjustedSeconds),
    savedDetailed: formatDetailedDuration(savedSeconds),
  };
}

/**
 * Safely parses YYYY-MM-DD string or Date object into a local Date with hours set to 0.
 */
function toLocalDate(input) {
  if (!input) return null;
  if (input instanceof Date) {
    const d = new Date(input.getTime());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (typeof input === 'string') {
    const parts = input.split('T')[0].split('-').map(Number);
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    }
  }
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Study Planner Calculator:
 * Computes study schedule, estimated daily videos, completion date, and target feasibility.
 *
 * @param {object} params
 * @param {number} params.totalDurationSeconds
 * @param {number} params.totalVideosCount
 * @param {number} params.averageDurationSeconds
 * @param {number} params.playbackSpeed
 * @param {number} params.dailyMinutes - Minutes user wants to study per day (30 to 720)
 * @param {string|Date} [params.startDate] - ISO date or Date object
 * @param {string|Date} [params.targetDate] - Optional target deadline date
 * @returns {object}
 */
export function calculateStudyPlan({
  totalDurationSeconds = 0,
  totalVideosCount = 0,
  averageDurationSeconds = 0,
  playbackSpeed = 1.0,
  dailyMinutes = 60,
  startDate = new Date(),
  targetDate = null,
}) {
  const totalSec = Math.max(0, Math.round(totalDurationSeconds || 0));
  const speed = Math.max(0.1, Number(playbackSpeed) || 1.0);
  const dailyMins = Math.max(10, Math.min(720, Number(dailyMinutes) || 60)); // clamp between 10m and 12h
  const dailySec = dailyMins * 60;

  const start = toLocalDate(startDate) || new Date();
  start.setHours(0, 0, 0, 0);

  // 1. Adjusted total seconds for chosen speed
  const adjustedSeconds = Math.round(totalSec / speed);

  if (adjustedSeconds === 0) {
    return {
      adjustedSeconds: 0,
      dailyMinutes: dailyMins,
      daysNeeded: 0,
      estimatedDailyVideos: 0,
      completionDate: new Date(start),
      targetAnalysis: null,
    };
  }

  // 2. Days required based on daily viewing time
  const daysNeeded = Math.max(1, Math.ceil(adjustedSeconds / dailySec));

  // 3. Estimated completion date
  const completionDate = new Date(start.getTime());
  completionDate.setDate(completionDate.getDate() + daysNeeded);

  // 4. Estimated videos per day
  let estimatedDailyVideos = 0;
  if (totalVideosCount > 0 && daysNeeded > 0) {
    estimatedDailyVideos = Math.max(1, Math.round((totalVideosCount / daysNeeded) * 10) / 10);
  }

  // 5. Target Date Analysis (if specified)
  let targetAnalysis = null;
  const target = toLocalDate(targetDate);

  if (target) {
    const diffMs = target.getTime() - start.getTime();
    const daysAvailable = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    // Required daily seconds to hit target
    const requiredDailySeconds = Math.round(adjustedSeconds / daysAvailable);
    const requiredDailyMinutes = Math.round(requiredDailySeconds / 60);

    const isAchievableWithCurrentPace = daysAvailable >= daysNeeded;
    const isPlausible = requiredDailyMinutes <= 720; // under 12 hours/day

    let status = 'achievable';
    let message = `You will finish ${daysAvailable - daysNeeded} days ahead of schedule!`;

    if (!isAchievableWithCurrentPace) {
      if (isPlausible) {
        status = 'pace_adjustment_needed';
        message = `To finish by your target, increase study time to ${formatClockTime(requiredDailySeconds)} per day.`;
      } else {
        status = 'unrealistic';
        message = `Target requires ${Math.round(requiredDailyMinutes / 60)} hrs/day. Consider extending the deadline.`;
      }
    }

    targetAnalysis = {
      daysAvailable,
      requiredDailyMinutes,
      requiredDailyClock: formatClockTime(requiredDailySeconds),
      isAchievable: isAchievableWithCurrentPace,
      isPlausible,
      status,
      message,
    };
  }

  return {
    adjustedSeconds,
    dailyMinutes: dailyMins,
    daysNeeded,
    estimatedDailyVideos,
    completionDate,
    targetAnalysis,
  };
}
