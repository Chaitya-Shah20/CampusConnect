require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

// Define Schemas matching server.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  college: { type: String, required: true, trim: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
  skills: [String],
  interests: [String],
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  collegeIdNumber: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  technologies: [String],
  github: { type: String, default: '' },
  demo: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  companyLogo: { type: String, default: '' },
  category: { type: String, default: 'Internship' },
  workMode: { type: String, default: 'On-site' },
  location: { type: String, default: 'Ahmedabad' },
  stipend: { type: String, default: '' },
  deadline: { type: String, default: '' },
  description: { type: String, default: '' },
  eligibility: { type: String, default: 'All eligible students' },
  requiredSkills: [String],
  prepTips: [String],
  link: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const hackathonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String, default: '' },
  banner: { type: String, default: '' },
  organizer: { type: String, default: 'Adani University Tech Council' },
  date: { type: String, default: '' },
  location: { type: String, default: 'Adani University Campus & Online' },
  mode: { type: String, default: 'Hybrid' },
  description: { type: String, default: '' },
  skills: [String],
  teamSize: { type: Number, default: 4 },
  minTeamSize: { type: Number, default: 2 },
  eligibility: { type: String, default: 'All enrolled undergraduate and graduate students' },
  registrationDeadline: { type: String, default: '' },
  prizePool: { type: String, default: '₹1,50,000' },
  prizes: {
    first: { type: String, default: '₹75,000' },
    second: { type: String, default: '₹45,000' },
    third: { type: String, default: '₹20,000' },
    special: { type: String, default: '₹10,000 + Goodies' }
  },
  tracks: [{ name: String, description: String }],
  schedule: [{ phase: String, time: String, detail: String }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  registrations: [{
    teamName: { type: String, required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leaderEmail: { type: String, required: true },
    memberIds: [String],
    track: { type: String, default: 'General Innovation' },
    portfolioUrl: { type: String, default: '' },
    status: { type: String, enum: ['confirmed', 'pending', 'waitlisted'], default: 'confirmed' },
    registeredAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Tech Fest' },
  banner: { type: String, default: '' },
  date: { type: String, required: true },
  time: { type: String, default: '10:00 AM - 1:00 PM' },
  venue: { type: String, default: 'Adani Institute Auditorium' },
  virtualLink: { type: String, default: '' },
  speaker: {
    name: { type: String, default: '' },
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  agenda: { type: String, default: '' },
  capacity: { type: Number, default: 200 },
  rsvps: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  subjectCode: { type: String, default: '' },
  branch: { type: String, default: 'CSE' },
  semester: { type: String, default: 'Semester 5' },
  category: { type: String, default: 'Lecture Notes' },
  fileType: { type: String, default: 'PDF' },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  downloads: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const connectionSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Opportunity = mongoose.model('Opportunity', opportunitySchema);
const Hackathon = mongoose.model('Hackathon', hackathonSchema);
const Event = mongoose.model('Event', eventSchema);
const Resource = mongoose.model('Resource', resourceSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const Question = mongoose.model('Question', questionSchema);

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected! Clearing existing collections for Adani University, Ahmedabad seed...');

    await User.deleteMany({});
    await Project.deleteMany({});
    await Opportunity.deleteMany({});
    await Hackathon.deleteMany({});
    await Event.deleteMany({});
    await Resource.deleteMany({});
    await Connection.deleteMany({});
    await Question.deleteMany({});

    console.log('Collections cleared. Creating Adani University Admin and Students...');

    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const studentPassword = await bcrypt.hash('Student@123', 12);

    const ADANI_COLLEGE = 'Adani University, Ahmedabad';

    // 1. ADMIN USER
    const admin = await User.create({
      name: 'Dr. Rajesh Parikh (Admin)',
      email: 'admin@adaniuni.ac.in',
      password: adminPassword,
      college: ADANI_COLLEGE,
      course: 'Faculty of Science, Technology & Management (Dean)',
      year: 'Faculty Administrator',
      collegeIdNumber: 'AU-ADM-2024-001',
      role: 'admin',
      verificationStatus: 'approved',
      skills: ['Academic Administration', 'Student Affairs', 'Research Collaboration', 'Institutional Mentorship'],
      interests: ['Campus Innovations', 'Adani Group Tie-ups', 'Student Hackathons'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    });

    // 2. STUDENTS
    const aarav = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@adaniuni.ac.in',
      password: studentPassword,
      college: ADANI_COLLEGE,
      course: 'B.Tech Information & Communication Technology',
      year: '3rd Year',
      collegeIdNumber: 'AU-FSET-2023-0142',
      role: 'student',
      verificationStatus: 'approved',
      skills: ['React', 'Node.js', 'Python', 'AWS', 'IoT', 'Computer Vision'],
      interests: ['Smart Port Automation', 'Clean Energy AI', 'Hackathons'],
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
    });

    const diya = await User.create({
      name: 'Diya Patel',
      email: 'diya.patel@adaniuni.ac.in',
      password: studentPassword,
      college: ADANI_COLLEGE,
      course: 'B.Tech Computer Science and Engineering (AI & ML)',
      year: '4th Year',
      collegeIdNumber: 'AU-FSET-2022-0089',
      role: 'student',
      verificationStatus: 'approved',
      skills: ['Machine Learning', 'PyTorch', 'Data Science', 'System Design', 'FastAPI'],
      interests: ['Predictive Maintenance', 'Solar Grid Optimization', 'Placements'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
    });

    const rohan = await User.create({
      name: 'Rohan Shah',
      email: 'rohan.shah@adaniuni.ac.in',
      password: studentPassword,
      college: ADANI_COLLEGE,
      course: 'B.Tech Civil & Infrastructure Engineering',
      year: '2nd Year',
      collegeIdNumber: 'AU-FSET-2024-0312',
      role: 'student',
      verificationStatus: 'pending',
      skills: ['AutoCAD', 'BIM', 'Python', 'GIS Mapping', 'Smart City Planning'],
      interests: ['High-speed Rail Infrastructure', 'Green Building', 'BIM Modelling'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    });

    const ananya = await User.create({
      name: 'Ananya Mehta',
      email: 'ananya.mehta@adaniuni.ac.in',
      password: studentPassword,
      college: ADANI_COLLEGE,
      course: 'MBA Big Data Analytics (AIDTM)',
      year: '2nd Year (Post-Grad)',
      collegeIdNumber: 'AU-AIDTM-2024-0045',
      role: 'student',
      verificationStatus: 'approved',
      skills: ['Financial Modelling', 'PowerBI', 'SQL', 'FinTech', 'Tableau', 'Python'],
      interests: ['GIFT City FinTech', 'Algorithmic Trading', 'ESG Investing'],
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
    });

    const varun = await User.create({
      name: 'Varun Joshi',
      email: 'varun.joshi@adaniuni.ac.in',
      password: studentPassword,
      college: ADANI_COLLEGE,
      course: 'B.Tech Computer Science and Engineering',
      year: '1st Year',
      collegeIdNumber: 'AU-FSET-2025-0520',
      role: 'student',
      verificationStatus: 'rejected',
      skills: ['C++', 'HTML', 'CSS', 'JavaScript'],
      interests: ['Web Development', 'Competitive Programming'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
    });

    console.log('Created Users. Creating Adani Campus Projects...');

    // 3. PROJECTS
    const p1 = await Project.create({
      title: 'Adani Smart Port IoT Cargo Monitor',
      tagline: 'Real-time telemetry and predictive container temperature monitoring for Mundra Port',
      description: 'An end-to-end telemetry system deployed with ESP32 sensors, MQTT gateway, and React dashboard that monitors perishable refrigerated containers across Mundra Port terminals with instant anomaly alerts.',
      technologies: ['React', 'Node.js', 'MQTT', 'InfluxDB', 'Docker', 'AWS IoT Core'],
      github: 'https://github.com/aaravsharma/adani-smart-port-iot',
      demo: 'https://adani-port-iot.demo.app',
      featured: true,
      creator: aarav._id,
      likes: [diya._id, ananya._id, rohan._id]
    });

    const p2 = await Project.create({
      title: 'SolarGrid AI: Khavda Solar Farm Output Predictor',
      tagline: 'Deep learning irradiance forecasting for the world\'s largest 30GW renewable park',
      description: 'Utilizing PyTorch LSTM models trained on satellite weather data and historical solar radiation metrics to predict hourly power output from Adani Green Khavda Renewable Park with 94.6% accuracy.',
      technologies: ['Python', 'PyTorch', 'FastAPI', 'Pandas', 'Next.js', 'PostgreSQL'],
      github: 'https://github.com/diyapatel/solargrid-ai-khavda',
      demo: 'https://solargrid-ai.demo.app',
      featured: true,
      creator: diya._id,
      likes: [aarav._id, ananya._id]
    });

    const p3 = await Project.create({
      title: 'Shantigram Campus BIM 3D Digital Twin',
      tagline: 'Interactive 3D model of Adani University campus facilities for smart energy tracking',
      description: 'A 3D WebGL building information model of Adani University FSET & AIDTM academic blocks, enabling facility managers to track HVAC power consumption and room occupancy heatmaps in real time.',
      technologies: ['Three.js', 'AutoCAD BIM', 'Node.js', 'WebGL', 'TailwindCSS'],
      github: 'https://github.com/rohanshah/shantigram-bim-digital-twin',
      demo: 'https://shantigram-bim.demo.app',
      featured: false,
      creator: rohan._id,
      likes: [aarav._id]
    });

    const p4 = await Project.create({
      title: 'GIFT City FinTech Algorithmic Arbitrage Engine',
      tagline: 'High-frequency cross-exchange order-book arbitrage simulator for IFSC exchanges',
      description: 'Built during the GIFT City FinTech sandbox sprint to analyze microsecond order books between NSE IFSC and international bullion markets, incorporating automated risk controls.',
      technologies: ['Python', 'Rust', 'WebSockets', 'Redis', 'React'],
      github: 'https://github.com/ananyamehta/gift-fintech-arbitrage',
      demo: 'https://gift-arbitrage.demo.app',
      featured: true,
      creator: ananya._id,
      likes: [aarav._id, diya._id, rohan._id]
    });

    console.log('Created Projects. Creating Hackathons...');

    // 4. HACKATHONS
    await Hackathon.create({
      name: 'HackAdani 2026: AI & Smart Infrastructure',
      tagline: 'Build groundbreaking solutions in Smart Logistics, Clean Tech & Renewable Energy',
      banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      organizer: 'Adani University FSET & Adani Group Innovation Hub',
      date: 'April 18 - 20, 2026',
      location: 'Adani University Shantigram Campus (Auditorium & Labs) / Hybrid',
      mode: 'Hybrid',
      description: 'The flagship national hackathon of Adani University. 36 hours of intense building, expert mentorship from Adani AI Labs engineers, and direct pilot deployment opportunities for winning prototypes.',
      skills: ['Machine Learning', 'Full Stack', 'IoT', 'CleanTech', 'Cloud Architecture'],
      teamSize: 4,
      minTeamSize: 2,
      eligibility: 'All enrolled undergraduate, graduate, and diploma engineering students',
      registrationDeadline: 'April 12, 2026',
      prizePool: '₹2,50,000',
      prizes: {
        first: '₹1,25,000 + Adani Innovation Incubator Pre-Seed Grant',
        second: '₹75,000 + Cloud Credits & Fast-track Internship',
        third: '₹35,000 + Tech Goodies & Mentorship',
        special: '₹15,000 Best CleanTech / ESG Solution'
      },
      tracks: [
        { name: 'Smart Logistics & Port Robotics', description: 'Autonomous container stacking, predictive berth scheduling, vision-based defect inspection.' },
        { name: 'Clean Energy & Smart Grid', description: 'AI forecasting for solar/wind farms, microgrid battery optimization, carbon footprint tracking.' },
        { name: 'Smart Campus & Sustainable Infra', description: 'Digital twin campus navigation, intelligent HVAC conservation, smart water stewardship.' },
        { name: 'FinTech & Supply Chain Finance', description: 'Blockchain bill of lading, ESG compliance verification, cross-border settlement.' }
      ],
      schedule: [
        { phase: 'Registrations Open', time: 'March 1, 2026', detail: 'Team formation and idea submission portal opens online.' },
        { phase: 'Shortlisting & Mentorship', time: 'April 14, 2026', detail: 'Top 50 teams invited to Shantigram campus for hackathon kickoff.' },
        { phase: '36-Hour Hackathon Sprint', time: 'April 18 09:00 AM', detail: 'Hacking commences with milestone reviews at hours 12, 24, and 32.' },
        { phase: 'Grand Jury Demos & Awards', time: 'April 20 03:00 PM', detail: 'Live presentations before Adani Executive Leadership and academic deans.' }
      ],
      members: [aarav._id, diya._id],
      registrations: [
        {
          teamName: 'Mundra Innovators',
          leader: aarav._id,
          leaderEmail: 'aarav.sharma@adaniuni.ac.in',
          memberIds: ['AU-FSET-2023-0142', 'AU-FSET-2022-0089'],
          track: 'Smart Logistics & Port Robotics',
          portfolioUrl: 'https://github.com/aaravsharma',
          status: 'confirmed',
          registeredAt: new Date()
        }
      ]
    });

    await Hackathon.create({
      name: 'Adani GreenTech Clean Energy Sprint 2026',
      tagline: 'Pioneering net-zero energy systems and grid resilience algorithms',
      banner: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80',
      organizer: 'Adani Institute of Infrastructure (AII) & Energy Club',
      date: 'May 8 - 10, 2026',
      location: 'FSET Energy Simulation Lab & Virtual Discord',
      mode: 'In-person',
      description: 'Collaborate with fellow innovators to solve real engineering bottlenecks in renewable energy integration, high-capacity battery degradation models, and green hydrogen supply chains.',
      skills: ['Python', 'Energy Systems', 'Data Science', 'Embedded C', 'Simulink'],
      teamSize: 3,
      minTeamSize: 2,
      eligibility: 'B.Tech (all disciplines), M.Tech, and Research Scholars',
      registrationDeadline: 'May 2, 2026',
      prizePool: '₹1,50,000',
      prizes: {
        first: '₹80,000 + Sponsored R&D Prototyping Budget',
        second: '₹45,000 + Summer Fellowship at Adani Solar R&D',
        third: '₹25,000 + Certifications & Equipment Vouchers',
        special: 'Special ESG Green Innovation Trophy'
      },
      tracks: [
        { name: 'Solar PV Soiling Detection', description: 'Computer vision drones detecting dust accumulation on solar panel arrays.' },
        { name: 'Battery Health AI', description: 'Li-Ion degradation prediction using physics-informed neural networks.' }
      ],
      schedule: [
        { phase: 'Team Registration', time: 'April 20, 2026', detail: 'Register teams of 2 to 3 students.' },
        { phase: 'Hackathon Sprint', time: 'May 8, 2026', detail: '48 hours hands-on sprint at Shantigram Energy Lab.' }
      ],
      members: [diya._id],
      registrations: []
    });

    console.log('Created Hackathons. Creating Campus Events...');

    // 5. CAMPUS EVENTS
    await Event.create({
      title: 'Adani University Annual TechFest 2026 — Keynote & Expo',
      category: 'Tech Fest',
      banner: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      date: 'April 25, 2026',
      time: '09:30 AM - 05:30 PM',
      venue: 'Adani University Shantigram Grand Auditorium',
      virtualLink: 'https://youtube.com/live/adani-techfest-2026',
      speaker: {
        name: 'Dr. Vikram Chandra',
        title: 'Chief Technology Officer',
        company: 'Adani AI & Digital Labs',
        bio: 'Leading enterprise AI transformations across ports, green hydrogen, and renewable grids with over 20 years in industrial automation.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
      },
      agenda: '09:30 AM Keynote Address: The Future of Industrial AI | 11:30 AM Student Innovation Expo | 02:00 PM Robotics Battle Ground | 04:30 PM Awards & Felicitations.',
      capacity: 350,
      rsvps: [
        { user: aarav._id, registeredAt: new Date() },
        { user: diya._id, registeredAt: new Date() },
        { user: rohan._id, registeredAt: new Date() }
      ]
    });

    await Event.create({
      title: 'Hands-on Workshop: Scalable Full-Stack Engineering with Next.js & AWS',
      category: 'Workshop',
      banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
      date: 'May 3, 2026',
      time: '02:00 PM - 05:30 PM',
      venue: 'Computer Lab 4 (FSET Building, 2nd Floor)',
      virtualLink: 'https://meet.google.com/adani-fset-workshop',
      speaker: {
        name: 'Neha Singhal',
        title: 'Senior Cloud Architect',
        company: 'Amazon Web Services (AWS)',
        bio: 'Specialist in serverless cloud patterns, micro-frontends, and high-throughput databases.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
      },
      agenda: 'Hands-on session where students will build, test, and deploy a containerized microservice to AWS ECS with CI/CD GitHub Actions pipeline.',
      capacity: 80,
      rsvps: [
        { user: aarav._id, registeredAt: new Date() },
        { user: ananya._id, registeredAt: new Date() }
      ]
    });

    await Event.create({
      title: 'Guest Lecture: FinTech & Cross-Border Regulatory Sandboxes in GIFT City',
      category: 'Guest Lecture',
      banner: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      date: 'May 12, 2026',
      time: '11:00 AM - 01:00 PM',
      venue: 'AIDTM Seminar Hall (Room 105)',
      virtualLink: 'https://zoom.us/j/adani-aidtm-lecture',
      speaker: {
        name: 'Saurabh Varma',
        title: 'Executive Director, Market Innovations',
        company: 'IFSCA (GIFT City Authority)',
        bio: 'Key architect of the unified financial regulatory framework governing foreign institutions in GIFT City IFSC.',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
      },
      agenda: 'Overview of IFSC regulatory exemptions, algorithmic trading guidelines, and student internship pathways in GIFT City.',
      capacity: 120,
      rsvps: [
        { user: ananya._id, registeredAt: new Date() }
      ]
    });

    await Event.create({
      title: 'CodeSprint 2026: Campus Competitive Programming League',
      category: 'Coding Contest',
      banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      date: 'May 16, 2026',
      time: '04:00 PM - 07:00 PM',
      venue: 'Online on HackerRank & FSET Central Computing Centre',
      virtualLink: 'https://hackerrank.com/adani-codesprint-2026',
      speaker: {
        name: 'Adani Coding Club Coordinators',
        title: 'Student Leads',
        company: 'CampusConnect Tech Team',
        bio: 'Organized by Senior competitive programmers and ICPC regionalists.',
        avatar: ''
      },
      agenda: '6 algorithmic problem statements ranging from dynamic programming to graph theory. Live leaderboard displayed in campus canteen!',
      capacity: 250,
      rsvps: [
        { user: aarav._id, registeredAt: new Date() },
        { user: diya._id, registeredAt: new Date() }
      ]
    });

    console.log('Created Campus Events. Creating Opportunities...');

    // 6. OPPORTUNITIES
    await Opportunity.create({
      title: 'Machine Learning Engineering Intern',
      organization: 'Adani AI Labs & Digital Solutions',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      category: 'Internship',
      workMode: 'Hybrid',
      location: 'Shantigram, SG Highway, Ahmedabad',
      stipend: '₹40,000 / month',
      deadline: 'May 20, 2026',
      description: 'Work with the principal research scientists on large-scale multimodal vision and time-series forecasting models for smart infrastructure assets.',
      eligibility: 'B.Tech 3rd/4th year (CSE, AI/ML, ICT) or M.Tech students with CGPA 7.5+',
      requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'REST APIs', 'Docker', 'DSA'],
      prepTips: [
        'Review deep learning fundamentals: CNNs, Transformers, and Time Series LSTM architectures.',
        'Be prepared for a live 45-minute coding interview covering LeetCode Medium algorithms.',
        'Showcase at least one public GitHub repository demonstrating an end-to-end ML deployment.'
      ],
      link: 'https://adani.careers/students/ml-intern-2026'
    });

    await Opportunity.create({
      title: 'Full-Stack Software Engineer (Campus Placement)',
      organization: 'Adani Ports and Special Economic Zone Ltd (APSEZ)',
      companyLogo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=120&q=80',
      category: 'Full-Time Job',
      workMode: 'On-site',
      location: 'Ahmedabad & Mundra Port Campus',
      stipend: '₹12.5 - 16.0 LPA',
      deadline: 'June 10, 2026',
      description: 'Design and implement critical cloud services powering terminal automation systems, digital gate clearance, and smart tracking for millions of TEU shipping containers.',
      eligibility: 'Final Year B.Tech students graduating in 2026 with no active backlogs',
      requiredSkills: ['Java or Go', 'React or Vue.js', 'PostgreSQL', 'Kubernetes', 'Microservices'],
      prepTips: [
        'Strong focus on System Design: caching with Redis, message queues (Kafka), and ACID transactions.',
        'Brush up on relational schema design and SQL query optimizations.',
        'Prepare your past project stories using the STAR method.'
      ],
      link: 'https://adani.careers/fset/campus-placements-2026'
    });

    await Opportunity.create({
      title: 'FinTech Quantitative Analyst Trainee',
      organization: 'GIFT City International Exchange Consortium',
      companyLogo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=120&q=80',
      category: 'Placement Drive',
      workMode: 'On-site',
      location: 'GIFT City IFSC, Gandhinagar / Ahmedabad',
      stipend: '₹14.0 - 18.0 LPA',
      deadline: 'May 30, 2026',
      description: 'Join the quantitative trading research desk developing statistical arbitrage models, volatility surfaces, and risk management frameworks for multi-currency contracts.',
      eligibility: 'Open to B.Tech (All branches) & MBA AIDTM students with strong mathematical aptitude',
      requiredSkills: ['Python', 'Quantitative Finance', 'Statistics', 'SQL', 'Excel / PowerBI'],
      prepTips: [
        'Study derivatives pricing, Black-Scholes model, and portfolio optimization basics.',
        'Practice probability and brain-teaser puzzle questions common in quantitative interviews.',
        'Familiarize yourself with IFSC guidelines and GIFT City financial regulations.'
      ],
      link: 'https://giftcity.ifsc.gov.in/careers/quant-2026'
    });

    await Opportunity.create({
      title: 'IoT & Firmware Engineering Summer Intern',
      organization: 'Adani Solar Manufacturing Hub',
      companyLogo: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=120&q=80',
      category: 'Internship',
      workMode: 'On-site',
      location: 'Mundra & Ahmedabad Labs',
      stipend: '₹30,000 / month',
      deadline: 'May 15, 2026',
      description: 'Hands-on embedded firmware development for smart solar string inverters, battery management systems, and Modbus/Zigbee industrial gateways.',
      eligibility: 'B.Tech 2nd & 3rd Year (ICT, Electrical, Electronics, CSE)',
      requiredSkills: ['Embedded C', 'FreeRTOS', 'I2C/SPI', 'MQTT', 'Microcontrollers (STM32/ESP32)'],
      prepTips: [
        'Demonstrate hands-on hobby projects with Arduino or ESP32.',
        'Review memory management and interrupt service routines in C.',
        'Understand standard industrial communication protocols like RS485 and Modbus.'
      ],
      link: 'https://adanisolar.com/careers/internships'
    });

    console.log('Created Opportunities. Creating Academic Resources...');

    // 7. ACADEMIC RESOURCES (Organized by Branch, Semester, Subject)
    await Resource.create({
      title: 'Data Structures & Algorithms (CS301) — Comprehensive Lecture Notes & Cheat Sheets',
      subject: 'Data Structures & Algorithms',
      subjectCode: 'CS301',
      branch: 'CSE',
      semester: 'Semester 3',
      category: 'Lecture Notes',
      fileType: 'PDF',
      url: 'https://drive.google.com/file/d/adani-cs301-dsa-notes/view',
      description: 'Complete verified classroom lecture notes covering Arrays, Linked Lists, Trees, Heaps, Graphs, Dynamic Programming and amortized time complexity analysis.',
      downloads: 342,
      uploadedBy: diya._id
    });

    await Resource.create({
      title: 'Database Management Systems (CS402) — Previous 5-Year Solved Question Papers (PYQs)',
      subject: 'Database Management Systems',
      subjectCode: 'CS402',
      branch: 'CSE',
      semester: 'Semester 4',
      category: 'PYQs',
      fileType: 'PDF',
      url: 'https://drive.google.com/file/d/adani-cs402-dbms-pyqs/view',
      description: 'Mid-semester and End-semester university exam question papers with detailed step-by-step solutions for BCNF normalization, SQL queries, and transaction recovery.',
      downloads: 489,
      uploadedBy: aarav._id
    });

    await Resource.create({
      title: 'Machine Learning & Predictive Analytics (AI501) — Official University Syllabus & Lab Manual',
      subject: 'Machine Learning',
      subjectCode: 'AI501',
      branch: 'AI/DS',
      semester: 'Semester 5',
      category: 'Official Syllabus',
      fileType: 'PDF',
      url: 'https://drive.google.com/file/d/adani-ai501-syllabus-lab/view',
      description: 'Complete course blueprint with 12 lab experiment problem statements, datasets (CIFAR, Boston Housing, Iris), and evaluation rubrics.',
      downloads: 215,
      uploadedBy: admin._id
    });

    await Resource.create({
      title: 'Computer Networks (CS503) — Curated Video Playlist & Packet Tracing Labs',
      subject: 'Computer Networks',
      subjectCode: 'CS503',
      branch: 'IT',
      semester: 'Semester 5',
      category: 'Curated Video Playlists',
      fileType: 'Video Playlist',
      url: 'https://youtube.com/playlist?list=adani-cs503-networks',
      description: '18 high-yield video lectures covering TCP/IP protocol stack, subnetting calculations, routing algorithms (OSPF, BGP), and Wireshark traffic analysis.',
      downloads: 178,
      uploadedBy: aarav._id
    });

    await Resource.create({
      title: 'Cloud Computing & DevOps (CS601) — Recommended Reference Book & Architecture Guide',
      subject: 'Cloud Computing',
      subjectCode: 'CS601',
      branch: 'CSE',
      semester: 'Semester 6',
      category: 'Recommended Textbooks',
      fileType: 'PDF',
      url: 'https://drive.google.com/file/d/adani-cs601-cloud-book/view',
      description: 'Core reference text on distributed systems, container orchestration with Kubernetes, 12-factor apps, and microservice resilience patterns.',
      downloads: 310,
      uploadedBy: admin._id
    });

    await Resource.create({
      title: 'Smart Infrastructure & BIM Technologies (CE502) — Lecture Slides & AutoCAD Assets',
      subject: 'BIM & Infrastructure Modelling',
      subjectCode: 'CE502',
      branch: 'Civil/Infra',
      semester: 'Semester 5',
      category: 'Lecture Notes',
      fileType: 'Drive Link',
      url: 'https://drive.google.com/drive/folders/adani-ce502-bim-assets',
      description: 'Class presentation slides and sample 3D Revit architectural floorplans for green infrastructure design exercises.',
      downloads: 145,
      uploadedBy: rohan._id
    });

    console.log('Created Academic Resources. Creating Connections & Questions...');

    // 8. CONNECTIONS
    await Connection.create({
      from: aarav._id,
      to: diya._id,
      status: 'accepted'
    });

    await Connection.create({
      from: rohan._id,
      to: aarav._id,
      status: 'pending'
    });

    await Connection.create({
      from: ananya._id,
      to: aarav._id,
      status: 'accepted'
    });

    // 9. QUESTIONS
    await Question.create({
      title: 'What are the recommended prerequisites for the Adani AI Labs summer internship interview?',
      description: 'I am a 3rd year ICT student preparing for the upcoming campus interview. Should I focus more on LeetCode DSA or PyTorch model implementation?',
      category: 'Career',
      author: aarav._id
    });

    await Question.create({
      title: 'How do I get access to the Shantigram High Performance Computing (HPC) GPU cluster for my final year project?',
      description: 'My team is training a 7B parameter LLM for logistics telemetry. Whom should I approach in FSET for cluster credentials?',
      category: 'Projects',
      author: diya._id
    });

    // ================= EXPORT DATABASE TO DOWNLOADABLE JSON =================
    console.log('Exporting database to downloadable JSON format...');
    const usersDump = await User.find().select('-password').lean();
    const projectsDump = await Project.find().populate('creator', 'name email college course').lean();
    const opportunitiesDump = await Opportunity.find().lean();
    const hackathonsDump = await Hackathon.find().populate('members', 'name email college').lean();
    const eventsDump = await Event.find().lean();
    const resourcesDump = await Resource.find().populate('uploadedBy', 'name email college').lean();
    const connectionsDump = await Connection.find().populate('from', 'name college').populate('to', 'name college').lean();
    const questionsDump = await Question.find().populate('author', 'name college').lean();

    const databaseDump = {
      databaseName: 'campusconnect',
      institution: 'Adani University, Ahmedabad',
      campusLocation: 'Shantigram, SG Highway, Ahmedabad, Gujarat 382421',
      coordinates: {
        latitude: 23.1539,
        longitude: 72.5446
      },
      exportedAt: new Date().toISOString(),
      summary: {
        totalUsers: usersDump.length,
        totalProjects: projectsDump.length,
        totalOpportunities: opportunitiesDump.length,
        totalHackathons: hackathonsDump.length,
        totalEvents: eventsDump.length,
        totalResources: resourcesDump.length,
        totalConnections: connectionsDump.length,
        totalQuestions: questionsDump.length
      },
      collections: {
        users: usersDump,
        projects: projectsDump,
        opportunities: opportunitiesDump,
        hackathons: hackathonsDump,
        events: eventsDump,
        resources: resourcesDump,
        connections: connectionsDump,
        questions: questionsDump
      }
    };

    const dumpJson = JSON.stringify(databaseDump, null, 2);
    const rootExportPath = path.join(__dirname, '..', 'adani_university_database.json');
    fs.writeFileSync(rootExportPath, dumpJson, 'utf-8');
    console.log(`Saved downloadable database to: ${rootExportPath}`);

    const reactPublicDir = path.join(__dirname, '..', 'campusconnect-react', 'public');
    if (fs.existsSync(reactPublicDir)) {
      fs.writeFileSync(path.join(reactPublicDir, 'adani_university_database.json'), dumpJson, 'utf-8');
    }

    console.log('====================================================');
    console.log('DATABASE SEEDED FOR ADANI UNIVERSITY, AHMEDABAD!');
    console.log('====================================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@adaniuni.ac.in');
    console.log('  Password: Admin@123');
    console.log('  Role:     admin (Approved)');
    console.log('----------------------------------------------------');
    console.log('Sample Student Accounts:');
    console.log('  1. Aarav Sharma:  aarav.sharma@adaniuni.ac.in / Student@123 (Approved)');
    console.log('  2. Diya Patel:    diya.patel@adaniuni.ac.in   / Student@123 (Approved)');
    console.log('  3. Rohan Shah:    rohan.shah@adaniuni.ac.in   / Student@123 (Pending)');
    console.log('  4. Ananya Mehta:  ananya.mehta@adaniuni.ac.in / Student@123 (Approved)');
    console.log('  5. Varun Joshi:   varun.joshi@adaniuni.ac.in  / Student@123 (Rejected)');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Database seed failed:', error);
    process.exit(1);
  }
}

seedDatabase();
