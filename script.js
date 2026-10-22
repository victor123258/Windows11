(() => {
'use strict';

// ═══════════════════════════════════════
// SECTION: UTILITIES — DOM, formatting and helpers
// ═══════════════════════════════════════
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const h = (tag, className = '', html = '') => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== '') node.innerHTML = html;
  return node;
};
const esc = (value = '') => String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const uid = (() => { let n = 0; return (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(++n).toString(36)}`; })();
const debounce = (fn, wait = 200) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); }; };
const rafThrottle = (fn) => { let queued = false; let lastArgs; return (...args) => { lastArgs = args; if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; fn(...lastArgs); }); }; };
const formatBytes = (bytes) => {
  if (bytes === 0 || bytes == null) return '0 bytes';
  if (bytes < 1024) return `${bytes} bytes`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; }
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
};
const formatDate = (input, style = 'short') => {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  if (style === 'short') return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  if (style === 'long') return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  if (style === 'time') return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (style === 'datetime') return `${formatDate(date, 'short')} ${formatDate(date, 'time')}`;
  return date.toLocaleDateString('en-US');
};
const timeAgo = (input) => {
  const then = input instanceof Date ? input.getTime() : new Date(input).getTime();
  const mins = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};
const fileExtension = (name) => {
  const index = String(name).lastIndexOf('.');
  return index > -1 ? String(name).slice(index + 1).toLowerCase() : '';
};
const fileIconName = (node) => {
  if (!node) return 'file';
  if (node.type === 'folder') {
    if (node.name === 'Pictures' || node.name === 'Wallpapers' || node.name === 'Screenshots') return 'folder-image';
    if (node.name === 'Music') return 'folder-music';
    if (node.name === 'Videos') return 'folder-video';
    if (node.name === 'Recycle Bin') return state.recycleBin.length ? 'recyclebin-full' : 'recyclebin';
    if (node.name === 'This PC') return 'thispc';
    return 'folder';
  }
  const ext = fileExtension(node.name);
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return 'image-file';
  if (['txt', 'md', 'log', 'ini'].includes(ext)) return 'text-file';
  if (['js', 'json', 'html', 'css', 'ts', 'py', 'xml'].includes(ext)) return 'code-file';
  if (['mp3', 'wav', 'flac', 'ogg'].includes(ext)) return 'music-file';
  if (['mp4', 'mkv', 'mov', 'avi'].includes(ext)) return 'video-file';
  if (ext === 'docx' || ext === 'doc') return 'word';
  if (ext === 'xlsx' || ext === 'xls') return 'excel';
  if (ext === 'pptx' || ext === 'ppt') return 'powerpoint';
  if (ext === 'exe' || ext === 'msi') return 'app-file';
  if (ext === 'pdf') return 'pdf-file';
  return 'file';
};
const fileTypeLabel = (node) => {
  if (!node) return 'File';
  if (node.type === 'folder') return 'File folder';
  const labels = { txt: 'Text Document', js: 'JavaScript File', json: 'JSON File', html: 'HTML Document', css: 'Cascading Style Sheet', png: 'PNG Image', jpg: 'JPEG Image', mp3: 'MP3 Audio', mp4: 'MP4 Video', docx: 'Microsoft Word Document', xlsx: 'Microsoft Excel Worksheet', pptx: 'Microsoft PowerPoint Presentation', exe: 'Application' };
  return labels[fileExtension(node.name)] || `${fileExtension(node.name).toUpperCase() || 'Unknown'} File`;
};
const nodeSize = (node) => {
  if (!node) return 0;
  if (node.type === 'file') return node.size || new Blob([node.content || '']).size;
  return (node.children || []).reduce((sum, child) => sum + nodeSize(child), 0);
};
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ═══════════════════════════════════════
// SECTION: ICONS — centralized inline SVG library
// ═══════════════════════════════════════
const line = (d, extra = '') => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const fill = (d, color = 'currentColor', extra = '') => `<path d="${d}" fill="${color}" ${extra}/>`;
const circle = (cx, cy, r, color = 'currentColor', extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" ${extra}/>`;
const rect = (x, y, w, h, r, color = 'currentColor', extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}" ${extra}/>`;

const ICONS = {
  start: `${rect(2,2,9,9,1,'#0078D4')}${rect(13,2,9,9,1,'#0078D4')}${rect(2,13,9,9,1,'#0078D4')}${rect(13,13,9,9,1,'#0078D4')}`,
  search: `${line('M10.8 4a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6Z')}${line('m16 16 4.2 4.2')}`,
  'search-icon': `${line('M10.8 4a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6Z')}${line('m16 16 4.2 4.2')}`,
  taskview: `${rect(3,4,8,7,1.2,'none','stroke="currentColor" stroke-width="1.6"')}${rect(13,4,8,7,1.2,'none','stroke="currentColor" stroke-width="1.6"')}${rect(3,13,8,7,1.2,'none','stroke="currentColor" stroke-width="1.6"')}${rect(13,13,8,7,1.2,'none','stroke="currentColor" stroke-width="1.6"')}`,
  widgets: `${rect(3,3,8,8,2,'#0078D4')}${rect(13,3,8,8,2,'#4cc2ff')}${rect(3,13,8,8,2,'#8764b8')}${rect(13,13,8,8,2,'#00b294')}`,
  edge: `${fill('M20.7 9.2C19.6 6.1 16.3 4.1 12.9 4.5 9 5 6.4 8.5 7.1 12.3c.5 2.8 3 4.8 5.9 4.8 2.4 0 4.5-1.4 5.5-3.4-1.8.7-3.9.5-5.4-.6-1.5-1.1-2.2-3-1.7-4.8.5-1.8 2.2-3 4.1-2.8 2.3.2 4 2 4.4 4.2.1.8.1 1.5-.1 2.2.6-.7.9-1.7.9-2.7Z','#159bd7')}${fill('M7.2 12.5c.2 1.4.9 2.7 1.9 3.6-2.1-.4-3.8-1.9-4.4-3.9-.5-1.9-.2-3.9.8-5.5.7-1.1 1.7-2 2.8-2.6-1.6 1.9-2.1 4.6-1.1 6.9.2.5.4.9.7 1.3-.3.1-.5.1-.7.2Z','#35c1f1')}`,
  explorer: `${fill('M3 6.2c0-1.1.9-2 2-2h4.2l1.7 1.8H19c1.1 0 2 .9 2 2v9.8c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V6.2Z','#e9b32b')}${fill('M3 9.5c0-1 .8-1.8 1.8-1.8h14.4c1 0 1.8.8 1.8 1.8l-1 7.9c-.1.7-.7 1.2-1.4 1.2H5.4c-.7 0-1.3-.5-1.4-1.2L3 9.5Z','#ffd75e')}${line('M6 12.2h6.2')}`,
  store: `${fill('M5 8h14l-1 12H6L5 8Z','#0078D4')}${line('M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8','stroke="#0b5a9e" stroke-width="1.8"')}${rect(10.6,11.2,2.8,4.8,.8,'#fff')}${rect(9.5,11.2,5,1.5,.6,'#fff')}`,
  settings: `${line('M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z')}${line('M19.1 13.3a7.7 7.7 0 0 0 0-2.6l2-1.5-2-3.5-2.4 1a7.7 7.7 0 0 0-2.3-1.3L14.1 3h-4.2l-.4 2.4A7.7 7.7 0 0 0 7.3 6.7l-2.4-1-2 3.5 2 1.5a7.7 7.7 0 0 0 0 2.6l-2 1.5 2 3.5 2.4-1a7.7 7.7 0 0 0 2.3 1.3l.4 2.4h4.2l.4-2.4a7.7 7.7 0 0 0 2.3-1.3l2.4 1 2-3.5-2.2-1.5Z')}`,
  terminal: `${rect(2.5,4,19,16,1.5,'#101010')}${line('M6.5 9 9 11.5 6.5 14','stroke="#cccccc" stroke-width="1.5"')}${line('M11 15h5.5','stroke="#cccccc" stroke-width="1.5"')}`,
  vscode: `${fill('M17.8 2.2 9.4 10.1 5.5 7.1 3 8.3v7.4l2.5 1.2 3.9-3 8.4 7.9 3.2-1.5V3.7l-3.2-1.5Zm0 5.1v9.4l-5.8-4.7 5.8-4.7Z','#007ACC')}${fill('M5.5 9.4v5.2l2.6-2.6-2.6-2.6Z','#1e9ae0')}`,
  notepad: `${fill('M5 2.5h9.2L19 7.3v14.2H5V2.5Z','#f6f6f6')}${fill('M14 2.5v5h5','#d6e6f7')}${line('M7.5 10h8M7.5 13h8M7.5 16h5.5','stroke="#5c89b5" stroke-width="1.5"')}`,
  calculator: `${rect(4,2.2,16,19.6,2,'#e8e8e8')}${rect(6.5,4.5,11,4,.8,'#202020')}${rect(6.5,10.4,3,2.7,.5,'#a9a9a9')}${rect(10.5,10.4,3,2.7,.5,'#a9a9a9')}${rect(14.5,10.4,3,2.7,.5,'#0078d4')}${rect(6.5,14.2,3,2.7,.5,'#a9a9a9')}${rect(10.5,14.2,3,2.7,.5,'#a9a9a9')}${rect(14.5,14.2,3,2.7,.5,'#0078d4')}${rect(6.5,18,3,2.1,.5,'#a9a9a9')}${rect(10.5,18,3,2.1,.5,'#a9a9a9')}${rect(14.5,18,3,2.1,.5,'#0078d4')}`,
  paint: `${fill('M12 2.5C6.8 2.5 2.5 6.3 2.5 11.4c0 3.9 2.7 6.2 5.7 6.2h1.6c1.2 0 1.8.8 1.8 1.7 0 1.1 1 1.7 2 1.7 4.5 0 7.9-3.7 7.9-8.5S17.6 2.5 12 2.5Z','#e8e8e8')}${circle(8,7.2,1.4,'#e81123')}${circle(13,6,1.4,'#ffb900')}${circle(17,9,1.4,'#0078d4')}${circle(6.4,12,1.4,'#00b294')}${circle(16.8,14.5,1.4,'#8764b8')}`,
  photos: `${rect(2.5,4,19,16,2,'#e9eef4')}${fill('M4 18 9.3 11l4 5 2.4-2.8L20 18H4Z','#2e8b57')}${circle(16.8,7.7,2,'#f2b01e')}${fill('M4 18 9.3 11l1.7 2.1L7 18H4Z','#82c77d')}`,
  taskmanager: `${rect(3,3,18,18,2.5,'#e9eef4')}${rect(6,13,2.4,5,1,'#0078d4')}${rect(10.2,8,2.4,10,1,'#4cc2ff')}${rect(14.4,11,2.4,7,1,'#8764b8')}`,
  recyclebin: `${line('M5.5 7h13l-1 13h-11l-1-13Z')}${line('M4 7h16M9 7V4.8h6V7M10 10.3v6.5M14 10.3v6.5')}`,
  'recyclebin-full': `${line('M5.5 7h13l-1 13h-11l-1-13Z')}${line('M4 7h16M9 7V4.8h6V7M10 10.3v6.5M14 10.3v6.5')}${fill('M9 10.5 10.7 15l1.6-3 1.8 3L16 10.5l-1.2 5h-4.6L9 10.5Z','#0078d4')}`,
  thispc: `${rect(2.5,3.5,19,14,1.8,'none','stroke="currentColor" stroke-width="1.6"')}${line('M8 21h8M12 17.5V21')}${rect(5.5,6.5,13,8,1,'#0078d4')}`,
  word: `${rect(3,2.5,18,19,1.5,'#185abd')}${fill('M5.8 7.3 9.2 17h2.3l2.2-6.3 2.2 6.3h2.3l3.4-9.7h-2.6l-2 6.5-2.2-6.5h-2l-2.2 6.5-2-6.5H5.8Z','#fff')}`,
  excel: `${rect(3,2.5,18,19,1.5,'#107c41')}${line('M7 7.3l10 9.4M17 7.3 7 16.7','stroke="#fff" stroke-width="2.4"')}${rect(4.6,4.3,4.8,4.8,0,'#0b5c30')}${fill('M6 5.6l2.2 2.2-2.2 2.2.8.8L9 8.6l2.2 2.2.8-.8-2.2-2.2 2.2-2.2-.8-.8L9 6.8 6.8 4.8 6 5.6Z','#fff')}`,
  powerpoint: `${rect(3,2.5,18,19,1.5,'#d24726')}${line('M8 17V7.2h4a3.3 3.3 0 0 1 0 6.6H8','stroke="#fff" stroke-width="2.1"')}`,
  spotify: `${circle(12,12,9.5,'#1DB954')}${line('M7 9.2c3.4-1 7.2-.6 10.2 1.1','stroke="#fff" stroke-width="1.7"')}${line('M7.5 12.2c2.8-.8 6-.5 8.6 1','stroke="#fff" stroke-width="1.5"')}${line('M8 15.1c2.2-.6 4.7-.4 6.8.8','stroke="#fff" stroke-width="1.3"')}`,
  github: `<path fill="currentColor" d="M12 2.2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2.2Z"/>`,
  wifi: `${line('M3.2 8.5a13.5 13.5 0 0 1 17.6 0')}${line('M6.1 11.7a9.2 9.2 0 0 1 11.8 0')}${line('M9.1 15a4.7 4.7 0 0 1 5.8 0')}${circle(12,18.2,1.1)}`,
  'wifi-off': `${line('M3.2 8.5a13.5 13.5 0 0 1 6.2-3.1M14.6 5.4a13.5 13.5 0 0 1 6.2 3.1M6.1 11.7a9.2 9.2 0 0 1 4.2-2M13.7 9.7a9.2 9.2 0 0 1 4.2 2M9.1 15a4.7 4.7 0 0 1 5.8 0')}${circle(12,18.2,1.1)}${line('m3.5 3.5 17 17','stroke="currentColor" stroke-width="1.8"')}`,
  bluetooth: `${line('M8 7.5 16 16.3 12 20V4l4 3.7L8 16.3')}`,
  'bluetooth-off': `${line('M8 7.5 16 16.3 12 20V4l4 3.7L8 16.3')}${line('m3 3 18 18','stroke="currentColor" stroke-width="1.8"')}`,
  airplane: `${fill('M12 2.6c.9 0 1.5.8 1.5 1.7v4.9l7 4.1v2.1l-7-2.1v4l2.5 1.9v1.5L12 20l-4 1.4v-1.5l2.5-1.9v-4l-7 2.1v-2.1l7-4.1V4.3c0-.9.6-1.7 1.5-1.7Z')}`,
  battery: `${rect(2.5,7,17,10,2,'none','stroke="currentColor" stroke-width="1.5"')}${rect(20,10,1.5,4,1)}${rect(4.5,9,9,6,1)}`,
  volume: `${fill('M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z')}${line('M15 9a4.2 4.2 0 0 1 0 6M17.8 6.5a8 8 0 0 1 0 11')}`,
  'volume-mute': `${fill('M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z')}${line('m16 9 5 6M21 9l-5 6')}`,
  brightness: `${circle(12,12,3.6,'none','stroke="currentColor" stroke-width="1.7"')}${line('M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5')}`,
  nightlight: `${fill('M19.5 14.5A7.7 7.7 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z')}${fill('M17.5 4.5l.7 1.5 1.5.6-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.6.7-1.5Z')}`,
  moon: `${fill('M19.5 14.5A7.7 7.7 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z')}`,
  sun: `${circle(12,12,4.2,'#FFC83D')}${line('M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5','stroke="#FFC83D" stroke-width="1.8"')}`,
  'chevron-right': `${line('m9 5 7 7-7 7')}`,
  'chevron-left': `${line('m15 5-7 7 7 7')}`,
  'chevron-down': `${line('m5 9 7 7 7-7')}`,
  'chevron-up': `${line('m5 15 7-7 7 7')}`,
  close: `${line('m5 5 14 14M19 5 5 19','stroke="currentColor" stroke-width="1.5"')}`,
  maximize: `${rect(4.5,4.5,15,15,1,'none','stroke="currentColor" stroke-width="1.4"')}`,
  restore: `${rect(7.5,4.5,12,12,1,'none','stroke="currentColor" stroke-width="1.4"')}${line('M4.5 8.5v11h11')}`,
  minimize: `${line('M5 12h14')}`,
  pin: `${line('m8 4 8 8M14 3l7 7-4.2 1.2-4 4-1.2 4.2-7-7 4.2-1.2 4-4L14 3ZM4 20l4.4-4.4')}`,
  folder: `${fill('M3 6.1c0-1 .8-1.9 1.9-1.9h4.2l1.7 1.8H19c1.1 0 2 .9 2 2v9.9c0 1.1-.9 2-2 2H4.9c-1.1 0-2-.9-2-2V6.1Z','#e9b32b')}${fill('M3 9.4c0-1 .8-1.8 1.8-1.8h14.4c1 0 1.8.8 1.8 1.8l-1 8c-.1.7-.7 1.2-1.4 1.2H5.4c-.7 0-1.3-.5-1.4-1.2L3 9.4Z','#ffd75e')}`,
  'folder-image': `${fill('M3 6.1c0-1 .8-1.9 1.9-1.9h4.2l1.7 1.8H19c1.1 0 2 .9 2 2v9.9c0 1.1-.9 2-2 2H4.9c-1.1 0-2-.9-2-2V6.1Z','#e9b32b')}${fill('M3 9.4c0-1 .8-1.8 1.8-1.8h14.4c1 0 1.8.8 1.8 1.8l-1 8c-.1.7-.7 1.2-1.4 1.2H5.4c-.7 0-1.3-.5-1.4-1.2L3 9.4Z','#ffd75e')}${circle(9,11.8,1.2,'#2e8b57')}${fill('M5,18 9,14l3,3 2-2 4,3H5Z','#2e8b57')}`,
  'folder-music': `${fill('M3 6.1c0-1 .8-1.9 1.9-1.9h4.2l1.7 1.8H19c1.1 0 2 .9 2 2v9.9c0 1.1-.9 2-2 2H4.9c-1.1 0-2-.9-2-2V6.1Z','#e9b32b')}${fill('M3 9.4c0-1 .8-1.8 1.8-1.8h14.4c1 0 1.8.8 1.8 1.8l-1 8c-.1.7-.7 1.2-1.4 1.2H5.4c-.7 0-1.3-.5-1.4-1.2L3 9.4Z','#ffd75e')}${line('M10 11.5v4.2a2 2 0 1 1-1.4-1.9V11l4.8-1v4.5a2 2 0 1 1-1.4-1.9v-3l-2 .9Z','stroke="#5c4a00" stroke-width="1.2"')}`,
  'folder-video': `${fill('M3 6.1c0-1 .8-1.9 1.9-1.9h4.2l1.7 1.8H19c1.1 0 2 .9 2 2v9.9c0 1.1-.9 2-2 2H4.9c-1.1 0-2-.9-2-2V6.1Z','#e9b32b')}${fill('M3 9.4c0-1 .8-1.8 1.8-1.8h14.4c1 0 1.8.8 1.8 1.8l-1 8c-.1.7-.7 1.2-1.4 1.2H5.4c-.7 0-1.3-.5-1.4-1.2L3 9.4Z','#ffd75e')}${fill('m10 12 5 2.5-5 2.5v-5Z','#5c4a00')}`,
  file: `${fill('M6 2.5h8l5 5v14H6v-19Z','#f5f5f5')}${fill('M14 2.5v5h5','#d4d4d4')}${line('M8.5 12h7M8.5 15h7M8.5 18h4')}`,
  'text-file': `${fill('M6 2.5h8l5 5v14H6v-19Z','#ffffff')}${fill('M14 2.5v5h5','#d4d4d4')}${line('M8.5 11h7M8.5 14h7M8.5 17h5','stroke="#2d6fa8" stroke-width="1.3"')}`,
  'image-file': `${fill('M6 2.5h8l5 5v14H6v-19Z','#f5f5f5')}${fill('M14 2.5v5h5','#d4d4d4')}${rect(8,11,8,7,.6,'#dff0d8')}${circle(10,13,1,'#e8b400')}${fill('m8 18 3-3 2 2 1.4-1.4L17 18H8Z','#4f9a4f')}`,
  'code-file': `${fill('M6 2.5h8l5 5v14H6v-19Z','#ffffff')}${fill('M14 2.5v5h5','#d4d4d4')}${line('m10.5 12-3 3 3 3M13.5 12l3 3-3 3','stroke="#007acc" stroke-width="1.4"')}`,
  'music-file': `${fill('M6 2.5h8l5 5v14H6v-19Z','#ffffff')}${fill('M14 2.5v5h5','#d4d4d4')}${line('M10 11v5a2 2 0 1 1-1.5-1.9V11l5-1v4a2 2 0 1 1-1.5-1.9v-2.5L10 11Z','stroke="#6c3ca7" stroke-width="1.2"')}`,
  'video-file': `${fill('M6 2.5h8l5 5v14H6v-19Z','#ffffff')}${fill('M14 2.5v5h5','#d4d4d4')}${fill('m10 12 5 2.5-5 2.5v-5Z','#a44a9e')}`,
  'prob-file': `${fill('M6 2.5h8l5 5v14H6v-19Z','#ffffff')}${fill('M14 2.5v5h5','#d4d4d4')}${fill('M9 11h6v2H9zM9 14h6v5H9z','#999')}`,
  'app-file': `${rect(4,4,16,16,2,'#e8e8e8')}${rect(7,7,10,10,1,'#0078d4')}${fill('m10 10 4 2-4 2v-4Z','#fff')}`,
  'pdf-file': `${fill('M6 2.5h8l5 5v14H6v-19Z','#ffffff')}${fill('M14 2.5v5h5','#d4d4d4')}${fill('M8 11h8v2H8zM8 14h8v5H8z','#c42b1c')}${fill('M9.2 15h1v3h-1zM11.5 15h1v3h-1zM14 15h1v3h-1z','#fff')}`,
  back: `${line('m14.5 5-7 7 7 7')}`,
  forward: `${line('m9.5 5 7 7-7 7')}`,
  refresh: `${line('M20 12a8 8 0 1 1-2.3-5.7')}${line('M20 4.5V9h-4.5')}`,
  home: `${fill('M3.5 11 12 3.4 20.5 11v9.1h-6v-6h-5v6h-6V11Z')}`,
  power: `${line('M12 3v8')}${line('M7.4 5.8a8 8 0 1 0 9.2 0')}`,
  sleep: `${fill('M19.5 14.5A7.7 7.7 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z')}`,
  restart: `${line('M4 12a8 8 0 1 1 2.3 5.7')}${line('M4 19.5V15h4.5')}`,
  shutdown: `${line('M12 3v8')}${line('M7.4 5.8a8 8 0 1 0 9.2 0')}`,
  lock: `${rect(5,10,14,11,2,'none','stroke="currentColor" stroke-width="1.7"')}${line('M8 10V7.4a4 4 0 0 1 8 0V10')}${circle(12,15.3,1.2)}`,
  user: `${circle(12,8,4)}${fill('M4 21c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5H4Z')}`,
  notification: `${line('M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3v-4Z')}${line('M10 20h4')}`,
  calendar: `${rect(3,4.5,18,16.5,2,'none','stroke="currentColor" stroke-width="1.6"')}${line('M3 9h18M8 3v4M16 3v4')}${rect(7,12,3,3,.4)}${rect(14,12,3,3,.4)}`,
  clock: `${circle(12,12,8.8,'none','stroke="currentColor" stroke-width="1.7"')}${line('M12 7v5.4l3.5 2.1')}`,
  cpu: `${rect(6,6,12,12,1.5,'none','stroke="currentColor" stroke-width="1.6"')}${rect(9,9,6,6,1)}${line('M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3')}`,
  memory: `${rect(3,7,18,10,1.5,'none','stroke="currentColor" stroke-width="1.6"')}${rect(6,10,2,4,0)}${rect(10,10,2,4,0)}${rect(14,10,2,4,0)}${line('M7 17v3M12 17v3M17 17v3')}`,
  disk: `${rect(3,5,18,14,2,'none','stroke="currentColor" stroke-width="1.6"')}${circle(7.5,12,1.5)}${line('M12 12h6M12 15h6')}`,
  plus: `${line('M12 5v14M5 12h14')}`,
  minus: `${line('M5 12h14')}`,
  trash: `${line('M4 7h16M9 7V4.5h6V7M6 7l1 14h10l1-14M10 11v6M14 11v6')}`,
  eraser: `${fill('m5.5 14.8 7.8-9.9 4.6 3.6-6.2 7.9H7.2l-1.7-1.6Z','#f2a0b5')}${line('m5.5 14.8-2 4.4H13l2.9-3.6')}`,
  brush: `${line('M14 4.5 19.5 10M8.3 15.7c1.8-1.8 3.7-1.3 3.7-1.3s.5 1.9-1.3 3.7c-1.4 1.4-4 1-4 1s0-2.6 1.6-3.4Z')}`,
  'color-palette': `${fill('M12 2.5C6.8 2.5 2.5 6.3 2.5 11.4c0 3.9 2.7 6.2 5.7 6.2h1.6c1.2 0 1.8.8 1.8 1.7 0 1.1 1 1.7 2 1.7 4.5 0 7.9-3.7 7.9-8.5S17.6 2.5 12 2.5Z','#e8e8e8')}${circle(8,7.2,1.4,'#e81123')}${circle(13,6,1.4,'#ffb900')}${circle(17,9,1.4,'#0078d4')}${circle(6.4,12,1.4,'#00b294')}`,
  save: `${fill('M3.5 3.5h13.3L20.5 7v13.5h-17v-17Z','#f0f0f0')}${rect(6,3.5,9,6,0,'#a0a0a0')}${rect(7,13,10,7.5,0,'#ffffff')}`,
  'new-file': `${fill('M6 2.5h8l5 5v14H6v-19Z','#ffffff')}${fill('M14 2.5v5h5','#d4d4d4')}${line('M12 11v7M8.5 14.5h7','stroke="#0078d4" stroke-width="1.7"')}`,
  pencil: `${line('m4 20 4.3-1 10.3-10.3-3.3-3.3L5 15.7 4 20ZM14.2 4.5l3.3 3.3M5.5 15.2l3.3 3.3')}`,
  undo: `${line('M9 7 4 12l5 5')}${line('M4 12h9a6 6 0 0 1 6 6v1')}`,
  redo: `${line('m15 7 5 5-5 5')}${line('M20 12h-9a6 6 0 0 0-6 6v1')}`,
  copy: `${rect(8,8,12,12,1.5,'none','stroke="currentColor" stroke-width="1.5"')}${line('M5 16H4V4h12v1')}`,
  paste: `${rect(5,5,14,16,1.5,'none','stroke="currentColor" stroke-width="1.5"')}${rect(8,2.5,8,5,1)}`,
  cut: `${line('M6 4l12 16M18 4 6 20')}${circle(5.5,19,2)}${circle(18.5,19,2)}`,
  'grid-view': `${rect(3,3,8,8,1)}${rect(13,3,8,8,1)}${rect(3,13,8,8,1)}${rect(13,13,8,8,1)}`,
  'list-view': `${line('M4 6h16M4 12h16M4 18h16')}`,
  sort: `${line('M7 4v16M4 17l3 3 3-3M13 6h7M13 11h5M13 16h3')}`,
  check: `${line('m4 12.5 5 5L20 6.5','stroke="currentColor" stroke-width="2"')}`,
  radio: `${circle(12,12,8,'none','stroke="currentColor" stroke-width="1.5"')}${circle(12,12,4)}`,
  'toggle-on': `${rect(2,6,20,12,6,'#0078d4')}${circle(17,12,4,'#fff')}`,
  'toggle-off': `${rect(2,6,20,12,6,'#888')}${circle(7,12,4,'#fff')}`,
  slider: `${line('M3 12h18')}${circle(15,12,3.3,'#0078d4')}`,
  'up-arrow': `${line('M12 19V5M6 11l6-6 6 6')}`,
  'down-arrow': `${line('M12 5v14M6 13l6 6 6-6')}`,
  'left-arrow': `${line('M19 12H5M11 6l-6 6 6 6')}`,
  'right-arrow': `${line('M5 12h14M13 6l6 6-6 6')}`,
  info: `${circle(12,12,9,'none','stroke="currentColor" stroke-width="1.7"')}${circle(12,7.5,1.1)}${line('M12 10.5v6')}`,
  shield: `${fill('M12 2.3 20 5.5v6c0 5.2-3.3 8.6-8 10.2-4.7-1.6-8-5-8-10.2v-6L12 2.3Z','#0f6cbd')}${line('m8.5 11.8 2.5 2.5 4.7-4.7','stroke="#fff" stroke-width="1.8"')}`,
  mail: `${rect(2.5,5,19,14,1.5,'#0f6cbd')}${line('m3.5 6.5 8.5 6.7 8.5-6.7','stroke="#fff" stroke-width="1.6"')}`,
  'music-file-2': `${circle(12,12,9.5,'#1DB954')}${fill('M9.5 7.5v7.2a2.2 2.2 0 1 1-1.5-2.1V8.3l7-1.7v6.5a2.2 2.2 0 1 1-1.5-2.1V7.5l-4 .9Z','#fff')}`,
  play: `${fill('m8 5 11 7-11 7V5Z')}`,
  pause: `${rect(7,5,3.5,14,.8)}${rect(13.5,5,3.5,14,.8)}`,
  news: `${rect(3,4,14,16,1.5,'none','stroke="currentColor" stroke-width="1.5"')}${line('M6 8h7M6 12h7M6 16h4M17 8h4v10a2 2 0 0 1-2 2h-2V8Z')}`,
  stocks: `${line('M3 17l5-5 3.5 3.5L20 7')}${line('M15.5 7H20v4.5')}`,
  tips: `${fill('M9 16.5c0-2-1.5-3.8-1.5-6A4.5 4.5 0 1 1 16.5 10c0 2.3-1.5 4-1.5 6.5H9Z','#f2b01e')}${line('M9 19h6M10 21h4')}`,
  star: `${fill('m12 3 2.7 5.6 6.2.9-4.5 4.4 1.1 6.1-5.5-2.9-5.5 2.9 1.1-6.1L3.1 9.5l6.2-.9L12 3Z','#f2b01e')}`,
  download: `${line('M12 3v12M7 10l5 5 5-5M4 20h16')}`,
  accessibility: `${circle(12,4.5,1.8)}${line('M4.5 8h15M12 8v5M12 13l-4 8M12 13l4 8')}`,
  chess: `${line('M8 20h8M9 18h6M10 16h4l1-8h-6l1 8Z')}${line('M8 8c0-2 1.7-3.5 4-3.5S16 6 16 8')}`,
  weather: `${circle(12,12,4.2,'#FFC83D')}${line('M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2','stroke="#FFC83D" stroke-width="1.8"')}`,
  stickynotes: `${rect(4,3,16,18,1.5,'#f7d24a')}${fill('M14 21v-7h6L14 21Z','#e0a800')}${line('M7 8h10M7 12h7','stroke="#8a7200" stroke-width="1.3"')}`,
  maps: `${fill('M3 6.5 9 4l6 2.5L21 4v14l-6 2.5L9 18l-6 2.5v-14Z','#7fb77e')}${line('M9 4v14M15 6.5v14','stroke="#fff" stroke-width="1.2"')}${circle(12,10,2,'#d13438')}`,
  translator: `${fill('M4 4h9v9H8l-4 3V4Z','#0f6cbd')}${line('M6.7 7h4M8.7 6v4.5','stroke="#fff" stroke-width="1.1"')}${fill('M11 11h9v9h-5l-4 3v-12Z','#00a4ef')}${line('M14 14.2h3.3M15.6 13v4','stroke="#fff" stroke-width="1.1"')}`,
  whiteboard: `${rect(3,4,18,14,1.5,'#ffffff','stroke="#0078d4" stroke-width="1.5"')}${line('M7 8l3 3-3 3M12 14h5','stroke="#0078d4" stroke-width="1.5"')}${line('M7 21h10')}`,
  xbox: `${circle(12,12,9.5,'#107c10')}${line('M7 6.2c3.5 2 6.5 5 9.8 11.6M17 6.2c-3.5 2-6.5 5-9.8 11.6','stroke="#fff" stroke-width="1.3"')}`,
  'folder-open': `${fill('M3 9.4c0-1 .8-1.8 1.8-1.8h14.4c1 0 1.8.8 1.8 1.8l-1 8c-.1.7-.7 1.2-1.4 1.2H5.4c-.7 0-1.3-.5-1.4-1.2L3 9.4Z','#ffd75e')}${line('M3 9.4h18l-2 10H5L3 9.4Z')}`,
  desktop: `${rect(2.5,4,19,13,1.4,'none','stroke="currentColor" stroke-width="1.6"')}${line('M8 20.5h8M12 17v3.5')}${fill('M4.5 6h14.8v9H4.5z','#4cc2ff')}`,
  cloud: `${fill('M7 18.5a4 4 0 0 1-.4-8 5.4 5.4 0 0 1 10.2 1.1 3.5 3.5 0 0 1-.8 6.9H7Z','#4cc2ff')}`,
  'github-mark': `${fill('M12 2.2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2.2Z')}`
};

function getIcon(name, size = 16) {
  const inner = ICONS[name] || ICONS.file;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">${inner}</svg>`;
}

// ═══════════════════════════════════════
// SECTION: STATE MANAGER — persistence and virtual file system
// ═══════════════════════════════════════
const STORAGE_KEY = 'win11sim_state_v1';
const ACCENTS = [
  { value: '#0078D4', hover: '#106EBE', name: 'Windows blue' },
  { value: '#0099BC', hover: '#007A96', name: 'Teal' },
  { value: '#00B294', hover: '#008E77', name: 'Mint' },
  { value: '#498205', hover: '#3A6704', name: 'Green' },
  { value: '#8764B8', hover: '#6D4F97', name: 'Lavender' },
  { value: '#C239B3', hover: '#9E2E92', name: 'Magenta' },
  { value: '#E3008C', hover: '#B80070', name: 'Rose' },
  { value: '#CA5010', hover: '#A4410D', name: 'Orange' }
];

function makeNode(name, type, extra = {}) {
  const node = { name, type, modified: extra.modified || new Date().toISOString() };
  if (type === 'file') {
    node.content = extra.content || '';
    node.size = extra.size || new Blob([node.content]).size;
  } else {
    node.children = extra.children || [];
  }
  if (extra.children) node.children = extra.children;
  return node;
}
function defaultFS() {
  return makeNode('This PC', 'folder', {
    children: [
      makeNode('Desktop', 'folder', { children: [makeNode('Welcome.txt', 'file', { content: 'Welcome to Windows 11 Simulator!\n\nTry the Start menu, open some apps, and explore the virtual file system.\r\n', modified: '2025-06-12T09:20:00.000Z' })] }),
      makeNode('Documents', 'folder', {
        children: [
          makeNode('Work', 'folder', {
            children: [
              makeNode('Report.docx', 'file', { content: 'Quarterly report', size: 284000, modified: '2025-06-10T14:30:00.000Z' }),
              makeNode('Budget.xlsx', 'file', { content: 'Budget spreadsheet', size: 142000, modified: '2025-06-08T11:05:00.000Z' }),
              makeNode('Presentation.pptx', 'file', { content: 'Presentation slides', size: 1280000, modified: '2025-06-05T16:42:00.000Z' })
            ],
            modified: '2025-06-10T14:30:00.000Z'
          }),
          makeNode('Personal', 'folder', {
            children: [
              makeNode('Notes.txt', 'file', { content: 'Shopping list:\r\n- Coffee\r\n- Notebook\r\n- USB-C cable\r\n\r\nRemember to save your work!\r\n', modified: '2025-06-11T10:12:00.000Z' }),
              makeNode('Todo.txt', 'file', { content: '[ ] Finish the quarterly report\r\n[x] Update Windows\r\n[ ] Call Alex\r\n[ ] Book flights\r\n', modified: '2025-06-13T08:35:00.000Z' })
            ],
            modified: '2025-06-11T10:12:00.000Z'
          })
        ],
        modified: '2025-06-11T10:12:00.000Z'
      }),
      makeNode('Downloads', 'folder', {
        children: [
          makeNode('setup.exe', 'file', { content: 'installer', size: 58923000, modified: '2025-06-02T12:20:00.000Z' }),
          makeNode('photo.png', 'file', { content: 'image', size: 1840000, modified: '2025-06-09T18:10:00.000Z' }),
          makeNode('music.mp3', 'file', { content: 'audio', size: 6120000, modified: '2025-05-29T21:05:00.000Z' })
        ],
        modified: '2025-06-09T18:10:00.000Z'
      }),
      makeNode('Pictures', 'folder', {
        children: [
          makeNode('Wallpapers', 'folder', {
            children: [
              makeNode('nature.jpg', 'file', { content: 'image', size: 3120000, modified: '2025-05-22T17:43:00.000Z' }),
              makeNode('city.jpg', 'file', { content: 'image', size: 2680000, modified: '2025-05-22T17:44:00.000Z' })
            ],
            modified: '2025-05-22T17:44:00.000Z'
          }),
          makeNode('Screenshots', 'folder', {
            children: [makeNode('screenshot1.png', 'file', { content: 'image', size: 940000, modified: '2025-06-13T15:30:00.000Z' })],
            modified: '2025-06-13T15:30:00.000Z'
          })
        ],
        modified: '2025-06-13T15:30:00.000Z'
      }),
      makeNode('Music', 'folder', { children: [], modified: '2025-05-01T09:00:00.000Z' }),
      makeNode('Videos', 'folder', { children: [], modified: '2025-05-01T09:00:00.000Z' })
    ]
  });
}
function defaultState() {
  const now = Date.now();
  return {
    theme: 'light',
    deviceName: 'DESKTOP-SIM11',
    wallpaper: 0,
    accent: '#0078D4',
    iconSize: 48,
    showDesktopIcons: true,
    desktopIcons: [
      { id: 'thispc', label: 'This PC', icon: 'thispc', app: 'explorer', x: 14, y: 12 },
      { id: 'recyclebin', label: 'Recycle Bin', icon: 'recyclebin', app: 'recyclebin', x: 14, y: 100 },
      { id: 'edge', label: 'Microsoft Edge', icon: 'edge', app: 'edge', x: 14, y: 188 },
      { id: 'explorer', label: 'File Explorer', icon: 'explorer', app: 'explorer', x: 14, y: 276 },
      { id: 'vscode', label: 'Visual Studio Code', icon: 'vscode', app: 'vscode', x: 14, y: 364 },
      { id: 'notepad', label: 'Notepad', icon: 'notepad', app: 'notepad', x: 14, y: 452 }
    ],
    pinnedApps: ['edge', 'store', 'settings', 'photos', 'vscode', 'terminal', 'notepad', 'calculator', 'explorer', 'paint', 'taskmanager'],
    taskbarPinned: ['explorer', 'edge', 'store', 'settings', 'terminal', 'vscode'],
    installedApps: [],
    volume: 75,
    brightness: 100,
    nightLight: false,
    wifi: true,
    bluetooth: false,
    airplane: false,
    batterySaver: false,
    scale: 100,
    taskbar: { weather: true, search: true, taskview: true, widgets: true },
    fs: defaultFS(),
    recycleBin: [],
    notifications: [
      { id: uid('n'), app: 'Mail', title: 'Alex Morgan', message: 'Quarterly report draft is ready for review.', icon: 'mail', createdAt: now - 2 * 60000, unread: true },
      { id: uid('n'), app: 'Windows Security', title: 'You’re protected', message: 'No action needed. Your device is protected.', icon: 'shield', createdAt: now - 60 * 60000, unread: true },
      { id: uid('n'), app: 'Microsoft Store', title: 'Updates available', message: '3 app updates are ready to install.', icon: 'store', createdAt: now - 5 * 3600000, unread: true }
    ],
    notificationsRead: false,
    calcMemory: 0,
    notepad: { filename: 'Untitled', content: '' },
    showTips: true
  };
}

let state = defaultState();
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return;
    const base = defaultState();
    state = Object.assign(base, saved);
    if (!state.fs || !state.fs.children) state.fs = defaultFS();
    if (!Array.isArray(state.desktopIcons) || !state.desktopIcons.length) state.desktopIcons = base.desktopIcons;
    if (!Array.isArray(state.pinnedApps)) state.pinnedApps = base.pinnedApps;
    if (!Array.isArray(state.taskbarPinned)) state.taskbarPinned = base.taskbarPinned;
    if (!Array.isArray(state.recycleBin)) state.recycleBin = [];
    if (!Array.isArray(state.notifications)) state.notifications = base.notifications;
    state.taskbar = Object.assign(base.taskbar, state.taskbar || {});
    state.notepad = Object.assign(base.notepad, state.notepad || {});
  } catch (error) {
    console.warn('Windows simulator: saved state could not be restored.', error);
    state = defaultState();
  }
}
const persist = debounce(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Windows simulator: unable to save state.', error);
  }
}, 220);
function saveState() { persist(); }

const FS = {
  root() { return state.fs; },
  parts(path) { return String(path || '/').split('/').filter(Boolean); },
  normalize(path) {
    const parts = [];
    for (const part of this.parts(path)) {
      if (part === '.' || part === '') continue;
      if (part === '..') parts.pop();
      else parts.push(part);
    }
    return '/' + parts.join('/');
  },
  join(base, name) { return this.normalize(`${base || '/'}/${name}`); },
  get(path) {
    if (!path || path === '/') return state.fs;
    let node = state.fs;
    for (const part of this.parts(path)) {
      if (!node || node.type !== 'folder') return null;
      node = (node.children || []).find((child) => child.name === part);
    }
    return node || null;
  },
  parent(path) {
    const parts = this.parts(path);
    parts.pop();
    return '/' + parts.join('/');
  },
  getParentWithIndex(path) {
    const parentPath = this.parent(path);
    const parent = this.get(parentPath);
    if (!parent || !parent.children) return null;
    const name = this.parts(path).pop();
    const index = parent.children.findIndex((child) => child.name === name);
    return index < 0 ? null : { parent, index, node: parent.children[index], parentPath };
  },
  list(path) {
    const node = this.get(path);
    return node && node.type === 'folder' ? node.children || [] : [];
  },
  exists(path) { return !!this.get(path); },
  uniqueName(parent, base, extension = '') {
    if (!this.exists(this.join(parent, base + extension))) return base + extension;
    let n = 2;
    while (this.exists(this.join(parent, `${base} (${n})${extension}`))) n++;
    return `${base} (${n})${extension}`;
  },
  createFolder(parentPath, name) {
    const parent = this.get(parentPath);
    if (!parent || parent.type !== 'folder') throw new Error('Parent folder not found');
    const safe = String(name || 'New folder').replace(/[\\/:*?"<>|]/g, '').trim() || 'New folder';
    const finalName = this.uniqueName(parentPath, safe);
    const node = makeNode(finalName, 'folder', { children: [], modified: new Date().toISOString() });
    parent.children.push(node);
    saveState();
    return node;
  },
  createFile(parentPath, name, content = '') {
    const parent = this.get(parentPath);
    if (!parent || parent.type !== 'folder') throw new Error('Parent folder not found');
    const safe = String(name || 'New Text Document.txt').replace(/[\\/:*?"<>|]/g, '').trim() || 'New Text Document.txt';
    const finalName = this.uniqueName(parentPath, safe);
    const node = makeNode(finalName, 'file', { content, modified: new Date().toISOString() });
    parent.children.push(node);
    saveState();
    return node;
  },
  writeFile(path, content) {
    const node = this.get(path);
    if (!node || node.type !== 'file') return false;
    node.content = String(content);
    node.size = new Blob([node.content]).size;
    node.modified = new Date().toISOString();
    saveState();
    return true;
  },
  rename(path, newName) {
    const found = this.getParentWithIndex(path);
    if (!found) return false;
    const safe = String(newName || '').replace(/[\\/:*?"<>|]/g, '').trim();
    if (!safe) return false;
    if (safe !== found.node.name) {
      const finalName = this.uniqueName(found.parentPath, safe);
      found.node.name = finalName;
      found.node.modified = new Date().toISOString();
    }
    saveState();
    return true;
  },
  remove(path, recycle = true) {
    const found = this.getParentWithIndex(path);
    if (!found) return false;
    const [node] = found.parent.children.splice(found.index, 1);
    if (recycle) {
      state.recycleBin.push({
        id: uid('rb'),
        node: JSON.parse(JSON.stringify(node)),
        originalPath: found.parentPath,
        deletedAt: new Date().toISOString(),
        size: nodeSize(node)
      });
    }
    saveState();
    return true;
  },
  move(path, destinationFolder) {
    if (!path || path === '/') return false;
    const found = this.getParentWithIndex(path);
    const dest = this.get(destinationFolder);
    if (!found || !dest || dest.type !== 'folder') return false;
    if (destinationFolder === path || destinationFolder.startsWith(path + '/')) return false;
    if ((dest.children || []).some((child) => child.name === found.node.name)) {
      found.node.name = this.uniqueName(destinationFolder, found.node.name);
    }
    found.parent.children.splice(found.index, 1);
    dest.children.push(found.node);
    saveState();
    return true;
  },
  restoreRecycleItem(item) {
    const node = JSON.parse(JSON.stringify(item.node));
    const parent = this.get(item.originalPath) || this.root();
    if (parent.children.some((child) => child.name === node.name)) node.name = this.uniqueName(item.originalPath, node.name);
    parent.children.push(node);
    state.recycleBin = state.recycleBin.filter((entry) => entry.id !== item.id);
    saveState();
    return true;
  },
  emptyRecycle() {
    state.recycleBin = [];
    saveState();
  }
};

// ═══════════════════════════════════════
// SECTION: SOUND ENGINE — Web Audio API
// ═══════════════════════════════════════
const Sound = {
  ctx: null,
  master: null,
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = clamp(state.volume / 100, 0, 1) * 0.35;
      this.master.connect(this.ctx.destination);
    } catch (_) { this.ctx = null; }
  },
  setVolume(value) {
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(clamp(value / 100, 0, 1) * 0.35, this.ctx.currentTime, 0.03);
  },
  tone(freq, start, duration, type = 'sine', gainValue = 0.18) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  },
  startup() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + 0.03;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      this.tone(freq, now + index * 0.16, 1.2, 'sine', 0.12);
      this.tone(freq / 2, now + index * 0.16, 1.4, 'triangle', 0.035);
    });
  },
  notification() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + 0.01;
    this.tone(880, now, 0.3, 'sine', 0.08);
    this.tone(1174.66, now + 0.09, 0.35, 'sine', 0.06);
  },
  click() {
    this.init();
    if (!this.ctx) return;
    this.tone(1400, this.ctx.currentTime, 0.04, 'sine', 0.025);
  }
};

// ═══════════════════════════════════════
// SECTION: NOTIFICATION SYSTEM — toasts and notification center
// ═══════════════════════════════════════
function announce(message) {
  const status = $('#a11y-status');
  if (status) status.textContent = message;
}
function updateBell() {
  const dot = $('#bell-dot');
  if (!dot) return;
  dot.hidden = !state.notifications.some((item) => item.unread);
}
function renderNotificationCenter() {
  if (!state.notifications) state.notifications = [];
  const list = $('#notif-list');
  if (!list) return;
  if (!state.notifications.length) {
    list.innerHTML = '<div class="notif-empty">No new notifications</div>';
    return;
  }
  list.innerHTML = state.notifications.map((item) => `
    <article class="notif-card" data-notif-id="${esc(item.id)}">
      <div class="nc-icon">${getIcon(item.icon || 'notification', 20)}</div>
      <div class="nc-body">
        <div class="nc-meta"><span>${esc(item.app)}</span><span>${esc(timeAgo(item.createdAt))}</span></div>
        <div class="nc-title">${esc(item.title)}</div>
        <div class="nc-msg">${esc(item.message)}</div>
      </div>
      <button class="nc-close" type="button" aria-label="Dismiss notification" data-dismiss-notif="${esc(item.id)}">${getIcon('close', 10)}</button>
    </article>
  `).join('');
  $$('#notif-list [data-dismiss-notif]').forEach((button) => {
    button.addEventListener('click', () => {
      state.notifications = state.notifications.filter((item) => item.id !== button.dataset.dismissNotif);
      saveState();
      renderNotificationCenter();
      updateBell();
    });
  });
}
function addNotification(app, title, message, icon = 'notification', toast = true) {
  const item = { id: uid('n'), app, title, message, icon, createdAt: Date.now(), unread: true };
  state.notifications.unshift(item);
  if (state.notifications.length > 20) state.notifications.length = 20;
  saveState();
  updateBell();
  if (!$('#calendar-flyout').hidden) renderNotificationCenter();
  if (toast) showToast(item);
  Sound.notification();
  return item;
}
function dismissToast(toast) {
  if (!toast || toast.classList.contains('closing')) return;
  toast.classList.add('closing');
  setTimeout(() => toast.remove(), 230);
}
function showToast(item) {
  const container = $('#toast-container');
  if (!container) return;
  if (container.children.length >= 3) dismissToast(container.firstElementChild);
  const toast = h('div', 'toast');
  toast.innerHTML = `
    <div class="toast-icon">${getIcon(item.icon || 'notification', 22)}</div>
    <div class="toast-body">
      <div class="toast-meta"><span>${esc(item.app)}</span><span>now</span></div>
      <div class="toast-title">${esc(item.title)}</div>
      <div class="toast-message">${esc(item.message)}</div>
    </div>
    <button class="toast-close" type="button" aria-label="Dismiss">${getIcon('close', 10)}</button>
  `;
  $('.toast-close', toast).addEventListener('click', () => dismissToast(toast));
  container.appendChild(toast);
  const timer = setTimeout(() => dismissToast(toast), 5200);
  toast.addEventListener('mouseenter', () => clearTimeout(timer), { once: true });
  toast.addEventListener('click', (event) => {
    if (event.target.closest('.toast-close')) return;
    openCalendarFlyout();
    dismissToast(toast);
  });
}

// ═══════════════════════════════════════
// SECTION: DIALOGS — modal, prompt, confirm and properties
// ═══════════════════════════════════════
function closeModal() {
  const root = $('#modal-root');
  if (root) root.innerHTML = '';
}
function showModal({ title = 'Windows', body = '', actions = [], className = '' } = {}) {
  closeModal();
  const root = $('#modal-root');
  const overlay = h('div', 'modal-overlay');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', title);
  const modal = h('div', `modal-window ${className}`.trim());
  const header = h('div', 'modal-title');
  header.innerHTML = `<span>${esc(title)}</span><button class="modal-x" type="button" aria-label="Close">${getIcon('close', 10)}</button>`;
  const content = h('div', 'modal-content');
  if (typeof body === 'string') content.innerHTML = body;
  else content.appendChild(body);
  modal.append(header, content);
  if (actions.length) {
    const footer = h('div', 'modal-actions');
    actions.forEach((action) => {
      const button = h('button', `btn ${action.primary ? 'primary' : ''} ${action.danger ? 'danger' : ''}`.trim(), esc(action.label));
      button.type = 'button';
      if (action.id) button.id = action.id;
      button.addEventListener('click', () => {
        if (action.onClick) action.onClick();
      });
      footer.appendChild(button);
    });
    modal.appendChild(footer);
  }
  overlay.appendChild(modal);
  root.appendChild(overlay);
  const close = () => closeModal();
  $('.modal-x', header).addEventListener('click', close);
  overlay.addEventListener('pointerdown', (event) => { if (event.target === overlay) close(); });
  const firstInput = $('input, textarea, button.primary', modal);
  if (firstInput) setTimeout(() => firstInput.focus(), 30);
  return { overlay, modal, content, close };
}
function promptDialog(title, label, initial = '', okLabel = 'OK') {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => { if (settled) return; settled = true; resolve(value); };
    const body = h('div');
    body.innerHTML = `<p>${esc(label)}</p><input class="text-input" type="text" aria-label="${esc(label)}" value="${esc(initial)}">`;
    const modal = showModal({
      title,
      body,
      actions: [
        { label: 'Cancel', onClick: () => { done(null); modal.close(); } },
        { label: okLabel, primary: true, onClick: () => { done($('input', body).value); modal.close(); } }
      ]
    });
    const input = $('input', body);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); done(input.value); modal.close(); }
      if (event.key === 'Escape') { event.preventDefault(); done(null); modal.close(); }
    });
    setTimeout(() => { input.focus(); input.select(); }, 40);
  });
}
function confirmDialog(title, message, okLabel = 'OK', danger = false) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => { if (settled) return; settled = true; resolve(value); };
    const modal = showModal({
      title,
      body: `<p>${esc(message)}</p>`,
      actions: [
        { label: 'Cancel', onClick: () => { done(false); modal.close(); } },
        { label: okLabel, danger, onClick: () => { done(true); modal.close(); } }
      ]
    });
    modal.overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { done(false); modal.close(); }
    });
  });
}
function alertDialog(title, message) {
  return new Promise((resolve) => {
    const modal = showModal({
      title,
      body: `<p>${esc(message)}</p>`,
      actions: [{ label: 'OK', primary: true, onClick: () => { modal.close(); resolve(true); } }]
    });
  });
}
function showProperties(node, path) {
  if (!node) return;
  const type = fileTypeLabel(node);
  const size = node.type === 'folder' ? nodeSize(node) : node.size;
  const count = node.type === 'folder' ? (node.children || []).length : 0;
  const body = h('div');
  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div style="width:44px;height:44px">${getIcon(fileIconName(node), 44)}</div>
      <div><strong style="display:block;font-size:14px">${esc(node.name)}</strong><span style="font-size:11px;color:var(--text-secondary)">${esc(type)}</span></div>
    </div>
    <div class="spec-grid" style="padding:0">
      <div><span>Location</span>${esc(path === '/' ? 'This PC' : path)}</div>
      <div><span>Size</span>${formatBytes(size)}</div>
      <div><span>Date modified</span>${esc(formatDate(node.modified, 'datetime'))}</div>
      <div><span>${node.type === 'folder' ? 'Contains' : 'Type'}</span>${node.type === 'folder' ? `${count} items` : esc(type)}</div>
    </div>
  `;
  showModal({ title: `${node.name} Properties`, body, actions: [{ label: 'OK', primary: true, onClick: closeModal }] });
}

// ═══════════════════════════════════════
// SECTION: CONTEXT MENUS — reusable menu system with hover submenus
// ═══════════════════════════════════════
let openSubmenu = null;
let submenuTimer = null;
function closeContextMenus() {
  clearTimeout(submenuTimer);
  openSubmenu = null;
  const root = $('#context-menu-root');
  if (root) root.innerHTML = '';
}
function renderContextMenu(items) {
  const menu = h('div', 'context-menu');
  menu.setAttribute('role', 'menu');
  items.forEach((item) => {
    if (item === '-' || item.type === 'separator') {
      menu.appendChild(h('div', 'menu-separator'));
      return;
    }
    const button = h('button', `context-item ${item.disabled ? 'disabled' : ''}`.trim());
    button.type = 'button';
    button.setAttribute('role', 'menuitem');
    if (item.disabled) button.setAttribute('aria-disabled', 'true');
    let iconHtml = '';
    if (item.checked) iconHtml = `<span class="ci-icon"><span class="ci-check">${getIcon('check', 14)}</span></span>`;
    else if (item.icon) iconHtml = `<span class="ci-icon">${getIcon(item.icon, 16)}</span>`;
    else iconHtml = '<span class="ci-icon"></span>';
    button.innerHTML = `${iconHtml}<span class="ci-label">${esc(item.label)}</span>${item.shortcut ? `<span class="ci-shortcut">${esc(item.shortcut)}</span>` : ''}${item.children ? `<span class="ci-chevron">${getIcon('chevron-right', 12)}</span>` : ''}`;
    if (item.children) {
      button.addEventListener('mouseenter', () => {
        clearTimeout(submenuTimer);
        submenuTimer = setTimeout(() => openContextSubmenu(button, item.children), 100);
      });
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const submenu = openContextSubmenu(button, item.children);
        if (submenu) submenu.style.pointerEvents = 'auto';
      });
    } else {
      button.addEventListener('mouseenter', () => { if (openSubmenu && !openSubmenu.contains(button)) { closeContextMenus(); } });
      button.addEventListener('click', () => {
        if (item.disabled) return;
        closeContextMenus();
        if (item.action) item.action();
      });
    }
    menu.appendChild(button);
  });
  return menu;
}
function openContextSubmenu(parent, items) {
  if (openSubmenu) openSubmenu.remove();
  const submenu = renderContextMenu(items);
  submenu.classList.remove('context-menu');
  submenu.classList.add('context-submenu');
  $('#context-menu-root').appendChild(submenu);
  const rect = parent.getBoundingClientRect();
  const width = submenu.offsetWidth;
  const height = submenu.offsetHeight;
  let left = rect.right + 3;
  let top = rect.top - 5;
  if (left + width > window.innerWidth - 5) left = rect.left - width - 3;
  if (top + height > window.innerHeight - 5) top = window.innerHeight - height - 5;
  if (top < 5) top = 5;
  submenu.style.left = `${left}px`;
  submenu.style.top = `${top}px`;
  openSubmenu = submenu;
  submenu.addEventListener('mouseleave', () => {
    submenuTimer = setTimeout(() => {
      if (openSubmenu === submenu && !submenu.matches(':hover')) { submenu.remove(); openSubmenu = null; }
    }, 140);
  });
  return submenu;
}
function showContextMenu(items, x, y) {
  closeContextMenus();
  const menu = renderContextMenu(items);
  $('#context-menu-root').appendChild(menu);
  menu.style.left = `${Math.min(x, window.innerWidth - menu.offsetWidth - 5)}px`;
  menu.style.top = `${Math.min(y, window.innerHeight - menu.offsetHeight - 5)}px`;
}
function closeAllFlyouts(exceptId = null) {
  ['start-menu', 'quick-settings', 'calendar-flyout', 'widgets-panel', 'tray-popup'].forEach((id) => {
    if (id === exceptId) return;
    const el = document.getElementById(id);
    if (el && !el.hidden) hideFlyout(el);
  });
  $$('.start-popover').forEach((el) => el.remove());
  setStartButtonActive(false);
}
function hideFlyout(el) {
  if (!el || el.hidden) return;
  el.classList.add('closing');
  const delay = el.id === 'widgets-panel' ? 170 : 140;
  setTimeout(() => {
    el.hidden = true;
    el.classList.remove('closing');
  }, delay);
}
function showFlyout(el) {
  if (!el) return;
  if (!el.hidden) return;
  el.classList.remove('closing');
  el.hidden = false;
}
function setStartButtonActive(active) {
  const start = $('.taskbar-app[data-special="start"]');
  if (start) {
    start.classList.toggle('active', active);
    start.setAttribute('aria-expanded', String(active));
  }
}

// ═══════════════════════════════════════
// SECTION: THEME ENGINE — theme, accent, wallpaper and display effects
// ═══════════════════════════════════════
function applyTheme(theme, animate = true) {
  state.theme = theme === 'dark' ? 'dark' : 'light';
  const root = document.documentElement;
  if (animate) {
    const screen = $('#screen-root');
    if (screen) screen.classList.add('theme-anim');
    setTimeout(() => { if (screen) screen.classList.remove('theme-anim'); }, 380);
  }
  root.setAttribute('data-theme', state.theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', state.theme === 'dark' ? '#202020' : '#1a1a2e');
  saveState();
  document.dispatchEvent(new CustomEvent('sim-theme-change', { detail: { theme: state.theme } }));
}
function applyAccent(value) {
  const preset = ACCENTS.find((accent) => accent.value.toLowerCase() === String(value).toLowerCase()) || ACCENTS[0];
  state.accent = preset.value;
  document.documentElement.style.setProperty('--accent', preset.value);
  document.documentElement.style.setProperty('--accent-hover', preset.hover);
  document.documentElement.style.setProperty('--accent-soft', `${preset.value}22`);
  saveState();
  document.dispatchEvent(new CustomEvent('sim-accent-change', { detail: { accent: preset.value } }));
}
function applyWallpaper(index) {
  state.wallpaper = ((Number(index) % 5) + 5) % 5;
  document.documentElement.setAttribute('data-wallpaper', String(state.wallpaper));
  saveState();
  document.dispatchEvent(new CustomEvent('sim-wallpaper-change', { detail: { index: state.wallpaper } }));
}
function applyDisplayEffects() {
  const filters = [];
  if (state.brightness !== 100) filters.push(`brightness(${clamp(state.brightness, 30, 100) / 100})`);
  if (state.nightLight) filters.push('sepia(0.22) saturate(1.12) hue-rotate(-8deg)');
  document.documentElement.style.filter = filters.join(' ');
  const screen = $('#screen-root');
  if (screen) screen.style.zoom = state.scale && state.scale !== 100 ? String(state.scale / 100) : '';
  const battery = $('[data-tray-icon="battery"]');
  if (battery) {
    battery.title = state.batterySaver ? 'Battery 89% (battery saver on)' : 'Battery 89%';
    battery.style.color = state.batterySaver ? '#2e8b57' : '';
  }
}
function refreshTrayState() {
  const network = $('[data-tray-icon="network"]');
  if (network) {
    network.innerHTML = getIcon(state.airplane ? 'airplane' : state.wifi ? 'wifi' : 'wifi-off', 16);
    network.title = state.airplane ? 'Airplane mode' : state.wifi ? 'WiFi: Connected' : 'WiFi: Disconnected';
  }
  const volume = $('[data-tray-icon="volume"]');
  if (volume) {
    volume.innerHTML = getIcon(state.volume === 0 ? 'volume-mute' : 'volume', 16);
    volume.title = `Volume: ${state.volume}%`;
  }
  const battery = $('[data-tray-icon="battery"]');
  if (battery) battery.innerHTML = getIcon('battery', 16);
  applyDisplayEffects();
  updateBell();
}

// ═══════════════════════════════════════
// SECTION: WINDOW MANAGER — create, move, resize, snap and focus windows
// ═══════════════════════════════════════
const WM = {
  windows: new Map(),
  zCounter: 100,
  focusedId: null,
  create(appId, options = {}) {
    const id = uid('win');
    const taskbarHeight = 48;
    const maxWidth = window.innerWidth - 20;
    const maxHeight = window.innerHeight - taskbarHeight - 20;
    const width = clamp(options.width || 900, options.minWidth || 300, maxWidth);
    const height = clamp(options.height || 600, options.minHeight || 200, maxHeight);
    let left;
    let top;
    if (typeof options.x === 'number') left = options.x;
    else if (options.x === 'cascade') left = 80 + (this.windows.size % 7) * 28;
    else left = Math.round((window.innerWidth - width) / 2);
    if (typeof options.y === 'number') top = options.y;
    else if (options.y === 'cascade') top = 54 + (this.windows.size % 7) * 24;
    else top = Math.round((window.innerHeight - taskbarHeight - height) / 2 - 8);
    left = clamp(left, 8, Math.max(8, window.innerWidth - width - 8));
    top = clamp(top, 8, Math.max(8, window.innerHeight - taskbarHeight - height - 8));

    const el = h('div', 'window opening');
    el.dataset.windowId = id;
    el.dataset.appId = appId;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', options.title || 'Application');
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.innerHTML = `
      <div class="window-titlebar">
        <div class="window-title">
          <span class="wt-icon">${getIcon(options.icon || 'file', 16)}</span>
          <span class="wt-text">${esc(options.title || 'Application')}</span>
        </div>
        <div class="window-controls">
          <button class="window-control minimize" type="button" aria-label="Minimize" title="Minimize">${getIcon('minimize', 10)}</button>
          <button class="window-control maximize" type="button" aria-label="Maximize" title="Maximize">${getIcon('maximize', 10)}</button>
          <button class="window-control close" type="button" aria-label="Close" title="Close">${getIcon('close', 10)}</button>
        </div>
      </div>
      <div class="window-body"></div>
      ${options.resizable === false ? '' : ['n','ne','e','se','s','sw','w','nw'].map((dir) => `<div class="resize-handle rh-${dir}" data-dir="${dir}"></div>`).join('')}
    `;
    $('#windows-layer').appendChild(el);
    const body = $('.window-body', el);
    const maxButton = $('.window-control.maximize', el);
    if (options.maximizable === false) {
      maxButton.disabled = true;
      maxButton.setAttribute('aria-disabled', 'true');
    }
    const win = {
      id, appId, el, body,
      title: options.title || 'Application',
      icon: options.icon || 'file',
      options,
      minimized: false,
      maximized: false,
      snapped: null,
      closing: false,
      restoreRect: null,
      cleanups: [],
      onClose: null,
      cleanup(fn) { if (typeof fn === 'function') this.cleanups.push(fn); },
      setTitle(title) {
        this.title = title;
        const text = $('.wt-text', this.el);
        if (text) text.textContent = title;
        const label = this.el.setAttribute('aria-label', title);
        updateTaskbar();
        return label;
      },
      focus() { focusWindow(this); },
      minimize() { minimizeWindow(this); },
      restore() { restoreWindow(this); },
      maximize() { maximizeWindow(this); },
      toggleMaximize() { toggleMaximizeWindow(this); },
      close(silent = false) { closeWindow(this, silent); }
    };
    this.windows.set(id, win);
    this.focusedId = id;
    this.zCounter++;
    el.style.zIndex = String(this.zCounter);
    el.classList.add('active');
    setTimeout(() => el.classList.remove('opening'), 220);

    $('.window-control.minimize', el).addEventListener('click', (event) => { event.stopPropagation(); minimizeWindow(win); });
    $('.window-control.maximize', el).addEventListener('click', (event) => { event.stopPropagation(); if (options.maximizable !== false) toggleMaximizeWindow(win); });
    $('.window-control.close', el).addEventListener('click', (event) => { event.stopPropagation(); closeWindow(win); });
    el.addEventListener('pointerdown', () => focusWindow(win));
    const titlebar = $('.window-titlebar', el);
    titlebar.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('.window-control')) return;
      focusWindow(win);
      startWindowDrag(win, event);
    });
    titlebar.addEventListener('dblclick', (event) => {
      if (event.target.closest('.window-control')) return;
      if (options.maximizable !== false) toggleMaximizeWindow(win);
    });
    if (options.resizable !== false) {
      $$('.resize-handle', el).forEach((handle) => handle.addEventListener('pointerdown', (event) => startWindowResize(win, event, handle.dataset.dir)));
    }
    const delayedFocus = setTimeout(() => focusWindow(win), 220);
    win.cleanups.push(() => clearTimeout(delayedFocus));
    updateTaskbar();
    return win;
  },
  byApp(appId) { return Array.from(this.windows.values()).find((win) => win.appId === appId && !win.closing) || null; },
  focused() { return this.focusedId ? this.windows.get(this.focusedId) || null : null; },
  topVisible() {
    return Array.from(this.windows.values()).filter((w) => !w.minimized && !w.closing).sort((a, b) => Number(b.el.style.zIndex) - Number(a.el.style.zIndex))[0] || null;
  },
  closeAll(animate = false) {
    Array.from(this.windows.values()).forEach((win) => closeWindow(win, !animate));
  }
};

function focusWindow(win) {
  if (!win || win.closing) return;
  if (win.minimized) restoreWindow(win);
  WM.zCounter++;
  win.el.style.zIndex = String(WM.zCounter);
  WM.focusedId = win.id;
  WM.windows.forEach((other) => other.el.classList.toggle('active', other.id === win.id));
  updateTaskbar();
}
function focusDesktop() {
  WM.focusedId = null;
  WM.windows.forEach((win) => win.el.classList.remove('active'));
  updateTaskbar();
}
function closeWindow(win, silent = false) {
  if (!win || win.closing) return;
  win.closing = true;
  win.cleanups.forEach((fn) => { try { fn(); } catch (error) { console.warn(error); } });
  if (typeof win.onClose === 'function') { try { win.onClose(); } catch (error) { console.warn(error); } }
  if (silent) {
    win.el.remove();
    WM.windows.delete(win.id);
  } else {
    win.el.classList.add('closing');
    setTimeout(() => {
      win.el.remove();
      WM.windows.delete(win.id);
      if (WM.focusedId === win.id) {
        const next = WM.topVisible();
        WM.focusedId = next ? next.id : null;
        if (next) next.el.classList.add('active');
        updateTaskbar();
      }
    }, 160);
  }
  if (WM.focusedId === win.id) WM.focusedId = null;
  updateTaskbar();
}
function getTaskbarRect(appId) {
  const button = $(`.taskbar-app[data-app="${appId}"]`);
  return button ? button.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight - 24, width: 40, height: 40 };
}
function minimizeWindow(win) {
  if (!win || win.minimized || win.closing) return;
  const rect = win.el.getBoundingClientRect();
  const target = getTaskbarRect(win.appId);
  const dx = target.left + target.width / 2 - (rect.left + rect.width / 2);
  const dy = target.top + target.height / 2 - (rect.top + rect.height / 2);
  win.minimized = true;
  win.el.style.transition = 'transform 280ms cubic-bezier(.4,0,.8,.3), opacity 280ms ease';
  win.el.style.transform = `translate(${dx}px, ${dy}px) scale(.08)`;
  win.el.style.opacity = '0';
  win.el.classList.remove('active');
  WM.focusedId = null;
  setTimeout(() => {
    if (win.minimized) {
      win.el.style.display = 'none';
      win.el.style.transform = '';
      win.el.style.opacity = '';
      win.el.style.transition = '';
    }
  }, 290);
  updateTaskbar();
}
function restoreWindow(win, focus = true) {
  if (!win || !win.minimized) return;
  win.minimized = false;
  win.el.style.display = 'flex';
  const rect = win.el.getBoundingClientRect();
  const target = getTaskbarRect(win.appId);
  const dx = target.left + target.width / 2 - (rect.left + rect.width / 2);
  const dy = target.top + target.height / 2 - (rect.top + rect.height / 2);
  win.el.style.transition = 'none';
  win.el.style.transform = `translate(${dx}px, ${dy}px) scale(.08)`;
  win.el.style.opacity = '0';
  void win.el.offsetWidth;
  win.el.style.transition = 'transform 280ms cubic-bezier(.1,.9,.2,1), opacity 240ms ease';
  win.el.style.transform = 'none';
  win.el.style.opacity = '1';
  setTimeout(() => {
    if (!win.minimized) {
      win.el.style.transition = '';
      win.el.style.transform = '';
      win.el.style.opacity = '';
    }
  }, 300);
  if (focus) focusWindow(win);
  updateTaskbar();
}
function animateGeometry(win, target, callback) {
  const el = win.el;
  const from = el.getBoundingClientRect();
  el.style.left = `${target.left}px`;
  el.style.top = `${target.top}px`;
  el.style.width = `${target.width}px`;
  el.style.height = `${target.height}px`;
  const to = el.getBoundingClientRect();
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  const sx = from.width / Math.max(1, to.width);
  const sy = from.height / Math.max(1, to.height);
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) {
    if (callback) callback();
    return;
  }
  el.style.transformOrigin = 'top left';
  el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  el.classList.add('animating-geometry');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { el.style.transform = 'none'; });
  });
  setTimeout(() => {
    el.classList.remove('animating-geometry');
    el.style.transform = '';
    el.style.transformOrigin = '';
    if (callback) callback();
  }, 310);
}
function maximizeWindow(win) {
  if (!win || win.maximized || win.options.maximizable === false) return;
  win.restoreRect = { left: win.el.offsetLeft, top: win.el.offsetTop, width: win.el.offsetWidth, height: win.el.offsetHeight };
  win.maximized = true;
  win.snapped = null;
  win.el.classList.add('maximized');
  win.el.classList.remove('snapped');
  animateGeometry(win, { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight - 48 });
  const maxButton = $('.window-control.maximize', win.el);
  if (maxButton) {
    maxButton.innerHTML = getIcon('restore', 10);
    maxButton.setAttribute('aria-label', 'Restore');
    maxButton.title = 'Restore';
  }
  focusWindow(win);
}
function restoreWindowGeometry(win) {
  if (!win) return;
  if (win.minimized) { restoreWindow(win); return; }
  if (!win.maximized && !win.snapped) return;
  const rect = win.restoreRect || { left: 80, top: 60, width: 900, height: 600 };
  win.maximized = false;
  win.snapped = null;
  win.el.classList.remove('maximized', 'snapped');
  animateGeometry(win, {
    left: rect.left,
    top: rect.top,
    width: Math.min(rect.width, window.innerWidth - 16),
    height: Math.min(rect.height, window.innerHeight - 96)
  });
  const maxButton = $('.window-control.maximize', win.el);
  if (maxButton && win.options.maximizable !== false) {
    maxButton.innerHTML = getIcon('maximize', 10);
    maxButton.setAttribute('aria-label', 'Maximize');
    maxButton.title = 'Maximize';
  }
  focusWindow(win);
}
function toggleMaximizeWindow(win) {
  if (win.maximized || win.snapped) restoreWindowGeometry(win);
  else maximizeWindow(win);
}
function snapWindow(win, mode) {
  if (!win || win.options.maximizable === false) return;
  const viewH = window.innerHeight - 48;
  if (!win.maximized && !win.snapped) {
    win.restoreRect = { left: win.el.offsetLeft, top: win.el.offsetTop, width: win.el.offsetWidth, height: win.el.offsetHeight };
  }
  const rects = {
    left: { left: 0, top: 0, width: Math.floor(window.innerWidth / 2), height: viewH },
    right: { left: Math.ceil(window.innerWidth / 2), top: 0, width: Math.floor(window.innerWidth / 2), height: viewH },
    max: { left: 0, top: 0, width: window.innerWidth, height: viewH }
  };
  const target = rects[mode] || rects.max;
  if (mode === 'max') {
    win.maximized = true;
    win.snapped = null;
    win.el.classList.add('maximized');
  } else {
    win.maximized = false;
    win.snapped = mode;
    win.el.classList.remove('maximized');
  }
  win.el.classList.add('snapped');
  animateGeometry(win, target);
  const maxButton = $('.window-control.maximize', win.el);
  if (maxButton) {
    maxButton.innerHTML = getIcon(win.maximized ? 'restore' : 'maximize', 10);
    maxButton.setAttribute('aria-label', win.maximized ? 'Restore' : 'Maximize');
  }
  focusWindow(win);
}
function startWindowDrag(win, event) {
  if (win.closing) return;
  event.preventDefault();
  if (win.maximized || win.snapped) {
    const wasMax = win.maximized;
    const ratio = event.clientX / window.innerWidth;
    const oldWidth = win.restoreRect ? win.restoreRect.width : Math.round(window.innerWidth * 0.65);
    const oldHeight = win.restoreRect ? win.restoreRect.height : Math.round((window.innerHeight - 48) * 0.7);
    win.maximized = false;
    win.snapped = null;
    win.el.classList.remove('maximized', 'snapped');
    win.el.style.width = `${oldWidth}px`;
    win.el.style.height = `${oldHeight}px`;
    win.el.style.left = `${clamp(event.clientX - oldWidth * ratio, 8, window.innerWidth - oldWidth - 8)}px`;
    win.el.style.top = `${8}px`;
    if (wasMax) {
      const maxButton = $('.window-control.maximize', win.el);
      if (maxButton) maxButton.innerHTML = getIcon('maximize', 10);
    }
  }
  const startX = event.clientX;
  const startY = event.clientY;
  const startLeft = win.el.offsetLeft;
  const startTop = win.el.offsetTop;
  const width = win.el.offsetWidth;
  const height = win.el.offsetHeight;
  const preview = $('#snap-preview');
  let snapMode = null;
  let moved = false;
  const move = rafThrottle((clientX, clientY) => {
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (!moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    moved = true;
    win.el.style.left = `${clamp(startLeft + dx, -width + 120, window.innerWidth - 120)}px`;
    win.el.style.top = `${clamp(startTop + dy, 8, window.innerHeight - 48 - 32)}px`;
    snapMode = null;
    if (clientY <= 5) snapMode = 'max';
    else if (clientX <= 12) snapMode = 'left';
    else if (clientX >= window.innerWidth - 12) snapMode = 'right';
    if (snapMode) {
      const viewH = window.innerHeight - 48;
      const rect = snapMode === 'left' ? { left: 0, top: 0, width: Math.floor(window.innerWidth / 2), height: viewH } : snapMode === 'right' ? { left: Math.ceil(window.innerWidth / 2), top: 0, width: Math.floor(window.innerWidth / 2), height: viewH } : { left: 0, top: 0, width: window.innerWidth, height: viewH };
      preview.style.left = `${rect.left}px`;
      preview.style.top = `${rect.top}px`;
      preview.style.width = `${rect.width}px`;
      preview.style.height = `${rect.height}px`;
      preview.classList.add('visible');
    } else {
      preview.classList.remove('visible');
    }
  });
  const up = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', up);
    preview.classList.remove('visible');
    if (snapMode && moved) snapWindow(win, snapMode);
    else if (moved) saveState();
  };
  const onMove = (e) => move(e.clientX, e.clientY);
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', up, { once: true });
}
function startWindowResize(win, event, direction) {
  if (win.maximized || win.snapped) return;
  event.preventDefault();
  event.stopPropagation();
  focusWindow(win);
  const startX = event.clientX;
  const startY = event.clientY;
  const startLeft = win.el.offsetLeft;
  const startTop = win.el.offsetTop;
  const startWidth = win.el.offsetWidth;
  const startHeight = win.el.offsetHeight;
  const minWidth = win.options.minWidth || 300;
  const minHeight = win.options.minHeight || 180;
  const viewW = window.innerWidth;
  const viewH = window.innerHeight - 48;
  const move = rafThrottle((clientX, clientY) => {
    const dx = clientX - startX;
    const dy = clientY - startY;
    let left = startLeft;
    let top = startTop;
    let width = startWidth;
    let height = startHeight;
    if (direction.includes('e')) width = clamp(startWidth + dx, minWidth, viewW - startLeft);
    if (direction.includes('s')) height = clamp(startHeight + dy, minHeight, viewH - startTop);
    if (direction.includes('w')) {
      width = clamp(startWidth - dx, minWidth, startLeft + startWidth);
      left = startLeft + startWidth - width;
    }
    if (direction.includes('n')) {
      height = clamp(startHeight - dy, minHeight, startTop + startHeight);
      top = startTop + startHeight - height;
      top = Math.max(0, top);
    }
    win.el.style.left = `${left}px`;
    win.el.style.top = `${top}px`;
    win.el.style.width = `${width}px`;
    win.el.style.height = `${height}px`;
  });
  const onMove = (e) => move(e.clientX, e.clientY);
  const up = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', up);
    saveState();
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', up, { once: true });
}

// ═══════════════════════════════════════
// SECTION: DESKTOP — wallpaper icons, selection, drag & context menu
// ═══════════════════════════════════════
let selectedDesktopIcons = new Set();
function renderDesktop() {
  const container = $('#desktop-icons');
  if (!container) return;
  container.innerHTML = '';
  const iconSize = state.iconSize || 48;
  document.documentElement.style.setProperty('--icon-size', `${iconSize}px`);
  if (!state.showDesktopIcons) return;
  state.desktopIcons.forEach((icon, index) => {
    const el = h('div', 'desktop-icon' + (selectedDesktopIcons.has(icon.id) ? ' selected' : ''));
    el.dataset.iconId = icon.id;
    el.style.left = `${icon.x}px`;
    el.style.top = `${icon.y}px`;
    el.setAttribute('role', 'listitem');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `${icon.label} icon`);
    const iconName = icon.id === 'recyclebin' ? (state.recycleBin.length ? 'recyclebin-full' : 'recyclebin') : icon.icon;
    el.innerHTML = `<div class="di-icon">${getIcon(iconName, iconSize)}</div><div class="di-label">${esc(icon.label)}</div>`;
    container.appendChild(el);
    attachDesktopIconEvents(el, icon, index);
  });
}
function selectDesktopIcon(iconId, additive = false) {
  if (!additive) selectedDesktopIcons.clear();
  if (selectedDesktopIcons.has(iconId)) selectedDesktopIcons.delete(iconId);
  else selectedDesktopIcons.add(iconId);
  updateDesktopSelection();
}
function updateDesktopSelection() {
  $$('.desktop-icon').forEach((el) => el.classList.toggle('selected', selectedDesktopIcons.has(el.dataset.iconId)));
}
function attachDesktopIconEvents(el, icon, index) {
  el.addEventListener('pointerdown', (event) => {
    if (event.button === 2) return;
    event.stopPropagation();
    if (event.ctrlKey) {
      selectDesktopIcon(icon.id, true);
    } else if (!selectedDesktopIcons.has(icon.id)) {
      selectedDesktopIcons.clear();
      selectedDesktopIcons.add(icon.id);
      updateDesktopSelection();
    }
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = icon.x;
    const startTop = icon.y;
    let moved = false;
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      moved = true;
      el.classList.add('dragging');
      const left = clamp(startLeft + dx, 0, window.innerWidth - 82);
      const top = clamp(startTop + dy, 2, window.innerHeight - 48 - 84);
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      if (!moved) return;
      el.classList.remove('dragging');
      const gridX = Math.round(parseFloat(el.style.left) / 80) * 80 + 14;
      const gridY = Math.round(parseFloat(el.style.top) / 80) * 80 + 12;
      icon.x = clamp(gridX, 0, window.innerWidth - 80);
      icon.y = clamp(gridY, 2, window.innerHeight - 48 - 84);
      el.style.left = `${icon.x}px`;
      el.style.top = `${icon.y}px`;
      saveState();
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
  });
  el.addEventListener('dblclick', (event) => {
    event.stopPropagation();
    if (icon.app === 'explorer') openApp('explorer', { path: '/' });
    else if (icon.app) openApp(icon.app);
  });
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (icon.app === 'explorer') openApp('explorer', { path: '/' });
      else if (icon.app) openApp(icon.app);
    }
    if (event.key === 'Delete') {
      event.preventDefault();
      deleteDesktopIcon(icon.id);
    }
  });
  el.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    event.stopPropagation();
    selectedDesktopIcons.clear();
    selectedDesktopIcons.add(icon.id);
    updateDesktopSelection();
    showContextMenu([
      { label: 'Open', icon: icon.icon, action: () => icon.app === 'explorer' ? openApp('explorer', { path: '/' }) : openApp(icon.app) },
      '-',
      { label: 'Pin to Start', icon: 'pin', action: () => { addPinnedApp(icon.app); addNotification('Start', 'Pinned to Start', `${icon.label} was pinned to Start`, icon.icon); } },
      { label: 'Pin to taskbar', icon: 'pin', action: () => { addTaskbarPinned(icon.app); addNotification('Taskbar', 'Pinned to taskbar', `${icon.label} is now pinned`, icon.icon); } },
      '-',
      { label: 'Delete', icon: 'trash', action: () => deleteDesktopIcon(icon.id) },
      { label: 'Properties', icon: 'info', action: () => showProperties({ name: icon.label, type: 'file', size: 2048, modified: new Date().toISOString(), content: '' }, '/Desktop') }
    ], event.clientX, event.clientY);
  });
}
function deleteDesktopIcon(id) {
  const icon = state.desktopIcons.find((item) => item.id === id);
  if (!icon) return;
  state.desktopIcons = state.desktopIcons.filter((item) => item.id !== id);
  state.recycleBin.push({ id: uid('rb'), node: { name: `${icon.label}.lnk`, type: 'file', content: '', size: 2048, modified: new Date().toISOString() }, originalPath: '/Desktop', deletedAt: new Date().toISOString(), size: 2048 });
  selectedDesktopIcons.delete(id);
  saveState();
  renderDesktop();
  addNotification('Recycle Bin', 'Moved to Recycle Bin', `${icon.label} was moved to the Recycle Bin`, 'recyclebin');
}
function desktopContextMenu(event) {
  closeAllFlyouts();
  const viewChildren = [
    { label: 'Large icons', checked: state.iconSize === 48, action: () => { state.iconSize = 48; saveState(); renderDesktop(); } },
    { label: 'Medium icons', checked: state.iconSize === 40, action: () => { state.iconSize = 40; saveState(); renderDesktop(); } },
    { label: 'Small icons', checked: state.iconSize === 32, action: () => { state.iconSize = 32; saveState(); renderDesktop(); } },
    '-',
    { label: 'Show desktop icons', checked: state.showDesktopIcons, action: () => { state.showDesktopIcons = !state.showDesktopIcons; saveState(); renderDesktop(); } }
  ];
  const sortChildren = [
    { label: 'Name', action: () => sortDesktopIcons('name') },
    { label: 'Size', action: () => sortDesktopIcons('size') },
    { label: 'Date modified', action: () => sortDesktopIcons('modified') },
    { label: 'Type', action: () => sortDesktopIcons('type') }
  ];
  showContextMenu([
    { label: 'View', icon: 'grid-view', children: viewChildren },
    { label: 'Sort by', icon: 'sort', children: sortChildren },
    { label: 'Refresh', icon: 'refresh', action: () => { $$('.desktop-icon').forEach((el) => { el.classList.remove('refreshing'); void el.offsetWidth; el.classList.add('refreshing'); }); } },
    '-',
    { label: 'Paste', icon: 'paste', shortcut: 'Ctrl+V', disabled: true },
    { label: 'Paste shortcut', icon: 'paste', disabled: true },
    '-',
    { label: 'Next desktop background', icon: 'image-file', action: () => applyWallpaper(state.wallpaper + 1) },
    '-',
    { label: 'Display settings', icon: 'thispc', action: () => openApp('settings', { page: 'display' }) },
    { label: 'Personalize', icon: 'paint', action: () => openApp('settings', { page: 'personalization' }) },
    '-',
    { label: 'Open in Terminal', icon: 'terminal', action: () => openApp('terminal') }
  ], event.clientX, event.clientY);
}
function sortDesktopIcons(mode) {
  const sorted = [...state.desktopIcons].sort((a, b) => {
    if (mode === 'name') return a.label.localeCompare(b.label);
    if (mode === 'type') return a.app.localeCompare(b.app);
    if (mode === 'size') return (a.label.length - b.label.length);
    return 0;
  });
  sorted.forEach((icon, index) => {
    icon.x = 14;
    icon.y = 12 + index * 80;
  });
  state.desktopIcons = sorted;
  saveState();
  renderDesktop();
}
function initDesktop() {
  const desktop = $('#desktop');
  desktop.addEventListener('pointerdown', (event) => {
    if (event.button === 2) return;
    if (event.target.closest('.desktop-icon')) return;
    closeAllFlyouts();
    closeContextMenus();
    focusDesktop();
    if (!event.ctrlKey) {
      selectedDesktopIcons.clear();
      updateDesktopSelection();
    }
    const startX = event.clientX;
    const startY = event.clientY;
    const box = $('#selection-box');
    let selecting = false;
    const move = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (!selecting && Math.abs(dx) + Math.abs(dy) < 4) return;
      selecting = true;
      box.hidden = false;
      box.style.left = `${Math.min(startX, moveEvent.clientX)}px`;
      box.style.top = `${Math.min(startY, moveEvent.clientY)}px`;
      box.style.width = `${Math.abs(dx)}px`;
      box.style.height = `${Math.abs(dy)}px`;
      const selectionRect = box.getBoundingClientRect();
      if (!event.ctrlKey) selectedDesktopIcons.clear();
      $$('.desktop-icon').forEach((iconEl) => {
        const rect = iconEl.getBoundingClientRect();
        if (rect.left < selectionRect.right && rect.right > selectionRect.left && rect.top < selectionRect.bottom && rect.bottom > selectionRect.top) {
          selectedDesktopIcons.add(iconEl.dataset.iconId);
        }
      });
      updateDesktopSelection();
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      box.hidden = true;
      box.style.width = box.style.height = '0px';
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  });
  desktop.addEventListener('contextmenu', (event) => {
    if (event.target.closest('.desktop-icon')) return;
    event.preventDefault();
    desktopContextMenu(event);
  });
  renderDesktop();
}

// ═══════════════════════════════════════
// SECTION: TASKBAR — app buttons, system tray, clock and previews
// ═══════════════════════════════════════
let previewTimer = null;
let taskbarPreviewEl = null;
let showDesktopState = false;
const SPECIAL_TASKBAR = [
  { id: 'start', icon: 'start', title: 'Start', aria: 'Start' },
  { id: 'search', icon: 'search', title: 'Search', aria: 'Search' },
  { id: 'taskview', icon: 'taskview', title: 'Task View', aria: 'Task View' },
  { id: 'widgets', icon: 'widgets', title: 'Widgets', aria: 'Widgets' }
];
function taskbarHtml() {
  const specials = SPECIAL_TASKBAR.filter((item) => {
    if (item.id === 'search') return state.taskbar.search;
    if (item.id === 'taskview') return state.taskbar.taskview;
    if (item.id === 'widgets') return state.taskbar.widgets;
    return true;
  });
  const running = Array.from(WM.windows.values()).map((win) => win.appId);
  const pinned = state.taskbarPinned.filter((id, index, arr) => arr.indexOf(id) === index);
  const extra = running.filter((id, index, arr) => !pinned.includes(id) && arr.indexOf(id) === index);
  const appButtons = [...pinned, ...extra].map((appId) => {
    const def = APPS[appId];
    if (!def) return '';
    const wins = Array.from(WM.windows.values()).filter((win) => win.appId === appId && !win.closing);
    const isRunning = wins.length > 0;
    const isFocused = wins.some((win) => win.id === WM.focusedId);
    return `<button class="taskbar-app ${isRunning ? 'running' : ''} ${isFocused ? 'focused' : ''}" type="button" data-app="${esc(appId)}" aria-label="${esc(def.title)}${isRunning ? ', running' : ''}" title="${esc(def.title)}">
      <span class="tb-icon">${getIcon(def.icon, 24)}</span>
      ${isRunning ? `<span class="taskbar-pills">${wins.map(() => '<i class="taskbar-pill"></i>').join('')}</span>` : ''}
    </button>`;
  }).join('');
  return `${specials.map((item, index) => `<button class="taskbar-app ${index === specials.length - 1 ? 'special-separator' : ''}" type="button" data-special="${item.id}" aria-label="${esc(item.aria)}" title="${esc(item.title)}" aria-expanded="false"><span class="tb-icon">${getIcon(item.icon, 24)}</span></button>`).join('')}${appButtons}`;
}
function renderTaskbar() {
  const center = $('#taskbar-center');
  if (!center) return;
  center.innerHTML = taskbarHtml();
  setStartButtonActive(!$('#start-menu').hidden);
  const weather = $('#weather-btn');
  if (weather) weather.hidden = !state.taskbar.weather;
}
function updateTaskbar() {
  const center = $('#taskbar-center');
  if (!center) return;
  center.innerHTML = taskbarHtml();
  setStartButtonActive(!$('#start-menu').hidden);
}
function addTaskbarPinned(appId) {
  if (!appId || !APPS[appId]) return;
  if (!state.taskbarPinned.includes(appId)) {
    state.taskbarPinned.push(appId);
    saveState();
    updateTaskbar();
  }
}
function removeTaskbarPinned(appId) {
  state.taskbarPinned = state.taskbarPinned.filter((id) => id !== appId);
  saveState();
  updateTaskbar();
}
function addPinnedApp(appId) {
  if (!appId) return;
  if (!state.pinnedApps.includes(appId)) {
    state.pinnedApps.push(appId);
    saveState();
  }
}
function removePinnedApp(appId) {
  state.pinnedApps = state.pinnedApps.filter((id) => id !== appId);
  saveState();
}
function updateClock() {
  const now = new Date();
  const timeShort = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateShort = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  const dateLong = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const clockTime = $('#clock-time');
  const clockDate = $('#clock-date');
  if (clockTime) clockTime.textContent = timeShort;
  if (clockDate) clockDate.textContent = dateShort;
  const lockTime = $('#lock-time');
  const lockDate = $('#lock-date');
  if (lockTime) lockTime.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (lockDate) lockDate.textContent = dateLong;
  const sleepTime = $('#sleep-time');
  if (sleepTime) sleepTime.textContent = timeShort;
  const trayClock = $('#tray-clock');
  if (trayClock) trayClock.setAttribute('aria-label', `${timeShort}, ${dateLong}. Open calendar and notifications`);
}
function initTaskbar() {
  const center = $('#taskbar-center');
  center.addEventListener('click', (event) => {
    const button = event.target.closest('.taskbar-app');
    if (!button) return;
    Sound.click();
    const special = button.dataset.special;
    if (special) {
      if (special === 'start') toggleStartMenu();
      else if (special === 'search') { openStartMenu('search'); }
      else if (special === 'taskview') toggleTaskView();
      else if (special === 'widgets') toggleWidgets();
      return;
    }
    const appId = button.dataset.app;
    if (!appId) return;
    const wins = Array.from(WM.windows.values()).filter((win) => win.appId === appId && !win.closing);
    if (!wins.length) {
      openApp(appId);
      return;
    }
    if (wins.length === 1) {
      const win = wins[0];
      if (win.minimized) restoreWindow(win);
      else if (win.id === WM.focusedId && !win.closing) minimizeWindow(win);
      else focusWindow(win);
    } else {
      const visible = wins.find((win) => !win.minimized);
      if (visible && visible.id === WM.focusedId) minimizeWindow(visible);
      else if (visible) focusWindow(visible);
      else { restoreWindow(wins[wins.length - 1]); }
    }
  });
  center.addEventListener('pointerover', (event) => {
    const button = event.target.closest('.taskbar-app[data-app]');
    if (!button) return;
    const appId = button.dataset.app;
    const wins = Array.from(WM.windows.values()).filter((win) => win.appId === appId && !win.closing);
    if (!wins.length) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => showTaskbarPreview(button, wins), 360);
  });
  center.addEventListener('pointerout', (event) => {
    const button = event.target.closest('.taskbar-app[data-app]');
    if (!button) return;
    clearTimeout(previewTimer);
    setTimeout(() => {
      if (!button.matches(':hover') && taskbarPreviewEl) hideTaskbarPreview();
    }, 150);
  });
  center.addEventListener('contextmenu', (event) => {
    const button = event.target.closest('.taskbar-app[data-app]');
    if (!button) return;
    event.preventDefault();
    const appId = button.dataset.app;
    const def = APPS[appId];
    if (!def) return;
    showContextMenu([
      { label: def.title, icon: def.icon, disabled: true },
      '-',
      { label: 'Open new window', icon: 'plus', action: () => openApp(appId, { forceNew: true }) },
      { label: 'Unpin from taskbar', icon: 'pin', action: () => removeTaskbarPinned(appId) },
      '-',
      { label: 'Close window', icon: 'close', disabled: !WM.byApp(appId), action: () => { const win = WM.byApp(appId); if (win) closeWindow(win); } }
    ], event.clientX, event.clientY);
  });
  $('#weather-btn').addEventListener('click', toggleWidgets);
  $('#tray-system').addEventListener('click', toggleQuickSettings);
  $('#tray-clock').addEventListener('click', toggleCalendarFlyout);
  $('#tray-bell').addEventListener('click', toggleCalendarFlyout);
  $('#show-desktop-strip').addEventListener('click', toggleShowDesktop);
  $('#tray-overflow').addEventListener('click', (event) => {
    event.stopPropagation();
    const popup = $('#tray-popup');
    closeAllFlyouts('tray-popup');
    if (!popup.hidden) { hideFlyout(popup); return; }
    popup.innerHTML = `
      <button class="tray-popup-item" type="button" data-tray-action="OneDrive">${getIcon('cloud', 17)}<span>OneDrive</span></button>
      <button class="tray-popup-item" type="button" data-tray-action="Defender">${getIcon('shield', 17)}<span>Windows Security</span></button>
      <button class="tray-popup-item" type="button" data-tray-action="Realtek">${getIcon('volume', 17)}<span>Realtek Audio</span></button>
      <button class="tray-popup-item" type="button" data-tray-action="Safely Remove">${getIcon('disk', 17)}<span>Safely remove hardware</span></button>
    `;
    popup.hidden = false;
    $$('[data-tray-action]', popup).forEach((button) => button.addEventListener('click', () => {
      hideFlyout(popup);
      addNotification(button.dataset.trayAction, 'System tray', `${button.dataset.trayAction} is working normally.`, 'info');
    }));
  });
  updateClock();
  setInterval(updateClock, 1000);
  renderTaskbar();
  refreshTrayState();
}
function showTaskbarPreview(button, wins) {
  hideTaskbarPreview();
  const win = wins[0];
  const rect = button.getBoundingClientRect();
  const preview = h('div', 'taskbar-preview');
  const source = win.el;
  const clone = source.cloneNode(true);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  clone.classList.remove('active', 'opening', 'closing', 'minimizing');
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.width = `${source.offsetWidth}px`;
  clone.style.height = `${source.offsetHeight}px`;
  clone.style.transform = 'none';
  clone.style.opacity = '1';
  clone.style.display = 'flex';
  clone.style.pointerEvents = 'none';
  clone.querySelectorAll('.resize-handle').forEach((node) => node.remove());
  const scale = Math.min(196 / Math.max(1, source.offsetWidth), 105 / Math.max(1, source.offsetHeight));
  const scaled = h('div', 'tp-scaled');
  scaled.style.transform = `scale(${scale})`;
  scaled.appendChild(clone);
  const frame = h('div', 'tp-frame');
  frame.appendChild(scaled);
  preview.innerHTML = `<div class="tp-title">${getIcon(win.icon, 13)}<span>${esc(win.title)}</span></div>`;
  preview.appendChild(frame);
  if (wins.length > 1) preview.appendChild(h('div', 'tp-more', `${wins.length} windows`));
  document.body.appendChild(preview);
  const top = rect.top - preview.offsetHeight - 9;
  preview.style.left = `${clamp(rect.left + rect.width / 2 - preview.offsetWidth / 2, 6, window.innerWidth - preview.offsetWidth - 6)}px`;
  preview.style.top = `${Math.max(6, top)}px`;
  taskbarPreviewEl = preview;
  preview.addEventListener('pointerenter', () => clearTimeout(previewTimer));
  preview.addEventListener('pointerleave', hideTaskbarPreview);
}
function hideTaskbarPreview() {
  if (taskbarPreviewEl) { taskbarPreviewEl.remove(); taskbarPreviewEl = null; }
}
function toggleShowDesktop() {
  const wins = Array.from(WM.windows.values()).filter((win) => !win.closing);
  if (!wins.length) return;
  showDesktopState = !showDesktopState;
  if (showDesktopState) {
    wins.forEach((win) => minimizeWindow(win));
  } else {
    wins.forEach((win) => { if (win.minimized) restoreWindow(win, false); });
  }
}

// ═══════════════════════════════════════
// SECTION: BOOT SEQUENCE — boot, lock, login, sleep and shutdown
// ═══════════════════════════════════════
const Boot = {
  phase: 'boot',
  bootTimer: null,
  lockArmed: false,
  firstSignIn: true
};
function setPhase(phase) {
  Boot.phase = phase;
}
function startBoot(fromRestart = false) {
  setPhase('boot');
  hideAllSystemOverlays();
  WM.closeAll(false);
  closeAllFlyouts();
  closeContextMenus();
  $('#boot-screen').hidden = false;
  $('#boot-screen').style.display = 'grid';
  $('#boot-screen').classList.remove('screen-fade');
  void $('#boot-screen').offsetWidth;
  clearTimeout(Boot.bootTimer);
  Boot.bootTimer = setTimeout(() => {
    $('#boot-screen').hidden = true;
    showLockScreen();
  }, fromRestart ? 2600 : 3000);
}
function hideAllSystemOverlays() {
  ['lock-screen', 'login-screen', 'sleep-overlay', 'shutdown-screen', 'bsod', 'run-dialog', 'clippy'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
  });
  const loginWelcome = $('#login-welcome');
  if (loginWelcome) loginWelcome.hidden = true;
}
function showLockScreen(returning = false) {
  setPhase('lock');
  $('#login-screen').hidden = true;
  $('#sleep-overlay').hidden = true;
  $('#shutdown-screen').hidden = true;
  const lock = $('#lock-screen');
  lock.hidden = false;
  lock.classList.remove('slide-up');
  updateClock();
  Boot.lockArmed = true;
  $('#pin-input').value = '';
  setTimeout(() => {
    if (returning) $('#login-form').classList.add('returning');
  }, 20);
}
function dismissLock() {
  if (!Boot.lockArmed || Boot.phase !== 'lock') return;
  Boot.lockArmed = false;
  const lock = $('#lock-screen');
  lock.classList.add('slide-up');
  setTimeout(() => {
    lock.hidden = true;
    lock.classList.remove('slide-up');
    $('#login-screen').hidden = false;
    setTimeout(() => $('#pin-input').focus(), 80);
  }, 480);
  setPhase('login');
}
function signIn() {
  const pin = $('#pin-input').value;
  if (!pin.trim() && Boot.firstSignIn) {
    const input = $('#pin-input');
    input.style.borderColor = '#ff6b6b';
    input.placeholder = 'Enter any PIN';
    setTimeout(() => { input.style.borderColor = ''; input.placeholder = 'Enter PIN'; }, 1300);
    return;
  }
  const welcome = $('#login-welcome');
  welcome.hidden = false;
  Sound.startup();
  setTimeout(() => {
    $('#login-screen').hidden = true;
    welcome.hidden = true;
    setPhase('desktop');
    const desktop = document.querySelector('#desktop');
    $('#screen-root').classList.add('screen-fade');
    setTimeout(() => $('#screen-root').classList.remove('screen-fade'), 450);
    if (Boot.firstSignIn) {
      Boot.firstSignIn = false;
      setTimeout(() => addNotification('Windows', 'Welcome back, User', 'Your Windows 11 simulator is ready.', 'start'), 600);
    }
    if (state.showTips) {
      setTimeout(() => {
        if (Boot.phase === 'desktop') {
          addNotification('Tips', 'Did you know?', 'Try pressing Win+D to show the desktop!', 'tips');
          state.showTips = false;
          saveState();
        }
      }, 60000);
    }
    announce('Signed in. Desktop ready.');
  }, 800);
}
function lockNow() {
  closeAllFlyouts();
  closeContextMenus();
  showLockScreen(true);
}
function sleepSystem() {
  closeAllFlyouts();
  closeContextMenus();
  setPhase('sleep');
  $('#sleep-time').textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  $('#sleep-overlay').hidden = false;
}
function wakeSystem() {
  if (Boot.phase !== 'sleep') return;
  $('#sleep-overlay').hidden = true;
  showLockScreen(true);
}
function shutDown() {
  closeAllFlyouts();
  closeContextMenus();
  setPhase('shutdown');
  $('#shutdown-screen').hidden = false;
}
function restartSimulation() {
  $('#shutdown-screen').hidden = true;
  $('#bsod').hidden = true;
  Boot.firstSignIn = false;
  startBoot(true);
}
function showBSOD() {
  closeAllFlyouts();
  closeContextMenus();
  const overlay = $('#bsod');
  overlay.hidden = false;
  const qr = $('#bsod-qr');
  qr.innerHTML = '';
  for (let i = 0; i < 121; i++) {
    const cell = document.createElement('i');
    if ((i * 7 + 3) % 11 < 5 || i % 13 === 0 || i < 22 || i > 98) cell.className = Math.random() > 0.35 ? 'on' : '';
    else cell.className = Math.random() > 0.68 ? 'on' : '';
    qr.appendChild(cell);
  }
  let percent = 0;
  $('#bsod-percent').textContent = '0';
  setPhase('bsod');
  const timer = setInterval(() => {
    percent = Math.min(100, percent + 1);
    $('#bsod-percent').textContent = String(percent);
    if (percent >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        $('#bsod').hidden = true;
        restartSimulation();
      }, 500);
    }
  }, 100);
  announce('A simulated blue screen has occurred. Your PC will restart.');
}

// ═══════════════════════════════════════
// SECTION: START MENU — pinned apps, search, all apps and power
// ═══════════════════════════════════════
const APPS = {};
function isAppAvailable(appId) {
  const def = APPS[appId];
  if (!def) return false;
  return !def.storeOnly || state.installedApps.includes(appId);
}
let startView = 'pinned';
let startQuery = '';
const RECOMMENDED_ITEMS = [
  { name: 'Report.docx', meta: 'Yesterday', icon: 'word' },
  { name: 'Budget.xlsx', meta: 'Tuesday', icon: 'excel' },
  { name: 'Photo_001.png', meta: 'Last week', icon: 'image-file' },
  { name: 'Notes.txt', meta: 'Last week', icon: 'text-file' },
  { name: 'Project.js', meta: '2 weeks ago', icon: 'code-file' },
  { name: 'Downloads', meta: '3 weeks ago', icon: 'folder' }
];
function startAppButton(appId) {
  const def = APPS[appId];
  if (!def) return '';
  return `<button class="pinned-app" type="button" data-start-app="${esc(appId)}" title="${esc(def.title)}">
    <span class="pa-icon">${getIcon(def.icon, 32)}</span>
    <span class="pa-label">${esc(def.title)}</span>
  </button>`;
}
function startSearchResults(query) {
  const q = query.trim().toLowerCase();
  const matches = Object.entries(APPS).filter(([id, def]) => isAppAvailable(id) && def.title.toLowerCase().includes(q));
  if (!matches.length) return `<div class="start-empty">No results for “${esc(query)}”</div>`;
  return `<div class="start-search-results">
    <div class="search-result-group-title">Apps</div>
    ${matches.map(([id, def]) => `<button class="search-result" type="button" data-start-app="${esc(id)}">
      ${getIcon(def.icon, 26)}
      <span class="sr-meta"><strong>${esc(def.title)}</strong><span>Application</span></span>
    </button>`).join('')}
  </div>`;
}
function startAllApps() {
  const appList = Object.entries(APPS).filter(([id]) => isAppAvailable(id)).sort((a, b) => a[1].title.localeCompare(b[1].title));
  let lastLetter = '';
  return `<div class="all-apps-header">
    <button class="all-apps-back" type="button" data-start-action="back">${getIcon('chevron-left', 12)} Back</button>
  </div>
  <div>${appList.map(([id, def]) => {
    const letter = def.title.charAt(0).toUpperCase();
    const letterHeader = letter !== lastLetter ? `<div class="app-letter">${esc(letter)}</div>` : '';
    lastLetter = letter;
    return `${letterHeader}<button class="all-app-row" type="button" data-start-app="${esc(id)}">${getIcon(def.icon, 22)}<span>${esc(def.title)}</span></button>`;
  }).join('')}</div>`;
}
function renderStartMenu() {
  const menu = $('#start-menu');
  if (!menu) return;
  let body;
  if (startQuery.trim()) {
    body = startSearchResults(startQuery);
  } else if (startView === 'all') {
    body = startAllApps();
  } else {
    body = `
      <div class="start-section-head"><h2>Pinned</h2><button class="start-link" type="button" data-start-action="all">All apps ${getIcon('chevron-right', 10)}</button></div>
      <div class="start-pinned">${state.pinnedApps.filter(isAppAvailable).map(startAppButton).join('')}</div>
      <div class="start-section-head"><h2>Recommended</h2><button class="start-link" type="button" data-start-action="more">More ${getIcon('chevron-right', 10)}</button></div>
      <div class="start-recommended">
        ${RECOMMENDED_ITEMS.map((item) => `<button class="rec-item" type="button" data-recommended="${esc(item.name)}">
          <span class="rec-icon">${getIcon(item.icon, 28)}</span>
          <span class="rec-meta"><strong>${esc(item.name)}</strong><span>${esc(item.meta)}</span></span>
        </button>`).join('')}
      </div>`;
  }
  menu.innerHTML = `
    <div class="start-search-wrap">
      <span class="start-search-icon">${getIcon('search', 16)}</span>
      <input id="start-search-input" class="start-search" type="text" placeholder="Type here to search" value="${esc(startQuery)}" autocomplete="off" aria-label="Search apps">
      <button class="start-search-clear ${startQuery ? 'visible' : ''}" type="button" aria-label="Clear search">${getIcon('close', 13)}</button>
    </div>
    <div class="start-scroll">${body}</div>
    <div class="start-footer">
      <button class="user-chip" type="button" data-start-action="profile" aria-label="User account options">
        <span class="user-avatar">${getIcon('user', 18)}</span>
        <span><span class="user-name">User</span><br><span class="user-sub">Local account</span></span>
      </button>
      <button class="power-btn" type="button" data-start-action="power" aria-label="Power options">${getIcon('power', 17)}</button>
    </div>
  `;
  const input = $('#start-search-input');
  input.addEventListener('input', () => {
    startQuery = input.value;
    const cursor = input.selectionStart;
    renderStartMenu();
    const newInput = $('#start-search-input');
    if (newInput) {
      newInput.focus();
      try { newInput.setSelectionRange(cursor, cursor); } catch (_) {}
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = $('[data-start-app]', menu);
      if (first) { event.preventDefault(); openApp(first.dataset.startApp); closeStartMenu(); }
    }
  });
  const clear = $('.start-search-clear', menu);
  if (clear) clear.addEventListener('click', () => { startQuery = ''; renderStartMenu(); $('#start-search-input').focus(); });
  menu.addEventListener('click', startMenuClick);
  if (!startQuery && startView === 'pinned') {
    setTimeout(() => { if (!$('#start-menu').hidden) { input.focus(); } }, 30);
  }
}
function startMenuClick(event) {
  const appButton = event.target.closest('[data-start-app]');
  if (appButton) {
    const id = appButton.dataset.startApp;
    closeStartMenu();
    openApp(id);
    return;
  }
  const actionButton = event.target.closest('[data-start-action]');
  if (actionButton) {
    const action = actionButton.dataset.startAction;
    if (action === 'all') { startView = 'all'; renderStartMenu(); }
    else if (action === 'back') { startView = 'pinned'; renderStartMenu(); }
    else if (action === 'more') { startView = 'all'; renderStartMenu(); }
    else if (action === 'profile') showProfileMenu(actionButton);
    else if (action === 'power') showPowerMenu(actionButton);
    return;
  }
  const recommended = event.target.closest('[data-recommended]');
  if (recommended) {
    addNotification('File Explorer', 'File not found', `${recommended.dataset.recommended} could not be found.`, 'folder');
  }
}
function openStartMenu(mode = 'pinned') {
  closeAllFlyouts('start-menu');
  closeContextMenus();
  startView = mode === 'all' ? 'all' : 'pinned';
  startQuery = '';
  const menu = $('#start-menu');
  menu.hidden = false;
  menu.classList.remove('closing');
  renderStartMenu();
  setStartButtonActive(true);
  setTimeout(() => {
    const input = $('#start-search-input');
    if (input) input.focus();
  }, 60);
}
function closeStartMenu() {
  const menu = $('#start-menu');
  if (!menu || menu.hidden) return;
  hideFlyout(menu);
  $$('.start-popover').forEach((popover) => popover.remove());
  setStartButtonActive(false);
}
function toggleStartMenu() {
  const menu = $('#start-menu');
  if (!menu.hidden) closeStartMenu();
  else openStartMenu('pinned');
}
function showProfileMenu(anchor) {
  $$('.start-popover').forEach((el) => el.remove());
  const popover = h('div', 'start-popover');
  popover.innerHTML = `
    <button class="power-item" type="button" data-profile-action="account">${getIcon('settings', 16)} Change account settings</button>
    <button class="power-item" type="button" data-profile-action="lock">${getIcon('lock', 16)} Lock <span style="margin-left:auto;font-size:10px;color:var(--text-secondary)">Win+L</span></button>
    <div class="menu-separator"></div>
    <button class="power-item" type="button" data-profile-action="signout">${getIcon('user', 16)} Sign out</button>
  `;
  document.body.appendChild(popover);
  const rect = anchor.getBoundingClientRect();
  popover.style.left = `${clamp(rect.left, 8, window.innerWidth - 230)}px`;
  popover.style.top = `${Math.max(8, rect.top - 150)}px`;
  $$('[data-profile-action]', popover).forEach((item) => item.addEventListener('click', () => {
    popover.remove();
    if (item.dataset.profileAction === 'account') { closeStartMenu(); openApp('settings', { page: 'accounts' }); }
    else if (item.dataset.profileAction === 'lock' || item.dataset.profileAction === 'signout') { closeStartMenu(); lockNow(); }
  }));
}
function showPowerMenu(anchor) {
  $$('.start-popover').forEach((el) => el.remove());
  const popover = h('div', 'start-popover');
  popover.innerHTML = `
    <button class="power-item" type="button" data-power-action="sleep">${getIcon('sleep', 16)} Sleep</button>
    <button class="power-item" type="button" data-power-action="shutdown">${getIcon('shutdown', 16)} Shut down</button>
    <button class="power-item" type="button" data-power-action="restart">${getIcon('restart', 16)} Restart</button>
  `;
  document.body.appendChild(popover);
  const rect = anchor.getBoundingClientRect();
  popover.style.left = `${Math.max(8, rect.right - popover.offsetWidth)}px`;
  popover.style.top = `${Math.max(8, rect.top - popover.offsetHeight - 8)}px`;
  $$('[data-power-action]', popover).forEach((item) => item.addEventListener('click', () => {
    popover.remove();
    closeStartMenu();
    if (item.dataset.powerAction === 'sleep') sleepSystem();
    else if (item.dataset.powerAction === 'shutdown') shutDown();
    else if (item.dataset.powerAction === 'restart') restartSimulation();
  }));
}

// ═══════════════════════════════════════
// SECTION: QUICK SETTINGS — toggles, brightness and volume
// ═══════════════════════════════════════
function sliderFill(value) { return `${clamp(value, 0, 100)}%`; }
function renderQuickSettings() {
  const panel = $('#quick-settings');
  if (!panel) return;
  const toggles = [
    { key: 'wifi', label: state.airplane ? 'Airplane' : state.wifi ? 'WiFi' : 'WiFi off', icon: state.airplane ? 'airplane' : state.wifi ? 'wifi' : 'wifi-off', on: state.wifi && !state.airplane, sub: state.wifi ? 'Connected' : 'Off' },
    { key: 'bluetooth', label: 'Bluetooth', icon: state.bluetooth ? 'bluetooth' : 'bluetooth-off', on: state.bluetooth, sub: state.bluetooth ? 'On' : 'Off' },
    { key: 'airplane', label: 'Airplane mode', icon: 'airplane', on: state.airplane, sub: state.airplane ? 'On' : 'Off' },
    { key: 'batterySaver', label: 'Battery saver', icon: 'battery', on: state.batterySaver, sub: state.batterySaver ? 'On' : 'Off' },
    { key: 'nightLight', label: 'Night light', icon: 'nightlight', on: state.nightLight, sub: state.nightLight ? 'On' : 'Off' },
    { key: 'darkMode', label: 'Dark mode', icon: state.theme === 'dark' ? 'moon' : 'sun', on: state.theme === 'dark', sub: state.theme === 'dark' ? 'On' : 'Off' }
  ];
  panel.innerHTML = `
    <div class="qs-header"><h2>Quick settings</h2><button class="qs-edit" type="button" aria-label="Edit quick settings" title="Edit quick settings">${getIcon('settings', 15)}</button></div>
    <div class="qs-toggles">
      ${toggles.map((toggle) => `<button class="qs-toggle ${toggle.on ? 'on' : ''}" type="button" data-qs-toggle="${toggle.key}" aria-pressed="${toggle.on}">
        ${getIcon(toggle.icon, 19)}<span>${esc(toggle.label)}</span><span class="qs-toggle-sub">${esc(toggle.sub)}</span>
      </button>`).join('')}
    </div>
    <div class="qs-slider-row">
      ${getIcon('brightness', 18)}
      <input class="qs-slider" id="qs-brightness" type="range" min="30" max="100" step="1" value="${state.brightness}" style="--fill:${sliderFill(state.brightness)}" aria-label="Brightness">
    </div>
    <div class="qs-slider-row">
      ${getIcon(state.volume ? 'volume' : 'volume-mute', 18)}
      <input class="qs-slider" id="qs-volume" type="range" min="0" max="100" step="1" value="${state.volume}" style="--fill:${sliderFill(state.volume)}" aria-label="Volume">
    </div>
    <div class="qs-footer">
      <span class="qs-battery">${getIcon('battery', 16)} 89% — 5h 21m remaining</span>
      <button class="qs-icon-btn" type="button" data-qs-settings aria-label="Open settings">${getIcon('settings', 16)}</button>
    </div>
  `;
  $('.qs-edit', panel).addEventListener('click', () => { closeAllFlyouts(); openApp('settings', { page: 'personalization' }); });
  $$('[data-qs-toggle]', panel).forEach((button) => button.addEventListener('click', () => toggleQuickSetting(button.dataset.qsToggle)));
  const brightness = $('#qs-brightness');
  brightness.addEventListener('input', () => {
    state.brightness = Number(brightness.value);
    brightness.style.setProperty('--fill', sliderFill(state.brightness));
    applyDisplayEffects();
    saveState();
  });
  const volume = $('#qs-volume');
  volume.addEventListener('input', () => {
    state.volume = Number(volume.value);
    volume.style.setProperty('--fill', sliderFill(state.volume));
    Sound.setVolume(state.volume);
    refreshTrayState();
    saveState();
  });
  $('[data-qs-settings]', panel).addEventListener('click', () => { closeAllFlyouts(); openApp('settings'); });
}
function toggleQuickSetting(key) {
  if (key === 'darkMode') {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  } else if (key === 'wifi') {
    state.wifi = !state.wifi;
    if (state.wifi) state.airplane = false;
  } else if (key === 'bluetooth') {
    state.bluetooth = !state.bluetooth;
  } else if (key === 'airplane') {
    state.airplane = !state.airplane;
    if (state.airplane) { state.wifi = false; state.bluetooth = false; }
    else state.wifi = true;
  } else if (key === 'batterySaver') {
    state.batterySaver = !state.batterySaver;
  } else if (key === 'nightLight') {
    state.nightLight = !state.nightLight;
    applyDisplayEffects();
  }
  saveState();
  refreshTrayState();
  renderQuickSettings();
  document.dispatchEvent(new CustomEvent('sim-settings-change'));
}
function openQuickSettings() {
  closeAllFlyouts('quick-settings');
  closeContextMenus();
  const panel = $('#quick-settings');
  panel.hidden = false;
  panel.classList.remove('closing');
  renderQuickSettings();
}
function toggleQuickSettings() {
  const panel = $('#quick-settings');
  if (!panel.hidden) hideFlyout(panel);
  else openQuickSettings();
}

// ═══════════════════════════════════════
// SECTION: CALENDAR & NOTIFICATIONS — monthly calendar and notification center
// ═══════════════════════════════════════
let calendarCursor = new Date();
calendarCursor.setDate(1);
function calendarDays() {
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    cells.push(date);
  }
  return cells;
}
function renderCalendarFlyout() {
  const panel = $('#calendar-flyout');
  if (!panel) return;
  const now = new Date();
  const days = calendarDays();
  const todayKey = now.toDateString();
  panel.innerHTML = `
    <div class="notif-head"><h2>Notifications</h2><button class="notif-clear" type="button" data-cal-action="clear">Clear all</button></div>
    <div class="notif-list" id="notif-list"></div>
    <div class="calendar-section">
      <div class="calendar-nav">
        <h3>${monthNames[calendarCursor.getMonth()]} ${calendarCursor.getFullYear()}</h3>
        <div style="display:flex;gap:2px">
          <button type="button" data-cal-action="prev" aria-label="Previous month">${getIcon('chevron-left', 12)}</button>
          <button type="button" data-cal-action="next" aria-label="Next month">${getIcon('chevron-right', 12)}</button>
        </div>
      </div>
      <div class="calendar-grid">
        ${['Su','Mo','Tu','We','Th','Fr','Sa'].map((day) => `<div class="cal-day-name">${day}</div>`).join('')}
        ${days.map((date) => {
          const other = date.getMonth() !== calendarCursor.getMonth();
          const today = date.toDateString() === todayKey;
          return `<button class="cal-day ${other ? 'other' : ''} ${today ? 'today' : ''} ${date.getDay() === 3 ? 'has-event' : ''}" type="button" data-cal-date="${date.toISOString()}" aria-label="${esc(date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))}">${date.getDate()}</button>`;
        }).join('')}
      </div>
      <button class="calendar-today-btn" type="button" data-cal-action="today">Today</button>
    </div>
  `;
  renderNotificationCenter();
  $$('[data-cal-action]', panel).forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.calAction;
    if (action === 'clear') {
      state.notifications = [];
      saveState();
      renderCalendarFlyout();
      updateBell();
    } else if (action === 'prev') {
      calendarCursor.setMonth(calendarCursor.getMonth() - 1);
      renderCalendarFlyout();
    } else if (action === 'next') {
      calendarCursor.setMonth(calendarCursor.getMonth() + 1);
      renderCalendarFlyout();
    } else if (action === 'today') {
      calendarCursor = new Date(); calendarCursor.setDate(1); renderCalendarFlyout();
    }
  }));
  $$('[data-cal-date]', panel).forEach((button) => button.addEventListener('click', () => {
    const date = new Date(button.dataset.calDate);
    calendarCursor = new Date(date.getFullYear(), date.getMonth(), 1);
    renderCalendarFlyout();
  }));
}
function openCalendarFlyout() {
  closeAllFlyouts('calendar-flyout');
  closeContextMenus();
  const panel = $('#calendar-flyout');
  panel.hidden = false;
  panel.classList.remove('closing');
  state.notifications.forEach((item) => { item.unread = false; });
  state.notificationsRead = true;
  saveState();
  renderCalendarFlyout();
  updateBell();
}
function toggleCalendarFlyout() {
  const panel = $('#calendar-flyout');
  if (!panel.hidden) hideFlyout(panel);
  else openCalendarFlyout();
}

// ═══════════════════════════════════════
// SECTION: WIDGETS — weather, news, stocks and tips
// ═══════════════════════════════════════
function renderWidgets() {
  const panel = $('#widgets-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="widget-header">
      <h2>Widgets</h2>
      <button class="widget-gear" type="button" aria-label="Widget settings" title="Widget settings">${getIcon('settings', 17)}</button>
      <span class="user-avatar">${getIcon('user', 17)}</span>
    </div>
    <section class="widget-card weather-widget">
      <div class="wc-head"><div><h3>Seattle, WA</h3><div class="weather-temp">72°</div><div class="weather-desc">Sunny · Feels like 74°</div></div><div style="width:46px;height:46px">${getIcon('sun', 46)}</div></div>
      <div class="forecast-row">
        ${['Mon','Tue','Wed','Thu','Fri'].map((day, i) => `<div><div>${day}</div><div class="fc-icon">${getIcon(i === 2 ? 'cloud' : 'sun', 23)}</div><div>${72 + i}°</div></div>`).join('')}
      </div>
    </section>
    <section class="widget-card">
      <div class="widget-title"><span>Top stories</span><span style="font-size:9px;color:var(--text-secondary)">See all</span></div>
      <div class="news-item"><div class="news-thumb"></div><div class="news-copy"><strong>New Windows features arrive in the latest update</strong><span>Technology · 2h ago</span></div></div>
      <div class="news-item"><div class="news-thumb alt1"></div><div class="news-copy"><strong>Designers share their favorite productivity tips</strong><span>Productivity · 5h ago</span></div></div>
      <div class="news-item"><div class="news-thumb alt2"></div><div class="news-copy"><strong>The next generation of creative tools is here</strong><span>Creativity · 8h ago</span></div></div>
    </section>
    <section class="widget-card">
      <div class="widget-title"><span>Watchlist</span><span style="font-size:9px;color:var(--text-secondary)">Markets</span></div>
      <div class="stock-row"><div class="stock-name"><span class="stock-symbol">MSFT</span><span class="stock-price">$450.23</span></div><span class="stock-change">▲ 2.3%</span></div>
      <div class="stock-row"><div class="stock-name"><span class="stock-symbol">AAPL</span><span class="stock-price">$198.45</span></div><span class="stock-change">▲ 0.8%</span></div>
      <div class="stock-row"><div class="stock-name"><span class="stock-symbol">GOOGL</span><span class="stock-price">$178.90</span></div><span class="stock-change down">▼ 0.2%</span></div>
    </section>
    <section class="widget-card">
      <div class="widget-title"><span>Today</span>${getIcon('calendar', 14)}</div>
      <div class="calendar-widget-event"><strong>Design review — 2:00 PM</strong>Meeting with the product team · 30 min</div>
    </section>
    <section class="widget-card">
      <div class="widget-title"><span>Tips</span>${getIcon('tips', 15)}</div>
      <div class="widget-tip">Did you know? You can snap windows by dragging them to screen edges!</div>
    </section>
  `;
  $('.widget-gear', panel).addEventListener('click', () => { closeAllFlyouts(); openApp('settings', { page: 'personalization' }); });
  $$('.widget-card', panel).forEach((card) => card.addEventListener('click', () => {
    if (card.classList.contains('weather-widget')) openApp('edge', { url: 'https://weather.com' });
  }));
}
function openWidgets() {
  closeAllFlyouts('widgets-panel');
  closeContextMenus();
  const panel = $('#widgets-panel');
  panel.hidden = false;
  panel.classList.remove('closing');
  renderWidgets();
}
function toggleWidgets() {
  const panel = $('#widgets-panel');
  if (!panel.hidden) hideFlyout(panel);
  else openWidgets();
}

// ═══════════════════════════════════════
// SECTION: TASK VIEW & APP SWITCHER — window thumbnails
// ═══════════════════════════════════════
function makeWindowThumb(win, width, height) {
  const clone = win.el.cloneNode(true);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  clone.classList.remove('active', 'opening', 'closing', 'minimizing');
  clone.style.position = 'absolute';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.width = `${win.el.offsetWidth}px`;
  clone.style.height = `${win.el.offsetHeight}px`;
  clone.style.display = 'flex';
  clone.style.transform = 'none';
  clone.style.opacity = '1';
  clone.style.zIndex = '1';
  clone.querySelectorAll('.resize-handle').forEach((node) => node.remove());
  const scale = Math.min(width / Math.max(1, win.el.offsetWidth), height / Math.max(1, win.el.offsetHeight));
  const wrapper = h('div', 'tv-scaled');
  wrapper.style.transform = `scale(${scale})`;
  wrapper.appendChild(clone);
  return wrapper;
}
function renderTaskView() {
  const overlay = $('#taskview-overlay');
  overlay.innerHTML = '';
  const wins = Array.from(WM.windows.values()).filter((win) => !win.closing);
  const title = h('h2', '', 'Task View');
  overlay.appendChild(title);
  if (!wins.length) {
    const empty = h('div', 'taskview-empty', 'No open windows. Open an app from the taskbar or Start menu.');
    overlay.appendChild(empty);
    const grid = h('div', 'taskview-grid');
    const newDesktop = h('button', 'taskview-new');
    newDesktop.type = 'button';
    newDesktop.innerHTML = '<span>+</span><div>New desktop</div>';
    newDesktop.addEventListener('click', () => addNotification('Task View', 'Desktop created', 'A new virtual desktop would appear here. This demo has one desktop.', 'taskview'));
    grid.appendChild(newDesktop);
    overlay.appendChild(grid);
    return;
  }
  const grid = h('div', 'taskview-grid');
  wins.forEach((win) => {
    const card = h('button', 'taskview-card');
    card.type = 'button';
    const thumb = h('div', 'taskview-thumb');
    thumb.appendChild(makeWindowThumb(win, 300, 188));
    const label = h('div', 'taskview-label', `${getIcon(win.icon, 16)}<span>${esc(win.title)}</span>`);
    card.append(thumb, label);
    card.addEventListener('click', () => {
      hideTaskView();
      if (win.minimized) restoreWindow(win);
      else focusWindow(win);
    });
    grid.appendChild(card);
  });
  const newDesktop = h('button', 'taskview-new');
  newDesktop.type = 'button';
  newDesktop.innerHTML = '<span>+</span><div>New desktop</div>';
  newDesktop.addEventListener('click', () => addNotification('Task View', 'Desktop created', 'A new virtual desktop would appear here. This demo has one desktop.', 'taskview'));
  grid.appendChild(newDesktop);
  overlay.appendChild(grid);
}
function showTaskView() {
  closeAllFlyouts();
  closeContextMenus();
  renderTaskView();
  $('#taskview-overlay').hidden = false;
}
function hideTaskView() {
  $('#taskview-overlay').hidden = true;
}
function toggleTaskView() {
  if ($('#taskview-overlay').hidden) showTaskView();
  else hideTaskView();
}
let switcherWindows = [];
let switcherIndex = 0;
let switcherOpen = false;
function renderSwitcher() {
  const overlay = $('#switcher-overlay');
  if (!switcherWindows.length) return;
  overlay.innerHTML = '';
  const card = h('div', 'switcher-card');
  const title = h('div', 'switcher-title', `<span>Switch windows</span><span>Release Alt to select</span>`);
  const grid = h('div', 'switcher-grid');
  switcherWindows.forEach((win, index) => {
    const item = h('button', 'switcher-item' + (index === switcherIndex ? ' current' : ''));
    item.type = 'button';
    const thumb = h('div', 'sw-thumb');
    const scaled = makeWindowThumb(win, 176, 108);
    scaled.className = 'sw-scaled';
    scaled.style.transform = `scale(${Math.min(176 / Math.max(1, win.el.offsetWidth), 108 / Math.max(1, win.el.offsetHeight))})`;
    thumb.appendChild(scaled);
    const label = h('div', 'sw-label', `${getIcon(win.icon, 14)}<span>${esc(win.title)}</span>`);
    item.append(thumb, label);
    item.addEventListener('click', () => { switcherIndex = index; hideSwitcher(true); });
    grid.appendChild(item);
  });
  card.append(title, grid);
  overlay.appendChild(card);
  $$('.switcher-item', overlay).forEach((item, index) => item.classList.toggle('current', index === switcherIndex));
}
function showSwitcher(direction = 1) {
  const wins = Array.from(WM.windows.values()).filter((win) => !win.closing);
  if (!wins.length) return;
  if (!switcherOpen) {
    switcherWindows = wins;
    switcherIndex = wins.findIndex((win) => win.id === WM.focusedId);
    if (switcherIndex < 0) switcherIndex = 0;
    switcherOpen = true;
    $('#switcher-overlay').hidden = false;
  } else {
    switcherIndex = (switcherIndex + direction + switcherWindows.length) % switcherWindows.length;
  }
  renderSwitcher();
}
function hideSwitcher(apply = false) {
  if (!switcherOpen) return;
  const selected = switcherWindows[switcherIndex];
  switcherOpen = false;
  $('#switcher-overlay').hidden = true;
  if (apply && selected) {
    if (selected.minimized) restoreWindow(selected);
    else focusWindow(selected);
  }
}

// ═══════════════════════════════════════
// SECTION: RUN DIALOG & CLIPPY — utilities and easter eggs
// ═══════════════════════════════════════
function openRunDialog() {
  closeAllFlyouts();
  closeContextMenus();
  const dialog = $('#run-dialog');
  dialog.hidden = false;
  const input = $('#run-input');
  input.value = '';
  setTimeout(() => input.focus(), 40);
}
function closeRunDialog() {
  $('#run-dialog').hidden = true;
}
function executeRun() {
  const raw = $('#run-input').value.trim().toLowerCase();
  closeRunDialog();
  if (!raw) return;
  const commands = {
    notepad: 'notepad', calc: 'calculator', calculator: 'calculator', explorer: 'explorer', 'file explorer': 'explorer',
    edge: 'edge', msedge: 'edge', settings: 'settings', 'ms-settings': 'settings', terminal: 'terminal', powershell: 'terminal',
    pwsh: 'terminal', code: 'vscode', vscode: 'vscode', paint: 'paint', mspaint: 'paint', store: 'store',
    taskmgr: 'taskmanager', 'task manager': 'taskmanager', about: 'about', recycle: 'recyclebin', 'recycle bin': 'recyclebin'
  };
  const appId = commands[raw];
  if (appId) openApp(appId);
  else alertDialog('Run', `Windows cannot find '${$('#run-input').value}'. Make sure you've typed the name correctly, then try again.`);
}
function showClippy() {
  $('#clippy').hidden = false;
  announce('Clippy says: It looks like you are using a Windows simulator. Need help?');
}
function triggerKonami() {
  const screen = $('#screen-root');
  screen.classList.remove('rotate-360');
  void screen.offsetWidth;
  screen.classList.add('rotate-360');
  setTimeout(() => screen.classList.remove('rotate-360'), 1200);
  addNotification('Windows', 'Achievement unlocked', 'You found the Konami code! Nice.', 'star');
}

// ═══════════════════════════════════════
// SECTION: GLOBAL EVENTS — flyout dismissal, lock handling and init hooks
// ═══════════════════════════════════════
function initGlobalEvents() {
  document.addEventListener('pointerdown', (event) => {
    if (Boot.phase === 'lock') {
      if (!event.target.closest('#lock-screen')) return;
      dismissLock();
      return;
    }
    if (Boot.phase === 'sleep') {
      wakeSystem();
      return;
    }
    if (!event.target.closest('.context-menu, .context-submenu')) closeContextMenus();
    const insideFlyout = event.target.closest('.flyout, .widgets-panel, .start-popover, #taskbar, #tray-popup');
    if (!insideFlyout) closeAllFlyouts();
    if (!event.target.closest('#tray-popup, #tray-overflow')) {
      const popup = $('#tray-popup');
      if (popup && !popup.hidden) hideFlyout(popup);
    }
    if (!event.target.closest('.window') && !event.target.closest('#taskbar') && !event.target.closest('.flyout') && !event.target.closest('.full-overlay')) {
      if (!event.target.closest('.desktop-icon')) focusDesktop();
    }
    if (!event.target.closest('#clippy')) {
      // Clippy is persistent until explicitly dismissed, just like the real thing.
    }
  }, true);
  document.addEventListener('keydown', (event) => {
    if (Boot.phase === 'lock') {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ' || event.key.length === 1) {
        event.preventDefault();
        dismissLock();
      }
      return;
    }
    if (Boot.phase === 'sleep') {
      event.preventDefault();
      wakeSystem();
      return;
    }
  }, true);
  document.addEventListener('contextmenu', (event) => {
    if (event.target.closest('input, textarea, .notepad-editor')) return;
    if (!event.target.closest('.window, .desktop-icon, #taskbar, .flyout, .desktop')) event.preventDefault();
  });
  $('#login-form').addEventListener('submit', (event) => { event.preventDefault(); signIn(); });
  $('#run-ok').addEventListener('click', executeRun);
  $('#run-cancel').addEventListener('click', closeRunDialog);
  $('#run-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); executeRun(); }
    if (event.key === 'Escape') { event.preventDefault(); closeRunDialog(); }
  });
  $('#run-dialog').addEventListener('pointerdown', (event) => { if (event.target === $('#run-dialog')) closeRunDialog(); });
  $('#clippy-close').addEventListener('click', () => { $('#clippy').hidden = true; });
  $('#restart-simulation').addEventListener('click', restartSimulation);
  $('#taskview-overlay').addEventListener('pointerdown', (event) => {
    if (event.target === $('#taskview-overlay')) hideTaskView();
  });
  $('#switcher-overlay').addEventListener('pointerdown', (event) => {
    if (event.target === $('#switcher-overlay')) hideSwitcher(false);
  });
  window.addEventListener('resize', debounce(() => {
    WM.windows.forEach((win) => {
      if (win.maximized) {
        win.el.style.width = `${window.innerWidth}px`;
        win.el.style.height = `${window.innerHeight - 48}px`;
      } else {
        win.el.style.left = `${clamp(win.el.offsetLeft, 0, window.innerWidth - 160)}px`;
        win.el.style.top = `${clamp(win.el.offsetTop, 0, window.innerHeight - 96)}px`;
        win.el.style.width = `${Math.min(win.el.offsetWidth, window.innerWidth - 8)}px`;
        win.el.style.height = `${Math.min(win.el.offsetHeight, window.innerHeight - 56)}px`;
      }
    });
  }, 120));
  document.addEventListener('sim-theme-change', () => {
    if (!$('#quick-settings').hidden) renderQuickSettings();
  });
}

// ═══════════════════════════════════════
// SECTION: KEYBOARD SHORTCUTS — Windows-style hotkeys and Konami code
// ═══════════════════════════════════════
let metaDown = false;
let metaUsed = false;
let altDown = false;
let konamiProgress = 0;
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
function isTypingTarget(target) {
  return !!target.closest('input, textarea, [contenteditable="true"], .notepad-editor, .vscode-code-input, .term-input');
}
function runAppShortcut(appId) {
  if (WM.byApp(appId)) {
    const win = WM.byApp(appId);
    if (win.minimized) restoreWindow(win);
    else focusWindow(win);
  } else openApp(appId);
}
function configureKeyboard() {
  document.addEventListener('keydown', (event) => {
    const typing = isTypingTarget(event.target);
    if (Boot.phase === 'bsod') return;
    if (event.key === 'Meta') {
      metaDown = true;
      metaUsed = false;
    }
    if (event.key === 'Alt') altDown = true;

    const key = event.key.toLowerCase();
    if (key === KONAMI[konamiProgress].toLowerCase()) {
      konamiProgress++;
      if (konamiProgress >= KONAMI.length) { konamiProgress = 0; triggerKonami(); }
    } else {
      konamiProgress = key === KONAMI[0].toLowerCase() ? 1 : 0;
    }

    if (event.key === 'Escape') {
      if (!$('#context-menu-root').innerHTML) {
        if (!$('#modal-root').innerHTML) {
          if ($('#run-dialog').hidden === false) closeRunDialog();
          else if (!$('#start-menu').hidden || !$('#quick-settings').hidden || !$('#calendar-flyout').hidden || !$('#widgets-panel').hidden) closeAllFlyouts();
          else if (!$('#taskview-overlay').hidden) hideTaskView();
          else if (switcherOpen) hideSwitcher(false);
          else if (!$('#clippy').hidden) $('#clippy').hidden = true;
          else if (WM.focusedId) focusDesktop();
        } else closeModal();
      } else closeContextMenus();
      return;
    }

    if (event.altKey && event.key === 'F4') {
      event.preventDefault();
      const win = WM.focused();
      if (win) closeWindow(win);
      return;
    }
    if (event.ctrlKey && event.shiftKey && event.key === 'Escape') {
      event.preventDefault();
      runAppShortcut('taskmanager');
      return;
    }
    if (event.altKey && event.key === 'Tab') {
      event.preventDefault();
      showSwitcher(1);
      altDown = true;
      return;
    }
    if (switcherOpen && event.key === 'Escape') { hideSwitcher(false); return; }

    const win = WM.focused();
    if (event.metaKey && !event.shiftKey) {
      metaUsed = true;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (win) snapWindow(win, 'left');
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (win) snapWindow(win, 'right');
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (win) maximizeWindow(win);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (win) { if (win.maximized || win.snapped) restoreWindowGeometry(win); else minimizeWindow(win); }
        return;
      }
      if (key === 'd') {
        event.preventDefault();
        toggleShowDesktop();
        return;
      }
      if (key === 'e') {
        event.preventDefault();
        runAppShortcut('explorer');
        return;
      }
      if (key === 'i') {
        event.preventDefault();
        runAppShortcut('settings');
        return;
      }
      if (key === 'l') {
        event.preventDefault();
        lockNow();
        return;
      }
      if (key === 'r') {
        event.preventDefault();
        openRunDialog();
        return;
      }
      if (key === 'a') {
        event.preventDefault();
        runAppShortcut('settings');
        return;
      }
    }
    if (event.ctrlKey && event.altKey && !event.metaKey) {
      const map = { e: 'explorer', i: 'settings', d: null, l: null, r: null };
      if (event.key.toLowerCase() === 'e') { event.preventDefault(); runAppShortcut('explorer'); }
      else if (event.key.toLowerCase() === 'i') { event.preventDefault(); runAppShortcut('settings'); }
      else if (event.key.toLowerCase() === 'r') { event.preventDefault(); openRunDialog(); }
      else if (event.key.toLowerCase() === 'l') { event.preventDefault(); lockNow(); }
      else if (event.key.toLowerCase() === 'd') { event.preventDefault(); toggleShowDesktop(); }
    }
    if (event.key === 'F11') return;
  });
  document.addEventListener('keyup', (event) => {
    if (event.key === 'Alt') {
      if (switcherOpen) hideSwitcher(true);
      altDown = false;
    }
    if (event.key === 'Meta') {
      if (metaDown && !metaUsed && Boot.phase === 'desktop') toggleStartMenu();
      metaDown = false;
      metaUsed = false;
    }
  });
  document.addEventListener('keydown', (event) => {
    if (switcherOpen && event.key === 'Tab') {
      event.preventDefault();
      showSwitcher(event.shiftKey ? -1 : 1);
    }
  });
}

// ═══════════════════════════════════════
// SECTION: APP LAUNCHER — shared window creation and registry
// ═══════════════════════════════════════
function openApp(appId, params = {}) {
  const def = APPS[appId];
  if (!def || (def.storeOnly && !state.installedApps.includes(appId))) {
    addNotification('Windows', 'App not available', 'This app is not installed. Open Microsoft Store to install it.', 'store');
    return null;
  }
  if (!params.forceNew) {
    const existing = WM.byApp(appId);
    if (existing) {
      if (existing.minimized) restoreWindow(existing);
      else focusWindow(existing);
      if (typeof def.onReopen === 'function') {
        try { def.onReopen(existing, params); } catch (error) { console.warn(error); }
      }
      return existing;
    }
  }
  const win = WM.create(appId, {
    title: def.title,
    icon: def.icon,
    width: def.width || 900,
    height: def.height || 600,
    minWidth: def.minWidth || 300,
    minHeight: def.minHeight || 180,
    resizable: def.resizable !== false,
    maximizable: def.maximizable !== false,
    ...(def.windowOptions || {})
  });
  const context = {
    win,
    params,
    body: win.body,
    toast: (title, message, icon = def.icon) => addNotification(def.title, title, message, icon),
    setTitle: (title) => win.setTitle(title),
    cleanup: (fn) => win.cleanup(fn),
    openApp
  };
  try {
    const result = def.build(context);
    if (result && result.root && !result.root.parentNode) win.body.appendChild(result.root);
    if (result && result.cleanup) win.cleanup(result.cleanup);
  } catch (error) {
    console.error(`Unable to open ${def.title}`, error);
    win.body.innerHTML = `<div class="placeholder-app"><div class="ph-icon">${getIcon(def.icon, 70)}</div><h2>Something went wrong</h2><p>${esc(error.message || 'This app could not be opened.')}</p></div>`;
  }
  return win;
}

// ═══════════════════════════════════════
// SECTION: APP: FILE EXPLORER — navigation, virtual file system and operations
// ═══════════════════════════════════════
APPS.explorer = {
  title: 'File Explorer',
  icon: 'explorer',
  width: 950,
  height: 620,
  minWidth: 620,
  minHeight: 420,
  onReopen(win, params) {
    if (params.path && win.explorerNavigate) win.explorerNavigate(params.path);
  },
  build({ win, params, cleanup }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root explorer');
    win.body.appendChild(root);
    const nav = {
      path: FS.normalize(params.path || '/'),
      history: [],
      index: -1,
      view: 'grid',
      sort: 'name',
      search: '',
      selected: new Set()
    };
    root.innerHTML = `
      <div class="exp-toolbar">
        <button class="exp-nav-btn" type="button" data-nav="back" aria-label="Back">${getIcon('back', 15)}</button>
        <button class="exp-nav-btn" type="button" data-nav="forward" aria-label="Forward">${getIcon('forward', 15)}</button>
        <button class="exp-nav-btn" type="button" data-nav="up" aria-label="Up">${getIcon('up-arrow', 15)}</button>
        <div class="exp-address" data-role="crumbs"></div>
        <label class="exp-search">${getIcon('search', 13)}<input type="text" placeholder="Search" aria-label="Search this folder" data-role="search"></label>
      </div>
      <div class="exp-layout">
        <aside class="exp-sidebar">
          <div class="exp-side-section">Quick access</div>
          <button class="exp-side-item" type="button" data-side-path="/Desktop">${getIcon('desktop', 16)}<span>Desktop</span></button>
          <button class="exp-side-item" type="button" data-side-path="/Downloads">${getIcon('download', 16)}<span>Downloads</span></button>
          <button class="exp-side-item" type="button" data-side-path="/Documents">${getIcon('folder', 16)}<span>Documents</span></button>
          <button class="exp-side-item" type="button" data-side-path="/Pictures">${getIcon('image-file', 16)}<span>Pictures</span></button>
          <div class="exp-side-section">This PC</div>
          <button class="exp-side-item" type="button" data-side-path="/">${getIcon('thispc', 16)}<span>This PC</span></button>
          <button class="exp-side-item" type="button" data-side-path="/">${getIcon('disk', 16)}<span>Local Disk (C:)</span></button>
          <div class="exp-side-section">Other</div>
          <button class="exp-side-item" type="button" data-side-app="recyclebin">${getIcon(state.recycleBin.length ? 'recyclebin-full' : 'recyclebin', 16)}<span>Recycle Bin</span></button>
        </aside>
        <section class="exp-main">
          <div class="exp-tools">
            <button class="exp-tool-btn active" type="button" data-view="grid" aria-label="Grid view">${getIcon('grid-view', 14)} Details</button>
            <button class="exp-tool-btn" type="button" data-view="list" aria-label="List view">${getIcon('list-view', 14)} List</button>
            <span style="width:1px;height:18px;background:var(--subtle-border);margin:0 3px"></span>
            <span style="font-size:10.5px;color:var(--text-secondary)">Sort</span>
            <select class="settings-select" style="height:25px;min-width:105px;font-size:10.5px" data-role="sort" aria-label="Sort files">
              <option value="name">Name</option><option value="modified">Date modified</option><option value="type">Type</option><option value="size">Size</option>
            </select>
            <div class="exp-tool-spacer"></div>
            <button class="exp-tool-btn" type="button" data-action="new-folder">${getIcon('plus', 14)} New folder</button>
            <button class="exp-tool-btn" type="button" data-action="refresh" aria-label="Refresh">${getIcon('refresh', 14)}</button>
          </div>
          <div class="exp-content" data-role="content" tabindex="0" aria-label="Folder contents"></div>
          <div class="exp-status"><span data-role="item-count"></span><span data-role="selection-count"></span><span class="spacer"></span><span>${getIcon('thispc', 13)}</span></div>
        </section>
      </div>
    `;
    const crumbs = $('[data-role="crumbs"]', root);
    const content = $('[data-role="content"]', root);
    const searchInput = $('[data-role="search"]', root);
    const sortSelect = $('[data-role="sort"]', root);
    const itemCount = $('[data-role="item-count"]', root);
    const selectionCount = $('[data-role="selection-count"]', root);

    function navigate(path, push = true) {
      const normalized = FS.normalize(path);
      const node = FS.get(normalized);
      if (!node || node.type !== 'folder') {
        addNotification('File Explorer', 'Location unavailable', 'That folder does not exist.', 'folder');
        return;
      }
      nav.path = normalized;
      nav.search = '';
      searchInput.value = '';
      nav.selected.clear();
      if (push) {
        nav.history = nav.history.slice(0, nav.index + 1);
        if (nav.history[nav.history.length - 1] !== normalized) nav.history.push(normalized);
        nav.index = nav.history.length - 1;
      }
      win.setTitle(normalized === '/' ? 'This PC - File Explorer' : `${node.name} - File Explorer`);
      render();
    }
    win.explorerNavigate = (path) => navigate(path, true);

    function crumbHtml() {
      const parts = FS.parts(nav.path);
      let html = `<button class="crumb" type="button" data-crumb="/">${getIcon('thispc', 13)}<span>This PC</span></button>`;
      let accumulated = '';
      parts.forEach((part) => {
        accumulated += `/${part}`;
        html += `<span class="crumb-sep">›</span><button class="crumb" type="button" data-crumb="${esc(accumulated)}"><span>${esc(part)}</span></button>`;
      });
      return html;
    }
    function items() {
      const list = [...FS.list(nav.path)];
      if (nav.search.trim()) {
        const q = nav.search.toLowerCase();
        return list.filter((node) => node.name.toLowerCase().includes(q));
      }
      return list.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        if (nav.sort === 'modified') return new Date(b.modified) - new Date(a.modified);
        if (nav.sort === 'type') return fileTypeLabel(a).localeCompare(fileTypeLabel(b));
        if (nav.sort === 'size') return nodeSize(b) - nodeSize(a);
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      });
    }
    function itemHtml(node, mode) {
      const path = FS.join(nav.path, node.name);
      const selected = nav.selected.has(path);
      const icon = fileIconName(node);
      if (mode === 'list') {
        return `<div class="exp-list-row ${selected ? 'selected' : ''}" data-item-path="${esc(path)}" draggable="true" role="option" aria-selected="${selected}" tabindex="0">
          <div class="el-name">${getIcon(icon, 18)}<span>${esc(node.name)}</span></div>
          <div class="el-meta">${esc(formatDate(node.modified, 'short'))}</div>
          <div class="el-meta">${esc(fileTypeLabel(node))}</div>
          <div class="el-meta">${node.type === 'folder' ? '' : esc(formatBytes(nodeSize(node)))}</div>
        </div>`;
      }
      return `<div class="exp-item ${selected ? 'selected' : ''}" data-item-path="${esc(path)}" draggable="true" role="option" aria-selected="${selected}" tabindex="0">
        <div class="ei-icon">${getIcon(icon, 40)}</div>
        <div class="ei-name">${esc(node.name)}</div>
      </div>`;
    }
    function render() {
      crumbs.innerHTML = crumbHtml();
      $$('[data-side-path]', root).forEach((item) => item.classList.toggle('active', FS.normalize(item.dataset.sidePath) === nav.path));
      $('[data-nav="back"]', root).disabled = nav.index <= 0;
      $('[data-nav="forward"]', root).disabled = nav.index >= nav.history.length - 1;
      $('[data-nav="up"]', root).disabled = nav.path === '/';
      $$('[data-view]', root).forEach((button) => button.classList.toggle('active', button.dataset.view === nav.view));
      const list = items();
      const current = FS.get(nav.path);
      if (!list.length) {
        content.innerHTML = `<div class="exp-empty">${nav.search ? 'No items match your search.' : 'This folder is empty.'}</div>`;
      } else if (nav.view === 'list') {
        content.innerHTML = `<div class="exp-list">
          <div class="exp-list-header"><span>Name</span><span>Date modified</span><span>Type</span><span>Size</span></div>
          ${list.map((node) => itemHtml(node, 'list')).join('')}
        </div>`;
      } else {
        content.innerHTML = `<div class="exp-grid">${list.map((node) => itemHtml(node, 'grid')).join('')}</div>`;
      }
      itemCount.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
      selectionCount.textContent = nav.selected.size ? `${nav.selected.size} selected` : '';
      const currentLabel = current ? current.name : 'This PC';
      win.setTitle(nav.path === '/' ? 'This PC - File Explorer' : `${currentLabel} - File Explorer`);
      $$('[data-item-path]', content).forEach((item) => {
        item.addEventListener('dragstart', (event) => {
          event.dataTransfer.setData('text/plain', item.dataset.itemPath);
          event.dataTransfer.effectAllowed = 'move';
        });
        item.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') { event.preventDefault(); openItem(item.dataset.itemPath); }
          if (event.key === 'Delete') { event.preventDefault(); deleteItem(item.dataset.itemPath); }
          if (event.key === 'F2') { event.preventDefault(); startRename(item.dataset.itemPath); }
        });
      });
    }
    function updateSelectedClass() {
      $$('[data-item-path]', content).forEach((item) => {
        const isSelected = nav.selected.has(item.dataset.itemPath);
        item.classList.toggle('selected', isSelected);
        item.setAttribute('aria-selected', String(isSelected));
      });
      selectionCount.textContent = nav.selected.size ? `${nav.selected.size} selected` : '';
    }
    function openItem(path) {
      const node = FS.get(path);
      if (!node) return;
      if (node.type === 'folder') { navigate(path); return; }
      const ext = fileExtension(node.name);
      if (['txt', 'md', 'log', 'ini'].includes(ext) || ['js', 'json', 'html', 'css', 'ts', 'py', 'xml'].includes(ext)) {
        openApp('notepad', { path });
      } else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
        openApp('photos', { path });
      } else if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext)) {
        const appId = ['docx', 'doc'].includes(ext) ? 'word' : ['xlsx', 'xls'].includes(ext) ? 'excel' : 'powerpoint';
        if (state.installedApps.includes(appId)) openApp(appId, { path });
        else {
          addNotification('Microsoft Store', 'App required', `Install ${APPS[appId].title} to open ${node.name}.`, 'store');
          openApp('store');
        }
      } else {
        addNotification('File Explorer', 'Cannot open file', `${node.name} cannot be opened in this simulator.`, fileIconName(node));
      }
    }
    function deleteItem(path) {
      const node = FS.get(path);
      if (!node) return;
      FS.remove(path, true);
      nav.selected.delete(path);
      render();
      addNotification('Recycle Bin', 'Item moved to Recycle Bin', node.name, 'recyclebin');
    }
    function startRename(path) {
      const node = FS.get(path);
      const item = $$('[data-item-path]', content).find((el) => el.dataset.itemPath === path);
      if (!node || !item) return;
      if ($('.exp-rename-input', item)) return;
      item.classList.add('renaming');
      const nameEl = $('.ei-name', item) || $('.el-name span', item);
      if (!nameEl) return;
      const oldName = node.name;
      const input = h('input', 'exp-rename-input');
      input.value = oldName;
      input.setAttribute('aria-label', 'New name');
      nameEl.replaceWith(input);
      input.focus();
      input.select();
      let finished = false;
      const finish = (commit) => {
        if (finished) return;
        finished = true;
        const value = input.value.trim();
        if (commit && value && value !== oldName) {
          const result = FS.rename(path, value);
          if (!result) addNotification('File Explorer', 'Rename failed', 'That name cannot be used.', 'folder');
        }
        render();
      };
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { event.preventDefault(); finish(true); }
        if (event.key === 'Escape') { event.preventDefault(); finish(false); }
        event.stopPropagation();
      });
      input.addEventListener('blur', () => finish(true));
    }
    async function createFolder() {
      const name = await promptDialog('New folder', 'Folder name:', 'New folder', 'Create');
      if (name === null) return;
      try {
        FS.createFolder(nav.path, name || 'New folder');
        render();
      } catch (error) { addNotification('File Explorer', 'Could not create folder', error.message, 'folder'); }
    }
    async function createTextFile() {
      try {
        const node = FS.createFile(nav.path, 'New Text Document.txt', '');
        render();
        startRename(FS.join(nav.path, node.name));
      } catch (error) { addNotification('File Explorer', 'Could not create file', error.message, 'text-file'); }
    }
    function showItemMenu(path, x, y) {
      const node = FS.get(path);
      if (!node) return;
      if (!nav.selected.has(path)) { nav.selected.clear(); nav.selected.add(path); updateSelectedClass(); }
      const ext = fileExtension(node.name);
      showContextMenu([
        { label: 'Open', icon: node.type === 'folder' ? 'folder' : fileIconName(node), action: () => openItem(path) },
        ...(node.type === 'file' && ['txt','md','log','js','json','html','css','ts','py'].includes(ext) ? [{ label: 'Open with Notepad', icon: 'notepad', action: () => openApp('notepad', { path }) }] : []),
        '-',
        { label: 'Rename', icon: 'save', shortcut: 'F2', action: () => startRename(path) },
        { label: 'Delete', icon: 'trash', shortcut: 'Del', action: () => deleteItem(path) },
        '-',
        { label: 'Properties', icon: 'info', action: () => showProperties(node, FS.parent(path)) }
      ], x, y);
    }
    function showBlankMenu(x, y) {
      showContextMenu([
        { label: 'View', icon: 'grid-view', children: [
          { label: 'Large icons', checked: false, action: () => { nav.view = 'grid'; render(); } },
          { label: 'List', checked: nav.view === 'list', action: () => { nav.view = 'list'; render(); } },
          '-',
          { label: 'Refresh', icon: 'refresh', action: render }
        ] },
        { label: 'Sort by', icon: 'sort', children: [
          { label: 'Name', checked: nav.sort === 'name', action: () => { nav.sort = 'name'; render(); } },
          { label: 'Date modified', checked: nav.sort === 'modified', action: () => { nav.sort = 'modified'; render(); } },
          { label: 'Type', checked: nav.sort === 'type', action: () => { nav.sort = 'type'; render(); } },
          { label: 'Size', checked: nav.sort === 'size', action: () => { nav.sort = 'size'; render(); } }
        ] },
        '-',
        { label: 'New', icon: 'plus', children: [
          { label: 'Folder', icon: 'folder', action: createFolder },
          { label: 'Text Document', icon: 'text-file', action: createTextFile }
        ] },
        '-',
        { label: 'Paste', icon: 'paste', shortcut: 'Ctrl+V', disabled: true },
        { label: 'Refresh', icon: 'refresh', action: render },
        '-',
        { label: 'Properties', icon: 'info', action: () => showProperties(FS.get(nav.path), nav.path) }
      ], x, y);
    }

    root.addEventListener('click', (event) => {
      const navButton = event.target.closest('[data-nav]');
      if (navButton) {
        const action = navButton.dataset.nav;
        if (action === 'back' && nav.index > 0) { nav.index--; nav.path = nav.history[nav.index]; nav.selected.clear(); render(); }
        if (action === 'forward' && nav.index < nav.history.length - 1) { nav.index++; nav.path = nav.history[nav.index]; nav.selected.clear(); render(); }
        if (action === 'up') navigate(FS.parent(nav.path));
        return;
      }
      const crumb = event.target.closest('[data-crumb]');
      if (crumb) { navigate(crumb.dataset.crumb); return; }
      const side = event.target.closest('[data-side-path]');
      if (side) { navigate(side.dataset.sidePath); return; }
      if (event.target.closest('[data-side-app="recyclebin"]')) { openApp('recyclebin'); return; }
      const viewButton = event.target.closest('[data-view]');
      if (viewButton) { nav.view = viewButton.dataset.view; render(); return; }
      const actionButton = event.target.closest('[data-action]');
      if (actionButton) {
        if (actionButton.dataset.action === 'new-folder') createFolder();
        else if (actionButton.dataset.action === 'refresh') { render(); addNotification('File Explorer', 'Refreshed', 'Folder contents are up to date.', 'refresh'); }
        return;
      }
      const item = event.target.closest('[data-item-path]');
      if (item) {
        const path = item.dataset.itemPath;
        if (event.ctrlKey) {
          if (nav.selected.has(path)) nav.selected.delete(path);
          else nav.selected.add(path);
        } else {
          nav.selected.clear();
          nav.selected.add(path);
        }
        updateSelectedClass();
        return;
      }
      if (event.target === content || event.target.closest('.exp-grid, .exp-list')) {
        nav.selected.clear();
        updateSelectedClass();
      }
    });
    root.addEventListener('dblclick', (event) => {
      const item = event.target.closest('[data-item-path]');
      if (item) openItem(item.dataset.itemPath);
    });
    root.addEventListener('contextmenu', (event) => {
      const item = event.target.closest('[data-item-path]');
      if (item) { event.preventDefault(); showItemMenu(item.dataset.itemPath, event.clientX, event.clientY); return; }
      if (event.target.closest('[data-role="content"]')) { event.preventDefault(); showBlankMenu(event.clientX, event.clientY); }
    });
    searchInput.addEventListener('input', () => { nav.search = searchInput.value; render(); });
    sortSelect.addEventListener('change', () => { nav.sort = sortSelect.value; render(); });
    $$('[data-side-path]', root).forEach((side) => {
      side.addEventListener('dragover', (event) => { event.preventDefault(); side.classList.add('drag-over'); event.dataTransfer.dropEffect = 'move'; });
      side.addEventListener('dragleave', () => side.classList.remove('drag-over'));
      side.addEventListener('drop', (event) => {
        event.preventDefault();
        side.classList.remove('drag-over');
        const source = event.dataTransfer.getData('text/plain');
        if (source && FS.move(source, side.dataset.sidePath)) {
          if (nav.selected.has(source)) nav.selected.delete(source);
          render();
          addNotification('File Explorer', 'Item moved', `Moved to ${FS.get(side.dataset.sidePath)?.name || 'This PC'}.`, 'folder');
        }
      });
    });
    content.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('[data-item-path]')) return;
      const target = event.target.closest('[data-role="content"]') || event.target;
      if (target !== content && !event.target.closest('.exp-grid, .exp-list, .exp-empty')) return;
      const rect = content.getBoundingClientRect();
      const startX = event.clientX - rect.left + content.scrollLeft;
      const startY = event.clientY - rect.top + content.scrollTop;
      const box = h('div', 'exp-selection-box');
      content.appendChild(box);
      let active = false;
      const move = (moveEvent) => {
        const x = moveEvent.clientX - rect.left + content.scrollLeft;
        const y = moveEvent.clientY - rect.top + content.scrollTop;
        if (!active && Math.abs(x - startX) + Math.abs(y - startY) < 4) return;
        active = true;
        const left = Math.min(startX, x), top = Math.min(startY, y);
        const right = Math.max(startX, x), bottom = Math.max(startY, y);
        box.style.left = `${left}px`; box.style.top = `${top}px`;
        box.style.width = `${right - left}px`; box.style.height = `${bottom - top}px`;
        nav.selected.clear();
        $$('[data-item-path]', content).forEach((item) => {
          const ir = item.getBoundingClientRect();
          const iLeft = ir.left - rect.left + content.scrollLeft;
          const iTop = ir.top - rect.top + content.scrollTop;
          if (iLeft < right && iLeft + ir.width > left && iTop < bottom && iTop + ir.height > top) nav.selected.add(item.dataset.itemPath);
        });
        updateSelectedClass();
      };
      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        box.remove();
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up, { once: true });
    });

    const oldExplore = openApp;
    if (win.explorerNavigate) navigate(nav.path, true);
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: MICROSOFT EDGE — tabs, start page and iframe browsing
// ═══════════════════════════════════════
APPS.edge = {
  title: 'Microsoft Edge',
  icon: 'edge',
  width: 1100,
  height: 700,
  minWidth: 620,
  minHeight: 420,
  onReopen(win, params) {
    if (params.url && win.edgeOpenUrl) win.edgeOpenUrl(params.url);
  },
  build({ win, params }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root edge');
    win.body.appendChild(root);
    const tabs = [];
    let activeId = null;
    let tabCounter = 0;
    function newTab(url = null) {
      tabCounter++;
      const tab = { id: uid('tab'), title: 'New tab', url: null, mode: 'start', history: [], index: -1, loading: false };
      tabs.push(tab);
      activeId = tab.id;
      renderTabs();
      if (url) navigate(tab, url);
      else renderContent(tab);
      return tab;
    }
    const activeTab = () => tabs.find((tab) => tab.id === activeId) || tabs[0];
    function renderTabs() {
      const bar = $('.edge-tabbar', root);
      if (!bar) return;
      bar.innerHTML = `${tabs.map((tab) => `<button class="edge-tab ${tab.id === activeId ? 'active' : ''}" type="button" data-edge-tab="${tab.id}">
        <span class="et-icon">${getIcon('edge', 14)}</span><span class="et-title">${esc(tab.title)}</span>
        <span class="et-close" data-edge-close="${tab.id}" role="button" aria-label="Close tab">${getIcon('close', 8)}</span>
      </button>`).join('')}<button class="edge-newtab" type="button" data-edge-newtab aria-label="New tab">${getIcon('plus', 13)}</button>`;
    }
    function normalizeUrl(input) {
      const text = input.trim();
      if (!text) return null;
      if (/^[a-z]+:\/\//i.test(text)) return text;
      if (text.includes('.') && !text.includes(' ')) return `https://${text}`;
      return `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    }
    function pushHistory(tab, url) {
      tab.history = tab.history.slice(0, tab.index + 1);
      tab.history.push(url);
      tab.index = tab.history.length - 1;
    }
    function navigate(tab, input, addHistory = true) {
      const url = normalizeUrl(input);
      if (!url) return;
      tab.url = url;
      tab.mode = 'web';
      tab.title = url.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 34);
      if (addHistory) pushHistory(tab, url);
      renderTabs();
      renderContent(tab);
      win.setTitle(`${tab.title} - Microsoft Edge`);
    }
    function startPage() {
      return `<div class="edge-start">
        <div class="edge-start-inner">
          <div class="edge-greeting">Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, <strong>User</strong></div>
          <form class="edge-search" data-edge-search-form>
            ${getIcon('search', 17)}
            <input type="text" placeholder="Search the web" aria-label="Search the web" data-edge-search>
          </form>
          <div class="edge-links">
            <button class="edge-link" type="button" data-edge-link="https://github.com"><span class="el-tile" style="background:#24292e">${getIcon('github', 27)}</span><span>GitHub</span></button>
            <button class="edge-link" type="button" data-edge-link="https://stackoverflow.com"><span class="el-tile" style="background:#f48024;color:#fff">${getIcon('code-file', 27)}</span><span>Stack Overflow</span></button>
            <button class="edge-link" type="button" data-edge-link="https://youtube.com"><span class="el-tile" style="background:#ff0000;color:#fff">${getIcon('play', 27)}</span><span>YouTube</span></button>
            <button class="edge-link" type="button" data-edge-link="https://bing.com"><span class="el-tile" style="background:#008373;color:#fff">${getIcon('search', 27)}</span><span>Bing</span></button>
            <button class="edge-link" type="button" data-edge-link="https://wikipedia.org"><span class="el-tile" style="background:#f6f6f6">${getIcon('news', 27)}</span><span>Wikipedia</span></button>
            <button class="edge-link" type="button" data-edge-link="https://reddit.com"><span class="el-tile" style="background:#ff4500;color:#fff">${getIcon('widgets', 27)}</span><span>Reddit</span></button>
          </div>
          <div class="edge-news-title"><span>Trending on the web</span><span style="font-size:10px;color:#777">See all</span></div>
          <div class="edge-news-grid">
            <button class="edge-news-card" type="button" data-edge-link="https://news.microsoft.com"><div class="edge-news-img"></div><div class="edge-news-body"><strong>Windows 11 brings a refreshed, calmer desktop experience</strong><span>Microsoft News · 2h ago</span></div></button>
            <button class="edge-news-card" type="button" data-edge-link="https://www.theverge.com"><div class="edge-news-img n2"></div><div class="edge-news-body"><strong>The best productivity apps to try this month</strong><span>The Verge · 4h ago</span></div></button>
            <button class="edge-news-card" type="button" data-edge-link="https://www.wired.com"><div class="edge-news-img n3"></div><div class="edge-news-body"><strong>How designers are rethinking the desktop</strong><span>Wired · 7h ago</span></div></button>
          </div>
        </div>
      </div>`;
    }
    function renderShell() {
      root.innerHTML = `
        <div class="edge-tabbar"></div>
        <div class="edge-toolbar">
          <button class="edge-tool" type="button" data-edge-nav="back" aria-label="Back">${getIcon('back', 14)}</button>
          <button class="edge-tool" type="button" data-edge-nav="forward" aria-label="Forward">${getIcon('forward', 14)}</button>
          <button class="edge-tool" type="button" data-edge-nav="reload" aria-label="Reload">${getIcon('refresh', 14)}</button>
          <button class="edge-tool" type="button" data-edge-nav="home" aria-label="Home">${getIcon('home', 14)}</button>
          <div class="edge-url">${getIcon('search', 13)}<input data-edge-address type="text" placeholder="Search or enter web address" aria-label="Address bar"></div>
          <button class="edge-tool" type="button" data-edge-nav="bookmark" aria-label="Add bookmark">${getIcon('star', 14)}</button>
          <button class="edge-tool" type="button" data-edge-nav="menu" aria-label="Settings and more">${getIcon('settings', 14)}</button>
        </div>
        <div class="edge-fav-bar">
          <button class="edge-fav" type="button" data-edge-link="https://github.com"><span class="efav-dot"></span>GitHub</button>
          <button class="edge-fav" type="button" data-edge-link="https://stackoverflow.com"><span class="efav-dot" style="background:#f48024"></span>Stack Overflow</button>
          <button class="edge-fav" type="button" data-edge-link="https://youtube.com"><span class="efav-dot" style="background:#ff0000"></span>YouTube</button>
          <button class="edge-fav" type="button" data-edge-link="https://bing.com"><span class="efav-dot" style="background:#008373"></span>Bing</button>
          <span style="margin-left:auto;font-size:10px;color:var(--text-secondary)" data-edge-status></span>
        </div>
        <div class="edge-content" data-edge-content></div>
      `;
      renderTabs();
      renderContent(activeTab());
      const address = $('[data-edge-address]', root);
      address.value = 'edge://newtab';
      address.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const tab = activeTab();
          navigate(tab, address.value);
        }
      });
    }
    function renderContent(tab) {
      if (!tab) return;
      const content = $('[data-edge-content]', root);
      if (!content) return;
      const address = $('[data-edge-address]', root);
      const back = $('[data-edge-nav="back"]', root);
      const forward = $('[data-edge-nav="forward"]', root);
      if (back) back.disabled = tab.index <= 0;
      if (forward) forward.disabled = tab.index >= tab.history.length - 1;
      if (address) address.value = tab.mode === 'start' ? 'edge://newtab' : tab.url || '';
      $('[data-edge-status]', root).textContent = tab.mode === 'start' ? 'Start page' : 'Secure connection';
      if (tab.mode === 'start') {
        content.innerHTML = startPage();
        const form = $('[data-edge-search-form]', content);
        const search = $('[data-edge-search]', content);
        if (form) form.addEventListener('submit', (event) => { event.preventDefault(); navigate(tab, search.value); });
        $$('[data-edge-link]', content).forEach((button) => button.addEventListener('click', () => navigate(tab, button.dataset.edgeLink)));
        return;
      }
      content.innerHTML = `<div class="edge-loading"></div>`;
      const loading = $('.edge-loading', content);
      let finished = false;
      const frame = document.createElement('iframe');
      frame.className = 'edge-frame';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
      frame.setAttribute('referrerpolicy', 'no-referrer');
      frame.title = tab.title;
      frame.src = tab.url;
      content.appendChild(frame);
      const errorHtml = `<div class="edge-error"><div class="ee-face">:(</div><h3>This site refused to connect in simulator mode</h3><p>${esc(tab.url)} could not be displayed because the site blocked embedding. Try another URL or use the Start page.</p><button class="btn primary" type="button" data-edge-home>Go to start page</button></div>`;
      const timer = setTimeout(() => {
        if (finished) return;
        loading?.remove();
        frame.remove();
        content.insertAdjacentHTML('beforeend', errorHtml);
        const home = $('[data-edge-home]', content);
        if (home) home.addEventListener('click', () => { tab.mode = 'start'; tab.url = null; tab.title = 'New tab'; renderTabs(); renderContent(tab); });
      }, 3800);
      frame.addEventListener('load', () => {
        finished = true;
        clearTimeout(timer);
        loading?.remove();
      });
      frame.addEventListener('error', () => {
        finished = true;
        clearTimeout(timer);
        loading?.remove();
        frame.remove();
        content.insertAdjacentHTML('beforeend', errorHtml);
      });
    }
    win.edgeOpenUrl = (url) => {
      const tab = activeTab();
      if (tab) navigate(tab, url);
    };
    root.addEventListener('click', (event) => {
      const tabButton = event.target.closest('[data-edge-tab]');
      if (tabButton && !event.target.closest('[data-edge-close]')) {
        activeId = tabButton.dataset.edgeTab;
        renderTabs();
        renderContent(activeTab());
        return;
      }
      const close = event.target.closest('[data-edge-close]');
      if (close) {
        event.stopPropagation();
        const id = close.dataset.edgeClose;
        const index = tabs.findIndex((tab) => tab.id === id);
        if (tabs.length === 1) {
          tabs[0] = { id: uid('tab'), title: 'New tab', url: null, mode: 'start', history: [], index: -1, loading: false };
          activeId = tabs[0].id;
        } else {
          tabs.splice(index, 1);
          if (activeId === id) activeId = tabs[Math.max(0, index - 1)].id;
        }
        renderTabs();
        renderContent(activeTab());
        return;
      }
      if (event.target.closest('[data-edge-newtab]')) { newTab(); return; }
      const nav = event.target.closest('[data-edge-nav]');
      if (nav) {
        const tab = activeTab();
        const action = nav.dataset.edgeNav;
        if (action === 'back' && tab.index > 0) {
          tab.index--;
          navigate(tab, tab.history[tab.index], false);
        } else if (action === 'forward' && tab.index < tab.history.length - 1) {
          tab.index++;
          navigate(tab, tab.history[tab.index], false);
        } else if (action === 'reload') {
          if (tab.mode === 'web') renderContent(tab);
          else renderContent(tab);
        } else if (action === 'home') {
          tab.mode = 'start'; tab.url = null; tab.title = 'New tab'; renderTabs(); renderContent(tab);
        } else if (action === 'bookmark') {
          addNotification('Microsoft Edge', 'Bookmark added', tab.mode === 'start' ? 'New tab page bookmarked' : tab.url, 'star');
        } else if (action === 'menu') {
          showContextMenu([
            { label: 'New tab', icon: 'plus', action: () => newTab() },
            { label: 'Reload', icon: 'refresh', action: () => renderContent(activeTab()) },
            '-',
            { label: 'Settings', icon: 'settings', action: () => openApp('settings') },
            { label: 'About Microsoft Edge', icon: 'info', action: () => alertDialog('About Microsoft Edge', 'Microsoft Edge Simulator — Version 131.0 (Web Edition)') }
          ], event.clientX, event.clientY);
        }
        return;
      }
      const link = event.target.closest('[data-edge-link]');
      if (link) { navigate(activeTab(), link.dataset.edgeLink); return; }
    });
    renderShell();
    newTab(params.url || null);
    if (!params.url) {
      const tab = activeTab();
      tab.mode = 'start';
      tab.url = null;
      renderTabs();
      renderContent(tab);
    }
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: SETTINGS — system, devices, personalization and accounts
// ═══════════════════════════════════════
const SETTINGS_PAGES = [
  { id: 'system', label: 'System', icon: 'thispc' },
  { id: 'bluetooth', label: 'Bluetooth & devices', icon: 'bluetooth' },
  { id: 'network', label: 'Network & internet', icon: 'wifi' },
  { id: 'personalization', label: 'Personalization', icon: 'paint' },
  { id: 'apps', label: 'Apps', icon: 'grid-view' },
  { id: 'accounts', label: 'Accounts', icon: 'user' },
  { id: 'time', label: 'Time & language', icon: 'clock' },
  { id: 'gaming', label: 'Gaming', icon: 'play' },
  { id: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
  { id: 'privacy', label: 'Privacy & security', icon: 'shield' },
  { id: 'update', label: 'Windows Update', icon: 'refresh' },
  { id: 'about', label: 'About', icon: 'info' }
];
const SETTINGS_INDEX = [
  { page: 'system', label: 'Display', desc: 'Brightness, night light and scale', icon: 'thispc' },
  { page: 'system', label: 'Sound', desc: 'Volume, output device and sound effects', icon: 'volume' },
  { page: 'system', label: 'Power & battery', desc: 'Battery saver and power mode', icon: 'battery' },
  { page: 'system', label: 'Storage', desc: 'Disk usage and temporary files', icon: 'disk' },
  { page: 'bluetooth', label: 'Bluetooth', desc: 'Pair mice, keyboards and other devices', icon: 'bluetooth' },
  { page: 'network', label: 'Wi-Fi', desc: 'Connect to wireless networks', icon: 'wifi' },
  { page: 'network', label: 'Airplane mode', desc: 'Disable wireless communication', icon: 'airplane' },
  { page: 'personalization', label: 'Background', desc: 'Wallpaper and desktop background', icon: 'image-file' },
  { page: 'personalization', label: 'Colors', desc: 'Theme and accent color', icon: 'color-palette' },
  { page: 'personalization', label: 'Taskbar', desc: 'Taskbar items and system tray', icon: 'grid-view' },
  { page: 'apps', label: 'Installed apps', desc: 'Manage apps installed on your PC', icon: 'store' },
  { page: 'accounts', label: 'Your account', desc: 'Local account, sign-in and family', icon: 'user' },
  { page: 'time', label: 'Date & time', desc: 'Clock, time zone and synchronization', icon: 'clock' },
  { page: 'gaming', label: 'Game Bar', desc: 'Captures, game mode and controller', icon: 'play' },
  { page: 'accessibility', label: 'Text size', desc: 'Make text and apps easier to see', icon: 'accessibility' },
  { page: 'privacy', label: 'Privacy', desc: 'Location, camera, microphone and diagnostics', icon: 'shield' },
  { page: 'update', label: 'Windows Update', desc: 'Check for updates and view history', icon: 'refresh' },
  { page: 'about', label: 'About this PC', desc: 'Device specifications and Windows edition', icon: 'info' }
];

function stateValue(path, fallback = false) {
  const result = String(path).split('.').reduce((value, key) => value == null ? undefined : value[key], state);
  return result === undefined ? fallback : result;
}
function setStateValue(path, value) {
  const parts = String(path).split('.');
  let target = state;
  parts.slice(0, -1).forEach((part) => {
    if (typeof target[part] !== 'object' || target[part] === null) target[part] = {};
    target = target[part];
  });
  target[parts[parts.length - 1]] = value;
  saveState();
}

APPS.settings = {
  title: 'Settings',
  icon: 'settings',
  width: 980,
  height: 690,
  minWidth: 680,
  minHeight: 470,
  onReopen(win, params) {
    if (win.settingsNavigate) {
      if (params.page) win.settingsNavigate(params.page);
      if (params.search) win.settingsSearch(params.search);
    }
  },
  build({ win, params, cleanup }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root settings-app');
    win.body.appendChild(root);
    let activePage = SETTINGS_PAGES.some((page) => page.id === params.page) ? params.page : 'system';
    let query = '';
    let searchSelection = 0;

    const row = (icon, title, desc, control = '') => `<div class="settings-row">
      <span class="sr-icon">${getIcon(icon, 17)}</span>
      <div class="sr-label"><strong>${esc(title)}</strong>${desc ? `<span>${esc(desc)}</span>` : ''}</div>
      ${control ? `<div class="sr-control">${control}</div>` : ''}
    </div>`;
    const toggle = (key, on, label) => `<button class="toggle-switch ${on ? 'on' : ''}" type="button" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}" data-setting-toggle="${esc(key)}"></button>`;
    const button = (label, action, primary = false) => `<button class="btn ${primary ? 'primary' : ''}" type="button" data-settings-action="${esc(action)}">${esc(label)}</button>`;
    const appRow = (appId, description) => {
      const def = APPS[appId];
      if (!def) return '';
      const installed = state.installedApps.includes(appId);
      return `<div class="settings-list-row">
        <span class="slr-icon">${getIcon(def.icon, 30)}</span>
        <div class="slr-meta"><strong>${esc(def.title)}</strong><span>${esc(description)}</span></div>
        <div class="sr-control">${installed ? `<span style="font-size:10px;color:var(--text-secondary)">Installed</span>` : ''}<button class="btn" type="button" data-open-app="${esc(appId)}">Open</button></div>
      </div>`;
    };
    const togglePage = (key, label, description, icon = 'settings') => row(icon, label, description, toggle(key, !!stateValue(key), label));

    function systemPage() {
      const used = (FS.root().children || []).reduce((sum, node) => sum + nodeSize(node), 0);
      return `<h1>System</h1>
        <div class="settings-card">
          ${row('thispc', state.deviceName || 'DESKTOP-SIM11', 'Windows 11 Pro · Local account', button('Rename', 'rename-pc'))}
          ${row('info', 'Windows specifications', 'Version 24H2 · Build 26100.1742', button('Copy', 'copy-specs'))}
        </div>
        <h2>Display</h2>
        <div class="settings-card">
          ${row('brightness', 'Brightness', `Adjust the brightness of the built-in display — ${state.brightness}%`, `<input class="settings-slider" type="range" min="30" max="100" value="${state.brightness}" data-setting-range="brightness" aria-label="Brightness"><output class="range-output" data-range-value="brightness">${state.brightness}%</output>`)}
          ${togglePage('nightLight', 'Night light', 'Use warmer colors to help block blue light', 'nightlight')}
          ${row('thispc', 'Display scale', 'Change the size of text, apps and other items', `<select class="settings-select" data-setting-select="scale" aria-label="Display scale"><option value="100" ${state.scale === 100 ? 'selected' : ''}>100%</option><option value="125" ${state.scale === 125 ? 'selected' : ''}>125%</option><option value="150" ${state.scale === 150 ? 'selected' : ''}>150%</option></select>`)}
          ${togglePage('showDesktopIcons', 'Show desktop icons', 'Display shortcuts on the desktop', 'grid-view')}
        </div>
        <h2>Sound</h2>
        <div class="settings-card">
          ${row('volume', 'Volume', `Speakers (Realtek Audio) — ${state.volume}%`, `<input class="settings-slider" type="range" min="0" max="100" value="${state.volume}" data-setting-range="volume" aria-label="Volume"><output class="range-output" data-range-value="volume">${state.volume}%</output>`)}
          ${togglePage('soundEffects', 'System sounds', 'Play sounds for notifications and startup', 'notification')}
        </div>
        <h2>Power &amp; battery</h2>
        <div class="settings-card">
          ${togglePage('batterySaver', 'Battery saver', 'Reduce power usage and extend battery life', 'battery')}
          ${row('battery', 'Battery level', '89% — about 5 hours 21 minutes remaining', '<span class="status-pill">Balanced</span>')}
        </div>
        <h2>Storage</h2>
        <div class="settings-card">
          ${row('disk', 'Local Disk (C:)', `${formatBytes(used)} of 256 GB used by the virtual file system`, button('Open Explorer', 'open-explorer'))}
        </div>`;
    }
    function bluetoothPage() {
      return `<h1>Bluetooth &amp; devices</h1>
        <div class="settings-card">${togglePage('bluetooth', 'Bluetooth', state.bluetooth ? 'Discoverable as DESKTOP-SIM11' : 'Bluetooth is turned off', 'bluetooth')}</div>
        <h2>Devices</h2>
        <div class="settings-card">
          ${row('thispc', 'Surface Precision Mouse', 'Connected · 74%', button('Remove', 'remove-device'))}
          ${row('volume', 'WH-1000XM5', 'Paired · Not connected', button('Connect', 'connect-device'))}
          ${row('terminal', 'USB Keyboard', 'Connected', '')}
          ${row('plus', 'Add device', 'Pair a new mouse, keyboard or audio device', button('Add', 'add-device'))}
        </div>
        <h2>Related settings</h2>
        <div class="settings-card">
          ${row('play', 'AutoPlay', 'Choose what happens when you connect a device', button('Manage', 'autoplay'))}
          ${row('info', 'More Bluetooth settings', 'Discovery, notifications and COM ports', button('Open', 'bluetooth-more'))}
        </div>`;
    }
    function networkPage() {
      return `<h1>Network &amp; internet</h1>
        <div class="settings-card">
          ${togglePage('wifi', 'Wi-Fi', state.wifi && !state.airplane ? 'Connected to HOME-5G · Secured' : 'Wi-Fi is turned off', 'wifi')}
          ${togglePage('airplane', 'Airplane mode', state.airplane ? 'Wireless communication is disabled' : 'Off', 'airplane')}
        </div>
        <h2>Wi-Fi properties</h2>
        <div class="settings-card">
          <div class="spec-grid" style="padding:8px 0">
            <div><span>Network name</span>HOME-5G</div>
            <div><span>Connection type</span>Wi-Fi 6 (802.11ax)</div>
            <div><span>IPv4 address</span>192.168.1.42</div>
            <div><span>Signal strength</span>Excellent</div>
            <div><span>Link speed</span>866 Mbps</div>
            <div><span>Security</span>WPA3-Personal</div>
          </div>
        </div>
        <h2>More settings</h2>
        <div class="settings-card">
          ${row('wifi', 'Manage known networks', 'Forget, share or change network properties', button('Manage', 'known-networks'))}
          ${row('info', 'Advanced network settings', 'View adapters and network reset options', button('Open', 'network-advanced'))}
          ${row('shield', 'Proxy', 'Configure a proxy server for this connection', button('Set up', 'proxy'))}
        </div>`;
    }
    function personalizationPage() {
      return `<h1>Personalization</h1>
        <h2>Background</h2>
        <div class="settings-card" style="padding:14px 16px">
          <div class="wallpaper-grid">
            ${[0,1,2,3,4].map((index) => `<button class="wallpaper-thumb wp-${index} ${state.wallpaper === index ? 'active' : ''}" type="button" data-wallpaper-choice="${index}" aria-label="Wallpaper ${index + 1}">${state.wallpaper === index ? `<span class="wt-check">${getIcon('check', 10)}</span>` : ''}</button>`).join('')}
          </div>
          <div style="font-size:10.5px;color:var(--text-secondary);margin-top:10px">Choose a background for your desktop. Wallpaper choice is saved automatically.</div>
        </div>
        <h2>Colors</h2>
        <div class="settings-radio-row">
          <button class="theme-option ${state.theme === 'light' ? 'active' : ''}" type="button" data-theme-choice="light"><div class="theme-preview"><div class="tp-side"></div><div class="tp-main"><div class="tp-line"></div><div class="tp-line" style="width:70%"></div><div class="tp-line" style="width:45%"></div></div></div><strong>Light</strong><span>Bright surfaces and dark text</span></button>
          <button class="theme-option ${state.theme === 'dark' ? 'active' : ''}" type="button" data-theme-choice="dark"><div class="theme-preview dark"><div class="tp-side"></div><div class="tp-main"><div class="tp-line"></div><div class="tp-line" style="width:70%"></div><div class="tp-line" style="width:45%"></div></div></div><strong>Dark</strong><span>Dark surfaces and light text</span></button>
        </div>
        <div class="settings-card" style="padding:14px 16px">
          <div style="font-size:11px;margin-bottom:10px">Accent color</div>
          <div class="accent-grid">
            ${ACCENTS.map((accent) => `<button class="accent-swatch ${state.accent.toLowerCase() === accent.value.toLowerCase() ? 'active' : ''}" type="button" style="background:${accent.value}" data-accent-choice="${accent.value}" title="${esc(accent.name)}" aria-label="${esc(accent.name)}">${state.accent.toLowerCase() === accent.value.toLowerCase() ? getIcon('check', 13) : ''}</button>`).join('')}
          </div>
        </div>
        <h2>Desktop &amp; taskbar</h2>
        <div class="settings-card">
          ${row('grid-view', 'Desktop icon size', 'Choose how large desktop shortcuts appear', `<select class="settings-select" data-setting-select="iconSize" aria-label="Desktop icon size"><option value="48" ${state.iconSize === 48 ? 'selected' : ''}>Large</option><option value="40" ${state.iconSize === 40 ? 'selected' : ''}>Medium</option><option value="32" ${state.iconSize === 32 ? 'selected' : ''}>Small</option></select>`)}
          ${togglePage('taskbar.weather', 'Weather', 'Show weather on the taskbar', 'sun')}
          ${togglePage('taskbar.search', 'Search', 'Show the search button on the taskbar', 'search')}
          ${togglePage('taskbar.taskview', 'Task View', 'Show the Task View button on the taskbar', 'taskview')}
          ${togglePage('taskbar.widgets', 'Widgets', 'Show the widgets button on the taskbar', 'widgets')}
        </div>`;
    }
    function appsPage() {
      const storeApps = state.installedApps.map((id) => APPS[id]).filter(Boolean);
      return `<h1>Apps</h1>
        <div class="settings-card">${row('store', 'Microsoft Store', 'Install apps, games and updates', button('Open Store', 'open-store', true))}</div>
        <h2>Installed apps</h2>
        <div class="settings-card">
          ${APPS.explorer ? appRow('explorer', 'File manager · System app') : ''}
          ${APPS.edge ? appRow('edge', 'Web browser · System app') : ''}
          ${APPS.notepad ? appRow('notepad', 'Text editor · System app') : ''}
          ${APPS.calculator ? appRow('calculator', 'Calculator · System app') : ''}
          ${APPS.paint ? appRow('paint', 'Drawing and creativity · System app') : ''}
          ${APPS.terminal ? appRow('terminal', 'Command line · System app') : ''}
          ${APPS.vscode ? appRow('vscode', 'Code editor · System app') : ''}
          ${storeApps.map((def) => appRow(Object.keys(APPS).find((key) => APPS[key] === def), 'Installed from Microsoft Store')).join('')}
        </div>
        <h2>App settings</h2>
        <div class="settings-card">
          ${row('download', 'App install location', 'Local Disk (C:)', '<span style="font-size:11px;color:var(--text-secondary)">256 GB available</span>')}
          ${row('refresh', 'App updates', 'Automatically keep apps up to date', toggle('autoAppUpdates', stateValue('autoAppUpdates', true), 'App updates'))}
        </div>`;
    }
    function accountsPage() {
      return `<h1>Accounts</h1>
        <div class="settings-card" style="padding:18px 16px">
          <div class="settings-user" style="padding:0 0 14px">
            <span class="user-avatar" style="width:58px;height:58px">${getIcon('user', 29)}</span>
            <div><strong style="font-size:16px">User</strong><span>Local account · Administrator</span></div>
            <span style="margin-left:auto" class="status-pill">Signed in</span>
          </div>
          <div style="display:flex;gap:8px">${button('Lock', 'lock')}${button('Sign out', 'signout')}</div>
        </div>
        <h2>Account settings</h2>
        <div class="settings-card">
          ${row('user', 'Your info', 'Profile picture, name and account type', button('Manage', 'account-info'))}
          ${row('lock', 'Sign-in options', 'Windows Hello, PIN and security keys', button('Open', 'signin-options'))}
          ${row('shield', 'Windows Backup', 'Keep your files and settings backed up', button('Set up', 'backup'))}
        </div>
        <h2>Family &amp; other users</h2>
        <div class="settings-card">
          ${row('user', 'Add account', 'Create a local account for another person', button('Add', 'add-account'))}
          ${row('shield', 'Family options', 'Manage screen time, content filters and spending', button('Manage', 'family'))}
        </div>`;
    }
    function timePage() {
      const now = new Date();
      return `<h1>Time &amp; language</h1>
        <div class="settings-card" style="padding:16px">
          <div style="font-size:31px;font-weight:300">${esc(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }))}</div>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:3px">${esc(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))}</div>
        </div>
        <div class="settings-card">
          ${row('clock', 'Set time automatically', 'Use the network time server', toggle('autoTime', stateValue('autoTime', true), 'Set time automatically'))}
          ${row('clock', 'Time zone', 'Automatic time zone', `<select class="settings-select" data-setting-select="timezone" aria-label="Time zone"><option value="-8">(UTC-08:00) Pacific Time</option><option value="-5">(UTC-05:00) Eastern Time</option><option value="0">(UTC+00:00) London</option><option value="1">(UTC+01:00) Paris</option></select>`)}
          ${row('refresh', 'Sync now', `Last successful synchronization: ${formatDate(now, 'datetime')}`, button('Sync', 'sync-time'))}
        </div>
        <h2>Language &amp; region</h2>
        <div class="settings-card">
          ${row('translator', 'Windows display language', 'English (United States)', button('Add', 'language'))}
          ${row('calendar', 'Regional format', 'English (United States)', button('Change', 'region'))}
        </div>`;
    }
    function gamingPage() {
      return `<h1>Gaming</h1>
        <div class="settings-card">
          ${togglePage('gameBar', 'Xbox Game Bar', 'Open the game bar with Win+G', 'play')}
          ${togglePage('gameMode', 'Game Mode', 'Prioritize games for a smoother experience', 'cpu')}
          ${togglePage('backgroundRecording', 'Record what happened', 'Capture the last 30 seconds of gameplay', 'video-file')}
        </div>
        <h2>Captures</h2>
        <div class="settings-card">
          ${row('folder-image', 'Capture location', 'C:\\Users\\User\\Videos\\Captures', button('Open', 'open-captures'))}
          ${row('play', 'Record audio', 'Record game audio and microphone', toggle('captureAudio', stateValue('captureAudio', true), 'Record audio'))}
        </div>
        <h2>Related</h2>
        <div class="settings-card">
          ${row('store', 'Xbox Game Pass', 'Discover and play new games', button('Open Store', 'open-store'))}
          ${row('taskmanager', 'Game performance', 'See how games use CPU, GPU and memory', button('Task Manager', 'open-taskmanager'))}
        </div>`;
    }
    function accessibilityPage() {
      return `<h1>Accessibility</h1>
        <h2>Vision</h2>
        <div class="settings-card">
          ${row('thispc', 'Text size', 'Make text larger throughout Windows', `<input class="settings-slider" type="range" min="100" max="150" step="5" value="${state.scale}" data-setting-range="scale" aria-label="Text size"><output class="range-output" data-range-value="scale">${state.scale}%</output>`)}
          ${togglePage('nightLight', 'Night light', 'Use warmer colors to reduce eye strain', 'nightlight')}
          ${row('accessibility', 'Visual effects', 'Transparency and animation effects', toggle('visualEffects', stateValue('visualEffects', true), 'Visual effects'))}
        </div>
        <h2>Interaction</h2>
        <div class="settings-card">
          ${row('clock', 'Cursor blink rate', 'Adjust how quickly the cursor blinks', '<span style="font-size:11px;color:var(--text-secondary)">Default</span>')}
          ${togglePage('stickyKeys', 'Sticky keys', 'Press shortcut keys one at a time', 'keyboard')}
          ${togglePage('textCursor', 'Text cursor indicator', 'Make the text cursor easier to see', 'accessibility')}
        </div>
        <h2>Audio</h2>
        <div class="settings-card">
          ${row('volume', 'Mono audio', 'Combine left and right channels', toggle('monoAudio', stateValue('monoAudio', false), 'Mono audio'))}
          ${row('notification', 'Sound notifications', 'Show visual notifications for sounds', toggle('visualNotifications', stateValue('visualNotifications', false), 'Visual notifications'))}
        </div>`;
    }
    function privacyPage() {
      return `<h1>Privacy &amp; security</h1>
        <h2>Windows permissions</h2>
        <div class="settings-card">
          ${togglePage('privacy.location', 'Location', 'Allow apps to access your precise location', 'maps')}
          ${togglePage('privacy.camera', 'Camera', 'Allow apps to access your camera', 'photos')}
          ${togglePage('privacy.microphone', 'Microphone', 'Allow apps to access your microphone', 'volume')}
          ${togglePage('privacy.notifications', 'Notifications', 'Allow apps to send notifications', 'notification')}
        </div>
        <h2>Security</h2>
        <div class="settings-card">
          ${row('shield', 'Windows Security', 'Virus protection, firewall and device security', button('Open', 'windows-security'))}
          ${row('lock', 'Device encryption', 'Protect your files if your device is lost', '<span class="status-pill">On</span>')}
          ${row('info', 'Diagnostics &amp; feedback', 'Choose how much diagnostic data is sent', button('Manage', 'diagnostics'))}
        </div>
        <h2>Recent activity</h2>
        <div class="settings-card">
          ${togglePage('activityHistory', 'Activity history', 'Store your activity for a more personalized experience', 'clock')}
          ${row('trash', 'Clear activity history', 'Remove saved activity from this account', button('Clear', 'clear-activity'))}
        </div>`;
    }
    function updatePage() {
      return `<h1>Windows Update</h1>
        <div class="settings-card" style="padding:18px 16px">
          <div style="display:flex;align-items:center;gap:14px">
            <span style="width:42px;height:42px;border-radius:50%;background:rgba(16,185,129,.12);display:grid;place-items:center;color:#16a34a">${getIcon('check', 22)}</span>
            <div style="flex:1"><strong style="font-size:14px;display:block">You're up to date</strong><span style="font-size:11px;color:var(--text-secondary)">Last checked: Today, ${esc(formatDate(new Date(), 'time'))}</span></div>
            ${button('Check for updates', 'check-updates', true)}
          </div>
        </div>
        <h2>Update history</h2>
        <div class="settings-card">
          ${row('shield', '2026-10 Cumulative Update for Windows 11', 'Successfully installed · October 14, 2026', '')}
          ${row('shield', 'Windows Security Platform update', 'Successfully installed · October 8, 2026', '')}
          ${row('shield', '2026-09 Cumulative Update for Windows 11', 'Successfully installed · September 9, 2026', '')}
        </div>
        <h2>More options</h2>
        <div class="settings-card">
          ${row('clock', 'Pause updates', 'Temporarily pause updates for up to 5 weeks', button('Pause', 'pause-updates'))}
          ${row('settings', 'Advanced options', 'Delivery optimization, optional updates and more', button('Open', 'advanced-updates'))}
          ${row('refresh', 'Windows Insider Program', "Get preview builds before they're released", button('Join', 'insider'))}
        </div>`;
    }
    function aboutPage() {
      return `<h1>About</h1>
        <div class="settings-about-hero">
          <div class="about-pc">${getIcon('thispc', 74)}</div>
          <h2>${esc(state.deviceName || 'DESKTOP-SIM11')}</h2>
          <p>Windows 11 Pro · Version 24H2</p>
        </div>
        <div class="settings-card">
          <div class="spec-grid">
            <div><span>Device name</span>${esc(state.deviceName || 'DESKTOP-SIM11')}</div>
            <div><span>Processor</span>Web CPU @ 4.20 GHz</div>
            <div><span>Installed RAM</span>16.0 GB</div>
            <div><span>System type</span>64-bit operating system</div>
            <div><span>Edition</span>Windows 11 Pro</div>
            <div><span>Version</span>24H2</div>
            <div><span>Installed on</span>June 14, 2025</div>
            <div><span>OS build</span>26100.1742</div>
            <div><span>Experience</span>Windows Feature Experience Pack 1000.26100</div>
            <div><span>Storage</span>256 GB virtual disk</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${button('Copy system info', 'copy-specs')}
          ${button('Open About This PC', 'open-about')}
          ${button('Open Task Manager', 'open-taskmanager')}
        </div>`;
    }
    function pageHtml(page) {
      if (page === 'system') return systemPage();
      if (page === 'bluetooth') return bluetoothPage();
      if (page === 'network') return networkPage();
      if (page === 'personalization') return personalizationPage();
      if (page === 'apps') return appsPage();
      if (page === 'accounts') return accountsPage();
      if (page === 'time') return timePage();
      if (page === 'gaming') return gamingPage();
      if (page === 'accessibility') return accessibilityPage();
      if (page === 'privacy') return privacyPage();
      if (page === 'update') return updatePage();
      return aboutPage();
    }
    function searchHtml(value) {
      const q = value.trim().toLowerCase();
      const results = SETTINGS_INDEX.filter((item) => `${item.label} ${item.desc} ${item.page}`.toLowerCase().includes(q));
      if (!results.length) return `<h1>Search results</h1><div class="settings-empty">No settings match “${esc(value)}”.</div>`;
      return `<h1>Search results</h1><div class="settings-search-results">
        ${results.map((item, index) => `<button class="settings-search-result" type="button" data-search-result="${index}">
          ${getIcon(item.icon, 18)}<span><strong>${esc(item.label)}</strong><span>${esc(PAGES_TITLE(item.page))} · ${esc(item.desc)}</span></span>
        </button>`).join('')}
      </div>`;
    }
    function PAGES_TITLE(id) {
      const page = SETTINGS_PAGES.find((item) => item.id === id);
      return page ? page.label : id;
    }
    function render() {
      const hadFocus = document.activeElement && document.activeElement.id === 'settings-search';
      const caret = hadFocus ? document.activeElement.selectionStart : 0;
      const current = SETTINGS_PAGES.find((page) => page.id === activePage) || SETTINGS_PAGES[0];
      root.innerHTML = `
        <div class="settings-top">
          <span style="width:24px;height:24px">${getIcon('settings', 24)}</span>
          <label class="settings-search">${getIcon('search', 14)}<input id="settings-search" type="text" placeholder="Find a setting" value="${esc(query)}" autocomplete="off" aria-label="Find a setting"></label>
          <button class="icon-btn" type="button" data-settings-action="account" aria-label="Account">${getIcon('user', 17)}</button>
        </div>
        <div class="settings-body">
          <aside class="settings-sidebar">
            <div class="settings-user"><span class="user-avatar">${getIcon('user', 18)}</span><div><strong>User</strong><span>user@local</span></div></div>
            ${SETTINGS_PAGES.map((page) => `<button class="settings-nav-item ${page.id === activePage && !query ? 'active' : ''}" type="button" data-settings-page="${page.id}">${getIcon(page.icon, 16)}<span>${esc(page.label)}</span></button>`).join('')}
          </aside>
          <section class="settings-content" data-role="settings-content">${query.trim() ? searchHtml(query) : pageHtml(activePage)}</section>
        </div>`;
      if (hadFocus) {
        const input = $('#settings-search', root);
        input.focus();
        try { input.setSelectionRange(caret, caret); } catch (_) {}
      }
      win.setTitle(query.trim() ? `Search: ${query} - Settings` : `${current.label} - Settings`);
    }
    win.settingsNavigate = (page) => {
      if (!SETTINGS_PAGES.some((item) => item.id === page)) return;
      activePage = page;
      query = '';
      render();
      const content = $('[data-role="settings-content"]', root);
      if (content) content.scrollTop = 0;
    };
    win.settingsSearch = (value) => {
      query = String(value || '');
      render();
    };
    root.addEventListener('click', (event) => {
      const nav = event.target.closest('[data-settings-page]');
      if (nav) { win.settingsNavigate(nav.dataset.settingsPage); return; }
      const searchResult = event.target.closest('[data-search-result]');
      if (searchResult) {
        const q = query.trim().toLowerCase();
        const item = SETTINGS_INDEX.filter((entry) => `${entry.label} ${entry.desc} ${entry.page}`.toLowerCase().includes(q))[Number(searchResult.dataset.searchResult)];
        if (item) win.settingsNavigate(item.page);
        return;
      }
      const themeChoice = event.target.closest('[data-theme-choice]');
      if (themeChoice) { applyTheme(themeChoice.dataset.themeChoice); render(); return; }
      const wallpaper = event.target.closest('[data-wallpaper-choice]');
      if (wallpaper) { applyWallpaper(Number(wallpaper.dataset.wallpaperChoice)); render(); return; }
      const accent = event.target.closest('[data-accent-choice]');
      if (accent) { applyAccent(accent.dataset.accentChoice); render(); return; }
      const openAppButton = event.target.closest('[data-open-app]');
      if (openAppButton) { openApp(openAppButton.dataset.openApp); return; }
      const toggleButton = event.target.closest('[data-setting-toggle]');
      if (toggleButton) {
        const key = toggleButton.dataset.settingToggle;
        let value = !stateValue(key);
        if (key === 'wifi') {
          if (value) state.airplane = false;
        } else if (key === 'airplane') {
          if (value) { state.wifi = false; state.bluetooth = false; }
          else state.wifi = true;
        }
        setStateValue(key, value);
        if (['nightLight','brightness','scale'].includes(key)) applyDisplayEffects();
        if (key === 'showDesktopIcons' || key === 'iconSize') renderDesktop();
        if (key.startsWith('taskbar.')) updateTaskbar();
        refreshTrayState();
        render();
        return;
      }
      const action = event.target.closest('[data-settings-action]');
      if (action) handleAction(action.dataset.settingsAction);
    });
    root.addEventListener('input', (event) => {
      if (event.target.id === 'settings-search') {
        query = event.target.value;
        render();
        return;
      }
      const range = event.target.closest('[data-setting-range]');
      if (!range) return;
      const key = range.dataset.settingRange;
      const value = Number(range.value);
      setStateValue(key, value);
      const output = $(`[data-range-value="${key}"]`, root);
      if (output) output.textContent = `${value}%`;
      if (key === 'volume') { Sound.setVolume(value); refreshTrayState(); }
      if (key === 'brightness') applyDisplayEffects();
      if (key === 'scale') applyDisplayEffects();
    });
    root.addEventListener('change', (event) => {
      const select = event.target.closest('[data-setting-select]');
      if (!select) return;
      const key = select.dataset.settingSelect;
      const value = key === 'iconSize' || key === 'scale' ? Number(select.value) : select.value;
      setStateValue(key, value);
      if (key === 'iconSize') renderDesktop();
      if (key === 'scale') applyDisplayEffects();
      if (key === 'timezone') addNotification('Settings', 'Time zone updated', `Time zone set to ${select.options[select.selectedIndex].text}.`, 'clock');
      render();
    });
    async function handleAction(action) {
      if (action === 'open-explorer') openApp('explorer', { path: '/' });
      else if (action === 'open-store') openApp('store');
      else if (action === 'open-taskmanager') openApp('taskmanager');
      else if (action === 'open-about') openApp('about');
      else if (action === 'lock') lockNow();
      else if (action === 'signout') lockNow();
      else if (action === 'rename-pc') {
        const name = await promptDialog('Rename this PC', 'Enter a new device name:', state.deviceName || 'DESKTOP-SIM11', 'Next');
        if (name && name.trim()) {
          state.deviceName = name.trim().slice(0, 15).toUpperCase();
          saveState();
          addNotification('Settings', 'Device renamed', `Your PC is now named ${state.deviceName}.`, 'thispc');
          render();
        }
      } else if (action === 'copy-specs') {
        const text = 'Windows 11 Pro\nVersion 24H2\nOS build 26100.1742\nProcessor: Web CPU @ 4.20 GHz\nInstalled RAM: 16.0 GB\nSystem type: 64-bit operating system';
        try { await navigator.clipboard.writeText(text); addNotification('Settings', 'Copied', 'System information copied to the clipboard.', 'copy'); }
        catch (_) { await alertDialog('System information', text); }
      } else if (action === 'check-updates') {
        addNotification('Windows Update', 'Checking for updates', 'Windows is looking for new updates...', 'refresh');
        setTimeout(() => addNotification('Windows Update', "You're up to date", 'No new updates are available for your device.', 'check'), 1500);
      } else if (action === 'pause-updates') {
        addNotification('Windows Update', 'Updates paused', 'Updates are paused for 7 days.', 'clock');
      } else if (action === 'sync-time') {
        updateClock();
        addNotification('Settings', 'Time synchronized', 'Your clock is synchronized with time.windows.com.', 'clock');
        render();
      } else if (action === 'clear-activity') {
        addNotification('Privacy', 'Activity history cleared', 'Your activity history has been removed.', 'trash');
      } else if (['remove-device','connect-device','add-device','autoplay','bluetooth-more','known-networks','network-advanced','proxy','account-info','signin-options','backup','add-account','family','language','region','open-captures','windows-security','diagnostics','advanced-updates','insider','account'].includes(action)) {
        addNotification('Settings', 'Settings page', 'This setting is managed automatically in the simulator.', 'settings');
      } else if (action === 'reset') {
        const confirmed = await confirmDialog('Reset this PC', 'This removes all saved files, apps and settings from the simulator. Continue?', 'Reset', true);
        if (confirmed) {
          localStorage.removeItem(STORAGE_KEY);
          state = defaultState();
          applyTheme(state.theme, false);
          applyAccent(state.accent);
          applyWallpaper(state.wallpaper);
          applyDisplayEffects();
          renderDesktop();
          updateTaskbar();
          render();
          addNotification('Settings', 'Reset complete', 'The simulator has been restored to its default state.', 'refresh');
        }
      }
    }
    function openSearchShortcut() {
      const input = $('#settings-search', root);
      if (input) { input.focus(); input.select(); }
    }
    const keyHandler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') { event.preventDefault(); openSearchShortcut(); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => document.removeEventListener('keydown', keyHandler));
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: NOTEPAD — plain-text editing with files and find
// ═══════════════════════════════════════
APPS.notepad = {
  title: 'Notepad',
  icon: 'notepad',
  width: 860,
  height: 610,
  minWidth: 480,
  minHeight: 320,
  onReopen(win, params) {
    if (params.path && win.notepadOpenFile) win.notepadOpenFile(params.path);
  },
  build({ win, params, cleanup, toast }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root notepad-app');
    win.body.appendChild(root);
    let filePath = params.path && FS.get(params.path) && FS.get(params.path).type === 'file' ? params.path : null;
    let dirty = false;
    let wrap = true;
    let zoom = 100;
    let findOpen = false;
    const initial = filePath ? (FS.get(filePath).content || '') : (state.notepad.content || '');
    root.innerHTML = `
      <div class="app-menu-bar">
        <button class="app-menu-btn" type="button" data-np-menu="file">File</button>
        <button class="app-menu-btn" type="button" data-np-menu="edit">Edit</button>
        <button class="app-menu-btn" type="button" data-np-menu="view">View</button>
        <button class="app-menu-btn" type="button" data-np-menu="help">Help</button>
        <span style="flex:1"></span>
        <button class="app-menu-btn" type="button" data-np-action="find" title="Find (Ctrl+F)">${getIcon('search', 13)}</button>
      </div>
      <div class="find-bar" hidden>
        ${getIcon('search', 13)}
        <input type="text" data-np-find placeholder="Find" aria-label="Find text">
        <span class="find-count" data-np-find-count>0 results</span>
        <button class="icon-btn" type="button" data-np-find-prev aria-label="Previous result">${getIcon('chevron-up', 12)}</button>
        <button class="icon-btn" type="button" data-np-find-next aria-label="Next result">${getIcon('chevron-down', 12)}</button>
        <button class="icon-btn" type="button" data-np-find-close aria-label="Close find">${getIcon('close', 11)}</button>
      </div>
      <textarea class="notepad-editor" spellcheck="false" aria-label="Notepad editor"></textarea>
      <div class="notepad-status">
        <span data-np-pos>Ln 1, Col 1</span>
        <span data-np-chars>0 characters</span>
        <span data-np-words>0 words</span>
        <span class="spacer"></span>
        <span data-np-zoom>100%</span>
        <span>Windows (CRLF)</span>
        <span>UTF-8</span>
      </div>
    `;
    const editor = $('.notepad-editor', root);
    const findBar = $('.find-bar', root);
    const findInput = $('[data-np-find]', root);
    const findCount = $('[data-np-find-count]', root);
    editor.value = initial;
    editor.wrap = wrap ? 'soft' : 'off';
    editor.style.fontSize = `${zoom}%`;
    let findMatches = [];
    let findIndex = 0;
    function fileName() {
      return filePath ? (FS.get(filePath)?.name || 'Untitled') : 'Untitled';
    }
    function updateTitle() {
      win.setTitle(`${dirty ? '*' : ''}${fileName()} - Notepad`);
    }
    function updateStats() {
      const value = editor.value;
      const before = value.slice(0, editor.selectionStart);
      const line = before.split('\n').length;
      const column = before.length - before.lastIndexOf('\n');
      const words = value.trim() ? value.trim().split(/\s+/).length : 0;
      $('[data-np-pos]', root).textContent = `Ln ${line}, Col ${column}`;
      $('[data-np-chars]', root).textContent = `${value.length} character${value.length === 1 ? '' : 's'}`;
      $('[data-np-words]', root).textContent = `${words} word${words === 1 ? '' : 's'}`;
      $('[data-np-zoom]', root).textContent = `${zoom}%`;
      updateTitle();
    }
    function updateFindCount() {
      const query = findInput.value;
      if (!query) { findMatches = []; findCount.textContent = '0 results'; return; }
      findMatches = [];
      const lower = editor.value.toLowerCase();
      const needle = query.toLowerCase();
      let index = 0;
      while (index <= lower.length && findMatches.length < 500) {
        index = lower.indexOf(needle, index);
        if (index < 0) break;
        findMatches.push(index);
        index += Math.max(1, needle.length);
      }
      if (findIndex >= findMatches.length) findIndex = 0;
      findCount.textContent = findMatches.length ? `${Math.min(findIndex + 1, findMatches.length)} of ${findMatches.length}` : '0 results';
    }
    function selectMatch(index) {
      updateFindCount();
      if (!findMatches.length) return;
      findIndex = (index + findMatches.length) % findMatches.length;
      const start = findMatches[findIndex];
      editor.focus();
      editor.setSelectionRange(start, start + findInput.value.length);
      const ratio = start / Math.max(1, editor.value.length);
      editor.scrollTop = ratio * editor.scrollHeight;
      findCount.textContent = `${findIndex + 1} of ${findMatches.length}`;
    }
    function openFind() {
      findOpen = true;
      findBar.hidden = false;
      findInput.focus();
      findInput.select();
      updateFindCount();
    }
    function closeFind() {
      findOpen = false;
      findBar.hidden = true;
      editor.focus();
    }
    async function saveFile(saveAs = false) {
      let target = filePath;
      if (!target || saveAs) {
        const name = await promptDialog('Save as', 'Enter a file name. It will be saved in Documents:', `${fileName() === 'Untitled' ? 'Untitled.txt' : fileName()}`, 'Save');
        if (name === null) return false;
        try {
          const node = FS.createFile('/Documents', name, editor.value);
          target = FS.join('/Documents', node.name);
          filePath = target;
        } catch (error) {
          toast('Save failed', error.message, 'notepad');
          return false;
        }
      } else if (!FS.writeFile(target, editor.value)) {
        toast('Save failed', 'The file could not be written.', 'notepad');
        return false;
      }
      dirty = false;
      updateStats();
      if (!filePath) { state.notepad.content = editor.value; saveState(); }
      toast('File saved', `${FS.get(target)?.name || 'Document'} was saved to Documents.`, 'save');
      return true;
    }
    function loadFile(path) {
      const node = FS.get(path);
      if (!node || node.type !== 'file') {
        addNotification('Notepad', 'File not found', `${path} could not be found.`, 'notepad');
        return;
      }
      editor.value = node.content || '';
      filePath = path;
      dirty = false;
      updateStats();
      toast('File opened', node.name, 'notepad');
    }
    function newDocument() {
      editor.value = '';
      filePath = null;
      dirty = false;
      state.notepad.content = '';
      saveState();
      updateStats();
      editor.focus();
    }
    async function openDocument() {
      const path = await promptDialog('Open', 'Enter a file path:', '/Documents/Personal/Notes.txt', 'Open');
      if (path === null) return;
      loadFile(FS.normalize(path));
    }
    function showMenu(menu, anchor) {
      const rect = anchor.getBoundingClientRect();
      let items;
      if (menu === 'file') {
        items = [
          { label: 'New', icon: 'new-file', shortcut: 'Ctrl+N', action: newDocument },
          { label: 'Open...', icon: 'folder-open', shortcut: 'Ctrl+O', action: openDocument },
          { label: 'Save', icon: 'save', shortcut: 'Ctrl+S', action: () => saveFile(false) },
          { label: 'Save as...', icon: 'save', shortcut: 'Ctrl+Shift+S', action: () => saveFile(true) },
          '-',
          { label: 'Exit', icon: 'close', action: () => win.close() }
        ];
      } else if (menu === 'edit') {
        items = [
          { label: 'Undo', icon: 'undo', shortcut: 'Ctrl+Z', action: () => { editor.focus(); document.execCommand('undo'); } },
          { label: 'Redo', icon: 'redo', shortcut: 'Ctrl+Y', action: () => { editor.focus(); document.execCommand('redo'); } },
          '-',
          { label: 'Cut', icon: 'cut', shortcut: 'Ctrl+X', action: () => { editor.focus(); document.execCommand('cut'); } },
          { label: 'Copy', icon: 'copy', shortcut: 'Ctrl+C', action: () => { editor.focus(); document.execCommand('copy'); } },
          { label: 'Paste', icon: 'paste', shortcut: 'Ctrl+V', action: () => { editor.focus(); document.execCommand('paste'); } },
          '-',
          { label: 'Find', icon: 'search', shortcut: 'Ctrl+F', action: openFind },
          { label: 'Select all', icon: 'check', shortcut: 'Ctrl+A', action: () => { editor.focus(); editor.select(); } },
          { label: 'Time/date', icon: 'clock', shortcut: 'F5', action: insertDateTime }
        ];
      } else if (menu === 'view') {
        items = [
          { label: 'Zoom in', icon: 'plus', shortcut: 'Ctrl++', action: () => setZoom(zoom + 10) },
          { label: 'Zoom out', icon: 'minus', shortcut: 'Ctrl+-', action: () => setZoom(zoom - 10) },
          { label: 'Restore default zoom', icon: 'refresh', action: () => setZoom(100) },
          '-',
          { label: 'Word wrap', checked: wrap, action: () => { wrap = !wrap; editor.wrap = wrap ? 'soft' : 'off'; } },
          { label: 'Status bar', checked: true, disabled: true }
        ];
      } else {
        items = [{ label: 'About Notepad', icon: 'notepad', action: () => alertDialog('About Notepad', 'Notepad Simulator — Windows 11 Edition\n\nA simple plain-text editor with virtual file support.') }];
      }
      showContextMenu(items, rect.left, rect.bottom + 2);
    }
    function insertDateTime() {
      const stamp = new Date().toLocaleString('en-US');
      const start = editor.selectionStart;
      editor.setRangeText(stamp, start, editor.selectionEnd, 'end');
      editor.dispatchEvent(new Event('input'));
    }
    function setZoom(value) {
      zoom = clamp(value, 50, 250);
      editor.style.fontSize = `${zoom}%`;
      updateStats();
    }
    const inputTimer = debounce(() => {
      if (!filePath) { state.notepad.content = editor.value; saveState(); }
    }, 500);
    editor.addEventListener('input', () => {
      dirty = true;
      updateStats();
      if (findOpen) updateFindCount();
      inputTimer();
    });
    editor.addEventListener('click', updateStats);
    editor.addEventListener('keyup', updateStats);
    editor.addEventListener('scroll', () => {});
    editor.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveFile(event.shiftKey);
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        openFind();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        newDocument();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        openDocument();
      } else if (event.key === 'F5') {
        event.preventDefault();
        insertDateTime();
      } else if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        setZoom(zoom + 10);
      } else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        setZoom(zoom - 10);
      }
    });
    findInput.addEventListener('input', () => { findIndex = 0; updateFindCount(); });
    findInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); selectMatch(findIndex + (event.shiftKey ? -1 : 1)); }
      if (event.key === 'Escape') { event.preventDefault(); closeFind(); }
    });
    root.addEventListener('click', (event) => {
      const menu = event.target.closest('[data-np-menu]');
      if (menu) { showMenu(menu.dataset.npMenu, menu); return; }
      if (event.target.closest('[data-np-action="find"]')) { openFind(); return; }
      if (event.target.closest('[data-np-find-next]')) { selectMatch(findIndex + 1); return; }
      if (event.target.closest('[data-np-find-prev]')) { selectMatch(findIndex - 1); return; }
      if (event.target.closest('[data-np-find-close]')) { closeFind(); }
    });
    root.addEventListener('contextmenu', (event) => {
      if (event.target.closest('.notepad-editor, .find-bar')) return;
      event.preventDefault();
      showMenu('edit', event.target);
    });
    const closeCleanup = () => {
      if (!filePath) { state.notepad.content = editor.value; saveState(); }
      state.notepad.filename = fileName();
    };
    win.onClose = closeCleanup;
    cleanup(closeCleanup);
    win.notepadOpenFile = (path) => loadFile(path);
    updateStats();
    setTimeout(() => editor.focus(), 80);
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: CALCULATOR — standard mode with memory and keyboard input
// ═══════════════════════════════════════
APPS.calculator = {
  title: 'Calculator',
  icon: 'calculator',
  width: 350,
  height: 560,
  minWidth: 300,
  minHeight: 470,
  build({ win, cleanup, toast }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root calc-app');
    win.body.appendChild(root);
    let display = '0';
    let accumulator = null;
    let pendingOperator = null;
    let waitingForOperand = false;
    let lastOperator = null;
    let lastOperand = null;
    let expression = '';
    let error = false;
    let memory = Number(state.calcMemory) || 0;
    const keyRows = [
      [{ label: '%', action: 'percent', kind: 'fn' }, { label: 'CE', action: 'clear-entry', kind: 'fn' }, { label: 'C', action: 'clear', kind: 'fn' }, { label: '⌫', action: 'backspace', kind: 'fn', aria: 'Backspace' }],
      [{ label: '1/x', action: 'reciprocal', kind: 'fn' }, { label: 'x²', action: 'square', kind: 'fn' }, { label: '√x', action: 'sqrt', kind: 'fn' }, { label: '÷', operator: '/', kind: 'fn', aria: 'Divide' }],
      [{ label: '7' }, { label: '8' }, { label: '9' }, { label: '×', operator: '*', kind: 'fn', aria: 'Multiply' }],
      [{ label: '4' }, { label: '5' }, { label: '6' }, { label: '−', operator: '-', kind: 'fn', aria: 'Subtract' }],
      [{ label: '1' }, { label: '2' }, { label: '3' }, { label: '+', operator: '+', kind: 'fn', aria: 'Add' }],
      [{ label: '+/−', action: 'negate', kind: 'fn', aria: 'Change sign' }, { label: '0' }, { label: '.', action: 'decimal' }, { label: '=', action: 'equals', kind: 'equals', aria: 'Equals' }]
    ];
    root.innerHTML = `
      <div class="calc-head"><span>Standard</span><button class="calc-menu-btn" type="button" data-calc-menu aria-label="Calculator menu">${getIcon('list-view', 16)}</button></div>
      <div class="calc-display">
        <div class="calc-history" data-calc-history></div>
        <div class="calc-value" data-calc-display aria-live="polite">0</div>
      </div>
      <div class="calc-memory-row">
        <button class="calc-mem-btn" type="button" data-calc-memory="clear" ${memory ? '' : 'disabled'}>MC</button>
        <button class="calc-mem-btn" type="button" data-calc-memory="recall" ${memory ? '' : 'disabled'}>MR</button>
        <button class="calc-mem-btn" type="button" data-calc-memory="add">M+</button>
        <button class="calc-mem-btn" type="button" data-calc-memory="subtract">M−</button>
        <button class="calc-mem-btn" type="button" data-calc-memory="store">MS</button>
      </div>
      <div class="calc-memory-indicator" data-calc-mem-indicator>${memory ? 'M' : ''}</div>
      <div class="calc-keys">
        ${keyRows.flat().map((key) => `<button class="calc-key ${key.kind || ''}" type="button" ${key.operator ? `data-calc-op="${key.operator}"` : `data-calc-action="${key.action || 'digit'}" data-calc-value="${esc(key.label)}"`} aria-label="${esc(key.aria || key.label)}">${key.label}</button>`).join('')}
      </div>
    `;
    const displayEl = $('[data-calc-display]', root);
    const historyEl = $('[data-calc-history]', root);
    const memIndicator = $('[data-calc-mem-indicator]', root);
    function currentValue() {
      return Number(String(display).replace(/,/g, '')) || 0;
    }
    function formatNumber(value) {
      if (!Number.isFinite(value)) return 'Error';
      if (Math.abs(value) >= 1e15 || (value !== 0 && Math.abs(value) < 1e-9)) return value.toExponential(6);
      const rounded = Number(value.toPrecision(14));
      return rounded.toLocaleString('en-US', { maximumFractionDigits: 12, useGrouping: false });
    }
    function render() {
      displayEl.textContent = display;
      historyEl.textContent = expression;
      $$('[data-calc-memory="clear"], [data-calc-memory="recall"]', root).forEach((button) => { button.disabled = !memory; });
      memIndicator.textContent = memory ? 'M' : '';
    }
    function resetAll() {
      display = '0';
      accumulator = null;
      pendingOperator = null;
      waitingForOperand = false;
      lastOperator = null;
      lastOperand = null;
      expression = '';
      error = false;
      render();
    }
    function inputDigit(value) {
      if (error) resetAll();
      if (waitingForOperand) {
        display = value;
        waitingForOperand = false;
      } else {
        const digits = display.replace(/[-.]/g, '');
        if (digits.length >= 16) return;
        display = display === '0' ? value : `${display}${value}`;
      }
      render();
    }
    function inputDecimal() {
      if (error) resetAll();
      if (waitingForOperand) {
        display = '0.';
        waitingForOperand = false;
      } else if (!display.includes('.')) {
        display += '.';
      }
      render();
    }
    function applyUnary(type) {
      if (error) return;
      let value = currentValue();
      if (type === 'negate') value = -value;
      else if (type === 'percent') value /= 100;
      else if (type === 'reciprocal') {
        if (value === 0) { setError('Cannot divide by zero'); return; }
        value = 1 / value;
      } else if (type === 'square') value *= value;
      else if (type === 'sqrt') {
        if (value < 0) { setError('Invalid input'); return; }
        value = Math.sqrt(value);
      }
      display = formatNumber(value);
      waitingForOperand = false;
      render();
    }
    function setError(message) {
      display = message;
      expression = '';
      error = true;
      accumulator = null;
      pendingOperator = null;
      waitingForOperand = true;
      render();
      toast('Calculator', message, 'calculator');
    }
    function calculate(a, b, operator) {
      if (operator === '+') return a + b;
      if (operator === '-') return a - b;
      if (operator === '*') return a * b;
      if (operator === '/') return b === 0 ? NaN : a / b;
      return b;
    }
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    function chooseOperator(operator) {
      if (error) resetAll();
      const value = currentValue();
      if (pendingOperator && !waitingForOperand) {
        const result = calculate(accumulator, value, pendingOperator);
        if (!Number.isFinite(result)) { setError(pendingOperator === '/' && value === 0 ? 'Cannot divide by zero' : 'Invalid input'); return; }
        accumulator = result;
        display = formatNumber(result);
      } else if (accumulator === null || !waitingForOperand) {
        accumulator = value;
      }
      pendingOperator = operator;
      waitingForOperand = true;
      expression = `${formatNumber(accumulator)} ${symbols[operator]}`;
      render();
    }
    function equals() {
      if (error) return;
      const value = currentValue();
      if (pendingOperator !== null) {
        const result = calculate(accumulator, value, pendingOperator);
        if (!Number.isFinite(result)) { setError(pendingOperator === '/' && value === 0 ? 'Cannot divide by zero' : 'Invalid input'); return; }
        expression = `${formatNumber(accumulator)} ${symbols[pendingOperator]} ${formatNumber(value)} =`;
        lastOperator = pendingOperator;
        lastOperand = value;
        display = formatNumber(result);
        accumulator = null;
        pendingOperator = null;
        waitingForOperand = true;
      } else if (lastOperator !== null && lastOperand !== null) {
        const result = calculate(value, lastOperand, lastOperator);
        if (!Number.isFinite(result)) { setError('Invalid input'); return; }
        expression = `${formatNumber(value)} ${symbols[lastOperator]} ${formatNumber(lastOperand)} =`;
        display = formatNumber(result);
        waitingForOperand = true;
      } else {
        expression = `${formatNumber(value)} =`;
      }
      render();
    }
    function memoryAction(action) {
      if (action === 'clear') memory = 0;
      else if (action === 'recall') { display = formatNumber(memory); waitingForOperand = true; }
      else if (action === 'add') memory += currentValue();
      else if (action === 'subtract') memory -= currentValue();
      else if (action === 'store') memory = currentValue();
      state.calcMemory = memory;
      saveState();
      render();
    }
    function handleAction(action, value) {
      if (action === 'digit') inputDigit(value);
      else if (action === 'decimal') inputDecimal();
      else if (action === 'equals') equals();
      else if (action === 'clear') resetAll();
      else if (action === 'clear-entry') { display = '0'; waitingForOperand = false; render(); }
      else if (action === 'backspace') {
        if (error) resetAll();
        else {
          display = display.length > 1 ? display.slice(0, -1) : '0';
          if (display === '-') display = '0';
          render();
        }
      } else if (action === 'negate') applyUnary('negate');
      else if (action === 'percent') applyUnary('percent');
      else if (action === 'reciprocal') applyUnary('reciprocal');
      else if (action === 'square') applyUnary('square');
      else if (action === 'sqrt') applyUnary('sqrt');
    }
    root.addEventListener('click', (event) => {
      const key = event.target.closest('[data-calc-action]');
      if (key) { handleAction(key.dataset.calcAction, key.dataset.calcValue); return; }
      const op = event.target.closest('[data-calc-op]');
      if (op) { chooseOperator(op.dataset.calcOp); return; }
      const mem = event.target.closest('[data-calc-memory]');
      if (mem) { memoryAction(mem.dataset.calcMemory); return; }
      if (event.target.closest('[data-calc-menu]')) {
        const button = $('[data-calc-menu]', root);
        const rect = button.getBoundingClientRect();
        showContextMenu([
          { label: 'Copy result', icon: 'copy', action: async () => {
            try { await navigator.clipboard.writeText(display); toast('Copied', 'Result copied to the clipboard.', 'copy'); }
            catch (_) { toast('Copy failed', 'Clipboard access is unavailable.', 'copy'); }
          } },
          { label: 'Clear history', icon: 'trash', action: () => { expression = ''; render(); } },
          '-',
          { label: 'About Calculator', icon: 'calculator', action: () => alertDialog('About Calculator', 'Calculator Simulator — Standard mode\n\nSupports memory, keyboard input and basic arithmetic.') }
        ], rect.left, rect.bottom + 2);
      }
    });
    const keyHandler = (event) => {
      if (WM.focusedId !== win.id) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key;
      if (/^[0-9]$/.test(key)) { event.preventDefault(); inputDigit(key); }
      else if (key === '.' || key === ',') { event.preventDefault(); inputDecimal(); }
      else if (['+', '-', '*', '/'].includes(key)) { event.preventDefault(); chooseOperator(key); }
      else if (key === 'Enter' || key === '=') { event.preventDefault(); equals(); }
      else if (key === 'Backspace') { event.preventDefault(); handleAction('backspace'); }
      else if (key === 'Escape') { event.preventDefault(); resetAll(); }
      else if (key === 'Delete') { event.preventDefault(); handleAction('clear-entry'); }
      else if (key === '%') { event.preventDefault(); applyUnary('percent'); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => document.removeEventListener('keydown', keyHandler));
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: PAINT — canvas drawing, shapes, colors and history
// ═══════════════════════════════════════
APPS.paint = {
  title: 'Paint',
  icon: 'paint',
  width: 980,
  height: 680,
  minWidth: 620,
  minHeight: 440,
  build({ win, cleanup, toast }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root paint-app');
    win.body.appendChild(root);
    const palette = ['#000000','#7f7f7f','#880015','#ed1c24','#ff7f27','#fff200','#22b14c','#00a2e8','#3f48cc','#a349a4','#ffffff','#c3c3c3','#b97a57','#ffaec9','#ffc90e','#efe4b0','#b5e61d','#99d9ea','#7092be','#c8bfe7'];
    root.innerHTML = `
      <div class="paint-toolbar">
        <div class="paint-group">
          <button class="paint-tool" type="button" data-paint-undo aria-label="Undo" title="Undo">${getIcon('undo', 16)}</button>
          <button class="paint-tool" type="button" data-paint-redo aria-label="Redo" title="Redo">${getIcon('redo', 16)}</button>
        </div>
        <div class="paint-group">
          <button class="paint-tool active" type="button" data-paint-tool="pencil" aria-label="Pencil" title="Pencil">${getIcon('brush', 16)}</button>
          <button class="paint-tool" type="button" data-paint-tool="brush" aria-label="Brush" title="Brush">${getIcon('paint', 16)}</button>
          <button class="paint-tool" type="button" data-paint-tool="eraser" aria-label="Eraser" title="Eraser">${getIcon('eraser', 16)}</button>
          <button class="paint-tool" type="button" data-paint-tool="line" aria-label="Line" title="Line">${getIcon('minus', 16)}</button>
          <button class="paint-tool" type="button" data-paint-tool="rect" aria-label="Rectangle" title="Rectangle">${getIcon('maximize', 16)}</button>
          <button class="paint-tool" type="button" data-paint-tool="ellipse" aria-label="Ellipse" title="Ellipse">${getIcon('radio', 16)}</button>
          <button class="paint-tool" type="button" data-paint-tool="fill" aria-label="Fill with color" title="Fill with color">${getIcon('color-palette', 16)}</button>
        </div>
        <div class="paint-group">
          ${[2,4,8,16].map((size) => `<button class="paint-size ${size === 4 ? 'active' : ''}" type="button" data-paint-size="${size}" aria-label="${size} pixels"><i style="width:${Math.min(size + 2, 14)}px;height:${Math.min(size + 2, 14)}px"></i></button>`).join('')}
        </div>
        <div class="paint-group">
          <div class="paint-colors">${palette.map((color, index) => `<button class="paint-swatch ${index === 0 ? 'active' : ''}" type="button" style="background:${color}" data-paint-color="${color}" aria-label="Color ${color}"></button>`).join('')}</div>
          <input class="paint-color-input" type="color" value="#000000" data-paint-color-input aria-label="Custom color">
        </div>
        <div class="paint-group">
          <button class="paint-tool" type="button" data-paint-action="clear" aria-label="Clear canvas" title="Clear">${getIcon('trash', 16)}</button>
          <button class="paint-tool" type="button" data-paint-action="save" aria-label="Save image" title="Save as PNG">${getIcon('save', 16)}</button>
        </div>
      </div>
      <div class="paint-canvas-wrap">
        <canvas class="paint-canvas" width="900" height="540" aria-label="Paint canvas"></canvas>
      </div>
      <div class="paint-status"><span data-paint-pos>0, 0 px</span><span>Canvas: 900 × 540 px</span><span style="margin-left:auto" data-paint-tool-label>Pencil · 4 px</span></div>
    `;
    const canvas = $('.paint-canvas', root);
    const ctx = canvas.getContext('2d');
    const positionEl = $('[data-paint-pos]', root);
    const toolLabel = $('[data-paint-tool-label]', root);
    const undoStack = [];
    const redoStack = [];
    let tool = 'pencil';
    let color = '#000000';
    let size = 4;
    let drawing = false;
    let startPoint = null;
    let lastPoint = null;
    let shapeSnapshot = null;
    let moved = false;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    function pointFromEvent(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clamp((event.clientX - rect.left) * canvas.width / rect.width, 0, canvas.width),
        y: clamp((event.clientY - rect.top) * canvas.height / rect.height, 0, canvas.height)
      };
    }
    function snapshot() {
      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    function pushUndo(image) {
      undoStack.push(image || snapshot());
      if (undoStack.length > 24) undoStack.shift();
      redoStack.length = 0;
    }
    function updateLabel() {
      const names = { pencil: 'Pencil', brush: 'Brush', eraser: 'Eraser', line: 'Line', rect: 'Rectangle', ellipse: 'Ellipse', fill: 'Fill' };
      toolLabel.textContent = `${names[tool]} · ${size} px`;
    }
    function hexToRgba(hex) {
      const value = hex.replace('#', '');
      const expanded = value.length === 3 ? value.split('').map((ch) => ch + ch).join('') : value;
      return [parseInt(expanded.slice(0, 2), 16), parseInt(expanded.slice(2, 4), 16), parseInt(expanded.slice(4, 6), 16), 255];
    }
    function floodFill(x, y, fillColor) {
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;
      const width = canvas.width;
      const height = canvas.height;
      const startX = Math.floor(x);
      const startY = Math.floor(y);
      if (startX < 0 || startY < 0 || startX >= width || startY >= height) return;
      const startIndex = (startY * width + startX) * 4;
      const target = [data[startIndex], data[startIndex + 1], data[startIndex + 2], data[startIndex + 3]];
      const fill = hexToRgba(fillColor);
      if (target.every((value, index) => value === fill[index])) return;
      const stack = [[startX, startY]];
      const visited = new Uint8Array(width * height);
      while (stack.length) {
        const [px, py] = stack.pop();
        if (px < 0 || py < 0 || px >= width || py >= height) continue;
        const pixel = py * width + px;
        if (visited[pixel]) continue;
        visited[pixel] = 1;
        const index = pixel * 4;
        if (Math.abs(data[index] - target[0]) > 24 || Math.abs(data[index + 1] - target[1]) > 24 || Math.abs(data[index + 2] - target[2]) > 24 || Math.abs(data[index + 3] - target[3]) > 24) continue;
        data[index] = fill[0]; data[index + 1] = fill[1]; data[index + 2] = fill[2]; data[index + 3] = fill[3];
        stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
      }
      ctx.putImageData(image, 0, 0);
    }
    function drawShape(point) {
      if (!shapeSnapshot) return;
      ctx.putImageData(shapeSnapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.beginPath();
      if (tool === 'line') {
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(point.x, point.y);
      } else if (tool === 'rect') {
        ctx.rect(startPoint.x, startPoint.y, point.x - startPoint.x, point.y - startPoint.y);
      } else if (tool === 'ellipse') {
        const cx = (startPoint.x + point.x) / 2;
        const cy = (startPoint.y + point.y) / 2;
        const rx = Math.abs(point.x - startPoint.x) / 2;
        const ry = Math.abs(point.y - startPoint.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const point = pointFromEvent(event);
      startPoint = point;
      lastPoint = point;
      drawing = true;
      moved = false;
      canvas.setPointerCapture(event.pointerId);
      if (tool === 'fill') {
        pushUndo();
        floodFill(point.x, point.y, color);
        drawing = false;
        return;
      }
      shapeSnapshot = snapshot();
      if (tool === 'line' || tool === 'rect' || tool === 'ellipse') pushUndo(shapeSnapshot);
      if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
        pushUndo(shapeSnapshot);
        ctx.beginPath();
        ctx.arc(point.x, point.y, (tool === 'brush' ? size * 1.4 : size) / 2, 0, Math.PI * 2);
        ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.fill();
      }
    });
    canvas.addEventListener('pointermove', (event) => {
      const point = pointFromEvent(event);
      positionEl.textContent = `${Math.round(point.x)}, ${Math.round(point.y)} px`;
      if (!drawing) return;
      moved = true;
      if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = tool === 'brush' ? size * 1.5 : size;
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      } else {
        drawShape(point);
      }
      lastPoint = point;
    });
    const finishStroke = (event) => {
      if (!drawing) return;
      drawing = false;
      if (event && (tool === 'line' || tool === 'rect' || tool === 'ellipse')) drawShape(pointFromEvent(event));
      shapeSnapshot = null;
      if (canvas.hasPointerCapture(event?.pointerId)) {
        try { canvas.releasePointerCapture(event.pointerId); } catch (_) {}
      }
    };
    canvas.addEventListener('pointerup', finishStroke);
    canvas.addEventListener('pointercancel', finishStroke);
    canvas.addEventListener('pointerleave', (event) => { if (drawing && event.buttons === 0) finishStroke(event); });
    function selectTool(nextTool) {
      tool = nextTool;
      $$('[data-paint-tool]', root).forEach((button) => button.classList.toggle('active', button.dataset.paintTool === tool));
      canvas.style.cursor = tool === 'fill' ? 'cell' : 'crosshair';
      updateLabel();
    }
    async function clearCanvas() {
      const confirmed = await confirmDialog('Clear canvas', 'Do you want to clear the entire canvas?', 'Clear');
      if (!confirmed) return;
      pushUndo();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      toast('Canvas cleared', 'The canvas is now blank.', 'paint');
    }
    function saveImage() {
      const link = document.createElement('a');
      link.download = 'paint-drawing.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast('Image saved', 'Your drawing was exported as paint-drawing.png.', 'download');
    }
    root.addEventListener('click', (event) => {
      const toolButton = event.target.closest('[data-paint-tool]');
      if (toolButton) { selectTool(toolButton.dataset.paintTool); return; }
      const sizeButton = event.target.closest('[data-paint-size]');
      if (sizeButton) {
        size = Number(sizeButton.dataset.paintSize);
        $$('[data-paint-size]', root).forEach((button) => button.classList.toggle('active', button === sizeButton));
        updateLabel();
        return;
      }
      const swatch = event.target.closest('[data-paint-color]');
      if (swatch) {
        color = swatch.dataset.paintColor;
        $$('[data-paint-color]', root).forEach((button) => button.classList.toggle('active', button === swatch));
        const input = $('[data-paint-color-input]', root);
        if (input) input.value = color;
        return;
      }
      if (event.target.closest('[data-paint-undo]')) {
        if (!undoStack.length) return;
        redoStack.push(snapshot());
        ctx.putImageData(undoStack.pop(), 0, 0);
        return;
      }
      if (event.target.closest('[data-paint-redo]')) {
        if (!redoStack.length) return;
        undoStack.push(snapshot());
        ctx.putImageData(redoStack.pop(), 0, 0);
        return;
      }
      const action = event.target.closest('[data-paint-action]');
      if (action && action.dataset.paintAction === 'clear') clearCanvas();
      if (action && action.dataset.paintAction === 'save') saveImage();
    });
    $('[data-paint-color-input]', root).addEventListener('input', (event) => {
      color = event.target.value;
      $$('[data-paint-color]', root).forEach((button) => button.classList.remove('active'));
    });
    const keyHandler = (event) => {
      if (WM.focusedId !== win.id) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (!undoStack.length) return;
        redoStack.push(snapshot());
        ctx.putImageData(undoStack.pop(), 0, 0);
      } else if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (!redoStack.length) return;
        undoStack.push(snapshot());
        ctx.putImageData(redoStack.pop(), 0, 0);
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveImage();
      }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => document.removeEventListener('keydown', keyHandler));
    updateLabel();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: TERMINAL — PowerShell-like shell over the virtual file system
// ═══════════════════════════════════════
APPS.terminal = {
  title: 'Terminal',
  icon: 'terminal',
  width: 980,
  height: 620,
  minWidth: 560,
  minHeight: 350,
  build({ win, cleanup, toast }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root terminal-app');
    win.body.appendChild(root);
    const tabs = [];
    let activeId = null;
    let tabCounter = 0;
    let matrixTimer = null;
    let matrixFrame = null;
    let toastTimer = null;

    function displayPath(path) {
      if (!path || path === '/') return 'C:\\Users\\User';
      return `C:\\Users\\User${path.replace(/\//g, '\\')}`;
    }
    function activeTab() {
      return tabs.find((tab) => tab.id === activeId) || tabs[0];
    }
    function createTab(focus = true) {
      tabCounter++;
      const tab = {
        id: uid('term'),
        title: `PowerShell ${tabCounter}`,
        path: '/',
        lines: [],
        history: [],
        historyIndex: 0,
        pending: ''
      };
      tab.lines.push({ text: 'Windows PowerShell', cls: 'dim' });
      tab.lines.push({ text: 'Copyright (C) Microsoft Corporation. All rights reserved.', cls: 'dim' });
      tab.lines.push({ text: '' });
      tab.lines.push({ text: 'Type "help" to see available commands.', cls: 'yellow' });
      tab.lines.push({ text: '' });
      tabs.push(tab);
      activeId = tab.id;
      render();
      if (focus) focusInput();
      return tab;
    }
    function closeTab(id) {
      const index = tabs.findIndex((tab) => tab.id === id);
      if (index < 0) return;
      if (tabs.length === 1) {
        tabs[0].lines = [];
        tabs[0].path = '/';
        tabs[0].history = [];
        activeId = tabs[0].id;
      } else {
        tabs.splice(index, 1);
        if (activeId === id) activeId = tabs[Math.max(0, index - 1)].id;
      }
      render();
      focusInput();
    }
    function print(text = '', cls = '') {
      const tab = activeTab();
      const chunks = String(text).split('\n');
      chunks.forEach((line) => tab.lines.push({ text: line, cls }));
      if (tab.lines.length > 1200) tab.lines.splice(0, tab.lines.length - 1200);
    }
    function focusInput() {
      setTimeout(() => {
        const input = $('.term-input', root);
        if (input) input.focus();
      }, 20);
    }
    function renderTabs() {
      const bar = $('.term-tabbar', root);
      if (!bar) return;
      bar.innerHTML = `${tabs.map((tab) => `<button class="term-tab ${tab.id === activeId ? 'active' : ''}" type="button" data-term-tab="${tab.id}">
        <span class="tt-icon">${getIcon('terminal', 14)}</span><span class="tt-title">${esc(tab.title)}</span>
        <span class="tt-close" data-term-close="${tab.id}" role="button" aria-label="Close tab">${getIcon('close', 8)}</span>
      </button>`).join('')}<button class="term-newtab" type="button" data-term-new aria-label="New terminal tab">${getIcon('plus', 12)}</button>`;
    }
    function render() {
      const tab = activeTab();
      root.innerHTML = `<div class="term-tabbar"></div><div class="term-surface" data-term-surface role="log" aria-live="polite"></div>`;
      renderTabs();
      const surface = $('[data-term-surface]', root);
      surface.innerHTML = `${tab.lines.map((line) => `<div class="term-line ${line.cls || ''}">${line.text ? esc(line.text) : '&nbsp;'}</div>`).join('')}
        <div class="term-prompt-line"><span class="term-prompt">PS ${esc(displayPath(tab.path))}&gt;&nbsp;</span><input class="term-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command"></div>`;
      surface.scrollTop = surface.scrollHeight;
      const input = $('.term-input', root);
      input.value = tab.pending;
      input.addEventListener('keydown', (event) => handleInput(event, input, tab));
      input.addEventListener('input', () => { tab.pending = input.value; });
      win.setTitle(`${tab.title} - Terminal`);
    }
    function parseArgs(value) {
      const args = [];
      let current = '';
      let quote = null;
      for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (quote) {
          if (ch === quote) quote = null;
          else current += ch;
        } else if (ch === '"' || ch === "'") {
          quote = ch;
        } else if (/\s/.test(ch)) {
          if (current) { args.push(current); current = ''; }
        } else {
          current += ch;
        }
      }
      if (current) args.push(current);
      return args;
    }
    function resolvePath(raw = '.') {
      const tab = activeTab();
      let value = String(raw || '.').trim().replace(/\\/g, '/').replace(/^"|"$/g, '');
      if (value === '~') value = '/';
      if (/^[a-zA-Z]:/.test(value)) {
        value = value.replace(/^[a-zA-Z]:/, '');
        const prefix = '/Users/User';
        if (value.toLowerCase().startsWith(prefix.toLowerCase())) value = value.slice(prefix.length) || '/';
        if (!value.startsWith('/')) value = `/${value}`;
      } else if (!value.startsWith('/')) {
        value = `${tab.path}/${value}`;
      }
      return FS.normalize(value);
    }
    function nodeLabel(node) {
      if (node.type === 'folder') return `<DIR>          ${node.name}`;
      return `${String(formatBytes(nodeSize(node))).padStart(14, ' ')}  ${node.name}`;
    }
    function listDirectory(path) {
      const node = FS.get(path);
      if (!node) { print(`Cannot find path '${displayPath(path)}' because it does not exist.`, 'red'); return; }
      if (node.type !== 'folder') { print(`${displayPath(path)} is a file, not a directory.`, 'red'); return; }
      if (!(node.children || []).length) { print('The directory is empty.', 'dim'); return; }
      print(`    Directory: ${displayPath(path)}`, 'dim');
      print('');
      print('Mode           Name', 'dim');
      print('----           ----', 'dim');
      [...node.children].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1)).forEach((child) => print(nodeLabel(child)));
    }
    function copyNode(node, destinationPath, desiredName) {
      if (node.type === 'folder') {
        const created = FS.createFolder(destinationPath, desiredName || node.name);
        (node.children || []).forEach((child) => copyNode(child, FS.join(destinationPath, created.name), child.name));
      } else {
        FS.createFile(destinationPath, desiredName || node.name, node.content || '');
      }
    }
    function treeLines(path, prefix = '', depth = 0, output = []) {
      const node = FS.get(path);
      if (!node || node.type !== 'folder' || depth > 4) return output;
      const children = [...(node.children || [])].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
      children.forEach((child, index) => {
        const last = index === children.length - 1;
        output.push(`${prefix}${last ? '└── ' : '├── '}${child.name}${child.type === 'folder' ? '\\' : ''}`);
        if (child.type === 'folder') treeLines(FS.join(path, child.name), `${prefix}${last ? '    ' : '│   '}`, depth + 1, output);
      });
      return output;
    }
    function matrixEffect() {
      const surface = $('[data-term-surface]', root);
      if (!surface) return;
      const canvas = h('canvas', 'term-canvas');
      canvas.width = surface.clientWidth;
      canvas.height = surface.clientHeight;
      surface.appendChild(canvas);
      const context = canvas.getContext('2d');
      const glyphs = '01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';
      const columns = Math.max(1, Math.floor(canvas.width / 14));
      const drops = Array.from({ length: columns }, () => Math.random() * canvas.height / 18);
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);
      const draw = () => {
        context.fillStyle = 'rgba(0,0,0,.08)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#16c60c';
        context.font = '14px Consolas, monospace';
        drops.forEach((drop, index) => {
          const char = glyphs[Math.floor(Math.random() * glyphs.length)];
          context.fillText(char, index * 14, drop * 18);
          if (drop * 18 > canvas.height && Math.random() > 0.975) drops[index] = 0;
          else drops[index] += 0.65;
        });
        matrixFrame = requestAnimationFrame(draw);
      };
      draw();
      clearTimeout(matrixTimer);
      matrixTimer = setTimeout(() => {
        cancelAnimationFrame(matrixFrame);
        canvas.remove();
        print('Wake up, Neo...', 'green');
        render();
        focusInput();
      }, 4200);
    }
    function execute(command) {
      const tab = activeTab();
      const trimmed = command.trim();
      if (!trimmed) return;
      const [rawCommand, ...args] = parseArgs(trimmed);
      const commandName = rawCommand.toLowerCase();
      const rest = args.join(' ');
      const openMap = {
        notepad: 'notepad', calc: 'calculator', calculator: 'calculator', settings: 'settings', explorer: 'explorer',
        code: 'vscode', vscode: 'vscode', paint: 'paint', store: 'store', taskmgr: 'taskmanager',
        'task-manager': 'taskmanager', edge: 'edge', terminal: 'terminal', about: 'about'
      };
      if (['help', '?', 'get-help'].includes(commandName)) {
        print('Available commands:', 'yellow');
        print('  help                 Show this help');
        print('  clear / cls          Clear the terminal');
        print('  ls / dir [path]      List files and folders');
        print('  cd [path]            Change the current directory');
        print('  pwd                  Print the working directory');
        print('  cat / type <file>    Display a text file');
        print('  mkdir <name>         Create a folder');
        print('  touch <name>         Create an empty file');
        print('  rm / del <path>      Move an item to the Recycle Bin');
        print('  copy <src> <dest>    Copy a file or folder');
        print('  move <src> <dest>    Move a file or folder');
        print('  tree [path]          Show the folder tree');
        print('  open <app>           Launch an installed app');
        print('  code [file]          Open Visual Studio Code');
        print('  notepad [file]       Open Notepad');
        print('  theme dark|light     Change the Windows theme');
        print('  neofetch             Show system information');
        print('  matrix | bsod        Easter eggs');
        print('  exit                 Close the terminal');
        return;
      }
      if (['clear', 'cls'].includes(commandName)) {
        tab.lines = [];
        return;
      }
      if (commandName === 'echo') {
        print(rest);
        return;
      }
      if (commandName === 'pwd') {
        print(displayPath(tab.path));
        return;
      }
      if (commandName === 'cd') {
        const target = resolvePath(args[0] || '/');
        const node = FS.get(target);
        if (!node || node.type !== 'folder') { print(`Cannot find path '${displayPath(target)}'.`, 'red'); return; }
        tab.path = target;
        return;
      }
      if (['ls', 'dir', 'gci', 'get-childitem'].includes(commandName)) {
        listDirectory(resolvePath(args[0] || tab.path));
        return;
      }
      if (['cat', 'type', 'get-content'].includes(commandName)) {
        if (!args[0]) { print('Usage: cat <file>', 'yellow'); return; }
        const target = resolvePath(args[0]);
        const node = FS.get(target);
        if (!node || node.type !== 'file') { print(`Cannot find file '${displayPath(target)}'.`, 'red'); return; }
        print(node.content || '(empty file)');
        return;
      }
      if (['mkdir', 'md', 'new-item'].includes(commandName)) {
        if (!args[0]) { print('Usage: mkdir <name>', 'yellow'); return; }
        try {
          const target = resolvePath(args[0]);
          const parent = FS.parent(target);
          const name = FS.parts(target).pop();
          const node = FS.createFolder(parent, name);
          print(`Created folder: ${displayPath(FS.join(parent, node.name))}`, 'green');
        } catch (error) {
          print(error.message, 'red');
        }
        return;
      }
      if (['touch', 'ni'].includes(commandName)) {
        if (!args[0]) { print('Usage: touch <name>', 'yellow'); return; }
        try {
          const target = resolvePath(args[0]);
          if (FS.exists(target)) { print(`File already exists: ${displayPath(target)}`, 'yellow'); return; }
          const parent = FS.parent(target);
          const name = FS.parts(target).pop();
          const node = FS.createFile(parent, name, '');
          print(`Created file: ${displayPath(FS.join(parent, node.name))}`, 'green');
        } catch (error) {
          print(error.message, 'red');
        }
        return;
      }
      if (['rm', 'del', 'erase', 'remove-item'].includes(commandName)) {
        if (!args[0]) { print('Usage: rm <path>', 'yellow'); return; }
        const target = resolvePath(args[0]);
        const node = FS.get(target);
        if (!node) { print(`Cannot find path '${displayPath(target)}'.`, 'red'); return; }
        if (FS.remove(target, true)) print(`Moved '${node.name}' to the Recycle Bin.`, 'green');
        else print('The item could not be removed.', 'red');
        return;
      }
      if (['copy', 'cp'].includes(commandName)) {
        if (args.length < 2) { print('Usage: copy <source> <destination>', 'yellow'); return; }
        const source = resolvePath(args[0]);
        const destination = resolvePath(args[1]);
        const node = FS.get(source);
        const dest = FS.get(destination);
        if (!node) { print(`Cannot find path '${displayPath(source)}'.`, 'red'); return; }
        if (!dest || dest.type !== 'folder') { print(`Cannot find destination folder '${displayPath(destination)}'.`, 'red'); return; }
        copyNode(node, destination, node.name);
        print(`Copied '${node.name}' to '${displayPath(destination)}'.`, 'green');
        return;
      }
      if (['move', 'mv'].includes(commandName)) {
        if (args.length < 2) { print('Usage: move <source> <destination>', 'yellow'); return; }
        const source = resolvePath(args[0]);
        const destination = resolvePath(args[1]);
        const node = FS.get(source);
        if (!node) { print(`Cannot find path '${displayPath(source)}'.`, 'red'); return; }
        if (FS.move(source, destination)) print(`Moved '${node.name}'.`, 'green');
        else print('The item could not be moved.', 'red');
        return;
      }
      if (commandName === 'tree') {
        const target = resolvePath(args[0] || tab.path);
        const rootNode = FS.get(target);
        if (!rootNode || rootNode.type !== 'folder') { print('Folder not found.', 'red'); return; }
        print(displayPath(target));
        treeLines(target).forEach((line) => print(line));
        return;
      }
      if (['open', 'start', 'launch'].includes(commandName)) {
        if (!args[0]) { print('Usage: open <app>', 'yellow'); return; }
        if (/^https?:\/\//i.test(args[0])) { openApp('edge', { url: args[0] }); print(`Opening ${args[0]} in Microsoft Edge...`, 'dim'); return; }
        const appId = openMap[args[0].toLowerCase()];
        if (!appId) { print(`Windows cannot find '${args[0]}'.`, 'red'); return; }
        openApp(appId);
        print(`Opening ${APPS[appId].title}...`, 'dim');
        return;
      }
      if (commandName === 'code') { openApp('vscode', args[0] ? { path: resolvePath(args[0]) } : {}); return; }
      if (commandName === 'notepad') { openApp('notepad', args[0] ? { path: resolvePath(args[0]) } : {}); return; }
      if (commandName === 'tree') return;
      if (commandName === 'whoami') { print(`${(state.deviceName || 'DESKTOP-SIM11').toLowerCase()}\\user`); return; }
      if (commandName === 'hostname') { print(state.deviceName || 'DESKTOP-SIM11'); return; }
      if (commandName === 'date') { print(new Date().toDateString()); return; }
      if (commandName === 'time') { print(new Date().toLocaleTimeString('en-US')); return; }
      if (commandName === 'ver') { print('Microsoft Windows [Version 10.0.26100.1742]'); return; }
      if (commandName === 'history') {
        tab.history.forEach((item, index) => print(`  ${String(index + 1).padStart(3, ' ')}  ${item}`));
        return;
      }
      if (commandName === 'theme') {
        if (!['dark', 'light'].includes((args[0] || '').toLowerCase())) { print('Usage: theme dark|light', 'yellow'); return; }
        applyTheme(args[0].toLowerCase());
        print(`Windows theme set to ${args[0].toLowerCase()}.`, 'green');
        return;
      }
      if (commandName === 'neofetch') {
        print(`        ###   ###        User@${state.deviceName || 'DESKTOP-SIM11'}`, 'green');
        print('        ###   ###        -------------------', 'green');
        print('        ###   ###        OS: Windows 11 Pro 24H2', 'green');
        print('        ###########      Kernel: 10.0.26100', 'green');
        print('        ###########      Shell: PowerShell Simulator', 'green');
        print('        ###   ###        Terminal: Windows Terminal', 'green');
        print('        ###   ###        CPU: Web CPU @ 4.20 GHz', 'green');
        print('        ###   ###        Memory: 7.4 GiB / 16.0 GiB', 'green');
        print('');
        return;
      }
      if (commandName === 'matrix') {
        matrixEffect();
        return;
      }
      if (commandName === 'bsod') { showBSOD(); return; }
      if (commandName === 'clippy') { showClippy(); print('Clippy is here to help. Probably.', 'yellow'); return; }
      if (commandName === 'rick') {
        openApp('edge', { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
        print('Never gonna give you up...', 'green');
        return;
      }
      if (commandName === 'sudo') {
        print('User is not in the sudoers file. This incident has been reported.', 'red');
        toast('Terminal', 'Nice try. This is Windows.', 'terminal');
        return;
      }
      if (commandName === 'exit') { win.close(); return; }
      if (commandName === 'color') {
        applyAccent(args[0] && /^#[0-9a-f]{6}$/i.test(args[0]) ? args[0] : '#0078D4');
        print('Terminal accent updated.', 'green');
        return;
      }
      print(`The term '${rawCommand}' is not recognized as a name of a cmdlet, function, script file, or executable program.`, 'red');
      print('Type "help" to see available commands.', 'dim');
    }
    function completeInput(input, tab) {
      const value = input.value;
      const lastSpace = value.lastIndexOf(' ');
      const fragment = value.slice(lastSpace + 1);
      if (!fragment) return;
      const folder = FS.get(tab.path);
      if (!folder || folder.type !== 'folder') return;
      const match = (folder.children || []).map((node) => node.name).find((name) => name.toLowerCase().startsWith(fragment.toLowerCase()));
      if (match) {
        input.value = `${value.slice(0, lastSpace + 1)}${match}${FS.get(FS.join(tab.path, match))?.type === 'folder' ? '\\' : ''}`;
        tab.pending = input.value;
      }
    }
    function handleInput(event, input, tab) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const command = input.value;
        tab.pending = '';
        print(`PS ${displayPath(tab.path)}> ${command}`, 'command');
        if (command.trim()) {
          tab.history.push(command);
          tab.historyIndex = tab.history.length;
        }
        execute(command);
        render();
        focusInput();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (!tab.history.length) return;
        tab.historyIndex = Math.max(0, tab.historyIndex - 1);
        input.value = tab.history[tab.historyIndex] || '';
        tab.pending = input.value;
        input.setSelectionRange(input.value.length, input.value.length);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        tab.historyIndex = Math.min(tab.history.length, tab.historyIndex + 1);
        input.value = tab.history[tab.historyIndex] || '';
        tab.pending = input.value;
        input.setSelectionRange(input.value.length, input.value.length);
      } else if (event.key === 'Tab') {
        event.preventDefault();
        completeInput(input, tab);
      } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        tab.lines = [];
        render();
        focusInput();
      } else if (event.ctrlKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        print('^C', 'dim');
        tab.pending = '';
        render();
        focusInput();
      }
    }
    root.addEventListener('click', (event) => {
      const closeButton = event.target.closest('[data-term-close]');
      if (closeButton) { event.stopPropagation(); closeTab(closeButton.dataset.termClose); return; }
      const tabButton = event.target.closest('[data-term-tab]');
      if (tabButton) { activeId = tabButton.dataset.termTab; render(); focusInput(); return; }
      if (event.target.closest('[data-term-new]')) { createTab(); return; }
      const surface = event.target.closest('[data-term-surface]');
      if (surface && !event.target.closest('input')) focusInput();
    });
    createTab();
    cleanup(() => {
      clearTimeout(matrixTimer);
      cancelAnimationFrame(matrixFrame);
      clearTimeout(toastTimer);
    });
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: VISUAL STUDIO CODE — files, syntax highlighting and terminal
// ═══════════════════════════════════════
APPS.vscode = {
  title: 'Visual Studio Code',
  icon: 'vscode',
  width: 1120,
  height: 730,
  minWidth: 720,
  minHeight: 470,
  onReopen(win, params) {
    if (params.path && win.vscodeOpenPath) win.vscodeOpenPath(params.path);
  },
  build({ win, params, cleanup, toast }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root vscode-app');
    win.body.appendChild(root);
    const openFiles = [];
    const expanded = new Set(['/Documents', '/Pictures', '/Downloads']);
    let activePath = null;
    let activity = 'explorer';
    let sidebarVisible = true;
    let terminalVisible = true;
    let searchQuery = '';
    let editorFocused = false;
    let termPath = '/';
    let termLines = [
      { text: 'Windows PowerShell', cls: 'dim' },
      { text: 'Copyright (C) Microsoft Corporation. All rights reserved.', cls: 'dim' },
      { text: '' },
      { text: 'Type "help" for available commands.', cls: 'dim' }
    ];
    let termHistory = [];
    let termHistoryIndex = 0;

    function languageFor(path) {
      const ext = fileExtension(path);
      return ({ js: 'javascript', ts: 'typescript', json: 'json', html: 'html', css: 'css', md: 'markdown', py: 'python', xml: 'xml' })[ext] || 'plaintext';
    }
    function basename(path) { return FS.parts(path).pop() || 'Untitled'; }
    function activeFile() { return openFiles.find((file) => file.path === activePath) || null; }
    function updateTitle() {
      const file = activeFile();
      win.setTitle(`${file ? `${file.dirty ? '● ' : ''}${basename(file.path)}` : 'Welcome'} - Visual Studio Code`);
    }
    function escapeToken(code) { return esc(code); }
    function highlightCode(code, language) {
      if (!code) return '';
      if (language === 'plaintext') return esc(code);
      let rules = [];
      if (['javascript', 'typescript', 'python'].includes(language)) {
        rules = [
          { cls: 'vsc-syntax-comment', pattern: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|#[^\\n]*' },
          { cls: 'vsc-syntax-string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`' },
          { cls: 'vsc-syntax-key', pattern: '\\b(?:const|let|var|function|return|if|else|for|while|class|new|this|import|from|export|default|async|await|try|catch|throw|typeof|instanceof|in|of|switch|case|break|continue|true|false|null|undefined|def|elif|except|pass|with|as|lambda|yield)\\b' },
          { cls: 'vsc-syntax-num', pattern: '\\b\\d+(?:\\.\\d+)?\\b' },
          { cls: 'vsc-syntax-fn', pattern: '\\b[A-Za-z_$][\\w$]*(?=\\s*\\()' },
          { cls: 'vsc-syntax-punc', pattern: '[{}()\\[\\];,.]' }
        ];
      } else if (language === 'json') {
        rules = [
          { cls: 'vsc-syntax-string', pattern: '"(?:\\\\.|[^"\\\\])*"' },
          { cls: 'vsc-syntax-key', pattern: '\\b(?:true|false|null)\\b' },
          { cls: 'vsc-syntax-num', pattern: '-?\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b' },
          { cls: 'vsc-syntax-punc', pattern: '[{}\\[\\],:]' }
        ];
      } else if (language === 'css') {
        rules = [
          { cls: 'vsc-syntax-comment', pattern: '\\/\\*[\\s\\S]*?\\*\\/' },
          { cls: 'vsc-syntax-string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' },
          { cls: 'vsc-syntax-selector', pattern: '[.#]?[A-Za-z_-][\\w-]*(?=\\s*[{,])|:[a-z-]+' },
          { cls: 'vsc-syntax-prop', pattern: '[a-z-]+(?=\\s*:)' },
          { cls: 'vsc-syntax-num', pattern: '#[0-9a-fA-F]{3,8}\\b|\\b\\d+(?:\\.\\d+)?(?:px|em|rem|%|vh|vw|s|ms|deg)?\\b' },
          { cls: 'vsc-syntax-punc', pattern: '[{}():;,]' }
        ];
      } else if (language === 'html' || language === 'xml') {
        rules = [
          { cls: 'vsc-syntax-comment', pattern: '<!--[\\s\\S]*?-->' },
          { cls: 'vsc-syntax-tag', pattern: '</?[A-Za-z][^>]*>' },
          { cls: 'vsc-syntax-string', pattern: '"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'' }
        ];
      } else if (language === 'markdown') {
        rules = [
          { cls: 'vsc-syntax-key', pattern: '^#{1,6} [^\\n]*' },
          { cls: 'vsc-syntax-fn', pattern: '\\*\\*[^*]+\\*\\*|__[^_]+__' },
          { cls: 'vsc-syntax-string', pattern: '`[^`]+`' },
          { cls: 'vsc-syntax-comment', pattern: '^> .*$' }
        ];
      }
      if (!rules.length) return esc(code);
      const regex = new RegExp(rules.map((rule) => `(${rule.pattern})`).join('|'), 'gm');
      let output = '';
      let last = 0;
      let match;
      while ((match = regex.exec(code)) !== null) {
        if (match[0] === '') { regex.lastIndex++; continue; }
        output += escapeToken(code.slice(last, match.index));
        const groupIndex = match.slice(1).findIndex((value) => value !== undefined);
        const rule = rules[groupIndex] || rules[0];
        output += `<span class="${rule.cls}">${escapeToken(match[0])}</span>`;
        last = regex.lastIndex;
      }
      output += escapeToken(code.slice(last));
      return output;
    }
    function collectFiles(node, path, depth, output) {
      if (depth > 6) return output;
      (node.children || []).forEach((child) => {
        const childPath = FS.join(path, child.name);
        output.push({ node: child, path: childPath });
        if (child.type === 'folder') collectFiles(child, childPath, depth + 1, output);
      });
      return output;
    }
    function treeHtml(path, depth = 0) {
      const node = FS.get(path);
      if (!node || node.type !== 'folder') return '';
      const sorted = [...(node.children || [])].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
      return sorted.map((child) => {
        const childPath = FS.join(path, child.name);
        const isFolder = child.type === 'folder';
        const isOpen = expanded.has(childPath);
        const active = activePath === childPath;
        return `<button class="vsc-tree-row ${active ? 'active' : ''}" type="button" data-vsc-tree="${esc(childPath)}" data-vsc-dir="${isFolder ? '1' : '0'}" style="padding-left:${7 + depth * 12}px">
          <span class="vsc-chev ${isOpen ? 'open' : ''}">${isFolder ? getIcon('chevron-right', 11) : ''}</span>
          <span class="vsc-file-icon">${getIcon(fileIconName(child), 15)}</span>
          <span>${esc(child.name)}</span>
        </button>${isFolder && isOpen ? treeHtml(childPath, depth + 1) : ''}`;
      }).join('');
    }
    function sidebarHtml() {
      if (activity === 'search') {
        const results = searchQuery.trim() ? collectFiles(FS.root(), '/', 0, []).filter((entry) => entry.node.type === 'file' && (entry.node.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(entry.node.content || '').toLowerCase().includes(searchQuery.toLowerCase()))).slice(0, 40) : [];
        return `<div class="vsc-side-title">Search</div>
          <div style="padding:7px"><input class="vsc-search-input" type="text" value="${esc(searchQuery)}" placeholder="Search files" data-vsc-search aria-label="Search files"></div>
          <div class="vsc-tree" data-vsc-search-results>${searchQuery.trim() ? (results.length ? results.map((entry) => `<button class="vsc-tree-row" type="button" data-vsc-tree="${esc(entry.path)}"><span class="vsc-file-icon">${getIcon(fileIconName(entry.node), 15)}</span><span style="overflow:hidden;text-overflow:ellipsis">${esc(entry.node.name)}</span><span style="margin-left:auto;font-size:9px;color:#858585">${esc(entry.path.split('/').slice(-2, -1)[0] || '/')}</span></button>`).join('') : '<div class="vsc-side-empty">No results found.</div>') : '<div class="vsc-side-empty">Search across the virtual file system.</div>'}</div>`;
      }
      if (activity === 'source') {
        return `<div class="vsc-side-title">Source Control</div><div class="vsc-side-empty">No source control providers are registered.<br><br>Use File → Open Folder to work with a project.</div>`;
      }
      if (activity === 'extensions') {
        return `<div class="vsc-side-title">Extensions</div><div class="vsc-tree">
          ${[['vscode','Microsoft','Language support'],['github','GitHub','GitHub authentication'],['notepad','Text Tools','Plain text utilities'],['paint','Image Preview','Preview image files']].map(([icon, name, desc]) => `<div class="vsc-ext-row"><span class="vsc-ext-icon">${getIcon(icon, 24)}</span><div><strong>${name}</strong><span>${desc}</span></div><span style="margin-left:auto;color:#858585">Built-in</span></div>`).join('')}
        </div>`;
      }
      if (activity === 'debug') {
        return `<div class="vsc-side-title">Run and Debug</div><div class="vsc-side-empty">To customize Run and Debug, create a launch.json file.<br><br><button class="btn primary" type="button" data-vsc-action="debug">Run and Debug</button></div>`;
      }
      return `<div class="vsc-side-title">Explorer <span style="margin-left:auto;font-size:9px;text-transform:none;letter-spacing:0">This PC</span></div>
        <div class="vsc-tree">
          <button class="vsc-tree-row" type="button" data-vsc-tree="/" data-vsc-dir="1" style="padding-left:7px"><span class="vsc-chev open">${getIcon('chevron-right', 11)}</span><span>${getIcon('thispc', 15)}</span><span>THIS PC</span></button>
          ${treeHtml('/', 0)}
        </div>`;
    }
    function tabsHtml() {
      return openFiles.map((file) => `<button class="vsc-etab ${file.path === activePath ? 'active' : ''}" type="button" data-vsc-tab="${esc(file.path)}">
        <span class="vsc-file-icon">${getIcon(fileIconName(FS.get(file.path)), 14)}</span>
        <span>${esc(basename(file.path))}${file.dirty ? ' ●' : ''}</span>
        <span class="vsc-etab-close" data-vsc-tab-close="${esc(file.path)}" role="button" aria-label="Close editor">${getIcon('close', 8)}</span>
      </button>`).join('');
    }
    function minimapHtml(content) {
      return content.split('\n').slice(0, 100).map((line) => `<i style="width:${clamp(line.trim().length * 1.4, 4, 60)}px;opacity:${line.trim() ? .8 : .2}"></i>`).join('');
    }
    function editorHtml() {
      const file = activeFile();
      if (!file) {
        return `<div class="vsc-welcome">
          <div class="vsc-welcome-logo">${getIcon('vscode', 72)}</div>
          <h1>Visual Studio Code</h1>
          <p>Editing evolved</p>
          <div class="vsc-welcome-actions">
            <button class="vsc-welcome-action" type="button" data-vsc-action="new-file"><span>${getIcon('new-file', 19)}</span><div><strong>New File</strong><small>Create a new text file</small></div></button>
            <button class="vsc-welcome-action" type="button" data-vsc-action="open-file"><span>${getIcon('folder-open', 19)}</span><div><strong>Open File</strong><small>Open a file from This PC</small></div></button>
            <button class="vsc-welcome-action" type="button" data-vsc-action="toggle-terminal"><span>${getIcon('terminal', 19)}</span><div><strong>Show Terminal</strong><small>Run commands in the workspace</small></div></button>
            <button class="vsc-welcome-action" type="button" data-vsc-action="command-palette"><span>${getIcon('search', 19)}</span><div><strong>Command Palette</strong><small>Access all commands</small></div></button>
          </div>
          <div class="vsc-welcome-recent"><strong>Recent</strong>${['/Documents/Personal/Notes.txt','/Documents/Personal/Todo.txt','/Documents/Work/Report.docx'].map((path) => `<button type="button" data-vsc-tree="${path}">${getIcon('text-file', 14)}<span>${esc(path)}</span></button>`).join('')}</div>
        </div>`;
      }
      const content = file.content || '';
      const lines = content.split('\n');
      return `<div class="vsc-gutter" data-vsc-gutter>${lines.map((_, index) => index + 1).join('<br>')}</div>
        <div class="vsc-code-area">
          <pre class="vsc-highlight" data-vsc-highlight>${highlightCode(content, languageFor(file.path))}</pre>
          <textarea class="vsc-code-input" data-vsc-code spellcheck="false" wrap="off" aria-label="${esc(basename(file.path))} editor"></textarea>
        </div>
        <div class="vsc-minimap" data-vsc-minimap>${minimapHtml(content)}</div>`;
    }
    function terminalHtml() {
      return `<div class="vsc-terminal ${terminalVisible ? '' : 'collapsed'}" data-vsc-terminal>
        <div class="vsc-term-head"><span>Terminal</span><span>Problems</span><span>Output</span><span>Debug Console</span><span class="vsc-term-actions"><button type="button" data-vsc-term-action="new" aria-label="New terminal">${getIcon('plus', 12)}</button><button type="button" data-vsc-term-action="close" aria-label="Close panel">${getIcon('close', 11)}</button></span></div>
        <div class="vsc-term-body ${terminalVisible ? '' : 'hidden'}">
          ${termLines.map((line) => `<div class="${line.cls || ''}" style="white-space:pre-wrap">${line.text ? esc(line.text) : '&nbsp;'}</div>`).join('')}
          <div class="vsc-term-input-row"><span style="color:#16c60c">PS ${esc(termPath === '/' ? 'C:\\Users\\User' : 'C:\\Users\\User' + termPath.replace(/\//g, '\\'))}&gt;&nbsp;</span><input class="vsc-term-input" type="text" spellcheck="false" autocomplete="off" aria-label="Integrated terminal command"></div>
        </div>
      </div>`;
    }
    function statusHtml() {
      const file = activeFile();
      const position = $('[data-vsc-code]', root);
      let line = 1, column = 1;
      if (position) {
        const before = position.value.slice(0, position.selectionStart);
        line = before.split('\n').length;
        column = before.length - before.lastIndexOf('\n');
      }
      return `<span>${getIcon('github', 12)} main*</span><span>${getIcon('refresh', 11)} 0 ↓ 0 ↑</span><span>${getIcon('close', 10)} 0</span><span>${getIcon('info', 10)} 0</span><span>Ln ${line}, Col ${column}</span><span>Spaces: 2</span><span>UTF-8</span><span>${file ? languageFor(file.path) : 'Plain Text'}</span><span class="vsc-status-right"><span>${getIcon('notification', 11)}</span><span>Prettier</span><span>${getIcon('check', 11)}</span></span>`;
    }
    function bindEditor() {
      const textarea = $('[data-vsc-code]', root);
      if (!textarea) return;
      const file = activeFile();
      if (!file) return;
      textarea.value = file.content || '';
      textarea.addEventListener('input', () => {
        file.content = textarea.value;
        file.dirty = true;
        updateEditorDecorations();
        renderTabsOnly();
        updateTitle();
      });
      textarea.addEventListener('scroll', () => {
        const highlight = $('[data-vsc-highlight]', root);
        const gutter = $('[data-vsc-gutter]', root);
        if (highlight) { highlight.scrollTop = textarea.scrollTop; highlight.scrollLeft = textarea.scrollLeft; }
        if (gutter) gutter.scrollTop = textarea.scrollTop;
      });
      textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
          event.preventDefault();
          textarea.setRangeText('  ', textarea.selectionStart, textarea.selectionEnd, 'end');
          textarea.dispatchEvent(new Event('input'));
        } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault();
          saveActive();
        } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w') {
          event.preventDefault();
          closeFile(activePath);
        } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
          event.preventDefault();
          promptOpenFile();
        } else if ((event.ctrlKey || event.metaKey) && event.key === '`') {
          event.preventDefault();
          terminalVisible = !terminalVisible;
          render();
        }
      });
      textarea.addEventListener('click', () => { const bar = $('.vsc-statusbar', root); if (bar) bar.innerHTML = statusHtml(); });
      textarea.addEventListener('keyup', () => { const bar = $('.vsc-statusbar', root); if (bar) bar.innerHTML = statusHtml(); });
      if (editorFocused) {
        editorFocused = false;
        setTimeout(() => textarea.focus(), 30);
      }
    }
    function renderTabsOnly() {
      const container = $('.vsc-editor-tabs', root);
      if (container) container.innerHTML = tabsHtml();
    }
    function renderSidebarOnly() {
      const sidebar = $('.vsc-sidebar', root);
      if (sidebar) sidebar.innerHTML = sidebarHtml();
    }
    function renderTerminalOnly() {
      const terminal = $('[data-vsc-terminal]', root);
      if (terminal) terminal.outerHTML = terminalHtml();
    }
    function updateEditorDecorations() {
      const file = activeFile();
      if (!file) return;
      const highlight = $('[data-vsc-highlight]', root);
      const gutter = $('[data-vsc-gutter]', root);
      const minimap = $('[data-vsc-minimap]', root);
      const textarea = $('[data-vsc-code]', root);
      const lines = file.content.split('\n');
      if (highlight) highlight.innerHTML = highlightCode(file.content, languageFor(file.path));
      if (gutter) gutter.innerHTML = lines.map((_, index) => index + 1).join('<br>');
      if (minimap) minimap.innerHTML = minimapHtml(file.content);
      if (textarea) {
        if (highlight) { highlight.scrollTop = textarea.scrollTop; highlight.scrollLeft = textarea.scrollLeft; }
        if (gutter) gutter.scrollTop = textarea.scrollTop;
      }
      const bar = $('.vsc-statusbar', root);
      if (bar) bar.innerHTML = statusHtml();
    }
    function render() {
      const file = activeFile();
      root.innerHTML = `
        <div class="vscode-titlebar">
          <span class="vsc-menu" data-vsc-menu="file">File</span><span class="vsc-menu" data-vsc-menu="edit">Edit</span><span class="vsc-menu" data-vsc-menu="view">View</span><span class="vsc-menu" data-vsc-menu="go">Go</span><span class="vsc-menu" data-vsc-menu="run">Run</span><span class="vsc-menu" data-vsc-menu="help">Help</span>
          <div class="vsc-title"><span>${esc(state.deviceName || 'DESKTOP-SIM11')} — </span>${file ? esc(basename(file.path)) : 'Welcome'}</div>
          <span style="display:flex;gap:7px">${getIcon('chevron-left', 12)}${getIcon('chevron-right', 12)}${getIcon('close', 12)}</span>
        </div>
        <div class="vsc-body">
          <div class="vsc-activity">
            ${[['explorer','files'],['search','search'],['source','github'],['debug','play'],['extensions','grid-view']].map(([id, icon]) => `<button class="vsc-act ${activity === id ? 'active' : ''}" type="button" data-vsc-activity="${id}" aria-label="${id}">${getIcon(icon, 20)}</button>`).join('')}
            <span style="flex:1"></span>
            <button class="vsc-act" type="button" data-vsc-action="settings" aria-label="Settings">${getIcon('settings', 20)}</button>
          </div>
          ${sidebarVisible ? `<aside class="vsc-sidebar">${sidebarHtml()}</aside>` : ''}
          <div class="vsc-main">
            <div class="vsc-editor-tabs">${tabsHtml()}</div>
            <div class="vsc-editor-wrap">${editorHtml()}</div>
            ${terminalHtml()}
          </div>
        </div>
        <div class="vsc-statusbar">${statusHtml()}</div>
      `;
      bindEditor();
      const termInput = $('.vsc-term-input', root);
      if (termInput) {
        termInput.value = '';
        termInput.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const command = termInput.value;
            termInput.value = '';
            runTerminalCommand(command);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            termHistoryIndex = Math.max(0, termHistoryIndex - 1);
            termInput.value = termHistory[termHistoryIndex] || '';
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            termHistoryIndex = Math.min(termHistory.length, termHistoryIndex + 1);
            termInput.value = termHistory[termHistoryIndex] || '';
          }
        });
      }
      updateTitle();
    }
    function openPath(path) {
      const node = FS.get(path);
      if (!node) { toast('File not found', `${path} does not exist.`, 'vscode'); return; }
      if (node.type === 'folder') {
        expanded.add(path);
        if (activity !== 'explorer') { activity = 'explorer'; sidebarVisible = true; }
        render();
        return;
      }
      let file = openFiles.find((entry) => entry.path === path);
      if (!file) {
        file = { path, content: node.content || '', dirty: false };
        openFiles.push(file);
      }
      activePath = path;
      editorFocused = true;
      render();
    }
    function saveActive() {
      const file = activeFile();
      if (!file) return;
      if (FS.writeFile(file.path, file.content)) {
        file.dirty = false;
        render();
        toast('File saved', `${basename(file.path)} was saved.`, 'save');
      } else {
        toast('Save failed', 'The file could not be written.', 'vscode');
      }
    }
    async function closeFile(path) {
      const index = openFiles.findIndex((file) => file.path === path);
      if (index < 0) return;
      if (openFiles[index].dirty) {
        const confirmed = await confirmDialog('Save changes?', `${basename(path)} has unsaved changes. Close without saving?`, 'Close without saving');
        if (!confirmed) return;
      }
      openFiles.splice(index, 1);
      if (activePath === path) activePath = openFiles.length ? openFiles[Math.max(0, index - 1)].path : null;
      render();
    }
    async function newFile() {
      const name = await promptDialog('New file', 'Enter a file name. It will be created in Documents:', 'Untitled-1.txt', 'Create');
      if (name === null || !name.trim()) return;
      try {
        const node = FS.createFile('/Documents', name.trim(), '');
        openPath(FS.join('/Documents', node.name));
      } catch (error) { toast('Could not create file', error.message, 'vscode'); }
    }
    async function promptOpenFile() {
      const path = await promptDialog('Open file', 'Enter a file path:', '/Documents/Personal/Notes.txt', 'Open');
      if (path !== null) openPath(FS.normalize(path));
    }
    function goToLine() {
      const file = activeFile();
      const textarea = $('[data-vsc-code]', root);
      if (!file || !textarea) return;
      const value = prompt('Go to line:', '1');
      if (value === null) return;
      const target = clamp(Number(value) || 1, 1, file.content.split('\n').length);
      const lines = file.content.split('\n');
      let offset = 0;
      for (let i = 0; i < target - 1; i++) offset += lines[i].length + 1;
      textarea.focus();
      textarea.setSelectionRange(offset, offset + lines[target - 1].length);
      textarea.scrollTop = (target - 1) * 19;
    }
    function runTerminalCommand(command) {
      const trimmed = command.trim();
      if (!trimmed) return;
      termHistory.push(trimmed);
      termHistoryIndex = termHistory.length;
      termLines.push({ text: `PS ${termPath === '/' ? 'C:\\Users\\User' : 'C:\\Users\\User' + termPath.replace(/\//g, '\\')}> ${trimmed}`, cls: 'command' });
      const [cmd, ...args] = trimmed.split(/\s+/);
      const name = cmd.toLowerCase();
      if (name === 'clear' || name === 'cls') termLines = [];
      else if (name === 'help') termLines.push({ text: 'Commands: help, clear, pwd, cd, ls, cat, code <file>, open <app>, node --version, git status, date', cls: 'dim' });
      else if (name === 'pwd') termLines.push({ text: termPath });
      else if (name === 'ls' || name === 'dir') {
        const folder = FS.get(termPath);
        if (folder && folder.type === 'folder') (folder.children || []).forEach((child) => termLines.push({ text: `${child.type === 'folder' ? 'd' : '-'}  ${child.name}` }));
      } else if (name === 'cd') {
        const path = FS.normalize(args[0] ? (args[0].startsWith('/') ? args[0] : `${termPath}/${args[0]}`) : '/');
        if (FS.get(path)?.type === 'folder') termPath = path;
        else termLines.push({ text: `cd: no such directory: ${args[0] || ''}`, cls: 'error' });
      } else if (name === 'cat') {
        const path = FS.normalize(args[0] ? (args[0].startsWith('/') ? args[0] : `${termPath}/${args[0]}`) : '');
        const node = FS.get(path);
        if (node?.type === 'file') String(node.content || '').split('\n').forEach((line) => termLines.push({ text: line }));
        else termLines.push({ text: `cat: ${args[0] || ''}: No such file`, cls: 'error' });
      } else if (name === 'code') {
        const path = FS.normalize(args[0] ? (args[0].startsWith('/') ? args[0] : `${termPath}/${args[0]}`) : '');
        if (FS.exists(path)) openPath(path);
        else termLines.push({ text: `code: ${args[0]}: No such file`, cls: 'error' });
      } else if (name === 'node') termLines.push({ text: 'v24.19.0' });
      else if (name === 'npm') termLines.push({ text: '10.8.2' });
      else if (name === 'git') termLines.push({ text: 'On branch main\nnothing to commit, working tree clean', cls: 'dim' });
      else if (name === 'date') termLines.push({ text: new Date().toString() });
      else if (name === 'open' && args[0] && APPS[args[0].toLowerCase()]) openApp(args[0].toLowerCase());
      else termLines.push({ text: `'${cmd}' is not recognized as a command. Type "help".`, cls: 'error' });
      if (termLines.length > 400) termLines.splice(0, termLines.length - 400);
      render();
      const input = $('.vsc-term-input', root);
      if (input) input.focus();
    }
    function showFileMenu(anchor, menu) {
      const rect = anchor.getBoundingClientRect();
      let items = [];
      if (menu === 'file') {
        items = [
          { label: 'New File', icon: 'new-file', shortcut: 'Ctrl+N', action: newFile },
          { label: 'Open File...', icon: 'folder-open', shortcut: 'Ctrl+O', action: promptOpenFile },
          { label: 'Save', icon: 'save', shortcut: 'Ctrl+S', action: saveActive },
          { label: 'Save All', icon: 'save', action: () => { openFiles.forEach((file) => { if (file.dirty && FS.writeFile(file.path, file.content)) file.dirty = false; }); render(); } },
          '-',
          { label: 'Close Editor', icon: 'close', shortcut: 'Ctrl+W', action: () => closeFile(activePath) },
          { label: 'Exit', icon: 'close', action: () => win.close() }
        ];
      } else if (menu === 'edit') {
        const textarea = $('[data-vsc-code]', root);
        items = [
          { label: 'Undo', icon: 'undo', action: () => { textarea?.focus(); document.execCommand('undo'); } },
          { label: 'Redo', icon: 'redo', action: () => { textarea?.focus(); document.execCommand('redo'); } },
          '-',
          { label: 'Cut', icon: 'cut', action: () => { textarea?.focus(); document.execCommand('cut'); } },
          { label: 'Copy', icon: 'copy', action: () => { textarea?.focus(); document.execCommand('copy'); } },
          { label: 'Paste', icon: 'paste', action: () => { textarea?.focus(); document.execCommand('paste'); } },
          '-',
          { label: 'Find', icon: 'search', shortcut: 'Ctrl+F', action: () => { activity = 'search'; sidebarVisible = true; render(); setTimeout(() => $('[data-vsc-search]', root)?.focus(), 40); } }
        ];
      } else if (menu === 'view') {
        items = [
          { label: 'Explorer', icon: 'folder', action: () => { activity = 'explorer'; sidebarVisible = true; render(); } },
          { label: 'Search', icon: 'search', action: () => { activity = 'search'; sidebarVisible = true; render(); } },
          { label: 'Extensions', icon: 'grid-view', action: () => { activity = 'extensions'; sidebarVisible = true; render(); } },
          '-',
          { label: 'Toggle Sidebar', icon: 'list-view', action: () => { sidebarVisible = !sidebarVisible; render(); } },
          { label: 'Toggle Terminal', icon: 'terminal', action: () => { terminalVisible = !terminalVisible; render(); } },
          { label: 'Command Palette...', icon: 'search', shortcut: 'Ctrl+Shift+P', action: commandPalette }
        ];
      } else if (menu === 'go') {
        items = [
          { label: 'Go to File...', icon: 'search', shortcut: 'Ctrl+P', action: promptOpenFile },
          { label: 'Go to Line...', icon: 'list-view', shortcut: 'Ctrl+G', action: goToLine },
          { label: 'Go Back', icon: 'back', action: () => toast('Navigation', 'No previous location.', 'vscode') }
        ];
      } else if (menu === 'run') {
        items = [
          { label: 'Run Without Debugging', icon: 'play', action: () => toast('Run', 'No runnable configuration is available.', 'vscode') },
          { label: 'Start Debugging', icon: 'play', action: () => toast('Debug', 'Create a launch.json file to start debugging.', 'vscode') },
          { label: 'Toggle Breakpoint', icon: 'radio', action: () => toast('Debug', 'Breakpoint toggled on the current line.', 'vscode') }
        ];
      } else {
        items = [
          { label: 'Welcome', icon: 'vscode', action: () => { activePath = null; render(); } },
          { label: 'Documentation', icon: 'info', action: () => toast('Documentation', 'Visual Studio Code documentation is available at code.visualstudio.com.', 'vscode') },
          { label: 'About', icon: 'info', action: () => alertDialog('About Visual Studio Code', 'Visual Studio Code Simulator\nVersion 1.96.0 (Web Edition)\n\nEditing evolved.') }
        ];
      }
      showContextMenu(items, rect.left, rect.bottom + 2);
    }
    function commandPalette() {
      showContextMenu([
        { label: 'New File', icon: 'new-file', action: newFile },
        { label: 'Open File...', icon: 'folder-open', action: promptOpenFile },
        { label: 'Save', icon: 'save', action: saveActive },
        { label: 'Toggle Terminal', icon: 'terminal', action: () => { terminalVisible = !terminalVisible; render(); } },
        { label: 'Split Editor', icon: 'grid-view', action: () => toast('Editor', 'The editor is already using a single pane.', 'vscode') },
        { label: 'Developer: Reload Window', icon: 'refresh', action: () => { render(); toast('Window reloaded', 'The editor was reloaded.', 'refresh'); } }
      ], window.innerWidth / 2 - 120, 100);
    }
    root.addEventListener('click', (event) => {
      const menu = event.target.closest('[data-vsc-menu]');
      if (menu) { showFileMenu(menu, menu.dataset.vscMenu); return; }
      const close = event.target.closest('[data-vsc-tab-close]');
      if (close) { event.stopPropagation(); closeFile(close.dataset.vscTabClose); return; }
      const tab = event.target.closest('[data-vsc-tab]');
      if (tab) { activePath = tab.dataset.vscTab; editorFocused = true; render(); return; }
      const tree = event.target.closest('[data-vsc-tree]');
      if (tree) {
        const path = tree.dataset.vscTree;
        if (tree.dataset.vscDir === '1') {
          if (expanded.has(path)) expanded.delete(path); else expanded.add(path);
          renderSidebarOnly();
        } else {
          openPath(path);
        }
        return;
      }
      const activityButton = event.target.closest('[data-vsc-activity]');
      if (activityButton) {
        if (activity === activityButton.dataset.vscActivity && sidebarVisible) sidebarVisible = false;
        else { activity = activityButton.dataset.vscActivity; sidebarVisible = true; }
        render();
        return;
      }
      const termAction = event.target.closest('[data-vsc-term-action]');
      if (termAction) {
        if (termAction.dataset.vscTermAction === 'close') { terminalVisible = false; render(); }
        else { termLines.push({ text: '', cls: '' }); terminalVisible = true; render(); setTimeout(() => $('.vsc-term-input', root)?.focus(), 30); }
        return;
      }
      const action = event.target.closest('[data-vsc-action]');
      if (action) {
        const name = action.dataset.vscAction;
        if (name === 'new-file') newFile();
        else if (name === 'open-file') promptOpenFile();
        else if (name === 'toggle-terminal') { terminalVisible = !terminalVisible; render(); }
        else if (name === 'command-palette') commandPalette();
        else if (name === 'settings') openApp('settings');
        else if (name === 'debug') toast('Run and Debug', 'No debug configuration was found.', 'vscode');
      }
    });
    root.addEventListener('input', (event) => {
      if (event.target.matches('[data-vsc-search]')) {
        searchQuery = event.target.value;
        renderSidebarOnly();
        const input = $('[data-vsc-search]', root);
        if (input) {
          input.focus();
          try { input.setSelectionRange(input.value.length, input.value.length); } catch (_) {}
        }
      }
    });
    win.vscodeOpenPath = (path) => openPath(path);
    const keyHandler = (event) => {
      if (WM.focusedId !== win.id) return;
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === 's') { event.preventDefault(); saveActive(); }
      else if (event.key.toLowerCase() === 'p') { event.preventDefault(); promptOpenFile(); }
      else if (event.shiftKey && event.key.toLowerCase() === 'p') { event.preventDefault(); commandPalette(); }
      else if (event.key === '`') { event.preventDefault(); terminalVisible = !terminalVisible; render(); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => document.removeEventListener('keydown', keyHandler));
    const initialPath = params.path ? FS.normalize(params.path) : null;
    if (initialPath && FS.get(initialPath)?.type === 'file') openPath(initialPath);
    else render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: MICROSOFT STORE — catalog, installs and library
// ═══════════════════════════════════════
const STORE_CATALOG = [
  { id: 'word', name: 'Word', developer: 'Microsoft Corporation', category: 'Productivity', rating: 4.4, reviews: '1.2M', size: '312 MB', desc: 'Create polished documents with rich formatting, templates, and a focused writing experience.', featured: true },
  { id: 'excel', name: 'Excel', developer: 'Microsoft Corporation', category: 'Productivity', rating: 4.5, reviews: '986K', size: '428 MB', desc: 'Analyze data, build spreadsheets, and turn numbers into clear insights with formulas and charts.', featured: true },
  { id: 'powerpoint', name: 'PowerPoint', developer: 'Microsoft Corporation', category: 'Productivity', rating: 4.3, reviews: '742K', size: '356 MB', desc: 'Build compelling presentations with slides, layouts, transitions, and speaker notes.', featured: true },
  { id: 'spotify', name: 'Spotify', developer: 'Spotify AB', category: 'Music', rating: 4.6, reviews: '4.8M', size: '168 MB', desc: 'Play millions of songs, discover new artists, and listen to curated playlists.', featured: true },
  { id: 'github', name: 'GitHub Desktop', developer: 'GitHub, Inc.', category: 'Developer tools', rating: 4.7, reviews: '216K', size: '124 MB', desc: 'Browse repositories, review commits, and keep your projects in sync from the desktop.', featured: false }
];
APPS.store = {
  title: 'Microsoft Store',
  icon: 'store',
  width: 980,
  height: 670,
  minWidth: 680,
  minHeight: 470,
  build({ win, toast, cleanup, openApp: launch }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root store-app');
    win.body.appendChild(root);
    let view = 'home';
    let category = 'Apps';
    let searchQuery = '';
    let detailId = null;
    const installing = new Map();
    const timers = [];
    const categories = ['Apps', 'Gaming', 'Movies', 'Music', 'Productivity', 'Developer tools'];
    const installed = (id) => state.installedApps.includes(id);
    const itemFor = (id) => STORE_CATALOG.find((item) => item.id === id);
    const stars = (rating) => `${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}`;
    function cardHtml(item) {
      const isInstalled = installed(item.id);
      const progress = installing.get(item.id);
      const button = isInstalled ? 'Open' : progress !== undefined ? `${progress}%` : 'Get';
      return `<button class="store-card" type="button" data-store-app="${esc(item.id)}">
        <span class="sc-icon">${getIcon(item.id, 48)}</span>
        <span class="sc-name">${esc(item.name)}</span>
        <span class="sc-rating"><span class="star">★</span>${item.rating.toFixed(1)} · ${esc(item.reviews)}</span>
        <span class="sc-btn ${isInstalled ? 'installed' : ''}">${button}${progress !== undefined ? `<span class="sc-progress"><i style="width:${progress}%"></i></span>` : ''}</span>
      </button>`;
    }
    function section(title, items, action = '') {
      if (!items.length) return '';
      return `<section class="store-section">
        <div class="store-section-head"><h2>${esc(title)}</h2>${action ? `<button type="button" data-store-view="${esc(action)}">See all</button>` : ''}</div>
        <div class="store-row">${items.map(cardHtml).join('')}</div>
      </section>`;
    }
    function homePage() {
      const featured = STORE_CATALOG.find((item) => item.featured) || STORE_CATALOG[0];
      return `<div class="store-hero">
        <div class="store-hero-copy"><small>Featured app</small><h1>${esc(featured.name)} for Windows</h1><p>${esc(featured.desc)}</p><button class="btn" type="button" data-store-app="${esc(featured.id)}">${installed(featured.id) ? 'Open' : 'Get it now'}</button></div>
        <div class="store-hero-art">${getIcon(featured.id, 86)}</div>
      </div>
      ${section('Top free apps', STORE_CATALOG.slice(0, 4), 'apps')}
      ${section('Productivity picks', STORE_CATALOG.filter((item) => item.category === 'Productivity'), 'productivity')}
      ${section('New and noteworthy', STORE_CATALOG.slice(2), 'apps')}`;
    }
    function appsPage() {
      let items = STORE_CATALOG;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        items = STORE_CATALOG.filter((item) => [item.name, item.developer, item.category, item.desc].join(' ').toLowerCase().includes(query));
      } else if (category === 'Apps') items = STORE_CATALOG;
      else if (category === 'Gaming') items = STORE_CATALOG.filter((item) => item.category === 'Gaming');
      else if (category === 'Movies') items = STORE_CATALOG.filter((item) => item.category === 'Movies');
      else if (category === 'Music') items = STORE_CATALOG.filter((item) => item.category === 'Music');
      else if (category === 'Productivity') items = STORE_CATALOG.filter((item) => item.category === 'Productivity');
      else if (category === 'Developer tools') items = STORE_CATALOG.filter((item) => item.category === 'Developer tools');
      return `<h1 style="font-size:22px;margin-bottom:5px">${searchQuery ? `Search results for “${esc(searchQuery)}”` : esc(category)}</h1>
        <p style="font-size:11px;color:var(--text-secondary);margin-bottom:18px">${items.length} ${items.length === 1 ? 'app' : 'apps'} available</p>
        ${items.length ? `<div class="store-row">${items.map(cardHtml).join('')}</div>` : '<div class="store-empty">No apps found. Try a different search.</div>'}`;
    }
    function libraryPage() {
      const apps = state.installedApps.map(itemFor).filter(Boolean);
      if (!apps.length) return `<h1 style="font-size:22px;margin-bottom:8px">Library</h1><div class="store-empty">${getIcon('store', 52)}<p style="margin-top:10px">Apps you install will appear here.</p></div>`;
      return `<h1 style="font-size:22px;margin-bottom:16px">Library</h1>
        <div class="store-section-head"><h2>Installed apps</h2><span style="font-size:10.5px;color:var(--text-secondary)">${apps.length} installed</span></div>
        <div class="store-row">${apps.map(cardHtml).join('')}</div>`;
    }
    function helpPage() {
      return `<h1 style="font-size:22px;margin-bottom:16px">Store help</h1>
        <div class="settings-card">
          <div style="display:flex;gap:12px;padding:7px 0 15px"><span style="width:30px">${getIcon('download', 24)}</span><div><strong>Install and update apps</strong><p style="font-size:11px;color:var(--text-secondary);margin-top:3px">Use Get on any app card to install it. Installed apps are added to the Start menu.</p></div></div>
          <div style="display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--subtle-border)"><span style="width:30px">${getIcon('shield', 24)}</span><div><strong>Trusted Microsoft Store apps</strong><p style="font-size:11px;color:var(--text-secondary);margin-top:3px">All catalog apps in this simulator are local demonstrations and install instantly.</p></div></div>
          <div style="display:flex;gap:12px;padding:12px 0;border-top:1px solid var(--subtle-border)"><span style="width:30px">${getIcon('refresh', 24)}</span><div><strong>Updates</strong><p style="font-size:11px;color:var(--text-secondary);margin-top:3px">Use Settings → Windows Update to check for simulator updates.</p></div></div>
        </div>`;
    }
    function detailPage() {
      const item = itemFor(detailId);
      if (!item) return appsPage();
      const isInstalled = installed(item.id);
      const progress = installing.get(item.id);
      return `<button class="btn" type="button" data-store-back style="height:28px;font-size:10.5px;margin-bottom:16px">${getIcon('back', 12)} Back</button>
        <div class="store-detail">
          <div class="store-detail-top">
            <div class="store-detail-icon">${getIcon(item.id, 100)}</div>
            <div style="flex:1">
              <h1>${esc(item.name)}</h1>
              <div class="sd-dev">${esc(item.developer)} · ${esc(item.category)}</div>
              <div class="sd-rating"><span style="color:#f2b01e;letter-spacing:1px">${stars(item.rating)}</span> ${item.rating.toFixed(1)} · ${esc(item.reviews)} reviews · ${esc(item.size)}</div>
              <div class="sd-actions">
                ${isInstalled
                  ? `<button class="btn primary" type="button" data-store-open="${esc(item.id)}">Open</button><button class="btn" type="button" data-store-uninstall="${esc(item.id)}">Uninstall</button>`
                  : progress !== undefined
                    ? `<button class="btn primary" type="button" disabled>Installing… ${progress}%</button>`
                    : `<button class="btn primary" type="button" data-store-install="${esc(item.id)}">Get</button>`}
              </div>
            </div>
          </div>
          <p class="sd-desc">${esc(item.desc)}</p>
          <h2 style="font-size:14px;margin-bottom:10px">Screenshots</h2>
          <div class="store-shots"><div class="store-shot"></div><div class="store-shot"></div><div class="store-shot"></div></div>
          <div class="store-reviews">
            <h2 style="font-size:14px;margin-bottom:8px">Reviews</h2>
            <div class="store-review"><div class="sr-avatar"></div><div><strong>Alex Morgan</strong><div class="sr-stars">★★★★★</div><p>Clean, fast, and exactly what I need on the desktop. Installation was instant.</p></div></div>
            <div class="store-review"><div class="sr-avatar"></div><div><strong>Sam Taylor</strong><div class="sr-stars">★★★★☆</div><p>Works well with the rest of the simulator and integrates nicely with the Start menu.</p></div></div>
          </div>
        </div>`;
    }
    function mainHtml() {
      if (view === 'detail') return detailPage();
      if (view === 'library') return libraryPage();
      if (view === 'help') return helpPage();
      if (view === 'apps' || view === 'search') return appsPage();
      return homePage();
    }
    function render() {
      root.innerHTML = `
        <div class="store-top">
          <div class="store-brand">${getIcon('store', 22)}<span>Microsoft Store</span></div>
          <label class="store-search">${getIcon('search', 14)}<input type="text" value="${esc(searchQuery)}" placeholder="Search apps, games, movies and more" aria-label="Search Microsoft Store" data-store-search></label>
          <button class="taskbar-app" type="button" style="width:32px;height:32px" aria-label="Library" data-store-view="library">${getIcon('download', 17)}</button>
          <button class="taskbar-app" type="button" style="width:32px;height:32px" aria-label="Account" data-store-account>${getIcon('user', 17)}</button>
        </div>
        <div class="store-body">
          <aside class="store-sidebar">
            ${[['home','home','Home'],['apps','grid-view','Apps'],['gaming','play','Gaming'],['movies','video-file','Movies'],['music','music-file','Music'],['library','download','Library'],['help','info','Help']].map(([id, icon, label]) => `<button class="store-nav ${view === id ? 'active' : ''}" type="button" data-store-view="${id}">${getIcon(icon, 16)}<span>${label}</span></button>`).join('')}
            <div style="height:1px;background:var(--subtle-border);margin:10px 8px"></div>
            <div style="font-size:9.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-secondary);padding:4px 10px">Categories</div>
            ${categories.map((name) => `<button class="store-nav" type="button" data-store-category="${esc(name)}" style="padding-left:18px"><span>${esc(name)}</span></button>`).join('')}
          </aside>
          <main class="store-main" data-store-main>${mainHtml()}</main>
        </div>`;
      const input = $('[data-store-search]', root);
      input.addEventListener('input', () => {
        searchQuery = input.value;
        view = searchQuery.trim() ? 'search' : 'home';
        render();
        const next = $('[data-store-search]', root);
        if (next) { next.focus(); next.setSelectionRange(searchQuery.length, searchQuery.length); }
      });
    }
    function install(id) {
      if (!itemFor(id) || installed(id) || installing.has(id)) return;
      installing.set(id, 0);
      render();
      const timer = setInterval(() => {
        const value = Math.min(100, (installing.get(id) || 0) + randomInt(8, 22));
        installing.set(id, value);
        if (value >= 100) {
          clearInterval(timer);
          installing.delete(id);
          if (!state.installedApps.includes(id)) state.installedApps.push(id);
          if (!state.pinnedApps.includes(id)) state.pinnedApps.push(id);
          saveState();
          renderStartMenu();
          toast('Installed', `${itemFor(id).name} is ready to use. It was added to your Start menu.`, id);
          render();
        } else {
          render();
        }
      }, 130);
      timers.push(timer);
    }
    async function uninstall(id) {
      const item = itemFor(id);
      if (!item) return;
      const confirmed = await confirmDialog('Uninstall app?', `${item.name} will be removed from this PC. Your simulator files will not be deleted.`, 'Uninstall', true);
      if (!confirmed) return;
      state.installedApps = state.installedApps.filter((appId) => appId !== id);
      state.pinnedApps = state.pinnedApps.filter((appId) => appId !== id);
      const open = WM.byApp(id);
      if (open) closeWindow(open);
      saveState();
      renderStartMenu();
      toast('Uninstalled', `${item.name} was removed.`, 'trash');
      render();
    }
    root.addEventListener('click', (event) => {
      const nav = event.target.closest('[data-store-view]');
      if (nav) {
        view = nav.dataset.storeView;
        if (view === 'gaming' || view === 'movies' || view === 'music' || view === 'productivity') { category = view.charAt(0).toUpperCase() + view.slice(1); view = 'apps'; }
        searchQuery = '';
        render();
        return;
      }
      const cat = event.target.closest('[data-store-category]');
      if (cat) { category = cat.dataset.storeCategory; view = 'apps'; searchQuery = ''; render(); return; }
      const installButton = event.target.closest('[data-store-install]');
      if (installButton) { install(installButton.dataset.storeInstall); return; }
      const uninstallButton = event.target.closest('[data-store-uninstall]');
      if (uninstallButton) { uninstall(uninstallButton.dataset.storeUninstall); return; }
      const openButton = event.target.closest('[data-store-open]');
      if (openButton) { launch(openButton.dataset.storeOpen); return; }
      if (event.target.closest('[data-store-back]')) { view = 'apps'; detailId = null; render(); return; }
      if (event.target.closest('[data-store-account]')) {
        showContextMenu([
          { label: 'Signed in as User', icon: 'user', disabled: true },
          { label: 'Payment options', icon: 'copy', action: () => toast('Payment options', 'No payment methods are configured.', 'store') },
          { label: 'Redeem a code', icon: 'store', action: () => toast('Redeem code', 'Code redemption is unavailable in the simulator.', 'store') }
        ], event.clientX, event.clientY);
        return;
      }
      const app = event.target.closest('[data-store-app]');
      if (app) { detailId = app.dataset.storeApp; view = 'detail'; render(); }
    });
    cleanup(() => timers.forEach((timer) => clearInterval(timer)));
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: TASK MANAGER — live process tree, performance and startup
// ═══════════════════════════════════════
APPS.taskmanager = {
  title: 'Task Manager',
  icon: 'taskmanager',
  width: 930,
  height: 640,
  minWidth: 660,
  minHeight: 430,
  build({ win, toast, cleanup, openApp: launch }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root taskmgr-app');
    win.body.appendChild(root);
    let tab = 'processes';
    let selected = null;
    let refreshTimer = null;
    const efficiency = new Set();
    const disabledStartup = new Set();
    const systemProcesses = [
      { id: 'sys:system', name: 'System', sub: 'NT Kernel & System', icon: 'cpu', cpu: 0.2, memory: 124, disk: 0, network: 0, status: 'Running' },
      { id: 'sys:dwm', name: 'Desktop Window Manager', sub: 'DWM', icon: 'desktop', cpu: 0.7, memory: 186, disk: 0, network: 0, status: 'Running' },
      { id: 'sys:explorer', name: 'Windows Explorer', sub: 'explorer.exe', icon: 'explorer', cpu: 1.1, memory: 248, disk: 0.2, network: 0, status: 'Running' },
      { id: 'sys:security', name: 'Antimalware Service Executable', sub: 'MsMpEng.exe', icon: 'shield', cpu: 1.6, memory: 214, disk: 0.1, network: 0, status: 'Running' },
      { id: 'sys:runtime', name: 'Runtime Broker', sub: 'RuntimeBroker.exe', icon: 'cpu', cpu: 0.3, memory: 74, disk: 0, network: 0, status: 'Running' },
      { id: 'sys:svchost', name: 'Service Host', sub: 'svchost.exe', icon: 'cpu', cpu: 0.4, memory: 96, disk: 0, network: 0, status: 'Running' }
    ];
    function appProcesses() {
      return Array.from(WM.windows.values()).filter((item) => !item.closing).map((item) => {
        const isFocused = WM.focusedId === item.id;
        const multiplier = efficiency.has(item.id) ? 0.35 : 1;
        return {
          id: `win:${item.id}`,
          winId: item.id,
          name: item.title,
          sub: APPS[item.appId] ? APPS[item.appId].title : 'Application',
          icon: item.icon,
          cpu: isFocused ? randomInt(15, 95) / 10 * multiplier : randomInt(1, 34) / 10 * multiplier,
          memory: randomInt(110, 480),
          disk: randomInt(0, 18) / 10,
          network: randomInt(0, 4) / 10,
          status: item.minimized ? 'Suspended' : 'Running',
          real: true
        };
      });
    }
    function allProcesses() { return [...appProcesses(), ...systemProcesses]; }
    function findProcess(id) { return allProcesses().find((process) => process.id === id) || null; }
    function processTable(details = false) {
      const processes = allProcesses();
      return `<div class="tm-table-wrap"><table class="tm-table">
        <thead><tr><th>Name</th><th>Status</th><th>${details ? 'PID' : 'CPU'}</th><th>Memory</th><th>Disk</th><th>Network</th></tr></thead>
        <tbody>${processes.map((process) => `<tr class="${selected === process.id ? 'selected' : ''}" data-tm-process="${esc(process.id)}">
          <td><div class="tm-name-cell"><span class="tm-icon">${getIcon(process.icon, 20)}</span><span><span style="display:block">${esc(process.name)}</span><span class="tm-sub">${esc(process.sub)}${efficiency.has(process.winId) ? ' · Efficiency mode' : ''}</span></span></div></td>
          <td>${esc(process.status)}</td>
          <td>${details ? randomInt(1000, 18000) : `${process.cpu.toFixed(1)}%`}</td>
          <td>${process.memory.toFixed(1)} MB</td>
          <td>${process.disk.toFixed(1)} MB/s</td>
          <td>${process.network.toFixed(1)} Mbps</td>
        </tr>`).join('')}</tbody>
      </table></div>`;
    }
    function processesView() {
      return `<div class="tm-toolbar"><button class="btn" type="button" data-tm-action="end">${getIcon('close', 12)} End task</button><button class="btn" type="button" data-tm-action="efficiency">${getIcon('nightlight', 12)} Efficiency mode</button><button class="btn" type="button" data-tm-action="new">${getIcon('plus', 12)} New task</button><span class="tm-spacer"></span><span style="font-size:10.5px;color:var(--text-secondary)">${allProcesses().length} processes</span></div>
        ${processTable()}
        <div class="tm-footer">CPU ${appProcesses().reduce((sum, process) => sum + process.cpu, 0).toFixed(0)}% · Memory ${appProcesses().reduce((sum, process) => sum + process.memory, 0).toFixed(0)} MB in use · ${WM.windows.size} windows open</div>`;
    }
    function chart(points, color) {
      const values = Array.from({ length: 40 }, () => randomInt(18, 78));
      const path = values.map((value, index) => `${(index / 39) * 100},${100 - value}`).join(' ');
      return `<svg class="tm-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,100 ${path} 100,100" fill="${color}" opacity=".15"/><polyline points="${path}" fill="none" stroke="${color}" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>`;
    }
    function performanceView() {
      return `<div class="tm-performance"><div class="tm-perf-grid">
        <div class="tm-chart-card"><div class="tm-chart-head"><strong>${getIcon('cpu', 15)} CPU</strong><span>${randomInt(8, 38)}% ${randomInt(1, 4)}.${randomInt(0, 9)} GHz</span></div><div class="tm-chart-value">${randomInt(8, 38)}%</div>${chart([], '#0078d4')}</div>
        <div class="tm-chart-card"><div class="tm-chart-head"><strong>${getIcon('memory', 15)} Memory</strong><span>${(randomInt(78, 112) / 10).toFixed(1)}/16.0 GB</span></div><div class="tm-chart-value">${randomInt(48, 70)}%</div>${chart([], '#8764b8')}</div>
        <div class="tm-chart-card"><div class="tm-chart-head"><strong>${getIcon('disk', 15)} Disk 0 (C:)</strong><span>NVMe · 512 GB</span></div><div class="tm-chart-value">${randomInt(0, 18)}%</div>${chart([], '#00b294')}</div>
        <div class="tm-chart-card"><div class="tm-chart-head"><strong>${getIcon('wifi', 15)} Wi-Fi</strong><span>${'Wi-Fi 6'} · Connected</span></div><div class="tm-chart-value">${(randomInt(1, 24) / 10).toFixed(1)} Mbps</div>${chart([], '#ca5010')}</div>
      </div>
      <div class="tm-perf-info">
        <div><span>Processor</span>12th Gen Intel Core i7-12700</div>
        <div><span>Installed RAM</span>16.0 GB (15.7 GB usable)</div>
        <div><span>System type</span>64-bit operating system</div>
        <div><span>Graphics</span>Intel Iris Xe Graphics</div>
      </div></div>`;
    }
    function startupView() {
      const entries = [
        { id: 'edge', name: 'Microsoft Edge', publisher: 'Microsoft', impact: 'Medium', icon: 'edge' },
        { id: 'store', name: 'Microsoft Store', publisher: 'Microsoft', impact: 'Low', icon: 'store' },
        { id: 'spotify', name: 'Spotify', publisher: 'Spotify AB', impact: 'High', icon: 'spotify' },
        { id: 'github', name: 'GitHub Desktop', publisher: 'GitHub, Inc.', impact: 'Low', icon: 'github' },
        { id: 'security', name: 'Windows Security notification icon', publisher: 'Microsoft', impact: 'Low', icon: 'shield' }
      ];
      return `<div class="tm-startup">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><strong style="font-size:12px">Startup apps</strong><span style="font-size:10px;color:var(--text-secondary)">Impact measured on boot time</span></div>
        ${entries.map((entry) => `<div class="tm-startup-row"><span class="tm-icon">${getIcon(entry.icon, 25)}</span><div class="tm-startup-meta"><strong>${entry.name}</strong><span>${entry.publisher} · ${disabledStartup.has(entry.id) ? 'Disabled' : 'Enabled'}</span></div><span class="tm-impact ${entry.impact === 'High' ? 'high' : entry.impact === 'Medium' ? 'med' : ''}">${entry.impact}</span><button class="btn" type="button" style="height:25px;font-size:10px" data-tm-startup="${entry.id}">${disabledStartup.has(entry.id) ? 'Enable' : 'Disable'}</button></div>`).join('')}
      </div>`;
    }
    function usersView() {
      return `<div class="tm-startup"><div class="tm-startup-row"><span class="tm-icon">${getIcon('user', 25)}</span><div class="tm-startup-meta"><strong>User</strong><span>Local account · Administrator</span></div><span style="font-size:11px">${randomInt(2, 7)}% CPU</span><span style="font-size:11px">${randomInt(320, 620)} MB</span><span class="tm-impact">Active</span></div>
        <div style="margin-top:16px;font-size:10.5px;color:var(--text-secondary)">1 user signed in · Windows 11 Simulator</div></div>`;
    }
    function detailsView() {
      return `<div class="tm-toolbar"><button class="btn" type="button" data-tm-action="end">End task</button><span class="tm-spacer"></span><span style="font-size:10.5px;color:var(--text-secondary)">Details</span></div>${processTable(true)}`;
    }
    function render() {
      root.innerHTML = `<div class="tm-tabs">
        ${[['processes','Processes'],['performance','Performance'],['startup','Startup apps'],['users','Users'],['details','Details']].map(([id, label]) => `<button class="tm-tab ${tab === id ? 'active' : ''}" type="button" data-tm-tab="${id}">${label}</button>`).join('')}
      </div><div class="tm-body">${tab === 'processes' ? processesView() : tab === 'performance' ? performanceView() : tab === 'startup' ? startupView() : tab === 'users' ? usersView() : detailsView()}</div>`;
    }
    async function newTask() {
      const value = await promptDialog('Create new task', 'Type the name of a program, folder, document, or Internet resource:', '', 'OK');
      if (!value) return;
      const query = value.trim().toLowerCase();
      const found = Object.entries(APPS).find(([id, def]) => isAppAvailable(id) && (id === query || def.title.toLowerCase() === query || def.title.toLowerCase().includes(query)));
      if (found) launch(found[0]);
      else if (STORE_CATALOG.some((item) => item.name.toLowerCase() === query)) launch('store');
      else toast('Task Manager', 'Windows cannot find that program.', 'taskmanager');
    }
    function endTask() {
      const process = findProcess(selected);
      if (!process) { toast('Task Manager', 'Select a process to end.', 'taskmanager'); return; }
      if (!process.real) { toast('Task Manager', 'This is a critical system process and cannot be ended.', 'shield'); return; }
      const target = WM.windows.get(process.winId);
      if (target) closeWindow(target);
      selected = null;
      toast('Task Manager', `${process.name} was ended.`, 'taskmanager');
      render();
    }
    root.addEventListener('click', (event) => {
      const tabButton = event.target.closest('[data-tm-tab]');
      if (tabButton) { tab = tabButton.dataset.tmTab; selected = null; render(); return; }
      const processRow = event.target.closest('[data-tm-process]');
      if (processRow) { selected = processRow.dataset.tmProcess; render(); return; }
      const startupButton = event.target.closest('[data-tm-startup]');
      if (startupButton) {
        const id = startupButton.dataset.tmStartup;
        if (disabledStartup.has(id)) disabledStartup.delete(id); else disabledStartup.add(id);
        render();
        return;
      }
      const action = event.target.closest('[data-tm-action]');
      if (action) {
        if (action.dataset.tmAction === 'end') endTask();
        else if (action.dataset.tmAction === 'new') newTask();
        else if (action.dataset.tmAction === 'efficiency') {
          const process = findProcess(selected);
          if (!process || !process.real) { toast('Task Manager', 'Select an app to enable efficiency mode.', 'nightlight'); return; }
          if (efficiency.has(process.winId)) efficiency.delete(process.winId); else efficiency.add(process.winId);
          render();
        }
      }
    });
    render();
    refreshTimer = setInterval(() => { if (tab === 'processes' || tab === 'performance') render(); }, 2500);
    cleanup(() => clearInterval(refreshTimer));
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: RECYCLE BIN — restore, permanently delete and empty
// ═══════════════════════════════════════
APPS.recyclebin = {
  title: 'Recycle Bin',
  icon: 'recyclebin',
  width: 880,
  height: 560,
  minWidth: 600,
  minHeight: 380,
  build({ win, toast, cleanup }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root recycle-app');
    win.body.appendChild(root);
    const selected = new Set();
    function selectedItems() { return state.recycleBin.filter((item) => selected.has(item.id)); }
    function restore(itemIds) {
      const items = state.recycleBin.filter((item) => itemIds.includes(item.id));
      if (!items.length) { toast('Recycle Bin', 'Select an item to restore.', 'recyclebin'); return; }
      items.forEach((item) => FS.restoreRecycleItem(item));
      itemIds.forEach((id) => selected.delete(id));
      renderDesktop();
      render();
      toast('Recycle Bin', `${items.length} ${items.length === 1 ? 'item was' : 'items were'} restored.`, 'recyclebin');
    }
    function deletePermanently(itemIds) {
      const count = itemIds.filter((id) => state.recycleBin.some((item) => item.id === id)).length;
      if (!count) return;
      state.recycleBin = state.recycleBin.filter((item) => !itemIds.includes(item.id));
      itemIds.forEach((id) => selected.delete(id));
      saveState();
      renderDesktop();
      render();
      toast('Recycle Bin', `${count} ${count === 1 ? 'item was' : 'items were'} permanently deleted.`, 'trash');
    }
    async function confirmEmpty() {
      if (!state.recycleBin.length) { toast('Recycle Bin', 'The Recycle Bin is already empty.', 'recyclebin'); return; }
      const confirmed = await confirmDialog('Empty Recycle Bin', `Are you sure you want to permanently delete these ${state.recycleBin.length} items?`, 'Yes', true);
      if (!confirmed) return;
      FS.emptyRecycle();
      selected.clear();
      renderDesktop();
      render();
      toast('Recycle Bin', 'The Recycle Bin is empty.', 'recyclebin');
    }
    async function confirmDelete() {
      const ids = [...selected];
      if (!ids.length) { toast('Recycle Bin', 'Select an item to delete.', 'recyclebin'); return; }
      const confirmed = await confirmDialog('Delete permanently', `Permanently delete ${ids.length} selected ${ids.length === 1 ? 'item' : 'items'}? This cannot be undone.`, 'Delete', true);
      if (confirmed) deletePermanently(ids);
    }
    function tableHtml() {
      if (!state.recycleBin.length) {
        return `<div class="recycle-empty"><span class="re-icon">${getIcon('recyclebin', 72)}</span><strong>Recycle Bin is empty</strong><span>Deleted files will appear here so you can restore them.</span></div>`;
      }
      return `<table class="recycle-table">
        <thead><tr><th style="width:36%">Name</th><th style="width:26%">Original location</th><th>Date deleted</th><th style="width:90px">Size</th></tr></thead>
        <tbody>${state.recycleBin.map((item) => `<tr class="${selected.has(item.id) ? 'selected' : ''}" data-rb-item="${esc(item.id)}">
          <td><div class="rt-name">${getIcon(fileIconName(item.node), 17)}<span>${esc(item.node.name)}</span></div></td>
          <td title="${esc(item.originalPath)}">${esc(item.originalPath === '/' ? 'This PC' : item.originalPath)}</td>
          <td>${esc(formatDate(item.deletedAt, 'datetime'))}</td>
          <td>${formatBytes(item.size || 0)}</td>
        </tr>`).join('')}</tbody>
      </table>`;
    }
    function render() {
      root.innerHTML = `<div class="recycle-toolbar">
        <button class="btn" type="button" data-rb-action="restore" ${selected.size ? '' : 'disabled'}>${getIcon('restore', 14)} Restore</button>
        <button class="btn" type="button" data-rb-action="delete" ${selected.size ? '' : 'disabled'}>${getIcon('trash', 14)} Delete permanently</button>
        <button class="btn" type="button" data-rb-action="empty" ${state.recycleBin.length ? '' : 'disabled'}>Empty Recycle Bin</button>
        <span style="flex:1"></span>
        <button class="btn" type="button" data-rb-action="refresh" aria-label="Refresh">${getIcon('refresh', 14)}</button>
      </div>
      <div class="recycle-list-wrap">${tableHtml()}</div>
      <div class="recycle-status">${state.recycleBin.length} ${state.recycleBin.length === 1 ? 'item' : 'items'}${selected.size ? ` · ${selected.size} selected` : ''} · ${formatBytes(state.recycleBin.reduce((sum, item) => sum + (item.size || 0), 0))}</div>`;
    }
    root.addEventListener('click', (event) => {
      const row = event.target.closest('[data-rb-item]');
      if (row) {
        const id = row.dataset.rbItem;
        if (event.ctrlKey || event.metaKey) {
          if (selected.has(id)) selected.delete(id); else selected.add(id);
        } else {
          selected.clear();
          selected.add(id);
        }
        render();
        return;
      }
      const action = event.target.closest('[data-rb-action]');
      if (!action) return;
      const name = action.dataset.rbAction;
      if (name === 'restore') restore([...selected]);
      else if (name === 'delete') confirmDelete();
      else if (name === 'empty') confirmEmpty();
      else if (name === 'refresh') { renderDesktop(); render(); }
    });
    root.addEventListener('dblclick', (event) => {
      const row = event.target.closest('[data-rb-item]');
      if (row) restore([row.dataset.rbItem]);
    });
    root.addEventListener('contextmenu', (event) => {
      const row = event.target.closest('[data-rb-item]');
      if (!row) return;
      event.preventDefault();
      const id = row.dataset.rbItem;
      if (!selected.has(id)) { selected.clear(); selected.add(id); render(); }
      const item = state.recycleBin.find((entry) => entry.id === id);
      showContextMenu([
        { label: 'Restore', icon: 'restore', action: () => restore([id]) },
        { label: 'Delete', icon: 'trash', action: () => confirmDelete() },
        '-',
        { label: 'Properties', icon: 'info', action: () => item && showProperties(item.node, item.originalPath) }
      ], event.clientX, event.clientY);
    });
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: ABOUT THIS PC — device specifications and Windows edition
// ═══════════════════════════════════════
APPS.about = {
  title: 'About This PC',
  icon: 'thispc',
  width: 790,
  height: 590,
  minWidth: 560,
  minHeight: 400,
  build({ win, toast, openApp: launch }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root about-app');
    win.body.appendChild(root);
    const deviceName = state.deviceName || 'DESKTOP-SIM11';
    const specs = [
      ['Device name', deviceName],
      ['Processor', '12th Gen Intel(R) Core(TM) i7-12700   2.10 GHz'],
      ['Installed RAM', '16.0 GB (15.7 GB usable)'],
      ['Device ID', 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890'],
      ['Product ID', '00330-80000-00000-AA123'],
      ['System type', '64-bit operating system, x64-based processor'],
      ['Pen and touch', 'Pen and touch support with 10 touch points'],
      ['Storage', '512 GB NVMe SSD · 256 GB available'],
      ['Graphics', 'Intel(R) Iris(R) Xe Graphics'],
      ['Serial number', 'SIM-2026-11-0042']
    ];
    root.innerHTML = `
      <div class="about-hero">
        <div class="about-pc-icon">${getIcon('thispc', 92)}</div>
        <div><h1>${esc(deviceName)}</h1><p>Windows 11 Pro · Version 24H2 · OS build 26100.2033<br>Windows Feature Experience Pack 1000.26100.34.0</p></div>
      </div>
      <h2 style="font-size:13px;margin-bottom:4px">Device specifications</h2>
      <div class="about-specs">${specs.map(([label, value]) => `<div class="about-spec"><span>${esc(label)}</span>${esc(value)}</div>`).join('')}</div>
      <h2 style="font-size:13px;margin:22px 0 4px">Windows specifications</h2>
      <div class="about-specs">
        <div class="about-spec"><span>Edition</span>Windows 11 Pro</div>
        <div class="about-spec"><span>Version</span>24H2</div>
        <div class="about-spec"><span>Installed on</span>${esc(formatDate(new Date(Date.now() - 92 * 86400000).toISOString(), 'date'))}</div>
        <div class="about-spec"><span>OS build</span>26100.2033</div>
        <div class="about-spec"><span>Activation</span><span style="font-size:11.5px;color:var(--text-primary);display:flex;align-items:center;gap:5px">${getIcon('check', 12)} Windows is activated</span></div>
        <div class="about-spec"><span>Experience</span>Windows Feature Experience Pack 1000.26100.34.0</div>
      </div>
      <div class="about-links">
        <button class="btn primary" type="button" data-about-action="update">Windows Update</button>
        <button class="btn" type="button" data-about-action="system">System settings</button>
        <button class="btn" type="button" data-about-action="copy">Copy</button>
        <button class="btn" type="button" data-about-action="rename">Rename this PC</button>
      </div>`;
    root.addEventListener('click', async (event) => {
      const action = event.target.closest('[data-about-action]');
      if (!action) return;
      const name = action.dataset.aboutAction;
      if (name === 'update') launch('settings', { page: 'update' });
      else if (name === 'system') launch('settings', { page: 'system' });
      else if (name === 'copy') {
        try {
          await navigator.clipboard.writeText(`${deviceName}\nWindows 11 Pro 24H2 (26100.2033)\n12th Gen Intel Core i7-12700\n16.0 GB RAM\n512 GB NVMe SSD`);
          toast('Copied', 'Device specifications copied to the clipboard.', 'copy');
        } catch (_) { toast('Copy failed', 'Clipboard access is unavailable.', 'copy'); }
      } else if (name === 'rename') {
        const value = await promptDialog('Rename this PC', 'Enter a new name for this PC:', deviceName, 'Next');
        if (value === null) return;
        const clean = value.trim().replace(/[^A-Za-z0-9-]/g, '').slice(0, 15);
        if (!clean) { toast('Rename this PC', 'Enter a valid computer name.', 'thispc'); return; }
        state.deviceName = clean.toUpperCase();
        saveState();
        win.close();
        toast('Rename this PC', 'Restart your PC to apply the new name.', 'restart');
      }
    });
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: PHOTOS — gallery, viewer, zoom and slideshow
// ═══════════════════════════════════════
APPS.photos = {
  title: 'Photos',
  icon: 'photos',
  width: 980,
  height: 680,
  minWidth: 650,
  minHeight: 450,
  onReopen(win, params) {
    if (params.path && win.photosOpen) win.photosOpen(params.path);
  },
  build({ win, params, toast, cleanup }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root photos-app');
    win.body.appendChild(root);
    let currentPath = params.path && FS.get(params.path)?.type === 'file' ? FS.normalize(params.path) : null;
    let zoom = 100;
    let rotation = 0;
    let slideshow = false;
    let infoVisible = false;
    let slideTimer = null;
    function collectImages(node = FS.root(), path = '/', output = []) {
      (node.children || []).forEach((child) => {
        const childPath = FS.join(path, child.name);
        if (child.type === 'folder') collectImages(child, childPath, output);
        else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension(child.name))) output.push(childPath);
      });
      return output;
    }
    function imageList() { return collectImages().sort(); }
    function imageIndex() { return imageList().indexOf(currentPath); }
    function imageName() { return currentPath ? (FS.parts(currentPath).pop() || 'Image') : ''; }
    function seedFor(path) {
      let hash = 0;
      for (let i = 0; i < path.length; i++) hash = ((hash << 5) - hash + path.charCodeAt(i)) | 0;
      return Math.abs(hash);
    }
    function art(path, large = false) {
      const seed = seedFor(path);
      const hue = seed % 360;
      const hue2 = (hue + 48) % 360;
      const sun = 50 + (seed % 150);
      return `<svg viewBox="0 0 1000 620" role="img" aria-label="Simulated photo ${esc(path)}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block">
        <defs>
          <linearGradient id="photo-sky-${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 60% 28%)"/><stop offset=".55" stop-color="hsl(${hue2} 68% 58%)"/><stop offset="1" stop-color="hsl(${(hue2 + 24) % 360} 66% 76%)"/></linearGradient>
          <linearGradient id="photo-water-${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${(hue2 + 180) % 360} 55% 42%)"/><stop offset="1" stop-color="hsl(${(hue + 200) % 360} 45% 18%)"/></linearGradient>
        </defs>
        <rect width="1000" height="620" fill="url(#photo-sky-${seed})"/>
        <circle cx="${sun}" cy="${130 + seed % 80}" r="${46 + seed % 22}" fill="hsl(${(hue2 + 40) % 360} 96% 78%)" opacity=".92"/>
        <path d="M0 430 L160 250 L300 390 L460 180 L640 410 L780 285 L1000 430 V620 H0Z" fill="hsl(${(hue + 160) % 360} 30% 22%)" opacity=".88"/>
        <path d="M0 475 L190 340 L360 470 L560 315 L760 465 L920 375 L1000 440 V620 H0Z" fill="hsl(${(hue + 145) % 360} 38% 16%)"/>
        <rect y="465" width="1000" height="155" fill="url(#photo-water-${seed})"/>
        <path d="M0 505 Q180 485 350 508 T720 510 T1000 500" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/>
        <path d="M0 548 Q220 530 430 550 T820 548 T1000 540" stroke="rgba(255,255,255,.18)" stroke-width="2" fill="none"/>
        <circle cx="${sun}" cy="${130 + seed % 80}" r="${46 + seed % 22}" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="3"/>
      </svg>`;
    }
    function currentIndex() { return imageIndex(); }
    function navigate(delta) {
      const images = imageList();
      if (!images.length) return;
      const index = images.indexOf(currentPath);
      currentPath = images[(index + delta + images.length) % images.length];
      zoom = 100;
      rotation = 0;
      render();
    }
    function openImage(path) {
      if (!FS.get(path)) { toast('Photos', 'That image could not be found.', 'photos'); return; }
      currentPath = FS.normalize(path);
      zoom = 100;
      rotation = 0;
      render();
    }
    function libraryHtml() {
      const images = imageList();
      if (!images.length) return `<div class="photos-empty">${getIcon('photos', 74)}<h2>No photos yet</h2><p>Images from your virtual Pictures folder will appear here.</p></div>`;
      const groups = [
        { title: 'This month', paths: images.slice(0, 2) },
        { title: 'Earlier', paths: images.slice(2) }
      ].filter((group) => group.paths.length);
      return `<div class="photos-library-head"><h1>Photos</h1><span>${images.length} items</span></div>
        ${groups.map((group) => `<section class="photos-group"><h2>${esc(group.title)}</h2><div class="photos-grid">${group.paths.map((path) => `<button class="photo-tile" type="button" data-photo-path="${esc(path)}"><span class="photo-thumb" style="--photo-h:${seedFor(path) % 360}">${art(path)}</span><span class="photo-tile-name">${esc(FS.parts(path).pop())}</span><span class="photo-tile-date">${esc(formatDate(FS.get(path)?.modified, 'short'))}</span></button>`).join('')}</div></section>`).join('')}`;
    }
    function viewerHtml() {
      const images = imageList();
      if (!images.length || !currentPath) return libraryHtml();
      const index = currentIndex();
      const node = FS.get(currentPath);
      return `<div class="photos-viewer">
        <div class="photos-stage" data-photos-stage>
          <div class="photos-canvas" style="transform:rotate(${rotation}deg) scale(${zoom / 100})">${art(currentPath)}</div>
          <button class="photos-nav prev" type="button" data-photo-nav="-1" aria-label="Previous photo">${getIcon('chevron-left', 23)}</button>
          <button class="photos-nav next" type="button" data-photo-nav="1" aria-label="Next photo">${getIcon('chevron-right', 23)}</button>
          <div class="photos-counter">${index + 1} / ${images.length}</div>
        </div>
        <div class="photos-filmstrip">${images.map((path) => `<button class="photos-film ${path === currentPath ? 'active' : ''}" type="button" data-photo-path="${esc(path)}" aria-label="${esc(FS.parts(path).pop())}"><span style="background:linear-gradient(135deg,hsl(${seedFor(path) % 360} 60% 45%),hsl(${(seedFor(path) + 55) % 360} 70% 62%))">${art(path)}</span></button>`).join('')}</div>
        ${infoVisible ? `<aside class="photos-info"><h3>${esc(node.name)}</h3><div><span>Date</span>${esc(formatDate(node.modified, 'datetime'))}</div><div><span>Dimensions</span>${randomInt(2400, 4000)} × ${randomInt(1600, 3000)}</div><div><span>Size</span>${formatBytes(node.size || 0)}</div><div><span>Location</span>${esc(FS.parent(currentPath))}</div><div><span>Type</span>${esc(fileTypeLabel(node))}</div><button class="btn" type="button" data-photo-action="wallpaper">Set as background</button></aside>` : ''}
      </div>`;
    }
    function render() {
      const hasImage = !!currentPath && FS.exists(currentPath);
      root.innerHTML = `<div class="photos-toolbar">
        <button class="photos-tool" type="button" data-photo-action="library" aria-label="Back to gallery" ${hasImage ? '' : 'disabled'}>${getIcon('back', 17)}</button>
        <button class="photos-tool" type="button" data-photo-nav="-1" ${hasImage ? '' : 'disabled'} aria-label="Previous">${getIcon('chevron-left', 17)}</button>
        <button class="photos-tool" type="button" data-photo-nav="1" ${hasImage ? '' : 'disabled'} aria-label="Next">${getIcon('chevron-right', 17)}</button>
        <div class="photos-title">${esc(hasImage ? imageName() : 'Photos')}</div>
        <span class="tm-spacer"></span>
        ${hasImage ? `<button class="photos-tool" type="button" data-photo-action="info" aria-label="Info">${getIcon('info', 17)}</button>
        <button class="photos-tool" type="button" data-photo-action="rotate" aria-label="Rotate">${getIcon('refresh', 17)}</button>
        <button class="photos-tool" type="button" data-photo-action="zoom-out" aria-label="Zoom out">${getIcon('minus', 17)}</button>
        <span class="photos-zoom">${zoom}%</span>
        <button class="photos-tool" type="button" data-photo-action="zoom-in" aria-label="Zoom in">${getIcon('plus', 17)}</button>
        <button class="photos-tool ${slideshow ? 'active' : ''}" type="button" data-photo-action="slideshow" aria-label="Slideshow">${getIcon('play', 17)}</button>
        <button class="photos-tool" type="button" data-photo-action="delete" aria-label="Delete">${getIcon('trash', 17)}</button>` : ''}
      </div>
      <div class="photos-main">${hasImage ? viewerHtml() : libraryHtml()}</div>
      <div class="photos-status">${hasImage ? `${esc(currentPath)} · ${zoom}% · Use the arrow keys to browse` : `${imageList().length} photos · Virtual Pictures library`}</div>`;
    }
    function toggleSlideshow() {
      slideshow = !slideshow;
      if (slideTimer) { clearInterval(slideTimer); slideTimer = null; }
      if (slideshow) {
        slideTimer = setInterval(() => navigate(1), 3000);
        toast('Slideshow', 'Slideshow started. Click play again to stop.', 'play');
      }
      render();
    }
    root.addEventListener('click', (event) => {
      const image = event.target.closest('[data-photo-path]');
      if (image) { openImage(image.dataset.photoPath); return; }
      const nav = event.target.closest('[data-photo-nav]');
      if (nav) { navigate(Number(nav.dataset.photoNav)); return; }
      const action = event.target.closest('[data-photo-action]');
      if (!action) return;
      const name = action.dataset.photoAction;
      if (name === 'library') { currentPath = null; slideshow = false; if (slideTimer) clearInterval(slideTimer); render(); }
      else if (name === 'zoom-in') { zoom = clamp(zoom + 25, 25, 300); render(); }
      else if (name === 'zoom-out') { zoom = clamp(zoom - 25, 25, 300); render(); }
      else if (name === 'rotate') { rotation = (rotation + 90) % 360; render(); }
      else if (name === 'info') { infoVisible = !infoVisible; render(); }
      else if (name === 'slideshow') toggleSlideshow();
      else if (name === 'delete') {
        confirmDialog('Delete photo?', `${imageName()} will be moved to the Recycle Bin.`, 'Delete', true).then((confirmed) => {
          if (!confirmed) return;
          const removed = currentPath;
          FS.remove(currentPath, true);
          currentPath = null;
          slideshow = false;
          if (slideTimer) clearInterval(slideTimer);
          renderDesktop();
          render();
          toast('Photos', `${FS.parts(removed).pop()} moved to the Recycle Bin.`, 'recyclebin');
        });
      } else if (name === 'wallpaper') {
        toast('Photos', 'This image was set as your desktop background preview.', 'desktop');
      }
    });
    const keyHandler = (event) => {
      if (WM.focusedId !== win.id || !currentPath) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
      else if (event.key === 'Escape') { currentPath = null; render(); }
      else if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom = clamp(zoom + 25, 25, 300); render(); }
      else if (event.key === '-') { event.preventDefault(); zoom = clamp(zoom - 25, 25, 300); render(); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => { document.removeEventListener('keydown', keyHandler); if (slideTimer) clearInterval(slideTimer); });
    win.photosOpen = (path) => openImage(path);
    if (currentPath) currentPath = FS.normalize(currentPath);
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: WORD — document editor with ribbon and saved files
// ═══════════════════════════════════════
APPS.word = {
  title: 'Word',
  icon: 'word',
  width: 980,
  height: 710,
  minWidth: 680,
  minHeight: 500,
  storeOnly: true,
  onReopen(win, params) {
    if (params.path && win.wordOpenPath) win.wordOpenPath(params.path);
  },
  build({ win, params, toast, cleanup }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root word-app');
    win.body.appendChild(root);
    let path = params.path ? FS.normalize(params.path) : null;
    let zoom = 100;
    let dirty = false;
    const sample = 'Quarterly Report\n\nPrepared by User\nOctober 2026\n\nExecutive summary\nThis quarter focused on improving the desktop experience, simplifying everyday workflows, and delivering reliable updates across the organization.\n\nHighlights\n• Completed the Windows 11 simulator refresh\n• Reduced onboarding time by 18%\n• Shipped three accessibility improvements\n• Expanded the shared file system and app catalog\n\nNext steps\nReview the attached budget, gather feedback from the design team, and prepare the final presentation for the leadership meeting.';
    function documentHtml(content) {
      const lines = String(content || '').split(/\r?\n/);
      return lines.map((line) => line.trim() ? `<p>${esc(line)}</p>` : '<p><br></p>').join('');
    }
    function documentText() {
      const editor = $('[data-word-editor]', root);
      if (!editor) return '';
      return Array.from(editor.children).map((node) => node.textContent.trim()).join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    function wordCount() {
      const text = documentText();
      return { words: text ? text.split(/\s+/).filter(Boolean).length : 0, chars: text.length };
    }
    function updateStatus() {
      const counts = wordCount();
      const status = $('[data-word-status]', root);
      if (status) status.innerHTML = `<span>Page 1 of 1</span><span>${counts.words} words</span><span>${counts.chars} characters</span><span style="margin-left:auto">English (United States)</span><span>${zoom}%</span>`;
      const wrap = $('.word-page-wrap', root);
      if (wrap) wrap.style.transform = `scale(${zoom / 100})`;
    }
    function save(as = false) {
      if (!path || as) {
        promptDialog('Save document', 'Enter a file path:', path || '/Documents/Work/Quarterly Report.docx', 'Save').then((value) => {
          if (value === null || !value.trim()) return;
          path = FS.normalize(value.trim());
          writeCurrent();
        });
        return;
      }
      writeCurrent();
    }
    function writeCurrent() {
      if (!path) return;
      const parent = FS.parent(path);
      const name = FS.parts(path).pop();
      if (!FS.exists(parent)) FS.createFolder('/', FS.parts(parent).pop() || 'Documents');
      if (!FS.exists(path)) FS.createFile(parent, name, '');
      const content = documentText();
      FS.writeFile(path, content);
      dirty = false;
      win.setTitle(`${name} - Word`);
      toast('Saved', `${name} was saved to ${path}.`, 'word');
    }
    function openDocument(filePath) {
      const node = FS.get(filePath);
      if (!node || node.type !== 'file') { toast('Word', 'That document could not be opened.', 'word'); return; }
      path = FS.normalize(filePath);
      render();
    }
    function newDocument() {
      if (dirty && !confirm('Discard unsaved changes and create a new document?')) return;
      path = null;
      dirty = false;
      render();
    }
    function applyCommand(command, value = null) {
      const editor = $('[data-word-editor]', root);
      if (!editor) return;
      editor.focus();
      try { document.execCommand(command, false, value); } catch (_) {}
      dirty = true;
    }
    function render() {
      const node = path ? FS.get(path) : null;
      const content = node && node.type === 'file' ? node.content : (!path ? sample : '');
      const name = path ? FS.parts(path).pop() : 'Document1';
      win.setTitle(`${name}${dirty ? ' *' : ''} - Word`);
      root.innerHTML = `
        <div class="office-topbar"><div class="office-brand">${getIcon('word', 20)}<span>Word</span></div><button class="office-doc-name" type="button" data-word-action="saveas">${esc(name)}${dirty ? ' *' : ''}</button><span class="office-saved">${dirty ? 'Saving…' : 'Saved to this PC'}</span><span class="tm-spacer"></span><button class="office-account" type="button" aria-label="Account">${getIcon('user', 18)}</button></div>
        <div class="office-tabs">${['File','Home','Insert','Draw','Design','Layout','References','Review','View','Help'].map((tab, index) => `<button class="office-tab ${index === 1 ? 'active' : ''}" type="button" data-word-tab="${tab}">${tab}</button>`).join('')}</div>
        <div class="office-ribbon">
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn wide" type="button" data-word-action="paste">${getIcon('paste', 18)}<span>Paste</span></button><div class="ribbon-col"><button class="ribbon-btn" type="button" data-word-cmd="cut">${getIcon('cut', 15)}</button><button class="ribbon-btn" type="button" data-word-cmd="copy">${getIcon('copy', 15)}</button></div></div><span class="ribbon-label">Clipboard</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><select class="ribbon-select" data-word-font aria-label="Font family"><option>Calibri</option><option>Aptos</option><option>Georgia</option><option>Consolas</option></select><select class="ribbon-select small" data-word-size aria-label="Font size"><option>10</option><option>11</option><option selected>12</option><option>14</option><option>18</option><option>24</option><option>32</option></select></div><div class="ribbon-row"><button class="ribbon-btn" type="button" data-word-cmd="bold" title="Bold"><strong>B</strong></button><button class="ribbon-btn" type="button" data-word-cmd="italic" title="Italic"><em>I</em></button><button class="ribbon-btn" type="button" data-word-cmd="underline" title="Underline"><u>U</u></button><button class="ribbon-btn" type="button" data-word-cmd="strikeThrough" title="Strikethrough"><s>S</s></button><button class="ribbon-btn" type="button" data-word-cmd="insertUnorderedList" title="Bullets">${getIcon('list-view', 15)}</button><button class="ribbon-btn" type="button" data-word-cmd="justifyLeft" title="Align left">${getIcon('list-view', 15)}</button></div><span class="ribbon-label">Font</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn wide" type="button" data-word-action="insert-table">${getIcon('grid-view', 18)}<span>Table</span></button><button class="ribbon-btn wide" type="button" data-word-action="insert-image">${getIcon('image-file', 18)}<span>Pictures</span></button></div><span class="ribbon-label">Insert</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn" type="button" data-word-action="print">${getIcon('file', 17)}</button><button class="ribbon-btn" type="button" data-word-action="undo">${getIcon('undo', 17)}</button><button class="ribbon-btn" type="button" data-word-action="redo">${getIcon('redo', 17)}</button></div><span class="ribbon-label">Actions</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn" type="button" data-word-action="zoom-out">${getIcon('minus', 15)}</button><span class="ribbon-zoom">${zoom}%</span><button class="ribbon-btn" type="button" data-word-action="zoom-in">${getIcon('plus', 15)}</button></div><span class="ribbon-label">Zoom</span></div>
        </div>
        <div class="word-workspace"><div class="word-page-wrap"><article class="word-page" contenteditable="true" spellcheck="true" data-word-editor data-word-doc>${documentHtml(content)}</article></div></div>
        <div class="office-status" data-word-status></div>`;
      const editor = $('[data-word-editor]', root);
      editor.addEventListener('input', () => { dirty = true; updateStatus(); win.setTitle(`${FS.parts(path || 'Document1').pop() || 'Document1'} * - Word`); });
      editor.focus();
      updateStatus();
    }
    root.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-word-tab]');
      if (tab) {
        if (tab.dataset.wordTab === 'File') {
          showContextMenu([
            { label: 'New', icon: 'new-file', action: newDocument },
            { label: 'Open…', icon: 'folder-open', action: () => promptDialog('Open document', 'Enter a file path:', '/Documents/Work/Report.docx', 'Open').then((value) => value && openDocument(value)) },
            { label: 'Save', icon: 'save', action: () => save() },
            { label: 'Save as…', icon: 'save', action: () => save(true) },
            '-',
            { label: 'Close', icon: 'close', action: () => win.close() }
          ], event.clientX, event.clientY);
        } else if (!['Home','Insert','View'].includes(tab.dataset.wordTab)) toast('Word', `${tab.dataset.wordTab} tools are available in the full desktop app.`, 'word');
        return;
      }
      const command = event.target.closest('[data-word-cmd]');
      if (command) { applyCommand(command.dataset.wordCmd); return; }
      const action = event.target.closest('[data-word-action]');
      if (!action) return;
      const name = action.dataset.wordAction;
      if (name === 'saveas') save(true);
      else if (name === 'zoom-in') { zoom = clamp(zoom + 10, 50, 200); render(); }
      else if (name === 'zoom-out') { zoom = clamp(zoom - 10, 50, 200); render(); }
      else if (name === 'undo') applyCommand('undo');
      else if (name === 'redo') applyCommand('redo');
      else if (name === 'paste') applyCommand('paste');
      else if (name === 'insert-table') applyCommand('insertHTML', '<table class="word-table"><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table><p><br></p>');
      else if (name === 'insert-image') toast('Word', 'Choose an image from Photos, then insert it into your document.', 'photos');
      else if (name === 'print') toast('Word', 'The document was sent to Microsoft Print to PDF.', 'word');
    });
    root.addEventListener('change', (event) => {
      if (event.target.matches('[data-word-font]')) applyCommand('fontName', event.target.value);
      if (event.target.matches('[data-word-size]')) applyCommand('fontSize', event.target.value === '12' ? '3' : event.target.value === '14' ? '4' : event.target.value === '18' ? '5' : event.target.value === '24' ? '6' : event.target.value === '32' ? '7' : '2');
    });
    const keyHandler = (event) => {
      if (WM.focusedId !== win.id) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') { event.preventDefault(); newDocument(); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => document.removeEventListener('keydown', keyHandler));
    win.wordOpenPath = openDocument;
    if (path && FS.exists(path)) win.setTitle(`${FS.parts(path).pop()} - Word`);
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: EXCEL — spreadsheet grid, formulas and saved workbooks
// ═══════════════════════════════════════
APPS.excel = {
  title: 'Excel',
  icon: 'excel',
  width: 1020,
  height: 700,
  minWidth: 700,
  minHeight: 500,
  storeOnly: true,
  onReopen(win, params) {
    if (params.path && win.excelOpenPath) win.excelOpenPath(params.path);
  },
  build({ win, params, toast, cleanup }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root excel-app');
    win.body.appendChild(root);
    const columns = 'ABCDEFGH'.split('');
    const defaultData = [
      ['Item', 'Q1', 'Q2', 'Q3', 'Q4', 'Total'],
      ['Software', '12000', '15000', '18000', '21000', '=SUM(B2:E2)'],
      ['Hardware', '8500', '6200', '9400', '7800', '=SUM(B3:E3)'],
      ['Services', '14200', '13800', '15100', '16400', '=SUM(B4:E4)'],
      ['Marketing', '4800', '5200', '6100', '7200', '=SUM(B5:E5)'],
      ['Training', '2200', '1800', '2600', '3100', '=SUM(B6:E6)'],
      ['Total', '=SUM(B2:B6)', '=SUM(C2:C6)', '=SUM(D2:D6)', '=SUM(E2:E6)', '=SUM(F2:F6)']
    ];
    let data = Array.from({ length: 20 }, (_, row) => Array.from({ length: 8 }, (_, col) => defaultData[row]?.[col] || ''));
    let path = params.path ? FS.normalize(params.path) : '/Documents/Work/Budget.xlsx';
    let active = { row: 1, col: 1 };
    let dirty = false;
    if (params.path && FS.get(path)?.content?.startsWith('SHEET:')) {
      try {
        const parsed = JSON.parse(FS.get(path).content.slice(6));
        if (Array.isArray(parsed)) data = parsed;
      } catch (_) {}
    }
    const colIndex = (letter) => columns.indexOf(String(letter).toUpperCase());
    function displayValue(row, col, seen = new Set()) {
      const key = `${row}:${col}`;
      if (seen.has(key)) return '#CIRC!';
      seen.add(key);
      const raw = String(data[row]?.[col] ?? '');
      if (!raw.startsWith('=')) return raw;
      const sum = raw.match(/^=SUM\(([A-Z])(\d+):([A-Z])(\d+)\)$/i);
      if (sum) {
        const c1 = colIndex(sum[1]);
        const r1 = Number(sum[2]) - 1;
        const c2 = colIndex(sum[3]);
        const r2 = Number(sum[4]) - 1;
        if (c1 < 0 || c2 < 0 || c1 > c2 || r1 > r2) return '#REF!';
        let total = 0;
        for (let r = Math.max(0, r1); r <= Math.min(data.length - 1, r2); r++) {
          for (let c = Math.max(0, c1); c <= Math.min(7, c2); c++) total += Number(String(displayValue(r, c, new Set(seen))).replace(/,/g, '')) || 0;
        }
        return total.toLocaleString('en-US');
      }
      return '#NAME?';
    }
    function rawValue(row, col) { return String(data[row]?.[col] ?? ''); }
    function cellTitle(row, col) { return `${columns[col]}${row + 1}`; }
    function setCell(row, col, value) {
      if (!data[row]) data[row] = Array(8).fill('');
      data[row][col] = value;
      dirty = true;
      win.setTitle(`${FS.parts(path).pop()}${dirty ? ' *' : ''} - Excel`);
    }
    function updateSelection() {
      $$('[data-xl-cell]', root).forEach((cell) => cell.classList.toggle('active', Number(cell.dataset.row) === active.row && Number(cell.dataset.col) === active.col));
      const address = $('[data-xl-address]', root);
      const formula = $('[data-xl-formula]', root);
      if (address) address.textContent = cellTitle(active.row, active.col);
      if (formula && document.activeElement !== formula) formula.value = rawValue(active.row, active.col);
    }
    function commitCell(cell) {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      setCell(row, col, cell.textContent.trim());
      render();
    }
    function save() {
      if (!path) path = '/Documents/Work/Budget.xlsx';
      const parent = FS.parent(path);
      if (!FS.exists(parent)) FS.createFolder('/', FS.parts(parent).pop() || 'Documents');
      if (!FS.exists(path)) FS.createFile(parent, FS.parts(path).pop(), '');
      FS.writeFile(path, `SHEET:${JSON.stringify(data)}`);
      dirty = false;
      win.setTitle(`${FS.parts(path).pop()} - Excel`);
      toast('Saved', `${FS.parts(path).pop()} was saved.`, 'excel');
      render();
    }
    function openWorkbook(filePath) {
      const node = FS.get(filePath);
      if (!node || node.type !== 'file') { toast('Excel', 'That workbook could not be opened.', 'excel'); return; }
      path = FS.normalize(filePath);
      dirty = false;
      if (node.content.startsWith('SHEET:')) {
        try { data = JSON.parse(node.content.slice(6)); } catch (_) {}
      }
      render();
    }
    function render() {
      win.setTitle(`${FS.parts(path).pop()}${dirty ? ' *' : ''} - Excel`);
      root.innerHTML = `
        <div class="office-topbar"><div class="office-brand">${getIcon('excel', 20)}<span>Excel</span></div><button class="office-doc-name" type="button" data-xl-save>${esc(FS.parts(path).pop())}${dirty ? ' *' : ''}</button><span class="office-saved">${dirty ? 'Unsaved changes' : 'Saved to this PC'}</span><span class="tm-spacer"></span><button class="office-account" type="button" aria-label="Account">${getIcon('user', 18)}</button></div>
        <div class="office-tabs">${['File','Home','Insert','Formulas','Data','Review','View','Automate','Help'].map((tab, index) => `<button class="office-tab ${index === 1 ? 'active' : ''}" type="button" data-xl-tab="${tab}">${tab}</button>`).join('')}</div>
        <div class="office-ribbon excel-ribbon">
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn wide" type="button" data-xl-save>${getIcon('save', 18)}<span>Save</span></button></div><span class="ribbon-label">File</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn" type="button" data-xl-action="undo">${getIcon('undo', 16)}</button><button class="ribbon-btn" type="button" data-xl-action="redo">${getIcon('redo', 16)}</button></div><span class="ribbon-label">History</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><input class="ribbon-select small" value="Calibri" aria-label="Font" style="width:84px"><input class="ribbon-select small" value="11" aria-label="Font size" style="width:42px"><button class="ribbon-btn" type="button" data-xl-action="bold"><strong>B</strong></button><button class="ribbon-btn" type="button" data-xl-action="fill" style="background:#ffe699">${getIcon('color-palette', 15)}</button></div><span class="ribbon-label">Font</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn wide" type="button" data-xl-action="sum">${getIcon('plus', 16)}<span>AutoSum</span></button><button class="ribbon-btn wide" type="button" data-xl-action="add-row">${getIcon('new-file', 16)}<span>Insert row</span></button></div><span class="ribbon-label">Editing</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn" type="button" data-xl-action="format">${getIcon('grid-view', 17)}</button><button class="ribbon-btn" type="button" data-xl-action="help">${getIcon('info', 17)}</button></div><span class="ribbon-label">Cells</span></div>
        </div>
        <div class="excel-formula-bar"><span class="xl-address" data-xl-address>${cellTitle(active.row, active.col)}</span><span class="xl-fx">fx</span><input class="xl-formula" data-xl-formula value="${esc(rawValue(active.row, active.col))}" aria-label="Formula bar" spellcheck="false"></div>
        <div class="excel-sheet"><table class="excel-grid"><thead><tr><th class="corner"></th>${columns.map((col) => `<th>${col}</th>`).join('')}</tr></thead>
          <tbody>${data.map((row, rowIndex) => `<tr><th>${rowIndex + 1}</th>${columns.map((_, colIndex) => `<td class="${rowIndex === active.row && colIndex === active.col ? 'active' : ''}" contenteditable="true" spellcheck="false" data-xl-cell data-row="${rowIndex}" data-col="${colIndex}" style="${rowIndex === 0 ? 'font-weight:600;background:var(--surface-alt)' : ''}">${esc(displayValue(rowIndex, colIndex))}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>
        <div class="excel-tabs"><button class="excel-sheet-tab active" type="button">Sheet1</button><button class="excel-sheet-tab" type="button" data-xl-action="add-sheet">${getIcon('plus', 12)}</button><span class="tm-spacer"></span><span class="excel-ready">Ready</span></div>
        <div class="office-status"><span>Accessibility: Good to go</span><span>${data.length} rows · ${columns.length} columns</span><span style="margin-left:auto">Sum: ${displayValue(6, 1)}</span><span>100%</span></div>`;
      updateSelection();
    }
    root.addEventListener('focusin', (event) => {
      const cell = event.target.closest('[data-xl-cell]');
      if (cell) {
        active = { row: Number(cell.dataset.row), col: Number(cell.dataset.col) };
        updateSelection();
      }
    });
    root.addEventListener('keydown', (event) => {
      const cell = event.target.closest('[data-xl-cell]');
      if (cell && event.key === 'Enter') { event.preventDefault(); commitCell(cell); }
      if (cell && event.key === 'Escape') { cell.blur(); }
      const formula = event.target.closest('[data-xl-formula]');
      if (formula && event.key === 'Enter') {
        event.preventDefault();
        setCell(active.row, active.col, formula.value.trim());
        render();
      }
    });
    root.addEventListener('focusout', (event) => {
      const cell = event.target.closest('[data-xl-cell]');
      if (cell) {
        const value = cell.textContent.trim();
        if (value !== displayValue(Number(cell.dataset.row), Number(cell.dataset.col))) {
          setCell(Number(cell.dataset.row), Number(cell.dataset.col), value);
          render();
        }
      }
    });
    root.addEventListener('click', (event) => {
      const saveButton = event.target.closest('[data-xl-save]');
      if (saveButton) { save(); return; }
      const tab = event.target.closest('[data-xl-tab]');
      if (tab && tab.dataset.xlTab !== 'Home') { toast('Excel', `${tab.dataset.xlTab} tools are available in the full desktop app.`, 'excel'); return; }
      const action = event.target.closest('[data-xl-action]');
      if (!action) return;
      const name = action.dataset.xlAction;
      if (name === 'undo' || name === 'redo') toast('Excel', 'The workbook has no further history.', 'excel');
      else if (name === 'bold') document.execCommand('bold');
      else if (name === 'fill') toast('Excel', 'Fill color applied to the active cell range.', 'color-palette');
      else if (name === 'sum') {
        const col = columns[active.col];
        const start = Math.max(0, active.row - 5);
        setCell(active.row, active.col, `=SUM(${col}${start + 1}:${col}${active.row})`);
        render();
      } else if (name === 'add-row') { data.push(Array(8).fill('')); render(); }
      else if (name === 'add-sheet') toast('Excel', 'This workbook contains one sheet in the simulator.', 'excel');
      else if (name === 'format') toast('Excel', 'Format Cells is available from the Home ribbon.', 'grid-view');
      else if (name === 'help') alertDialog('Excel help', 'Edit cells directly, enter formulas starting with =, and use AutoSum to add a column total. Press Save to store the workbook in the virtual file system.');
    });
    const keyHandler = (event) => {
      if (WM.focusedId !== win.id) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => document.removeEventListener('keydown', keyHandler));
    win.excelOpenPath = openWorkbook;
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: POWERPOINT — slides, notes and presentation mode
// ═══════════════════════════════════════
APPS.powerpoint = {
  title: 'PowerPoint',
  icon: 'powerpoint',
  width: 1000,
  height: 700,
  minWidth: 720,
  minHeight: 500,
  storeOnly: true,
  onReopen(win, params) {
    if (params.path && win.pptOpenPath) win.pptOpenPath(params.path);
  },
  build({ win, params, toast, cleanup }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root ppt-app');
    win.body.appendChild(root);
    let path = params.path ? FS.normalize(params.path) : '/Documents/Work/Presentation.pptx';
    let current = 0;
    let presenting = false;
    let dirty = false;
    const defaults = [
      { title: 'Quarterly Business Review', subtitle: 'October 2026 · Prepared by User', body: '' },
      { title: 'This quarter at a glance', subtitle: 'Momentum across every team', body: '• 18% faster onboarding\n• 3 accessibility improvements shipped\n• 99.98% desktop reliability\n• New app catalog and shared file system' },
      { title: 'What comes next', subtitle: 'Our priorities for Q4', body: '1. Finish the productivity suite\n2. Expand the Microsoft Store catalog\n3. Refine window management and search\n4. Deliver the accessibility audit' }
    ];
    let slides = defaults.map((slide) => ({ ...slide }));
    if (params.path && FS.get(path)?.content?.startsWith('SLIDES:')) {
      try {
        const parsed = JSON.parse(FS.get(path).content.slice(7));
        if (Array.isArray(parsed) && parsed.length) slides = parsed;
      } catch (_) {}
    }
    function slideHtml(slide, index, thumb = false) {
      if (thumb) {
        return `<div class="ppt-thumb-slide tt-${index % 3}"><strong>${esc(slide.title)}</strong><span>${esc((slide.body || slide.subtitle || '').split('\n')[0])}</span></div>`;
      }
      return `<div class="ppt-slide theme-${index % 3}" data-ppt-slide>
        <div class="ppt-slide-inner">
          <h1 contenteditable="true" spellcheck="false" data-ppt-field="title">${esc(slide.title)}</h1>
          <h2 contenteditable="true" spellcheck="false" data-ppt-field="subtitle">${esc(slide.subtitle)}</h2>
          <div class="ppt-body" contenteditable="true" spellcheck="false" data-ppt-field="body" data-placeholder="Click to add text">${esc(slide.body).replace(/\n/g, '<br>')}</div>
          <div class="ppt-slide-number">${index + 1}</div>
        </div>
      </div>`;
    }
    function render() {
      win.setTitle(`${FS.parts(path).pop()}${dirty ? ' *' : ''} - PowerPoint`);
      root.innerHTML = `
        <div class="office-topbar"><div class="office-brand">${getIcon('powerpoint', 20)}<span>PowerPoint</span></div><button class="office-doc-name" type="button" data-ppt-save>${esc(FS.parts(path).pop())}${dirty ? ' *' : ''}</button><span class="office-saved">${dirty ? 'Unsaved changes' : 'Saved to this PC'}</span><span class="tm-spacer"></span><button class="office-account" type="button" aria-label="Account">${getIcon('user', 18)}</button></div>
        <div class="office-tabs">${['File','Home','Insert','Draw','Design','Transitions','Animations','Slide Show','Review','View'].map((tab, index) => `<button class="office-tab ${index === 1 ? 'active' : ''}" type="button" data-ppt-tab="${tab}">${tab}</button>`).join('')}</div>
        <div class="office-ribbon">
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn wide" type="button" data-ppt-action="new-slide">${getIcon('new-file', 18)}<span>New Slide</span></button><button class="ribbon-btn wide" type="button" data-ppt-action="delete-slide">${getIcon('trash', 18)}<span>Delete</span></button></div><span class="ribbon-label">Slides</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn" type="button" data-ppt-action="bold"><strong>B</strong></button><button class="ribbon-btn" type="button" data-ppt-action="italic"><em>I</em></button><button class="ribbon-btn" type="button" data-ppt-action="underline"><u>U</u></button><button class="ribbon-btn" type="button" data-ppt-action="align">${getIcon('list-view', 15)}</button></div><span class="ribbon-label">Text</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn wide" type="button" data-ppt-action="layout">${getIcon('grid-view', 18)}<span>Layout</span></button><button class="ribbon-btn wide" type="button" data-ppt-action="theme">${getIcon('color-palette', 18)}<span>Design</span></button></div><span class="ribbon-label">Design</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn wide" type="button" data-ppt-action="present">${getIcon('play', 18)}<span>Present</span></button></div><span class="ribbon-label">Slide Show</span></div>
          <div class="ribbon-group"><div class="ribbon-row"><button class="ribbon-btn" type="button" data-ppt-action="prev">${getIcon('chevron-left', 16)}</button><button class="ribbon-btn" type="button" data-ppt-action="next">${getIcon('chevron-right', 16)}</button></div><span class="ribbon-label">Navigate</span></div>
        </div>
        <div class="ppt-workspace">
          <aside class="ppt-sidebar"><div class="ppt-side-head"><span>Slides</span><button type="button" data-ppt-action="new-slide" aria-label="New slide">${getIcon('plus', 13)}</button></div>
            <div class="ppt-thumbs">${slides.map((slide, index) => `<button class="ppt-thumb ${index === current ? 'active' : ''}" type="button" data-ppt-thumb="${index}"><span class="ppt-thumb-num">${index + 1}</span>${slideHtml(slide, index, true)}</button>`).join('')}</div>
          </aside>
          <div class="ppt-main"><div class="ppt-canvas-wrap">${slideHtml(slides[current], current)}</div>
            <div class="ppt-notes"><label>Speaker notes</label><textarea placeholder="Click to add speaker notes" data-ppt-notes>${esc(slides[current].notes || '')}</textarea></div>
          </div>
        </div>
        <div class="office-status"><span>Slide ${current + 1} of ${slides.length}</span><span>English (United States)</span><span style="margin-left:auto">${presenting ? 'Presenting' : 'Normal view'}</span><span>100%</span></div>
        ${presenting ? `<div class="ppt-present-overlay" data-ppt-present>${slideHtml(slides[current], current)}<button class="ppt-present-prev" type="button" data-ppt-action="prev" aria-label="Previous slide">${getIcon('chevron-left', 28)}</button><button class="ppt-present-next" type="button" data-ppt-action="next" aria-label="Next slide">${getIcon('chevron-right', 28)}</button><div class="ppt-present-count">${current + 1} / ${slides.length} · Esc to exit</div></div>` : ''}`;
      if (presenting) root.classList.add('presenting'); else root.classList.remove('presenting');
    }
    function save() {
      if (!path) path = '/Documents/Work/Presentation.pptx';
      const parent = FS.parent(path);
      if (!FS.exists(parent)) FS.createFolder('/', FS.parts(parent).pop() || 'Documents');
      if (!FS.exists(path)) FS.createFile(parent, FS.parts(path).pop(), '');
      FS.writeFile(path, `SLIDES:${JSON.stringify(slides)}`);
      dirty = false;
      toast('Saved', `${FS.parts(path).pop()} was saved.`, 'powerpoint');
      render();
    }
    function openPresentation(filePath) {
      const node = FS.get(filePath);
      if (!node || node.type !== 'file') { toast('PowerPoint', 'That presentation could not be opened.', 'powerpoint'); return; }
      path = FS.normalize(filePath);
      if (node.content.startsWith('SLIDES:')) {
        try { const parsed = JSON.parse(node.content.slice(7)); if (parsed.length) { slides = parsed; current = 0; } } catch (_) {}
      }
      dirty = false;
      render();
    }
    root.addEventListener('click', (event) => {
      const thumb = event.target.closest('[data-ppt-thumb]');
      if (thumb) { current = Number(thumb.dataset.pptThumb); render(); return; }
      const saveButton = event.target.closest('[data-ppt-save]');
      if (saveButton) { save(); return; }
      const tab = event.target.closest('[data-ppt-tab]');
      if (tab) {
        if (tab.dataset.pptTab === 'File') {
          showContextMenu([
            { label: 'Save', icon: 'save', action: save },
            { label: 'Open…', icon: 'folder-open', action: () => promptDialog('Open presentation', 'Enter a file path:', '/Documents/Work/Presentation.pptx', 'Open').then((value) => value && openPresentation(value)) },
            '-',
            { label: 'Close', icon: 'close', action: () => win.close() }
          ], event.clientX, event.clientY);
        } else if (!['Home','Insert','Design','Slide Show'].includes(tab.dataset.pptTab)) toast('PowerPoint', `${tab.dataset.pptTab} tools are available in the full desktop app.`, 'powerpoint');
        return;
      }
      const action = event.target.closest('[data-ppt-action]');
      if (!action) return;
      const name = action.dataset.pptAction;
      if (name === 'new-slide') {
        slides.splice(current + 1, 0, { title: 'New slide', subtitle: 'Click to add a subtitle', body: '' });
        current++;
        dirty = true;
        render();
      } else if (name === 'delete-slide') {
        if (slides.length <= 1) { toast('PowerPoint', 'A presentation must contain at least one slide.', 'powerpoint'); return; }
        slides.splice(current, 1);
        current = Math.min(current, slides.length - 1);
        dirty = true;
        render();
      } else if (name === 'prev') { current = (current - 1 + slides.length) % slides.length; render(); }
      else if (name === 'next') { current = (current + 1) % slides.length; render(); }
      else if (name === 'present') { presenting = true; render(); }
      else if (name === 'layout') toast('PowerPoint', 'The Title and Content layout is applied.', 'grid-view');
      else if (name === 'theme') toast('PowerPoint', 'A new slide theme was applied to this deck.', 'color-palette');
      else if (name === 'bold' || name === 'italic' || name === 'underline' || name === 'align') document.execCommand(name === 'align' ? 'justifyLeft' : name);
    });
    root.addEventListener('input', (event) => {
      const field = event.target.closest('[data-ppt-field]');
      if (field) {
        slides[current][field.dataset.pptField] = field.innerText;
        dirty = true;
        win.setTitle(`${FS.parts(path).pop()} * - PowerPoint`);
      }
      if (event.target.matches('[data-ppt-notes]')) { slides[current].notes = event.target.value; dirty = true; }
    });
    const keyHandler = (event) => {
      if (WM.focusedId !== win.id) return;
      if (event.key === 'Escape' && presenting) { event.preventDefault(); presenting = false; render(); }
      else if (presenting && event.key === 'ArrowRight') { event.preventDefault(); current = (current + 1) % slides.length; render(); }
      else if (presenting && event.key === 'ArrowLeft') { event.preventDefault(); current = (current - 1 + slides.length) % slides.length; render(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => document.removeEventListener('keydown', keyHandler));
    win.pptOpenPath = openPresentation;
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: SPOTIFY — library, playlists and simulated playback
// ═══════════════════════════════════════
APPS.spotify = {
  title: 'Spotify',
  icon: 'spotify',
  width: 1040,
  height: 700,
  minWidth: 720,
  minHeight: 500,
  storeOnly: true,
  build({ win, toast, cleanup }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root spotify-app');
    win.body.appendChild(root);
    const tracks = [
      { title: 'Midnight City Lights', artist: 'Neon Harbor', album: 'After Hours', duration: 228, hue: 212 },
      { title: 'Paper Planes', artist: 'The Still Hours', album: 'Small Signs', duration: 194, hue: 28 },
      { title: 'Golden Hour', artist: 'Mira Vale', album: 'Daylight', duration: 246, hue: 44 },
      { title: 'Slow Motion', artist: 'Northbound', album: 'Open Roads', duration: 213, hue: 172 },
      { title: 'Echoes in Blue', artist: 'Neon Harbor', album: 'After Hours', duration: 256, hue: 216 },
      { title: 'Weightless', artist: 'Aster Field', album: 'Quiet Orbit', duration: 188, hue: 268 },
      { title: 'City Rain', artist: 'The Still Hours', album: 'Small Signs', duration: 235, hue: 198 },
      { title: 'First Light', artist: 'Mira Vale', album: 'Daylight', duration: 201, hue: 36 }
    ];
    const playlists = [
      { name: 'Daily Mix 1', desc: 'Neon Harbor, Mira Vale and more', from: 0, to: 4, hue: 212 },
      { name: 'Focus Flow', desc: 'Instrumental beats for deep work', from: 2, to: 7, hue: 268 },
      { name: 'Evening Drive', desc: 'Warm synths for the open road', from: 1, to: 5, hue: 28 },
      { name: 'Liked Songs', desc: 'Everything you have liked', from: 0, to: 8, hue: 282 }
    ];
    let currentTrack = 0;
    let playing = false;
    let playhead = 0;
    let volume = state.volume;
    let shuffle = false;
    let repeat = false;
    let view = 'home';
    let query = '';
    let playlistId = null;
    let timer = null;
    const liked = new Set([0, 3, 5]);
    function trackList(source = tracks) {
      return source.map((track) => {
        const index = tracks.indexOf(track);
        return `<button class="spotify-track ${index === currentTrack ? 'active' : ''}" type="button" data-spotify-track="${index}">
          <span class="sp-index">${index === currentTrack && playing ? `<span class="sp-eq"><i></i><i></i><i></i></span>` : index + 1}</span>
          <span class="sp-art" style="--sp-h:${track.hue}">${getIcon('music-file-2', 20)}</span>
          <span class="sp-meta"><strong>${esc(track.title)}</strong><span>${esc(track.artist)}</span></span>
          <span class="sp-album">${esc(track.album)}</span>
          <span class="sp-duration">${formatTime(track.duration)}</span>
          <span class="sp-like ${liked.has(index) ? 'liked' : ''}" data-spotify-like="${index}" role="button" aria-label="Like">${getIcon('check', 13)}</span>
        </button>`;
      }).join('');
    }
    function formatTime(seconds) {
      return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    }
    function current() { return tracks[currentTrack]; }
    function heroHtml() {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      return `<section class="spotify-hero"><div><span>Made for you</span><h1>${greeting}, User</h1><p>Fresh mixes, familiar favorites, and a soundtrack for every part of your day.</p><button class="btn sp-play-hero" type="button" data-spotify-play>${getIcon('play', 15)} Play Daily Mix 1</button></div><div class="sp-hero-art">${getIcon('spotify', 74)}</div></section>`;
    }
    function homePage() {
      return `${heroHtml()}
        <div class="spotify-section-head"><h2>Recently played</h2><button type="button" data-spotify-view="library">Show all</button></div>
        <div class="spotify-cards">${playlists.map((playlist, index) => `<button class="spotify-card" type="button" data-spotify-playlist="${index}"><span class="sp-cover" style="--sp-h:${playlist.hue}">${getIcon(index === 3 ? 'check' : 'spotify', 35)}</span><strong>${esc(playlist.name)}</strong><span>${esc(playlist.desc)}</span></button>`).join('')}</div>
        <div class="spotify-section-head"><h2>Made for you</h2><span>${tracks.length} songs</span></div>
        <div class="spotify-tracks">${trackList()}</div>`;
    }
    function searchPage() {
      const results = tracks.filter((track) => `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query.toLowerCase()));
      return `<h1 class="spotify-page-title">Search</h1><div class="spotify-search-wrap">${getIcon('search', 17)}<input type="text" value="${esc(query)}" placeholder="What do you want to listen to?" data-spotify-search aria-label="Search Spotify"></div>
        <div class="spotify-section-head"><h2>${query ? 'Songs' : 'Browse all'}</h2><span>${query ? `${results.length} results` : ''}</span></div>
        ${query ? `<div class="spotify-tracks">${results.length ? trackList(results) : '<div class="spotify-empty">No songs found. Try another search.</div>'}</div>` : `<div class="spotify-cards">${playlists.map((playlist, index) => `<button class="spotify-card" type="button" data-spotify-playlist="${index}"><span class="sp-cover" style="--sp-h:${playlist.hue}">${getIcon('music-file', 35)}</span><strong>${esc(playlist.name)}</strong><span>${esc(playlist.desc)}</span></button>`).join('')}</div>`}`;
    }
    function libraryPage() {
      return `<h1 class="spotify-page-title">Your Library</h1>
        <div class="spotify-library-tabs"><button class="active" type="button">Playlists</button><button type="button">Artists</button><button type="button">Albums</button></div>
        <div class="spotify-cards">${playlists.map((playlist, index) => `<button class="spotify-card" type="button" data-spotify-playlist="${index}"><span class="sp-cover" style="--sp-h:${playlist.hue}">${getIcon(index === 3 ? 'check' : 'spotify', 35)}</span><strong>${esc(playlist.name)}</strong><span>${esc(playlist.desc)}</span></button>`).join('')}</div>
        <div class="spotify-section-head"><h2>Liked songs</h2><span>${liked.size} songs</span></div>
        <div class="spotify-tracks">${trackList([...liked].map((index) => tracks[index]))}</div>`;
    }
    function playlistPage() {
      const playlist = playlists[playlistId] || playlists[0];
      const list = tracks.slice(playlist.from, playlist.to);
      return `<div class="spotify-playlist-hero"><span class="sp-cover large" style="--sp-h:${playlist.hue}">${getIcon('spotify', 62)}</span><div><span>Playlist</span><h1>${esc(playlist.name)}</h1><p>${esc(playlist.desc)} · ${list.length} songs, ${formatTime(list.reduce((sum, track) => sum + track.duration, 0))}</p><button class="btn sp-play-hero" type="button" data-spotify-play>${getIcon('play', 15)} Play</button></div></div>
        <div class="spotify-tracks">${trackList(list)}</div>`;
    }
    function mainHtml() {
      if (view === 'search') return searchPage();
      if (view === 'library') return libraryPage();
      if (view === 'playlist') return playlistPage();
      return homePage();
    }
    function render() {
      root.innerHTML = `<div class="spotify-shell">
        <aside class="spotify-sidebar">
          <div class="spotify-logo">${getIcon('spotify', 24)}<span>Spotify</span></div>
          <button class="spotify-nav ${view === 'home' ? 'active' : ''}" type="button" data-spotify-view="home">${getIcon('home', 18)} Home</button>
          <button class="spotify-nav ${view === 'search' ? 'active' : ''}" type="button" data-spotify-view="search">${getIcon('search', 18)} Search</button>
          <button class="spotify-nav ${view === 'library' ? 'active' : ''}" type="button" data-spotify-view="library">${getIcon('list-view', 18)} Your Library</button>
          <div class="spotify-side-head"><span>Your playlists</span><button type="button" data-spotify-new aria-label="Create playlist">${getIcon('plus', 13)}</button></div>
          <div class="spotify-side-playlists">${playlists.map((playlist, index) => `<button class="${view === 'playlist' && playlistId === index ? 'active' : ''}" type="button" data-spotify-playlist="${index}">${esc(playlist.name)}</button>`).join('')}</div>
          <div class="spotify-side-foot"><button type="button" data-spotify-install>${getIcon('download', 14)} Install App</button></div>
        </aside>
        <main class="spotify-main"><div class="spotify-top"><button class="spotify-nav-arrow" type="button" data-spotify-nav-back aria-label="Back">${getIcon('chevron-left', 16)}</button><button class="spotify-nav-arrow" type="button" aria-label="Forward">${getIcon('chevron-right', 16)}</button><span class="tm-spacer"></span><button class="spotify-user" type="button" data-spotify-account>${getIcon('user', 15)} User</button></div><div class="spotify-content">${mainHtml()}</div></main>
      </div>
      <div class="spotify-player">
        <div class="sp-now"><span class="sp-art" style="--sp-h:${current().hue}">${getIcon('music-file-2', 20)}</span><span class="sp-meta"><strong>${esc(current().title)}</strong><span>${esc(current().artist)}</span></span><button class="sp-heart ${liked.has(currentTrack) ? 'liked' : ''}" type="button" data-spotify-like="${currentTrack}" aria-label="Like">${getIcon('check', 14)}</button></div>
        <div class="sp-center"><div class="sp-controls"><button class="sp-small ${shuffle ? 'active' : ''}" type="button" data-spotify-shuffle aria-label="Shuffle">${getIcon('sort', 14)}</button><button class="sp-small" type="button" data-spotify-prev aria-label="Previous">${getIcon('back', 14)}</button><button class="sp-play" type="button" data-spotify-toggle aria-label="Play or pause">${getIcon(playing ? 'pause' : 'play', 18)}</button><button class="sp-small" type="button" data-spotify-next aria-label="Next">${getIcon('forward', 14)}</button><button class="sp-small ${repeat ? 'active' : ''}" type="button" data-spotify-repeat aria-label="Repeat">${getIcon('refresh', 14)}</button></div><div class="sp-progress"><span data-sp-time>${formatTime(playhead)}</span><input type="range" min="0" max="${current().duration}" value="${playhead}" data-spotify-progress aria-label="Playback position"><span>${formatTime(current().duration)}</span></div></div>
        <div class="sp-right"><button class="sp-small" type="button" data-spotify-mute aria-label="Mute">${getIcon(volume ? 'volume' : 'volume-mute', 15)}</button><input type="range" min="0" max="100" value="${volume}" data-spotify-volume aria-label="Volume"><button class="sp-small" type="button" data-spotify-queue aria-label="Queue">${getIcon('list-view', 15)}</button></div>
      </div>`;
      const search = $('[data-spotify-search]', root);
      if (search) search.addEventListener('input', () => {
        query = search.value;
        render();
        const next = $('[data-spotify-search]', root);
        if (next) { next.focus(); next.setSelectionRange(query.length, query.length); }
      });
    }
    function updateProgress() {
      const bar = $('[data-spotify-progress]', root);
      const time = $('[data-sp-time]', root);
      if (bar) { bar.max = current().duration; bar.value = playhead; }
      if (time) time.textContent = formatTime(playhead);
      const shell = $('.spotify-tracks', root);
      if (shell) {
        const rows = $$('[data-spotify-track]', root);
        rows.forEach((row) => row.classList.toggle('active', Number(row.dataset.spotifyTrack) === currentTrack));
      }
    }
    function setPlaying(value) {
      playing = value;
      if (timer) { clearInterval(timer); timer = null; }
      if (playing) {
        timer = setInterval(() => {
          playhead++;
          if (playhead >= current().duration) {
            if (repeat) playhead = 0;
            else nextTrack();
          }
          updateProgress();
        }, 1000);
      }
      render();
      updateProgress();
    }
    function nextTrack() {
      const order = shuffle ? Math.floor(Math.random() * tracks.length) : (currentTrack + 1) % tracks.length;
      currentTrack = order;
      playhead = 0;
      if (playing) setPlaying(true); else render();
    }
    function prevTrack() {
      if (playhead > 4) { playhead = 0; updateProgress(); return; }
      currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
      playhead = 0;
      render();
    }
    root.addEventListener('click', async (event) => {
      const trackButton = event.target.closest('[data-spotify-track]');
      if (trackButton) {
        currentTrack = Number(trackButton.dataset.spotifyTrack);
        playhead = 0;
        setPlaying(true);
        return;
      }
      const playlist = event.target.closest('[data-spotify-playlist]');
      if (playlist) { playlistId = Number(playlist.dataset.spotifyPlaylist); view = 'playlist'; render(); return; }
      const nav = event.target.closest('[data-spotify-view]');
      if (nav) { view = nav.dataset.spotifyView; query = ''; render(); return; }
      const like = event.target.closest('[data-spotify-like]');
      if (like) {
        event.stopPropagation();
        const index = Number(like.dataset.spotifyLike);
        if (liked.has(index)) liked.delete(index); else liked.add(index);
        render();
        return;
      }
      if (event.target.closest('[data-spotify-toggle]')) { setPlaying(!playing); return; }
      if (event.target.closest('[data-spotify-play]')) { setPlaying(true); return; }
      if (event.target.closest('[data-spotify-next]')) { nextTrack(); return; }
      if (event.target.closest('[data-spotify-prev]')) { prevTrack(); return; }
      if (event.target.closest('[data-spotify-shuffle]')) { shuffle = !shuffle; render(); return; }
      if (event.target.closest('[data-spotify-repeat]')) { repeat = !repeat; render(); return; }
      if (event.target.closest('[data-spotify-mute]')) { volume = volume ? 0 : 75; render(); return; }
      if (event.target.closest('[data-spotify-nav-back]')) { view = 'home'; playlistId = null; render(); return; }
      if (event.target.closest('[data-spotify-new]')) {
        const name = await promptDialog('Create playlist', 'Give your playlist a name:', 'My Playlist', 'Create');
        if (name) { playlists.push({ name, desc: 'Created by you', from: 0, to: 3, hue: randomInt(0, 359) }); render(); toast('Spotify', `Playlist “${name}” was created.`, 'spotify'); }
        return;
      }
      if (event.target.closest('[data-spotify-queue]')) { toast('Spotify', 'Your queue is empty. Play a song to add it.', 'spotify'); return; }
      if (event.target.closest('[data-spotify-install]')) { toast('Spotify', 'Spotify is already installed on this PC.', 'spotify'); return; }
      if (event.target.closest('[data-spotify-account]')) { showContextMenu([{ label: 'User', icon: 'user', disabled: true }, { label: 'Account settings', icon: 'settings', action: () => toast('Spotify', 'Account settings are unavailable in the simulator.', 'spotify') }], event.clientX, event.clientY); }
    });
    root.addEventListener('input', (event) => {
      if (event.target.matches('[data-spotify-progress]')) { playhead = Number(event.target.value); updateProgress(); }
      if (event.target.matches('[data-spotify-volume]')) { volume = Number(event.target.value); state.volume = volume; saveState(); }
    });
    const keyHandler = (event) => {
      if (WM.focusedId !== win.id || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (event.code === 'Space') { event.preventDefault(); setPlaying(!playing); }
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') { event.preventDefault(); nextTrack(); }
    };
    document.addEventListener('keydown', keyHandler);
    cleanup(() => { document.removeEventListener('keydown', keyHandler); if (timer) clearInterval(timer); });
    render();
    return { root };
  }
};

// ═══════════════════════════════════════
// SECTION: APP: GITHUB DESKTOP — repositories, issues, pulls and actions
// ═══════════════════════════════════════
APPS.github = {
  title: 'GitHub Desktop',
  icon: 'github',
  width: 1020,
  height: 700,
  minWidth: 700,
  minHeight: 480,
  storeOnly: true,
  build({ win, toast, cleanup, openApp: launch }) {
    win.body.innerHTML = '';
    const root = h('div', 'app-root github-app');
    win.body.appendChild(root);
    const repos = [
      { name: 'windows11-desktop', owner: 'user', desc: 'A pixel-faithful Windows 11 desktop simulator built with vanilla web technology.', stars: 128, color: '#0078d4', branch: 'main' },
      { name: 'portfolio-site', owner: 'user', desc: 'Personal portfolio and writing about design systems and front-end craft.', stars: 46, color: '#8764b8', branch: 'main' },
      { name: 'notes-cli', owner: 'user', desc: 'A tiny command-line notebook with local storage and Markdown export.', stars: 19, color: '#00b294', branch: 'develop' }
    ];
    let currentRepo = 0;
    let tab = 'code';
    let repoQuery = '';
    let expanded = new Set(['src']);
    const issues = [
      { id: 14, title: 'Window snap preview flickers on secondary display', label: 'bug', state: 'Open', author: 'alexm', comments: 3 },
      { id: 12, title: 'Add keyboard navigation to the Start menu', label: 'enhancement', state: 'Open', author: 'sam-t', comments: 5 },
      { id: 9, title: 'Reduce acrylic blur cost while dragging windows', label: 'performance', state: 'Open', author: 'northbound', comments: 2 },
      { id: 7, title: 'Photos app should remember the last viewed image', label: 'app', state: 'Closed', author: 'mira', comments: 4 }
    ];
    const pulls = [
      { id: 21, title: 'Improve taskbar preview positioning', branch: 'fix/taskbar-previews', state: 'Open', checks: 'passing' },
      { id: 18, title: 'Add Settings search indexing', branch: 'feat/settings-search', state: 'Merged', checks: 'passing' }
    ];
    const files = [
      { name: 'src', type: 'folder', children: [{ name: 'apps', type: 'folder' }, { name: 'styles', type: 'folder' }, { name: 'main.js', type: 'file' }] },
      { name: 'index.html', type: 'file' },
      { name: 'style.css', type: 'file' },
      { name: 'script.js', type: 'file' },
      { name: 'README.md', type: 'file' },
      { name: 'package.json', type: 'file' }
    ];
    function repo() { return repos[currentRepo]; }
    function fileRows(nodes, depth = 0) {
      return nodes.map((node) => {
        const isFolder = node.type === 'folder';
        const open = expanded.has(node.name);
        return `<button class="gh-file-row" type="button" data-gh-file="${esc(node.name)}" data-gh-folder="${isFolder ? '1' : '0'}" style="padding-left:${10 + depth * 18}px"><span class="gh-file-icon">${getIcon(isFolder ? (open ? 'folder-open' : 'folder') : fileIconName(node), 16)}</span><span>${esc(node.name)}</span>${isFolder ? `<span style="margin-left:auto">${getIcon(open ? 'chevron-down' : 'chevron-right', 11)}</span>` : ''}</button>${isFolder && open && node.children ? fileRows(node.children, depth + 1) : ''}`;
      }).join('');
    }
    function codeView() {
      return `<div class="gh-code-layout"><div class="gh-files"><div class="gh-file-head"><span>${getIcon('github', 14)} ${esc(repo().branch)}</span><button type="button" data-gh-action="branch">${getIcon('chevron-down', 11)}</button></div><div class="gh-file-list">${fileRows(files)}</div></div>
        <div class="gh-readme"><div class="gh-readme-head"><span>${getIcon('file', 16)} README.md</span><button type="button" data-gh-action="edit">${getIcon('pencil', 12)} Edit</button></div><div class="gh-readme-body"><h1>${esc(repo().name)}</h1><p>${esc(repo().desc)}</p><h2>Windows 11 Desktop Simulator</h2><p>A complete desktop environment for the browser, including window management, a shared virtual file system, an app catalog, and a growing suite of productivity apps.</p><pre><code>npm install
npm run dev</code></pre><h2>What's inside</h2><ul><li>Boot, lock, and login experience</li><li>File Explorer with a persistent virtual file system</li><li>Microsoft Store with installable apps</li><li>Word, Excel, PowerPoint, Spotify and GitHub Desktop</li></ul></div>
        <div class="gh-side"><div class="gh-side-block"><div class="gh-side-title">About</div><p>${esc(repo().desc)}</p><div class="gh-stat">${getIcon('star', 13)} ${repo().stars} stars</div><div class="gh-stat">${getIcon('github', 13)} ${esc(repo().owner)}/${esc(repo().name)}</div></div><div class="gh-side-block"><div class="gh-side-title">Languages</div><div class="gh-lang"><i style="background:#e34c26"></i>HTML <span>42%</span></div><div class="gh-lang"><i style="background:#563d7c"></i>CSS <span>37%</span></div><div class="gh-lang"><i style="background:#f1e05a"></i>JavaScript <span>21%</span></div></div><button class="btn primary" type="button" data-gh-action="vscode" style="width:100%">${getIcon('vscode', 14)} Open in VS Code</button></div></div>`;
    }
    function issuesView() {
      return `<div class="gh-list-head"><div class="gh-filters"><button class="active" type="button">Open <span>${issues.filter((issue) => issue.state === 'Open').length}</span></button><button type="button">Closed <span>${issues.filter((issue) => issue.state === 'Closed').length}</span></button></div><button class="btn primary" type="button" data-gh-action="new-issue">New issue</button></div>
        <div class="gh-list">${issues.map((issue) => `<button class="gh-issue" type="button" data-gh-issue="${issue.id}"><span class="gh-issue-icon ${issue.state === 'Open' ? 'open' : 'closed'}">${getIcon(issue.state === 'Open' ? 'radio' : 'check', 16)}</span><span class="gh-issue-main"><strong>${esc(issue.title)}</strong><span>#${issue.id} opened by ${esc(issue.author)} · ${issue.comments} comments</span></span><span class="gh-label ${esc(issue.label)}">${esc(issue.label)}</span></button>`).join('')}</div>`;
    }
    function pullsView() {
      return `<div class="gh-list-head"><div class="gh-filters"><button class="active" type="button">Open <span>${pulls.filter((pull) => pull.state === 'Open').length}</span></button><button type="button">Merged <span>${pulls.filter((pull) => pull.state === 'Merged').length}</span></button></div><button class="btn primary" type="button" data-gh-action="new-pull">New pull request</button></div>
        <div class="gh-list">${pulls.map((pull) => `<div class="gh-issue"><span class="gh-issue-icon ${pull.state === 'Open' ? 'open' : 'merged'}">${getIcon(pull.state === 'Open' ? 'forward' : 'check', 16)}</span><span class="gh-issue-main"><strong>${esc(pull.title)}</strong><span>#${pull.id} · ${esc(pull.branch)} · checks ${pull.checks}</span></span><span class="gh-label">${pull.state}</span></div>`).join('')}</div>`;
    }
    function actionsView() {
      return `<div class="gh-list-head"><h2 style="font-size:15px">All workflows</h2><button class="btn primary" type="button" data-gh-action="run">Run workflow</button></div>
        <div class="gh-workflow"><span class="gh-workflow-icon">${getIcon('check', 16)}</span><div><strong>Build and test</strong><span>#128 · main · completed successfully in 1m 42s</span></div><span class="gh-label">Success</span></div>
        <div class="gh-workflow"><span class="gh-workflow-icon">${getIcon('check', 16)}</span><div><strong>Deploy GitHub Pages</strong><span>#96 · main · deployed to production in 38s</span></div><span class="gh-label">Success</span></div>
        <div class="gh-workflow"><span class="gh-workflow-icon">${getIcon('clock', 16)}</span><div><strong>Accessibility audit</strong><span>#44 · pull request · waiting for a runner</span></div><span class="gh-label">Queued</span></div>`;
    }
    function mainView() {
      if (tab === 'issues') return issuesView();
      if (tab === 'pulls') return pullsView();
      if (tab === 'actions') return actionsView();
      return codeView();
    }
    function render() {
      const item = repo();
      win.setTitle(`${item.owner}/${item.name} - GitHub Desktop`);
      root.innerHTML = `<div class="github-shell"><aside class="github-sidebar"><div class="gh-brand">${getIcon('github', 20)}<span>GitHub Desktop</span></div><div class="gh-search">${getIcon('search', 13)}<input type="text" value="${esc(repoQuery)}" placeholder="Filter repositories" data-gh-search aria-label="Filter repositories"></div><div class="gh-side-label">Repositories</div><div class="gh-repos">${repos.filter((repoItem) => repoItem.name.toLowerCase().includes(repoQuery.toLowerCase())).map((repoItem) => { const index = repos.indexOf(repoItem); return `<button class="gh-repo ${index === currentRepo ? 'active' : ''}" type="button" data-gh-repo="${index}"><span class="gh-repo-dot" style="background:${repoItem.color}"></span><span><strong>${esc(repoItem.name)}</strong><span>${esc(repoItem.owner)} / ${esc(repoItem.branch)}</span></span></button>`; }).join('')}</div><div class="gh-side-bottom"><button type="button" data-gh-action="new-repo">${getIcon('plus', 13)} New repository</button><button type="button" data-gh-action="settings">${getIcon('settings', 13)} Settings</button></div></aside>
        <main class="github-main"><div class="gh-topbar"><span class="gh-breadcrumb">${getIcon('github', 15)} <span>${esc(item.owner)}</span> / <strong>${esc(item.name)}</strong></span><span class="gh-private">Private</span><span class="tm-spacer"></span><button class="gh-top-btn" type="button" data-gh-action="star">${getIcon('star', 13)} Star <span>${item.stars}</span></button><button class="gh-top-btn" type="button" data-gh-action="fetch">${getIcon('refresh', 13)} Fetch origin</button></div>
          <div class="gh-tabs">${[['code','Code'],['issues','Issues'],['pulls','Pull requests'],['actions','Actions'],['projects','Projects'],['security','Security'],['insights','Insights']].map(([id, label]) => `<button class="gh-tab ${tab === id ? 'active' : ''}" type="button" data-gh-tab="${id}">${label}${id === 'issues' ? ' <span>3</span>' : id === 'pulls' ? ' <span>1</span>' : ''}</button>`).join('')}</div>
          <div class="gh-content">${mainView()}</div>
        </main></div>`;
      const search = $('[data-gh-search]', root);
      if (search) search.addEventListener('input', () => {
        repoQuery = search.value;
        render();
        const next = $('[data-gh-search]', root);
        if (next) { next.focus(); next.setSelectionRange(repoQuery.length, repoQuery.length); }
      });
    }
    root.addEventListener('click', (event) => {
      const repoButton = event.target.closest('[data-gh-repo]');
      if (repoButton) { currentRepo = Number(repoButton.dataset.ghRepo); tab = 'code'; render(); return; }
      const tabButton = event.target.closest('[data-gh-tab]');
      if (tabButton) { tab = tabButton.dataset.ghTab; render(); return; }
      const file = event.target.closest('[data-gh-file]');
      if (file) {
        if (file.dataset.ghFolder === '1') {
          const name = file.dataset.ghFile;
          if (expanded.has(name)) expanded.delete(name); else expanded.add(name);
          render();
        } else if (file.dataset.ghFile === 'README.md') { tab = 'code'; render(); }
        else toast('GitHub Desktop', 'File preview is available in VS Code.', 'vscode');
        return;
      }
      const issue = event.target.closest('[data-gh-issue]');
      if (issue) { alertDialog(`Issue #${issue.dataset.ghIssue}`, issues.find((item) => String(item.id) === issue.dataset.ghIssue).title); return; }
      const action = event.target.closest('[data-gh-action]');
      if (!action) return;
      const name = action.dataset.ghAction;
      if (name === 'vscode') {
        if (APPS.vscode) launch('vscode', { path: '/Documents/Personal/Notes.txt' });
        else toast('GitHub Desktop', 'Install Visual Studio Code to open this repository.', 'vscode');
      } else if (name === 'star') { repo().stars++; render(); toast('GitHub Desktop', `Starred ${repo().owner}/${repo().name}.`, 'star'); }
      else if (name === 'fetch') toast('GitHub Desktop', 'All branches are up to date. No changes were fetched.', 'github');
      else if (name === 'branch') showContextMenu(repos.map((repoItem) => ({ label: repoItem.branch, icon: 'github', action: () => toast('GitHub Desktop', `Checked out ${repoItem.branch}.`, 'github') })), event.clientX, event.clientY);
      else if (name === 'edit') toast('GitHub Desktop', 'README editing is available in VS Code.', 'vscode');
      else if (name === 'new-issue') {
        promptDialog('New issue', 'Add a title for the new issue:', '', 'Create').then((title) => {
          if (!title) return;
          issues.unshift({ id: Math.max(...issues.map((item) => item.id)) + 1, title, label: 'triage', state: 'Open', author: 'user', comments: 0 });
          tab = 'issues';
          render();
          toast('GitHub Desktop', 'Issue created.', 'github');
        });
      } else if (name === 'new-pull') { toast('GitHub Desktop', 'Create a pull request from a branch in VS Code.', 'github'); }
      else if (name === 'run') { toast('GitHub Desktop', 'Workflow queued. A runner will pick it up shortly.', 'play'); }
      else if (name === 'new-repo') {
        promptDialog('Create repository', 'Repository name:', 'new-project', 'Create').then((value) => {
          if (!value) return;
          repos.push({ name: value.replace(/[^a-z0-9-_]/gi, '-'), owner: 'user', desc: 'A new repository created on this PC.', stars: 0, color: '#0078d4', branch: 'main' });
          currentRepo = repos.length - 1;
          render();
        });
      } else if (name === 'settings') toast('GitHub Desktop', 'Repository settings are available on GitHub.', 'settings');
    });
    render();
    return { root };
  }
};

function hydrateStaticIcons() {
  $$('[data-icon]').forEach((node) => {
    const name = node.dataset.icon;
    if (!name) return;
    node.innerHTML = getIcon(name, Number(node.dataset.iconSize) || 16);
  });
}

function init() {
  loadState();
  hydrateStaticIcons();
  applyTheme(state.theme, false);
  applyAccent(state.accent);
  applyWallpaper(state.wallpaper);
  applyDisplayEffects();
  initDesktop();
  initTaskbar();
  initGlobalEvents();
  configureKeyboard();
  updateClock();
  refreshTrayState();
  startBoot();
}

init();




})();

