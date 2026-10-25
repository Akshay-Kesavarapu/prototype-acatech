// Clear legacy saved keys at startup so an old browser does not keep ghost users
['ht_state', 'ht_current_user', 'ht_view'].forEach(k => { try { localStorage.removeItem(k); } catch(e) {} });

/* ── HireTrainers Application ───────────────────────────────────────────────── */
'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// DATA MODEL SPECIFICATION (for reference and future Flutter implementation)
// ═══════════════════════════════════════════════════════════════════════════════
// trainings[]: {
//   id: string,
//   title: string,
//   summary: string,
//   description: string,
//   outcomes: string[],
//   audience: string,
//   prerequisites: string,
//   demoUrl: string,
//   trainer: {
//     name: string,
//     role: string,
//     company: string,
//     years: number | string,
//     bio: string,
//     skills: string[],
//     linkedinUrl: string,
//     photoUrl: string
//   },
//   sessions: [{
//     title: string,
//     date: string,      // YYYY-MM-DD
//     startAt: number,   // timestamp in ms (IST)
//     endAt: number,     // timestamp in ms (IST)
//     startStr: string,  // HH:MM
//     endStr: string,    // HH:MM
//     topics: string[]
//   }],
//   priceInr: number,    // 0 = Free
//   seats: number | null,// null = unlimited
//   enrolledCount: number,
//   enrolBy: string | number,
//   refundPolicy: string,
//   status: 'published' | 'draft' | 'hidden',
//   createdBy: string
// }
//
// privateLinks: { [trainingId: string]: string }
//   // Read ONLY when enrolments[trainingId + '_' + userId].status === "paid"
//
// enrollments: { [trainingId_userId: string]: { status: "pending" | "paid" | "failed" | "refunded", paidAt: number } }
//
// users: { [id: string]: { kycVerified: boolean } }
// ═══════════════════════════════════════════════════════════════════════════════

// ── Constants ────────────────────────────────────────────────────────────────
const REJECTED_LABEL    = 'Rejected';
const COIN_NEW_USER     = 50;
const COIN_POST_COST    = 1;
const POST_MAX_CHARS    = 2000;
const PHOTO_MAX_BYTES   = 300 * 1024;        // 300 KB
const UPLOAD_MAX_BYTES  = 10 * 1024 * 1024;  // 10 MB
const JOB_LIFETIME_DAYS = 30;
const WARN_DAYS         = 5;
const KYC_ACTION_LIFETIME_HOURS = 48;
const CHAT_RETENTION_DAYS = 90;
const READ_NOTIFICATION_RETENTION_DAYS = 90;
const UNREAD_NOTIFICATION_RETENTION_DAYS = 180;


function makeTrainerAvatarSvg(initials, bg = '#1e293b', fg = '#94a3b8') {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="${encodeURIComponent(bg)}"/><circle cx="200" cy="180" r="70" fill="none" stroke="${encodeURIComponent(fg)}" stroke-width="6" opacity="0.4"/><path d="M120 380 C120 290 280 290 280 380" fill="none" stroke="${encodeURIComponent(fg)}" stroke-width="6" opacity="0.4"/><text x="50%" y="270" font-family="system-ui,-apple-system,sans-serif" font-size="72" font-weight="700" fill="${encodeURIComponent(fg)}" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
}

// ── Pre-kept Seed Accounts ───────────────────────────────────────────────────
const SEED = {
  users: [],
  groups: [
    { id: 'g1', name: 'Technical',     type: 'technical' },
    { id: 'g2', name: 'Non-Technical', type: 'non-technical' },
  ],
  jobs: [],
  applications: [],
  driveFiles: [],
  messages: [],
  notifications: [],
  ledger: [],
  pendingActions: [],
  
  trainings: [
    {
      id: 't1',
      title: 'AWS and DevOps Mastery',
      summary: 'Master enterprise Kubernetes, EKS, Terraform, and zero-downtime CI/CD pipelines on AWS.',
      description: 'An intensive live hands-on seminar designed for cloud engineers and backend developers looking to master production AWS DevOps. We build multi-region cloud infrastructures from scratch using Terraform, deploy production-ready Kubernetes clusters with AWS EKS, automate GitOps deployments using ArgoCD, and architect resilient CI/CD pipelines with Jenkins and GitHub Actions. All exercises run live in simulated and real cloud sandboxes.',
      outcomes: [
        'Design and provision enterprise AWS infrastructure using modular Terraform',
        'Deploy, monitor, and scale production Kubernetes workloads on Amazon EKS',
        'Implement secure GitOps release pipelines with ArgoCD and Jenkins',
        'Establish zero-downtime rolling updates, canary releases, and automated rollbacks',
        'Enforce security best practices, IAM least privilege, and container vulnerability scanning'
      ],
      audience: 'Cloud engineers, DevOps practitioners, backend engineers, and systems administrators with basic Linux and cloud familiarity.',
      prerequisites: 'Basic understanding of Linux command line, networking concepts, and familiarity with any cloud provider.',
      demoUrl: 'dQw4w9WgXcQ',
      trainer: {
        name: 'Aarav Deshmukh',
        role: 'Senior AWS DevOps Engineer',
        company: 'CloudScale Systems',
        years: '8+',
        bio: 'Specializes in enterprise Kubernetes deployments, zero-downtime CI/CD pipelines, and multi-region infrastructure as code on AWS. Has trained over 1,200 engineers worldwide.',
        skills: ['AWS', 'EKS', 'Terraform', 'Kubernetes', 'ArgoCD', 'Jenkins', 'CI/CD'],
        linkedinUrl: 'https://www.linkedin.com/in/aarav-deshmukh-cloud',
        photoUrl: ''
      },
      sessions: [
        { title: 'Infrastructure as Code with Terraform & VPC', date: '2026-11-08', startAt: Date.now() + 2 * 86400000, endAt: Date.now() + 2 * 86400000 + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['AWS Networking Deep Dive', 'Terraform State Management', 'Multi-AZ VPC Architecture'] },
        { title: 'Kubernetes Core & EKS Architecture', date: '2026-11-10', startAt: Date.now() + 4 * 86400000, endAt: Date.now() + 4 * 86400000 + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['EKS Control Plane Setup', 'Worker Node Groups', 'Ingress Controllers & Helm'] },
        { title: 'GitOps Continuous Delivery with ArgoCD', date: '2026-11-15', startAt: Date.now() + 9 * 86400000, endAt: Date.now() + 9 * 86400000 + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['ArgoCD Deployment Architecture', 'Canary Rollouts', 'Sync Waves & Hooks'] },
        { title: 'Production Observability, Security & Scaling', date: '2026-11-17', startAt: Date.now() + 11 * 86400000, endAt: Date.now() + 11 * 86400000 + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['Prometheus & Grafana Alerting', 'AWS IAM IRSA', 'Horizontal Pod Autoscaling'] }
      ],
      priceInr: 4999,
      seats: 25,
      enrolledCount: 18,
      enrolBy: '2026-11-07',
      refundPolicy: 'Full refund if requested at least 48 hours before Session 1. Recordings provided for all live sessions.',
      status: 'published',
      createdBy: null
    },
    {
      id: 't2',
      title: 'Applied AI: Python to GenAI',
      summary: 'Production RAG architectures, LLM fine-tuning, vector databases, and real-time inference pipelines.',
      description: 'A deep-dive masterclass for developers ready to advance from traditional Python machine learning to modern Generative AI engineering. Covers transformer architectures, LangChain and LlamaIndex orchestrations, hybrid search vector embeddings (Pinecone, Qdrant), PEFT/LoRA fine-tuning, and robust prompt evaluation frameworks.',
      outcomes: [
        'Build production-grade Retrieval-Augmented Generation (RAG) pipelines with hybrid search',
        'Fine-tune open-weight LLMs (Llama 3, Mistral) using LoRA and QLoRA',
        'Implement semantic caching, guardrails, and deterministic tool-calling agents',
        'Deploy low-latency inference services with vLLM and Triton on GPU instances'
      ],
      audience: 'Software engineers, data scientists, and ML practitioners seeking hands-on generative AI system design.',
      prerequisites: 'Proficiency in Python and basic familiarity with neural networks or NLP fundamentals.',
      demoUrl: 'aircAruvnKk',
      trainer: {
        name: 'Dr. Kavit Mehta',
        role: 'AI Lead & LLM Architect',
        company: 'Synthetix Labs',
        years: '4+',
        bio: 'Hands-on AI researcher and architect building enterprise generative AI platforms. Specializes in efficient model adaptation, RAG systems, and hallucination reduction.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'GenAI'],
        linkedinUrl: 'https://www.linkedin.com/in/kavit-mehta-ai',
        photoUrl: ''
      },
      sessions: [
        { title: 'Modern Transformers & LLM Fundamentals', date: '2026-11-12', startAt: Date.now() + 4 * 86400000, endAt: Date.now() + 4 * 86400000 + 2.5 * 3600000, startStr: '18:30', endStr: '21:00', topics: ['Attention Mechanisms', 'Tokenization', 'Context Window Dynamics'] },
        { title: 'Advanced RAG with Hybrid Embeddings', date: '2026-11-14', startAt: Date.now() + 6 * 86400000, endAt: Date.now() + 6 * 86400000 + 2.5 * 3600000, startStr: '18:30', endStr: '21:00', topics: ['Sparse vs Dense Vectors', 'Chunking Strategies', 'Rerankers'] },
        { title: 'Fine-Tuning with LoRA & Evaluation', date: '2026-11-19', startAt: Date.now() + 11 * 86400000, endAt: Date.now() + 11 * 86400000 + 2.5 * 3600000, startStr: '18:30', endStr: '21:00', topics: ['Parameter-Efficient Tuning', 'Quantization (4-bit/8-bit)', 'Ragas Benchmarking'] }
      ],
      priceInr: 7499,
      seats: 30,
      enrolledCount: 24,
      enrolBy: '2026-11-11',
      refundPolicy: 'Full refund eligible up to 48 hours before commencement. All session notebooks included.',
      status: 'published',
      createdBy: null
    },
    {
      id: 't3',
      title: 'Full-Stack System Design & Microservices',
      summary: 'Architecting high-throughput distributed systems, event streams with Kafka, and caching at scale.',
      description: 'A free community masterclass exploring real-world distributed architectures. We dissect large-scale platforms handling 100k+ transactions per second, covering database sharding, event-driven microservices with Apache Kafka, Redis caching topologies, and circuit breaker fault-tolerance patterns.',
      outcomes: [
        'Design resilient microservices architectures avoiding single points of failure',
        'Model high-volume event streams with Kafka partitions and consumer groups',
        'Implement write-through, write-behind, and cache stampede prevention using Redis',
        'Analyze distributed consistency tradeoffs with CAP and PACELC theorems'
      ],
      audience: 'Mid to senior software engineers, tech leads, and candidates preparing for system design interviews.',
      prerequisites: 'Foundational knowledge of relational databases and RESTful API architecture.',
      demoUrl: 'dQw4w9WgXcQ',
      trainer: {
        name: 'Rohit Bansal',
        role: 'Principal Systems Architect',
        company: 'FinTech Scale Corp',
        years: '11+',
        bio: 'Architected distributed payment engines processing millions of transactions daily. Passionate about real-world consistency, resilient message queues, and performance profiling.',
        skills: ['System Design', 'Microservices', 'Kafka', 'Redis', 'PostgreSQL', 'Docker'],
        linkedinUrl: 'https://www.linkedin.com/in/rohit-bansal-arch',
        photoUrl: ''
      },
      sessions: [
        { title: 'Distributed Fundamentals & Microservice Decomposition', date: '2026-11-16', startAt: Date.now() + 6 * 86400000, endAt: Date.now() + 6 * 86400000 + 2 * 3600000, startStr: '20:00', endStr: '22:00', topics: ['Domain-Driven Design Boundaries', 'Synchronous vs Asynchronous Communication', 'API Gateway Patterns'] },
        { title: 'Event-Driven Architectures with Apache Kafka', date: '2026-11-18', startAt: Date.now() + 8 * 86400000, endAt: Date.now() + 8 * 86400000 + 2 * 3600000, startStr: '20:00', endStr: '22:00', topics: ['Kafka Consumer Groups', 'Idempotent Producers', 'Dead Letter Queues'] }
      ],
      priceInr: 0,
      seats: 100,
      enrolledCount: 82,
      enrolBy: '2026-11-15',
      refundPolicy: 'Free enrolment. Access to live sessions and community Q&A.',
      status: 'published',
      createdBy: null
    },
    {
      id: 't4',
      title: 'High-Performance React & Next.js Architecture',
      summary: 'Master Next.js App Router, React Server Components, bundle optimization, and Web Vitals.',
      description: 'An intensive workshop on building ultra-fast React and Next.js applications at enterprise scale. Covers streaming SSR, Server Actions, granular client/server composition boundaries, bundle tree-shaking, and achieving 100/100 Core Web Vitals.',
      outcomes: [
        'Leverage React Server Components (RSC) and streaming SSR effectively',
        'Optimize Core Web Vitals (LCP, INP, CLS) for enterprise web apps',
        'Architect modular design systems using Tailwind CSS and Radix UI primitives'
      ],
      audience: 'Frontend developers and full-stack engineers with at least 1 year of React experience.',
      prerequisites: 'Comfortable with modern JavaScript, ES modules, and React hooks.',
      demoUrl: 'aircAruvnKk',
      trainer: {
        name: 'Sneha Varadarajan',
        role: 'Staff Frontend Engineer',
        company: 'Veloce Technologies',
        years: '7+',
        bio: 'Frontend performance specialist and design systems maintainer. Known for shaving seconds off page load times for high-traffic SaaS products.',
        skills: ['React', 'Next.js', 'TypeScript', 'Performance', 'Tailwind CSS', 'Architecture'],
        linkedinUrl: 'https://www.linkedin.com/in/sneha-varad-frontend',
        photoUrl: ''
      },
      sessions: [
        { title: 'Next.js App Router & Server Components', date: '2026-11-09', startAt: Date.now() + 1 * 86400000, endAt: Date.now() + 1 * 86400000 + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['RSC vs Client Components', 'Streaming with Suspense', 'Server Actions'] }
      ],
      priceInr: 1999,
      seats: 20,
      enrolledCount: 20,
      enrolBy: '2026-11-08',
      refundPolicy: 'Standard 48-hour refund policy before session kickoff.',
      status: 'published',
      createdBy: null
    },
    {
      id: 't5',
      title: 'Practical Kubernetes & Service Mesh',
      summary: 'Hands-on Istio service mesh, Cilium eBPF networking, mutual TLS, and traffic shaping.',
      description: 'Deep-dive into microservice communication, observability, and security inside Kubernetes using Istio and Cilium. Includes session recordings from past modules and live upcoming deep dives.',
      outcomes: [
        'Deploy Istio service mesh with Envoy sidecar and ambient mesh models',
        'Enforce zero-trust mutual TLS (mTLS) across all pod-to-pod traffic',
        'Implement canary deployments and weighted routing with VirtualServices'
      ],
      audience: 'Platform engineers, SREs, and cloud infrastructure specialists.',
      prerequisites: 'Working knowledge of Kubernetes pods, services, and deployments.',
      demoUrl: 'dQw4w9WgXcQ',
      trainer: {
        name: 'Vikram Singhania',
        role: 'Lead Cloud Infrastructure Engineer',
        company: 'InfraMesh Global',
        years: '9+',
        bio: 'Production Kubernetes and cloud networking architect. Mentored hundreds of platform teams migrating to service mesh topologies.',
        skills: ['Kubernetes', 'Istio', 'eBPF', 'Envoy', 'Golang', 'Helm'],
        linkedinUrl: 'https://www.linkedin.com/in/vikram-singhania-k8s',
        photoUrl: ''
      },
      sessions: [
        { title: 'Core Kubernetes Networking Review (Completed)', date: '2026-10-15', startAt: Date.now() - 5 * 86400000, endAt: Date.now() - 5 * 86400000 + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['CNI plugins', 'Kube-proxy deep dive', 'NetworkPolicies'] },
        { title: 'Istio Service Mesh & Zero-Trust mTLS', date: '2026-11-13', startAt: Date.now() + 3 * 86400000, endAt: Date.now() + 3 * 86400000 + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['mTLS Strict Mode', 'AuthorizationPolicies', 'Telemetry & Kiali'] }
      ],
      priceInr: 2999,
      seats: 40,
      enrolledCount: 38,
      enrolBy: '2026-11-12',
      refundPolicy: 'Full refund available up to 48 hours prior to live modules.',
      status: 'published',
      createdBy: null
    },
    {
      id: 't6',
      title: 'Data Engineering with Apache Spark & Databricks',
      summary: 'Petabyte-scale data pipelines, Delta Lake ACID transactions, and automated dbt transforms.',
      description: 'Learn modern Lakehouse architecture on Databricks with Apache Spark. Build reliable, performant batch and streaming ingestion pipelines with Delta Lake, optimize shuffle partitions, and automate data transformations with dbt and Apache Airflow.',
      outcomes: [
        'Build scalable PySpark transformations using DataFrames and Spark SQL',
        'Implement Delta Lake ACID transactions, time travel, and change data feed (CDF)',
        'Optimize Spark jobs with adaptive query execution (AQE) and dynamic partitioning'
      ],
      audience: 'Data engineers, software engineers transitioning to data, and BI developers.',
      prerequisites: 'Basic Python and SQL query writing experience.',
      demoUrl: 'aircAruvnKk',
      trainer: {
        name: 'Ananya Mukherjee',
        role: 'Data Platform Architect',
        company: 'DataPulse Analytics',
        years: '6+',
        bio: 'Designs petabyte-scale lakehouse platforms using Delta Lake, PySpark, and orchestrated dbt pipelines across multi-cloud environments.',
        skills: ['Apache Spark', 'Databricks', 'Delta Lake', 'Python', 'dbt', 'Airflow'],
        linkedinUrl: 'https://www.linkedin.com/in/ananya-mukherjee-data',
        photoUrl: ''
      },
      sessions: [
        { title: 'Spark Architecture & PySpark Foundations', date: '2026-11-14', startAt: Date.now() + 5 * 86400000, endAt: Date.now() + 5 * 86400000 + 2 * 3600000, startStr: '10:00', endStr: '12:00', topics: ['Spark Execution Engine', 'DataFrames & Datasets', 'Memory Management'] },
        { title: 'Delta Lake & Lakehouse Patterns', date: '2026-11-21', startAt: Date.now() + 12 * 86400000, endAt: Date.now() + 12 * 86400000 + 2 * 3600000, startStr: '10:00', endStr: '12:00', topics: ['ACID Logging', 'Compaction (OPTIMIZE)', 'Time Travel Queries'] }
      ],
      priceInr: 4999,
      seats: 25,
      enrolledCount: 12,
      enrolBy: '2026-11-13',
      refundPolicy: 'Full refund eligible up to 48 hours before session 1 kickoff.',
      status: 'published',
      createdBy: null
    }
  ],
  privateLinks: {
    t1: 'https://meet.google.com/aws-devops-mastery-live',
    t2: 'https://meet.google.com/genai-applied-live',
    t3: 'https://meet.google.com/system-design-free-live',
    t4: 'https://meet.google.com/react-next-arch-live',
    t5: 'https://meet.google.com/k8s-mesh-workshop-live',
    t6: 'https://meet.google.com/spark-databricks-live'
  },
  enrollments: {},
  auditLog: []
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
let currentTheme      = 'light';

// Staff Drill-down & Filter states
let staffSelectedGroupId = null;
let staffJobSearch = '';
let staffJobGroupFilter = 'all';
let staffJobModeFilter  = 'all';

// Training & Segment State Variables
let selectedTrainingId = null;
let trainingsFilter = 'all'; // all | upcoming | free | enrolled
let trainingsSearch = '';
let trainingsLoading = false;
let jobsSegment = 'browse'; // browse | applied | posted
let learningFilter = 'upcoming'; // upcoming | completed
let editingTrainingId = null;
let postTrainingMode = 'form'; // form | paste


// ── Storage Helpers (Memory-only, no localStorage persistence for users/sessions) ──
function loadState() {
  ['ht_state', 'ht_current_user', 'ht_view'].forEach(k => { try { localStorage.removeItem(k); } catch(e) {} });
  resetToSeed();
  currentUserId = null;
}

function ensureSeedAccounts() {
  if (!STATE.users) STATE.users = [];
  if (!STATE.auditLog) STATE.auditLog = [];
  if (!STATE.pendingActions) STATE.pendingActions = [];
  if (!STATE.notifications) STATE.notifications = [];
  if (!STATE.messages) STATE.messages = [];
  if (!STATE.ledger) STATE.ledger = [];

  if (!STATE.trainings || STATE.trainings.length === 0) {
    STATE.trainings = JSON.parse(JSON.stringify(SEED.trainings || []));
  } else {
    STATE.trainings.forEach(t => {
      if (t.trainer && t.trainer.photoUrl && t.trainer.photoUrl.startsWith('data:image/svg+xml')) {
        t.trainer.photoUrl = '';
      }
    });
  }
  if (!STATE.privateLinks || Object.keys(STATE.privateLinks).length === 0) {
    STATE.privateLinks = JSON.parse(JSON.stringify(SEED.privateLinks || {}));
  }
  if (!STATE.enrollments) STATE.enrollments = {};
}

function resetToSeed() {
  STATE = JSON.parse(JSON.stringify(SEED));
}

function saveState() {
  // Code saving registered users, passwords or sessions in localStorage deleted
}

function saveSelf() {
  // Code saving sessions in localStorage deleted
}

function saveView() {
  // Code saving view in localStorage deleted
}

function resetDemo() {
  ['ht_state', 'ht_current_user', 'ht_view'].forEach(k => { try { localStorage.removeItem(k); } catch(e) {} });
  currentUserId = null;
  currentView = 'groups';
  staffSubTab = 'overview';
  resetToSeed();
  render();
  toast('Demo reset to initial state', 'primary');
}

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

// ── Lifecycle Triggers ────────────────────────────────────────────────────────
// In production these are server-side scheduled jobs and Cloud Function triggers.
// They run during render here so the browser prototype can demonstrate the result.
function addNotification(userId, text) {
  if (!userId) return;
  if (!STATE.notifications) STATE.notifications = [];
  STATE.notifications.push({
    id: uid(), userId, text, read: false, createdAt: Date.now()
  });
}

function hasAvailableSlot(job) {
  return !job.closed && !job.removed && (job.spotsFilled || 0) < (job.spotsTotal || 1);
}

function applicationKeepsFile(fileId) {
  return (STATE.applications || []).some(a =>
    a.fileId === fileId && (a.status === 'Under review' || a.status === 'Accepted')
  );
}

function finalizeHiddenFiles() {
  const before = (STATE.driveFiles || []).length;
  STATE.driveFiles = (STATE.driveFiles || []).filter(file =>
    !file.hidden || applicationKeepsFile(file.id)
  );
  return STATE.driveFiles.length !== before;
}

function makeJobChatReadOnly(job, reason, at = Date.now()) {
  job.chatReadOnlyAt = job.chatReadOnlyAt || at;
  job.chatDeleteAfter = job.chatDeleteAfter || at + CHAT_RETENTION_DAYS * 86400000;
  job.removalReason = reason || job.removalReason || 'Job removed';
}

function removeJobWithLifecycle(job, reason, { notify = true } = {}) {
  if (!job || job.removed) return false;
  const now = Date.now();
  job.removed = true;
  job.removedAt = now;
  makeJobChatReadOnly(job, reason, now);

  if (notify) {
    addNotification(job.posterId, `Your job "${job.title}" was removed. Reason: ${job.removalReason}`);
    const applicantIds = new Set((STATE.applications || [])
      .filter(app => app.jobId === job.id)
      .map(app => app.applicantId));
    applicantIds.forEach(userId => {
      addNotification(userId, `The job "${job.title}" was removed. Reason: ${job.removalReason}`);
    });
  }
  return true;
}

function queueKycAction(userId, type, payload) {
  const now = Date.now();
  const waiting = (STATE.pendingActions || []).filter(action =>
    action.userId === userId && action.status === 'waiting' && action.expiresAt > now
  );
  if (waiting.length >= 5) {
    toast('You already have 5 actions waiting for verification. Complete KYC or cancel one first.', 'error');
    return false;
  }
  if (type === 'apply' && waiting.some(action => action.type === 'apply' && action.payload.jobId === payload.jobId)) {
    toast('This application is already waiting for verification.', 'primary');
    return false;
  }

  STATE.pendingActions.push({
    id: uid(), userId, type, payload,
    status: 'waiting', queuedAt: now,
    expiresAt: now + KYC_ACTION_LIFETIME_HOURS * 3600000
  });
  saveState();
  return true;
}

function processQueuedActionsAfterVerification(user) {
  const now = Date.now();
  const actions = (STATE.pendingActions || []).filter(action =>
    action.userId === user.id && action.status === 'waiting' && action.expiresAt > now
  );
  STATE.pendingActions = (STATE.pendingActions || []).filter(action => !actions.includes(action));

  const queuedApply = actions.find(action => action.type === 'apply');
  actions.filter(action => action.type === 'post').forEach(action => {
    const posted = createJobPost(action.payload, { skipKyc: true, deferRender: true });
    if (posted) {
      addNotification(user.id, `You are verified — your job "${posted.title}" was published.`);
    } else {
      addNotification(user.id, 'You are verified, but a queued job could not be published. Please review it and try again.');
    }
  });

  saveState();
  render();

  // A resume is mandatory, so KYC completion returns the user to the file picker
  // instead of creating an incomplete application automatically.
  if (queuedApply) {
    toast('You are verified — select a resume to finish your application.', 'success');
    applyToJob(queuedApply.payload.jobId, { skipKyc: true });
  }
}

function runLifecycleTriggers() {
  const now = Date.now();
  let changed = false;

  const waitingActions = STATE.pendingActions || [];
  STATE.pendingActions = waitingActions.filter(action => {
    if (action.status === 'waiting' && action.expiresAt <= now) {
      addNotification(action.userId, 'Your pending action expired after 48 hours because verification was not completed.');
      changed = true;
      return false;
    }
    return true;
  });

  (STATE.jobs || []).forEach(job => {
    const inactiveFor = now - (job.lastActivity || job.createdAt || now);
    if (!job.removed && inactiveFor >= JOB_LIFETIME_DAYS * 86400000) {
      if (removeJobWithLifecycle(job, 'Expired after 30 days without activity')) changed = true;
    }
    if (job.removed && job.chatDeleteAfter && job.chatDeleteAfter <= now && !job.chatDeletedAt) {
      STATE.messages = (STATE.messages || []).filter(message => message.jobId !== job.id);
      job.chatDeletedAt = now;
      changed = true;
    }
  });

  // Accepted conversations are retained for 90 inactive days, even when the
  // job itself remains active. Removed-job conversations use their own
  // removal-based deadline above.
  (STATE.applications || []).forEach(application => {
    const inactiveFor = now - (application.lastActivity || application.appliedAt || now);
    if (application.status === 'Accepted' && inactiveFor >= CHAT_RETENTION_DAYS * 86400000 && !application.chatDeletedAt) {
      STATE.messages = (STATE.messages || []).filter(message => message.applicationId !== application.id);
      application.chatDeletedAt = now;
      changed = true;
    }
  });

  const readCutoff = now - READ_NOTIFICATION_RETENTION_DAYS * 86400000;
  const unreadCutoff = now - UNREAD_NOTIFICATION_RETENTION_DAYS * 86400000;
  const notificationCount = (STATE.notifications || []).length;
  STATE.notifications = (STATE.notifications || []).filter(notification =>
    notification.read ? notification.createdAt > readCutoff : notification.createdAt > unreadCutoff
  );
  if (STATE.notifications.length !== notificationCount) changed = true;

  if (finalizeHiddenFiles()) changed = true;
  if (changed) saveState();
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

const kStorageEnabled = false;

function normalizeIndianPhone(input) {
  if (!input) return '';
  let cleaned = String(input).replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
  else if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.slice(2);
  else if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.slice(1);
  return cleaned;
}

function isValidIndianPhone(phone) {
  const norm = normalizeIndianPhone(phone);
  return /^[6-9]\d{9}$/.test(norm);
}

function evaluatePassword(p) {
  const str = p || '';
  const len = str.length >= 8;
  const letter = /[a-zA-Z]/.test(str);
  const number = /[0-9]/.test(str);
  const special = /[^a-zA-Z0-9]/.test(str);

  let score = 0;
  if (len) score++;
  if (letter) score++;
  if (number) score++;
  if (str.length >= 10 || (score === 3 && special)) score++;

  let label = 'none';
  if (str.length === 0) label = 'none';
  else if (score <= 1) label = 'weak';
  else if (score <= 2) label = 'okay';
  else label = 'strong';

  return { len, letter, number, score, label };
}

function validateEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function validatePhone(phone) {
  return isValidIndianPhone(phone);
}

function isAllowedResume(file) {
  return /\.(pdf|jpe?g|png|docx?)$/i.test(file?.name || '');
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
  users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  briefcase: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12"/><path d="M2 12h20"/></svg>`,
  message: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  folder: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  user: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  bell: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  paperclip: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  code: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  presentation: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;flex-shrink:0;"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21l4-4 4 4"/><path d="M12 17v4"/></svg>`,
  eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  back: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  coin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v8"/><path d="M9.5 10.5a2.5 2.5 0 0 1 5 0v0a2.5 2.5 0 0 1-5 0"/></svg>`,
  shield: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  sun: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="12" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  lock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  log: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  overview: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  google: `<svg width="20" height="20" viewBox="0 0 24 24" style="flex-shrink:0"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`,

  book: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  linkedin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
  copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  externalLink: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  more: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  filter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  chevronDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
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

// ── Training Helpers & IST Formatting ─────────────────────────────────────────
function isEnrolled(trainingId, userId) {
  if (!trainingId || !userId) return false;
  const key = trainingId + '_' + userId;
  return Boolean(STATE.enrollments && STATE.enrollments[key] && STATE.enrollments[key].status === 'paid');
}

function getTrainingPrivateLink(trainingId, userId) {
  // STRICT RULE: Session link is read ONLY when user enrollment status is "paid"
  if (!isEnrolled(trainingId, userId)) return null;
  return (STATE.privateLinks && STATE.privateLinks[trainingId]) || 'https://meet.google.com/ht-training-room';
}

function formatISTDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  // Options in Indian Standard Time (Asia/Kolkata)
  return d.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatISTTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function getNextUpcomingSession(training) {
  if (!training || !training.sessions || training.sessions.length === 0) return null;
  const now = Date.now();
  // Find first session ending in future
  const sorted = [...training.sessions].sort((a, b) => a.startAt - b.startAt);
  const next = sorted.find(s => (s.endAt || (s.startAt + 2 * 3600000)) > now);
  return next || sorted[sorted.length - 1];
}

function isSessionLiveOrUpcoming15m(training) {
  if (!training || !training.sessions) return false;
  const now = Date.now();
  return training.sessions.some(s => {
    const start = s.startAt;
    const end = s.endAt || (start + 2 * 3600000);
    // Active if within 15 minutes before start to end of session
    return now >= (start - 15 * 60000) && now <= end;
  });
}

function formatSessionCountdown(targetTimestamp, durationMs = 2 * 3600000) {
  const now = Date.now();
  const end = targetTimestamp + durationMs;
  if (now >= targetTimestamp && now <= end) {
    return 'Live now';
  }
  if (now > end) {
    return 'Completed';
  }
  const diff = targetTimestamp - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${Math.max(1, mins)}m`;
}


// ── Safe Defensive Screen Renderer ──────────────────────────────────────────
function renderScreenSafely(mount, screenName, renderFn) {
  try {
    if (!mount) {
      console.warn(`[SafeRender] Mount target missing for screen: ${screenName}`);
      return;
    }
    renderFn();
  } catch (err) {
    console.error(`[SafeRender] Screen "${screenName}" failed to load:`, err);
    if (mount) {
      mount.innerHTML = `
        <div class="error-card" style="padding:28px 24px; max-width:520px; margin:40px auto; background:var(--surface2); border:1px solid #EF4444; border-radius:14px; text-align:center; box-shadow:var(--shadow);">
          <div style="width:48px; height:48px; margin:0 auto 14px; border-radius:50%; background:rgba(239,68,68,0.12); display:flex; align-items:center; justify-content:center; color:#EF4444; font-size:22px; font-weight:800;">!</div>
          <div style="color:var(--text); font-size:17px; font-weight:700; margin-bottom:8px;">This screen failed to load</div>
          <div style="color:var(--muted); font-size:13px; line-height:1.5; margin-bottom:18px; word-break:break-word;">${escHtml(err.message || String(err))}</div>
          <div style="display:flex; justify-content:center; gap:10px;">
            <button class="btn btn-sm btn-primary" onclick="render()">Retry screen</button>
            <button class="btn btn-sm btn-ghost" onclick="window.location.hash='#/groups'; location.reload();">Return home</button>
          </div>
        </div>
      `;
    }
  }
}

// ── Hash Routing Helpers ──────────────────────────────────────────────────────
function handleHashRoute() {
  const hash = window.location.hash || '';
  const clean = hash.replace(/^#\/?/, '');
  const parts = clean.split('/');
  const route = parts[0] || '';
  const param = parts[1] || null;

  const user = me();

  if (user && isSuperAdmin(user)) {
    const validViews = ['overview', 'groups', 'jobs', 'trainings', 'audit', 'users', 'roles', 'coins', 'me', 'profile', 'post_training'];
    if (route === 'staff' && param && validViews.includes(param)) {
      staffSubTab = param;
    } else if (validViews.includes(route)) {
      staffSubTab = route;
      if (route === 'trainings') {
        selectedTrainingId = param || null;
      } else {
        selectedTrainingId = null;
      }
      if (route === 'jobs') staffSelectedJobId = null;
      if (route === 'groups') staffSelectedGroupId = null;
    } else {
      staffSubTab = 'overview';
      selectedTrainingId = null;
      staffSelectedJobId = null;
      staffSelectedGroupId = null;
    }
    currentView = staffSubTab;
  } else {
    // Normal user or Admin
    if (route === 'trainings') {
      currentView = 'trainings';
      selectedTrainingId = param || null;
    } else if (route === 'learning') {
      currentView = 'learning';
      selectedTrainingId = null;
    } else if (route === 'jobs') {
      currentView = 'jobs';
      selectedTrainingId = null;
      selectedJobId = null;
      selectedAppId = null;
      selectedPostingId = null;
      if (param && ['browse', 'applied', 'posted'].includes(param)) {
        jobsSegment = param;
      }
    } else if (route === 'me' || route === 'profile') {
      currentView = 'me';
      selectedTrainingId = null;
    } else if (route === 'groups') {
      currentView = 'groups';
      selectedTrainingId = null;
      selectedGroupId = null;
      staffSelectedGroupId = null;
    } else if (route === 'drive') {
      currentView = 'drive';
      selectedTrainingId = null;
    } else if (route === 'staff') {
      currentView = 'staff';
      selectedTrainingId = null;
      staffSelectedGroupId = null;
      staffSelectedJobId = null;
      if (param) staffSubTab = param;
    } else if (['overview', 'audit', 'users', 'roles', 'coins'].includes(route)) {
      if (isAdmin(user)) {
        currentView = 'staff';
        staffSubTab = route;
      } else {
        currentView = 'groups';
      }
    } else if (!route) {
      currentView = 'groups';
    }
  }

  saveView();
  render();
}

function navigateTo(hash) {
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
  handleHashRoute();
}
window.addEventListener('hashchange', handleHashRoute);

function render() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  try {
    runLifecycleTriggers();

    const user = me();
    if (!user) {
      renderAuth(appEl);
      return;
    }

    if (isSuperAdmin(user)) {
      renderSuperAdminApp(appEl);
    } else {
      renderUserApp(appEl);
    }
  } catch (err) {
    console.error('[Render Root Error]', err);
    appEl.innerHTML = `
      <div class="error-card" style="padding:28px 24px; max-width:520px; margin:40px auto; background:var(--surface2); border:1px solid #EF4444; border-radius:14px; text-align:center;">
        <div style="color:#EF4444; font-size:18px; font-weight:800; margin-bottom:8px;">Application error</div>
        <div style="color:var(--muted); font-size:13px; line-height:1.5; margin-bottom:16px;">${escHtml(err.message || String(err))}</div>
        <button class="btn btn-sm btn-primary" onclick="location.reload()">Reload Application</button>
      </div>
    `;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION (TWO DOORS, ONE DESTINATION)
// Door 1: Continue with Google (fastest, auto-fills name/email, asks only for missing phone)
// Door 2: Sign up with email (name, email, phone with reassurance, live password meter)
// ═══════════════════════════════════════════════════════════════════════════════
let authScreen = 'signin'; // 'signin' | 'signup' | 'google_complete' | 'verify_email' | 'forgot'
let signupMethod = 'email'; // 'email' | 'google'
let googleSignupProfile = null;
let prefillSignInEmail = '';
let pendingVerificationEmail = '';
let signupResumeFile = null;
let verifyResendTimer = null;
let verifyResendSeconds = 0;

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function shakeSheet() {
  const sheet = document.getElementById('signup-sheet') || document.getElementById('gc-sheet');
  if (!sheet) return;
  sheet.classList.remove('sheet-shake');
  void sheet.offsetWidth; // trigger reflow
  sheet.classList.add('sheet-shake');
}

function startResendTimer() {
  if (verifyResendTimer) clearInterval(verifyResendTimer);
  verifyResendSeconds = 30;
  verifyResendTimer = setInterval(() => {
    verifyResendSeconds--;
    const btn = document.getElementById('inbox-resend-btn');
    if (btn) {
      if (verifyResendSeconds > 0) {
        btn.disabled = true;
        btn.textContent = `Resend email (${verifyResendSeconds}s)`;
      } else {
        btn.disabled = false;
        btn.textContent = 'Resend verification email';
      }
    }
    if (verifyResendSeconds <= 0) {
      clearInterval(verifyResendTimer);
      verifyResendTimer = null;
    }
  }, 1000);
}

function renderAuth(app) {
  app.innerHTML = `<div class="auth-overlay" id="auth-overlay"></div>`;
  renderAuthScreen();
}

function renderAuthScreen() {
  const overlay = document.getElementById('auth-overlay');
  if (!overlay) return;
  if (authScreen === 'signin')          overlay.innerHTML = signInHTML();
  else if (authScreen === 'signup')     overlay.innerHTML = signUpHTML();
  else if (authScreen === 'google_complete') overlay.innerHTML = googleCompleteHTML();
  else if (authScreen === 'verify_email') overlay.innerHTML = verifyEmailHTML();
  else if (authScreen === 'forgot')     overlay.innerHTML = forgotHTML();
  attachAuthEvents();
}

function signInHTML() {
  const emailValue = prefillSignInEmail || '';
  // reset prefill after placing
  prefillSignInEmail = '';
  return `<div class="auth-card">
    <div class="auth-title">HireTrainers</div>
    <div class="auth-sub">Welcome back! Sign in to continue.</div>
    <div id="auth-msg"></div>
    <div class="auth-field">
      <label class="auth-label" for="si-email">Email</label>
      <input class="input" type="email" id="si-email" value="${escHtml(emailValue)}" placeholder="you@example.com" autocomplete="email">
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
    <button class="door-google-btn" id="si-google-btn" type="button" style="border: 1px solid var(--border); box-shadow: none;">
      ${ICONS.google}
      <span>Continue with Google</span>
    </button>

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
  return `<div class="signup-shell">
    <div class="signup-hero">
      <div class="signup-hero-badge">HIRETRAINERS</div>
      <h1 class="signup-hero-title">Where trainers find their next match</h1>
      <p class="signup-hero-sub">Create your account to discover roles and connect directly.</p>
    </div>

    <div class="signup-sheet" id="signup-sheet">
      <!-- Door 1: The big obvious door -->
      <button class="door-google-btn stagger-1" id="door-google-btn" type="button">
        ${ICONS.google}
        <span>Continue with Google</span>
      </button>

      <div class="door-divider stagger-2">
        <span>or sign up with email</span>
      </div>

      <div id="auth-msg"></div>

      <!-- Door 2: Email sign up fields -->
      <form id="signup-form" onsubmit="return false;" novalidate>
        <!-- Field 1: Name -->
        <div class="auth-field stagger-3">
          <label class="auth-label" for="su-name">Full name <span class="field-required">*</span></label>
          <input class="input signup-input" type="text" id="su-name" placeholder="e.g. Priya Sharma" autocomplete="name" required>
        </div>

        <!-- Field 2: Email / Gmail -->
        <div class="auth-field stagger-3">
          <label class="auth-label" for="su-email">Email / Gmail <span class="field-required">*</span></label>
          <input class="input signup-input" type="email" id="su-email" placeholder="priya@example.com" autocomplete="email" required>
        </div>

        <!-- Field 3: Phone (Indian mobile 10-digits) -->
        <div class="auth-field stagger-4">
          <label class="auth-label" for="su-phone">Mobile number <span class="field-required">*</span></label>
          <input class="input signup-input" type="tel" id="su-phone" placeholder="+91 98765 43210" autocomplete="tel" inputmode="tel" required>
          <div class="reassurance-row">
            ${ICONS.shield}
            <span>Only you see your phone number. Other users never do.</span>
          </div>
        </div>

        <!-- Field 4: Password with eye toggle, live meter & checklist -->
        <div class="auth-field stagger-4">
          <label class="auth-label" for="su-pass">Create password <span class="field-required">*</span></label>
          <div class="auth-input-wrap">
            <input class="input signup-input" type="password" id="su-pass" placeholder="At least 8 characters" autocomplete="new-password" required>
            <button class="auth-toggle" id="su-toggle" type="button" aria-label="Show or hide password">${ICONS.eye}</button>
          </div>
          
          <!-- Live strength meter -->
          <div class="pw-meter-bars" id="pw-meter-bars" style="margin-top:8px;">
            <div class="pw-bar" id="pw-bar-1"></div>
            <div class="pw-bar" id="pw-bar-2"></div>
            <div class="pw-bar" id="pw-bar-3"></div>
            <span class="pw-meter-label" id="pw-meter-label"></span>
          </div>

          <!-- Live checklist -->
          <div class="pw-checklist">
            <div class="pw-check-item" id="chk-len">${ICONS.x} <span>At least 8 characters</span></div>
            <div class="pw-check-item" id="chk-letter">${ICONS.x} <span>Contains a letter</span></div>
            <div class="pw-check-item" id="chk-number">${ICONS.x} <span>Contains a number</span></div>
          </div>
        </div>

        <!-- Optional Collapsible Section: Aadhaar & Resume -->
        <div class="optional-section stagger-5" id="optional-section">
          <button type="button" class="optional-toggle-btn" id="su-optional-toggle" aria-expanded="false">
            <span>Add later (optional)</span>
            ${ICONS.chevronDown}
          </button>
          <div class="optional-body" id="su-optional-body" style="display:none;">
            <!-- Aadhaar Doorway -->
            <div style="margin-bottom:16px;">
              <label class="auth-label">Aadhaar identity</label>
              <button type="button" class="aadhaar-btn" disabled>
                <div class="aadhaar-btn-title">
                  <span>Verify with Aadhaar</span>
                  <span class="aadhaar-pill">Coming soon</span>
                </div>
                <div class="aadhaar-btn-sub">Aadhaar verification will be powered securely by DigiLocker. You will never need to enter your Aadhaar number here.</div>
              </button>
            </div>

            <!-- Resume Dropzone -->
            <div>
              <label class="auth-label">Resume / CV</label>
              <div class="resume-drop-area" id="su-dropzone">
                <input type="file" id="su-resume-input" class="sr-only" accept=".pdf,.doc,.docx">
                <div id="su-dropzone-empty" style="${signupResumeFile ? 'display:none;' : ''}">
                  <div class="resume-drop-icon">${ICONS.paperclip}</div>
                  <div class="resume-drop-title">Drop your resume here or <span class="resume-browse-link">browse</span></div>
                  <div class="resume-drop-hint">PDF, DOC or DOCX, up to 10 MB</div>
                </div>
                <div id="su-dropzone-filled" style="${signupResumeFile ? 'display:flex;' : 'display:none;'} align-items:center; justify-content:center; width:100%;">
                  <div class="resume-file-chip">
                    ${ICONS.paperclip}
                    <span class="resume-file-name" id="su-file-name">${signupResumeFile ? escHtml(signupResumeFile.name) : ''}</span>
                    <span class="resume-file-size" id="su-file-size">${signupResumeFile ? formatFileSize(signupResumeFile.size) : ''}</span>
                    <button type="button" class="resume-remove-btn" id="su-file-remove" aria-label="Remove resume">✕</button>
                  </div>
                </div>
              </div>
              <div style="font-size:11px; color:var(--muted); margin-top:6px; display:flex; align-items:center; gap:4px;">
                ${ICONS.check} Saved to your Drive after sign-up
              </div>
            </div>
          </div>
        </div>

        <!-- Primary Action: Solid Green #16A34A -->
        <button class="btn btn-green w-full stagger-5" id="su-btn" style="margin-top:20px;">Create account</button>
      </form>

      <div class="signup-legal">
        By creating an account, you agree to HireTrainers'<br>
        <a href="#" onclick="return false;">Terms of Service</a> and <a href="#" onclick="return false;">Privacy Policy</a>.
      </div>

      <div class="signup-footer-signin">
        Already have an account? <a href="#" id="go-signin-link">Sign in</a>
      </div>
    </div>
  </div>`;
}

function googleCompleteHTML() {
  const profile = googleSignupProfile || {
    name: '',
    email: '',
    photo: ''
  };

  return `<div class="signup-shell">
    <div class="signup-hero">
      <div class="signup-hero-badge">HIRETRAINERS</div>
      <h1 class="signup-hero-title">Almost there!</h1>
      <p class="signup-hero-sub">Complete your profile to start connecting.</p>
    </div>

    <div class="signup-sheet" id="gc-sheet">
      <div class="google-profile-header">
        <img class="google-avatar-img" src="${profile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}" alt="Google Avatar">
        <div class="google-profile-meta">
          <div class="google-profile-name">${escHtml(profile.name)}</div>
          <div class="google-profile-email">${escHtml(profile.email)} <span class="google-badge-connected">Google connected</span></div>
        </div>
      </div>

      <div id="auth-msg"></div>

      <form id="gc-form" onsubmit="return false;" novalidate>
        <!-- Field 1: Name (editable) -->
        <div class="auth-field">
          <label class="auth-label" for="gc-name">Full name <span class="field-required">*</span></label>
          <input class="input signup-input" type="text" id="gc-name" value="${escHtml(profile.name)}" autocomplete="name" required>
        </div>

        <!-- Field 2: Email (locked) -->
        <div class="auth-field">
          <label class="auth-label" for="gc-email">Email / Gmail <span class="field-required">*</span></label>
          <input class="input signup-input" type="email" id="gc-email" value="${escHtml(profile.email)}" readonly style="opacity:0.75; cursor:not-allowed;">
        </div>

        <!-- Field 3: Phone (Indian mobile 10-digits, required missing field) -->
        <div class="auth-field">
          <label class="auth-label" for="gc-phone">Mobile number <span class="field-required">*</span></label>
          <input class="input signup-input" type="tel" id="gc-phone" placeholder="+91 98765 43210" autocomplete="tel" inputmode="tel" required autofocus>
          <div class="reassurance-row">
            ${ICONS.shield}
            <span>Only you see your phone number. Other users never do.</span>
          </div>
        </div>

        <!-- Optional Collapsible Section: Aadhaar & Resume -->
        <div class="optional-section" id="gc-optional-section">
          <button type="button" class="optional-toggle-btn" id="gc-optional-toggle" aria-expanded="false">
            <span>Add later (optional)</span>
            ${ICONS.chevronDown}
          </button>
          <div class="optional-body" id="gc-optional-body" style="display:none;">
            <!-- Aadhaar Doorway -->
            <div style="margin-bottom:16px;">
              <label class="auth-label">Aadhaar identity</label>
              <button type="button" class="aadhaar-btn" disabled>
                <div class="aadhaar-btn-title">
                  <span>Verify with Aadhaar</span>
                  <span class="aadhaar-pill">Coming soon</span>
                </div>
                <div class="aadhaar-btn-sub">Aadhaar verification will be powered securely by DigiLocker. You will never need to enter your Aadhaar number here.</div>
              </button>
            </div>

            <!-- Resume Dropzone -->
            <div>
              <label class="auth-label">Resume / CV</label>
              <div class="resume-drop-area" id="gc-dropzone">
                <input type="file" id="gc-resume-input" class="sr-only" accept=".pdf,.doc,.docx">
                <div id="gc-dropzone-empty" style="${signupResumeFile ? 'display:none;' : ''}">
                  <div class="resume-drop-icon">${ICONS.paperclip}</div>
                  <div class="resume-drop-title">Drop your resume here or <span class="resume-browse-link">browse</span></div>
                  <div class="resume-drop-hint">PDF, DOC or DOCX, up to 10 MB</div>
                </div>
                <div id="gc-dropzone-filled" style="${signupResumeFile ? 'display:flex;' : 'display:none;'} align-items:center; justify-content:center; width:100%;">
                  <div class="resume-file-chip">
                    ${ICONS.paperclip}
                    <span class="resume-file-name" id="gc-file-name">${signupResumeFile ? escHtml(signupResumeFile.name) : ''}</span>
                    <span class="resume-file-size" id="gc-file-size">${signupResumeFile ? formatFileSize(signupResumeFile.size) : ''}</span>
                    <button type="button" class="resume-remove-btn" id="gc-file-remove" aria-label="Remove resume">✕</button>
                  </div>
                </div>
              </div>
              <div style="font-size:11px; color:var(--muted); margin-top:6px; display:flex; align-items:center; gap:4px;">
                ${ICONS.check} Saved to your Drive after sign-up
              </div>
            </div>
          </div>
        </div>

        <!-- Primary Action: Solid Green #16A34A -->
        <button class="btn btn-green w-full" id="gc-finish-btn" style="margin-top:20px;">Finish</button>
      </form>

      <div class="signup-footer-signin">
        <a href="#" id="gc-cancel-link" style="color:var(--muted); font-weight:normal;">Cancel and return to sign up</a>
      </div>
    </div>
  </div>`;
}

function verifyEmailHTML() {
  return `<div class="signup-shell" style="justify-content:center;">
    <div class="inbox-card">
      <div class="inbox-icon-wrap">
        ${ICONS.mail}
      </div>
      <h2 class="inbox-title">Check your inbox</h2>
      <p class="inbox-sub">
        We sent a verification link to<br>
        <strong>${escHtml(pendingVerificationEmail || 'your email')}</strong>
      </p>
      
      <div class="inbox-actions">
        <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" class="btn btn-green w-full" style="text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px;">
          ${ICONS.google}
          <span>Open Gmail</span>
        </a>

        <button type="button" class="btn btn-ghost w-full" id="inbox-resend-btn" ${verifyResendSeconds > 0 ? 'disabled' : ''}>
          ${verifyResendSeconds > 0 ? `Resend email (${verifyResendSeconds}s)` : 'Resend verification email'}
        </button>

        <button type="button" class="btn btn-primary w-full" id="inbox-continue-btn" style="margin-top:6px;">
          Continue to Groups
        </button>
      </div>

      <div class="inbox-cooldown-text">
        Browsing is free. You can explore opportunities right away while your email is being verified.
      </div>
    </div>
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

function updatePasswordStrengthUI(val) {
  const res = evaluatePassword(val);
  const bar1 = document.getElementById('pw-bar-1');
  const bar2 = document.getElementById('pw-bar-2');
  const bar3 = document.getElementById('pw-bar-3');
  const lbl = document.getElementById('pw-meter-label');

  if (bar1 && bar2 && bar3 && lbl) {
    bar1.className = 'pw-bar';
    bar2.className = 'pw-bar';
    bar3.className = 'pw-bar';

    if (res.label === 'weak') {
      bar1.classList.add('weak');
      lbl.textContent = 'Weak';
      lbl.style.color = '#EF4444';
    } else if (res.label === 'okay') {
      bar1.classList.add('okay');
      bar2.classList.add('okay');
      lbl.textContent = 'Okay';
      lbl.style.color = '#F59E0B';
    } else if (res.label === 'strong') {
      bar1.classList.add('strong');
      bar2.classList.add('strong');
      bar3.classList.add('strong');
      lbl.textContent = 'Strong';
      lbl.style.color = '#10B981';
    } else {
      lbl.textContent = '';
    }
  }

  // Live checklist update
  const updateItem = (id, ok) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'pw-check-item' + (ok ? ' ok' : '');
    const span = el.querySelector('span');
    const text = span ? span.textContent : el.textContent;
    el.innerHTML = (ok ? ICONS.check : ICONS.x) + ` <span>${text}</span>`;
  };

  updateItem('chk-len', res.len);
  updateItem('chk-letter', res.letter);
  updateItem('chk-number', res.number);
}

function setupResumeDropzone(prefix) {
  const dropArea = document.getElementById(`${prefix}-dropzone`);
  const fileInput = document.getElementById(`${prefix}-resume-input`);
  const removeBtn = document.getElementById(`${prefix}-file-remove`);
  const emptyWrap = document.getElementById(`${prefix}-dropzone-empty`);
  const filledWrap = document.getElementById(`${prefix}-dropzone-filled`);
  const nameEl = document.getElementById(`${prefix}-file-name`);
  const sizeEl = document.getElementById(`${prefix}-file-size`);

  if (!dropArea || !fileInput) return;

  const handleFile = file => {
    if (!file) return;
    if (file.size > UPLOAD_MAX_BYTES) {
      toast('File size exceeds the 10 MB limit', 'error');
      return;
    }
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      toast('Please upload a PDF, DOC, or DOCX document', 'error');
      return;
    }
    signupResumeFile = { name: file.name, size: file.size, type: file.type };
    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatFileSize(file.size);
    if (emptyWrap) emptyWrap.style.display = 'none';
    if (filledWrap) filledWrap.style.display = 'flex';
    toast(`Attached ${file.name}`, 'info');
  };

  dropArea.addEventListener('click', e => {
    if (e.target.closest('.resume-remove-btn')) return;
    fileInput.click();
  });

  fileInput.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  });

  dropArea.addEventListener('dragover', e => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });

  dropArea.addEventListener('dragleave', e => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
  });

  dropArea.addEventListener('drop', e => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  removeBtn?.addEventListener('click', e => {
    e.stopPropagation();
    signupResumeFile = null;
    fileInput.value = '';
    if (emptyWrap) emptyWrap.style.display = 'block';
    if (filledWrap) filledWrap.style.display = 'none';
  });
}

function handleGoogleDoor() {
  showMsg('auth-msg', 'Sign-in is not connected yet.');
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

  document.getElementById('go-signup')?.addEventListener('click', e => {
    e.preventDefault();
    signupMethod = 'email';
    googleSignupProfile = null;
    signupResumeFile = null;
    authScreen = 'signup';
    renderAuthScreen();
  });

  const returnToSignIn = e => {
    e.preventDefault();
    signupMethod = 'email';
    googleSignupProfile = null;
    signupResumeFile = null;
    authScreen = 'signin';
    renderAuthScreen();
  };
  document.getElementById('go-signin')?.addEventListener('click', returnToSignIn);
  document.getElementById('go-signin-link')?.addEventListener('click', returnToSignIn);
  document.getElementById('go-signin2')?.addEventListener('click', returnToSignIn);
  document.getElementById('gc-cancel-link')?.addEventListener('click', e => {
    e.preventDefault();
    authScreen = 'signup';
    renderAuthScreen();
  });

  document.getElementById('go-forgot')?.addEventListener('click', e => {
    e.preventDefault();
    authScreen = 'forgot';
    renderAuthScreen();
  });

  document.getElementById('reset-link')?.addEventListener('click', resetDemo);

  // Prototype Quick Fill Buttons
  document.getElementById('qa-user')?.addEventListener('click', () => {
    showMsg('auth-msg', 'Sign-in is not connected yet.');
  });
  document.getElementById('qa-admin')?.addEventListener('click', () => {
    showMsg('auth-msg', 'Sign-in is not connected yet.');
  });
  document.getElementById('qa-super')?.addEventListener('click', () => {
    showMsg('auth-msg', 'Sign-in is not connected yet.');
  });

  // Google door triggers
  document.getElementById('si-google-btn')?.addEventListener('click', handleGoogleDoor);
  document.getElementById('door-google-btn')?.addEventListener('click', handleGoogleDoor);

  // Password live meter & checklist
  document.getElementById('su-pass')?.addEventListener('input', e => {
    updatePasswordStrengthUI(e.target.value);
  });

  // Collapsible Optional Section Toggles
  const bindCollapsible = (toggleId, bodyId) => {
    const toggle = document.getElementById(toggleId);
    const body = document.getElementById(bodyId);
    if (!toggle || !body) return;
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      body.style.display = isExpanded ? 'none' : 'block';
      const chevron = toggle.querySelector('svg');
      if (chevron) {
        chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        chevron.style.transition = 'transform 200ms ease';
      }
    });
  };
  bindCollapsible('su-optional-toggle', 'su-optional-body');
  bindCollapsible('gc-optional-toggle', 'gc-optional-body');

  // Resume dropzones
  setupResumeDropzone('su');
  setupResumeDropzone('gc');

  // Submit Buttons
  document.getElementById('si-btn')?.addEventListener('click', doSignIn);
  document.getElementById('si-email')?.addEventListener('keydown', e => e.key === 'Enter' && doSignIn());
  document.getElementById('si-pass')?.addEventListener('keydown', e => e.key === 'Enter' && doSignIn());

  document.getElementById('su-btn')?.addEventListener('click', doSignUp);
  document.getElementById('gc-finish-btn')?.addEventListener('click', doGoogleFinish);
  document.getElementById('fp-btn')?.addEventListener('click', doForgot);

  // Check your inbox buttons
  document.getElementById('inbox-resend-btn')?.addEventListener('click', doInboxResend);
  document.getElementById('inbox-continue-btn')?.addEventListener('click', doInboxContinue);
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
  const btn = document.getElementById('si-btn');
  setLoading(btn, true, 'Sign in');
  await fakeDelay(250);
  setLoading(btn, false, 'Sign in');
  showMsg('auth-msg', 'Sign-in is not connected yet.');
}

async function doSignUp() {
  const name  = document.getElementById('su-name')?.value.trim();
  const email = document.getElementById('su-email')?.value.trim();
  const phone = document.getElementById('su-phone')?.value.trim();
  const pass  = document.getElementById('su-pass')?.value || '';

  if (!name) {
    showMsg('auth-msg', 'Full name is required');
    shakeSheet();
    document.getElementById('su-name')?.focus();
    return;
  }
  if (!email) {
    showMsg('auth-msg', 'Email address is required');
    shakeSheet();
    document.getElementById('su-email')?.focus();
    return;
  }
  if (!validateEmail(email)) {
    showMsg('auth-msg', 'Please enter a valid email address');
    shakeSheet();
    document.getElementById('su-email')?.focus();
    return;
  }
  if (!phone) {
    showMsg('auth-msg', 'Mobile number is required');
    shakeSheet();
    document.getElementById('su-phone')?.focus();
    return;
  }
  if (!isValidIndianPhone(phone)) {
    showMsg('auth-msg', 'Please enter a valid 10-digit Indian mobile number');
    shakeSheet();
    document.getElementById('su-phone')?.focus();
    return;
  }
  if (!pass) {
    showMsg('auth-msg', 'Password is required');
    shakeSheet();
    document.getElementById('su-pass')?.focus();
    return;
  }

  const evalPw = evaluatePassword(pass);
  if (!evalPw.len || !evalPw.letter || !evalPw.number) {
    showMsg('auth-msg', 'Please meet all password requirements');
    shakeSheet();
    document.getElementById('su-pass')?.focus();
    return;
  }

  // Duplicate email check
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    const msgEl = document.getElementById('auth-msg');
    if (msgEl) {
      msgEl.innerHTML = `
        <div class="auth-error" style="display:flex; flex-direction:column; gap:6px;">
          <span>Looks like you already have an account with <strong>${escHtml(email)}</strong>.</span>
          <a href="#" id="err-signin-link" style="color:inherit; font-weight:700; text-decoration:underline;">Sign in instead &rarr;</a>
        </div>
      `;
      document.getElementById('err-signin-link')?.addEventListener('click', e => {
        e.preventDefault();
        prefillSignInEmail = email;
        authScreen = 'signin';
        renderAuthScreen();
      });
    }
    shakeSheet();
    return;
  }

  const btn = document.getElementById('su-btn');
  setLoading(btn, true, 'Create account');
  await fakeDelay(450);

  const newUser = {
    id: uid(),
    handle: 'user-' + Math.floor(1000 + Math.random() * 9000),
    displayName: name,
    email: email.toLowerCase(),
    passwordHash: pass,
    authProvider: 'password',
    phone: normalizeIndianPhone(phone),
    coins: COIN_NEW_USER,
    verified: false,
    role: 'user',
    photo: null,
    createdAt: Date.now()
  };

  STATE.users.push(newUser);
  if (signupResumeFile) {
    if (!STATE.driveFiles) STATE.driveFiles = [];
    STATE.driveFiles.push({
      id: uid(),
      ownerId: newUser.id,
      name: signupResumeFile.name,
      size: signupResumeFile.size,
      createdAt: Date.now(),
      hidden: false
    });
    signupResumeFile = null;
  }
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

  // Real accounts will come from Firebase later - do not sign in
  currentUserId = null;

  setLoading(btn, false, 'Create account');

  // Go to "Check your inbox" screen
  pendingVerificationEmail = email;
  startResendTimer();
  authScreen = 'verify_email';
  renderAuthScreen();
}

async function doGoogleFinish() {
  const name  = document.getElementById('gc-name')?.value.trim();
  const phone = document.getElementById('gc-phone')?.value.trim();
  const email = googleSignupProfile?.email || '';

  if (!name) {
    showMsg('auth-msg', 'Please enter your name');
    shakeSheet();
    return;
  }
  if (!phone) {
    showMsg('auth-msg', 'Please enter your mobile number');
    shakeSheet();
    return;
  }
  if (!isValidIndianPhone(phone)) {
    showMsg('auth-msg', 'Please enter a valid 10-digit Indian mobile number');
    shakeSheet();
    return;
  }

  const btn = document.getElementById('gc-finish-btn');
  setLoading(btn, true, 'Finish');
  await fakeDelay(350);

  let user = getUserByEmail(email);
  if (!user) {
    user = {
      id: uid(),
      handle: 'user-' + Math.floor(1000 + Math.random() * 9000),
      displayName: name,
      email: email.toLowerCase(),
      passwordHash: null,
      authProvider: 'google',
      phone: normalizeIndianPhone(phone),
      coins: COIN_NEW_USER,
      verified: true,
      role: 'user',
      photo: googleSignupProfile?.photo || null,
      createdAt: Date.now()
    };
    STATE.users.push(user);
    if (!STATE.ledger) STATE.ledger = [];
    STATE.ledger.push({
      id: uid(),
      userId: user.id,
      type: 'bonus',
      amount: COIN_NEW_USER,
      note: 'Welcome bonus',
      at: Date.now()
    });
  } else {
    user.displayName = name;
    user.phone = normalizeIndianPhone(phone);
    if (googleSignupProfile?.photo) user.photo = googleSignupProfile.photo;
  }

  if (signupResumeFile) {
    if (!STATE.driveFiles) STATE.driveFiles = [];
    STATE.driveFiles.push({
      id: uid(),
      ownerId: user.id,
      name: signupResumeFile.name,
      size: signupResumeFile.size,
      createdAt: Date.now(),
      hidden: false
    });
    signupResumeFile = null;
  }

  currentUserId = null;
  setLoading(btn, false, 'Finish');
  authScreen = 'signin';
  renderAuthScreen();
  showMsg('auth-msg', 'Sign-in is not connected yet.');
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

function doInboxResend() {
  if (verifyResendSeconds > 0) return;
  startResendTimer();
  toast('Verification email resent! Check your inbox.', 'info');
}

function doInboxContinue() {
  if (verifyResendTimer) {
    clearInterval(verifyResendTimer);
    verifyResendTimer = null;
  }
  authScreen = 'signin';
  renderAuthScreen();
  showMsg('auth-msg', 'Sign-in is not connected yet.');
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
      <!-- Tab 1: Groups (Mobile & Desktop) -->
      <button class="rail-btn ${currentView === 'groups' ? 'active' : ''}" data-view="groups" aria-label="Groups">
        ${ICONS.users}
        <span class="rail-label">Groups</span>
      </button>

      <!-- Tab 2: Jobs (Mobile & Desktop) -->
      <button class="rail-btn ${currentView === 'jobs' || currentView === 'postings' || currentView === 'applications' ? 'active' : ''}" data-view="jobs" aria-label="Jobs">
        ${ICONS.briefcase}
        <span class="rail-label">Jobs</span>
      </button>

      <!-- Tab 3: Trainings (Mobile & Desktop) -->
      <button class="rail-btn ${currentView === 'trainings' ? 'active' : ''}" data-view="trainings" aria-label="Trainings">
        ${ICONS.presentation}
        <span class="rail-label">Trainings</span>
      </button>

      <!-- Tab 4: My Learning (Mobile & Desktop) -->
      <button class="rail-btn ${currentView === 'learning' ? 'active' : ''}" data-view="learning" aria-label="My Learning">
        ${ICONS.book}
        <span class="rail-label">My Learning</span>
      </button>

      <!-- Desktop-only flat navigation items -->
      <button class="rail-btn rail-desktop-only ${currentView === 'drive' ? 'active' : ''}" data-view="drive" aria-label="Drive">
        ${ICONS.folder}
        <span class="rail-label">Drive</span>
      </button>

      ${userIsAdmin ? `
      <button class="rail-btn rail-desktop-only ${currentView === 'staff' ? 'active' : ''}" data-view="staff" aria-label="Staff tools">
        ${ICONS.shield}
        <span class="rail-label">Staff</span>
      </button>` : ''}

      <div class="rail-spacer"></div>

      <!-- Tab 5: Me (Mobile bottom bar has Me, Desktop has Profile/Me) -->
      <button class="rail-btn ${currentView === 'me' || currentView === 'profile' ? 'active' : ''}" data-view="me" aria-label="Me">
        ${ICONS.user}
        <span class="rail-label">Me</span>
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
      const targetView = btn.dataset.view;
      if (targetView === 'trainings') {
        selectedTrainingId = null;
      }
      if (targetView === 'jobs') {
        selectedJobId = null;
        selectedAppId = null;
        selectedPostingId = null;
      }
      if (targetView === 'groups') {
        selectedGroupId = null;
      }
      navigateTo('#/' + targetView);
    });
  });

  renderUserAppView();
}

function renderUserAppView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  renderScreenSafely(main, currentView, () => {
    if (currentView === 'groups')            renderGroupsView(main);
    else if (currentView === 'jobs')         renderJobsContainerView(main);
    else if (currentView === 'postings')     { jobsSegment = 'posted'; renderJobsContainerView(main); }
    else if (currentView === 'applications') { jobsSegment = 'applied'; renderJobsContainerView(main); }
    else if (currentView === 'trainings')    renderTrainingsOrDetailView(main);
    else if (currentView === 'learning')     renderMyLearningView(main);
    else if (currentView === 'me' || currentView === 'profile') renderMeView(main);
    else if (currentView === 'drive')        renderDriveView(main);
    else if (currentView === 'staff')        renderAdminStaffView(main);
    else if (currentView === 'chat')         renderChatView(main);
    else if (currentView === 'kyc')          renderKycView(main);
    else if (currentView === 'post_training') renderPostTrainingView(main);
    else renderGroupsView(main);
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// SUPER-ADMIN'S STAFF APP ONLY (SECTION 3)
// No user features at all: no wallet, no coin chip, no "buy coins", no Apply,
// no My postings, no My applications, no Drive, no KYC, no bell, no profile photo.
// ═══════════════════════════════════════════════════════════════════════════════

function renderSuperAdminApp(app) {
  const user = me();
  if (!user) { renderAuth(app); return; }

  // Valid views for super-admin: overview | groups | jobs | trainings | audit | users | roles | coins | me | profile | post_training
  if (!['overview', 'groups', 'jobs', 'trainings', 'audit', 'users', 'roles', 'coins', 'me', 'profile', 'post_training'].includes(staffSubTab)) {
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
      <!-- Mobile has exactly 5 tabs: Overview | Groups | Jobs | Trainings | Me -->
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
      <button class="rail-btn ${staffSubTab === 'trainings' ? 'active' : ''}" data-staff-view="trainings" aria-label="Trainings">
        ${ICONS.presentation}
        <span class="rail-label">Trainings</span>
      </button>

      <!-- Desktop-only extra staff sub-items -->
      <button class="rail-btn rail-desktop-only ${staffSubTab === 'audit' ? 'active' : ''}" data-staff-view="audit" aria-label="Audit log">
        ${ICONS.log}
        <span class="rail-label">Audit</span>
      </button>
      <button class="rail-btn rail-desktop-only ${staffSubTab === 'users' ? 'active' : ''}" data-staff-view="users" aria-label="Users">
        ${ICONS.user}
        <span class="rail-label">Users</span>
      </button>
      <button class="rail-btn rail-desktop-only ${staffSubTab === 'roles' ? 'active' : ''}" data-staff-view="roles" aria-label="Roles">
        ${ICONS.shield}
        <span class="rail-label">Roles</span>
      </button>
      <button class="rail-btn rail-desktop-only ${staffSubTab === 'coins' ? 'active' : ''}" data-staff-view="coins" aria-label="Coins">
        ${ICONS.coin}
        <span class="rail-label">Coins</span>
      </button>

      <div class="rail-spacer"></div>

      <!-- Tab 5: Me (Mobile bottom bar has Me, Desktop has Profile/Me) -->
      <button class="rail-btn ${staffSubTab === 'me' || staffSubTab === 'profile' ? 'active' : ''}" data-staff-view="me" aria-label="Me">
        ${ICONS.user}
        <span class="rail-label">Me</span>
      </button>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content" id="main-content"></main>
  </div>

  <div class="toast-container" id="toast-container"></div>`;

  // Attach Top Bar Events
  document.getElementById('topbar-theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('superadmin-topbar-signout')?.addEventListener('click', doSignOut);

  // Attach Rail Nav Events
  app.querySelectorAll('.rail-btn[data-staff-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.staffView;
      staffSubTab = targetView;
      if (targetView === 'trainings') {
        selectedTrainingId = null;
      }
      if (targetView === 'jobs') {
        staffSelectedJobId = null;
      }
      if (targetView === 'groups') {
        staffSelectedGroupId = null;
      }
      navigateTo('#/' + targetView);
    });
  });

  renderSuperAdminView();
}

function renderSuperAdminView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  renderScreenSafely(main, `SuperAdmin:${staffSubTab}`, () => {
    if (staffSubTab === 'overview')          renderStaffOverviewView(main);
    else if (staffSubTab === 'groups')      renderStaffGroupsView(main);
    else if (staffSubTab === 'jobs')        renderStaffJobsView(main);
    else if (staffSubTab === 'trainings')   renderTrainingsOrDetailView(main);
    else if (staffSubTab === 'audit')       renderStaffAuditView(main);
    else if (staffSubTab === 'users')       renderSuperAdminUsersView(main);
    else if (staffSubTab === 'roles')       renderSuperAdminRolesView(main);
    else if (staffSubTab === 'coins')       renderSuperAdminCoinsView(main);
    else if (staffSubTab === 'me' || staffSubTab === 'profile') renderSuperAdminMeView(main);
    else if (staffSubTab === 'post_training') renderPostTrainingView(main);
    else renderStaffOverviewView(main);
  });
}


function doSignOut() {
  currentUserId = null;
  selectedTrainingId = null;
  saveSelf();
  authScreen = 'signin';
  if (window.location.hash !== '#/auth/signin') {
    navigateTo('#/auth/signin');
  } else {
    render();
  }
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
    const canApply = !isMine && hasAvailableSlot(j);
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
          ` : canApply ? `
            <a href="#" class="bubble-footer-link apply-link" data-jid="${j.id}">${ICONS.paperclip} Attach resume to apply</a>
          ` : `
            <span class="text-xs text-muted">${j.closed ? 'Applications closed' : 'Currently filled — may reopen'}</span>
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
      <a href="#" id="composer-form-link" class="link-utility">Use the form instead</a>
      <span class="text-muted text-xs">Cost: 1 coin</span>
    </div>
  </div>`;

  const feedEl = document.getElementById('group-feed-container');
  if (feedEl) feedEl.scrollTop = feedEl.scrollHeight;

  document.getElementById('group-feed-back')?.addEventListener('click', () => {
    selectedGroupId = null;
    pane.classList.remove('open');
    document.querySelectorAll('#groups-detail-pane').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.list-row.selected').forEach(r => r.classList.remove('selected'));
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
function createJobPost(jobData, options = {}) {
  const user = me();
  if (!user) return;

  if (!user.verified && !options.skipKyc) {
    if (queueKycAction(user.id, 'post', jobData)) {
      currentView = 'kyc';
      render();
    }
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

  if (!options.deferRender) render();
  return newJob;
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
function applyToJob(jid, options = {}) {
  const user = me();
  if (!user) return;
  const job = (STATE.jobs || []).find(j => j.id === jid);
  if (!job) return;

  if (!user.verified && !options.skipKyc) {
    if (queueKycAction(user.id, 'apply', { jobId: jid })) {
      currentView = 'kyc';
      render();
    }
    return;
  }

  if (job.posterId === user.id) {
    toast("You cannot apply to your own posting.", 'error');
    return;
  }

  if (!hasAvailableSlot(job)) {
    toast(job.closed ? 'Applications are closed for this job.' : 'All positions are currently filled. This job may reopen if someone withdraws.', 'primary');
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
      ? '<option value="">No resume in Drive — add one with +</option>'
      : '<option value="">Select a resume from Drive…</option>' + driveFiles.map(f => `<option value="${f.id}">${escHtml(f.name)} (${fmtFileSize(f.size)})</option>`).join('');

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
        <div style="font-size:11px;color:var(--muted);margin-top:8px">A resume is required. Applying is free of cost.</div>`,
      actions: [
        {
          id: 'submit',
          label: 'Submit application',
          cls: 'btn-apply',
          fn: () => {
            const fileId = document.getElementById('apply-file-select')?.value || null;
            const selectedFile = fileId && (STATE.driveFiles || []).find(file =>
              file.id === fileId && file.ownerId === user.id && !file.hidden
            );
            if (!selectedFile) {
              toast('A resume is required to apply.', 'error');
              return;
            }
            if (!hasAvailableSlot(job)) {
              toast('This job is no longer available. Please check again later.', 'error');
              return;
            }
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

  // No auto-selection: show list first on mobile and empty placeholder on desktop

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
  const isAvailable = hasAvailableSlot(job);
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
      ` : !isAvailable ? `
        <span class="badge badge-neutral">${job.closed ? 'Applications closed' : 'Currently filled — may reopen'}</span>
      ` : `
        <button class="btn btn-apply" id="job-apply-now-btn" style="padding:10px 24px">Apply now</button>
      `}
    </div>
  </div>`;

  document.getElementById('job-detail-back')?.addEventListener('click', () => {
    selectedJobId = null;
    pane.classList.remove('open');
    document.querySelectorAll('#jobs-detail-pane').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.list-row.selected').forEach(r => r.classList.remove('selected'));
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

  // No auto-selection: show list first on mobile and empty placeholder on desktop

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
    selectedPostingId = null;
    pane.classList.remove('open');
    document.querySelectorAll('#postings-detail-pane').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.list-row.selected').forEach(r => r.classList.remove('selected'));
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
            removeJobWithLifecycle(job, 'Removed by the poster');
            saveState();
            toast('Job removed. Existing chats are now read-only for 90 days.', 'primary');
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

  // No auto-selection: show list first on mobile and empty placeholder on desktop

  const listRows = myApps.map(a => {
    const isSelected = (a.id === selectedAppId);
    const job = (STATE.jobs || []).find(j => j.id === a.jobId);
    const isAccepted = (a.status === 'Accepted');
    const isRejected = (a.status === REJECTED_LABEL);
    const isWithdrawn = (a.status === 'Withdrawn');

    return `
    <div class="list-row ${isSelected ? 'selected' : ''} ${(isRejected || isWithdrawn) ? 'dimmed' : ''}" data-aid="${a.id}">
      <div class="list-row-content">
        <div class="list-row-title">${escHtml(job?.title || 'Job posting')}</div>
        <div class="list-row-meta">Applied ${timeAgo(a.appliedAt)}</div>
      </div>
      <div class="list-row-right">
        <span class="badge ${isAccepted ? 'badge-green' : (isRejected || isWithdrawn) ? 'badge-bad' : 'badge-warn'}">${a.status}</span>
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
  const isWithdrawn = (app.status === 'Withdrawn');
  const canWithdraw = isUnderReview || isAccepted;

  pane.innerHTML = `
  <div class="back-btn" id="app-detail-back">${ICONS.back} Back to applications</div>
  <div class="detail-header">
    <div class="detail-title">${escHtml(job?.title || 'Job posting')}</div>
    <div class="detail-meta">Applied ${timeAgo(app.appliedAt)}</div>
  </div>

  <div class="detail-body">
    <div class="section-title">Application status</div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <span class="badge ${isAccepted ? 'badge-green' : (isRejected || isWithdrawn) ? 'badge-bad' : 'badge-warn'}" style="font-size:13px;padding:4px 12px">
        ${app.status}
      </span>
       ${canWithdraw ? `
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
    selectedAppId = null;
    pane.classList.remove('open');
    document.querySelectorAll('#app-detail-pane').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.list-row.selected').forEach(r => r.classList.remove('selected'));
  });

  document.getElementById('withdraw-app-btn')?.addEventListener('click', () => {
    showModal({
      title: 'Withdraw application',
      body: isAccepted
        ? 'Withdrawing releases your accepted slot and notifies the poster. This cannot be undone.'
        : 'Are you sure you want to withdraw this application? This cannot be undone.',
      actions: [
        {
          id: 'withdraw',
          label: 'Withdraw',
          cls: 'btn-danger',
          fn: () => {
            const wasAccepted = app.status === 'Accepted';
            app.status = 'Withdrawn';
            app.withdrawnAt = Date.now();
            app.lastActivity = Date.now();
            if (wasAccepted && job) {
              job.spotsFilled = Math.max(0, (job.spotsFilled || 0) - 1);
              job.lastActivity = Date.now();
            }
            addNotification(job?.posterId, `${me()?.handle || 'An applicant'} withdrew their application for "${job?.title || 'your job'}"${wasAccepted ? '. A slot is available again.' : '.'}`);
            finalizeHiddenFiles();
            saveState();
            toast(wasAccepted ? 'Application withdrawn. The poster was notified and a slot reopened.' : 'Application withdrawn. The poster was notified.', 'primary');
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

  const isReadOnly = (app.status === REJECTED_LABEL) || Boolean(job.chatReadOnlyAt) || Boolean(job.chatDeletedAt) || Boolean(app.chatDeletedAt);
  const chatNotice = job.chatDeletedAt || app.chatDeletedAt
    ? 'This chat was deleted after its 90-day retention period.'
    : job.chatReadOnlyAt
      ? `This job was removed. Chat is read-only and will be deleted on ${new Date(job.chatDeleteAfter).toLocaleDateString()}.`
      : `This application was ${REJECTED_LABEL.toLowerCase()}. Chat is in read-only mode.`;

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
      ${msgs.length === 0 ? `<div class="text-sm text-muted" style="text-align:center;padding:40px 0">${job.chatDeletedAt ? 'No messages are retained for this chat.' : 'No messages yet. Send a message to start!'}</div>` : msgsHtml}
    </div>

    ${isReadOnly ? `
      <div class="chat-readonly-notice">
        ${escHtml(chatNotice)}
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
  const inUse = applicationKeepsFile(fid);
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
      staffSelectedGroupId = null;
      staffSelectedJobId = null;
      renderAdminStaffView(main);
    });
  });

  renderAdminStaffSubContent();
}

function renderAdminStaffSubContent() {
  const mount = document.getElementById('admin-staff-sub-content');
  if (!mount) return;

  renderScreenSafely(mount, `AdminStaff:${staffSubTab}`, () => {
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
    } else if (staffSubTab === 'trainings') {
      renderTrainingsOrDetailView(mount);
    } else if (staffSubTab === 'audit') {
      renderStaffAuditView(mount);
    }
  });
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
    ${detailHtml || `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);padding:32px 24px;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--muted);text-align:center;min-height:220px">
      <div style="margin-bottom:12px;opacity:0.6">${ICONS.briefcase}</div>
      <div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px">No job selected</div>
      <div style="font-size:12px;max-width:280px">Select a job from the table to view details, applicant counts, and moderation actions.</div>
    </div>`}
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
          removeJobWithLifecycle(job, reason);

          audit('remove_job', `Removed job "${job.title}" (${jid}) — Reason: ${reason}`);
          saveState();
          toast('Job removed; notifications sent and chats are read-only for 90 days.', 'success');
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
      Posting jobs and applying with a resume require identity verification. Complete this mock KYC step to continue your saved action.
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
    currentView = 'groups';
    processQueuedActionsAfterVerification(user);
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


// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE MODULES: TRAININGS, MY LEARNING, JOBS SEGMENTS, ME, ENROLL FLOW
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. JOBS CONTAINER (Browse | Applied | Posted) ────────────────────────────
function renderJobsContainerView(main) {
  const user = me();
  const unreadMsgCount = (STATE.applications || [])
    .filter(a => {
      const job = (STATE.jobs || []).find(j => j.id === a.jobId);
      return job && job.posterId === user.id && !a.seenByPoster;
    }).length;
  const appliedCount = (STATE.applications || [])
    .filter(a => a.applicantId === user.id).length;

  main.innerHTML = `
    <div style="flex:1; display:flex; flex-direction:column; min-width:0; height:100%; overflow:hidden;">
      <div class="jobs-segmented-wrap">
        <div class="jobs-segmented-nav" role="tablist">
          <button class="jobs-segment-btn ${jobsSegment === 'browse' ? 'active' : ''}" data-segment="browse" role="tab" aria-selected="${jobsSegment === 'browse'}">
            Browse
          </button>
          <button class="jobs-segment-btn ${jobsSegment === 'applied' ? 'active' : ''}" data-segment="applied" role="tab" aria-selected="${jobsSegment === 'applied'}">
            Applied ${appliedCount > 0 ? `<span class="jobs-segment-badge">${appliedCount}</span>` : ''}
          </button>
          <button class="jobs-segment-btn ${jobsSegment === 'posted' ? 'active' : ''}" data-segment="posted" role="tab" aria-selected="${jobsSegment === 'posted'}">
            Posted ${unreadMsgCount > 0 ? `<span class="jobs-segment-badge">${unreadMsgCount}</span>` : ''}
          </button>
        </div>
      </div>
      <div id="jobs-segment-mount" style="flex:1; display:flex; min-height:0; overflow:hidden;"></div>
    </div>
  `;

  const mount = document.getElementById('jobs-segment-mount');
  if (jobsSegment === 'browse') renderJobsView(mount);
  else if (jobsSegment === 'applied') renderMyApplicationsView(mount);
  else if (jobsSegment === 'posted') renderMyPostingsView(mount);

  main.querySelectorAll('.jobs-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      jobsSegment = btn.dataset.segment;
      selectedJobId = null;
      selectedAppId = null;
      selectedPostingId = null;
      navigateTo('#/jobs/' + jobsSegment);
    });
  });
}

// ── 2. TRAININGS DISPATCHER ──────────────────────────────────────────────────
function renderTrainingsOrDetailView(main) {
  if (selectedTrainingId) {
    renderTrainingDescriptionView(main, selectedTrainingId);
  } else {
    renderTrainingsView(main);
  }
}

// ── 3. TRAININGS TAB (GRID, FILTERS, SEARCH, SKELETON) ────────────────────────
function renderTrainingsView(main) {
  const user = me();
  const userIsStaff = isAdmin(user) || isSuperAdmin(user);

  let allTrainings = (STATE.trainings || []).filter(t => {
    if (userIsStaff) return true; // staff sees published and hidden
    return t.status === 'published';
  });

  // Filter chips
  if (trainingsFilter === 'upcoming') {
    const now = Date.now();
    allTrainings = allTrainings.filter(t => {
      const next = getNextUpcomingSession(t);
      return next && (next.endAt || next.startAt + 2 * 3600000) > now;
    });
  } else if (trainingsFilter === 'free') {
    allTrainings = allTrainings.filter(t => t.priceInr === 0);
  } else if (trainingsFilter === 'enrolled') {
    allTrainings = allTrainings.filter(t => isEnrolled(t.id, user.id));
  }

  // Search
  if (trainingsSearch.trim()) {
    const q = trainingsSearch.trim().toLowerCase();
    allTrainings = allTrainings.filter(t => {
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchTrainer = (t.trainer?.name || '').toLowerCase().includes(q);
      const matchSkills = (t.trainer?.skills || []).some(s => s.toLowerCase().includes(q));
      return matchTitle || matchTrainer || matchSkills;
    });
  }

  main.innerHTML = `
    <div class="trainings-container">
      <!-- Top controls bar -->
      <div class="trainings-top-bar">
        <div class="trainings-search-wrap">
          ${ICONS.search}
          <input type="text" class="trainings-search-input" id="trainings-search-inp" value="${escHtml(trainingsSearch)}" placeholder="Search by title, trainer or skill...">
        </div>

        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <div class="trainings-filter-chips" role="tablist">
            <button class="training-filter-chip ${trainingsFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
            <button class="training-filter-chip ${trainingsFilter === 'upcoming' ? 'active' : ''}" data-filter="upcoming">Upcoming</button>
            <button class="training-filter-chip ${trainingsFilter === 'free' ? 'active' : ''}" data-filter="free">Free</button>
            <button class="training-filter-chip ${trainingsFilter === 'enrolled' ? 'active' : ''}" data-filter="enrolled">Enrolled</button>
          </div>

          ${userIsStaff ? `
            <button class="btn btn-primary" id="btn-create-training" style="display:inline-flex; align-items:center; gap:6px; min-height:36px; padding:6px 14px; font-size:13px;">
              ${ICONS.plus}
              <span>New training</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Training Cards Mount -->
      <div id="trainings-grid-mount"></div>
    </div>
  `;

  // Attach search event
  const searchInp = document.getElementById('trainings-search-inp');
  searchInp?.addEventListener('input', e => {
    trainingsSearch = e.target.value;
    renderTrainingsCardsOnly();
  });

  // Attach filter events
  main.querySelectorAll('.training-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      trainingsFilter = btn.dataset.filter;
      main.querySelectorAll('.training-filter-chip').forEach(b => b.classList.toggle('active', b === btn));
      renderTrainingsCardsOnly();
    });
  });

  // Create training button
  document.getElementById('btn-create-training')?.addEventListener('click', () => {
    editingTrainingId = null;
    currentView = 'post_training';
    if (isSuperAdmin(user)) staffSubTab = 'post_training';
    render();
  });

  function renderTrainingsCardsOnly() {
    const mount = document.getElementById('trainings-grid-mount');
    if (!mount) return;

    if (allTrainings.length === 0) {
      mount.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:var(--muted);">
          <div style="font-size:36px; margin-bottom:12px;">🎓</div>
          <div style="font-size:16px; font-weight:700; color:var(--text); margin-bottom:6px;">No trainings found</div>
          <div style="font-size:13px; max-width:340px; margin:0 auto 16px;">There are no online trainings matching your search or filters.</div>
          <button class="btn btn-ghost" id="clear-training-filters-btn">Clear filters</button>
        </div>
      `;
      document.getElementById('clear-training-filters-btn')?.addEventListener('click', () => {
        trainingsFilter = 'all';
        trainingsSearch = '';
        renderTrainingsView(main);
      });
      return;
    }

    mount.innerHTML = `
      <div class="trainings-grid">
        ${allTrainings.map(t => renderTrainingCardHTML(t, user)).join('')}
      </div>
    `;

    // Attach card event listeners
    mount.querySelectorAll('.btn-desc-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid = btn.dataset.id;
        navigateTo('#/trainings/' + tid);
      });
    });

    mount.querySelectorAll('.btn-enroll-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const tid = btn.dataset.id;
        startEnrollFlow(tid);
      });
    });

    // Card manage menu for staff
    mount.querySelectorAll('.card-menu-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const tid = btn.dataset.id;
        showTrainingActionMenu(tid, btn);
      });
    });
  }

  renderTrainingsCardsOnly();
}

function renderTrainingCardHTML(t, user) {
  const userIsStaff = isAdmin(user) || isSuperAdmin(user);
  const enrolled = isEnrolled(t.id, user.id);
  const isCapped = Boolean(t.seats);
  const seatsLeft = isCapped ? Math.max(0, t.seats - (t.enrolledCount || 0)) : null;
  const isSoldOut = isCapped && seatsLeft <= 0;
  const nextSession = getNextUpcomingSession(t);
  const dateStr = nextSession ? formatISTDate(nextSession.startAt) : 'Schedule TBA';

  // Trainer initials for placeholder tile
  const initials = ((t.trainer?.name || 'HT').split(' ').map(n => n[0]).join('').slice(0, 2)).toUpperCase();

  // Skills: max 6, overflow
  const skills = t.trainer?.skills || [];
  const displaySkills = skills.slice(0, 6);
  const overflowCount = skills.length - 6;

  // Price formatting
  const priceDisplay = t.priceInr === 0 ? '<span class="training-price-free">Free</span>' : '₹' + t.priceInr.toLocaleString('en-IN');

  const hasPhoto = Boolean(t.trainer?.photoUrl && !t.trainer.photoUrl.startsWith('data:image/svg+xml'));

  return `
    <div class="training-card ${t.status === 'hidden' ? 'is-hidden' : ''}" data-id="${t.id}">
      <!-- 1. Photo Container (4:5 Aspect Ratio) with grey tile placeholder -->
      <div class="training-photo-wrap">
        ${hasPhoto ? `
          <img class="training-photo-img" src="${escHtml(t.trainer.photoUrl)}" alt="${escHtml(t.trainer?.name || 'Trainer')}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="training-photo-placeholder" style="display:none;">${escHtml(initials)}</div>
        ` : `
          <div class="training-photo-placeholder">${escHtml(initials)}</div>
        `}

        <div class="training-meta-badge-row">
          <div>
            ${t.status === 'hidden' ? '<span class="badge-hidden-card">Hidden</span>' : ''}
            ${!isSoldOut && isCapped && seatsLeft <= 10 && !enrolled ? `<span class="badge-seats-left">${seatsLeft} seats left</span>` : ''}
            ${isSoldOut && !enrolled ? `<span class="badge-sold-out">Sold out</span>` : ''}
          </div>

          ${userIsStaff ? `
            <button class="card-menu-btn" data-id="${t.id}" aria-label="Manage training">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; flex-shrink:0;"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 2. Trainer Name -->
      <div class="training-trainer-name">${escHtml(t.trainer?.name || 'Instructor')}</div>

      <!-- 3. Trainer Role -->
      <div class="training-trainer-role">${escHtml(t.trainer?.role || 'Lead Trainer')}</div>

      <!-- 4. Company and Experience -->
      <div class="training-trainer-company">${escHtml(t.trainer?.company || 'Industry Expert')} · ${escHtml(t.trainer?.years || '5+')} Yrs Exp</div>

      <!-- 5. Bio (clamped 3 lines) -->
      <div class="training-card-bio">${escHtml(t.trainer?.bio || t.summary || '')}</div>

      <!-- 6. Skill chips (max 6, +N overflow) -->
      <div class="training-card-skills">
        ${displaySkills.map(s => `<span class="training-skill-chip">${escHtml(s)}</span>`).join('')}
        ${overflowCount > 0 ? `<span class="training-skill-chip more">+${overflowCount}</span>` : ''}
      </div>

      <!-- 7. Training title -->
      <div class="training-title-header">${escHtml(t.title)}</div>

      <!-- 8. Price and Next date on ONE row with 16px icon -->
      <div class="training-price-date-row">
        <span class="training-price-line">${priceDisplay}</span>
        <span class="training-date-line">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; flex-shrink:0;"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21l4-4 4 4"/><path d="M12 17v4"/></svg>
          <span>Next: ${dateStr}</span>
        </span>
      </div>

      <!-- 9. LinkedIn Button -->
      ${t.trainer?.linkedinUrl ? `
        <a href="${escHtml(t.trainer.linkedinUrl)}" target="_blank" rel="noopener noreferrer" class="btn-linkedin" onclick="event.stopPropagation();">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="width:14px; height:14px; flex-shrink:0;"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          <span>LinkedIn</span>
        </a>
      ` : ''}

      <!-- 10. Action buttons pinned to bottom -->
      <div class="training-card-actions">
        <button class="btn btn-ghost btn-desc-card" data-id="${t.id}">Description</button>

        ${enrolled ? `
          <span class="badge-enrolled"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; flex-shrink:0;"><polyline points="20 6 9 17 4 12"/></svg> Enrolled</span>
        ` : isSoldOut ? `
          <button class="btn-sold-out" disabled>Sold out</button>
        ` : !isSuperAdmin(user) ? `
          <button class="btn-enroll btn-enroll-card" data-id="${t.id}">Enroll</button>
        ` : ''}
      </div>
    </div>
  `;
}

// ── 4. TRAINING ACTION MENU FOR ADMINS (Edit, Hide, Delete) ───────────────────
function showTrainingActionMenu(tid, triggerEl) {
  const training = (STATE.trainings || []).find(t => t.id === tid);
  if (!training) return;

  const isHidden = training.status === 'hidden';

  showModal({
    title: training.title,
    message: 'Manage this training course. Actions are recorded in the staff audit log.',
    buttons: [
      {
        id: 'edit',
        label: 'Edit Training',
        cls: 'btn-primary',
        onClick: () => {
          editingTrainingId = tid;
          currentView = 'post_training';
          if (isSuperAdmin(me())) staffSubTab = 'post_training';
          render();
        }
      },
      {
        id: 'toggle_hide',
        label: isHidden ? 'Unhide (Make Public)' : 'Hide from Learners',
        cls: 'btn-ghost',
        onClick: () => {
          training.status = isHidden ? 'published' : 'hidden';
          audit(isHidden ? 'unhide_training' : 'hide_training', `${isHidden ? 'Unhid' : 'Hidden'} training: ${training.title}`);
          saveState();
          toast(`Training is now ${training.status}`, 'info');
          render();
        }
      },
      {
        id: 'delete',
        label: 'Delete Training',
        cls: 'btn-danger',
        onClick: () => {
          showModal({
            title: 'Delete Training?',
            message: `Are you sure you want to delete "${training.title}"? This cannot be undone.`,
            buttons: [
              {
                id: 'confirm_del',
                label: 'Yes, Delete',
                cls: 'btn-danger',
                onClick: () => {
                  STATE.trainings = (STATE.trainings || []).filter(t => t.id !== tid);
                  if (STATE.privateLinks) delete STATE.privateLinks[tid];
                  audit('delete_training', `Deleted training: ${training.title}`);
                  saveState();
                  toast('Training deleted', 'success');
                  if (selectedTrainingId === tid) selectedTrainingId = null;
                  render();
                }
              },
              { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
            ]
          });
        }
      },
      { id: 'close', label: 'Close', cls: 'btn-ghost' }
    ]
  });
}

// ── 5. TRAINING DESCRIPTION PAGE ─────────────────────────────────────────────
function renderTrainingDescriptionView(main, tid) {
  const user = me();
  const training = (STATE.trainings || []).find(t => t.id === tid);

  if (!training) {
    main.innerHTML = `
      <div style="padding:40px; text-align:center;">
        <div style="font-size:18px; font-weight:700; color:var(--text); margin-bottom:8px;">Training not found</div>
        <button class="btn btn-primary" onclick="selectedTrainingId=null; navigateTo('#/trainings');">Back to Trainings</button>
      </div>
    `;
    return;
  }

  const enrolled = isEnrolled(training.id, user.id);
  const isCapped = Boolean(training.seats);
  const seatsLeft = isCapped ? Math.max(0, training.seats - (training.enrolledCount || 0)) : null;
  const isSoldOut = isCapped && seatsLeft <= 0;
  const nextSession = getNextUpcomingSession(training);
  const initials = ((training.trainer?.name || 'HT').split(' ').map(n => n[0]).join('').slice(0, 2)).toUpperCase();
  const nextDateStr = nextSession ? `${formatISTDate(nextSession.startAt)} at ${nextSession.startStr || formatISTTime(nextSession.startAt)} IST` : 'TBA';
  const priceDisplay = training.priceInr === 0 ? '<span class="training-price-free">Free</span>' : '₹' + training.priceInr.toLocaleString('en-IN');
  const userIsStaff = isAdmin(user) || isSuperAdmin(user);
  const isLiveOrUpcoming = isSessionLiveOrUpcoming15m(training);

  // STRICT RULE: read private link ONLY when enrolled
  const realLink = getTrainingPrivateLink(training.id, user.id);

  // Sticky Bar HTML
  let stickyBarHTML = '';
  if (!enrolled) {
    if (!isSuperAdmin(user)) {
      stickyBarHTML = `
        <div class="training-sticky-bar">
          <div>
            <div class="training-sticky-price">${priceDisplay}</div>
            <div class="training-sticky-sub">${training.seats ? `${seatsLeft} seats left` : 'Open enrolment'}</div>
          </div>
          ${isSoldOut ? `
            <button class="btn btn-sold-out" disabled style="max-width:180px;">Sold out</button>
          ` : `
            <button class="btn btn-enroll" id="sticky-enroll-btn" style="max-width:180px;">Enroll now</button>
          `}
        </div>
      `;
    }
  } else {
    // When enrolled: Enroll button is removed. Show Join session ONLY if session is within 15 min or live!
    if (isLiveOrUpcoming && realLink) {
      stickyBarHTML = `
        <div class="training-sticky-bar">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="chip-status-live">Live</span>
            <span style="font-size:13px; font-weight:700; color:var(--text);">Session in progress</span>
          </div>
          <a href="${escHtml(realLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-green" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px; padding:10px 20px;">
            ${ICONS.externalLink}
            <span>Join session</span>
          </a>
        </div>
      `;
    }
  }

  main.innerHTML = `
    <div class="training-detail-wrap">
      <!-- Back button -->
      <button class="training-back-btn" id="training-detail-back">
        ${ICONS.back}
        <span>Back to Trainings</span>
      </button>

      <!-- Admin Toolbar if Staff -->
      ${userIsStaff ? `
        <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:10px 16px; margin-bottom:16px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase;">Staff Controls:</span>
            <span style="font-size:12px; font-weight:700; color:var(--text);">${training.enrolledCount || 0} Learners Enrolled</span>
            ${training.status === 'hidden' ? '<span class="badge-hidden-card">Hidden</span>' : ''}
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-ghost" id="detail-edit-btn" style="font-size:12px; padding:4px 10px;">Edit</button>
            <button class="btn btn-ghost" id="detail-toggle-hide-btn" style="font-size:12px; padding:4px 10px;">${training.status === 'hidden' ? 'Unhide' : 'Hide'}</button>
            <button class="btn btn-ghost" id="detail-delete-btn" style="font-size:12px; padding:4px 10px; color:#EF4444;">Delete</button>
          </div>
        </div>
      ` : ''}

      <!-- a. Hero Section -->
      <div class="training-hero-card">
        <div class="training-hero-body">
          <div class="training-hero-badges">
            ${enrolled ? `<span class="badge-enrolled">${ICONS.check} You are enrolled</span>` : ''}
            ${!isSoldOut && isCapped && seatsLeft <= 10 && !enrolled ? `<span class="badge-seats-left">${seatsLeft} seats left</span>` : ''}
            ${isSoldOut && !enrolled ? `<span class="badge-sold-out">Sold out</span>` : ''}
            <span class="training-skill-chip" style="font-size:11px;">Live Online Seminar</span>
          </div>

          <h1 class="training-hero-title">${escHtml(training.title)}</h1>
          <div class="training-hero-trainer">Taught by <strong>${escHtml(training.trainer?.name || 'Instructor')}</strong> · ${escHtml(training.trainer?.role || '')} at ${escHtml(training.trainer?.company || '')}</div>

          <div class="training-hero-details-row">
            <div class="training-hero-stat-item">
              <span class="training-hero-stat-label">Tuition</span>
              <span class="training-hero-stat-val">${priceDisplay}</span>
            </div>
            <div class="training-hero-stat-item">
              <span class="training-hero-stat-label">Next Session</span>
              <span class="training-hero-stat-val" style="font-size:14px;">${nextDateStr}</span>
            </div>
            <div class="training-hero-stat-item">
              <span class="training-hero-stat-label">Seats</span>
              <span class="training-hero-stat-val" style="font-size:14px;">${training.seats ? `${seatsLeft} of ${training.seats} left` : 'Unlimited'}</span>
            </div>
            <div class="training-hero-stat-item">
              <span class="training-hero-stat-label">Format</span>
              <span class="training-hero-stat-val" style="font-size:14px;">Interactive Live Cohort</span>
            </div>
          </div>
        </div>
      </div>

      <!-- b. About this training -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">About this training</h2>
        <div class="training-sec-content">${escHtml(training.description)}</div>
      </div>

      <!-- c. What you will learn -->
      ${training.outcomes && training.outcomes.length > 0 ? `
        <div class="training-sec-block">
          <h2 class="training-sec-title">What you will learn</h2>
          <ul class="outcomes-list">
            ${training.outcomes.map(item => `
              <li class="outcome-item">
                ${ICONS.check}
                <span>${escHtml(item)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- d. Who it is for & Prerequisites -->
      <div class="training-sec-block">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
          ${training.audience ? `
            <div>
              <h3 style="font-size:15px; font-weight:700; color:var(--text); margin-bottom:8px;">Who it is for</h3>
              <p style="font-size:13px; color:var(--muted); line-height:1.5;">${escHtml(training.audience)}</p>
            </div>
          ` : ''}
          ${training.prerequisites ? `
            <div>
              <h3 style="font-size:15px; font-weight:700; color:var(--text); margin-bottom:8px;">Prerequisites</h3>
              <p style="font-size:13px; color:var(--muted); line-height:1.5;">${escHtml(training.prerequisites)}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- e. Session schedule timeline -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">Session Schedule</h2>
        <div class="session-timeline">
          ${(training.sessions || []).map((s, idx) => `
            <div class="session-timeline-card">
              <div class="session-card-header">
                <span class="session-num-pill">Session ${idx + 1}</span>
                <span class="session-title-text">${escHtml(s.title)}</span>
              </div>
              <div class="session-time-text">
                ${ICONS.presentation}
                <span>${formatISTDate(s.startAt)} · ${s.startStr || formatISTTime(s.startAt)} - ${s.endStr || formatISTTime(s.endAt)} IST (2 hours)</span>
              </div>
              ${s.topics && s.topics.length > 0 ? `
                <div>
                  <button type="button" class="session-topics-toggle" onclick="const list = this.nextElementSibling; const exp = list.style.display !== 'none'; list.style.display = exp ? 'none' : 'block'; this.querySelector('span').textContent = exp ? 'View topics covered' : 'Hide topics';">
                    <span>View topics covered</span>
                    ${ICONS.chevronDown}
                  </button>
                  <ul class="session-topics-list" style="display:none;">
                    ${s.topics.map(tp => `<li>${escHtml(tp)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        <div class="session-footnote">* All times are in Indian Standard Time (IST)</div>
      </div>

      <!-- f. Meet your trainer -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">Meet your trainer</h2>
        <div class="trainer-profile-card">
          ${training.trainer?.photoUrl && !training.trainer.photoUrl.startsWith('data:image/svg+xml') ? `
            <img class="trainer-big-avatar" src="${escHtml(training.trainer.photoUrl)}" alt="${escHtml(training.trainer?.name || 'Trainer')}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="trainer-big-avatar" style="display:none; align-items:center; justify-content:center; font-size:32px; font-weight:800; color:var(--muted); background:var(--surface2); user-select:none;">${escHtml(initials)}</div>
          ` : `
            <div class="trainer-big-avatar" style="display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:800; color:var(--muted); background:var(--surface2); user-select:none;">${escHtml(initials)}</div>
          `}
          <div style="flex:1;">
            <div style="font-size:18px; font-weight:800; color:var(--text); margin-bottom:2px;">${escHtml(training.trainer?.name || '')}</div>
            <div style="font-size:13px; font-weight:600; color:var(--primary); margin-bottom:4px;">${escHtml(training.trainer?.role || '')} at ${escHtml(training.trainer?.company || '')}</div>
            <div style="font-size:12px; color:var(--muted); margin-bottom:12px;">${escHtml(training.trainer?.years || '5+')} Years Professional Experience</div>
            <p style="font-size:13px; color:var(--text); line-height:1.5; margin-bottom:12px;">${escHtml(training.trainer?.bio || '')}</p>

            <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:14px;">
              ${(training.trainer?.skills || []).map(sk => `<span class="training-skill-chip">${escHtml(sk)}</span>`).join('')}
            </div>

            ${training.trainer?.linkedinUrl ? `
              <a href="${escHtml(training.trainer.linkedinUrl)}" target="_blank" rel="noopener noreferrer" class="btn-linkedin" style="max-width:200px;">
                ${ICONS.linkedin}
                <span>View LinkedIn Profile</span>
              </a>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- g. Demo Video -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">Course Preview & Demo</h2>
        <div class="video-embed-container">
          <iframe src="https://www.youtube-nocookie.com/embed/${training.demoUrl || 'dQw4w9WgXcQ'}" title="${escHtml(training.title)} preview video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
        <div style="margin-top:8px; font-size:13px;">
          <a href="https://www.youtube.com/watch?v=${training.demoUrl || 'dQw4w9WgXcQ'}" target="_blank" rel="noopener noreferrer" style="color:var(--primary); text-decoration:underline; font-weight:600;">
            Watch on YouTube ↗
          </a>
        </div>
      </div>

      <!-- h. SESSION LINK CARD (THE GATED PART) -->
      ${!enrolled ? `
        <!-- LOCKED: Real link is NOT in DOM -->
        <div class="session-link-card locked" id="locked-session-card">
          <div class="locked-lock-icon">${ICONS.lock}</div>
          <div style="font-size:17px; font-weight:800; color:var(--text); margin-bottom:6px;">Live Session Link</div>
          <div class="blurred-link-placeholder">https://meet.google.com/••••-••••-••••</div>
          <div style="font-size:13px; color:var(--muted); margin-bottom:16px;">
            Enroll to unlock your Google Meet session link and join all live seminar sessions.
          </div>
          ${!isSuperAdmin(user) ? `
            <button type="button" class="btn btn-green" id="locked-card-enroll-btn" style="display:inline-flex; align-items:center; gap:6px; padding:10px 22px;">
              ${ICONS.lock}
              <span>Enroll to unlock your session link</span>
            </button>
          ` : `
            <div style="font-size:12px; color:var(--muted);">Super-admin preview mode</div>
          `}
        </div>
      ` : `
        <!-- UNLOCKED: Read only from privateLinks for paid enrollment -->
        <div class="session-link-card unlocked" id="unlocked-session-card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="color:#16A34A; display:flex;">${ICONS.check}</span>
              <span style="font-size:17px; font-weight:800; color:var(--text);">Your Live Session Link</span>
            </div>
            <span class="badge-enrolled">${ICONS.check} Unlocked</span>
          </div>
          <div style="font-size:13px; color:var(--muted); line-height:1.5; margin-bottom:12px;">
            Here is your live Google Meet link. Please join on time for all scheduled sessions. Recordings are shared within 24 hours.
          </div>
          <div class="unlocked-link-row">
            <div class="unlocked-link-box">${escHtml(realLink)}</div>
            <a href="${escHtml(realLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-green" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; padding:10px 18px;">
              ${ICONS.externalLink}
              <span>Join session</span>
            </a>
            <button type="button" class="btn btn-ghost" id="copy-session-link-btn" data-link="${escHtml(realLink)}" style="display:inline-flex; align-items:center; gap:6px; padding:10px 14px;">
              ${ICONS.copy}
              <span>Copy link</span>
            </button>
          </div>
        </div>
      `}

      <!-- i. Refund policy & FAQ -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">Refund Policy & FAQ</h2>
        <div style="background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:14px; font-size:13px; color:var(--text); line-height:1.5; margin-bottom:16px;">
          <strong>Refund Guarantee:</strong> ${escHtml(training.refundPolicy || 'Full refund eligible if requested at least 48 hours prior to Session 1.')}
        </div>

        <div class="faq-list">
          <div class="faq-item">
            <button class="faq-question" onclick="const a = this.nextElementSibling; const exp = a.style.display !== 'none'; a.style.display = exp ? 'none' : 'block';">
              <span>How do I join the live seminar sessions?</span>
              ${ICONS.chevronDown}
            </button>
            <div class="faq-answer" style="display:none;">
              Session links unlock immediately upon completed enrolment. You can join directly from this description page or from your "My Learning" tab at the scheduled time.
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" onclick="const a = this.nextElementSibling; const exp = a.style.display !== 'none'; a.style.display = exp ? 'none' : 'block';">
              <span>What if I miss a live session?</span>
              ${ICONS.chevronDown}
            </button>
            <div class="faq-answer" style="display:none;">
              All sessions are recorded in full HD and made available to enrolled learners within 24 hours of the live stream ending.
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" onclick="const a = this.nextElementSibling; const exp = a.style.display !== 'none'; a.style.display = exp ? 'none' : 'block';">
              <span>What time zone are session times scheduled in?</span>
              ${ICONS.chevronDown}
            </button>
            <div class="faq-answer" style="display:none;">
              All session times are scheduled in Indian Standard Time (IST / UTC+5:30).
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question" onclick="const a = this.nextElementSibling; const exp = a.style.display !== 'none'; a.style.display = exp ? 'none' : 'block';">
              <span>How do refunds work?</span>
              ${ICONS.chevronDown}
            </button>
            <div class="faq-answer" style="display:none;">
              If you cancel at least 48 hours prior to the kickoff of the first session, your tuition fee will be refunded 100% to your original payment method.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- j. Sticky bottom bar -->
    ${stickyBarHTML}
  `;

  // Attach back button
  document.getElementById('training-detail-back')?.addEventListener('click', () => {
    selectedTrainingId = null;
    navigateTo('#/trainings');
  });

  // Attach staff actions
  document.getElementById('detail-edit-btn')?.addEventListener('click', () => {
    editingTrainingId = training.id;
    currentView = 'post_training';
    if (isSuperAdmin(user)) staffSubTab = 'post_training';
    render();
  });

  document.getElementById('detail-toggle-hide-btn')?.addEventListener('click', () => {
    const isHidden = training.status === 'hidden';
    training.status = isHidden ? 'published' : 'hidden';
    audit(isHidden ? 'unhide_training' : 'hide_training', `${isHidden ? 'Unhid' : 'Hidden'} training: ${training.title}`);
    saveState();
    toast(`Training is now ${training.status}`, 'info');
    render();
  });

  document.getElementById('detail-delete-btn')?.addEventListener('click', () => {
    showModal({
      title: 'Delete Training?',
      message: `Are you sure you want to delete "${training.title}"?`,
      buttons: [
        {
          id: 'del',
          label: 'Delete',
          cls: 'btn-danger',
          onClick: () => {
            STATE.trainings = (STATE.trainings || []).filter(t => t.id !== training.id);
            if (STATE.privateLinks) delete STATE.privateLinks[training.id];
            audit('delete_training', `Deleted training: ${training.title}`);
            saveState();
            selectedTrainingId = null;
            toast('Training deleted', 'success');
            navigateTo('#/trainings');
          }
        },
        { id: 'cancel', label: 'Cancel', cls: 'btn-ghost' }
      ]
    });
  });

  // Attach Enroll triggers
  document.getElementById('sticky-enroll-btn')?.addEventListener('click', () => {
    startEnrollFlow(training.id);
  });
  document.getElementById('locked-card-enroll-btn')?.addEventListener('click', () => {
    startEnrollFlow(training.id);
  });
  document.getElementById('locked-session-card')?.addEventListener('click', e => {
    if (!e.target.closest('#locked-card-enroll-btn')) {
      startEnrollFlow(training.id);
    }
  });

  // Attach Copy button
  document.getElementById('copy-session-link-btn')?.addEventListener('click', e => {
    const link = e.currentTarget.dataset.link;
    if (link) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).catch(() => {});
      }
      toast('Session link copied to clipboard!', 'success');
    }
  });
}

// ── 6. ENROLL FLOW (KYC FIRST -> PAYMENT -> UNLOCK) ──────────────────────────
function startEnrollFlow(trainingId) {
  const user = me();
  if (!user) {
    toast('Please sign in to enroll.', 'error');
    return;
  }

  // Super-admin never sees or uses Enroll
  if (isSuperAdmin(user)) {
    toast('Staff accounts cannot enrol in trainings.', 'info');
    return;
  }

  const training = (STATE.trainings || []).find(t => t.id === trainingId);
  if (!training) return;

  // Never double-enrol
  if (isEnrolled(training.id, user.id)) {
    toast('You are already enrolled in this training.', 'info');
    return;
  }

  // Sold out check
  if (training.seats && training.enrolledCount >= training.seats) {
    toast('Sorry, this training is completely sold out.', 'error');
    return;
  }

  // Step 2: KYC Gate Check
  // Demo user starts unverified; admin accounts count as verified.
  const isKycOk = Boolean(user.verified || user.kycVerified || isAdmin(user));
  if (!isKycOk) {
    showKycEnrollSheet(trainingId);
    return;
  }

  // Step 3: Payment Sheet (Free trainings skip payment sheet)
  if (training.priceInr === 0) {
    completeEnrolmentSuccess(training);
  } else {
    showPaymentEnrollSheet(training);
  }
}

function showKycEnrollSheet(trainingId) {
  const existing = document.getElementById('enroll-kyc-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'enroll-kyc-modal';
  modal.className = 'enroll-sheet-overlay';
  modal.innerHTML = `
    <div class="enroll-sheet-card">
      <div style="width:48px; height:48px; border-radius:50%; background:rgba(22, 163, 74, 0.12); color:#16A34A; display:flex; align-items:center; justify-content:center; margin-bottom:14px;">
        ${ICONS.shield}
      </div>
      <div style="font-size:18px; font-weight:800; color:var(--text); margin-bottom:6px;">Verify your identity to enroll</div>
      <div style="font-size:13px; color:var(--muted); line-height:1.5; margin-bottom:20px;">
        To maintain a trusted community of professional trainers and verified learners, we verify your identity before enrolling in live online seminars.
      </div>
      <div id="kyc-action-area">
        <button class="btn btn-green w-full" id="kyc-sheet-verify-btn" style="min-height:46px;">
          Verify with Aadhaar / PAN
        </button>
        <div style="text-align:center; margin-top:12px;">
          <button class="btn btn-ghost" id="kyc-sheet-cancel-btn" style="font-size:13px; color:var(--muted);">Not now</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('kyc-sheet-cancel-btn')?.addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('kyc-sheet-verify-btn')?.addEventListener('click', async () => {
    const actionArea = document.getElementById('kyc-action-area');
    if (actionArea) {
      actionArea.innerHTML = `
        <div style="padding:16px 0; text-align:center;">
          <span class="spinner" style="width:24px; height:24px; margin-bottom:8px;"></span>
          <div style="font-size:14px; font-weight:600; color:var(--text);">Verifying identity with DigiLocker...</div>
          <div style="font-size:11px; color:var(--muted); margin-top:4px;">Mock verification (2s)</div>
        </div>
      `;
    }

    await fakeDelay(2000);

    const user = me();
    if (user) {
      user.verified = true;
      user.kycVerified = true;
      saveState();
    }

    if (actionArea) {
      actionArea.innerHTML = `
        <div style="padding:16px 0; text-align:center; color:#16A34A;">
          <div style="font-size:28px; margin-bottom:6px;">✓</div>
          <div style="font-size:15px; font-weight:800;">Identity Verified!</div>
          <div style="font-size:12px; color:var(--muted); margin-top:4px;">Proceeding to enrolment...</div>
        </div>
      `;
    }

    await fakeDelay(600);
    modal.remove();
    toast('KYC verified successfully!', 'success');

    // Continue straight to payment, remembering which training the user was on
    const training = (STATE.trainings || []).find(t => t.id === trainingId);
    if (training) {
      if (training.priceInr === 0) {
        completeEnrolmentSuccess(training);
      } else {
        showPaymentEnrollSheet(training);
      }
    }
  });
}

function showPaymentEnrollSheet(training) {
  const existing = document.getElementById('enroll-payment-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'enroll-payment-modal';
  modal.className = 'enroll-sheet-overlay';
  modal.innerHTML = `
    <div class="enroll-sheet-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
        <div>
          <div style="font-size:11px; font-weight:700; color:var(--primary); text-transform:uppercase; letter-spacing:0.5px;">Enrolment Checkout</div>
          <div style="font-size:17px; font-weight:800; color:var(--text); line-height:1.3; margin-top:2px;">${escHtml(training.title)}</div>
          <div style="font-size:12px; color:var(--muted); margin-top:2px;">Trainer: ${escHtml(training.trainer?.name || 'Lead Trainer')}</div>
        </div>
        <button id="pay-sheet-close-x" style="background:none; border:none; color:var(--muted); font-size:20px; cursor:pointer; padding:0;">✕</button>
      </div>

      <div style="background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:14px 16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:13px; color:var(--muted); font-weight:600;">Tuition Fee</span>
          <span style="font-size:19px; font-weight:800; color:var(--text);">₹${training.priceInr.toLocaleString('en-IN')}</span>
        </div>
        <div style="font-size:11px; color:var(--muted); margin-top:4px;">Prices include 18% GST</div>
      </div>

      <div id="payment-sheet-action-area">
        <button class="btn btn-green w-full" id="btn-pay-now-primary" style="min-height:46px; font-size:14px; margin-bottom:14px;">
          Pay ₹${training.priceInr.toLocaleString('en-IN')}
        </button>

        <!-- Simulated payment panel -->
        <div class="simulated-payment-panel">
          <div class="simulated-payment-title">Simulated Payment Gateway (Prototype)</div>
          <div class="simulated-payment-btns">
            <button class="btn btn-green" id="sim-pay-succeed-btn" style="flex:1; min-height:38px; font-size:12px;">Succeed</button>
            <button class="btn btn-ghost" id="sim-pay-fail-btn" style="color:#EF4444; border-color:#EF4444; flex:1; min-height:38px; font-size:12px;">Fail</button>
            <button class="btn btn-ghost" id="sim-pay-cancel-btn" style="flex:1; min-height:38px; font-size:12px;">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  document.getElementById('pay-sheet-close-x')?.addEventListener('click', closeModal);
  document.getElementById('sim-pay-cancel-btn')?.addEventListener('click', closeModal);

  const runPaymentSimulation = async (outcome) => {
    const actionArea = document.getElementById('payment-sheet-action-area');
    if (actionArea) {
      actionArea.innerHTML = `
        <div style="padding:24px 0; text-align:center;">
          <span class="spinner" style="width:26px; height:26px; margin-bottom:10px;"></span>
          <div style="font-size:14px; font-weight:700; color:var(--text);">Processing payment...</div>
          <div style="font-size:11px; color:var(--muted); margin-top:4px;">Connecting to payment gateway (~1.5s)</div>
        </div>
      `;
    }

    await fakeDelay(1500);

    if (outcome === 'succeed') {
      closeModal();
      completeEnrolmentSuccess(training);
    } else {
      closeModal();
      toast('Payment failed. You have not been charged.', 'error');
    }
  };

  document.getElementById('btn-pay-now-primary')?.addEventListener('click', () => runPaymentSimulation('succeed'));
  document.getElementById('sim-pay-succeed-btn')?.addEventListener('click', () => runPaymentSimulation('succeed'));
  document.getElementById('sim-pay-fail-btn')?.addEventListener('click', () => runPaymentSimulation('fail'));
}

function completeEnrolmentSuccess(training) {
  const user = me();
  if (!user || !training) return;

  const key = training.id + '_' + user.id;
  if (!STATE.enrollments) STATE.enrollments = {};
  STATE.enrollments[key] = {
    status: 'paid',
    paidAt: Date.now()
  };

  training.enrolledCount = (training.enrolledCount || 0) + 1;
  saveState();

  toast('You are enrolled. Your session link is unlocked.', 'success');
  render();
}

// ── 7. MY LEARNING TAB ───────────────────────────────────────────────────────
function renderMyLearningView(main) {
  const user = me();

  // Paid trainings for current user
  const paidTrainings = (STATE.trainings || []).filter(t => isEnrolled(t.id, user.id));

  // Filter: Upcoming | Completed
  const now = Date.now();
  let displayed = paidTrainings.filter(t => {
    const next = getNextUpcomingSession(t);
    const hasUpcoming = next && (next.endAt || next.startAt + 2 * 3600000) > now;
    if (learningFilter === 'upcoming') return hasUpcoming;
    return !hasUpcoming; // completed
  });

  main.innerHTML = `
    <div class="mylearning-container">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;">
        <div>
          <h1 style="font-size:22px; font-weight:800; color:var(--text); margin-bottom:4px;">My Learning</h1>
          <div style="font-size:13px; color:var(--muted);">Access your enrolled courses, live session links, and schedules.</div>
        </div>

        <div class="trainings-filter-chips">
          <button class="training-filter-chip ${learningFilter === 'upcoming' ? 'active' : ''}" data-lfilter="upcoming">Upcoming</button>
          <button class="training-filter-chip ${learningFilter === 'completed' ? 'active' : ''}" data-lfilter="completed">Completed</button>
        </div>
      </div>

      <div id="mylearning-list-mount">
        ${displayed.length === 0 ? `
          <div style="text-align:center; padding:60px 20px; background:var(--surface); border:1px solid var(--border); border-radius:16px;">
            <div style="font-size:36px; margin-bottom:12px;">📚</div>
            <div style="font-size:16px; font-weight:700; color:var(--text); margin-bottom:6px;">You have not enrolled in anything yet</div>
            <div style="font-size:13px; color:var(--muted); max-width:320px; margin:0 auto 18px;">
              Explore live seminars by expert trainers and take your cloud & AI engineering skills to the next level.
            </div>
            <button class="btn btn-primary" id="btn-browse-trainings-empty">Browse Trainings</button>
          </div>
        ` : displayed.map(t => renderMyLearningCardHTML(t, user)).join('')}
      </div>
    </div>
  `;

  // Attach filter toggles
  main.querySelectorAll('.training-filter-chip[data-lfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      learningFilter = btn.dataset.lfilter;
      renderMyLearningView(main);
    });
  });

  document.getElementById('btn-browse-trainings-empty')?.addEventListener('click', () => {
    navigateTo('#/trainings');
  });

  // Attach card event buttons
  main.querySelectorAll('.btn-learn-desc').forEach(btn => {
    btn.addEventListener('click', () => {
      const tid = btn.dataset.id;
      navigateTo('#/trainings/' + tid);
    });
  });

  main.querySelectorAll('.btn-learn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const link = btn.dataset.link;
      if (link) {
        if (navigator.clipboard) navigator.clipboard.writeText(link).catch(() => {});
        toast('Session link copied to clipboard!', 'success');
      }
    });
  });
}

function renderMyLearningCardHTML(t, user) {
  const nextSession = getNextUpcomingSession(t);
  const now = Date.now();
  const nextStart = nextSession ? nextSession.startAt : null;
  const isLive = nextSession && now >= nextStart && now <= (nextSession.endAt || nextStart + 2 * 3600000);
  const isUpcoming = nextSession && now < nextStart;
  const isLiveOrUpcoming15m = nextSession && now >= (nextStart - 15 * 60000) && now <= (nextSession.endAt || nextStart + 2 * 3600000);

  // Status chip
  let statusChip = '<span class="chip-status-completed">Completed</span>';
  if (isLive) {
    statusChip = '<span class="chip-status-live">Live now</span>';
  } else if (isUpcoming) {
    statusChip = '<span class="chip-status-upcoming">Upcoming</span>';
  }

  // Countdown & Progress
  const countdownText = isLive ? 'Live now' : nextSession ? formatSessionCountdown(nextSession.startAt) : 'Course ended';
  const sessions = t.sessions || [];
  const completedCount = sessions.filter(s => (s.endAt || s.startAt + 2 * 3600000) < now).length;
  const totalCount = sessions.length;
  const currentSessionIndex = Math.min(totalCount, completedCount + 1);

  // Private Link
  const realLink = getTrainingPrivateLink(t.id, user.id);
  const initials = ((t.trainer?.name || 'HT').split(' ').map(n => n[0]).join('').slice(0, 2)).toUpperCase();
  const hasPhoto = Boolean(t.trainer?.photoUrl && !t.trainer.photoUrl.startsWith('data:image/svg+xml'));

  const calendarSvg16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; flex-shrink:0;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  const descSvg16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; flex-shrink:0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
  const joinSvg16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; flex-shrink:0;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
  const copySvg16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px; flex-shrink:0;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

  return `
    <div class="learning-card" data-id="${t.id}">
      <div class="learning-card-top">
        <div class="learning-thumb-wrap">
          ${hasPhoto ? `
            <img class="learning-thumb" src="${escHtml(t.trainer.photoUrl)}" alt="${escHtml(t.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="learning-thumb-placeholder" style="display:none;">${escHtml(initials)}</div>
          ` : `
            <div class="learning-thumb-placeholder">${escHtml(initials)}</div>
          `}
        </div>

        <div class="learning-content">
          <div class="learning-title-row">
            <h2 class="learning-title">${escHtml(t.title)}</h2>
            ${statusChip}
          </div>

          <div class="learning-trainer">Trainer: <strong>${escHtml(t.trainer?.name || 'Lead Trainer')}</strong></div>

          ${nextSession ? `
            <div class="learning-next-session-line">
              ${calendarSvg16}
              <span>Next session: ${formatISTDate(nextSession.startAt)}, ${nextSession.startStr || formatISTTime(nextSession.startAt)} IST · <span class="learning-countdown-text">${countdownText}</span></span>
            </div>
          ` : ''}

          <div class="learning-session-progress">Session ${currentSessionIndex} of ${totalCount}</div>

          <!-- Action Buttons -->
          <div class="learning-actions-row">
            <button class="btn btn-ghost btn-learn-desc" data-id="${t.id}">
              ${descSvg16}
              <span>Description</span>
            </button>

            ${realLink ? `
              ${isLiveOrUpcoming15m ? `
                <a href="${escHtml(realLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-green btn-learn-join">
                  ${joinSvg16}
                  <span>Join Session</span>
                </a>
              ` : `
                <button class="btn btn-ghost" disabled style="opacity:0.6; cursor:not-allowed;" title="Link opens 15 minutes before session kickoff">
                  Opens 15m before session
                </button>
              `}

              <button class="btn btn-ghost btn-learn-copy" data-link="${escHtml(realLink)}" title="Copy Session Link">
                ${copySvg16}
                <span>Copy Link</span>
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Session Timetable -->
      <div class="learning-timetable-box">
        <div class="timetable-title">Course Timetable</div>
        <div class="timetable-list">
          ${sessions.map((s, idx) => {
            const isPast = (s.endAt || s.startAt + 2 * 3600000) < now;
            return `
              <div class="timetable-row ${isPast ? 'past' : ''}">
                <div class="timetable-session-name">
                  <span class="timetable-num">#${idx + 1}</span>
                  <span class="timetable-title-text">${escHtml(s.title)}</span>
                </div>
                <div class="timetable-session-date">
                  ${calendarSvg16}
                  <span>${formatISTDate(s.startAt)}, ${s.startStr || formatISTTime(s.startAt)} IST</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// ── 8. ME VIEW (USER HUB) ────────────────────────────────────────────────────
function renderMeView(main) {
  const user = me();
  const userIsAdmin = isAdmin(user);
  const initials = (user.displayName || 'HT').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const myLedger = (STATE.ledger || []).filter(l => l.userId === user.id).sort((a, b) => b.at - a.at).slice(0, 15);
  const isKycVerified = Boolean(user.verified || user.kycVerified);

  main.innerHTML = `
    <div class="me-container">
      <!-- User Hero Card -->
      <div class="me-user-hero">
        <div class="me-avatar-circle">
          ${user.photo ? `<img src="${user.photo}" alt="Avatar">` : `<span>${initials}</span>`}
        </div>
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:18px; font-weight:800; color:var(--text);">${escHtml(user.displayName)}</span>
            <span class="role-pill ${user.role || 'user'}">${user.role || 'user'}</span>
          </div>
          <div style="font-size:12px; color:var(--muted); margin-top:2px;">${escHtml(user.email)} · ${escHtml(user.handle)}</div>

          <!-- KYC Verified Status Badge -->
          <div>
            ${isKycVerified ? `
              <span class="me-badge-kyc-verified">${ICONS.check} KYC Verified</span>
            ` : `
              <button class="me-badge-kyc-unverified" id="me-kyc-start-btn" style="border:none; cursor:pointer;" title="Click to verify identity">
                ${ICONS.shield} KYC Unverified (Click to verify)
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Quick Nav Sections -->
      <div class="me-nav-card">
        <button class="me-nav-item" id="me-nav-profile">
          <div class="me-nav-item-left">
            ${ICONS.user}
            <span>Edit Profile & Avatar</span>
          </div>
          <span>&rarr;</span>
        </button>

        <button class="me-nav-item" id="me-nav-drive">
          <div class="me-nav-item-left">
            ${ICONS.folder}
            <span>Drive (Cloud Resumes & Documents)</span>
          </div>
          <span>&rarr;</span>
        </button>

        ${userIsAdmin ? `
          <button class="me-nav-item" id="me-nav-staff" style="color:var(--primary);">
            <div class="me-nav-item-left">
              ${ICONS.shield}
              <span>Staff Moderation & Tools</span>
            </div>
            <span>&rarr;</span>
          </button>
        ` : ''}
      </div>

      <!-- Wallet & Coins Box -->
      <div class="me-nav-card" style="padding:18px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
          <div>
            <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase;">Wallet Balance</div>
            <div style="font-size:24px; font-weight:800; color:var(--text); display:flex; align-items:center; gap:6px;">
              ${ICONS.coin}
              <span>${user.coins || 0} Coins</span>
            </div>
          </div>
          <button class="btn btn-primary" id="me-buy-coins-btn" style="padding:6px 14px; font-size:13px;">Buy coins</button>
        </div>

        <div style="font-size:12px; font-weight:700; color:var(--text); margin-bottom:8px;">Recent Transactions</div>
        <div style="max-height:160px; overflow-y:auto; border:1px solid var(--border); border-radius:10px; background:var(--surface2);">
          ${myLedger.length === 0 ? `
            <div style="padding:14px; text-align:center; color:var(--muted); font-size:12px;">No coin transactions yet</div>
          ` : myLedger.map(l => `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-bottom:1px solid var(--border); font-size:12px;">
              <div>
                <div style="font-weight:600; color:var(--text);">${escHtml(l.note || l.type)}</div>
                <div style="font-size:10px; color:var(--muted);">${formatISTDate(l.at)}</div>
              </div>
              <div style="font-weight:800; color:${l.amount > 0 ? '#16A34A' : 'var(--text)'};">
                ${l.amount > 0 ? '+' : ''}${l.amount}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Settings, Demo Reset & Sign Out -->
      <div class="me-nav-card">
        <button class="me-nav-item" id="me-toggle-theme-item">
          <div class="me-nav-item-left">
            ${currentTheme === 'dark' ? ICONS.sun : ICONS.moon}
            <span>Switch Theme (${currentTheme === 'dark' ? 'Light mode' : 'Dark mode'})</span>
          </div>
          <span>&rarr;</span>
        </button>

        <button class="me-nav-item" id="me-reset-demo-item" style="color:var(--primary);">
          <div class="me-nav-item-left">
            ${ICONS.log}
            <span>Reset Demo Data to Initial Seed</span>
          </div>
          <span>&rarr;</span>
        </button>

        <button class="me-nav-item" id="me-signout-item" style="color:#EF4444;">
          <div class="me-nav-item-left">
            ${ICONS.back}
            <span>Sign Out</span>
          </div>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  `;

  // Attach Me handlers
  document.getElementById('me-kyc-start-btn')?.addEventListener('click', () => {
    showKycEnrollSheet('t1');
  });
  document.getElementById('me-nav-profile')?.addEventListener('click', () => {
    currentView = 'profile';
    navigateTo('#/profile');
  });
  document.getElementById('me-nav-drive')?.addEventListener('click', () => {
    currentView = 'drive';
    navigateTo('#/drive');
  });
  document.getElementById('me-nav-staff')?.addEventListener('click', () => {
    currentView = 'staff';
    navigateTo('#/staff');
  });
  document.getElementById('me-buy-coins-btn')?.addEventListener('click', showWalletSheet);
  document.getElementById('me-toggle-theme-item')?.addEventListener('click', toggleTheme);
  document.getElementById('me-reset-demo-item')?.addEventListener('click', resetDemo);
  document.getElementById('me-signout-item')?.addEventListener('click', doSignOut);
}

// ── 9. SUPER-ADMIN ME VIEW ───────────────────────────────────────────────────
function renderSuperAdminMeView(mount) {
  const user = me();
  mount.innerHTML = `
    <div style="padding:24px; max-width:540px; margin:0 auto;">
      <div class="list-pane-title" style="margin-bottom:8px;">Staff Account</div>
      <div style="background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:18px;">
        <div style="font-size:18px; font-weight:800; color:var(--text);">${escHtml(user.displayName)}</div>
        <div style="font-size:12px; color:var(--muted); margin-top:2px;">${escHtml(user.email)} · ${escHtml(user.handle)}</div>
        <div style="margin-top:10px;">
          <span class="role-pill superadmin">Super-admin</span>
        </div>
      </div>

      <!-- Quick moderation access (especially handy on mobile 5-tab bar) -->
      <div class="me-nav-card" style="margin-bottom:14px;">
        <div style="font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; padding:10px 16px 4px;">Super-Admin Controls</div>
        <button class="me-nav-item" data-sa-tab="users">
          <div class="me-nav-item-left">
            ${ICONS.user}
            <span>Users & KYC</span>
          </div>
          <span>&rarr;</span>
        </button>
        <button class="me-nav-item" data-sa-tab="roles">
          <div class="me-nav-item-left">
            ${ICONS.shield}
            <span>Roles & Permissions</span>
          </div>
          <span>&rarr;</span>
        </button>
        <button class="me-nav-item" data-sa-tab="coins">
          <div class="me-nav-item-left">
            ${ICONS.coin}
            <span>Coins Ledger & Credit</span>
          </div>
          <span>&rarr;</span>
        </button>
        <button class="me-nav-item" data-sa-tab="audit">
          <div class="me-nav-item-left">
            ${ICONS.log}
            <span>Audit Log</span>
          </div>
          <span>&rarr;</span>
        </button>
      </div>

      <div class="me-nav-card">
        <button class="me-nav-item" id="sa-theme-toggle">
          <div class="me-nav-item-left">
            ${currentTheme === 'dark' ? ICONS.sun : ICONS.moon}
            <span>Toggle Theme (${currentTheme})</span>
          </div>
          <span>&rarr;</span>
        </button>
        <button class="me-nav-item" id="sa-reset-demo" style="color:var(--primary);">
          <div class="me-nav-item-left">
            ${ICONS.log}
            <span>Reset Demo Data</span>
          </div>
          <span>&rarr;</span>
        </button>
        <button class="me-nav-item" id="sa-signout" style="color:#EF4444;">
          <div class="me-nav-item-left">
            ${ICONS.back}
            <span>Sign Out</span>
          </div>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  `;

  mount.querySelectorAll('.me-nav-item[data-sa-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.saTab;
      staffSubTab = tab;
      navigateTo('#/' + tab);
    });
  });

  document.getElementById('sa-theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('sa-reset-demo')?.addEventListener('click', resetDemo);
  document.getElementById('sa-signout')?.addEventListener('click', doSignOut);
}

// ── 10. POST / EDIT TRAINING (FORM & PASTE-TEMPLATE PATHS) ───────────────────
function renderPostTrainingView(main, tid = null) {
  const user = me();
  const editingId = tid || editingTrainingId;
  const training = editingId ? (STATE.trainings || []).find(t => t.id === editingId) : null;
  const isEditing = Boolean(training);

  // Read private link if editing
  const existingPrivateLink = isEditing && STATE.privateLinks ? STATE.privateLinks[training.id] || '' : '';

  main.innerHTML = `
    <div style="flex:1; overflow-y:auto; padding:24px; max-width:800px; margin:0 auto; box-sizing:border-box; width:100%;">
      <!-- Back button -->
      <button class="training-back-btn" id="post-training-back-btn">
        ${ICONS.back}
        <span>Back to Trainings</span>
      </button>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
        <div>
          <h1 style="font-size:22px; font-weight:800; color:var(--text);">${isEditing ? 'Edit Training' : 'Publish New Online Training'}</h1>
          <div style="font-size:13px; color:var(--muted);">Staff posting costs 0 coins. Create live seminars for members.</div>
        </div>

        ${!isEditing ? `
          <div class="jobs-segmented-nav">
            <button class="jobs-segment-btn ${postTrainingMode === 'form' ? 'active' : ''}" id="mode-form-btn">Form</button>
            <button class="jobs-segment-btn ${postTrainingMode === 'paste' ? 'active' : ''}" id="mode-paste-btn">Paste a template</button>
          </div>
        ` : ''}
      </div>

      <div id="post-training-content-mount"></div>
    </div>
  `;

  document.getElementById('post-training-back-btn')?.addEventListener('click', () => {
    currentView = 'trainings';
    if (isSuperAdmin(user)) staffSubTab = 'trainings';
    navigateTo('#/trainings');
  });

  const mount = document.getElementById('post-training-content-mount');

  if (!isEditing && postTrainingMode === 'paste') {
    renderPasteTemplateMode(mount, user);
  } else {
    renderFormMode(mount, user, training);
  }

  document.getElementById('mode-form-btn')?.addEventListener('click', () => {
    postTrainingMode = 'form';
    renderPostTrainingView(main, editingId);
  });
  document.getElementById('mode-paste-btn')?.addEventListener('click', () => {
    postTrainingMode = 'paste';
    renderPostTrainingView(main, editingId);
  });
}

function renderFormMode(mount, user, existing) {
  const t = existing || {};
  const trainer = t.trainer || {};
  const sessions = t.sessions || [
    { title: 'Core Foundations & Architecture', date: '2026-11-20', startStr: '19:00', endStr: '21:00', topics: ['Architecture overview', 'Hands-on setup'] }
  ];
  const outcomes = t.outcomes || ['Build scalable applications from scratch', 'Understand industry best practices'];

  mount.innerHTML = `
    <form id="training-editor-form" onsubmit="return false;" novalidate>
      <div id="post-err-msg"></div>

      <!-- Section 1: Trainer -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">1. Trainer Details</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:14px;">
          <div>
            <label class="auth-label" for="tr-name">Trainer Name <span class="field-required">*</span></label>
            <input class="input" type="text" id="tr-name" value="${escHtml(trainer.name || '')}" placeholder="e.g. Aarav Deshmukh" required>
          </div>
          <div>
            <label class="auth-label" for="tr-role">Role <span class="field-required">*</span></label>
            <input class="input" type="text" id="tr-role" value="${escHtml(trainer.role || '')}" placeholder="e.g. Senior AWS DevOps Engineer" required>
          </div>
          <div>
            <label class="auth-label" for="tr-comp">Company <span class="field-required">*</span></label>
            <input class="input" type="text" id="tr-comp" value="${escHtml(trainer.company || '')}" placeholder="e.g. CloudScale Systems" required>
          </div>
          <div>
            <label class="auth-label" for="tr-years">Years Experience <span class="field-required">*</span></label>
            <input class="input" type="text" id="tr-years" value="${escHtml(trainer.years || '5+')}" placeholder="e.g. 8+" required>
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <label class="auth-label" for="tr-bio">Short Bio (max 300) <span class="field-required">*</span> <span id="bio-counter" style="float:right; font-weight:normal;">0/300</span></label>
          <textarea class="input" id="tr-bio" rows="3" maxlength="300" placeholder="Specializes in enterprise Kubernetes deployments..." required>${escHtml(trainer.bio || '')}</textarea>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:14px;">
          <div>
            <label class="auth-label" for="tr-skills">Skills (comma-separated, max 8)</label>
            <input class="input" type="text" id="tr-skills" value="${escHtml((trainer.skills || []).join(', '))}" placeholder="AWS, Kubernetes, Terraform">
          </div>
          <div>
            <label class="auth-label" for="tr-linkedin">LinkedIn URL <span class="field-required">*</span></label>
            <input class="input" type="url" id="tr-linkedin" value="${escHtml(trainer.linkedinUrl || '')}" placeholder="https://www.linkedin.com/in/..." required>
          </div>
        </div>

        <div>
          <label class="auth-label" for="tr-photo">Photo Image URL (public URL only)</label>
          <input class="input" type="url" id="tr-photo" value="${escHtml(trainer.photoUrl || '')}" placeholder="https://... (or leave blank for generated avatar)">
          <div style="font-size:11px; color:var(--muted); margin-top:4px;">Files elsewhere use the round '+' only. Here you can paste an avatar image URL.</div>
        </div>
      </div>

      <!-- Section 2: Training -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">2. Training Details</h2>
        <div style="margin-bottom:14px;">
          <label class="auth-label" for="tr-title">Training Title <span class="field-required">*</span></label>
          <input class="input" type="text" id="tr-title" value="${escHtml(t.title || '')}" placeholder="e.g. AWS and DevOps Mastery" required>
        </div>

        <div style="margin-bottom:14px;">
          <label class="auth-label" for="tr-summary">One-line Summary (max 140) <span class="field-required">*</span> <span id="summary-counter" style="float:right; font-weight:normal;">0/140</span></label>
          <input class="input" type="text" id="tr-summary" maxlength="140" value="${escHtml(t.summary || '')}" placeholder="Master enterprise Kubernetes, EKS, Terraform..." required>
        </div>

        <div style="margin-bottom:14px;">
          <label class="auth-label" for="tr-desc">Full Description <span class="field-required">*</span></label>
          <textarea class="input" id="tr-desc" rows="4" placeholder="Detailed syllabus, course overview, hands-on lab details..." required>${escHtml(t.description || '')}</textarea>
        </div>

        <div style="margin-bottom:14px;">
          <label class="auth-label">What You Will Learn <span class="field-required">*</span></label>
          <div id="outcomes-rows-wrap" style="display:flex; flex-direction:column; gap:8px; margin-bottom:8px;">
            ${outcomes.map(item => `
              <div style="display:flex; gap:8px;">
                <input class="input outcome-row-inp" type="text" value="${escHtml(item)}" placeholder="Learning outcome" required>
                <button type="button" class="btn btn-ghost" onclick="if (document.querySelectorAll('.outcome-row-inp').length > 1) this.parentElement.remove();" style="padding:6px 12px; color:#EF4444;">✕</button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn btn-ghost" id="add-outcome-row-btn" style="font-size:12px; padding:4px 10px;">+ Add learning outcome</button>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:14px;">
          <div>
            <label class="auth-label" for="tr-audience">Who It Is For</label>
            <input class="input" type="text" id="tr-audience" value="${escHtml(t.audience || '')}" placeholder="Cloud engineers, DevOps practitioners...">
          </div>
          <div>
            <label class="auth-label" for="tr-prereq">Prerequisites</label>
            <input class="input" type="text" id="tr-prereq" value="${escHtml(t.prerequisites || '')}" placeholder="Basic Linux command line knowledge...">
          </div>
        </div>

        <div>
          <label class="auth-label" for="tr-demo">Demo Video URL (YouTube ID)</label>
          <input class="input" type="text" id="tr-demo" value="${escHtml(t.demoUrl || 'dQw4w9WgXcQ')}" placeholder="e.g. dQw4w9WgXcQ">
        </div>
      </div>

      <!-- Section 3: Sessions -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">3. Sessions (Repeatable Rows, All in IST) <span class="field-required">*</span></h2>
        <div id="sessions-rows-wrap" style="display:flex; flex-direction:column; gap:12px; margin-bottom:10px;">
          ${sessions.map((s, idx) => `
            <div class="session-form-row" style="background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:12px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:12px; font-weight:700; color:var(--text);">Session</span>
                <button type="button" class="btn btn-ghost" onclick="if (document.querySelectorAll('.session-form-row').length > 1) this.closest('.session-form-row').remove();" style="padding:2px 8px; font-size:12px; color:#EF4444;">Remove</button>
              </div>
              <div style="display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap:8px; margin-bottom:8px;">
                <input class="input s-title-inp" type="text" value="${escHtml(s.title || '')}" placeholder="Session title" required>
                <input class="input s-date-inp" type="date" value="${escHtml(s.date || '2026-11-20')}" required>
                <input class="input s-start-inp" type="time" value="${escHtml(s.startStr || '19:00')}" required>
                <input class="input s-end-inp" type="time" value="${escHtml(s.endStr || '21:00')}" required>
              </div>
              <input class="input s-topics-inp" type="text" value="${escHtml((s.topics || []).join('; '))}" placeholder="Topics (separated by semicolon)">
            </div>
          `).join('')}
        </div>
        <button type="button" class="btn btn-ghost" id="add-session-row-btn" style="font-size:12px; padding:4px 10px;">+ Add session</button>
      </div>

      <!-- Section 4: Commercials -->
      <div class="training-sec-block">
        <h2 class="training-sec-title">4. Commercials & Policies</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:14px;">
          <div>
            <label class="auth-label" for="tr-price">Price in INR (0 = Free) <span class="field-required">*</span></label>
            <input class="input" type="number" id="tr-price" value="${t.priceInr ?? 4999}" min="0" required>
          </div>
          <div>
            <label class="auth-label" for="tr-seats">Seats Limit (leave empty if unlimited)</label>
            <input class="input" type="number" id="tr-seats" value="${t.seats || ''}" min="1" placeholder="e.g. 25">
          </div>
          <div>
            <label class="auth-label" for="tr-enrolby">Enrolment Deadline</label>
            <input class="input" type="date" id="tr-enrolby" value="${escHtml(t.enrolBy || '2026-11-19')}">
          </div>
        </div>

        <div>
          <label class="auth-label" for="tr-refund">Refund Policy <span class="field-required">*</span></label>
          <input class="input" type="text" id="tr-refund" value="${escHtml(t.refundPolicy || 'Full refund if requested at least 48 hours before Session 1.')}" required>
        </div>
      </div>

      <!-- Section 5: Private Session Link -->
      <div class="training-sec-block" style="border-color:var(--primary);">
        <h2 class="training-sec-title">5. Private Session Link (Gated) <span class="field-required">*</span></h2>
        <div>
          <label class="auth-label" for="tr-joinlink">Live Meeting Link (must start with https://)</label>
          <input class="input" type="url" id="tr-joinlink" value="${escHtml(STATE.privateLinks?.[t.id] || 'https://meet.google.com/sample-live-room')}" placeholder="https://meet.google.com/..." required>
          <div style="font-size:12px; color:var(--muted); margin-top:6px; display:flex; align-items:center; gap:5px;">
            ${ICONS.lock} Only enrolled learners can see this link.
          </div>
        </div>
      </div>

      <!-- Section 6: Status & Buttons -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-top:20px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <label class="auth-label" for="tr-status" style="margin:0;">Status:</label>
          <select class="input" id="tr-status" style="padding:6px 12px; width:auto;">
            <option value="published" ${t.status === 'published' ? 'selected' : ''}>Published</option>
            <option value="draft" ${t.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="hidden" ${t.status === 'hidden' ? 'selected' : ''}>Hidden</option>
          </select>
        </div>

        <div style="display:flex; gap:10px;">
          <button type="button" class="btn btn-ghost" id="form-preview-btn">Preview</button>
          <button type="button" class="btn btn-green" id="form-publish-btn">${existing ? 'Save Changes' : 'Publish Training'}</button>
        </div>
      </div>
    </form>
  `;

  // Counters
  const bioInp = document.getElementById('tr-bio');
  const bioCounter = document.getElementById('bio-counter');
  const updateBio = () => { if (bioCounter && bioInp) bioCounter.textContent = `${bioInp.value.length}/300`; };
  bioInp?.addEventListener('input', updateBio);
  updateBio();

  const sumInp = document.getElementById('tr-summary');
  const sumCounter = document.getElementById('summary-counter');
  const updateSum = () => { if (sumCounter && sumInp) sumCounter.textContent = `${sumInp.value.length}/140`; };
  sumInp?.addEventListener('input', updateSum);
  updateSum();

  // Add outcome row
  document.getElementById('add-outcome-row-btn')?.addEventListener('click', () => {
    const wrap = document.getElementById('outcomes-rows-wrap');
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:8px;';
    div.innerHTML = `
      <input class="input outcome-row-inp" type="text" placeholder="Learning outcome" required>
      <button type="button" class="btn btn-ghost" onclick="this.parentElement.remove();" style="padding:6px 12px; color:#EF4444;">✕</button>
    `;
    wrap.appendChild(div);
  });

  // Add session row
  document.getElementById('add-session-row-btn')?.addEventListener('click', () => {
    const wrap = document.getElementById('sessions-rows-wrap');
    const div = document.createElement('div');
    div.className = 'session-form-row';
    div.style.cssText = 'background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:12px;';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="font-size:12px; font-weight:700; color:var(--text);">Session</span>
        <button type="button" class="btn btn-ghost" onclick="this.closest('.session-form-row').remove();" style="padding:2px 8px; font-size:12px; color:#EF4444;">Remove</button>
      </div>
      <div style="display:grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap:8px; margin-bottom:8px;">
        <input class="input s-title-inp" type="text" placeholder="Session title" required>
        <input class="input s-date-inp" type="date" value="2026-11-25" required>
        <input class="input s-start-inp" type="time" value="19:00" required>
        <input class="input s-end-inp" type="time" value="21:00" required>
      </div>
      <input class="input s-topics-inp" type="text" placeholder="Topics (separated by semicolon)">
    `;
    wrap.appendChild(div);
  });

  // Validation & submission
  const validateAndGetPayload = () => {
    const name = document.getElementById('tr-name')?.value.trim();
    const role = document.getElementById('tr-role')?.value.trim();
    const comp = document.getElementById('tr-comp')?.value.trim();
    const years = document.getElementById('tr-years')?.value.trim();
    const bio = document.getElementById('tr-bio')?.value.trim();
    const skills = document.getElementById('tr-skills')?.value.split(',').map(s => s.trim()).filter(Boolean);
    const linkedin = document.getElementById('tr-linkedin')?.value.trim();
    const photo = document.getElementById('tr-photo')?.value.trim();

    const title = document.getElementById('tr-title')?.value.trim();
    const summary = document.getElementById('tr-summary')?.value.trim();
    const desc = document.getElementById('tr-desc')?.value.trim();
    const audience = document.getElementById('tr-audience')?.value.trim();
    const prereq = document.getElementById('tr-prereq')?.value.trim();
    const demo = document.getElementById('tr-demo')?.value.trim() || 'dQw4w9WgXcQ';

    const outcomeInps = document.querySelectorAll('.outcome-row-inp');
    const outcomeList = Array.from(outcomeInps).map(i => i.value.trim()).filter(Boolean);

    const sessionRows = document.querySelectorAll('.session-form-row');
    const sessionList = [];
    for (const row of sessionRows) {
      const st = row.querySelector('.s-title-inp')?.value.trim();
      const sd = row.querySelector('.s-date-inp')?.value.trim();
      const ss = row.querySelector('.s-start-inp')?.value.trim();
      const se = row.querySelector('.s-end-inp')?.value.trim();
      const stopics = row.querySelector('.s-topics-inp')?.value.split(';').map(t => t.trim()).filter(Boolean);

      if (!st || !sd || !ss || !se) {
        showMsg('post-err-msg', 'Please complete all session title, date, and times.');
        shakeForm();
        return null;
      }
      if (ss >= se) {
        showMsg('post-err-msg', `Session "${st}" end time must be after start time.`);
        shakeForm();
        return null;
      }

      const startTimestamp = new Date(`${sd}T${ss}:00+05:30`).getTime() || Date.now() + 86400000;
      const endTimestamp = new Date(`${sd}T${se}:00+05:30`).getTime() || (startTimestamp + 2 * 3600000);

      sessionList.push({
        title: st,
        date: sd,
        startStr: ss,
        endStr: se,
        startAt: startTimestamp,
        endAt: endTimestamp,
        topics: stopics
      });
    }

    const price = parseInt(document.getElementById('tr-price')?.value || '0', 10);
    const seatsVal = document.getElementById('tr-seats')?.value.trim();
    const seats = seatsVal ? parseInt(seatsVal, 10) : null;
    const enrolBy = document.getElementById('tr-enrolby')?.value.trim();
    const refund = document.getElementById('tr-refund')?.value.trim();
    const joinLink = document.getElementById('tr-joinlink')?.value.trim();
    const status = document.getElementById('tr-status')?.value || 'published';

    if (!name || !role || !comp || !years || !bio || !linkedin || !title || !summary || !desc || outcomeList.length === 0 || sessionList.length === 0 || !refund || !joinLink) {
      showMsg('post-err-msg', 'Please fill in all required fields indicated with *.');
      shakeForm();
      return null;
    }

    if (!linkedin.toLowerCase().includes('linkedin.com')) {
      showMsg('post-err-msg', 'LinkedIn URL must contain "linkedin.com".');
      shakeForm();
      return null;
    }

    if (!joinLink.startsWith('https://')) {
      showMsg('post-err-msg', 'Private session link must begin with "https://".');
      shakeForm();
      return null;
    }

    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'TR';
    const finalPhoto = photo || makeTrainerAvatarSvg(initials);

    const payload = {
      id: existing?.id || ('t' + Date.now()),
      title,
      summary,
      description: desc,
      outcomes: outcomeList,
      audience,
      prerequisites: prereq,
      demoUrl: demo,
      trainer: {
        name,
        role,
        company: comp,
        years,
        bio,
        skills: skills.slice(0, 8),
        linkedinUrl: linkedin,
        photoUrl: finalPhoto
      },
      sessions: sessionList,
      priceInr: isNaN(price) ? 0 : price,
      seats,
      enrolledCount: existing?.enrolledCount || 0,
      enrolBy,
      refundPolicy: refund,
      status,
      createdBy: existing?.createdBy || user.id
    };

    return { payload, joinLink };
  };

  const shakeForm = () => {
    const f = document.getElementById('training-editor-form');
    if (f) {
      f.classList.remove('sheet-shake');
      void f.offsetWidth;
      f.classList.add('sheet-shake');
    }
  };

  // Preview Button
  document.getElementById('form-preview-btn')?.addEventListener('click', () => {
    const data = validateAndGetPayload();
    if (!data) return;
    showModal({
      title: 'Preview: ' + data.payload.title,
      message: `
        <div style="text-align:left; max-height:360px; overflow-y:auto;">
          <div style="font-weight:700; margin-bottom:4px;">Trainer: ${escHtml(data.payload.trainer.name)} (${escHtml(data.payload.trainer.role)})</div>
          <div style="font-size:13px; color:var(--muted); margin-bottom:10px;">${escHtml(data.payload.summary)}</div>
          <div style="font-size:14px; font-weight:800; color:#16A34A; margin-bottom:10px;">Price: ${data.payload.priceInr === 0 ? 'Free' : '₹' + data.payload.priceInr}</div>
          <div style="font-size:12px; font-weight:700; color:var(--text); margin-bottom:4px;">${data.payload.sessions.length} Scheduled Sessions</div>
          <div style="font-size:11px; color:var(--muted);">Session 1: ${data.payload.sessions[0].title} on ${data.payload.sessions[0].date}</div>
        </div>
      `,
      buttons: [
        { id: 'ok', label: 'Close Preview', cls: 'btn-primary' }
      ]
    });
  });

  // Publish / Save Button
  document.getElementById('form-publish-btn')?.addEventListener('click', () => {
    const data = validateAndGetPayload();
    if (!data) return;

    if (!STATE.trainings) STATE.trainings = [];
    if (!STATE.privateLinks) STATE.privateLinks = {};

    if (existing) {
      const idx = STATE.trainings.findIndex(t => t.id === existing.id);
      if (idx !== -1) STATE.trainings[idx] = data.payload;
      STATE.privateLinks[data.payload.id] = data.joinLink;
      audit('edit_training', `Updated training: ${data.payload.title}`);
      toast('Training updated successfully!', 'success');
    } else {
      STATE.trainings.unshift(data.payload);
      STATE.privateLinks[data.payload.id] = data.joinLink;
      audit('create_training', `Created new training: ${data.payload.title}`);
      toast('Training published successfully!', 'success');
    }

    saveState();
    currentView = 'trainings';
    if (isSuperAdmin(user)) staffSubTab = 'trainings';
    navigateTo('#/trainings');
  });
}

function renderPasteTemplateMode(mount, user) {
  const sampleTemplate = `Trainer: Aarav Deshmukh | Senior AWS DevOps Engineer | CloudScale Systems | 8+
Bio: Specializes in enterprise Kubernetes deployments, zero-downtime CI/CD pipelines, and multi-region infrastructure as code on AWS.
Skills: AWS, EKS, Terraform, Kubernetes, ArgoCD, Jenkins, CI/CD
LinkedIn: https://www.linkedin.com/in/aarav-deshmukh-cloud
Title: AWS and DevOps Mastery
Summary: Master enterprise Kubernetes, EKS, Terraform, and zero-downtime CI/CD pipelines on AWS.
Description: An intensive live hands-on seminar designed for cloud engineers and backend developers looking to master production AWS DevOps.
Outcomes:
- Design and provision enterprise AWS infrastructure using modular Terraform
- Deploy, monitor, and scale production Kubernetes workloads on Amazon EKS
- Implement secure GitOps release pipelines with ArgoCD and Jenkins
Audience: Cloud engineers, DevOps practitioners, backend engineers, and systems administrators.
Prerequisites: Basic understanding of Linux command line, networking concepts, and any cloud provider.
Demo: dQw4w9WgXcQ
Session: Infrastructure as Code with Terraform & VPC | 2026-11-20 | 19:00-21:00 | AWS Networking; Terraform State; Multi-AZ VPC
Session: Kubernetes Core & EKS Architecture | 2026-11-22 | 19:00-21:00 | EKS Control Plane; Node Groups; Ingress
Price: 4999
Seats: 25
Refund: Full refund if requested at least 48 hours before Session 1.
JoinLink: https://meet.google.com/sample-live-room`;

  mount.innerHTML = `
    <div class="training-sec-block">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h2 class="training-sec-title" style="margin:0;">Paste Training Template</h2>
        <button type="button" class="btn btn-ghost" id="copy-template-syntax-btn" style="font-size:12px; padding:4px 10px;">Copy blank template</button>
      </div>

      <div style="font-size:12px; color:var(--muted); line-height:1.5; margin-bottom:12px;">
        Paste a pre-formatted training document below. Line-by-line errors will be highlighted if anything is missing or malformed.
      </div>

      <div id="paste-err-box" style="display:none; margin-bottom:14px;"></div>

      <textarea class="input" id="paste-template-textarea" rows="18" style="font-family:monospace; font-size:12px; white-space:pre;">${sampleTemplate}</textarea>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
        <button type="button" class="btn btn-green" id="btn-parse-create-training">Parse and Create Training</button>
      </div>
    </div>
  `;

  document.getElementById('copy-template-syntax-btn')?.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sampleTemplate).catch(() => {});
    }
    toast('Template copied to clipboard!', 'info');
  });

  document.getElementById('btn-parse-create-training')?.addEventListener('click', () => {
    const raw = document.getElementById('paste-template-textarea')?.value || '';
    const errBox = document.getElementById('paste-err-box');
    const result = parseTrainingTemplate(raw, user);

    if (result.errors.length > 0) {
      if (errBox) {
        errBox.style.display = 'block';
        errBox.innerHTML = `
          <div class="auth-error">
            <div style="font-weight:700; margin-bottom:4px;">Please fix the following template errors:</div>
            <ul style="margin:0; padding-left:18px;">
              ${result.errors.map(e => `<li>${escHtml(e)}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      return;
    }

    // Success!
    if (errBox) errBox.style.display = 'none';

    if (!STATE.trainings) STATE.trainings = [];
    if (!STATE.privateLinks) STATE.privateLinks = {};

    STATE.trainings.unshift(result.training);
    STATE.privateLinks[result.training.id] = result.joinLink;
    audit('create_training', `Created training via template: ${result.training.title}`);
    saveState();

    toast('Training parsed and created successfully!', 'success');
    currentView = 'trainings';
    if (isSuperAdmin(user)) staffSubTab = 'trainings';
    navigateTo('#/trainings');
  });
}

function parseTrainingTemplate(text, user) {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const errors = [];

  let trainerName = '', trainerRole = '', trainerCompany = '', trainerYears = '';
  let bio = '';
  let skills = [];
  let linkedin = '';
  let title = '';
  let summary = '';
  let description = '';
  const outcomes = [];
  let audience = '';
  let prerequisites = '';
  let demo = 'dQw4w9WgXcQ';
  const sessions = [];
  let price = 0;
  let seats = null;
  let refund = '';
  let joinLink = '';

  let inOutcomes = false;

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    if (!line) return;

    if (line.startsWith('Trainer:')) {
      inOutcomes = false;
      const parts = line.replace('Trainer:', '').split('|').map(s => s.trim());
      if (parts.length < 4) {
        errors.push(`Line ${lineNum}: Trainer must have format "Trainer: Name | Role | Company | Years"`);
      } else {
        [trainerName, trainerRole, trainerCompany, trainerYears] = parts;
      }
    } else if (line.startsWith('Bio:')) {
      inOutcomes = false;
      bio = line.replace('Bio:', '').trim();
    } else if (line.startsWith('Skills:')) {
      inOutcomes = false;
      skills = line.replace('Skills:', '').split(',').map(s => s.trim()).filter(Boolean);
    } else if (line.startsWith('LinkedIn:')) {
      inOutcomes = false;
      linkedin = line.replace('LinkedIn:', '').trim();
      if (!linkedin.toLowerCase().includes('linkedin.com')) {
        errors.push(`Line ${lineNum}: LinkedIn URL must contain "linkedin.com"`);
      }
    } else if (line.startsWith('Title:')) {
      inOutcomes = false;
      title = line.replace('Title:', '').trim();
    } else if (line.startsWith('Summary:')) {
      inOutcomes = false;
      summary = line.replace('Summary:', '').trim();
      if (summary.length > 140) {
        errors.push(`Line ${lineNum}: Summary exceeds 140 characters`);
      }
    } else if (line.startsWith('Description:')) {
      inOutcomes = false;
      description = line.replace('Description:', '').trim();
    } else if (line.startsWith('Outcomes:')) {
      inOutcomes = true;
    } else if (inOutcomes && line.startsWith('-')) {
      outcomes.push(line.replace(/^[-\\s]+/, '').trim());
    } else if (line.startsWith('Audience:')) {
      inOutcomes = false;
      audience = line.replace('Audience:', '').trim();
    } else if (line.startsWith('Prerequisites:')) {
      inOutcomes = false;
      prerequisites = line.replace('Prerequisites:', '').trim();
    } else if (line.startsWith('Demo:')) {
      inOutcomes = false;
      demo = line.replace('Demo:', '').trim();
    } else if (line.startsWith('Session:')) {
      inOutcomes = false;
      const parts = line.replace('Session:', '').split('|').map(s => s.trim());
      if (parts.length < 3) {
        errors.push(`Line ${lineNum}: Session must have format "Session: Title | YYYY-MM-DD | HH:mm-HH:mm | Topics"`);
      } else {
        const [sTitle, sDate, sTimeRange, sTopicsRaw] = parts;
        const [startStr, endStr] = (sTimeRange || '').split('-').map(s => s.trim());
        if (!startStr || !endStr || startStr >= endStr) {
          errors.push(`Line ${lineNum}: Session time range must be HH:mm-HH:mm with end after start`);
        }
        const startAt = new Date(`${sDate}T${startStr}:00+05:30`).getTime() || Date.now() + 86400000;
        const endAt = new Date(`${sDate}T${endStr}:00+05:30`).getTime() || (startAt + 2 * 3600000);
        sessions.push({
          title: sTitle,
          date: sDate,
          startStr,
          endStr,
          startAt,
          endAt,
          topics: (sTopicsRaw || '').split(';').map(t => t.trim()).filter(Boolean)
        });
      }
    } else if (line.startsWith('Price:')) {
      inOutcomes = false;
      const pVal = line.replace('Price:', '').trim();
      price = parseInt(pVal, 10) || 0;
    } else if (line.startsWith('Seats:')) {
      inOutcomes = false;
      const sVal = line.replace('Seats:', '').trim();
      seats = sVal.toLowerCase() === 'none' ? null : parseInt(sVal, 10) || null;
    } else if (line.startsWith('Refund:')) {
      inOutcomes = false;
      refund = line.replace('Refund:', '').trim();
    } else if (line.startsWith('JoinLink:')) {
      inOutcomes = false;
      joinLink = line.replace('JoinLink:', '').trim();
      if (!joinLink.startsWith('https://')) {
        errors.push(`Line ${lineNum}: JoinLink must start with "https://"`);
      }
    }
  });

  if (!trainerName) errors.push('Missing "Trainer:" specification');
  if (!title) errors.push('Missing "Title:" line');
  if (!summary) errors.push('Missing "Summary:" line');
  if (!description) errors.push('Missing "Description:" line');
  if (outcomes.length === 0) errors.push('At least one outcome starting with "-" required under "Outcomes:"');
  if (sessions.length === 0) errors.push('At least one "Session:" required');
  if (!refund) errors.push('Missing "Refund:" policy line');
  if (!joinLink) errors.push('Missing "JoinLink:" line');

  if (errors.length > 0) {
    return { errors };
  }

  const initials = trainerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'TR';

  const training = {
    id: 't' + Date.now(),
    title,
    summary,
    description,
    outcomes,
    audience,
    prerequisites,
    demoUrl: demo,
    trainer: {
      name: trainerName,
      role: trainerRole,
      company: trainerCompany,
      years: trainerYears,
      bio,
      skills: skills.slice(0, 8),
      linkedinUrl: linkedin,
      photoUrl: makeTrainerAvatarSvg(initials)
    },
    sessions,
    priceInr: price,
    seats,
    enrolledCount: 0,
    enrolBy: sessions[0]?.date || '2026-11-20',
    refundPolicy: refund,
    status: 'published',
    createdBy: user?.id || null
  };

  return { errors: [], training, joinLink };
}

// ── 11. LIVE COUNTDOWN TICKER ────────────────────────────────────────────────
setInterval(() => {
  if (currentView === 'learning') {
    document.querySelectorAll('.learning-card').forEach(card => {
      const tid = card.dataset.id;
      const training = (STATE.trainings || []).find(t => t.id === tid);
      if (training) {
        const next = getNextUpcomingSession(training);
        const cdEl = card.querySelector('.learning-countdown-text');
        if (cdEl && next) {
          cdEl.textContent = formatSessionCountdown(next.startAt);
        }
      }
    });
  }
}, 60000);


// ── Automated Self-Test (Requirement 7) ──────────────────────────────────────
window.selfTest = async function() {
  console.log('%c[HireTrainers Self-Test] Starting Automated Suite...', 'font-weight:bold; font-size:14px; color:#f59e0b;');
  const results = [];
  const origAuthScreen = authScreen;

  authScreen = 'signin';
  renderAuthScreen();
  await new Promise(r => setTimeout(r, 60));

  // Verify auth overlay renders sign-in page cleanly
  const overlay = document.getElementById('auth-overlay');
  const hasAuthCard = overlay && overlay.querySelector('.auth-card');
  results.push({
    test: 'Sign-in Screen Render',
    status: hasAuthCard ? 'PASS' : 'FAIL',
    reason: hasAuthCard ? 'Sign-in card rendered cleanly' : 'Sign-in card missing'
  });

  // Verify no demo users remain in memory
  const usersCount = (STATE.users || []).length;
  results.push({
    test: 'Demo Accounts Removed',
    status: usersCount === 0 ? 'PASS' : 'FAIL',
    reason: usersCount === 0 ? 'STATE.users is empty (0 demo accounts)' : `Found ${usersCount} users`
  });

  // Verify attempt to sign in shows "Sign-in is not connected yet."
  await doSignIn();
  const msgEl = document.getElementById('auth-msg');
  const hasExpectedMsg = msgEl && msgEl.innerText.includes('Sign-in is not connected yet.');
  results.push({
    test: 'Sign-in Disconnected Notice',
    status: hasExpectedMsg ? 'PASS' : 'FAIL',
    reason: hasExpectedMsg ? 'Correct notice shown' : 'Notice missing or incorrect'
  });

  // Restore screen
  authScreen = origAuthScreen;
  renderAuthScreen();

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const allPassed = failed === 0;

  console.log('\n========================================');
  console.log(`%cSelf-Test Complete: ${passed} PASSED, ${failed} FAILED`, allPassed ? 'color:#10b981; font-weight:bold; font-size:13px;' : 'color:#ef4444; font-weight:bold; font-size:13px;');
  console.log('========================================\n');

  return { total: results.length, passed, failed, allPassed, results };
};