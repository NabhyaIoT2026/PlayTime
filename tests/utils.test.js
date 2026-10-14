import { describe, it, expect } from 'vitest';
import { extractPlaylistId, isValidPlaylistInput } from '../server/src/utils/urlParser.js';
import { extractChannelIdentifier } from '../server/src/utils/channelParser.js';
import { parseIsoDuration } from '../server/src/utils/durationParser.js';
import {
  formatDurationClock,
  formatDetailedDuration,
  calculateSpeedMetrics,
} from '../server/src/utils/formatters.js';

describe('YouTube URL & Playlist ID Parser', () => {
  it('extracts ID from standard youtube.com/playlist URL', () => {
    const url = 'https://www.youtube.com/playlist?list=PL4cUxeGndAe7_h29fR1g8e_2077eW3Lh-';
    expect(extractPlaylistId(url)).toBe('PL4cUxeGndAe7_h29fR1g8e_2077eW3Lh-');
  });

  it('extracts ID from URLs with extra query parameters', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLr6-S5450EAeP9Y8i_x-k7h5v_bXQW&index=14&t=45s&si=abc123xyz';
    expect(extractPlaylistId(url)).toBe('PLr6-S5450EAeP9Y8i_x-k7h5v_bXQW');
  });

  it('extracts ID from youtu.be short URLs with list param', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxOJ';
    expect(extractPlaylistId(url)).toBe('PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxOJ');
  });

  it('extracts ID from music.youtube.com URLs', () => {
    const url = 'https://music.youtube.com/playlist?list=RDCLAK5uy_kfd8732hb';
    expect(extractPlaylistId(url)).toBe('RDCLAK5uy_kfd8732hb');
  });

  it('accepts raw valid playlist IDs directly', () => {
    const id = 'PL4cUxeGndAe7_h29fR1g8e_2077eW3Lh-';
    expect(extractPlaylistId(id)).toBe(id);
    expect(isValidPlaylistInput(id)).toBe(true);
  });

  it('rejects invalid YouTube URLs or random strings', () => {
    expect(extractPlaylistId('')).toBeNull();
    expect(extractPlaylistId(null)).toBeNull();
    expect(extractPlaylistId('https://google.com')).toBeNull();
    expect(extractPlaylistId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(extractPlaylistId('invalid-short')).toBeNull();
    expect(isValidPlaylistInput('https://github.com')).toBe(false);
  });
});

describe('YouTube Channel Identifier Parser', () => {
  it('extracts handle from @handle URLs and raw handles', () => {
    expect(extractChannelIdentifier('https://www.youtube.com/@mkbhd')).toEqual({
      type: 'handle',
      value: '@mkbhd',
    });
    expect(extractChannelIdentifier('https://youtube.com/@veritasium/videos')).toEqual({
      type: 'handle',
      value: '@veritasium',
    });
    expect(extractChannelIdentifier('@hubermanlab')).toEqual({
      type: 'handle',
      value: '@hubermanlab',
    });
  });

  it('extracts channelId from /channel/UC... URLs and raw IDs', () => {
    const channelId = 'UCBJycqUz6564EddUv7RlwWg';
    expect(extractChannelIdentifier(`https://www.youtube.com/channel/${channelId}`)).toEqual({
      type: 'channelId',
      value: channelId,
    });
    expect(extractChannelIdentifier(channelId)).toEqual({
      type: 'channelId',
      value: channelId,
    });
  });

  it('handles custom URLs like /c/name and /user/name', () => {
    expect(extractChannelIdentifier('https://www.youtube.com/c/TraversyMedia')).toEqual({
      type: 'username',
      value: 'TraversyMedia',
    });
  });

  it('rejects invalid or empty inputs', () => {
    expect(extractChannelIdentifier('')).toBeNull();
    expect(extractChannelIdentifier(null)).toBeNull();
  });
});

describe('ISO 8601 Duration Parser', () => {
  it('parses minutes and seconds (PT15M33S)', () => {
    expect(parseIsoDuration('PT15M33S')).toBe(15 * 60 + 33); // 933
  });

  it('parses hours, minutes, and seconds (PT1H2M10S)', () => {
    expect(parseIsoDuration('PT1H2M10S')).toBe(3600 + 120 + 10); // 3730
  });

  it('parses seconds only (PT45S)', () => {
    expect(parseIsoDuration('PT45S')).toBe(45);
  });

  it('parses hours only (PT2H)', () => {
    expect(parseIsoDuration('PT2H')).toBe(7200);
  });

  it('parses days and hours (P1DT2H)', () => {
    expect(parseIsoDuration('P1DT2H')).toBe(86400 + 7200); // 93600
  });

  it('handles zero durations (PT0S, P0D)', () => {
    expect(parseIsoDuration('PT0S')).toBe(0);
    expect(parseIsoDuration('P0D')).toBe(0);
  });

  it('handles invalid or malformed strings gracefully', () => {
    expect(parseIsoDuration('')).toBe(0);
    expect(parseIsoDuration(null)).toBe(0);
    expect(parseIsoDuration('NotADuration')).toBe(0);
  });
});

describe('Duration Formatters', () => {
  it('formats seconds into clock time MM:SS and HH:MM:SS', () => {
    expect(formatDurationClock(65)).toBe('1:05');
    expect(formatDurationClock(3665)).toBe('1:01:05');
    expect(formatDurationClock(0)).toBe('0:00');
  });

  it('formats detailed durations including days for >24 hour playlists', () => {
    // 1 day, 2 hours, 30 minutes, 15 seconds = 86400 + 7200 + 1800 + 15 = 95415
    const res = formatDetailedDuration(95415);
    expect(res.days).toBe(1);
    expect(res.hours).toBe(2);
    expect(res.minutes).toBe(30);
    expect(res.seconds).toBe(15);
    expect(res.shortText).toContain('1d 2h 30m 15s');
  });

  it('handles zero duration', () => {
    const res = formatDetailedDuration(0);
    expect(res.days).toBe(0);
    expect(res.hours).toBe(0);
    expect(res.minutes).toBe(0);
    expect(res.seconds).toBe(0);
    expect(res.shortText).toBe('0s');
  });
});

describe('Playback Speed Calculations', () => {
  const ONE_HOUR = 3600; // 3600 seconds

  it('calculates 1x speed accurately', () => {
    const stats = calculateSpeedMetrics(ONE_HOUR, 1.0);
    expect(stats.adjustedSeconds).toBe(3600);
    expect(stats.savedSeconds).toBe(0);
    expect(stats.percentSaved).toBe(0);
  });

  it('calculates 2x speed accurately (saves 50% time)', () => {
    const stats = calculateSpeedMetrics(ONE_HOUR, 2.0);
    expect(stats.adjustedSeconds).toBe(1800);
    expect(stats.savedSeconds).toBe(1800);
    expect(stats.percentSaved).toBe(50);
  });

  it('calculates 1.5x speed accurately', () => {
    const stats = calculateSpeedMetrics(ONE_HOUR, 1.5);
    // 3600 / 1.5 = 2400
    expect(stats.adjustedSeconds).toBe(2400);
    expect(stats.savedSeconds).toBe(1200);
    expect(stats.percentSaved).toBe(33.3);
  });

  it('calculates slower speeds like 0.75x safely without negative savings', () => {
    const stats = calculateSpeedMetrics(ONE_HOUR, 0.75);
    // 3600 / 0.75 = 4800 (longer)
    expect(stats.adjustedSeconds).toBe(4800);
    expect(stats.savedSeconds).toBe(0);
  });

  it('handles custom speed multipliers (e.g. 1.75x, 2.25x)', () => {
    const stats = calculateSpeedMetrics(ONE_HOUR, 1.75);
    expect(stats.adjustedSeconds).toBe(Math.round(3600 / 1.75));
    expect(stats.percentSaved).toBeGreaterThan(0);
  });

  it('handles zero-duration playlist safely without division-by-zero errors', () => {
    const stats = calculateSpeedMetrics(0, 2.0);
    expect(stats.adjustedSeconds).toBe(0);
    expect(stats.savedSeconds).toBe(0);
    expect(stats.percentSaved).toBe(0);
  });
});

describe('Calendar & Study Plan Export', () => {
  it('generates standard RFC 5545 iCalendar (.ics) content', async () => {
    const { generateIcsContent } = await import('../client/src/utils/calendarExport.js');
    const ics = generateIcsContent({
      title: 'Python Mastery',
      startDate: new Date('2026-11-01T00:00:00'),
      daysNeeded: 5,
      dailyMinutes: 60,
      selectedSpeed: 1.5,
    });

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('SUMMARY:Playtime Study: Python Mastery (Day 1/5)');
    expect(ics).toContain('SUMMARY:Playtime Study: Python Mastery (Day 5/5)');
    expect(ics).toContain('1.5× speed');
  });

  it('generates correct Google Calendar web URL', async () => {
    const { createGoogleCalendarUrl } = await import('../client/src/utils/calendarExport.js');
    const url = createGoogleCalendarUrl({
      title: 'React Fundamentals',
      startDate: new Date('2026-11-01T00:00:00'),
      dailyMinutes: 45,
      selectedSpeed: 2.0,
      daysNeeded: 7,
    });

    expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
    expect(url).toContain('React%20Fundamentals');
    expect(url).toContain('RRULE%3AFREQ%3DDAILY%3BCOUNT%3D7');
  });

  it('generates Notion and Markdown checklists with checkboxes and links', async () => {
    const { generateStudyMarkdown } = await import('../client/src/utils/calendarExport.js');
    const md = generateStudyMarkdown({
      playlistTitle: 'TypeScript Deep Dive',
      videos: [
        { id: 'abc123xyz', position: 1, title: 'Intro to TS', durationSeconds: 600 },
        { id: 'def456uvw', position: 2, title: 'Generics', durationSeconds: 1200 },
      ],
      selectedSpeed: 1.5,
      plan: { dailyMinutes: 30, daysNeeded: 3 },
    });

    expect(md).toContain('# 📚 Study Plan: TypeScript Deep Dive');
    expect(md).toContain('- [ ] **#1** Intro to TS — `10:00` (@ 1.5×: 6:40) ([Watch](https://www.youtube.com/watch?v=abc123xyz))');
    expect(md).toContain('- [ ] **#2** Generics — `20:00` (@ 1.5×: 13:20) ([Watch](https://www.youtube.com/watch?v=def456uvw))');
  });
});

