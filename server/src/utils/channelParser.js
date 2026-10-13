/**
 * Extracts YouTube channel identifier (handle, channelId, or username) from various YouTube channel URLs.
 *
 * Supported formats:
 * - https://www.youtube.com/@mkbhd
 * - https://youtube.com/@mkbhd/videos
 * - https://www.youtube.com/channel/UCBJycqUz6564EddUv7RlwWg
 * - https://www.youtube.com/c/Veritasium
 * - https://www.youtube.com/user/pewdiepie
 * - Raw handle: @mkbhd or mkbhd
 * - Raw channel ID: UC...
 *
 * @param {string} input
 * @returns {{ type: 'handle'|'channelId'|'username', value: string } | null}
 */
export function extractChannelIdentifier(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // 1. Check if input is a handle: @username
  if (trimmed.startsWith('@')) {
    const handle = trimmed.slice(1).split(/[/?#]/)[0];
    if (/^[a-zA-Z0-9_.-]{3,30}$/.test(handle)) {
      return { type: 'handle', value: `@${handle}` };
    }
  }

  // 2. Check if raw channel ID: UC... (24 characters)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(trimmed)) {
    return { type: 'channelId', value: trimmed };
  }

  // 3. Parse URLs
  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(urlString);
    const pathname = parsed.pathname;

    // Handle /@handle format
    const handleMatch = pathname.match(/\/@([a-zA-Z0-9_.-]+)/i);
    if (handleMatch && handleMatch[1]) {
      return { type: 'handle', value: `@${handleMatch[1]}` };
    }

    // Handle /channel/UC... format
    const channelMatch = pathname.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
    if (channelMatch && channelMatch[1]) {
      return { type: 'channelId', value: channelMatch[1] };
    }

    // Handle /c/name or /user/name
    const customMatch = pathname.match(/\/(?:c|user)\/([a-zA-Z0-9_.-]+)/i);
    if (customMatch && customMatch[1]) {
      return { type: 'username', value: customMatch[1] };
    }

    // If pathname is just /something without other slashes (and not empty)
    const singleSlug = pathname.replace(/^\/+|\/+$/g, '');
    if (singleSlug && /^[a-zA-Z0-9_.-]{3,30}$/.test(singleSlug)) {
      // If it looks like a handle without @
      return { type: 'handle', value: `@${singleSlug}` };
    }
  } catch {
    // If not a valid URL, check if it looks like a handle name
    if (/^[a-zA-Z0-9_.-]{3,30}$/.test(trimmed)) {
      return { type: 'handle', value: `@${trimmed}` };
    }
  }

  return null;
}
