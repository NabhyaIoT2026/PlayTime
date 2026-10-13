/**
 * Extracts and validates a YouTube Playlist ID from various URL formats or raw ID string.
 *
 * Supported formats:
 * - https://www.youtube.com/playlist?list=PLxxxxxx
 * - http://youtube.com/playlist?list=PLxxxxxx
 * - https://www.youtube.com/watch?v=VIDEO_ID&list=PLxxxxxx
 * - https://youtu.be/VIDEO_ID?list=PLxxxxxx
 * - https://music.youtube.com/playlist?list=PLxxxxxx
 * - Raw playlist IDs: PL..., UU..., LL..., FL..., RD..., OLAK5uy_...
 *
 * @param {string} input - The input string or URL
 * @returns {string|null} - The validated playlist ID, or null if invalid
 */
export function extractPlaylistId(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // YouTube playlist IDs strictly begin with recognized prefixes:
  // PL (regular), UU (uploads), LL (liked), FL (favorites), RD (radio/mix),
  // OLAK5uy_ (album), EL (shows), CL (courses), etc.
  const playlistPrefixRegex = /^(PL|UU|LL|FL|RD|OLAK|EL|CL)[a-zA-Z0-9_-]{10,64}$/i;
  const generalListRegex = /^[a-zA-Z0-9_-]{12,64}$/;

  // If it does not contain a scheme/domain/query indicator, check if it matches valid playlist prefixes
  if (!trimmed.includes('/') && !trimmed.includes('?') && !trimmed.includes('&') && !trimmed.includes('=')) {
    if (playlistPrefixRegex.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  // 2. Parse URL with regex to reliably extract the 'list' query parameter
  // Regex handles various protocols and domains (youtube.com, m.youtube.com, music.youtube.com, youtu.be)
  const listParamRegex = /[?&]list=([a-zA-Z0-9_-]+)/i;
  const match = trimmed.match(listParamRegex);

  if (match && match[1]) {
    const listId = match[1];
    if (generalListRegex.test(listId)) {
      return listId;
    }
  }

  // 3. Fallback: try parsing with standard URL constructor
  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
    const parsed = new URL(urlString);
    const listId = parsed.searchParams.get('list');
    if (listId && generalListRegex.test(listId)) {
      return listId;
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

/**
 * Validates whether an input is a valid YouTube playlist URL or ID.
 * @param {string} input 
 * @returns {boolean}
 */
export function isValidPlaylistInput(input) {
  return extractPlaylistId(input) !== null;
}
