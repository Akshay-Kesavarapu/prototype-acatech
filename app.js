/* ── HireTrainers Application ───────────────────────────────────────────────── */
'use strict';

// ── Constants ────────────────────────────────────────────────────────────────
const REJECTED_LABEL    = 'Rejected';
const COIN_NEW_USER     = 50;
const COIN_POST_COST    = 1;
const POST_MAX_CHARS    = 2000;
const PHOTO_MAX_BYTES   = 300 * 1024;        // 300 KB
const UPLOAD_MAX_BYTES  = 10 * 1024 * 1024;  // 10 MB
const JOB_LIFETIME_DAYS = 30;
const WARN_DAYS         = 5;

// ── Pre-kept Seed Accounts ───────────────────────────────────────────────────
const SEED = {
  users: [
    {
      id: 'u1',
      handle: 'user-0873',
      displayName: 'Demo User',
      email: 'demo@hiretrainers.app',
      passwordHash: 'demo1234',
      coins: 50,
      verified: true,
      role: 'user',
      photo: null,
      createdAt: Date.now() - 7 * 86400000
    },
    {
      id: 'u_admin',
      handle: 'user-admin',
      displayName: 'Staff Admin',
      email: 'admin@hiretrainers.in',
      passwordHash: 'admin',
      coins: 50,
      verified: true,
      role: 'admin',
      photo: null,
      createdAt: Date.now() - 10 * 86400000
    },
    {
      id: 'u_superadmin',
      handle: 'user-superadmin',
      displayName: 'Super Admin',
      email: 'superadmin@hiretrainers.in',
      passwordHash: 'superadmin',
      coins: 0,
      verified: true,
      role: 'super-admin',
      photo: null,
      createdAt: Date.now() - 20 * 86400000
    },
    {
      id: 'u2',
      handle: 'user-4421',
      displayName: 'Alex K',
      email: 'alex@example.com',
      passwordHash: 'alex1234',
      coins: 30,
      verified: true,
      role: 'user',
      photo: null,
      createdAt: Date.now() - 14 * 86400000
    },
    {
      id: 'u3',
      handle: 'user-0210',
      displayName: 'Priya M',
      email: 'priya@example.com',
      passwordHash: 'priya123',
      coins: 20,
      verified: true,
      role: 'user',
      photo: null,
      createdAt: Date.now() - 10 * 86400000
    },
    {
      id: 'u4',
      handle: 'user-7731',
      displayName: 'Sam R',
      email: 'sam@example.com',
      passwordHash: 'sam12345',
      coins: 15,
      verified: true,
      role: 'user',
      photo: null,
      createdAt: Date.now() - 5 * 86400000
    },
  ],
  groups: [
    { id: 'g1', name: 'Technical',     type: 'technical' },
    { id: 'g2', name: 'Non-Technical', type: 'non-technical' },
  ],
  jobs: [
    {
      id: 'j1',
      posterId: 'u2',
      groupId: 'g1',
      title: 'React Native Trainer',
      location: 'Remote',
      skills: ['React Native', 'Firebase'],
      spotsTotal: 3,
      spotsFilled: 2,
      postType: 'form',
      template: '',
      pay: '',
      endDate: '',
      createdAt: Date.now() - 2 * 3600000,
      lastActivity: Date.now() - 2 * 3600000,
      closed: false,
      removed: false
    },
    {
      id: 'j2',
      posterId: 'u2',
      groupId: 'g1',
      title: 'Deep Learning Trainer',
      location: 'Kalyan, Mumbai',
      skills: ['ANN', 'CNN', 'RNN', 'Docker', 'AWS'],
      spotsTotal: 3,
      spotsFilled: 1,
      postType: 'template',
      template: 'NITHMINDS PRIVATE LIMITED is hiring...\nExp: 5+ years · Offline · Kalyan\nSkills: ANN, CNN, RNN, Docker, AWS...',
      pay: '',
      endDate: '',
      createdAt: Date.now() - 5 * 3600000,
      lastActivity: Date.now() - 5 * 3600000,
      closed: false,
      removed: false
    },
    {
      id: 'j3',
      posterId: 'u3',
      groupId: 'g2',
      title: 'Soft Skills Workshop',
      location: 'Remote',
      skills: ['Communication', 'Leadership'],
      spotsTotal: 1,
      spotsFilled: 1,
      postType: 'form',
      template: '',
      pay: '₹500/session',
      endDate: '',
      createdAt: Date.now() - 5 * 3600000,
      lastActivity: Date.now() - 5 * 3600000,
      closed: false,
      removed: false
    },
    {
      id: 'j4',
      posterId: 'u2',
      groupId: 'g1',
      title: 'Python Bootcamp Lead',
      location: 'Chennai',
      skills: ['Python', 'NumPy', 'Pandas'],
      spotsTotal: 2,
      spotsFilled: 0,
      postType: 'form',
      template: '',
      pay: '',
      endDate: '',
      createdAt: Date.now() - 5 * 3600000,
      lastActivity: Date.now() - 5 * 3600000,
      closed: false,
      removed: false
    },
    {
      id: 'j5',
      posterId: 'u2',
      groupId: 'g1',
      title: 'Cloud Fundamentals',
      location: 'Remote',
      skills: ['AWS', 'Azure', 'GCP'],
      spotsTotal: 3,
      spotsFilled: 1,
      postType: 'form',
      template: '',
      pay: '',
      endDate: '',
      createdAt: Date.now() - 86400000,
      lastActivity: Date.now() - 86400000,
      closed: false,
      removed: false
    },
    {
      id: 'j6',
      posterId: 'u2',
      groupId: 'g1',
      title: 'Data Structures Crash Course',
      location: 'Remote',
      skills: ['Algorithms', 'Data Structures'],
      spotsTotal: 1,
      spotsFilled: 0,
      postType: 'form',
      template: '',
      pay: '',
      endDate: '',
      createdAt: Date.now() - 2 * 86400000,
      lastActivity: Date.now() - 2 * 86400000,
      closed: false,
      removed: false
    },
  ],
  applications: [
    {
      id: 'a1', jobId: 'j1', applicantId: 'u1', status: 'Under review',
      fileId: 'f1', appliedAt: Date.now() - 2 * 86400000, lastActivity: Date.now() - 2 * 86400000, seenByPoster: false
    },
    {
      id: 'a2', jobId: 'j3', applicantId: 'u1', status: 'Accepted',
      fileId: 'f1', appliedAt: Date.now() - 5 * 86400000, lastActivity: Date.now() - 5 * 86400000, seenByPoster: true
    },
    {
      id: 'a3', jobId: 'j5', applicantId: 'u1', status: REJECTED_LABEL,
      fileId: 'f2', appliedAt: Date.now() - 7 * 86400000, lastActivity: Date.now() - 7 * 86400000, seenByPoster: true
    },
    {
      id: 'a4', jobId: 'j1', applicantId: 'u3', status: 'Under review',
      fileId: 'f1', appliedAt: Date.now() - 1 * 86400000, lastActivity: Date.now() - 1 * 86400000, seenByPoster: false
    },
    {
      id: 'a5', jobId: 'j1', applicantId: 'u4', status: 'Under review',
      fileId: null, appliedAt: Date.now() - 3 * 3600000, lastActivity: Date.now() - 3 * 3600000, seenByPoster: false
    },
    {
      id: 'a6', jobId: 'j4', applicantId: 'u3', status: 'Under review',
      fileId: 'f1', appliedAt: Date.now() - 12 * 3600000, lastActivity: Date.now() - 12 * 3600000, seenByPoster: false
    },
    {
      id: 'a7', jobId: 'j4', applicantId: 'u4', status: 'Under review',
      fileId: null, appliedAt: Date.now() - 6 * 3600000, lastActivity: Date.now() - 6 * 3600000, seenByPoster: false
    },
  ],
  driveFiles: [
    { id: 'f1', ownerId: 'u1', name: 'resume_2026.pdf', size: 240 * 1024, createdAt: Date.now() - 10 * 86400000, hidden: false },
    { id: 'f2', ownerId: 'u1', name: 'portfolio.pdf', size: 1.1 * 1024 * 1024, createdAt: Date.now() - 8 * 86400000, hidden: false },
  ],
  messages: [
    { id: 'm1', jobId: 'j1', applicationId: 'a1', senderId: 'u2', text: 'Hi! Thanks for applying. Can you share your experience with React Native navigation?', sentAt: Date.now() - 1 * 86400000 },
    { id: 'm2', jobId: 'j1', applicationId: 'a1', senderId: 'u1', text: 'Sure! I have 3 years of experience with React Navigation and React Native Screens.', sentAt: Date.now() - 23 * 3600000 },
  ],
  notifications: [
    { id: 'n1', userId: 'u1', text: 'Your application to "React Native Trainer" is under review.', read: false, createdAt: Date.now() - 2 * 86400000 },
    { id: 'n2', userId: 'u1', text: 'Congratulations! Your application to "Soft Skills Workshop" was accepted.', read: true, createdAt: Date.now() - 5 * 86400000 },
    { id: 'n3', userId: 'u1', text: 'Your application to "Cloud Fundamentals" was rejected.', read: true, createdAt: Date.now() - 7 * 86400000 },
    { id: 'n4', userId: 'u2', text: 'user-0873 applied to your posting "React Native Trainer".', read: false, createdAt: Date.now() - 2 * 86400000 },
  ],
  ledger: [
    { id: 'l1', userId: 'u1', type: 'bonus', amount: 50, note: 'Welcome bonus', at: Date.now() - 7 * 86400000 },
    { id: 'l2', userId: 'u1', type: 'spend', amount: -1, note: 'Post: React Native Trainer (group)', at: Date.now() - 3 * 86400000 },
    { id: 'l3', userId: 'u1', type: 'spend', amount: -1, note: 'Post: Python Bootcamp Lead', at: Date.now() - 2 * 86400000 },
    { id: 'l4', userId: 'u1', type: 'spend', amount: -1, note: 'Post: Cloud Fundamentals', at: Date.now() - 1 * 86400000 },
  ],
  auditLog: [
    { id: 'aud1', time: Date.now() - 2 * 86400000, who: 'superadmin@hiretrainers.in', action: 'seed_init', detail: 'System initialized' }
  ]
};

// ── Application State ─────────────────────────────────────────────────────────
let STATE = {};
let currentUserId = null;
let currentView   = 'groups'; // for user/admin: groups | jobs | postings | applications | drive | staff | profile
let staffSubTab   = 'overview'; // for staff / super-admin: overview | groups | jobs | audit | users | roles | coins | profile
let selectedGroupId   = null;
let selectedJobId     = null;
let selectedPostingId = null;
let selectedAppId     = null;
let chatContext       = null;
let pendingAction     = null;
let currentTheme      = 'light';

// Staff Drill-down & Filter states
let staffSelectedGroupId = null;
let staffJobSearch = '';
let staffJobGroupFilter = 'all';
let staffJobModeFilter  = 'all';

// ── LocalStorage Helpers ──────────────────────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem('ht_state');
    if (raw) {
      STATE = JSON.parse(raw);
      ensureSeedAccounts();
    } else {
      resetToSeed();
    }
  } catch(e) {
    resetToSeed();
  }

  try {
    currentUserId = localStorage.getItem('ht_current_user') || null;
  } catch(e) { currentUserId = null; }

  try {
    const sv = localStorage.getItem('ht_view');
    if (sv) currentView = sv;
  } catch(e) {}
}

function ensureSeedAccounts() {
  if (!STATE.users) STATE.users = [];
  if (!STATE.auditLog) STATE.auditLog = [];

  SEED.users.forEach(su => {
    const existing = STATE.users.find(u => u.email.toLowerCase() === su.email.toLowerCase());
    if (!existing) {
      STATE.users.push(JSON.parse(JSON.stringify(su)));
    } else {
      if (su.role && !existing.role) existing.role = su.role;
      if (su.role === 'admin' || su.role === 'super-admin') {
        existing.role = su.role;
        existing.verified = true;
      }
    }
  });
  saveState();
}

function resetToSeed() {
  STATE = JSON.parse(JSON.stringify(SEED));
  saveState();
}

function saveState() {
  try {
    localStorage.setItem('ht_state', JSON.stringify(STATE));
  } catch(e) {}
}

function saveSelf() {
  try {
    if (currentUserId) localStorage.setItem('ht_current_user', currentUserId);
    else localStorage.removeItem('ht_current_user');
  } catch(e) {}
}

function saveView() {
  try {
    localStorage.setItem('ht_view', currentView);
  } catch(e) {}
}

function resetDemo() {
  localStorage.clear();
  currentUserId = null;
  currentView = 'groups';
  staffSubTab = 'overview';
  resetToSeed();
  initTheme();
  render();
  toast('Demo reset to initial seed state', 'primary');
}

// ── User & Role Helpers ───────────────────────────────────────────────────────
function me() {
  if (!currentUserId) return null;
  return (STATE.users || []).find(u => u.id === currentUserId) || null;
}

function getUser(id) {
  return (STATE.users || []).find(u => u.id === id) || null;
}

function getUserByEmail(email) {
  if (!email) return null;
  const n = email.trim().toLowerCase();
  return (STATE.users || []).find(u => u.email.toLowerCase() === n) || null;
}

function getUserByHandle(handle) {
  if (!handle) return null;
  const h = handle.trim().toLowerCase();
  return (STATE.users || []).find(u => u.handle.toLowerCase() === h) || null;
}

function isSuperAdmin(user = me()) {
  return user && (user.role === 'superadmin' || user.role === 'super-admin');
}

function isAdmin(user = me()) {
  return user && (user.role === 'admin');
}

function isStaff(user = me()) {
  return isAdmin(user) || isSuperAdmin(user);
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
function audit(action, detail) {
  if (!STATE.auditLog) STATE.auditLog = [];
  const user = me();
  STATE.auditLog.unshift({
    id: uid(),
    time: Date.now(),
    who: user?.email || 'system',
    action,
    detail
  });
  saveState();
}

// ── Theme Management ──────────────────────────────────────────────────────────
function initTheme() {
  try {
    const saved = localStorage.getItem('ht_theme');
    if (saved) {
      currentTheme = saved;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      currentTheme = 'dark';
    } else {
      currentTheme = 'light';
    }
  } catch(e) {
    currentTheme = 'light';
  }
  document.documentElement.setAttribute('data-theme', currentTheme);
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  try {
    localStorage.setItem('ht_theme', currentTheme);
  } catch(e) {}
  const btn = document.getElementById('topbar-theme-toggle');
  if (btn) btn.innerHTML = currentTheme === 'dark' ? ICONS.sun : ICONS.moon;
}

// ── ID & Time Helpers ─────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function fakeDelay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function timeAgo(ts) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const days = Math.floor(h / 24);
  if (days === 1) return '1 day ago';
  if (days < 7)  return days + ' days ago';
  if (days < 14) return '1 week ago';
  return Math.floor(days / 7) + ' weeks ago';
}

function timeAgoShort(ts) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  const days = Math.floor(h / 24);
  return days + 'd';
}

function daysRemaining(ts) {
  const age = (Date.now() - ts) / 86400000;
  return Math.max(0, JOB_LIFETIME_DAYS - age);
}

function fmtFileSize(bytes) {
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' kb';
  return (bytes / (1024 * 1024)).toFixed(1) + ' mb';
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function validateEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function validatePassword(p) {
  return {
    len: p.length >= 8,
    letter: /[a-zA-Z]/.test(p),
    number: /[0-9]/.test(p)
  };
}

// ── SVG Icons (Lucide Style 1.75px) ───────────────────────────────────────────
const ICONS = {
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/><path d="M2 12h20"/></svg>`,
  message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  paperclip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  presentation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21l4-4 4 4"/><path d="M12 17v4"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  coin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v8"/><path d="M9.5 10.5a2.5 2.5 0 0 1 5 0v0a2.5 2.5 0 0 1-5 0"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="12" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  log: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  overview: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
};

// ── Toast System ──────────────────────────────────────────────────────────────
function toast(msg, type = 'accent', duration = 3500) {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    c.className = 'toast-container';
    document.body.appendChild(c);
  }
  const d = document.createElement('div');
  d.className = 'toast ' + type;
  d.textContent = msg;
  c.appendChild(d);
  setTimeout(() => d.remove(), duration);
}

// ── Modal System ──────────────────────────────────────────────────────────────
function showModal({ title, body, actions }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  const btns = actions.map(a =>
    `<button class="btn ${a.cls || 'btn-ghost'}" data-action="${a.id}" ${a.disabled ? 'disabled' : ''}>${a.label}</button>`
  ).join('');
  overlay.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
    <div class="modal-title">${title}</div>
    <div class="modal-body">${body}</div>
    <div class="modal-actions">${btns}</div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = actions.find(a => a.id === btn.dataset.action);
      overlay.remove();
      if (act && act.fn) act.fn();
    });
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  setTimeout(() => overlay.querySelector('button')?.focus(), 50);
}

// ── Coin Display & Float Animation ────────────────────────────────────────────
function updateCoinDisplay(animateSpend = false) {
  const user = me();
  if (!user || isSuperAdmin(user)) return;
  const chip = document.getElementById('topbar-coin-chip');
  const bal = document.getElementById('topbar-coin-amount');
  if (bal) bal.textContent = user.coins;

  if (chip) {
    chip.className = 'coin-chip' + (user.coins === 0 ? ' zero' : user.coins <= 5 ? ' low' : '');
    chip.setAttribute('aria-label', `${user.coins} coins. Open wallet`);

    if (animateSpend) {
      const badge = document.createElement('span');
      badge.className = 'coin-float-badge';
      badge.textContent = '-1';
      chip.appendChild(badge);
      setTimeout(() => badge.remove(), 1400);
    }
  }
}

// ── Wallet Sheet Modal ────────────────────────────────────────────────────────
function showWalletSheet() {
  const user = me();
  if (!user || isSuperAdmin(user)) return;

  if (user.coins === 0) {
    showOutOfCoinsModal();
    return;
  }

  const userLedger = (STATE.ledger || [])
    .filter(l => l.userId === user.id)
    .sort((a, b) => b.at - a.at)
    .slice(0, 5);

  const ledgerHtml = userLedger.length === 0
    ? '<div class="text-xs text-muted" style="padding:10px 0">No coin transactions yet.</div>'
    : userLedger.map(l => `
      <div class="ledger-row">
        <div>
          <div style="font-weight:600;font-size:13px">${escHtml(l.note)}</div>
          <div class="text-xs text-muted">${new Date(l.at).toLocaleDateString()}</div>
        </div>
        <div class="ledger-amount ${l.amount > 0 ? 'credit' : 'debit'}">
          ${l.amount > 0 ? '+' : ''}${l.amount}
        </div>
      </div>`).join('');

  showModal({
    title: 'Wallet',
    body: `
      <div class="wallet-balance-box">
        <div>
          <div class="wallet-balance-lbl">Available balance</div>
          <div class="wallet-balance-val">${user.coins} coins</div>
        </div>
        <button class="btn btn-primary" id="wallet-buy-btn" style="font-size:12px;padding:6px 14px">Buy coins</button>
      </div>
      <div class="section-title">Recent transactions (last 5)</div>
      <div style="margin-bottom:12px">${ledgerHtml}</div>
      <div style="text-align:right">
        <a href="#" id="wallet-full-ledger-link" style="font-size:12px;font-weight:600">View full ledger in Profile &rarr;</a>
      </div>`,
    actions: [
      { id: 'close', label: 'Close', cls: 'btn-ghost' }
    ]
  });

  document.getElementById('wallet-buy-btn')?.addEventListener('click', () => {
    document.querySelector('.modal-overlay')?.remove();
    showBuyCoinsModal();
  });

  document.getElementById('wallet-full-ledger-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.modal-overlay')?.remove();
    currentView = 'profile';
    saveView();
    render();
  });
}

function showOutOfCoinsModal() {
  showModal({
    title: 'You are out of coins',
    body: 'Posting a job requires 1 coin. Your current coin balance is 0. Buy a coin pack to continue.',
    actions: [
      { id: 'buy', label: 'Buy coins', cls: 'btn-primary', fn: showBuyCoinsModal },
      { id: 'close', label: 'Close', cls: 'btn-ghost' }
    ]
  });
}

function showBuyCoinsModal() {
  const packs = [
    { coins: 10,  price: '₹99 (placeholder)' },
    { coins: 50,  price: '₹399 (placeholder)' },
    { coins: 100, price: '₹699 (placeholder)' },
  ];

  const packsHtml = packs.map((p, i) => `
    <div class="coin-pack">
      <div>
        <div class="coin-pack-info">${p.coins} coins</div>
        <div class="coin-pack-price">${p.price}</div>
      </div>
      <button class="btn btn-primary buy-pack-btn" data-index="${i}" style="font-size:12px;padding:6px 14px">Buy</button>
    </div>`).join('');

  showModal({
    title: 'Buy coins',
    body: `Select a coin pack to add to your balance:<br><br>${packsHtml}`,
    actions: [
      { id: 'close', label: 'Close', cls: 'btn-ghost' }
    ]
  });

  document.querySelectorAll('.buy-pack-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      const pack = packs[idx];
      const user = me();
      if (!user) return;
      user.coins += pack.coins;
      if (!STATE.ledger) STATE.ledger = [];
      STATE.ledger.push({
        id: uid(),
        userId: user.id,
        type: 'purchase',
        amount: pack.coins,
        note: `Purchased ${pack.coins} coins (${pack.price})`,
        at: Date.now()
      });
      saveState();
      document.querySelector('.modal-overlay')?.remove();
      updateCoinDisplay();
      toast(`Successfully purchased ${pack.coins} coins!`, 'success');
      render();
    });
  });
}

// ── Render Entrypoint ─────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  const user = me();
  if (!user) {
    renderAuth(app);
    return;
  }

  // Route deciding home:
  // - Super-Admin -> Staff App Only
  // - Admin & User -> User App (Admin has extra 'Staff' item)
  if (isSuperAdmin(user)) {
    renderSuperAdminApp(app);
  } else {
    renderUserApp(app);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION (ONE PAGE, THREE ACCOUNTS, THREE HOMES)
// ═══════════════════════════════════════════════════════════════════════════════
let authScreen = 'signin'; // signin | signup | forgot

function renderAuth(app) {
  app.innerHTML = `<div class="auth-overlay" id="auth-overlay"></div>`;
  renderAuthScreen();
}

function renderAuthScreen() {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;
  if (authScreen === 'signin')  overlay.innerHTML = signInHTML();
  if (authScreen === 'signup')  overlay.innerHTML = signUpHTML();
  if (authScreen === 'forgot')  overlay.innerHTML = forgotHTML();
  attachAuthEvents();
}

function signInHTML() {
  return `<div class="auth-card">
    <div class="auth-title">HireTrainers</div>
    <div class="auth-sub">Welcome back! Sign in to continue.</div>
    <div id="auth-msg"></div>
    <div class="auth-field">
      <label class="auth-label" for="si-email">Email</label>
      <input class="input" type="email" id="si-email" placeholder="you@example.com" autocomplete="email">
    </div>
    <div class="auth-field">
      <label class="auth-label" for="si-pass">Password</label>
      <div class="auth-input-wrap">
        <input class="input" type="password" id="si-pass" placeholder="••••••••" autocomplete="current-password">
        <button class="auth-toggle" id="si-toggle" type="button" aria-label="Show or hide password">${ICONS.eye}</button>
      </div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
      <a href="#" id="go-forgot" style="font-size:12px">Forgot password?</a>
    </div>
    <button class="btn btn-primary w-full" id="si-btn">Sign in</button>
    <div class="auth-divider">or</div>
    <button class="btn btn-ghost w-full" id="google-btn">Continue with Google (mock)</button>

    <!-- Prototype Accounts Quick Fill Box -->
    <div class="proto-accounts-box">
      <div class="proto-accounts-title">
        <span>Prototype accounts</span>
        <span class="reset-link" id="reset-link">Reset demo</span>
      </div>
      <div class="proto-accounts-btns">
        <button class="proto-quick-btn" id="qa-user">demo user</button>
        <button class="proto-quick-btn" id="qa-admin">admin</button>
        <button class="proto-quick-btn" id="qa-super">super-admin</button>
      </div>
      <div class="proto-accounts-note">
        Prototype only. Never use accounts like these in the real app.
      </div>
    </div>

    <div class="auth-footer">Don't have an account? <a href="#" id="go-signup">Sign up</a></div>
  </div>`;
}

function signUpHTML() {
  return `<div class="auth-card">
    <div class="auth-title">Create account</div>
    <div class="auth-sub">Join HireTrainers to post or apply for trainer roles.</div>
    <div id="auth-msg"></div>
    <div class="auth-field">
      <label class="auth-label" for="su-name">Display name</label>
      <input class="input" type="text" id="su-name" placeholder="Alex Kumar" autocomplete="name">
    </div>
    <div class="auth-field">
      <label class="auth-label" for="su-email">Email</label>
      <input class="input" type="email" id="su-email" placeholder="you@example.com" autocomplete="email">
    </div>
    <div class="auth-field">
      <label class="auth-label" for="su-pass">Password</label>
      <div class="auth-input-wrap">
        <input class="input" type="password" id="su-pass" placeholder="••••••••" autocomplete="new-password">
        <button class="auth-toggle" id="su-toggle" type="button" aria-label="Show or hide password">${ICONS.eye}</button>
      </div>
      <div class="password-rules">
        <span class="pw-rule" id="pr-len">${ICONS.x} At least 8 characters</span>
        <span class="pw-rule" id="pr-letter">${ICONS.x} Contains a letter</span>
        <span class="pw-rule" id="pr-number">${ICONS.x} Contains a number</span>
      </div>
    </div>
    <div class="auth-field">
      <label class="auth-label" for="su-conf">Confirm password</label>
      <input class="input" type="password" id="su-conf" placeholder="••••••••" autocomplete="new-password">
    </div>
    <button class="btn btn-primary w-full" id="su-btn">Create account</button>
    <div class="auth-footer">Already have an account? <a href="#" id="go-signin">Sign in</a></div>
  </div>`;
}

function forgotHTML() {
  return `<div class="auth-card">
    <div class="auth-title">Forgot password</div>
    <div class="auth-sub">We'll send a reset link to your email address.</div>
    <div id="auth-msg"></div>
    <div class="auth-field">
      <label class="auth-label" for="fp-email">Email</label>
      <input class="input" type="email" id="fp-email" placeholder="you@example.com" autocomplete="email">
    </div>
    <button class="btn btn-primary w-full" id="fp-btn">Send reset link</button>
    <div class="auth-footer"><a href="#" id="go-signin2">Back to sign in</a></div>
  </div>`;
}

function attachAuthEvents() {
  document.getElementById('si-toggle')?.addEventListener('click', () => {
    const inp = document.getElementById('si-pass');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('su-toggle')?.addEventListener('click', () => {
    const inp = document.getElementById('su-pass');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('go-signup')?.addEventListener('click', e => { e.preventDefault(); authScreen = 'signup'; renderAuthScreen(); });
  document.getElementById('go-signin')?.addEventListener('click', e => { e.preventDefault(); authScreen = 'signin'; renderAuthScreen(); });
  document.getElementById('go-signin2')?.addEventListener('click', e => { e.preventDefault(); authScreen = 'signin'; renderAuthScreen(); });
  document.getElementById('go-forgot')?.addEventListener('click', e => { e.preventDefault(); authScreen = 'forgot'; renderAuthScreen(); });
  document.getElementById('reset-link')?.addEventListener('click', resetDemo);

  // Prototype Quick Fill Buttons
  document.getElementById('qa-user')?.addEventListener('click', () => {
    const e = document.getElementById('si-email');
    const p = document.getElementById('si-pass');
    if (e && p) { e.value = 'demo@hiretrainers.app'; p.value = 'demo1234'; }
  });
  document.getElementById('qa-admin')?.addEventListener('click', () => {
    const e = document.getElementById('si-email');
    const p = document.getElementById('si-pass');
    if (e && p) { e.value = 'admin@hiretrainers.in'; p.value = 'admin'; }
  });
  document.getElementById('qa-super')?.addEventListener('click', () => {
    const e = document.getElementById('si-email');
    const p = document.getElementById('si-pass');
    if (e && p) { e.value = 'superadmin@hiretrainers.in'; p.value = 'superadmin'; }
  });

  document.getElementById('google-btn')?.addEventListener('click', () => {
    showMsg('auth-msg', 'Google sign-in is mocked for this prototype. Use email/password.', 'info');
  });

  document.getElementById('su-pass')?.addEventListener('input', e => {
    const v = validatePassword(e.target.value);
    setRule('pr-len',    v.len);
    setRule('pr-letter', v.letter);
    setRule('pr-number', v.number);
  });

  document.getElementById('si-btn')?.addEventListener('click', doSignIn);
  document.getElementById('si-email')?.addEventListener('keydown', e => e.key === 'Enter' && doSignIn());
  document.getElementById('si-pass')?.addEventListener('keydown', e => e.key === 'Enter' && doSignIn());

  document.getElementById('su-btn')?.addEventListener('click', doSignUp);
  document.getElementById('fp-btn')?.addEventListener('click', doForgot);
}

function setRule(id, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'pw-rule' + (ok ? ' ok' : '');
  el.innerHTML = (ok ? ICONS.check : ICONS.x) + ' ' + el.textContent.trim().replace(/^.+?\s/, '');
}

function showMsg(containerId, text, type = 'error') {
  const el = document.getElementById(containerId);
  if (!el) return;
  const cls = type === 'error' ? 'auth-error' : type === 'success' ? 'auth-success' : 'auth-info';
  el.innerHTML = `<div class="${cls}">${text}</div>`;
}

function setLoading(btn, loading, defaultText) {
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? `<span class="spinner"></span> Loading…` : defaultText;
}

async function doSignIn() {
  const email = document.getElementById('si-email')?.value.trim();
  const pass  = document.getElementById('si-pass')?.value;
  if (!email) { showMsg('auth-msg', 'Email is required'); return; }
  if (!validateEmail(email)) { showMsg('auth-msg', 'Enter a valid email address'); return; }
  if (!pass) { showMsg('auth-msg', 'Password is required'); return; }

  const btn = document.getElementById('si-btn');
  setLoading(btn, true, 'Sign in');
  await fakeDelay(350);

  const user = getUserByEmail(email);
  if (!user || user.passwordHash !== pass) {
    showMsg('auth-msg', 'Incorrect email or password');
    setLoading(btn, false, 'Sign in');
    return;
  }

  currentUserId = user.id;
  saveSelf();
  setLoading(btn, false, 'Sign in');

  // Set initial view based on role
  if (isSuperAdmin(user)) {
    staffSubTab = 'overview';
  } else {
    currentView = 'groups';
    saveView();
  }

  render();
}

async function doSignUp() {
  const name  = document.getElementById('su-name')?.value.trim();
  const email = document.getElementById('su-email')?.value.trim();
  const pass  = document.getElementById('su-pass')?.value;
  const conf  = document.getElementById('su-conf')?.value;

  if (!name) { showMsg('auth-msg', 'Display name is required'); return; }
  if (!email) { showMsg('auth-msg', 'Email is required'); return; }
  if (!validateEmail(email)) { showMsg('auth-msg', 'Enter a valid email address'); return; }
  if (!pass) { showMsg('auth-msg', 'Password is required'); return; }
  const rules = validatePassword(pass);
  if (!rules.len || !rules.letter || !rules.number) {
    showMsg('auth-msg', 'Password does not meet requirements'); return;
  }
  if (pass !== conf) { showMsg('auth-msg', 'Passwords do not match'); return; }
  if (getUserByEmail(email)) { showMsg('auth-msg', 'An account with this email already exists'); return; }

  const btn = document.getElementById('su-btn');
  setLoading(btn, true, 'Create account');
  await fakeDelay(450);

  const newUser = {
    id: uid(),
    handle: 'user-' + Math.floor(1000 + Math.random() * 9000),
    displayName: name,
    email: email.toLowerCase(),
    passwordHash: pass,
    coins: COIN_NEW_USER,
    verified: false,
    role: 'user',
    photo: null,
    createdAt: Date.now()
  };

  STATE.users.push(newUser);
  if (!STATE.ledger) STATE.ledger = [];
  STATE.ledger.push({
    id: uid(),
    userId: newUser.id,
    type: 'bonus',
    amount: COIN_NEW_USER,
    note: 'Welcome bonus',
    at: Date.now()
  });
  saveState();

  currentUserId = newUser.id;
  currentView = 'groups';
  saveSelf();
  saveView();
  setLoading(btn, false, 'Create account');
  toast(`Welcome, ${name}! You received 50 coins.`, 'success');
  render();
}

async function doForgot() {
  const email = document.getElementById('fp-email')?.value.trim();
  if (!email) { showMsg('auth-msg', 'Email is required'); return; }
  if (!validateEmail(email)) { showMsg('auth-msg', 'Enter a valid email address'); return; }

  const btn = document.getElementById('fp-btn');
  setLoading(btn, true, 'Send reset link');
  await fakeDelay(400);
  setLoading(btn, false, 'Send reset link');
  showMsg('auth-msg', 'If an account exists, a reset link was sent.', 'success');
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER & ADMIN APPLICATION SHELL
// (Admin gets FULL user app + ONE extra 'Staff' item before Profile)
// ═══════════════════════════════════════════════════════════════════════════════
function renderUserApp(app) {
  const user = me();
  if (!user) { renderAuth(app); return; }

  const unreadCount = (STATE.notifications || []).filter(n => n.userId === user.id && !n.read).length;
  const unreadMsgCount = (STATE.applications || [])
    .filter(a => {
      const job = (STATE.jobs || []).find(j => j.id === a.jobId);
      return job && job.posterId === user.id && !a.seenByPoster;
    }).length;

  const userIsAdmin = isAdmin(user);

  app.innerHTML = `
  <!-- Top Bar (Coin chip always visible for user & admin) -->
  <header class="topbar" role="banner">
    <div class="topbar-brand">
      <div class="topbar-logo">H</div>
      <span class="topbar-title">HireTrainers</span>
    </div>
    <div class="topbar-actions">
      <!-- Live Coin Chip -->
      <button class="coin-chip ${user.coins === 0 ? 'zero' : user.coins <= 5 ? 'low' : ''}" id="topbar-coin-chip" aria-label="${user.coins} coins. Open wallet">
        ${ICONS.coin}
        <span id="topbar-coin-amount">${user.coins}</span>
      </button>

      <!-- Notifications Bell -->
      <button class="topbar-btn" id="topbar-bell-btn" aria-label="Notifications">
        ${ICONS.bell}
        ${unreadCount > 0 ? `<span class="topbar-badge">${unreadCount}</span>` : ''}
      </button>

      <!-- Theme Toggle -->
      <button class="topbar-btn" id="topbar-theme-toggle" aria-label="Toggle theme">
        ${currentTheme === 'dark' ? ICONS.sun : ICONS.moon}
      </button>
    </div>
  </header>

  <!-- App Body Layout -->
  <div class="app-shell">
    <nav class="rail" aria-label="Main Navigation">
      <button class="rail-btn ${currentView === 'groups' ? 'active' : ''}" data-view="groups" aria-label="Groups">
        ${ICONS.users}
        <span class="rail-label">Groups</span>
      </button>
      <button class="rail-btn ${currentView === 'jobs' ? 'active' : ''}" data-view="jobs" aria-label="Jobs">
        ${ICONS.briefcase}
        <span class="rail-label">Jobs</span>
      </button>
      <button class="rail-btn ${currentView === 'postings' ? 'active' : ''}" data-view="postings" aria-label="My postings">
        ${ICONS.message}
        <span class="rail-label">Postings</span>
        ${unreadMsgCount > 0 ? `<span class="rail-badge">${unreadMsgCount}</span>` : ''}
      </button>
      <button class="rail-btn ${currentView === 'applications' ? 'active' : ''}" data-view="applications" aria-label="My applications">
        ${ICONS.send}
        <span class="rail-label">Applied</span>
      </button>
      <button class="rail-btn ${currentView === 'drive' ? 'active' : ''}" data-view="drive" aria-label="Drive">
        ${ICONS.folder}
        <span class="rail-label">Drive</span>
      </button>

      <!-- Admin gets ONE extra navigation item called 'Staff' placed before Profile -->
      ${userIsAdmin ? `
      <button class="rail-btn ${currentView === 'staff' ? 'active' : ''}" data-view="staff" aria-label="Staff tools">
        ${ICONS.shield}
        <span class="rail-label">Staff</span>
      </button>` : ''}

      <div class="rail-spacer"></div>

      <button class="rail-btn ${currentView === 'profile' ? 'active' : ''}" data-view="profile" aria-label="Profile">
        ${ICONS.user}
        <span class="rail-label">Profile</span>
      </button>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content" id="main-content"></main>
  </div>

  <div class="toast-container" id="toast-container"></div>
  <div id="notifications-slideover-mount"></div>`;

  // Attach Top Bar Events
  document.getElementById('topbar-coin-chip')?.addEventListener('click', showWalletSheet);
  document.getElementById('topbar-bell-btn')?.addEventListener('click', toggleNotificationsSlideover);
  document.getElementById('topbar-theme-toggle')?.addEventListener('click', toggleTheme);

  // Attach Rail Nav Events
  app.querySelectorAll('.rail-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.view;
      saveView();
      render();
    });
  });

  renderUserAppView();
}

function renderUserAppView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  if (currentView === 'groups')            renderGroupsView(main);
  else if (currentView === 'jobs')         renderJobsView(main);
  else if (currentView === 'postings')     renderMyPostingsView(main);
  else if (currentView === 'applications') renderMyApplicationsView(main);
  else if (currentView === 'drive')        renderDriveView(main);
  else if (currentView === 'staff')        renderAdminStaffView(main);
  else if (currentView === 'profile')      renderProfileView(main);
  else if (currentView === 'chat')         renderChatView(main);
  else if (currentView === 'kyc')          renderKycView(main);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPER-ADMIN'S STAFF APP ONLY (SECTION 3)
// No user features at all: no wallet, no coin chip, no "buy coins", no Apply,
// no My postings, no My applications, no Drive, no KYC, no bell, no profile photo.
// ═══════════════════════════════════════════════════════════════════════════════
function renderSuperAdminApp(app) {
  const user = me();
  if (!user) { renderAuth(app); return; }

  // Valid views for super-admin: overview | groups | jobs | audit | users | roles | coins | profile
  if (!['overview', 'groups', 'jobs', 'audit', 'users', 'roles', 'coins', 'profile'].includes(staffSubTab)) {
    staffSubTab = 'overview';
  }

  app.innerHTML = `
  <!-- Top Bar: Logo & Name on left; Theme toggle, Super-admin pill, and Sign out on right -->
  <header class="topbar" role="banner">
    <div class="topbar-brand">
      <div class="topbar-logo">H</div>
      <span class="topbar-title">HireTrainers Staff</span>
    </div>
    <div class="topbar-actions">
      <!-- Theme Toggle -->
      <button class="topbar-btn" id="topbar-theme-toggle" aria-label="Toggle theme">
        ${currentTheme === 'dark' ? ICONS.sun : ICONS.moon}
      </button>

      <span class="role-pill superadmin" style="font-size:12px;padding:3px 10px">Super-admin</span>

      <button class="btn btn-ghost" id="superadmin-topbar-signout" style="font-size:12px;padding:5px 12px">Sign out</button>
    </div>
  </header>

  <!-- Super-Admin 3-Pane Layout -->
  <div class="app-shell">
    <nav class="rail" aria-label="Staff Navigation">
      <button class="rail-btn ${staffSubTab === 'overview' ? 'active' : ''}" data-staff-view="overview" aria-label="Overview">
        ${ICONS.overview}
        <span class="rail-label">Overview</span>
      </button>
      <button class="rail-btn ${staffSubTab === 'groups' ? 'active' : ''}" data-staff-view="groups" aria-label="Groups">
        ${ICONS.users}
        <span class="rail-label">Groups</span>
      </button>
      <button class="rail-btn ${staffSubTab === 'jobs' ? 'active' : ''}" data-staff-view="jobs" aria-label="Jobs">
        ${ICONS.briefcase}
        <span class="rail-label">Jobs</span>
      </button>
      <button class="rail-btn ${staffSubTab === 'audit' ? 'active' : ''}" data-staff-view="audit" aria-label="Audit log">
        ${ICONS.log}
        <span class="rail-label">Audit</span>
      </button>
      <button class="rail-btn ${staffSubTab === 'users' ? 'active' : ''}" data-staff-view="users" aria-label="Users">
        ${ICONS.user}
        <span class="rail-label">Users</span>
      </button>
      <button class="rail-btn ${staffSubTab === 'roles' ? 'active' : ''}" data-staff-view="roles" aria-label="Roles">
        ${ICONS.shield}
        <span class="rail-label">Roles</span>
      </button>
      <button class="rail-btn ${staffSubTab === 'coins' ? 'active' : ''}" data-staff-view="coins" aria-label="Coins">
        ${ICONS.coin}
        <span class="rail-label">Coins</span>
      </button>

      <div class="rail-spacer"></div>

      <!-- Profile pinned at the bottom -->
      <button class="rail-btn ${staffSubTab === 'profile' ? 'active' : ''}" data-staff-view="profile" aria-label="Profile">
        ${ICONS.user}
        <span class="rail-label">Profile</span>
      </button>
    </nav>

    <!-- Super-admin Content Mount -->
    <main class="main-content" id="superadmin-content"></main>
  </div>

  <div class="toast-container" id="toast-container"></div>`;

  document.getElementById('topbar-theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('superadmin-topbar-signout')?.addEventListener('click', doSignOut);

  app.querySelectorAll('.rail-btn[data-staff-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      staffSubTab = btn.dataset.staffView;
      renderSuperAdminApp(app);
    });
  });

  renderSuperAdminView();
}

function renderSuperAdminView() {
  const mount = document.getElementById('superadmin-content');
  if (!mount) return;

  if (staffSubTab === 'overview') {
    renderStaffOverviewView(mount);
  } else if (staffSubTab === 'groups') {
    renderStaffGroupsView(mount);
  } else if (staffSubTab === 'jobs') {
    renderStaffJobsView(mount);
  } else if (staffSubTab === 'audit') {
    renderStaffAuditView(mount);
  } else if (staffSubTab === 'users') {
    renderSuperAdminUsersView(mount);
  } else if (staffSubTab === 'roles') {
    renderSuperAdminRolesView(mount);
  } else if (staffSubTab === 'coins') {
    renderSuperAdminCoinsView(mount);
  } else if (staffSubTab === 'profile') {
    renderSuperAdminProfileView(mount);
  }
}

function doSignOut() {
  currentUserId = null;
  saveSelf();
  render();
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS SLIDEOVER (USER & ADMIN ONLY)
// ═══════════════════════════════════════════════════════════════════════════════
let slideoverOpen = false;

function toggleNotificationsSlideover() {
  slideoverOpen = !slideoverOpen;
  const mount = document.getElementById('notifications-slideover-mount');
  if (!mount) return;

  if (!slideoverOpen) {
    mount.innerHTML = '';
    return;
  }

  const user = me();
  const notifs = (STATE.notifications || [])
    .filter(n => n.userId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  mount.innerHTML = `
  <div class="slideover-backdrop" id="slideover-backdrop"></div>
  <div class="slideover" role="dialog" aria-modal="true" aria-label="Notifications">
    <div class="slideover-header">
      <span class="slideover-title">Notifications</span>
      <button class="btn-icon" id="close-slideover-btn" aria-label="Close notifications">${ICONS.x}</button>
    </div>
    <div class="slideover-body">
      ${notifs.length === 0
        ? '<div class="text-sm text-muted" style="padding:24px 20px;text-align:center">No notifications yet.</div>'
        : notifs.map(n => `
        <div class="notif-item ${!n.read ? 'unread' : ''}" data-nid="${n.id}">
          <div class="notif-text">${escHtml(n.text)}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>`).join('')}
    </div>
  </div>`;

  document.getElementById('slideover-backdrop')?.addEventListener('click', () => toggleNotificationsSlideover());
  document.getElementById('close-slideover-btn')?.addEventListener('click', () => toggleNotificationsSlideover());

  mount.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const nid = el.dataset.nid;
      const target = (STATE.notifications || []).find(n => n.id === nid);
      if (target) {
        target.read = true;
        saveState();
        el.classList.remove('unread');
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUPS SCREEN (NORMAL USER & ADMIN VIEW)
// The admin's normal Groups tab stays the ordinary user view (composer, apply links).
// Moderation happens only inside Staff!
// ═══════════════════════════════════════════════════════════════════════════════
function renderGroupsView(main) {
  const groups = STATE.groups || [];
  if (!selectedGroupId && groups.length > 0) {
    selectedGroupId = groups[0].id;
  }

  const listRows = groups.map(g => {
    const isSelected = (g.id === selectedGroupId);
    const groupJobs = (STATE.jobs || []).filter(j => j.groupId === g.id && !j.removed);
    const lastJob = groupJobs[groupJobs.length - 1];
    const poster = lastJob ? getUser(lastJob.posterId) : null;
    const preview = lastJob ? `${poster?.handle || 'user'}: ${lastJob.title}` : 'No posts yet';
    const time = lastJob ? timeAgoShort(lastJob.createdAt) : '';

    return `
    <div class="list-row ${isSelected ? 'selected' : ''}" data-gid="${g.id}">
      <div class="avatar ${g.type === 'technical' ? 'avatar-primary' : 'avatar-jade'}">
        ${g.type === 'technical' ? ICONS.code : ICONS.presentation}
      </div>
      <div class="list-row-content">
        <div class="list-row-title">${escHtml(g.name)}</div>
        <div class="list-row-meta">${escHtml(preview)}</div>
      </div>
      <div class="list-row-right">
        <span class="list-row-time">${time}</span>
        ${isSelected ? `<span class="badge badge-accent">${groupJobs.length}</span>` : `<span class="badge badge-neutral">${groupJobs.length}</span>`}
      </div>
    </div>`;
  }).join('');

  main.innerHTML = `
  <div class="list-pane">
    <div class="list-pane-header">
      <span class="list-pane-title">Groups</span>
    </div>
    <div class="list-pane-body">${listRows}</div>
  </div>
  <div class="detail-pane ${selectedGroupId ? 'open' : ''}" id="groups-detail-pane"></div>`;

  main.querySelectorAll('.list-row[data-gid]').forEach(row => {
    row.addEventListener('click', () => {
      selectedGroupId = row.dataset.gid;
      renderGroupsView(main);
    });
  });

  const detailPane = document.getElementById('groups-detail-pane');
  if (detailPane) renderNormalGroupFeed(detailPane, selectedGroupId);
}

function renderNormalGroupFeed(pane, gid) {
  const group = (STATE.groups || []).find(g => g.id === gid);
  if (!group) {
    pane.innerHTML = `<div class="detail-empty">${ICONS.users}<span>Select a group to view posts</span></div>`;
    return;
  }

  const jobs = (STATE.jobs || []).filter(j => j.groupId === gid && !j.removed);
  const user = me();

  const bubbleRows = jobs.map(j => {
    const poster = getUser(j.posterId);
    const posterHandle = poster?.handle || 'user-unknown';
    const isMine = (j.posterId === user.id);
    const spotsFilled = j.spotsFilled || 0;
    const spotsTotal = j.spotsTotal || 1;
    const appsCount = (STATE.applications || []).filter(a => a.jobId === j.id).length;

    let contentHtml = '';
    if (j.postType === 'template') {
      contentHtml = `<div class="bubble-template-text">${escHtml(j.template.slice(0, 160))}${j.template.length > 160 ? '…' : ''}</div>`;
    } else {
      const skillsHtml = (j.skills || []).map(s => `<span class="chip skill">${escHtml(s)}</span>`).join('');
      contentHtml = `
      <div class="bubble-skills">${skillsHtml}</div>
      <div class="bubble-meta-line">${escHtml(j.location || 'Remote')} · ${spotsFilled} of ${spotsTotal} spots filled</div>`;
    }

    return `
    <div class="bubble-wrap ${isMine ? 'mine' : 'theirs'}">
      <div class="bubble-card">
        <div class="bubble-header">
          <span class="bubble-handle">${escHtml(posterHandle)}</span>
          <span class="bubble-time">${timeAgo(j.createdAt)}</span>
        </div>
        <div class="bubble-title">${escHtml(j.title)}</div>
        ${contentHtml}
        <div class="bubble-footer">
          ${isMine ? `
            <span class="text-xs text-muted">${spotsFilled} of ${spotsTotal} spots filled</span>
          ` : `
            <a href="#" class="bubble-footer-link apply-link" data-jid="${j.id}">${ICONS.paperclip} Attach resume to apply</a>
          `}
          <span class="bubble-footer-meta">${appsCount} applied · ${timeAgoShort(j.createdAt)}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  pane.innerHTML = `
  <div class="back-btn" id="group-feed-back">${ICONS.back} Back to groups</div>
  <div class="group-detail-header" style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface)">
    <div style="display:flex;align-items:center;gap:10px">
      <div class="avatar ${group.type === 'technical' ? 'avatar-primary' : 'avatar-jade'}" style="width:34px;height:34px">
        ${group.type === 'technical' ? ICONS.code : ICONS.presentation}
      </div>
      <div>
        <div style="font-size:16px;font-weight:700">${escHtml(group.name)}</div>
        <div class="text-xs text-muted">${jobs.length} postings</div>
      </div>
    </div>
    <div class="text-xs text-muted">1 coin per post</div>
  </div>

  <div class="group-feed" id="group-feed-container">
    ${jobs.length === 0 ? '<div class="text-sm text-muted" style="text-align:center;padding:40px 0">No posts in this group yet. Post the first trainer role below!</div>' : bubbleRows}
  </div>

  <div class="composer">
    <div class="composer-row">
      <div class="composer-title-wrap">
        <input class="input" type="text" id="composer-title" placeholder="Job title (e.g. React Native Trainer)">
        <span class="composer-required">required</span>
      </div>
    </div>
    <div class="composer-row">
      <textarea class="input" id="composer-template" rows="2" placeholder="Paste your job template or requirements…"></textarea>
      <button class="btn-round" id="composer-send-btn" aria-label="Send job posting">${ICONS.send}</button>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-top:2px">
      <a href="#" id="composer-form-link" style="color:var(--primary);font-weight:600">Use the form instead</a>
      <span class="text-muted text-xs">Cost: 1 coin</span>
    </div>
  </div>`;

  const feedEl = document.getElementById('group-feed-container');
  if (feedEl) feedEl.scrollTop = feedEl.scrollHeight;

  document.getElementById('group-feed-back')?.addEventListener('click', () => {
    pane.classList.remove('open');
  });

  pane.querySelectorAll('.apply-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      applyToJob(link.dataset.jid);
    });
  });

  document.getElementById('composer-form-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    openJobFormModal(gid);
  });

  document.getElementById('composer-send-btn')?.addEventListener('click', () => {
    const title = document.getElementById('composer-title')?.value.trim();
    const template = document.getElementById('composer-template')?.value.trim();
    if (!title) { toast('Job title is required', 'error'); return; }

    createJobPost({
      groupId: gid,
      title,
      postType: 'template',
      template: template || 'Trainer requirements: ' + title,
      location: 'Remote',
      skills: [],
      spotsTotal: 1,
      pay: '',
      endDate: ''
    });
  });
}

// ── Job Post Creation & 1 Coin Spend Rule ──────────────────────────────────────
function createJobPost(jobData) {
  const user = me();
  if (!user) return;

  if (!user.verified) {
    pendingAction = () => createJobPost(jobData);
    currentView = 'kyc';
    render();
    return;
  }

  if (user.coins < COIN_POST_COST) {
    showOutOfCoinsModal();
    return;
  }

  user.coins -= COIN_POST_COST;
  if (!STATE.ledger) STATE.ledger = [];
  STATE.ledger.push({
    id: uid(),
    userId: user.id,
    type: 'spend',
    amount: -COIN_POST_COST,
    note: `Post: ${jobData.title}`,
    at: Date.now()
  });

  const newJob = {
    id: uid(),
    posterId: user.id,
    groupId: jobData.groupId,
    title: jobData.title,
    location: jobData.location || 'Remote',
    skills: jobData.skills || [],
    spotsTotal: jobData.spotsTotal || 1,
    spotsFilled: 0,
    postType: jobData.postType || 'form',
    template: jobData.template || '',
    pay: jobData.pay || '',
    endDate: jobData.endDate || '',
    createdAt: Date.now(),
    lastActivity: Date.now(),
    closed: false,
    removed: false
  };

  STATE.jobs.push(newJob);
  saveState();

  updateCoinDisplay(true); // Animate "-1"
  toast(`1 coin used. You have ${user.coins} coins left.`, 'accent');

  render();
}

function openJobFormModal(defaultGroupId = 'g1') {
  const groups = STATE.groups || [];
  const groupOptions = groups.map(g => `<option value="${g.id}" ${g.id === defaultGroupId ? 'selected' : ''}>${escHtml(g.name)} (${g.type})</option>`).join('');

  showModal({
    title: 'Post a trainer role (Form)',
    body: `
      <div style="display:flex;flex-direction:column;gap:10px">
        <div>
          <label class="auth-label">Group</label>
          <select class="input" id="fm-group">${groupOptions}</select>
        </div>
        <div>
          <label class="auth-label">Job title *</label>
          <input class="input" id="fm-title" placeholder="e.g. Flutter Specialist Trainer">
        </div>
        <div>
          <label class="auth-label">Location</label>
          <input class="input" id="fm-location" placeholder="e.g. Remote or Mumbai">
        </div>
        <div>
          <label class="auth-label">Skills (comma-separated)</label>
          <input class="input" id="fm-skills" placeholder="e.g. Flutter, Dart, Firebase">
        </div>
        <div>
          <label class="auth-label">Total spots</label>
          <input class="input" type="number" id="fm-spots" value="1" min="1" max="50">
        </div>
        <div>
          <label class="auth-label">Pay / Rate (optional)</label>
          <input class="input" id="fm-pay" placeholder="e.g. ₹1,000/hour">
        </div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:10px">Posting costs 1 coin.</div>`,
    actions: [
      {
        id: 'post',
        label: 'Post role (1 coin)',
        cls: 'btn-primary',
        fn: () => {
          const title = document.getElementById('fm-title')?.value.trim();
          if (!title) { toast('Job title is required', 'error'); return; }
          const gid = document.getElementById('fm-group')?.value;
          const location = document.getElementById('fm-location')?.value.trim() || 'Remote';
          const skillsRaw = document.getElementById('fm-skills')?.value || '';
          const skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);
          const spotsTotal = parseInt(document.getElementById('fm-spots')?.value, 10) || 1;
          const pay = document.getElementById('fm-pay')?.value.trim();

          createJobPost({
            groupId: gid,
            title,
            location,
            skills,
            spotsTotal,
            pay,
            postType: 'form'
          });
        }
      },
      { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
    ]
  });
}

// ── Applying to a Job (File Picker with round '+' at top right) ────────────────
function applyToJob(jid) {
  const user = me();
  if (!user) return;
  const job = (STATE.jobs || []).find(j => j.id === jid);
  if (!job) return;

  if (job.posterId === user.id) {
    toast("You cannot apply to your own posting.", 'error');
    return;
  }

  const existing = (STATE.applications || []).find(a => a.jobId === jid && a.applicantId === user.id);
  if (existing) {
    toast(`You have already applied (${existing.status}).`, 'primary');
    return;
  }

  const renderApplyModal = () => {
    const driveFiles = (STATE.driveFiles || []).filter(f => f.ownerId === user.id && !f.hidden);
    const fileOptions = driveFiles.length === 0
      ? '<option value="">No files in Drive (apply without file)</option>'
      : '<option value="">Select a Drive file…</option>' + driveFiles.map(f => `<option value="${f.id}">${escHtml(f.name)} (${fmtFileSize(f.size)})</option>`).join('');

    showModal({
      title: 'Apply to ' + escHtml(job.title),
      body: `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:13px;font-weight:600">Select a resume from Drive:</span>
          <!-- Only round '+' button to add from device -->
          <button class="btn-round" id="apply-modal-add-btn" style="width:32px;height:32px" aria-label="Add file from device" title="Add file from device">
            ${ICONS.plus}
          </button>
        </div>
        <div>
          <select class="input" id="apply-file-select">${fileOptions}</select>
        </div>
        <div id="apply-file-error" class="auth-error hidden" style="margin-top:10px"></div>
        <input type="file" id="apply-device-file-input" class="sr-only" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
        <div style="font-size:11px;color:var(--muted);margin-top:8px">Applying is free of cost.</div>`,
      actions: [
        {
          id: 'submit',
          label: 'Submit application',
          cls: 'btn-primary',
          fn: () => {
            const fileId = document.getElementById('apply-file-select')?.value || null;
            const newApp = {
              id: uid(),
              jobId: jid,
              applicantId: user.id,
              fileId,
              status: 'Under review',
              appliedAt: Date.now(),
              lastActivity: Date.now(),
              seenByPoster: false
            };
            STATE.applications.push(newApp);

            // Reset job inactivity countdown
            job.lastActivity = Date.now();

            // Notify poster
            if (!STATE.notifications) STATE.notifications = [];
            STATE.notifications.push({
              id: uid(),
              userId: job.posterId,
              text: `${user.handle} applied to your posting "${job.title}".`,
              read: false,
              createdAt: Date.now()
            });

            saveState();
            toast('Application submitted successfully!', 'success');
            render();
          }
        },
        { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
      ]
    });

    const fileInput = document.getElementById('apply-device-file-input');
    document.getElementById('apply-modal-add-btn')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      const err = document.getElementById('apply-file-error');
      if (!file) return;
      if (file.size > UPLOAD_MAX_BYTES) {
        if (err) {
          err.textContent = 'File exceeds 10 MB limit. Please select a smaller file.';
          err.classList.remove('hidden');
        }
        return;
      }
      if (err) err.classList.add('hidden');
      const newDriveFile = {
        id: uid(),
        ownerId: user.id,
        name: file.name,
        size: file.size,
        createdAt: Date.now(),
        hidden: false
      };
      STATE.driveFiles.push(newDriveFile);
      saveState();
      toast(`"${file.name}" added to Drive`, 'success');

      // Refresh modal with new file selected
      document.querySelector('.modal-overlay')?.remove();
      renderApplyModal();
      const sel = document.getElementById('apply-file-select');
      if (sel) sel.value = newDriveFile.id;
    });
  };

  renderApplyModal();
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOBS SCREEN (USER & ADMIN VIEW)
// ═══════════════════════════════════════════════════════════════════════════════
let jobFilter = 'all'; // all | technical | non-technical
let jobSearch = '';

function renderJobsView(main) {
  const jobs = (STATE.jobs || []).filter(j => !j.removed && !j.closed);

  const filtered = jobs.filter(j => {
    const group = (STATE.groups || []).find(g => g.id === j.groupId);
    if (jobFilter === 'technical' && group?.type !== 'technical') return false;
    if (jobFilter === 'non-technical' && group?.type !== 'non-technical') return false;
    if (jobSearch) {
      const q = jobSearch.toLowerCase();
      const matchTitle = j.title.toLowerCase().includes(q);
      const matchSkill = (j.skills || []).some(s => s.toLowerCase().includes(q));
      const matchLoc   = (j.location || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSkill && !matchLoc) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);

  if (!selectedJobId && filtered.length > 0) {
    selectedJobId = filtered[0].id;
  }

  const listRows = filtered.map(j => {
    const isSelected = (j.id === selectedJobId);
    return `
    <div class="list-row ${isSelected ? 'selected' : ''}" data-jid="${j.id}">
      <div class="list-row-content">
        <div class="list-row-title">${escHtml(j.title)}</div>
        <div class="list-row-meta">${escHtml(j.location || 'Remote')} · ${timeAgo(j.createdAt)}</div>
      </div>
      <div class="list-row-right">
        <span class="badge ${j.spotsFilled >= j.spotsTotal ? 'badge-neutral' : 'badge-green'}">${j.spotsFilled}/${j.spotsTotal} spots</span>
      </div>
    </div>`;
  }).join('');

  main.innerHTML = `
  <div class="list-pane">
    <div class="list-pane-header" style="flex-direction:column;align-items:stretch;gap:10px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="list-pane-title">Jobs</span>
        <button class="btn btn-primary" id="jobs-post-btn" style="font-size:12px;padding:5px 12px">${ICONS.plus} Post</button>
      </div>
      <div class="search-wrap">
        ${ICONS.search}
        <input class="input" type="text" id="job-search-input" placeholder="Search trainers, skills, locations…" value="${escHtml(jobSearch)}">
      </div>
      <div style="display:flex;gap:6px">
        <button class="chip ${jobFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
        <button class="chip ${jobFilter === 'technical' ? 'active' : ''}" data-filter="technical">Technical</button>
        <button class="chip ${jobFilter === 'non-technical' ? 'active' : ''}" data-filter="non-technical">Non-technical</button>
      </div>
    </div>
    <div class="list-pane-body">
      ${filtered.length === 0 ? '<div class="text-sm text-muted" style="padding:24px;text-align:center">No jobs found matching criteria.</div>' : listRows}
    </div>
  </div>
  <div class="detail-pane ${selectedJobId ? 'open' : ''}" id="jobs-detail-pane"></div>`;

  document.getElementById('job-search-input')?.addEventListener('input', (e) => {
    jobSearch = e.target.value;
    renderJobsView(main);
  });

  main.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      jobFilter = chip.dataset.filter;
      renderJobsView(main);
    });
  });

  document.getElementById('jobs-post-btn')?.addEventListener('click', () => {
    openJobFormModal();
  });

  main.querySelectorAll('.list-row[data-jid]').forEach(row => {
    row.addEventListener('click', () => {
      selectedJobId = row.dataset.jid;
      renderJobsView(main);
    });
  });

  const detailPane = document.getElementById('jobs-detail-pane');
  if (detailPane) renderJobDetail(detailPane, selectedJobId);
}

function renderJobDetail(pane, jid) {
  const job = (STATE.jobs || []).find(j => j.id === jid);
  if (!job) {
    pane.innerHTML = `<div class="detail-empty">${ICONS.briefcase}<span>Select a job posting to view details</span></div>`;
    return;
  }

  const group = (STATE.groups || []).find(g => g.id === job.groupId);
  const poster = getUser(job.posterId);
  const user = me();
  const isMine = (job.posterId === user.id);
  const remainingDays = Math.ceil(daysRemaining(job.lastActivity || job.createdAt));
  const isLowActivity = remainingDays <= WARN_DAYS;

  const existingApp = (STATE.applications || []).find(a => a.jobId === jid && a.applicantId === user.id);

  pane.innerHTML = `
  <div class="back-btn" id="job-detail-back">${ICONS.back} Back to jobs list</div>
  <div class="detail-header">
    <div class="detail-title">${escHtml(job.title)}</div>
    <div class="detail-meta">
      ${escHtml(group?.name || 'Group')} · Posted ${timeAgo(job.createdAt)} · ${job.spotsFilled} of ${job.spotsTotal} spots filled
    </div>
    <div class="countdown ${isLowActivity ? 'warn' : ''}" style="margin-top:6px">
      Removed in ${remainingDays} days if there is no activity
    </div>
  </div>

  <div class="detail-body">
    ${job.skills && job.skills.length > 0 ? `
    <div class="section-title">Required skills</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px">
      ${job.skills.map(s => `<span class="chip skill">${escHtml(s)}</span>`).join('')}
    </div>` : ''}

    ${job.pay ? `
    <div class="section-title">Rate / Compensation</div>
    <div style="font-weight:600;margin-bottom:20px;color:var(--text)">${escHtml(job.pay)}</div>` : ''}

    ${job.template ? `
    <div class="section-title">Job template / Description</div>
    <div style="white-space:pre-wrap;background:var(--surface2);padding:14px;border-radius:12px;margin-bottom:20px;font-size:13px;line-height:1.6">
      ${escHtml(job.template)}
    </div>` : ''}

    <div class="section-title">Posted by</div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
      <div class="avatar avatar-primary">${(poster?.handle || 'U').slice(0, 2).toUpperCase()}</div>
      <div>
        <div style="font-weight:700">${escHtml(poster?.handle || 'user-unknown')}</div>
        <div class="text-xs text-muted">Member since ${poster?.createdAt ? new Date(poster.createdAt).toLocaleDateString() : 'recently'}</div>
      </div>
    </div>

    <!-- Actions -->
    <div style="margin-top:30px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      ${isMine ? `
        <span class="badge badge-accent">Your posting</span>
        <button class="btn btn-ghost" id="simulate-inactivity-btn" style="font-size:12px">Simulate 26 quiet days</button>
      ` : existingApp ? `
        <span class="badge badge-green">Applied (${existingApp.status})</span>
      ` : `
        <button class="btn btn-primary" id="job-apply-now-btn" style="padding:10px 24px">Apply now</button>
      `}
    </div>
  </div>`;

  document.getElementById('job-detail-back')?.addEventListener('click', () => {
    pane.classList.remove('open');
  });

  document.getElementById('job-apply-now-btn')?.addEventListener('click', () => {
    applyToJob(jid);
  });

  document.getElementById('simulate-inactivity-btn')?.addEventListener('click', () => {
    job.lastActivity = Date.now() - 26 * 86400000;
    saveState();
    toast('Simulated 26 quiet days. Notice warning style countdown!', 'accent');
    renderJobDetail(pane, jid);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MY POSTINGS SCREEN (USER & ADMIN ONLY)
// ═══════════════════════════════════════════════════════════════════════════════
function renderMyPostingsView(main) {
  const user = me();
  const postings = (STATE.jobs || [])
    .filter(j => j.posterId === user.id && !j.removed)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!selectedPostingId && postings.length > 0) {
    selectedPostingId = postings[0].id;
  }

  const listRows = postings.map(j => {
    const isSelected = (j.id === selectedPostingId);
    const group = (STATE.groups || []).find(g => g.id === j.groupId);
    const isTech = group?.type === 'technical';
    const apps = (STATE.applications || []).filter(a => a.jobId === j.id);
    const unreadCount = apps.filter(a => !a.seenByPoster).length;
    const isFilled = j.spotsFilled >= j.spotsTotal;

    return `
    <div class="list-row ${isSelected ? 'selected' : ''}" data-pid="${j.id}">
      <span class="status-dot ${isTech ? 'dot-primary' : 'dot-jade'}"></span>
      <div class="list-row-content">
        <div class="list-row-title">${escHtml(j.title)}</div>
        <div class="list-row-meta">${j.spotsFilled} of ${j.spotsTotal} spots filled</div>
      </div>
      <div class="list-row-right">
        ${unreadCount > 0
          ? `<span class="badge badge-accent">${unreadCount} new</span>`
          : isFilled
            ? `<span class="badge badge-neutral">Filled</span>`
            : `<span class="badge badge-green">Open</span>`}
      </div>
    </div>`;
  }).join('');

  main.innerHTML = `
  <div class="list-pane" style="position:relative">
    <div class="list-pane-header">
      <span class="list-pane-title">My postings</span>
    </div>
    <div class="list-pane-body">
      ${postings.length === 0 ? '<div class="text-sm text-muted" style="padding:24px;text-align:center">You haven\'t posted any jobs yet. Tap the + button to create one!</div>' : listRows}
    </div>
    <button class="fab-post" id="my-postings-fab" aria-label="Create new posting" title="Create new posting">
      ${ICONS.plus}
    </button>
  </div>
  <div class="detail-pane ${selectedPostingId ? 'open' : ''}" id="postings-detail-pane"></div>`;

  document.getElementById('my-postings-fab')?.addEventListener('click', () => {
    openJobFormModal();
  });

  main.querySelectorAll('.list-row[data-pid]').forEach(row => {
    row.addEventListener('click', () => {
      selectedPostingId = row.dataset.pid;
      renderMyPostingsView(main);
    });
  });

  const detailPane = document.getElementById('postings-detail-pane');
  if (detailPane) renderPostingDetail(detailPane, selectedPostingId);
}

function renderPostingDetail(pane, pid) {
  const job = (STATE.jobs || []).find(j => j.id === pid);
  if (!job) {
    pane.innerHTML = `<div class="detail-empty">${ICONS.message}<span>Select a posting to view applicants</span></div>`;
    return;
  }

  const apps = (STATE.applications || []).filter(a => a.jobId === pid);
  const remainingDays = Math.ceil(daysRemaining(job.lastActivity || job.createdAt));
  const isLowActivity = remainingDays <= WARN_DAYS;
  const isFull = job.spotsFilled >= job.spotsTotal;

  // Mark unseen as seen
  apps.forEach(a => { a.seenByPoster = true; });
  saveState();

  const applicantRows = apps.map(a => {
    const applicant = getUser(a.applicantId);
    const handle = applicant?.handle || 'user-unknown';
    const file = a.fileId ? (STATE.driveFiles || []).find(f => f.id === a.fileId) : null;
    const isAccepted = a.status === 'Accepted';
    const isRejected = a.status === REJECTED_LABEL;

    return `
    <div class="applicant-row ${isRejected ? 'dimmed' : ''}">
      <div class="avatar avatar-primary">${handle.slice(0, 2).toUpperCase()}</div>
      <div class="applicant-info">
        <div class="applicant-handle">${escHtml(handle)}</div>
        ${file ? `
          <div class="applicant-file">
            <span style="display:inline-flex;align-items:center;width:14px;height:14px;flex-shrink:0">
              <svg width="14" height="14" style="width:14px;height:14px;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </span>
            <span>${escHtml(file.name)}</span>
          </div>
        ` : `<div class="text-xs text-muted">No resume attached</div>`}
      </div>
      <div class="applicant-actions">
        ${isAccepted ? `
          <span class="badge badge-green">Accepted</span>
        ` : isRejected ? `
          <span class="badge badge-bad">${REJECTED_LABEL}</span>
        ` : `
          <button class="btn btn-ghost accept-app-btn" data-aid="${a.id}" ${isFull ? 'disabled' : ''} style="font-size:11px;padding:4px 10px">Accept</button>
          <button class="btn btn-danger reject-app-btn" data-aid="${a.id}" style="font-size:11px;padding:4px 10px">${REJECTED_LABEL}</button>
        `}
        <button class="btn btn-ghost open-chat-btn" data-aid="${a.id}" data-jid="${job.id}" style="font-size:11px;padding:4px 10px">Chat</button>
      </div>
    </div>`;
  }).join('');

  pane.innerHTML = `
  <div class="back-btn" id="posting-detail-back">${ICONS.back} Back to postings list</div>
  <div class="detail-header">
    <div class="detail-title">${escHtml(job.title)}</div>
    <div class="detail-meta">${job.spotsFilled} of ${job.spotsTotal} spots filled</div>
    <div class="countdown ${isLowActivity ? 'warn' : ''}" style="margin-top:4px">
      ${remainingDays} days remaining before auto-removal
    </div>
  </div>

  <div class="detail-body">
    <div class="section-title">Applicants (${apps.length})</div>
    <div style="margin-bottom:24px">
      ${apps.length === 0 ? '<div class="text-sm text-muted">No applicants have applied yet.</div>' : applicantRows}
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${!job.closed ? `<button class="btn btn-ghost" id="close-job-btn" style="font-size:12px">Close job</button>` : ''}
      <button class="btn btn-danger" id="delete-job-btn" style="font-size:12px">Remove job</button>
    </div>
  </div>`;

  document.getElementById('posting-detail-back')?.addEventListener('click', () => {
    pane.classList.remove('open');
  });

  pane.querySelectorAll('.accept-app-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const aid = btn.dataset.aid;
      const app = (STATE.applications || []).find(a => a.id === aid);
      if (!app) return;
      if (job.spotsFilled >= job.spotsTotal) {
        toast('All spots are already filled!', 'error');
        return;
      }
      app.status = 'Accepted';
      app.lastActivity = Date.now();
      job.spotsFilled += 1;
      job.lastActivity = Date.now();

      if (!STATE.notifications) STATE.notifications = [];
      STATE.notifications.push({
        id: uid(),
        userId: app.applicantId,
        text: `Congratulations! Your application to "${job.title}" was accepted.`,
        read: false,
        createdAt: Date.now()
      });

      saveState();
      toast('Applicant accepted!', 'success');
      renderPostingDetail(pane, pid);
    });
  });

  pane.querySelectorAll('.reject-app-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const aid = btn.dataset.aid;
      const app = (STATE.applications || []).find(a => a.id === aid);
      if (!app) return;
      app.status = REJECTED_LABEL;
      app.lastActivity = Date.now();
      job.lastActivity = Date.now();

      if (!STATE.notifications) STATE.notifications = [];
      STATE.notifications.push({
        id: uid(),
        userId: app.applicantId,
        text: `Your application to "${job.title}" was ${REJECTED_LABEL.toLowerCase()}.`,
        read: false,
        createdAt: Date.now()
      });

      saveState();
      toast(`Applicant marked as ${REJECTED_LABEL}`, 'primary');
      renderPostingDetail(pane, pid);
    });
  });

  pane.querySelectorAll('.open-chat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      chatContext = {
        jobId: btn.dataset.jid,
        applicationId: btn.dataset.aid
      };
      currentView = 'chat';
      render();
    });
  });

  document.getElementById('close-job-btn')?.addEventListener('click', () => {
    job.closed = true;
    job.lastActivity = Date.now();
    saveState();
    toast('Job closed to new applicants', 'primary');
    renderPostingDetail(pane, pid);
  });

  document.getElementById('delete-job-btn')?.addEventListener('click', () => {
    showModal({
      title: 'Remove job',
      body: 'Are you sure you want to remove this posting? All applicants will be notified.',
      actions: [
        {
          id: 'remove',
          label: 'Remove',
          cls: 'btn-danger',
          fn: () => {
            job.removed = true;
            saveState();
            toast('Job removed', 'primary');
            selectedPostingId = null;
            renderMyPostingsView(document.getElementById('main-content'));
          }
        },
        { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
      ]
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MY APPLICATIONS SCREEN (USER & ADMIN ONLY)
// ═══════════════════════════════════════════════════════════════════════════════
function renderMyApplicationsView(main) {
  const user = me();
  const myApps = (STATE.applications || [])
    .filter(a => a.applicantId === user.id)
    .sort((a, b) => b.appliedAt - a.appliedAt);

  if (!selectedAppId && myApps.length > 0) {
    selectedAppId = myApps[0].id;
  }

  const listRows = myApps.map(a => {
    const isSelected = (a.id === selectedAppId);
    const job = (STATE.jobs || []).find(j => j.id === a.jobId);
    const isAccepted = (a.status === 'Accepted');
    const isRejected = (a.status === REJECTED_LABEL);

    return `
    <div class="list-row ${isSelected ? 'selected' : ''} ${isRejected ? 'dimmed' : ''}" data-aid="${a.id}">
      <div class="list-row-content">
        <div class="list-row-title">${escHtml(job?.title || 'Job posting')}</div>
        <div class="list-row-meta">Applied ${timeAgo(a.appliedAt)}</div>
      </div>
      <div class="list-row-right">
        <span class="badge ${isAccepted ? 'badge-green' : isRejected ? 'badge-bad' : 'badge-warn'}">${a.status}</span>
      </div>
    </div>`;
  }).join('');

  main.innerHTML = `
  <div class="list-pane">
    <div class="list-pane-header">
      <span class="list-pane-title">My applications</span>
    </div>
    <div class="list-pane-body">
      ${myApps.length === 0 ? '<div class="text-sm text-muted" style="padding:24px;text-align:center">You haven\'t applied to any trainer jobs yet.</div>' : listRows}
    </div>
  </div>
  <div class="detail-pane ${selectedAppId ? 'open' : ''}" id="app-detail-pane"></div>`;

  main.querySelectorAll('.list-row[data-aid]').forEach(row => {
    row.addEventListener('click', () => {
      selectedAppId = row.dataset.aid;
      renderMyApplicationsView(main);
    });
  });

  const detailPane = document.getElementById('app-detail-pane');
  if (detailPane) renderApplicationDetail(detailPane, selectedAppId);
}

function renderApplicationDetail(pane, aid) {
  const app = (STATE.applications || []).find(a => a.id === aid);
  if (!app) {
    pane.innerHTML = `<div class="detail-empty">${ICONS.send}<span>Select an application to view status</span></div>`;
    return;
  }

  const job = (STATE.jobs || []).find(j => j.id === app.jobId);
  const file = app.fileId ? (STATE.driveFiles || []).find(f => f.id === app.fileId) : null;
  const isUnderReview = (app.status === 'Under review');
  const isAccepted = (app.status === 'Accepted');
  const isRejected = (app.status === REJECTED_LABEL);

  pane.innerHTML = `
  <div class="back-btn" id="app-detail-back">${ICONS.back} Back to applications</div>
  <div class="detail-header">
    <div class="detail-title">${escHtml(job?.title || 'Job posting')}</div>
    <div class="detail-meta">Applied ${timeAgo(app.appliedAt)}</div>
  </div>

  <div class="detail-body">
    <div class="section-title">Application status</div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
      <span class="badge ${isAccepted ? 'badge-green' : isRejected ? 'badge-bad' : 'badge-warn'}" style="font-size:13px;padding:4px 12px">
        ${app.status}
      </span>
      ${isUnderReview ? `
        <button class="btn btn-ghost" id="withdraw-app-btn" style="font-size:12px;padding:4px 12px;color:var(--bad);border-color:var(--bad)">Withdraw application</button>
      ` : ''}
    </div>

    <div class="section-title">Attached resume</div>
    <div style="margin-bottom:24px">
      ${file ? `
        <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--surface2);border-radius:12px;max-width:360px">
          <div class="pdf-icon">PDF</div>
          <div>
            <div style="font-weight:600;font-size:13px">${escHtml(file.name)}</div>
            <div class="text-xs text-muted">${fmtFileSize(file.size)}</div>
          </div>
        </div>
      ` : '<div class="text-sm text-muted">No resume was attached with this application.</div>'}
    </div>

    <div class="section-title">Communication</div>
    <div>
      <button class="btn btn-primary btn-sm" id="open-app-chat-btn">
        ${ICONS.message} Message
      </button>
      ${isRejected ? '<div class="text-xs text-muted" style="margin-top:6px">Note: This application was rejected; chat is read-only.</div>' : ''}
    </div>
  </div>`;

  document.getElementById('app-detail-back')?.addEventListener('click', () => {
    pane.classList.remove('open');
  });

  document.getElementById('withdraw-app-btn')?.addEventListener('click', () => {
    showModal({
      title: 'Withdraw application',
      body: 'Are you sure you want to withdraw this application? This cannot be undone.',
      actions: [
        {
          id: 'withdraw',
          label: 'Withdraw',
          cls: 'btn-danger',
          fn: () => {
            STATE.applications = (STATE.applications || []).filter(a => a.id !== aid);
            saveState();
            toast('Application withdrawn', 'primary');
            selectedAppId = null;
            renderMyApplicationsView(document.getElementById('main-content'));
          }
        },
        { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
      ]
    });
  });

  document.getElementById('open-app-chat-btn')?.addEventListener('click', () => {
    chatContext = {
      jobId: app.jobId,
      applicationId: app.id
    };
    currentView = 'chat';
    render();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT SCREEN (1-ON-1 POSTER <-> APPLICANT)
// ═══════════════════════════════════════════════════════════════════════════════
function renderChatView(main) {
  if (!chatContext) {
    main.innerHTML = `<div class="detail-empty">${ICONS.message}<span>No active chat context.</span></div>`;
    return;
  }

  const { jobId, applicationId } = chatContext;
  const job = (STATE.jobs || []).find(j => j.id === jobId);
  const app = (STATE.applications || []).find(a => a.id === applicationId);
  const user = me();

  if (!job || !app) {
    main.innerHTML = `<div class="detail-empty">${ICONS.message}<span>Chat not found.</span></div>`;
    return;
  }

  const isPoster = (job.posterId === user.id);
  const otherUserId = isPoster ? app.applicantId : job.posterId;
  const otherUser = getUser(otherUserId);
  const otherHandle = otherUser?.handle || 'user';

  const isReadOnly = (app.status === REJECTED_LABEL);

  const msgs = (STATE.messages || [])
    .filter(m => m.jobId === jobId && m.applicationId === applicationId)
    .sort((a, b) => a.sentAt - b.sentAt);

  const msgsHtml = msgs.map(m => {
    const isMine = (m.senderId === user.id);
    const timeStr = new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
    <div class="chat-msg ${isMine ? 'mine' : 'theirs'}">
      <div>${escHtml(m.text)}</div>
      <div class="chat-msg-time">${timeStr}</div>
    </div>`;
  }).join('');

  main.innerHTML = `
  <div class="chat-pane" style="flex:1;height:100%">
    <div class="chat-header">
      <button class="btn-icon" id="chat-back-btn" aria-label="Back">${ICONS.back}</button>
      <div class="avatar avatar-primary" style="width:34px;height:34px">
        ${otherHandle.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div style="font-weight:700">${escHtml(otherHandle)}</div>
        <div class="text-xs text-muted">Re: ${escHtml(job.title)}</div>
      </div>
    </div>

    <div class="chat-messages" id="chat-messages-container">
      ${msgs.length === 0 ? '<div class="text-sm text-muted" style="text-align:center;padding:40px 0">No messages yet. Send a message to start!</div>' : msgsHtml}
    </div>

    ${isReadOnly ? `
      <div class="chat-readonly-notice">
        This application was ${REJECTED_LABEL.toLowerCase()}. Chat is in read-only mode.
      </div>
    ` : `
      <div class="chat-composer">
        <div class="chat-composer-row">
          <textarea class="input" id="chat-input" rows="2" maxlength="${POST_MAX_CHARS}" placeholder="Type a message…"></textarea>
          <button class="btn-round" id="chat-send-btn" aria-label="Send message">${ICONS.send}</button>
        </div>
        <div class="chat-counter" id="chat-char-counter">0 / ${POST_MAX_CHARS}</div>
      </div>
    `}
  </div>`;

  const msgContainer = document.getElementById('chat-messages-container');
  if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;

  document.getElementById('chat-back-btn')?.addEventListener('click', () => {
    currentView = isPoster ? 'postings' : 'applications';
    render();
  });

  const chatInp = document.getElementById('chat-input');
  const counter = document.getElementById('chat-char-counter');
  chatInp?.addEventListener('input', () => {
    const len = chatInp.value.length;
    if (counter) {
      counter.textContent = `${len} / ${POST_MAX_CHARS}`;
      counter.className = 'chat-counter' + (len >= POST_MAX_CHARS - 100 ? ' near' : '');
    }
  });

  const doSendMsg = () => {
    const txt = chatInp?.value.trim();
    if (!txt) return;
    if (txt.length > POST_MAX_CHARS) {
      toast(`Message exceeds maximum limit of ${POST_MAX_CHARS} characters`, 'error');
      return;
    }

    if (!STATE.messages) STATE.messages = [];
    STATE.messages.push({
      id: uid(),
      jobId,
      applicationId,
      senderId: user.id,
      text: txt,
      sentAt: Date.now()
    });

    job.lastActivity = Date.now();
    app.lastActivity = Date.now();

    saveState();
    renderChatView(main);
  };

  document.getElementById('chat-send-btn')?.addEventListener('click', doSendMsg);
  chatInp?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSendMsg();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DRIVE SCREEN (SECTION 4: ONLY ROUND '+' BUTTON DIRECT TO FILE CHOOSER)
// Remove "Upload file" button everywhere. No dropdown menu. No "app storage".
// ═══════════════════════════════════════════════════════════════════════════════
function renderDriveView(main) {
  const user = me();
  const files = (STATE.driveFiles || []).filter(f => f.ownerId === user.id && !f.hidden);

  main.innerHTML = `
  <div class="list-pane" style="flex:1;min-width:0;width:auto;max-width:none;border-right:none">
    <div class="list-pane-header" style="padding:16px 20px">
      <span class="list-pane-title">Drive</span>
      <!-- ONLY the round '+' button at the top right -->
      <button class="btn-round" id="drive-add-device-btn" aria-label="Add file from device" title="Add file from device">
        ${ICONS.plus}
      </button>
    </div>
    <div id="drive-upload-error" class="hidden" style="margin:8px 16px">
      <div class="auth-error" id="drive-upload-error-text"></div>
    </div>
    <div class="list-pane-body" style="padding:8px 0">
      ${files.length === 0
        ? `<div class="detail-empty" style="height:220px">
            ${ICONS.folder}
            <span>Tap + to add a file from this device.</span>
          </div>`
        : files.map(f => {
            const usedCount = (STATE.applications || []).filter(a => a.fileId === f.id).length;
            const meta = usedCount > 0 ? `Used in ${usedCount} application${usedCount === 1 ? '' : 's'}` : 'Not used yet';
            return `
            <div class="drive-row">
              <div class="pdf-icon">PDF</div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(f.name)}</div>
                <div class="text-xs text-muted">${fmtFileSize(f.size)} · ${meta}</div>
              </div>
              <button class="btn btn-ghost delete-file-btn" data-fid="${f.id}" style="font-size:11px;padding:4px 10px;color:var(--bad)">Delete</button>
            </div>`;
          }).join('')}
    </div>
  </div>
  <!-- Hidden browser file chooser accepting PDF, JPG, PNG, DOC, DOCX -->
  <input type="file" id="drive-file-input" class="sr-only" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">`;

  const fileInput = document.getElementById('drive-file-input');

  // Tapping '+' immediately opens browser file chooser directly with no menu
  document.getElementById('drive-add-device-btn')?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > UPLOAD_MAX_BYTES) {
      showDriveError('File exceeds 10 MB limit. Please select a smaller file.');
      return;
    }
    hideDriveError();
    const newFile = {
      id: uid(),
      ownerId: user.id,
      name: file.name,
      size: file.size,
      createdAt: Date.now(),
      hidden: false
    };
    STATE.driveFiles.push(newFile);
    saveState();
    toast(`"${file.name}" added to Drive`, 'success');
    renderDriveView(main);
  });

  main.querySelectorAll('.delete-file-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteDriveFile(btn.dataset.fid, main);
    });
  });
}

function showDriveError(msg) {
  const wrap = document.getElementById('drive-upload-error');
  const text = document.getElementById('drive-upload-error-text');
  if (wrap && text) { text.textContent = msg; wrap.classList.remove('hidden'); }
}

function hideDriveError() {
  document.getElementById('drive-upload-error')?.classList.add('hidden');
}

function deleteDriveFile(fid, main) {
  const f = (STATE.driveFiles || []).find(x => x.id === fid);
  if (!f) return;
  const inUse = (STATE.applications || []).some(a => a.fileId === fid);
  if (inUse) {
    f.hidden = true;
    saveState();
    toast('Removed when no application uses it', 'primary');
    renderDriveView(main);
  } else {
    STATE.driveFiles = (STATE.driveFiles || []).filter(x => x.id !== fid);
    saveState();
    toast('File deleted from Drive', 'primary');
    renderDriveView(main);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN'S "STAFF" ITEM (INSIDE USER APP - SECTION 2)
// Sub-tabs: Overview, Groups, Jobs, Audit log, Users, Roles, Coins.
// Users, Roles, Coins are locked for Admin with "Permission denied".
// ═══════════════════════════════════════════════════════════════════════════════
function renderAdminStaffView(main) {
  const user = me();
  if (!isAdmin(user)) {
    main.innerHTML = `<div class="detail-empty">${ICONS.lock}<span>Permission denied</span></div>`;
    return;
  }

  // Ensure default subtab is permitted
  if (!['overview', 'groups', 'jobs', 'audit', 'users', 'roles', 'coins'].includes(staffSubTab)) {
    staffSubTab = 'overview';
  }

  main.innerHTML = `
  <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--bg)">
    <!-- Sub-tabs Bar -->
    <div class="staff-subtabs">
      <button class="staff-tab-btn ${staffSubTab === 'overview' ? 'active' : ''}" data-admin-sub="overview">${ICONS.overview} Overview</button>
      <button class="staff-tab-btn ${staffSubTab === 'groups' ? 'active' : ''}" data-admin-sub="groups">${ICONS.users} Groups</button>
      <button class="staff-tab-btn ${staffSubTab === 'jobs' ? 'active' : ''}" data-admin-sub="jobs">${ICONS.briefcase} Jobs</button>
      <button class="staff-tab-btn ${staffSubTab === 'audit' ? 'active' : ''}" data-admin-sub="audit">${ICONS.log} Audit log</button>
      <!-- Locked for Admin -->
      <button class="staff-tab-btn locked ${staffSubTab === 'users' ? 'active' : ''}" data-admin-sub="users">${ICONS.lock} Users</button>
      <button class="staff-tab-btn locked ${staffSubTab === 'roles' ? 'active' : ''}" data-admin-sub="roles">${ICONS.lock} Roles</button>
      <button class="staff-tab-btn locked ${staffSubTab === 'coins' ? 'active' : ''}" data-admin-sub="coins">${ICONS.lock} Coins</button>
    </div>

    <!-- Sub-tab Content Area -->
    <div id="admin-staff-sub-content" style="flex:1;overflow-y:auto;padding:24px"></div>
  </div>`;

  main.querySelectorAll('.staff-tab-btn[data-admin-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.dataset.adminSub;
      if (['users', 'roles', 'coins'].includes(sub)) {
        toast('Permission denied', 'error');
        staffSubTab = sub;
        renderAdminStaffSubContent();
        return;
      }
      staffSubTab = sub;
      renderAdminStaffView(main);
    });
  });

  renderAdminStaffSubContent();
}

function renderAdminStaffSubContent() {
  const mount = document.getElementById('admin-staff-sub-content');
  if (!mount) return;

  if (['users', 'roles', 'coins'].includes(staffSubTab)) {
    mount.innerHTML = `
    <div class="auth-error" style="max-width:480px">
      <strong>Permission denied</strong><br>
      You do not have permission to access ${staffSubTab}. Only super-admins can manage this section.
    </div>`;
    return;
  }

  if (staffSubTab === 'overview') {
    renderStaffOverviewView(mount);
  } else if (staffSubTab === 'groups') {
    renderStaffGroupsView(mount);
  } else if (staffSubTab === 'jobs') {
    renderStaffJobsView(mount);
  } else if (staffSubTab === 'audit') {
    renderStaffAuditView(mount);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED STAFF SUB-VIEWS (OVERVIEW, GROUPS, JOBS, AUDIT)
// Both Admin and Super-Admin share these exact implementations.
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Staff Overview: counts (users, jobs, groups, removed jobs) and last 5 audit lines
function renderStaffOverviewView(mount) {
  const users = STATE.users || [];
  const jobs = STATE.jobs || [];
  const groups = STATE.groups || [];
  const activeJobs = jobs.filter(j => !j.removed && !j.closed).length;
  const removedJobs = jobs.filter(j => j.removed).length;
  const last5Audit = (STATE.auditLog || []).slice(0, 5);

  const stat = (label, val) => `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:20px;box-shadow:var(--shadow)">
    <div style="font-size:28px;font-weight:800;color:var(--primary)">${val}</div>
    <div style="font-size:13px;color:var(--muted);margin-top:4px">${label}</div>
  </div>`;

  mount.innerHTML = `
  <div class="list-pane-title" style="margin-bottom:16px">Overview</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-bottom:28px">
    ${stat('Total users', users.length)}
    ${stat('Active jobs', activeJobs)}
    ${stat('Total groups', groups.length)}
    ${stat('Removed jobs', removedJobs)}
  </div>

  <div class="section-title">Last 5 audit lines</div>
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>Time</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead>
      <tbody>
        ${last5Audit.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px">No audit entries yet</td></tr>' : ''}
        ${last5Audit.map(e => `
        <tr>
          <td style="color:var(--muted);font-size:12px;white-space:nowrap">${new Date(e.time).toLocaleTimeString()} · ${new Date(e.time).toLocaleDateString()}</td>
          <td style="color:var(--primary);font-weight:700">${escHtml(e.who)}</td>
          <td><code style="font-size:11px;background:var(--surface2);padding:2px 6px;border-radius:4px">${escHtml(e.action)}</code></td>
          <td style="color:var(--muted);font-size:12px">${escHtml(e.detail)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

// 2. Staff Groups: list of all groups with post counts and "New group" button.
// Opening a group shows its posts exactly as users see them, read-only (no composer, no apply link),
// and each post has a "Remove" action asking for a reason, removes the job, notifies poster & applicants, adds audit line.
function renderStaffGroupsView(mount) {
  const groups = STATE.groups || [];

  if (staffSelectedGroupId) {
    const group = groups.find(g => g.id === staffSelectedGroupId);
    if (!group) {
      staffSelectedGroupId = null;
      renderStaffGroupsView(mount);
      return;
    }

    const groupJobs = (STATE.jobs || []).filter(j => j.groupId === group.id && !j.removed);

    const postBubbles = groupJobs.map(j => {
      const poster = getUser(j.posterId);
      const posterHandle = poster?.handle || 'user-unknown';
      const spotsFilled = j.spotsFilled || 0;
      const spotsTotal = j.spotsTotal || 1;
      const appsCount = (STATE.applications || []).filter(a => a.jobId === j.id).length;

      let contentHtml = '';
      if (j.postType === 'template') {
        contentHtml = `<div class="bubble-template-text">${escHtml(j.template.slice(0, 160))}${j.template.length > 160 ? '…' : ''}</div>`;
      } else {
        const skillsHtml = (j.skills || []).map(s => `<span class="chip skill">${escHtml(s)}</span>`).join('');
        contentHtml = `
        <div class="bubble-skills">${skillsHtml}</div>
        <div class="bubble-meta-line">${escHtml(j.location || 'Remote')} · ${spotsFilled} of ${spotsTotal} spots filled</div>`;
      }

      return `
      <div class="bubble-wrap theirs">
        <div class="bubble-card" style="width:100%;max-width:640px">
          <div class="bubble-header">
            <span class="bubble-handle">${escHtml(posterHandle)}</span>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="bubble-time">${timeAgo(j.createdAt)}</span>
              <!-- Staff Remove Action -->
              <button class="staff-remove-badge staff-post-rm-btn" data-jid="${j.id}">Remove</button>
            </div>
          </div>
          <div class="bubble-title">${escHtml(j.title)}</div>
          ${contentHtml}
          <!-- Read-only footer: NO apply link! -->
          <div class="bubble-footer">
            <span class="text-xs text-muted">${spotsFilled} of ${spotsTotal} spots filled</span>
            <span class="bubble-footer-meta">${appsCount} applied · ${timeAgoShort(j.createdAt)}</span>
          </div>
        </div>
      </div>`;
    }).join('');

    mount.innerHTML = `
    <div style="margin-bottom:16px">
      <button class="btn btn-ghost" id="staff-group-back-btn" style="font-size:12px;padding:6px 12px;gap:6px">
        ${ICONS.back} Back to groups list
      </button>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <span class="list-pane-title">${escHtml(group.name)}</span>
        <span class="chip">${escHtml(group.type)}</span>
        <span class="text-xs text-muted">${groupJobs.length} postings · Read-only moderation view</span>
      </div>
    </div>

    <!-- Read-only feed (NO composer at bottom) -->
    <div class="group-feed" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:20px;max-width:700px">
      ${groupJobs.length === 0 ? '<div class="text-sm text-muted" style="text-align:center;padding:30px 0">No postings in this group.</div>' : postBubbles}
    </div>`;

    document.getElementById('staff-group-back-btn')?.addEventListener('click', () => {
      staffSelectedGroupId = null;
      renderStaffGroupsView(mount);
    });

    mount.querySelectorAll('.staff-post-rm-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        staffRemoveJobPrompt(btn.dataset.jid, () => renderStaffGroupsView(mount));
      });
    });
    return;
  }

  // Groups list
  mount.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <span class="list-pane-title">Groups</span>
    <button class="btn btn-primary" id="staff-new-group-btn" style="font-size:12px;padding:6px 14px">
      ${ICONS.plus} New group
    </button>
  </div>
  <div class="text-xs text-muted" style="margin-bottom:14px">Opening a group shows its posts read-only with moderation controls.</div>

  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>Name</th><th>Type</th><th>Postings</th><th style="text-align:right"></th></tr></thead>
      <tbody>
        ${groups.map(g => {
          const count = (STATE.jobs || []).filter(j => j.groupId === g.id && !j.removed).length;
          return `
          <tr class="staff-group-row-item" data-gid="${g.id}" style="cursor:pointer">
            <td style="font-weight:700;color:var(--text)">${escHtml(g.name)}</td>
            <td><span class="chip">${escHtml(g.type)}</span></td>
            <td>${count} posts</td>
            <td style="text-align:right"><span class="text-xs text-primary" style="font-weight:600">Open posts &rarr;</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;

  mount.querySelectorAll('.staff-group-row-item').forEach(row => {
    row.addEventListener('click', () => {
      staffSelectedGroupId = row.dataset.gid;
      renderStaffGroupsView(mount);
    });
  });

  document.getElementById('staff-new-group-btn')?.addEventListener('click', () => {
    showModal({
      title: 'New group',
      body: `
        <div style="display:flex;flex-direction:column;gap:10px">
          <div>
            <label class="auth-label">Group name *</label>
            <input class="input" id="new-grp-name" placeholder="e.g. AI & Machine Learning">
          </div>
          <div>
            <label class="auth-label">Group type</label>
            <select class="input" id="new-grp-type">
              <option value="technical">Technical</option>
              <option value="non-technical">Non-technical</option>
            </select>
          </div>
        </div>`,
      actions: [
        {
          id: 'create',
          label: 'Create group',
          cls: 'btn-primary',
          fn: () => {
            const name = document.getElementById('new-grp-name')?.value.trim();
            const type = document.getElementById('new-grp-type')?.value;
            if (!name) { toast('Group name is required', 'error'); return; }
            if (!STATE.groups) STATE.groups = [];
            STATE.groups.push({ id: uid(), name, type });
            audit('create_group', `Created group "${name}" (${type})`);
            saveState();
            toast('Group created successfully', 'success');
            renderStaffGroupsView(mount);
          }
        },
        { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
      ]
    });
  });
}

// 3. Staff Jobs: all jobs with search and filters (group, mode).
// Detail shows the job and ONLY the counts "N applied, M accepted".
// Staff can NEVER see applicant names, resumes or chats (private between poster and applicant).
// "Remove job" with a required reason.
let staffSelectedJobId = null;

function renderStaffJobsView(mount) {
  const jobs = (STATE.jobs || []).filter(j => !j.removed).sort((a, b) => b.createdAt - a.createdAt);

  const filtered = jobs.filter(j => {
    const group = (STATE.groups || []).find(g => g.id === j.groupId);
    if (staffJobGroupFilter === 'technical' && group?.type !== 'technical') return false;
    if (staffJobGroupFilter === 'non-technical' && group?.type !== 'non-technical') return false;

    const isRemote = (j.location || '').toLowerCase().includes('remote');
    if (staffJobModeFilter === 'remote' && !isRemote) return false;
    if (staffJobModeFilter === 'offline' && isRemote) return false;

    if (staffJobSearch) {
      const q = staffJobSearch.toLowerCase();
      const matchTitle = j.title.toLowerCase().includes(q);
      const matchLoc   = (j.location || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLoc) return false;
    }
    return true;
  });

  if (!staffSelectedJobId && filtered.length > 0) {
    staffSelectedJobId = filtered[0].id;
  }

  // Selected job detail
  const selectedJob = filtered.find(j => j.id === staffSelectedJobId);
  let detailHtml = '';

  if (selectedJob) {
    const group = (STATE.groups || []).find(g => g.id === selectedJob.groupId);
    const poster = getUser(selectedJob.posterId);
    const apps = (STATE.applications || []).filter(a => a.jobId === selectedJob.id);
    const acceptedCount = apps.filter(a => a.status === 'Accepted').length;

    detailHtml = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:24px;flex:1">
      <div style="font-size:18px;font-weight:700;margin-bottom:6px">${escHtml(selectedJob.title)}</div>
      <div class="text-xs text-muted" style="margin-bottom:16px">
        ${escHtml(group?.name || 'Group')} · Mode: ${escHtml(selectedJob.location || 'Remote')} · Posted ${timeAgo(selectedJob.createdAt)}
      </div>

      <div style="background:var(--surface2);border-radius:12px;padding:14px;margin-bottom:20px">
        <div class="section-title">Applicant stats (Private)</div>
        <div style="font-size:15px;font-weight:700;color:var(--text)">
          ${apps.length} applied, ${acceptedCount} accepted
        </div>
        <div class="text-xs text-muted" style="margin-top:4px">
          Staff cannot see applicant names, resumes or chats (strictly private between poster and applicant).
        </div>
      </div>

      ${selectedJob.skills && selectedJob.skills.length > 0 ? `
      <div class="section-title">Required skills</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
        ${selectedJob.skills.map(s => `<span class="chip skill">${escHtml(s)}</span>`).join('')}
      </div>` : ''}

      ${selectedJob.template ? `
      <div class="section-title">Job template / requirements</div>
      <div style="white-space:pre-wrap;background:var(--surface2);padding:12px;border-radius:10px;font-size:13px;line-height:1.6;margin-bottom:20px">
        ${escHtml(selectedJob.template)}
      </div>` : ''}

      <div class="section-title">Poster</div>
      <div class="text-sm" style="font-weight:600;margin-bottom:24px">${escHtml(poster?.handle || 'user')}</div>

      <div>
        <button class="btn btn-danger" id="staff-remove-this-job-btn">Remove job</button>
      </div>
    </div>`;
  } else {
    detailHtml = `<div class="detail-empty" style="flex:1">${ICONS.briefcase}<span>Select a job to view moderation details</span></div>`;
  }

  mount.innerHTML = `
  <div style="margin-bottom:14px">
    <span class="list-pane-title">Jobs Moderation</span>
  </div>

  <!-- Search & Filters -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
    <div class="search-wrap" style="flex:1;min-width:200px">
      ${ICONS.search}
      <input class="input" type="text" id="staff-job-search" placeholder="Search by title or location…" value="${escHtml(staffJobSearch)}">
    </div>
    <select class="input" id="staff-job-group-filter" style="width:auto">
      <option value="all" ${staffJobGroupFilter === 'all' ? 'selected' : ''}>All Groups</option>
      <option value="technical" ${staffJobGroupFilter === 'technical' ? 'selected' : ''}>Technical</option>
      <option value="non-technical" ${staffJobGroupFilter === 'non-technical' ? 'selected' : ''}>Non-technical</option>
    </select>
    <select class="input" id="staff-job-mode-filter" style="width:auto">
      <option value="all" ${staffJobModeFilter === 'all' ? 'selected' : ''}>All Modes</option>
      <option value="remote" ${staffJobModeFilter === 'remote' ? 'selected' : ''}>Remote</option>
      <option value="offline" ${staffJobModeFilter === 'offline' ? 'selected' : ''}>Offline / In-person</option>
    </select>
  </div>

  <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
    <!-- List of Jobs -->
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow-x:auto;flex:1;min-width:280px">
      <table class="admin-table">
        <thead>
          <tr><th>Title</th><th>Group</th><th>Mode</th><th>Posted</th></tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px">No jobs found</td></tr>' : ''}
          ${filtered.map(j => `
          <tr class="staff-job-tr ${j.id === staffSelectedJobId ? 'selected' : ''}" data-jid="${j.id}" style="cursor:pointer">
            <td style="font-weight:600;color:var(--text)">${escHtml(j.title)}</td>
            <td><span class="chip">${escHtml(j.groupId === 'g1' ? 'Technical' : 'Non-Technical')}</span></td>
            <td style="color:var(--muted)">${escHtml(j.location || 'Remote')}</td>
            <td style="color:var(--muted);font-size:12px">${timeAgo(j.createdAt)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <!-- Detail Pane showing ONLY counts "N applied, M accepted" -->
    ${detailHtml}
  </div>`;

  document.getElementById('staff-job-search')?.addEventListener('input', (e) => {
    staffJobSearch = e.target.value;
    renderStaffJobsView(mount);
  });

  document.getElementById('staff-job-group-filter')?.addEventListener('change', (e) => {
    staffJobGroupFilter = e.target.value;
    renderStaffJobsView(mount);
  });

  document.getElementById('staff-job-mode-filter')?.addEventListener('change', (e) => {
    staffJobModeFilter = e.target.value;
    renderStaffJobsView(mount);
  });

  mount.querySelectorAll('.staff-job-tr').forEach(tr => {
    tr.addEventListener('click', () => {
      staffSelectedJobId = tr.dataset.jid;
      renderStaffJobsView(mount);
    });
  });

  document.getElementById('staff-remove-this-job-btn')?.addEventListener('click', () => {
    if (staffSelectedJobId) {
      staffRemoveJobPrompt(staffSelectedJobId, () => {
        staffSelectedJobId = null;
        renderStaffJobsView(mount);
      });
    }
  });
}

function staffRemoveJobPrompt(jid, onDone) {
  showModal({
    title: 'Remove job',
    body: `
      <div>Provide a required reason for removing this job. The poster and applicants will be notified.</div>
      <div style="margin-top:10px">
        <textarea class="input" id="staff-rm-reason-txt" rows="3" placeholder="Reason for removal (required)…"></textarea>
      </div>`,
    actions: [
      {
        id: 'remove',
        label: 'Remove job',
        cls: 'btn-danger',
        fn: () => {
          const reason = document.getElementById('staff-rm-reason-txt')?.value.trim();
          if (!reason) {
            toast('A reason is required to remove a job posting.', 'error');
            staffRemoveJobPrompt(jid, onDone);
            return;
          }
          const job = (STATE.jobs || []).find(j => j.id === jid);
          if (!job) return;
          job.removed = true;

          // Notify poster
          if (!STATE.notifications) STATE.notifications = [];
          STATE.notifications.push({
            id: uid(),
            userId: job.posterId,
            text: `Your job "${job.title}" was removed by staff. Reason: ${reason}`,
            read: false,
            createdAt: Date.now()
          });

          // Notify applicants
          const apps = (STATE.applications || []).filter(a => a.jobId === jid);
          apps.forEach(a => {
            STATE.notifications.push({
              id: uid(),
              userId: a.applicantId,
              text: `The job "${job.title}" was removed by staff. Reason: ${reason}`,
              read: false,
              createdAt: Date.now()
            });
          });

          audit('remove_job', `Removed job "${job.title}" (${jid}) — Reason: ${reason}`);
          saveState();
          toast('Job removed and notifications sent', 'success');
          if (onDone) onDone();
          else render();
        }
      },
      { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
    ]
  });
}

// 4. Staff Audit Log: time, who, action, details
function renderStaffAuditView(mount) {
  const log = (STATE.auditLog || []).slice(0, 100);

  mount.innerHTML = `
  <div class="list-pane-title" style="margin-bottom:14px">Audit Log</div>
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>Time</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
      <tbody>
        ${log.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px">No audit entries yet</td></tr>' : ''}
        ${log.map(e => `
        <tr>
          <td style="color:var(--muted);font-size:12px;white-space:nowrap">${new Date(e.time).toLocaleString()}</td>
          <td style="color:var(--primary);font-weight:700">${escHtml(e.who)}</td>
          <td><code style="font-size:11px;background:var(--surface2);padding:2px 6px;border-radius:4px">${escHtml(e.action)}</code></td>
          <td style="color:var(--muted);font-size:12px">${escHtml(e.detail)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPER-ADMIN EXCLUSIVE VIEWS (USERS, ROLES, COINS, PROFILE)
// ═══════════════════════════════════════════════════════════════════════════════

// 5. Super-Admin Users: list of handles with role and status; "Delete user" with confirmation.
// Rule: A user who holds a role cannot be deleted until the role is removed.
function renderSuperAdminUsersView(mount) {
  const users = STATE.users || [];

  mount.innerHTML = `
  <div class="list-pane-title" style="margin-bottom:14px">Users Management</div>
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>Handle</th><th>Role</th><th>Status</th><th style="text-align:right">Action</th></tr></thead>
      <tbody>
        ${users.map(u => {
          const roleLabel = u.role === 'super-admin' || u.role === 'superadmin' ? 'super-admin' : u.role === 'admin' ? 'admin' : 'user';
          const roleClass = u.role === 'super-admin' || u.role === 'superadmin' ? 'superadmin' : u.role === 'admin' ? 'admin' : '';
          return `
          <tr>
            <td style="font-weight:700">${escHtml(u.handle)}</td>
            <td><span class="role-pill ${roleClass}">${roleLabel}</span></td>
            <td><span class="badge ${u.verified ? 'badge-green' : 'badge-neutral'}">${u.verified ? 'Verified' : 'Unverified'}</span></td>
            <td style="text-align:right">
              <button class="btn btn-danger staff-del-user-btn" data-uid="${u.id}" style="font-size:11px;padding:4px 10px">Delete user</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;

  mount.querySelectorAll('.staff-del-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetUser = getUser(btn.dataset.uid);
      if (!targetUser) return;

      // Rule: A user who holds a role cannot be deleted until the role is removed.
      if (targetUser.role === 'admin' || targetUser.role === 'superadmin' || targetUser.role === 'super-admin') {
        toast('Cannot delete a user who holds a role. Remove the role first.', 'error');
        return;
      }

      showModal({
        title: 'Delete user',
        body: `Are you sure you want to delete ${escHtml(targetUser.handle)}? This action cannot be undone.`,
        actions: [
          {
            id: 'del',
            label: 'Delete user',
            cls: 'btn-danger',
            fn: () => {
              STATE.users = (STATE.users || []).filter(u => u.id !== targetUser.id);
              STATE.jobs  = (STATE.jobs || []).filter(j => j.posterId !== targetUser.id);
              STATE.applications = (STATE.applications || []).filter(a => a.applicantId !== targetUser.id);
              STATE.driveFiles   = (STATE.driveFiles || []).filter(f => f.ownerId !== targetUser.id);
              audit('delete_user', `Deleted user ${targetUser.handle}`);
              saveState();
              toast('User deleted', 'success');
              renderSuperAdminUsersView(mount);
            }
          },
          { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
        ]
      });
    });
  });
}

// 6. Super-Admin Roles: grant or revoke admin or super-admin by email.
// Rule: The last super-admin cannot be removed: show "You can't remove the last super-admin."
function renderSuperAdminRolesView(mount) {
  const users = STATE.users || [];

  mount.innerHTML = `
  <div class="list-pane-title" style="margin-bottom:8px">Roles Management</div>
  <div class="text-xs text-muted" style="margin-bottom:16px">The last super-admin cannot be removed.</div>

  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:20px;max-width:440px;margin-bottom:24px">
    <div class="section-title">Grant or revoke role by email</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <input class="input" type="email" id="super-role-email-inp" placeholder="User email address…">
      <select class="input" id="super-role-select">
        <option value="admin">Admin</option>
        <option value="super-admin">Super-admin</option>
        <option value="user">User (Revoke staff role)</option>
      </select>
      <button class="btn btn-primary" id="super-apply-role-btn">Update role</button>
    </div>
  </div>

  <div class="section-title">Current Staff Accounts</div>
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);overflow-x:auto">
    <table class="admin-table">
      <thead><tr><th>Handle</th><th>Email</th><th>Role</th><th style="text-align:right">Action</th></tr></thead>
      <tbody>
        ${users.filter(u => u.role === 'admin' || u.role === 'superadmin' || u.role === 'super-admin').map(u => `
        <tr>
          <td style="font-weight:700">${escHtml(u.handle)}</td>
          <td style="color:var(--muted)">${escHtml(u.email)}</td>
          <td><span class="role-pill ${u.role === 'super-admin' || u.role === 'superadmin' ? 'superadmin' : 'admin'}">${u.role}</span></td>
          <td style="text-align:right;display:flex;gap:6px;justify-content:flex-end">
            <button class="btn btn-ghost staff-set-role-btn" data-uid="${u.id}" data-role="user" style="font-size:11px;padding:4px 8px">Set user</button>
            <button class="btn btn-ghost staff-set-role-btn" data-uid="${u.id}" data-role="admin" style="font-size:11px;padding:4px 8px">Set admin</button>
            <button class="btn btn-ghost staff-set-role-btn" data-uid="${u.id}" data-role="super-admin" style="font-size:11px;padding:4px 8px">Set super-admin</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;

  document.getElementById('super-apply-role-btn')?.addEventListener('click', () => {
    const email = document.getElementById('super-role-email-inp')?.value.trim().toLowerCase();
    const newRole = document.getElementById('super-role-select')?.value;
    if (!email) { toast('Email is required', 'error'); return; }
    const targetUser = getUserByEmail(email);
    if (!targetUser) { toast('No user found with that email address', 'error'); return; }
    applySuperRoleChange(targetUser.id, newRole, () => renderSuperAdminRolesView(mount));
  });

  mount.querySelectorAll('.staff-set-role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applySuperRoleChange(btn.dataset.uid, btn.dataset.role, () => renderSuperAdminRolesView(mount));
    });
  });
}

function applySuperRoleChange(userId, newRole, onDone) {
  const targetUser = getUser(userId);
  if (!targetUser) return;

  // Rule: The last super-admin cannot be removed: show "You can't remove the last super-admin."
  const isTargetSuper = (targetUser.role === 'superadmin' || targetUser.role === 'super-admin');
  if (isTargetSuper && newRole !== 'super-admin' && newRole !== 'superadmin') {
    const superCount = (STATE.users || []).filter(u => u.role === 'superadmin' || u.role === 'super-admin').length;
    if (superCount <= 1) {
      toast("You can't remove the last super-admin.", 'error');
      return;
    }
  }

  targetUser.role = newRole;
  audit('set_role', `Updated role for ${targetUser.email} to ${newRole}`);
  saveState();
  toast(`Role updated to ${newRole}`, 'success');
  onDone();
}

// 7. Super-Admin Coins: grant coins to a user by handle with an amount (1-10000) and a reason.
// This is the ONLY place coins appear for the super-admin.
function renderSuperAdminCoinsView(mount) {
  mount.innerHTML = `
  <div class="list-pane-title" style="margin-bottom:8px">Grant Coins</div>
  <div class="text-xs text-muted" style="margin-bottom:16px">Grant coins to a user by handle with an amount (1–10000) and a reason.</div>

  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:20px;max-width:460px;margin-bottom:24px">
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label class="auth-label">User handle</label>
        <input class="input" id="grant-by-handle-inp" placeholder="e.g. user-0873">
      </div>
      <div>
        <label class="auth-label">Amount (1 - 10000)</label>
        <input class="input" type="number" id="grant-by-amount-inp" min="1" max="10000" value="10">
      </div>
      <div>
        <label class="auth-label">Reason *</label>
        <input class="input" id="grant-by-reason-inp" placeholder="e.g. Community promotion award">
      </div>
      <button class="btn btn-primary" id="do-grant-by-handle-btn">Grant coins</button>
    </div>
  </div>`;

  document.getElementById('do-grant-by-handle-btn')?.addEventListener('click', () => {
    const handle = document.getElementById('grant-by-handle-inp')?.value.trim();
    const amount = parseInt(document.getElementById('grant-by-amount-inp')?.value, 10);
    const reason = document.getElementById('grant-by-reason-inp')?.value.trim();

    if (!handle) { toast('User handle is required', 'error'); return; }
    if (isNaN(amount) || amount < 1 || amount > 10000) { toast('Amount must be between 1 and 10000', 'error'); return; }
    if (!reason) { toast('Reason is required', 'error'); return; }

    const targetUser = getUserByHandle(handle);
    if (!targetUser) { toast(`User "${handle}" not found`, 'error'); return; }

    targetUser.coins += amount;
    if (!STATE.ledger) STATE.ledger = [];
    STATE.ledger.push({
      id: uid(),
      userId: targetUser.id,
      type: 'grant',
      amount,
      note: reason,
      at: Date.now()
    });

    if (!STATE.notifications) STATE.notifications = [];
    STATE.notifications.push({
      id: uid(),
      userId: targetUser.id,
      text: `${amount} coins were granted to your account by staff. Reason: ${reason}`,
      read: false,
      createdAt: Date.now()
    });

    audit('grant_coins', `Granted ${amount} coins to ${targetUser.handle} — ${reason}`);
    saveState();
    toast(`Granted ${amount} coins to ${targetUser.handle}`, 'success');

    // Clear form
    document.getElementById('grant-by-handle-inp').value = '';
    document.getElementById('grant-by-reason-inp').value = '';
  });
}

// 8. Super-Admin Profile (pinned at bottom of rail): email, role, sign out. Nothing else.
function renderSuperAdminProfileView(mount) {
  const user = me();

  mount.innerHTML = `
  <div style="max-width:440px">
    <div class="list-pane-title" style="margin-bottom:16px">Staff Profile</div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:24px;margin-bottom:20px;box-shadow:var(--shadow)">
      <div style="font-size:16px;font-weight:700;margin-bottom:6px">${escHtml(user.email)}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="role-pill superadmin">${user.role}</span>
        <span class="text-xs text-muted">Handle: ${escHtml(user.handle)}</span>
      </div>
    </div>
    <button class="btn btn-ghost w-full" id="superadmin-profile-signout">Sign out</button>
  </div>`;

  document.getElementById('superadmin-profile-signout')?.addEventListener('click', doSignOut);
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER PROFILE SCREEN (FOR NORMAL USERS & ADMIN)
// ═══════════════════════════════════════════════════════════════════════════════
function renderProfileView(main) {
  const user = me();
  const myLedger = (STATE.ledger || []).filter(l => l.userId === user.id).sort((a, b) => b.at - a.at).slice(0, 15);
  const initials = user.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  main.innerHTML = `
  <div class="list-pane" style="flex:1;min-width:0;width:auto;max-width:none;border-right:none;overflow-y:auto">
    <div class="list-pane-header">
      <span class="list-pane-title">Profile</span>
      <span class="reset-link" id="reset-demo-link">Reset demo</span>
    </div>
    <div style="padding:20px 24px;max-width:540px">
      <!-- User Info Card -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <label for="photo-input" style="cursor:pointer" title="Upload avatar">
          <div class="profile-avatar" id="profile-avatar-display">
            ${user.photo ? `<img src="${user.photo}" alt="Profile photo">` : `<span>${initials}</span>`}
          </div>
        </label>
        <div>
          <div class="font-bold" style="font-size:17px">${escHtml(user.displayName)}</div>
          <div class="text-xs text-muted">${escHtml(user.handle)}</div>
          <div class="text-xs text-muted">${escHtml(user.email)}</div>
          ${user.role && user.role !== 'user' ? `<span class="role-pill admin" style="margin-top:4px;display:inline-block">${user.role}</span>` : ''}
        </div>
      </div>
      <input type="file" id="photo-input" class="sr-only" accept="image/*" aria-label="Upload profile photo">
      <div id="photo-error" class="auth-error hidden" style="margin-bottom:12px"></div>

      <!-- Coin Balance Card -->
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;margin-bottom:18px;box-shadow:var(--shadow)">
        <div class="section-title">Coins</div>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:28px;font-weight:800;color:var(--coin-fg)">${user.coins}</span>
          <span class="text-muted text-sm">coins available</span>
          <button class="btn btn-primary" id="profile-buy-coins-btn" style="margin-left:auto;font-size:12px;padding:6px 14px">Buy coins</button>
        </div>
      </div>

      <!-- Full Ledger Card -->
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:18px;margin-bottom:18px;box-shadow:var(--shadow)">
        <div class="section-title">Ledger</div>
        ${myLedger.length === 0
          ? '<div class="text-sm text-muted">No transactions recorded yet.</div>'
          : myLedger.map(l => `
          <div class="ledger-row">
            <div>
              <div class="text-sm" style="font-weight:600">${escHtml(l.note)}</div>
              <div class="text-xs text-muted">${new Date(l.at).toLocaleDateString()}</div>
            </div>
            <div class="ledger-amount ${l.amount > 0 ? 'credit' : 'debit'}">
              ${l.amount > 0 ? '+' : ''}${l.amount}
            </div>
          </div>`).join('')}
      </div>

      <!-- Sign out & Delete -->
      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="btn btn-ghost w-full" id="signout-btn">Sign out</button>
        <button class="btn btn-danger w-full" id="delete-acct-btn">Delete account</button>
      </div>
    </div>
  </div>`;

  document.getElementById('reset-demo-link')?.addEventListener('click', resetDemo);
  document.getElementById('profile-buy-coins-btn')?.addEventListener('click', showBuyCoinsModal);

  document.getElementById('photo-input')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    const err = document.getElementById('photo-error');
    if (!file) return;
    if (file.size > PHOTO_MAX_BYTES) {
      if (err) {
        err.textContent = 'Profile photo exceeds 300 KB. Please choose a smaller image.';
        err.classList.remove('hidden');
      }
      return;
    }
    if (err) err.classList.add('hidden');
    const r = new FileReader();
    r.onload = ev => {
      user.photo = ev.target.result;
      saveState();
      toast('Profile photo updated', 'success');
      renderProfileView(main);
    };
    r.readAsDataURL(file);
  });

  document.getElementById('signout-btn')?.addEventListener('click', doSignOut);

  document.getElementById('delete-acct-btn')?.addEventListener('click', () => {
    showModal({
      title: 'Delete account',
      body: 'Are you sure you want to delete your account? All your postings, applications, files, and coin balance will be permanently erased.',
      actions: [
        {
          id: 'confirm',
          label: 'Delete permanently',
          cls: 'btn-danger',
          fn: () => {
            STATE.users = (STATE.users || []).filter(u => u.id !== user.id);
            STATE.jobs = (STATE.jobs || []).filter(j => j.posterId !== user.id);
            STATE.applications = (STATE.applications || []).filter(a => a.applicantId !== user.id);
            STATE.driveFiles = (STATE.driveFiles || []).filter(f => f.ownerId !== user.id);
            currentUserId = null;
            saveSelf();
            saveState();
            toast('Account deleted', 'primary');
            render();
          }
        },
        { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
      ]
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// KYC SCREEN (MOCK IDENTITY VERIFICATION)
// ═══════════════════════════════════════════════════════════════════════════════
function renderKycView(main) {
  const user = me();

  main.innerHTML = `
  <div style="flex:1;padding:24px;max-width:500px;overflow-y:auto">
    <div class="list-pane-title" style="margin-bottom:12px">Identity Verification</div>
    <div class="auth-info" style="margin-bottom:20px">
      Posting jobs on HireTrainers requires identity verification. Complete this mock KYC step to proceed.
    </div>

    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:20px;display:flex;flex-direction:column;gap:14px">
      <div>
        <label class="auth-label">Full legal name</label>
        <input class="input" id="kyc-name" value="${escHtml(user.displayName)}">
      </div>
      <div>
        <label class="auth-label">Phone number</label>
        <input class="input" id="kyc-phone" placeholder="+91 98765 43210">
      </div>
      <div>
        <label class="auth-label">Government ID Number (Mock)</label>
        <input class="input" id="kyc-id" placeholder="XXXX-XXXX-XXXX">
      </div>
      <button class="btn btn-primary" id="kyc-submit-btn" style="margin-top:6px">Complete verification</button>
    </div>
  </div>`;

  document.getElementById('kyc-submit-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('kyc-submit-btn');
    setLoading(btn, true, 'Complete verification');
    await fakeDelay(500);
    user.verified = true;
    saveState();
    setLoading(btn, false, 'Complete verification');
    toast('Account verified successfully!', 'success');

    if (pendingAction) {
      const act = pendingAction;
      pendingAction = null;
      currentView = 'groups';
      render();
      act();
    } else {
      currentView = 'groups';
      render();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadState();
  render();
});
