/**
 * YouTube Playlist URL & ID Extraction utility for client.
 */
export function extractPlaylistId(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const playlistPrefixRegex = /^(PL|UU|LL|FL|RD|OLAK|EL|CL)[a-zA-Z0-9_-]{10,64}$/i;
  const generalListRegex = /^[a-zA-Z0-9_-]{12,64}$/;

  // Raw playlist ID without URL punctuation
  if (!trimmed.includes('/') && !trimmed.includes('?') && !trimmed.includes('&') && !trimmed.includes('=')) {
    if (playlistPrefixRegex.test(trimmed)) {
      return trimmed;
    }
    return null;
  }

  // Regex for ?list= parameter
  const listParamRegex = /[?&]list=([a-zA-Z0-9_-]+)/i;
  const match = trimmed.match(listParamRegex);

  if (match && match[1]) {
    const listId = match[1];
    if (generalListRegex.test(listId)) {
      return listId;
    }
  }

  // Fallback URL parsing
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
    // ignore
  }

  return null;
}

export function isValidPlaylistInput(input) {
  return extractPlaylistId(input) !== null;
}
