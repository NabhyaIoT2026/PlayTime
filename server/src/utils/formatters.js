/**
 * Formats integer seconds into HH:MM:SS or MM:SS format.
 *
 * @param {number} totalSeconds
 * @returns {string} e.g. "01:24:35" or "04:12"
 */
export function formatDurationClock(totalSeconds) {
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
 * Formats integer seconds into a human-friendly string with days, hours, minutes, and seconds.
 *
 * @param {number} totalSeconds
 * @returns {object} { days, hours, minutes, seconds, text, shortText }
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
  const shortParts = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    shortParts.push(`${days}d`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    shortParts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
    shortParts.push(`${minutes}m`);
  }
  if (seconds > 0 || (days === 0 && hours === 0 && minutes === 0)) {
    parts.push(`${seconds} ${seconds === 1 ? 'sec' : 'secs'}`);
    shortParts.push(`${seconds}s`);
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    text: parts.join(' '),
    shortText: shortParts.join(' ') || '0s',
  };
}

/**
 * Calculates adjusted watch time, saved time, and savings percentage for a given playback speed.
 *
 * @param {number} totalSeconds - Total playlist or video duration in integer seconds
 * @param {number} playbackSpeed - Multiplier, e.g. 1.25, 1.5, 2
 * @returns {object}
 */
export function calculateSpeedMetrics(totalSeconds, playbackSpeed) {
  const total = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const speed = Math.max(0.1, Number(playbackSpeed) || 1);

  if (total === 0) {
    return {
      speed,
      adjustedSeconds: 0,
      savedSeconds: 0,
      percentSaved: 0,
      clockTime: '00:00',
      detailed: formatDetailedDuration(0),
    };
  }

  // Adjusted watch time = Total video duration / Playback speed
  const adjustedSeconds = Math.round(total / speed);
  // Time saved = Original watch time - Adjusted watch time
  const savedSeconds = Math.max(0, total - adjustedSeconds);
  // Percentage saved = (Time saved / Original watch time) * 100
  const percentSaved = Math.min(100, Math.max(0, ((savedSeconds / total) * 100)));

  return {
    speed,
    adjustedSeconds,
    savedSeconds,
    percentSaved: Math.round(percentSaved * 10) / 10,
    clockTime: formatDurationClock(adjustedSeconds),
    detailed: formatDetailedDuration(adjustedSeconds),
    savedDetailed: formatDetailedDuration(savedSeconds),
  };
}
