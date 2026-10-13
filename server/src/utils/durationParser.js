/**
 * Parses an ISO 8601 duration string (as returned by YouTube API v3) into integer seconds.
 * 
 * Supports days, hours, minutes, seconds (e.g. PT1H2M10S, PT15M33S, PT45S, P1DT2H30M15S, PT0S).
 *
 * @param {string} isoDuration - The ISO 8601 duration string
 * @returns {number} - Total duration in integer seconds (0 if invalid or empty)
 */
export function parseIsoDuration(isoDuration) {
  if (!isoDuration || typeof isoDuration !== 'string') {
    return 0;
  }

  const trimmed = isoDuration.trim();
  if (!trimmed || !trimmed.startsWith('P')) {
    return 0;
  }

  // Regex matches ISO 8601 duration parts:
  // P(n)Y(n)M(n)W(n)D T (n)H(n)M(n)S
  const regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
  const matches = trimmed.match(regex);

  if (!matches) {
    return 0;
  }

  const years = parseInt(matches[1] || '0', 10);
  const months = parseInt(matches[2] || '0', 10);
  const weeks = parseInt(matches[3] || '0', 10);
  const days = parseInt(matches[4] || '0', 10);
  const hours = parseInt(matches[5] || '0', 10);
  const minutes = parseInt(matches[6] || '0', 10);
  const seconds = Math.round(parseFloat(matches[7] || '0'));

  // Calculate total seconds
  // Standard conversion approximations if Y or M appear (rare in video lengths)
  const totalSeconds =
    years * 365 * 86400 +
    months * 30 * 86400 +
    weeks * 7 * 86400 +
    days * 86400 +
    hours * 3600 +
    minutes * 60 +
    seconds;

  return isNaN(totalSeconds) ? 0 : Math.max(0, totalSeconds);
}
