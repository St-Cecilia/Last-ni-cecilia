import {
  UserProfile,
  FriendRequest,
  ChatThread,
  ChatMessage,
  AppNotification,
  AlumniEvent,
  Announcement,
  Opportunity,
  JobApplication,
  Chapter,
  CareerMilestone,
  GalleryItem,
  AuditLogEntry,
  AutomationJob,
  CareerSurveyResponse,
  DatabaseBackupSnapshot
} from '../types';

/**
 * Official Seed Accounts for St. Cecilia's College Deployment
 * Prepared with full credentials for every system role.
 */
export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user_rlopez_admin',
    name: 'R. Lopez',
    email: 'rlopez@stcecilia.edu.ph',
    password: 'Password123!',
    role: 'admin',
    batch: '2014',
    course: 'Institutional Administration & Academic Operations',
    location: 'St. Cecilia’s Campus, Executive Administration',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    headline: 'Executive Administrator • St. Cecilia’s College - Cebu, Inc.',
    about: 'Institutional administrator overseeing alumni relations, registrar records, accreditation, and platform operations.',
    phone: '+63 918 111 2233',
    employeeId: 'SCC-ADM-002',
    department: 'Office of the College President & Alumni Advancement',
    isVerified: true,
    followersCount: 0,
    followingCount: 0,
    connectionsCount: 0,
    experience: [
      {
        id: 'exp_rlopez_1',
        title: 'Executive Administrator',
        company: 'St. Cecilia’s College',
        location: 'Campus Administration',
        startDate: '2017-01',
        current: true,
        description: 'Managing institutional operations, registry verification, and alumni programs.'
      }
    ],
    education: [
      {
        id: 'edu_rlopez_1',
        degree: 'Master in Educational Management & Administration',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Educational Management',
        startYear: '2010',
        endYear: '2014',
        honors: 'Summa Cum Laude'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'user_employer_cebutech',
    name: 'CebuTech Systems HR',
    email: 'hr@cebutech.com',
    password: 'Password123!',
    role: 'employer',
    batch: 'N/A',
    course: 'Corporate Partner',
    location: 'Cebu IT Park, Lahug, Cebu City',
    profilePictureUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80',
    headline: 'Talent Acquisition • CebuTech Systems Corp.',
    about: 'Official hiring partner recruiting St. Cecilia’s College engineering, technology, and business administration graduates for high-impact roles.',
    phone: '+63 32 411 9000',
    company: 'CebuTech Systems Corp.',
    industry: 'Information Technology & Software',
    employerVerificationStatus: 'verified',
    employerStatus: 'active',
    employerExpirationDate: '2028-12-31T23:59:59.000Z',
    canPostJobs: true,
    isVerified: true,
    followersCount: 0,
    followingCount: 0,
    connectionsCount: 0,
    experience: [],
    education: [],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'user_default_admin',
    name: 'Administrator',
    email: 'admin@stcecilia.edu',
    password: 'Password123!',
    role: 'admin',
    batch: '2015',
    course: 'Public Administration & Institutional Governance',
    location: 'St. Cecilia’s Campus, Administration Hall',
    profilePictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    headline: 'System & Alumni Relations Administrator • St. Cecilia’s College',
    about: 'Official system administrator for St. Cecilia’s College Alumni Portal. Overseeing member verification, records validation, campus event coordination, and institutional administration.',
    phone: '+63 918 987 6543',
    employeeId: 'SCC-ADM-001',
    department: 'Alumni Affairs & Institutional Advancement',
    isVerified: true,
    followersCount: 0,
    followingCount: 0,
    connectionsCount: 0,
    experience: [
      {
        id: 'exp_adm_1',
        title: 'Director of Alumni Relations',
        company: 'St. Cecilia’s College',
        location: 'Campus Administration',
        startDate: '2018-01',
        current: true,
        description: 'Coordinating institutional engagement, alumni affairs, and scholarship foundations.'
      }
    ],
    education: [
      {
        id: 'edu_adm_1',
        degree: 'Bachelor of Science in Public Administration',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Public Administration',
        startYear: '2011',
        endYear: '2015',
        honors: 'Magna Cum Laude'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'user_default_registrar',
    name: 'College Registrar',
    email: 'registrar@stcecilia.edu',
    password: 'Password123!',
    role: 'registrar',
    batch: '2018',
    course: 'Educational Management & Academic Registry',
    location: 'St. Cecilia’s Campus, Office of the Registrar',
    profilePictureUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    headline: 'Head College Registrar • St. Cecilia’s College',
    about: 'Lead Registrar overseeing academic credentials, commencement records, masterlist verification, and alumni diplomas for St. Cecilia’s College.',
    phone: '+63 917 888 2345',
    employeeId: 'SCC-REG-001',
    department: 'Office of the Registrar & Academic Records',
    isVerified: true,
    followersCount: 0,
    followingCount: 0,
    connectionsCount: 0,
    experience: [
      {
        id: 'exp_reg_1',
        title: 'Head Registrar',
        company: 'St. Cecilia’s College',
        location: 'Registrar Hall',
        startDate: '2019-06',
        current: true,
        description: 'Managing student archives, alumni diplomas, graduation certifications, and campus registry.'
      }
    ],
    education: [
      {
        id: 'edu_reg_1',
        degree: 'Bachelor of Science in Education & Records Administration',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Education',
        startYear: '2014',
        endYear: '2018',
        honors: 'Cum Laude'
      }
    ],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    uid: 'user_alumni_maria',
    name: 'Maria Carmela Santos',
    email: 'maria.santos@alumni.stcecilia.edu',
    password: 'Password123!',
    role: 'alumni',
    batch: '2023',
    course: 'BS in Information Technology',
    location: 'Cebu City, Central Visayas',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    headline: 'Full-Stack Software Engineer • Tech Innovator',
    about: 'BSIT 2023 graduate passionate about web applications, cloud systems, and mentoring fellow Cecilian coders.',
    phone: '+63 920 123 4567',
    company: 'AppCraft Labs Philippines',
    currentPosition: 'Full-Stack Software Engineer',
    industry: 'Information Technology',
    isVerified: true,
    isProfileSetupCompleted: true,
    profileCompleted: true,
    followersCount: 14,
    followingCount: 12,
    connectionsCount: 8,
    experience: [
      {
        id: 'exp_maria_1',
        title: 'Full-Stack Software Engineer',
        company: 'AppCraft Labs Philippines',
        location: 'Cebu City',
        startDate: '2023-08',
        current: true,
        description: 'Building modern web platforms and cloud APIs for regional partners.'
      }
    ],
    education: [
      {
        id: 'edu_maria_1',
        degree: 'Bachelor of Science in Information Technology',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Information Technology',
        startYear: '2019',
        endYear: '2023',
        honors: 'Magna Cum Laude'
      }
    ],
    createdAt: '2024-02-15T00:00:00.000Z'
  },
  {
    uid: 'user_alumni_john',
    name: 'John Carlo Reyes',
    email: 'john.reyes@alumni.stcecilia.edu',
    password: 'Password123!',
    role: 'alumni',
    batch: '2022',
    course: 'BS in Business Administration',
    location: 'Talisay City, Cebu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    headline: 'Senior Operations Analyst • Enterprise Supply',
    about: 'BSBA 2022 alumnus leading continuous process improvement, logistics operations, and business intelligence in Metro Cebu.',
    phone: '+63 928 234 5678',
    company: 'Visayas Logistics Group',
    currentPosition: 'Senior Operations Analyst',
    industry: 'Logistics & Supply Chain',
    isVerified: true,
    isProfileSetupCompleted: true,
    profileCompleted: true,
    followersCount: 20,
    followingCount: 18,
    connectionsCount: 15,
    experience: [
      {
        id: 'exp_john_1',
        title: 'Senior Operations Analyst',
        company: 'Visayas Logistics Group',
        location: 'Talisay City',
        startDate: '2022-09',
        current: true,
        description: 'Analyzing supply chains and driving operational efficiencies.'
      }
    ],
    education: [
      {
        id: 'edu_john_1',
        degree: 'Bachelor of Science in Business Administration',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Business Administration',
        startYear: '2018',
        endYear: '2022'
      }
    ],
    createdAt: '2024-01-20T00:00:00.000Z'
  },
  {
    uid: 'user_alumni_angelica',
    name: 'Angelica Lim',
    email: 'angelica.lim@alumni.stcecilia.edu',
    password: 'Password123!',
    role: 'alumni',
    batch: '2021',
    course: 'Bachelor of Secondary Education',
    location: 'Minglanilla, Cebu',
    profilePictureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80',
    headline: 'Lead STEM Educator & Curriculum Specialist',
    about: 'BSEd 2021 graduate devoted to student enrichment, modern pedagogical technologies, and educational leadership in southern Cebu.',
    phone: '+63 919 345 6789',
    company: 'St. Cecilia’s Academy Partner Schools',
    currentPosition: 'Lead STEM Educator',
    industry: 'Education',
    isVerified: true,
    isProfileSetupCompleted: true,
    profileCompleted: true,
    followersCount: 32,
    followingCount: 24,
    connectionsCount: 22,
    experience: [
      {
        id: 'exp_ang_1',
        title: 'Lead STEM Educator',
        company: 'St. Cecilia’s Academy Partner Schools',
        location: 'Minglanilla',
        startDate: '2021-08',
        current: true,
        description: 'Leading STEM curriculum development and student learning technologies.'
      }
    ],
    education: [
      {
        id: 'edu_ang_1',
        degree: 'Bachelor of Secondary Education',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Education',
        startYear: '2017',
        endYear: '2021',
        honors: 'Cum Laude'
      }
    ],
    createdAt: '2024-01-10T00:00:00.000Z'
  },
  {
    uid: 'user_alumni_christian',
    name: 'Christian Dave Tan',
    email: 'christian.tan@alumni.stcecilia.edu',
    password: 'Password123!',
    role: 'alumni',
    batch: '2024',
    course: 'BS in Computer Engineering',
    location: 'St. Cecilia’s Campus, Administration Hall',
    profilePictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    headline: 'Cloud Infrastructure & DevOps Engineer',
    about: 'BSCpE 2024 alumnus specializing in automated CI/CD pipelines, Kubernetes, and enterprise microservices.',
    phone: '+63 930 456 7890',
    company: 'Cebu Cloud Solutions',
    currentPosition: 'Cloud Infrastructure Specialist',
    industry: 'Cloud Computing & IT',
    isVerified: true,
    isProfileSetupCompleted: true,
    profileCompleted: true,
    followersCount: 18,
    followingCount: 15,
    connectionsCount: 10,
    experience: [
      {
        id: 'exp_chris_1',
        title: 'Cloud Infrastructure Specialist',
        company: 'Cebu Cloud Solutions',
        location: 'Cebu City',
        startDate: '2024-04',
        current: true,
        description: 'Automating continuous deployment pipelines and cloud infrastructure.'
      }
    ],
    education: [
      {
        id: 'edu_chris_1',
        degree: 'Bachelor of Science in Computer Engineering',
        institution: 'St. Cecilia’s College',
        fieldOfStudy: 'Computer Engineering',
        startYear: '2020',
        endYear: '2024'
      }
    ],
    createdAt: '2024-03-01T00:00:00.000Z'
  }
];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [];
export const INITIAL_CHATS: ChatThread[] = [];
export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {};
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_EVENTS: AlumniEvent[] = [
  {
    id: 'evt_grand_homecoming_2026',
    title: 'Grand Cecilian Alumni Homecoming & Jubilarian Gala 2026',
    type: 'reunion',
    startDate: '2026-10-24T18:00:00.000Z',
    endDate: '2026-10-24T23:30:00.000Z',
    heroImageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80',
    eventImages: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80'
    ],
    isVirtual: false,
    location: 'St. Cecilia’s College Grand Auditorium, Minglanilla, Cebu',
    description: 'The premier annual gathering of all Cecilian graduates! Honoring the Silver (2001) and Pearl (1996) Jubilarians, celebrating institutional achievements, and reconnecting across generations with live symphony performances and an alumni banquet.',
    organizerId: 'user_default_admin',
    organizerName: 'Office of Alumni Affairs',
    attendeesCount: 148,
    attendees: [
      {
        uid: 'user_alumni_maria',
        name: 'Maria Carmela Santos',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        batch: '2023',
        course: 'BS in Information Technology',
        role: 'alumni',
        registeredAt: '2026-09-10T14:20:00.000Z'
      },
      {
        uid: 'user_alumni_john',
        name: 'John Carlo Reyes',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        batch: '2022',
        course: 'BS in Business Administration',
        role: 'alumni',
        registeredAt: '2026-09-12T09:15:00.000Z'
      },
      {
        uid: 'user_alumni_angelica',
        name: 'Angelica Lim',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        batch: '2021',
        course: 'Bachelor of Secondary Education',
        role: 'alumni',
        registeredAt: '2026-09-15T11:00:00.000Z'
      }
    ],
    likes: ['user_alumni_maria', 'user_alumni_john'],
    comments: [
      {
        id: 'cmt_evt_1',
        authorId: 'user_alumni_maria',
        authorName: 'Maria Carmela Santos',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        text: 'Excited to see Batch 2023 and reunite with faculty mentors!',
        timestamp: '2026-09-16T08:30:00.000Z'
      }
    ]
  },
  {
    id: 'evt_tech_mentorship_2026',
    title: 'SCC Tech & Enterprise Career Mentorship Summit',
    type: 'workshop',
    startDate: '2026-10-10T13:00:00.000Z',
    endDate: '2026-10-10T17:00:00.000Z',
    heroImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
    isVirtual: true,
    location: 'Virtual Hybrid (Zoom Live & SCC Innovation Center)',
    description: 'Senior Cecilian alumni in software engineering, AI, business administration, and education share insider strategies on landing high-impact tech and corporate careers in Metro Cebu and abroad.',
    organizerId: 'user_default_admin',
    organizerName: 'SCC Alumni Mentorship Committee',
    attendeesCount: 86,
    attendees: [
      {
        uid: 'user_alumni_maria',
        name: 'Maria Carmela Santos',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        batch: '2023',
        course: 'BS in Information Technology',
        role: 'alumni',
        registeredAt: '2026-09-18T10:00:00.000Z'
      }
    ],
    likes: ['user_alumni_maria', 'user_alumni_christian'],
    comments: []
  },
  {
    id: 'evt_networking_cebu_2026',
    title: 'Cebu IT Park & Metro Professionals Mixer',
    type: 'networking',
    startDate: '2026-11-07T18:30:00.000Z',
    endDate: '2026-11-07T21:30:00.000Z',
    heroImageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&auto=format&fit=crop&q=80',
    isVirtual: false,
    location: 'Sky Lounge, Cebu Business Park, Cebu City',
    description: 'Casual networking evening for Cecilian professionals in technology, corporate management, entrepreneurship, and public service. Free cocktails and alumni directory networking.',
    organizerId: 'user_default_admin',
    organizerName: 'Metro Cebu Alumni Chapter',
    attendeesCount: 54,
    attendees: [],
    likes: ['user_alumni_john'],
    comments: []
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_homecoming_official_2026',
    title: 'Official 2026 Grand Alumni Homecoming & Jubilarian Honors',
    content: 'St. Cecilia’s College cordially invites all batches to the 2026 Grand Alumni Homecoming on October 24, 2026. Special commemorative medals will be conferred upon the Silver and Pearl Jubilarians. Register your batch delegation via the Events tab.',
    category: 'Institutional',
    authorId: 'user_default_admin',
    authorName: 'Office of Alumni Affairs',
    authorRole: 'admin',
    publishedAt: '2026-09-20T08:00:00.000Z',
    urgent: true,
    important: true,
    likes: 42,
    commentsCount: 9,
    pinned: true,
    views: 310
  },
  {
    id: 'ann_tracer_study_ched_2026',
    title: 'CHED & PACUCOA Graduate Tracer Study: Update Your Trajectory',
    content: 'All verified Cecilian graduates are requested to complete the CHED Institutional Tracer Record. Your prompt response helps St. Cecilia’s College maintain PACUCOA Level III accreditation and secure national student scholarship grants.',
    category: 'Academic',
    authorId: 'user_default_registrar',
    authorName: 'Office of the Registrar',
    authorRole: 'registrar',
    publishedAt: '2026-09-18T10:30:00.000Z',
    urgent: false,
    important: true,
    likes: 28,
    commentsCount: 4,
    pinned: true,
    views: 245
  },
  {
    id: 'ann_innovation_grants_2026',
    title: 'Call for Proposals: SCC Alumni Innovation & Startup Seed Fund',
    content: 'The St. Cecilia’s College Endowment Foundation has launched a ₱250,000 seed grant program for alumni-led tech ventures, educational platforms, and community social enterprises. Applications close on November 15, 2026.',
    category: 'Career',
    authorId: 'user_default_admin',
    authorName: 'College Administration & Research Board',
    authorRole: 'admin',
    publishedAt: '2026-09-14T09:15:00.000Z',
    urgent: false,
    important: false,
    likes: 35,
    commentsCount: 6,
    pinned: false,
    views: 189
  },
  {
    id: 'ann_library_archive_access',
    title: 'Lifetime Campus Library & Online Research Portal Access for Alumni',
    content: 'Active alumni are granted lifetime digital access to EBSCO, IEEE Xplore, and the St. Cecilia’s College Virtual Research Repository. Simply activate your digital alumni credential on the Profile page.',
    category: 'Campus Advisories',
    authorId: 'user_default_registrar',
    authorName: 'Library & Archival Records',
    authorRole: 'registrar',
    publishedAt: '2026-09-10T11:00:00.000Z',
    urgent: false,
    important: false,
    likes: 19,
    commentsCount: 2,
    pinned: false,
    views: 160
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_fullstack_lexmark',
    title: 'Senior Full-Stack Web Application Engineer',
    type: 'Full-time',
    company: 'Lexmark Research & Development Corp.',
    location: 'Cebu Business Park, Cebu City (Hybrid)',
    description: 'Join our cloud platforms team building enterprise-grade print management and cloud microservices using React, Node.js, and TypeScript. Cecilian alumni referrals given priority screening.',
    requirements: [
      '3+ years professional experience with TypeScript, React, and REST APIs',
      'Knowledge of cloud containerization (Docker, Kubernetes)',
      'BS in Computer Engineering, Computer Science, or Information Technology'
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    salaryOrStipend: '₱55,000 - ₱85,000 / month',
    postedByUid: 'user_default_admin',
    postedByName: 'Lexmark Alumni Partner Network',
    postedAt: '2026-09-18T08:00:00.000Z',
    deadline: '2026-10-31T23:59:59.000Z',
    status: 'active',
    approvalStatus: 'approved',
    contactEmail: 'careers@lexmark-cebu.com'
  },
  {
    id: 'opp_systems_analyst_accenture',
    title: 'Business Systems & Operations Analyst',
    type: 'Full-time',
    company: 'Accenture Technology Solutions',
    location: 'Cebu IT Park, Lahug, Cebu City',
    description: 'Seeking proactive analysts to evaluate financial workflows, streamline ERP integrations, and present predictive dashboards to multinational clients.',
    requirements: [
      'Degree in BSBA, Information Systems, or related field',
      'Strong proficiency in data analytics and process mapping',
      'Excellent verbal and written English communication skills'
    ],
    skills: ['Business Analysis', 'Excel / PowerBI', 'Process Optimization', 'ERP'],
    salaryOrStipend: '₱42,000 - ₱65,000 / month',
    postedByUid: 'user_default_admin',
    postedByName: 'Accenture Campus Talent Acquisition',
    postedAt: '2026-09-16T10:00:00.000Z',
    deadline: '2026-11-15T23:59:59.000Z',
    status: 'active',
    approvalStatus: 'approved',
    contactEmail: 'ph.talent@accenture.com'
  },
  {
    id: 'opp_junior_frontend_appcraft',
    title: 'Junior React & Mobile App Developer',
    type: 'Full-time',
    company: 'AppCraft Labs Philippines',
    location: 'Minglanilla / Cebu City (Flexible Hybrid)',
    description: 'Fast-growing software studio founded by SCC graduates hiring motivated junior developers to craft clean web apps with Tailwind CSS, React, and Capacitor.',
    requirements: [
      'Demonstrated portfolio or capstone projects in React / JavaScript',
      'Enthusiasm for UI craftsmanship, responsive layouts, and user experience',
      'BSIT or BSCpE fresh graduates encouraged to apply'
    ],
    skills: ['React', 'Tailwind CSS', 'Mobile UI', 'Git'],
    salaryOrStipend: '₱32,000 - ₱45,000 / month',
    postedByUid: 'user_alumni_maria',
    postedByName: 'Maria Carmela Santos (Alumni Referral)',
    postedAt: '2026-09-19T14:30:00.000Z',
    deadline: '2026-10-25T23:59:59.000Z',
    status: 'active',
    approvalStatus: 'approved',
    contactEmail: 'jobs@appcraftlabs.ph'
  }
];

export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap_cebu_south',
    name: 'Southern Cebu Regional Chapter',
    region: 'Minglanilla, Talisay, Naga & San Fernando',
    leadName: 'Angelica Lim',
    leadEmail: 'angelica.lim@alumni.stcecilia.edu',
    memberCount: 84,
    meetingFrequency: 'Quarterly',
    description: 'Active chapter supporting community outreach, high school mentorship, and regional alumni get-togethers in Southern Cebu.'
  },
  {
    id: 'chap_metro_cebu',
    name: 'Metro Cebu Professional Chapter',
    region: 'Cebu City, Mandaue & Lapu-Lapu',
    leadName: 'John Carlo Reyes',
    leadEmail: 'john.reyes@alumni.stcecilia.edu',
    memberCount: 142,
    meetingFrequency: 'Bi-monthly',
    description: 'Network of Cecilians working across Cebu IT Park, Cebu Business Park, and BPO/tech industries.'
  },
  {
    id: 'chap_overseas',
    name: 'Global Cecilians Diaspora Chapter',
    region: 'International (North America, Middle East, Asia-Pacific)',
    leadName: 'Maria Carmela Santos',
    leadEmail: 'maria.santos@alumni.stcecilia.edu',
    memberCount: 56,
    meetingFrequency: 'Semi-annual Virtual',
    description: 'Global chapter connecting overseas Filipino Cecilians, sponsoring scholarship endowments, and international study partnerships.'
  }
];
export const INITIAL_MILESTONES: CareerMilestone[] = [];
export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_deploy_init',
    timestamp: new Date().toISOString(),
    action: 'System Initialized for Production',
    actorId: 'user_default_admin',
    actorName: 'Administrator',
    actorRole: 'admin',
    category: 'admin',
    details: 'St. Cecilia’s College Alumni Portal initialized for production deployment. Role accounts verified.',
    severity: 'success',
    ipAddress: '127.0.0.1'
  }
];

export const INITIAL_AUTOMATION_JOBS: AutomationJob[] = [
  {
    id: 'job_reg_verifier',
    name: 'Automatic Alumni Registrar Verification & Approval',
    category: 'alumni',
    description: 'Matches incoming registrations against accredited St. Cecilia’s College registrar records and auto-approves verified graduates.',
    lastRun: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'active',
    triggerCount: 1,
    frequency: 'Instant / Event-Driven',
    nextRun: 'Listening on new registration'
  },
  {
    id: 'job_profile_completer',
    name: 'Missing Profile & Employment Update Reminders',
    category: 'alumni',
    description: 'Identifies accounts with missing employment data and delivers automated completion prompts.',
    lastRun: new Date(Date.now() - 3600000 * 26).toISOString(),
    status: 'active',
    triggerCount: 0,
    frequency: 'Weekly on Mondays',
    nextRun: new Date(Date.now() + 3600000 * 48).toISOString()
  }
];

export const INITIAL_CAREER_SURVEYS: CareerSurveyResponse[] = [];
export const INITIAL_BACKUPS: DatabaseBackupSnapshot[] = [];
