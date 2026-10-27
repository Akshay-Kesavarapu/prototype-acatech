/**
 * HireTrainers Fake Asynchronous Server Module (api.js)
 * ─────────────────────────────────────────────────────────────────────────────
 * OWNS ALL TRUTH IN MEMORY:
 * - Users, KYC status, and Role permissions
 * - Wallet balances and transactional Ledger
 * - Trainings, atomic Seat counts, and Private Session Links
 * - Enrolment state and payment verification
 * - Job postings, Applications, and Audit Log
 *
 * Security & Integrity:
 * - The UI NEVER decides KYC, coin balance, or enrolment state.
 * - All methods return Promises with realistic network delays (150-250ms).
 * - No user credentials or passwords are saved in localStorage/sessionStorage.
 * - Sign-in displays "Sign-in is not connected yet." unless ?test=1 or testMode is active.
 */

(function(window) {
  'use strict';

  function delay(ms = 180) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function uid() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }

  // ── Initial Seed Data (Stored ONLY in Memory) ──────────────────────────────
  function createInitialData() {
    const now = Date.now();
    const day = 86400000;

    const users = [
      {
        id: 'u1',
        handle: 'user-0873',
        displayName: 'Demo User',
        email: 'demo@hiretrainers.app',
        passwordHash: 'demo1234',
        coins: 50,
        phone: '9876543210',
        kycStatus: 'Not verified',
        verified: false,
        kycVerified: false,
        role: 'user',
        photo: null,
        createdAt: now - 7 * day
      },
      {
        id: 'u_admin',
        handle: 'user-admin',
        displayName: 'Staff Admin',
        email: 'admin@hiretrainers.in',
        passwordHash: 'admin',
        coins: 50,
        phone: '9812345678',
        kycStatus: 'Verified',
        verified: true,
        kycVerified: true,
        role: 'admin',
        photo: null,
        createdAt: now - 10 * day
      },
      {
        id: 'u_superadmin',
        handle: 'user-superadmin',
        displayName: 'Super Admin',
        email: 'superadmin@hiretrainers.in',
        passwordHash: 'superadmin',
        coins: 0,
        phone: '9899887766',
        kycStatus: 'Verified',
        verified: true,
        kycVerified: true,
        role: 'super-admin',
        photo: null,
        createdAt: now - 20 * day
      },
      {
        id: 'u2',
        handle: 'user-4421',
        displayName: 'Alex K',
        email: 'alex@example.com',
        passwordHash: 'alex1234',
        coins: 30,
        phone: '9871122334',
        kycStatus: 'Verified',
        verified: true,
        kycVerified: true,
        role: 'user',
        photo: null,
        createdAt: now - 14 * day
      },
      {
        id: 'u3',
        handle: 'user-0210',
        displayName: 'Priya M',
        email: 'priya@example.com',
        passwordHash: 'priya123',
        coins: 20,
        phone: '9871122335',
        kycStatus: 'Verified',
        verified: true,
        kycVerified: true,
        role: 'user',
        photo: null,
        createdAt: now - 10 * day
      },
      {
        id: 'u4',
        handle: 'user-7731',
        displayName: 'Sam R',
        email: 'sam@example.com',
        passwordHash: 'sam12345',
        coins: 15,
        phone: '9871122336',
        kycStatus: 'Verified',
        verified: true,
        kycVerified: true,
        role: 'user',
        photo: null,
        createdAt: now - 5 * day
      }
    ];

    const groups = [
      { id: 'g1', name: 'Technical',     type: 'technical' },
      { id: 'g2', name: 'Non-Technical', type: 'non-technical' }
    ];

    const jobs = [
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
        createdAt: now - 2 * 3600000,
        lastActivity: now - 2 * 3600000,
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
        createdAt: now - 5 * 3600000,
        lastActivity: now - 5 * 3600000,
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
        createdAt: now - 5 * 3600000,
        lastActivity: now - 5 * 3600000,
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
        createdAt: now - 5 * 3600000,
        lastActivity: now - 5 * 3600000,
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
        createdAt: now - day,
        lastActivity: now - day,
        closed: false,
        removed: false
      },
      {
        id: 'j6',
        posterId: 'u2',
        groupId: 'g1',
        title: 'Data Structures Crash Course',
        location: 'Remote',
        skills: ['DSA', 'Algorithms', 'Java'],
        spotsTotal: 4,
        spotsFilled: 0,
        postType: 'form',
        template: '',
        pay: '',
        endDate: '',
        createdAt: now - 2 * day,
        lastActivity: now - 2 * day,
        closed: false,
        removed: false
      }
    ];

    const applications = [
      { id: 'a1', jobId: 'j1', applicantId: 'u1', coverNote: 'Experienced React Native dev with 4+ years of training background.', status: 'applied', seenByPoster: false, createdAt: now - 3600000 },
      { id: 'a2', jobId: 'j1', applicantId: 'u3', coverNote: 'Trained 200+ students on mobile dev.', status: 'accepted', seenByPoster: true, createdAt: now - 7200000 },
      { id: 'a3', jobId: 'j1', applicantId: 'u4', coverNote: 'Full stack mobile engineer.', status: 'accepted', seenByPoster: true, createdAt: now - 10800000 },
      { id: 'a4', jobId: 'j2', applicantId: 'u1', coverNote: 'Deep learning researcher and corporate trainer.', status: 'applied', seenByPoster: true, createdAt: now - 4000000 },
      { id: 'a5', jobId: 'j2', applicantId: 'u3', coverNote: 'CV and NLP specialist.', status: 'accepted', seenByPoster: true, createdAt: now - 8000000 },
      { id: 'a6', jobId: 'j3', applicantId: 'u1', coverNote: 'Corporate communication trainer.', status: 'accepted', seenByPoster: true, createdAt: now - 4500000 },
      { id: 'a7', jobId: 'j5', applicantId: 'u4', coverNote: 'AWS Solutions Architect.', status: 'accepted', seenByPoster: true, createdAt: now - 86000000 }
    ];

    const trainings = [
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
        audience: 'DevOps engineers, cloud architects, sysadmins, and senior software developers transitioning to AWS cloud operations.',
        prerequisites: 'Foundational knowledge of Linux shell scripting, basic networking, and containerization with Docker.',
        demoUrl: 'dQw4w9WgXcQ',
        trainer: {
          name: 'Vikram Sethi',
          role: 'Principal Cloud Architect',
          company: 'CloudScale Solutions',
          years: '12+',
          bio: '12+ years designing distributed systems and cloud native architectures for Fortune 500 enterprises. AWS Certified Solutions Architect Professional and Kubernetes (CKA) evaluator.',
          skills: ['AWS', 'Kubernetes', 'Terraform', 'ArgoCD', 'Docker', 'Prometheus', 'CI/CD'],
          linkedinUrl: 'https://www.linkedin.com/in/vikram-sethi-devops',
          photoUrl: ''
        },
        sessions: [
          { title: 'Terraform Infrastructure as Code at Scale', date: '2026-11-08', startAt: now + 3 * day, endAt: now + 3 * day + 2 * 3600000, startStr: '10:00', endStr: '12:00', topics: ['Module structure', 'Remote state locking with S3 & DynamoDB', 'Zero-drift CI checks'] },
          { title: 'Production Kubernetes on Amazon EKS', date: '2026-11-15', startAt: now + 10 * day, endAt: now + 10 * day + 2 * 3600000, startStr: '10:00', endStr: '12:00', topics: ['EKS cluster provisioning', 'IRSA security', 'Ingress ALB controller', 'HPA scaling'] },
          { title: 'GitOps Pipelines with ArgoCD & Observability', date: '2026-11-22', startAt: now + 17 * day, endAt: now + 17 * day + 2 * 3600000, startStr: '10:00', endStr: '12:00', topics: ['ArgoCD sync strategies', 'Prometheus & Grafana dashboards', 'Alertmanager setup'] }
        ],
        priceInr: 4999,
        seats: 25,
        enrolledCount: 12,
        enrolBy: '2026-11-07',
        refundPolicy: 'Full refund if cancelled at least 48 hours before session 1. No refunds thereafter.',
        status: 'published',
        createdBy: 'u_admin'
      },
      {
        id: 't2',
        title: 'Generative AI & LLM Engineering',
        summary: 'Build production RAG pipelines, fine-tune models, and deploy agentic workflows with LangGraph.',
        description: 'Take your AI engineering skills from prototype to production. This comprehensive live masterclass teaches engineers how to build robust, hallucination-resistant Retrieval-Augmented Generation (RAG) architectures, evaluate LLM outputs with synthetic benchmarks, fine-tune open weights models using LoRA and QLoRA, and orchestrate stateful multi-agent workflows with LangGraph and LangChain.',
        outcomes: [
          'Architect hybrid dense/sparse vector search with reranking and contextual chunking',
          'Fine-tune open-source models (Llama 3, Mistral) on domain-specific corpora using Unsloth & LoRA',
          'Deploy production-ready multi-agent workflows using LangGraph and function calling',
          'Build end-to-end LLM observability, cost tracing, and latency monitoring with LangSmith',
          'Prevent prompt injection, jailbreaks, and sensitive data leakage with NeMo Guardrails'
        ],
        audience: 'Software engineers, AI/ML developers, data scientists, and technical product builders.',
        prerequisites: 'Proficiency in Python and familiarity with REST APIs and basic transformer concepts.',
        demoUrl: 'jNQXAC9IVRw',
        trainer: {
          name: 'Dr. Radhika Sen',
          role: 'Lead AI Researcher & Founder',
          company: 'HyperScale AI Labs',
          years: '9+',
          bio: 'Former DeepMind resident and AI researcher with PhD in NLP. Consulted for 20+ startups on production LLM deployment, embedding spaces, and agent orchestration.',
          skills: ['Python', 'PyTorch', 'LangChain', 'LangGraph', 'Vector DBs', 'Fine-Tuning', 'HuggingFace'],
          linkedinUrl: 'https://www.linkedin.com/in/radhika-sen-ai',
          photoUrl: ''
        },
        sessions: [
          { title: 'Advanced Production RAG Architecture', date: '2026-11-10', startAt: now + 5 * day, endAt: now + 5 * day + 2.5 * 3600000, startStr: '18:00', endStr: '20:30', topics: ['Contextual retrieval', 'Multi-query expansion', 'Cohere Rerank', 'Qdrant hybrid search'] },
          { title: 'Fine-Tuning with LoRA & Unsloth', date: '2026-11-17', startAt: now + 12 * day, endAt: now + 12 * day + 2.5 * 3600000, startStr: '18:00', endStr: '20:30', topics: ['Dataset synthesis', 'QLoRA quantization', 'Loss convergence tracking', 'vLLM serving'] },
          { title: 'Stateful Agentic Workflows with LangGraph', date: '2026-11-24', startAt: now + 19 * day, endAt: now + 19 * day + 2.5 * 3600000, startStr: '18:00', endStr: '20:30', topics: ['State graphs', 'Human-in-the-loop approvals', 'Tool-calling resilience', 'LangSmith traces'] }
        ],
        priceInr: 2999,
        seats: 30,
        enrolledCount: 18,
        enrolBy: '2026-11-09',
        refundPolicy: 'Full refund eligible up to 24 hours prior to course start.',
        status: 'published',
        createdBy: 'u_admin'
      },
      {
        id: 't3',
        title: 'Mastering System Design & Scalability',
        summary: 'Design scalable, fault-tolerant distributed systems handling millions of requests per second.',
        description: 'An architectural deep-dive into distributed systems, consistency tradeoffs, and high-scale patterns. We deconstruct real-world architectures like WhatsApp messaging, Netflix streaming delivery, Uber geo-dispatch, and Stripe payment consensus. Learn how to navigate CAP theorem choices, implement event-driven architectures with Apache Kafka, prevent cascading failures, and ace senior/staff engineering design interviews.',
        outcomes: [
          'Master high-throughput event streaming with Apache Kafka and partition strategies',
          'Design distributed consensus and cache consistency with Redis and CDC (Debezium)',
          'Implement rate limiters, circuit breakers, backpressure, and graceful degradation',
          'Evaluate SQL vs NoSQL vs NewSQL storage engines for specific workload access patterns'
        ],
        audience: 'Senior software engineers, technical leads, and engineering managers.',
        prerequisites: 'Solid background in backend development and database fundamentals.',
        demoUrl: 'M7lc1UVf-VE',
        trainer: {
          name: 'Arjun Nambiar',
          role: 'Staff Infrastructure Engineer',
          company: 'FinScale Global',
          years: '14+',
          bio: '14+ years architecting ultra-low latency transaction systems and high-throughput payment rails handling 50k+ transactions per second.',
          skills: ['System Design', 'Kafka', 'Redis', 'Cassandra', 'Microservices', 'Distributed Systems'],
          linkedinUrl: 'https://www.linkedin.com/in/arjun-nambiar-infra',
          photoUrl: ''
        },
        sessions: [
          { title: 'Foundations of Distributed Systems & Data Partitioning', date: '2026-11-12', startAt: now + 4 * day, endAt: now + 4 * day + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['Consistent hashing', 'CAP vs PACELC', 'Replication lag', 'Split-brain recovery'] },
          { title: 'Event-Driven Architecture & Message Streaming', date: '2026-11-19', startAt: now + 11 * day, endAt: now + 11 * day + 2 * 3600000, startStr: '19:00', endStr: '21:00', topics: ['Kafka topic design', 'Exactly-once semantics', 'Outbox pattern & Debezium'] }
        ],
        priceInr: 0,
        seats: 50,
        enrolledCount: 34,
        enrolBy: '2026-11-11',
        refundPolicy: 'Free session. Registration reserves seat.',
        status: 'published',
        createdBy: 'u_admin'
      },
      {
        id: 't4',
        title: 'Modern Frontend Architecture: React 19 & Next.js 15',
        summary: 'Server components, actions, concurrent streaming, and high-performance micro-frontends.',
        description: 'Modern front-end engineering demands deep understanding of server-driven rendering, streaming SSR, and edge execution. In this practical live course, we build production Next.js 15 applications using React Server Components (RSC), explore optimistic UI updates with Server Actions, optimize Web Vitals for maximum Lighthouse scores, and establish maintainable component design systems.',
        outcomes: [
          'Master React 19 Server Components, Suspense streaming boundaries, and Actions',
          'Implement optimistic state updates with useOptimistic and useActionState',
          'Optimize Core Web Vitals (LCP, INP, CLS) with asset streaming and selective hydration',
          'Architect enterprise state management combining server cache and client state'
        ],
        audience: 'Frontend developers, full stack engineers, and UI leads.',
        prerequisites: 'Strong working knowledge of modern JavaScript, React hooks, and TypeScript.',
        demoUrl: '9bZkp7q19f0',
        trainer: {
          name: 'Meera Chawla',
          role: 'Principal Frontend Architect',
          company: 'PixelCraft Labs',
          years: '8+',
          bio: 'Front-end lead and open source contributor. Frequent speaker on React core features, web performance optimization, and accessible UI patterns.',
          skills: ['React 19', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Web Vitals', 'Design Systems'],
          linkedinUrl: 'https://www.linkedin.com/in/meera-chawla-fe',
          photoUrl: ''
        },
        sessions: [
          { title: 'RSC Architecture & Streaming SSR', date: '2026-11-09', startAt: now + 6 * day, endAt: now + 6 * day + 2 * 3600000, startStr: '11:00', endStr: '13:00', topics: ['Server vs Client boundary tradeoffs', 'Suspense streaming', 'Parallel routes'] },
          { title: 'Server Actions, Optimistic UI & Forms', date: '2026-11-16', startAt: now + 13 * day, endAt: now + 13 * day + 2 * 3600000, startStr: '11:00', endStr: '13:00', topics: ['Form validation with Zod', 'useOptimistic updates', 'Cache revalidation strategies'] }
        ],
        priceInr: 3499,
        seats: 20,
        enrolledCount: 9,
        enrolBy: '2026-11-08',
        refundPolicy: 'Full refund up to 48h before kickoff.',
        status: 'published',
        createdBy: 'u_admin'
      },
      {
        id: 't5',
        title: 'Kubernetes in Production & Service Mesh Deep Dive',
        summary: 'Zero-trust mTLS, Istio traffic steering, canary deployments, and chaos engineering.',
        description: 'Take your Kubernetes clusters to enterprise production standards. This live workshop explores production cluster hardening, zero-trust service-to-service communication with Istio service mesh, automated canary rollouts with Flagger, network security policies, and fault injection with Chaos Mesh.',
        outcomes: [
          'Implement Istio service mesh with automatic mTLS encryption and authorization policies',
          'Configure intelligent traffic splitting, circuit breaking, and retry budgets',
          'Automate canary rollouts with Prometheus metrics analysis using Flagger',
          'Run chaos engineering experiments to prove cluster self-healing capabilities'
        ],
        audience: 'Platform engineers, SREs, Kubernetes administrators, and cloud architects.',
        prerequisites: 'Prior experience deploying workloads on Kubernetes (kubectl, YAML manifests).',
        demoUrl: 'kJQP7kiw5Fk',
        trainer: {
          name: 'Karan Bhasin',
          role: 'Staff SRE & Platform Lead',
          company: 'Nexus Infotech',
          years: '11+',
          bio: 'Staff Site Reliability Engineer specializing in Kubernetes multi-cluster federation, Istio service mesh, and automated infrastructure remediation.',
          skills: ['Kubernetes', 'Istio', 'Envoy', 'Flagger', 'Prometheus', 'Chaos Engineering'],
          linkedinUrl: 'https://www.linkedin.com/in/karan-bhasin-sre',
          photoUrl: ''
        },
        sessions: [
          { title: 'Istio Service Mesh Architecture & mTLS', date: '2026-11-11', startAt: now + 7 * day, endAt: now + 7 * day + 2 * 3600000, startStr: '14:00', endStr: '16:00', topics: ['Envoy sidecar injection', 'PeerAuthentication mTLS', 'AuthorizationPolicy'] },
          { title: 'Canary Deployments & Chaos Experiments', date: '2026-11-18', startAt: now + 14 * day, endAt: now + 14 * day + 2 * 3600000, startStr: '14:00', endStr: '16:00', topics: ['Flagger automated canaries', 'Chaos Mesh fault injection', 'Circuit breaking'] }
        ],
        priceInr: 5499,
        seats: 15,
        enrolledCount: 6,
        enrolBy: '2026-11-10',
        refundPolicy: 'Eligible for 100% refund up to 72 hours before start.',
        status: 'published',
        createdBy: 'u_admin'
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
          { title: 'Spark Architecture & PySpark Foundations', date: '2026-11-14', startAt: now + 5 * day, endAt: now + 5 * day + 2 * 3600000, startStr: '10:00', endStr: '12:00', topics: ['Spark Execution Engine', 'DataFrames & Datasets', 'Memory Management'] },
          { title: 'Delta Lake & Lakehouse Patterns', date: '2026-11-21', startAt: now + 12 * day, endAt: now + 12 * day + 2 * 3600000, startStr: '10:00', endStr: '12:00', topics: ['ACID Logging', 'Compaction (OPTIMIZE)', 'Time Travel Queries'] }
        ],
        priceInr: 4999,
        seats: 25,
        enrolledCount: 12,
        enrolBy: '2026-11-13',
        refundPolicy: 'Full refund eligible up to 48 hours before session 1 kickoff.',
        status: 'published',
        createdBy: 'u_admin'
      }
    ];

    // Private Session Links (Stored ONLY on the server, NEVER exposed publicly)
    const privateLinks = {
      t1: 'https://meet.google.com/aws-devops-mastery-live',
      t2: 'https://meet.google.com/genai-applied-live',
      t3: 'https://meet.google.com/system-design-free-live',
      t4: 'https://meet.google.com/react-next-arch-live',
      t5: 'https://meet.google.com/k8s-mesh-workshop-live',
      t6: 'https://meet.google.com/spark-databricks-live'
    };

    // Enrollments truth table
    const enrollments = {
      t1_u1: {
        status: 'paid',
        paidAt: now - 2 * day
      }
    };

    const ledger = [
      { id: 'l1', userId: 'u1', type: 'bonus', amount: 50, note: 'Welcome bonus', at: now - 7 * day },
      { id: 'l2', userId: 'u_admin', type: 'bonus', amount: 50, note: 'Welcome bonus', at: now - 10 * day },
      { id: 'l3', userId: 'u2', type: 'bonus', amount: 50, note: 'Welcome bonus', at: now - 14 * day },
      { id: 'l4', userId: 'u2', type: 'post', amount: -1, note: 'Posted job: React Native Trainer', at: now - 2 * 3600000 },
      { id: 'l5', userId: 'u3', type: 'bonus', amount: 50, note: 'Welcome bonus', at: now - 10 * day },
      { id: 'l6', userId: 'u4', type: 'bonus', amount: 50, note: 'Welcome bonus', at: now - 5 * day }
    ];

    const auditLog = [
      { id: 'aud1', time: now - 2 * day, who: 'superadmin@hiretrainers.in', action: 'seed_init', detail: 'System initialized' }
    ];

    const driveFiles = [
      { id: 'df1', ownerId: 'u1', name: 'Resume_DemoUser_2026.pdf', size: 245000, createdAt: now - 6 * day, hidden: false }
    ];

    const notifications = [
      { id: 'n1', userId: 'u1', title: 'Welcome to HireTrainers!', message: 'Explore groups, discover jobs, and register for top-tier live trainings.', time: now - 7 * day, read: false, type: 'welcome' }
    ];

    return {
      users,
      groups,
      jobs,
      applications,
      trainings,
      privateLinks,
      enrollments,
      ledger,
      auditLog,
      driveFiles,
      notifications
    };
  }

  // Live in-memory database instance
  let DB = createInitialData();
  let currentUserId = null;
  let testModeOverride = null;

  // ── Public API Object ──────────────────────────────────────────────────────
  const API = {
    // Mode checks
    isTestMode() {
      if (testModeOverride !== null) return testModeOverride;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('test') || urlParams.get('test') === '1';
      } catch (e) {
        return false;
      }
    },

    setTestMode(active) {
      testModeOverride = active === null ? null : Boolean(active);
    },

    resetTestData() {
      DB = createInitialData();
      return true;
    },

    // Session Management
    async getCurrentUser() {
      await delay(60);
      if (!currentUserId) return null;
      const user = DB.users.find(u => u.id === currentUserId);
      return user ? clone(user) : null;
    },

    async signIn(email, password) {
      await delay(180);
      // Production Rule: When NOT in test mode, real Firebase auth is disconnected
      if (!this.isTestMode()) {
        return { ok: false, error: 'Sign-in is not connected yet.' };
      }

      // Test Harness Auth
      const user = DB.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
      if (!user) {
        return { ok: false, error: 'User not found in test fixtures.' };
      }
      if (user.passwordHash && user.passwordHash !== password) {
        return { ok: false, error: 'Incorrect password for test user.' };
      }

      currentUserId = user.id;
      return { ok: true, user: clone(user) };
    },

    async signOut() {
      await delay(100);
      currentUserId = null;
      return { ok: true };
    },

    // Test helper to switch roles directly
    async switchTestUser(roleOrEmail) {
      await delay(80);
      let target;
      if (roleOrEmail === 'user') target = DB.users.find(u => u.role === 'user');
      else if (roleOrEmail === 'admin') target = DB.users.find(u => u.role === 'admin');
      else if (roleOrEmail === 'super-admin' || roleOrEmail === 'superadmin') target = DB.users.find(u => u.role === 'super-admin');
      else target = DB.users.find(u => u.email.toLowerCase() === roleOrEmail.toLowerCase() || u.id === roleOrEmail);

      if (!target) return { ok: false, error: 'Target user not found' };
      currentUserId = target.id;
      return { ok: true, user: clone(target) };
    },

    // KYC Verification (Server Authoritative)
    async verifyKyc(userId, docDetails = {}) {
      await delay(250);
      const targetId = userId || currentUserId;
      const user = DB.users.find(u => u.id === targetId);
      if (!user) return { ok: false, error: 'User not found' };

      // Update truthful KYC status on server
      user.kycVerified = true;
      user.verified = true;
      user.kycStatus = 'Verified';

      // Add audit log entry
      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: 'kyc_verified',
        detail: `KYC verified for ${user.displayName} (${docDetails.docType || 'Aadhaar'})`
      });

      return { ok: true, user: clone(user) };
    },

    // Trainings & Enrolment
    async getTrainings() {
      await delay(120);
      // Strip private links from public listing
      return DB.trainings.map(t => {
        const item = clone(t);
        delete item.privateLink;
        return item;
      });
    },

    async getTraining(trainingId) {
      await delay(100);
      const training = DB.trainings.find(t => t.id === trainingId);
      if (!training) return null;
      return clone(training);
    },

    async getTrainingLink(trainingId) {
      await delay(120);
      if (!currentUserId) {
        return { ok: false, error: 'Authentication required' };
      }
      const key = `${trainingId}_${currentUserId}`;
      const enr = DB.enrollments[key];
      if (!enr || enr.status !== 'paid') {
        return { ok: false, error: 'Paid enrollment required to unlock session link.' };
      }
      const link = DB.privateLinks[trainingId];
      if (!link) {
        return { ok: false, error: 'Session link not yet published for this training.' };
      }
      return { ok: true, link };
    },

    async enrollTraining(trainingId) {
      await delay(250);
      if (!currentUserId) {
        return { ok: false, error: 'Please sign in to enroll.' };
      }

      const user = DB.users.find(u => u.id === currentUserId);
      if (!user) return { ok: false, error: 'User not found' };

      // Role check: super-admin cannot enroll in trainings
      if (user.role === 'super-admin') {
        return { ok: false, error: 'Super-admin cannot enroll as a learner.' };
      }

      // KYC gate check
      if (!user.kycVerified) {
        return {
          ok: false,
          error: 'Identity verification required. Complete KYC to enroll in paid trainings.',
          requiresKyc: true
        };
      }

      const training = DB.trainings.find(t => t.id === trainingId);
      if (!training) return { ok: false, error: 'Training not found' };
      if (training.status === 'hidden') return { ok: false, error: 'Training is not open for enrollment.' };

      // Seat availability check
      if (training.seats !== null && training.enrolledCount >= training.seats) {
        return { ok: false, error: 'This training is fully booked.' };
      }

      const key = `${trainingId}_${currentUserId}`;
      if (DB.enrollments[key] && DB.enrollments[key].status === 'paid') {
        return { ok: false, error: 'You are already enrolled in this training.' };
      }

      // Record successful enrolment & payment
      DB.enrollments[key] = {
        status: 'paid',
        paidAt: Date.now()
      };
      training.enrolledCount = (training.enrolledCount || 0) + 1;

      // Add audit log
      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: 'training_enrolled',
        detail: `Enrolled in ${training.title} (₹${training.priceInr})`
      });

      return {
        ok: true,
        enrollment: clone(DB.enrollments[key]),
        training: clone(training),
        link: DB.privateLinks[trainingId]
      };
    },

    async getEnrollment(trainingId, userId) {
      await delay(80);
      const uidToCheck = userId || currentUserId;
      if (!uidToCheck) return null;
      const key = `${trainingId}_${uidToCheck}`;
      return DB.enrollments[key] ? clone(DB.enrollments[key]) : null;
    },

    async getMyLearning(userId) {
      await delay(120);
      const uidToCheck = userId || currentUserId;
      if (!uidToCheck) return [];

      const enrolledTrainings = [];
      for (const t of DB.trainings) {
        const key = `${t.id}_${uidToCheck}`;
        const enr = DB.enrollments[key];
        if (enr && enr.status === 'paid') {
          const item = clone(t);
          item.enrollment = clone(enr);
          item.privateLink = DB.privateLinks[t.id];
          enrolledTrainings.push(item);
        }
      }
      return enrolledTrainings;
    },

    async duplicateTraining(trainingId) {
      await delay(150);
      const user = DB.users.find(u => u.id === currentUserId);
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return { ok: false, error: 'Not allowed: Staff privileges required.' };
      }
      const source = DB.trainings.find(t => t.id === trainingId);
      if (!source) return { ok: false, error: 'Training not found' };

      const newTraining = clone(source);
      newTraining.id = uid();
      newTraining.title = 'Copy of ' + source.title;
      newTraining.status = 'draft';
      newTraining.enrolledCount = 0;
      newTraining.createdAt = Date.now();

      const idx = DB.trainings.findIndex(t => t.id === trainingId);
      DB.trainings.splice(idx + 1, 0, newTraining);

      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: 'duplicate_training',
        detail: `Duplicated training: "${source.title}" -> "${newTraining.title}"`
      });

      return { ok: true, training: clone(newTraining) };
    },

    async toggleHideTraining(trainingId) {
      await delay(150);
      const user = DB.users.find(u => u.id === currentUserId);
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return { ok: false, error: 'Not allowed: Staff privileges required.' };
      }
      const training = DB.trainings.find(t => t.id === trainingId);
      if (!training) return { ok: false, error: 'Training not found' };

      const willHide = training.status !== 'hidden';
      training.status = willHide ? 'hidden' : 'published';

      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: willHide ? 'hide_training' : 'unhide_training',
        detail: `${willHide ? 'Hid' : 'Unhid'} training: "${training.title}"`
      });

      return { ok: true, status: training.status, training: clone(training) };
    },

    async deleteTraining(trainingId) {
      await delay(180);
      const user = DB.users.find(u => u.id === currentUserId);
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return { ok: false, error: 'Not allowed: Staff privileges required.' };
      }
      const idx = DB.trainings.findIndex(t => t.id === trainingId);
      if (idx === -1) return { ok: false, error: 'Training not found' };

      const training = DB.trainings[idx];
      const enrolledCount = training.enrolledCount || 0;
      DB.trainings.splice(idx, 1);
      delete DB.privateLinks[trainingId];

      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: 'delete_training',
        detail: `Deleted training: "${training.title}" (had ${enrolledCount} enrolled learners)`
      });

      return { ok: true };
    },

    async getEnrolledCount(trainingId) {
      await delay(100);
      const user = DB.users.find(u => u.id === currentUserId);
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return { ok: false, error: 'Not allowed: Staff privileges required.' };
      }
      const training = DB.trainings.find(t => t.id === trainingId);
      if (!training) return { ok: false, error: 'Training not found' };

      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: 'view_enrolled_count',
        detail: `Viewed enrolled count (${training.enrolledCount || 0}) for training: "${training.title}"`
      });

      return { ok: true, count: training.enrolledCount || 0, title: training.title };
    },

    async updateProfile(userId, { displayName, phone, photo } = {}) {
      await delay(180);
      const targetId = userId || currentUserId;
      if (!targetId) return { ok: false, error: 'Authentication required' };
      const user = DB.users.find(u => u.id === targetId);
      if (!user) return { ok: false, error: 'User not found' };

      if (displayName !== undefined) {
        const cleanName = (displayName || '').trim();
        if (cleanName.length < 2 || cleanName.length > 60) {
          return { ok: false, error: 'Name must be between 2 and 60 characters.' };
        }
        user.displayName = cleanName;
      }

      if (phone !== undefined) {
        const digits = (phone || '').replace(/\D/g, '');
        const cleanDigits = (digits.length === 12 && digits.startsWith('91')) ? digits.slice(2) : digits;
        if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
          return { ok: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
        }
        user.phone = cleanDigits;
      }

      if (photo !== undefined) {
        user.photo = photo;
      }

      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: 'profile_update',
        detail: `Updated profile details: ${user.displayName}`
      });

      return { ok: true, user: clone(user) };
    },

    async deleteAccount(userId) {
      await delay(200);
      const targetId = userId || currentUserId;
      if (!targetId) return { ok: false, error: 'Authentication required' };
      const idx = DB.users.findIndex(u => u.id === targetId);
      if (idx === -1) return { ok: false, error: 'User not found' };

      const user = DB.users[idx];
      DB.users.splice(idx, 1);

      DB.jobs = DB.jobs.filter(j => j.posterId !== targetId);
      DB.applications = DB.applications.filter(a => a.applicantId !== targetId);
      DB.ledger = DB.ledger.filter(l => l.userId !== targetId);

      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: 'delete_account',
        detail: `Permanently deleted account: ${user.email} (${user.displayName})`
      });

      if (currentUserId === targetId) {
        currentUserId = null;
      }

      return { ok: true };
    },

    async logAudit(action, detail) {
      await delay(50);
      const user = DB.users.find(u => u.id === currentUserId);
      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user ? user.email : 'system',
        action,
        detail
      });
      return { ok: true };
    },

    // Wallet & Coins
    async getWallet(userId) {
      await delay(100);
      const targetId = userId || currentUserId;
      const user = DB.users.find(u => u.id === targetId);
      if (!user) return { ok: false, error: 'User not found' };

      const userLedger = DB.ledger.filter(l => l.userId === targetId);
      return {
        ok: true,
        coins: user.coins || 0,
        ledger: clone(userLedger)
      };
    },

    async purchaseCoins(userId, amount = 50) {
      await delay(200);
      const targetId = userId || currentUserId;
      const user = DB.users.find(u => u.id === targetId);
      if (!user) return { ok: false, error: 'User not found' };

      user.coins = (user.coins || 0) + amount;
      const entry = {
        id: uid(),
        userId: targetId,
        type: 'purchase',
        amount: amount,
        note: `Purchased ${amount} coins`,
        at: Date.now()
      };
      DB.ledger.unshift(entry);

      return {
        ok: true,
        coins: user.coins,
        ledger: clone(DB.ledger.filter(l => l.userId === targetId))
      };
    },

    async deductCoins(userId, amount, note = '') {
      await delay(120);
      const targetId = userId || currentUserId;
      const user = DB.users.find(u => u.id === targetId);
      if (!user) return { ok: false, error: 'User not found' };
      if ((user.coins || 0) < amount) {
        return { ok: false, error: 'Insufficient coins in wallet.' };
      }

      user.coins -= amount;
      const entry = {
        id: uid(),
        userId: targetId,
        type: 'post',
        amount: -amount,
        note: note || `Deducted ${amount} coins`,
        at: Date.now()
      };
      DB.ledger.unshift(entry);

      return { ok: true, coins: user.coins };
    },

    // Jobs & Postings
    async getJobs() {
      await delay(120);
      return clone(DB.jobs);
    },

    async getJob(id) {
      await delay(80);
      const j = DB.jobs.find(x => x.id === id);
      return j ? clone(j) : null;
    },

    async postJob(jobData) {
      await delay(200);
      if (!currentUserId) return { ok: false, error: 'Sign-in required' };
      const user = DB.users.find(u => u.id === currentUserId);
      if (!user) return { ok: false, error: 'User not found' };

      if ((user.coins || 0) < 1) {
        return { ok: false, error: 'Posting requires at least 1 coin.' };
      }

      user.coins -= 1;
      const newJob = {
        id: uid(),
        posterId: user.id,
        groupId: jobData.groupId || 'g1',
        title: jobData.title,
        location: jobData.location || 'Remote',
        skills: jobData.skills || [],
        spotsTotal: parseInt(jobData.spotsTotal || 1, 10),
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

      DB.jobs.unshift(newJob);
      DB.ledger.unshift({
        id: uid(),
        userId: user.id,
        type: 'post',
        amount: -1,
        note: `Posted job: ${newJob.title}`,
        at: Date.now()
      });

      return { ok: true, job: clone(newJob), coins: user.coins };
    },

    // Groups
    async getGroups() {
      await delay(80);
      return clone(DB.groups);
    },

    // Applications
    async getApplications(filter = {}) {
      await delay(100);
      let apps = DB.applications;
      if (filter.jobId) apps = apps.filter(a => a.jobId === filter.jobId);
      if (filter.applicantId) apps = apps.filter(a => a.applicantId === filter.applicantId);
      return clone(apps);
    },

    // Staff & Superadmin Features
    async getAuditLog() {
      await delay(100);
      const user = DB.users.find(u => u.id === currentUserId);
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return { ok: false, error: 'Access denied: staff privileges required.' };
      }
      return { ok: true, log: clone(DB.auditLog) };
    },

    async getUsers() {
      await delay(100);
      const user = DB.users.find(u => u.id === currentUserId);
      if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
        return { ok: false, error: 'Access denied.' };
      }
      return { ok: true, users: clone(DB.users) };
    },

    async updateUserRole(targetUserId, newRole) {
      await delay(150);
      const user = DB.users.find(u => u.id === currentUserId);
      if (!user || user.role !== 'super-admin') {
        return { ok: false, error: 'Only Super-Admin can modify user roles.' };
      }

      const target = DB.users.find(u => u.id === targetUserId);
      if (!target) return { ok: false, error: 'Target user not found.' };

      target.role = newRole;
      DB.auditLog.unshift({
        id: uid(),
        time: Date.now(),
        who: user.email,
        action: 'role_change',
        detail: `Changed role of ${target.email} to ${newRole}`
      });

      return { ok: true, user: clone(target) };
    }
  };

  window.API = API;

})(window);
