/**
 * Calendar and Study Plan Export Utilities
 * Provides iCal (.ics) generation, Google Calendar links, and Notion/Markdown checklist export.
 */

import { formatClockTime } from './calculations.js';

/**
 * Pads a single digit with a leading zero.
 */
function pad(num) {
  return String(num).padStart(2, '0');
}

/**
 * Formats a date into iCalendar UTC/Local format: YYYYMMDDTHHMMSS
 */
function formatIcsDateTime(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/**
 * Generates an iCalendar (.ics) string for recurring or daily study sessions.
 * 
 * @param {object} params
 * @param {string} params.title - Course or playlist title
 * @param {Date} params.startDate - Schedule start date
 * @param {number} params.daysNeeded - Number of daily sessions
 * @param {number} params.dailyMinutes - Daily study minutes
 * @param {number} params.selectedSpeed - Multiplier
 * @param {number} [params.startHour=19] - Default start time hour (e.g. 19:00 / 7 PM)
 * @returns {string} ICS file content
 */
export function generateIcsContent({
  title = 'Study Session',
  startDate = new Date(),
  daysNeeded = 1,
  dailyMinutes = 60,
  selectedSpeed = 1.0,
  startHour = 19,
}) {
  const base = new Date(startDate);
  base.setHours(startHour, 0, 0, 0);

  const durationMinutes = Math.max(15, dailyMinutes);
  const totalDays = Math.max(1, Math.min(365, daysNeeded));

  let events = '';
  const nowStr = formatIcsDateTime(new Date()) + 'Z';

  for (let i = 0; i < totalDays; i++) {
    const sessionStart = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
    const sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60 * 1000);

    const uid = `playtime-${Date.now()}-${i}@playtime.app`;
    const summary = `Playtime Study: ${title} (Day ${i + 1}/${totalDays})`;
    const description = `Daily video study session for "${title}" at ${selectedSpeed}× speed. Target: ${durationMinutes} minutes.`;

    events += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${nowStr}
DTSTART:${formatIcsDateTime(sessionStart)}
DTEND:${formatIcsDateTime(sessionEnd)}
SUMMARY:${summary}
DESCRIPTION:${description}
STATUS:CONFIRMED
END:VEVENT
`;
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PlayTime//YouTube Playlist Study Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Playtime - ${title}
${events}END:VCALENDAR`;
}

/**
 * Triggers a browser download of the given .ics text content.
 * 
 * @param {string} filename 
 * @param {string} content 
 */
export function downloadFile(filename, content, mimeType = 'text/calendar;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a 1-click Google Calendar web event URL for the first day's session.
 * 
 * @param {object} params
 * @param {string} params.title
 * @param {Date} params.startDate
 * @param {number} params.dailyMinutes
 * @param {number} params.selectedSpeed
 * @param {number} [params.daysNeeded=1]
 * @returns {string}
 */
export function createGoogleCalendarUrl({
  title = 'YouTube Study Session',
  startDate = new Date(),
  dailyMinutes = 60,
  selectedSpeed = 1.0,
  daysNeeded = 1,
}) {
  const base = new Date(startDate);
  base.setHours(19, 0, 0, 0); // 7:00 PM
  const end = new Date(base.getTime() + dailyMinutes * 60 * 1000);

  const startIso = base.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const endIso = end.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const text = encodeURIComponent(`Study: ${title}`);
  const details = encodeURIComponent(
    `Daily study session for "${title}".\nPlanned pace: ${dailyMinutes} mins/day at ${selectedSpeed}× speed across ${daysNeeded} days.\nTracked with Playtime.`
  );
  const recur = encodeURIComponent(`RRULE:FREQ=DAILY;COUNT=${Math.min(365, daysNeeded)}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startIso}/${endIso}&details=${details}&recur=${recur}`;
}

/**
 * Generates Markdown / Notion checklist ready to paste into Notion or notes.
 * 
 * @param {object} params
 * @param {string} params.playlistTitle
 * @param {Array} params.videos
 * @param {number} params.selectedSpeed
 * @param {object} params.plan
 * @returns {string} Markdown text
 */
export function generateStudyMarkdown({
  playlistTitle = 'YouTube Course',
  videos = [],
  selectedSpeed = 1.0,
  plan = {},
}) {
  let md = `# 📚 Study Plan: ${playlistTitle}\n\n`;
  md += `> **Pace**: ${plan.dailyMinutes || 60} mins/day at **${selectedSpeed}×** playback speed  \n`;
  md += `> **Total Estimated Days**: ${plan.daysNeeded || 1} days  \n`;
  if (plan.completionDate) {
    const finish = new Date(plan.completionDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    md += `> **Target Completion Date**: ${finish}  \n`;
  }
  md += `\n---\n\n## 📝 Video Checklist\n\n`;

  if (videos.length === 0) {
    md += `*No individual video list available for this schedule.*\n`;
  } else {
    videos.forEach((v, index) => {
      const pos = v.position || index + 1;
      const duration = formatClockTime(v.durationSeconds || 0);
      const adjDuration = formatClockTime(Math.round((v.durationSeconds || 0) / selectedSpeed));
      const speedNote = Math.abs(selectedSpeed - 1.0) > 0.05 ? ` (@ ${selectedSpeed}×: ${adjDuration})` : '';
      const link = v.id ? `([Watch](https://www.youtube.com/watch?v=${v.id}))` : '';
      md += `- [ ] **#${pos}** ${v.title} — \`${duration}\`${speedNote} ${link}\n`;
    });
  }

  md += `\n---\n*Generated by Playtime YouTube Playlist Length Calculator*\n`;
  return md;
}
