const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || 'campusconnect_secret_key_2026';

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..')));

// ================= MONGOOSE SCHEMAS & MODELS =================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  college: { type: String, default: 'Adani University, Ahmedabad', trim: true },
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
  featured: { type: Boolean, default: false },
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
  category: { type: String, default: 'Internship' }, // Internship, Full-Time Job, Placement Drive, Fellowship, Workshop, Competition
  workMode: { type: String, default: 'On-site' }, // On-site, Hybrid, Remote
  location: { type: String, default: 'Ahmedabad / Shantigram' },
  stipend: { type: String, default: '' },
  deadline: { type: String, default: '' },
  description: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  eligibility: { type: String, default: 'B.Tech / MBA / BCA students' },
  requiredSkills: [String],
  prepTips: [String],
  link: { type: String, default: '' },
  applicationLink: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const hackathonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String, default: '' },
  banner: { type: String, default: '' },
  organizer: { type: String, default: 'Adani University Tech Council' },
  date: { type: String, default: '' },
  location: { type: String, default: 'Adani University Campus & Online' },
  mode: { type: String, default: 'Hybrid' }, // In-person, Online, Hybrid
  description: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  skills: [String],
  teamSize: { type: Number, default: 4 },
  minTeamSize: { type: Number, default: 2 },
  eligibility: { type: String, default: 'All enrolled undergraduate and graduate students' },
  registrationDeadline: { type: String, default: '' },
  prizePool: { type: String, default: '₹1,50,000' },
  prizes: {
    first: { type: String, default: '₹75,000' },
  featured: { type: Boolean, default: false },
  requiredSkills: [String],
    second: { type: String, default: '₹45,000' },
    third: { type: String, default: '₹20,000' },
    special: { type: String, default: '₹10,000 + Goodies' }
  },
  tracks: [{
    name: String,
    description: String
  }],
  schedule: [{
    phase: String,
    time: String,
    detail: String
  }],
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
  category: { type: String, default: 'Tech Fest' }, // Tech Fest, Guest Lecture, Workshop, Coding Contest, Orientation
  banner: { type: String, default: '' },
  date: { type: String, required: true },
  time: { type: String, default: '10:00 AM - 1:00 PM' },
  venue: { type: String, default: 'Adani Institute Auditorium' },
  virtualLink: { type: String, default: '' },
  speakerName: { type: String, default: '' },
  speakerTitle: { type: String, default: '' },
  featured: { type: Boolean, default: false },
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
  branch: { type: String, default: 'CSE' }, // CSE, IT, AI/DS, ICT, Civil/Infra, Management
  semester: { type: String, default: 'Semester 5' },
  category: { type: String, default: 'Lecture Notes' }, // Lecture Notes, PYQs, Official Syllabus, Recommended Textbooks, Curated Video Playlists
  fileType: { type: String, default: 'PDF' }, // PDF, Doc, Drive Link, Video Playlist, Zip
  url: { type: String, required: true },
  description: { type: String, default: '' },
  featured: { type: Boolean, default: false },
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

// ================= HELPERS & AUTH MIDDLEWARE =================

function tokenFor(user) {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });
}

function publicUser(user) {
  if (!user) return null;
  const data = user.toObject ? user.toObject() : { ...user };
  delete data.password;
  return data;
}

function list(value) {
  if (Array.isArray(value)) return value.map(i => String(i).trim()).filter(Boolean);
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

function auth(req, res, next) {
  const token = req.cookies.cc_token;
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

function optionalAuth(req, res, next) {
  const token = req.cookies.cc_token;
  if (token) {
    try {
      const payload = jwt.verify(token, jwtSecret);
      req.userId = payload.id;
    } catch {
      // Ignored
    }
  }
  next();
}

async function adminAuth(req, res, next) {
  const token = req.cookies.cc_token;
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User account not found.' });
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
    req.userId = user._id;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

// ================= AUTH ROUTES =================

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, course, year, collegeIdNumber, role } = req.body;
    const college = req.body.college || 'Adani University, Ahmedabad';
    if (!name || !email || !password || !course || !year) {
      return res.status(400).json({ message: 'Please complete all required fields.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'student';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      college: college.trim(),
      course: course.trim(),
      year: year.trim(),
      collegeIdNumber: (collegeIdNumber || '').trim(),
      role: assignedRole,
      verificationStatus: assignedRole === 'admin' ? 'approved' : 'pending',
      skills: list(req.body.skills),
      interests: list(req.body.interests)
    });

    const token = tokenFor(user);
    res.cookie('cc_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const redirectUrl = user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html';
    res.status(201).json({ user: publicUser(user), redirectUrl, message: 'Account created successfully!' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = tokenFor(user);
    res.cookie('cc_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const redirectUrl = user.role === 'admin' ? 'admin-dashboard.html' : 'dashboard.html';
    res.json({
      user: publicUser(user),
      redirectUrl,
      message: `Welcome back, ${user.name}!`
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('cc_token');
  res.json({ message: 'Logged out successfully.' });
});

app.get('/api/auth/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN CMS & OVERVIEW ROUTES =================

app.get('/api/admin/overview', adminAuth, async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const pendingApprovals = await User.countDocuments({ role: 'student', verificationStatus: 'pending' });
    const approvedStudents = await User.countDocuments({ role: 'student', verificationStatus: 'approved' });
    const rejectedStudents = await User.countDocuments({ role: 'student', verificationStatus: 'rejected' });
    const totalHackathons = await Hackathon.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalOpportunities = await Opportunity.countDocuments();
    const totalResources = await Resource.countDocuments();
    const totalProjects = await Project.countDocuments();

    res.json({
      students: { total: totalStudents, pending: pendingApprovals, approved: approvedStudents, rejected: rejectedStudents },
      hackathons: totalHackathons,
      events: totalEvents,
      opportunities: totalOpportunities,
      resources: totalResources,
      projects: totalProjects
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/students', adminAuth, async (req, res, next) => {
  try {
    const filter = { role: 'student' };
    if (req.query.college && req.query.college.trim()) {
      filter.college = new RegExp(req.query.college.trim(), 'i');
    }
    if (req.query.status && req.query.status !== 'all') {
      filter.verificationStatus = req.query.status;
    }
    if (req.query.q && req.query.q.trim()) {
      const q = req.query.q.trim();
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') },
        { collegeIdNumber: new RegExp(q, 'i') },
        { course: new RegExp(q, 'i') }
      ];
    }

    const students = await User.find(filter).select('-password').sort('-createdAt');
    const totalStudents = await User.countDocuments({ role: 'student' });
    const pendingApprovals = await User.countDocuments({ role: 'student', verificationStatus: 'pending' });
    const approvedStudents = await User.countDocuments({ role: 'student', verificationStatus: 'approved' });
    const rejectedStudents = await User.countDocuments({ role: 'student', verificationStatus: 'rejected' });

    res.json({
      students,
      stats: { totalStudents, pendingApprovals, approvedStudents, rejectedStudents }
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/students/:id/verify', adminAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: "Verification status must be 'approved', 'rejected', or 'pending'." });
    }

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { verificationStatus: status },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student account not found.' });
    }

    res.json({
      student,
      message: `Student ${student.name} identity status updated to '${status}'.`
    });
  } catch (error) {
    next(error);
  }
});

// Admin CMS - Hackathons CRUD
app.get('/api/admin/hackathons', adminAuth, async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find().sort('-createdAt');
    res.json({ hackathons });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/hackathons', adminAuth, async (req, res, next) => {
  try {
    const { name, tagline, banner, organizer, date, location, mode, description, skills, requiredSkills, teamSize, minTeamSize, eligibility, registrationDeadline, prizePool, prizes, tracks, schedule, featured } = req.body;
    if (!name) return res.status(400).json({ message: 'Hackathon name is required.' });

    const skillList = list(requiredSkills || skills);
    const hackathon = await Hackathon.create({
      name,
      tagline: tagline || '',
      banner: banner || '',
      organizer: organizer || 'Adani University Tech Council',
      date: date || 'Upcoming',
      location: location || 'Adani University Shantigram Campus',
      mode: mode || 'Hybrid',
      description: description || '',
      skills: skillList,
      requiredSkills: skillList,
      teamSize: Number(teamSize) || 4,
      minTeamSize: Number(minTeamSize) || 2,
      eligibility: eligibility || 'All enrolled students',
      registrationDeadline: registrationDeadline || '',
      prizePool: prizePool || '₹1,50,000',
      prizes: prizes || { first: '₹75,000', second: '₹45,000', third: '₹20,000', special: '₹10,000' },
      tracks: Array.isArray(tracks) ? tracks : [],
      schedule: Array.isArray(schedule) ? schedule : [],
      featured: Boolean(featured)
    });

    res.status(201).json({ hackathon, message: 'Hackathon created successfully!' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/hackathons/:id', adminAuth, async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.skills || update.requiredSkills) {
      const skillList = list(update.requiredSkills || update.skills);
      update.skills = skillList;
      update.requiredSkills = skillList;
    }
    const hackathon = await Hackathon.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found.' });
    res.json({ hackathon, message: 'Hackathon updated successfully.' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/hackathons/:id', adminAuth, async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found.' });
    res.json({ message: 'Hackathon deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// Admin CMS - Events CRUD
app.get('/api/admin/events', adminAuth, async (req, res, next) => {
  try {
    const events = await Event.find().sort('date');
    res.json({ events });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/events', adminAuth, async (req, res, next) => {
  try {
    const { title, category, banner, date, time, venue, virtualLink, speaker, speakerName, speakerTitle, agenda, capacity, featured } = req.body;
    if (!title || !date) return res.status(400).json({ message: 'Event title and date are required.' });

    const speakerObj = speaker || {
      name: speakerName || '',
      title: speakerTitle || '',
      company: '',
      bio: '',
      avatar: ''
    };

    const event = await Event.create({
      title,
      category: category || 'Tech Fest',
      banner: banner || '',
      date,
      time: time || '10:00 AM - 1:00 PM',
      venue: venue || 'Adani Institute Auditorium',
      virtualLink: virtualLink || '',
      speaker: speakerObj,
      speakerName: speakerName || speakerObj.name || '',
      speakerTitle: speakerTitle || speakerObj.title || '',
      agenda: agenda || '',
      capacity: Number(capacity) || 200,
      featured: Boolean(featured),
      rsvps: []
    });

    res.status(201).json({ event, message: 'Event created successfully!' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/events/:id', adminAuth, async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.speakerName && (!update.speaker || !update.speaker.name)) {
      update.speaker = update.speaker || {};
      update.speaker.name = update.speakerName;
      if (update.speakerTitle) update.speaker.title = update.speakerTitle;
    }
    const event = await Event.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event, message: 'Event updated successfully.' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/events/:id', adminAuth, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// Admin CMS - Opportunities CRUD
app.get('/api/admin/opportunities', adminAuth, async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find().sort('-createdAt');
    res.json({ opportunities });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/opportunities', adminAuth, async (req, res, next) => {
  try {
    const { title, organization, companyLogo, category, workMode, location, stipend, deadline, description, eligibility, requiredSkills, prepTips, preparationTips, link, applicationLink, featured } = req.body;
    if (!title || !organization) return res.status(400).json({ message: 'Title and organization are required.' });

    const opportunity = await Opportunity.create({
      title,
      organization,
      companyLogo: companyLogo || '',
      category: category || 'Internship',
      workMode: workMode || 'On-site',
      location: location || 'Ahmedabad',
      stipend: stipend || '',
      deadline: deadline || '',
      description: description || '',
      eligibility: eligibility || 'All eligible students',
      requiredSkills: list(requiredSkills),
      prepTips: list(preparationTips || prepTips),
      link: applicationLink || link || '',
      applicationLink: applicationLink || link || '',
      featured: Boolean(featured)
    });

    res.status(201).json({ opportunity, message: 'Opportunity posted successfully!' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/opportunities/:id', adminAuth, async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.requiredSkills) update.requiredSkills = list(update.requiredSkills);
    if (update.preparationTips || update.prepTips) update.prepTips = list(update.preparationTips || update.prepTips);
    if (update.applicationLink && !update.link) update.link = update.applicationLink;
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
    res.json({ opportunity, message: 'Opportunity updated successfully.' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/opportunities/:id', adminAuth, async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
    res.json({ message: 'Opportunity deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// Admin CMS - Resources CRUD
app.get('/api/admin/resources', adminAuth, async (req, res, next) => {
  try {
    const resources = await Resource.find().populate('uploadedBy', 'name role college').sort('-createdAt');
    res.json({ resources });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/resources', adminAuth, async (req, res, next) => {
  try {
    const { title, subject, subjectCode, branch, semester, category, fileType, url, description, featured } = req.body;
    if (!title || !subject || !url) return res.status(400).json({ message: 'Title, subject, and URL are required.' });

    const resource = await Resource.create({
      title,
      subject,
      subjectCode: subjectCode || '',
      branch: branch || 'CSE',
      semester: semester || 'Semester 5',
      category: category || 'Notes',
      fileType: fileType || 'PDF',
      url,
      description: description || '',
      featured: Boolean(featured),
      uploadedBy: req.userId
    });

    const populated = await Resource.findById(resource._id).populate('uploadedBy', 'name college role');
    res.status(201).json({ resource: populated, message: 'Resource added successfully!' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/resources/:id', adminAuth, async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('uploadedBy', 'name college role');
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json({ resource, message: 'Resource updated successfully.' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/resources/:id', adminAuth, async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found.' });
    res.json({ message: 'Resource deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

// Admin CMS - Projects Moderation
app.get('/api/admin/projects', adminAuth, async (req, res, next) => {
  try {
    const projects = await Project.find().populate('creator', 'name course college avatar verificationStatus collegeIdNumber').sort('-createdAt');
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/projects/:id/feature', adminAuth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    project.featured = !project.featured;
    await project.save();
    res.json({ project, message: project.featured ? 'Project featured!' : 'Project unfeatured.' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/projects/:id', adminAuth, async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json({ message: 'Project removed by administrator.' });
  } catch (error) {
    next(error);
  }
});

// ================= USER & PROFILE ROUTES =================

app.get('/api/users', auth, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const filter = {
      _id: { $ne: req.userId },
      role: 'student'
    };

    if (q) {
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { college: new RegExp(q, 'i') },
        { course: new RegExp(q, 'i') },
        { skills: new RegExp(q, 'i') },
        { interests: new RegExp(q, 'i') }
      ];
    }

    const users = await User.find(filter).select('-password').limit(50).sort('-createdAt');
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

app.get('/api/users/:id', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.put('/api/users/me', auth, async (req, res, next) => {
  try {
    const allowed = ['name', 'college', 'course', 'year', 'skills', 'interests', 'collegeIdNumber'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        update[key] = ['skills', 'interests'].includes(key) ? list(req.body[key]) : req.body[key];
      }
    }
    const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/mentors', optionalAuth, async (req, res, next) => {
  try {
    const filter = {
      role: 'student',
      $or: [
        { year: { $in: ['3rd Year', '4th Year', 'Alumni', 'Graduate', 'Year 3', 'Year 4'] } },
        { skills: { $in: ['System Design', 'Machine Learning', 'Full Stack', 'Cloud', 'Data Science', 'DSA', 'Mentorship', 'React', 'Python', 'AI/ML', 'Robotics'] } },
        { interests: /mentor/i }
      ]
    };
    if (req.userId) {
      filter._id = { $ne: req.userId };
    }

    const mentors = await User.find(filter).select('-password').limit(50).sort('-createdAt');
    res.json({ mentors });
  } catch (error) {
    next(error);
  }
});

// ================= CONNECTIONS ROUTES =================

app.get('/api/connections', auth, async (req, res, next) => {
  try {
    const connections = await Connection.find({
      $or: [{ from: req.userId }, { to: req.userId }]
    })
      .populate('from', 'name college course year skills avatar role verificationStatus collegeIdNumber')
      .populate('to', 'name college course year skills avatar role verificationStatus collegeIdNumber')
      .sort('-createdAt');

    res.json({ connections });
  } catch (error) {
    next(error);
  }
});

app.post('/api/connections/:userId', auth, async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    if (String(req.userId) === String(targetUserId)) {
      return res.status(400).json({ message: 'You cannot connect with yourself.' });
    }

    const existing = await Connection.findOne({
      $or: [
        { from: req.userId, to: targetUserId },
        { from: targetUserId, to: req.userId }
      ]
    });

    if (existing) {
      return res.status(200).json({
        connection: existing,
        message: existing.status === 'accepted' ? 'Already connected.' : 'Connection request already sent.'
      });
    }

    const connection = await Connection.create({
      from: req.userId,
      to: targetUserId,
      status: 'pending'
    });

    res.status(201).json({ connection, message: 'Connection request sent successfully!' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/connections/:id', auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'." });
    }

    const connection = await Connection.findOne({ _id: req.params.id, to: req.userId });
    if (!connection) {
      return res.status(404).json({ message: 'Connection request not found.' });
    }

    connection.status = status;
    await connection.save();
    res.json({ connection, message: `Connection request ${status}.` });
  } catch (error) {
    next(error);
  }
});

// ================= PROJECTS ROUTES =================

app.get('/api/projects', optionalAuth, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const filter = {};

    if (req.query.mine === 'true' && req.userId) {
      filter.creator = req.userId;
    }

    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { tagline: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { technologies: new RegExp(q, 'i') }
      ];
    }

    const projects = await Project.find(filter)
      .populate('creator', 'name course college avatar verificationStatus collegeIdNumber')
      .sort(req.query.featured === 'true' ? '-featured -createdAt' : '-createdAt');

    const formatted = projects.map(p => {
      const obj = p.toObject();
      obj.isLiked = req.userId ? (p.likes || []).some(id => String(id) === String(req.userId)) : false;
      obj.likesCount = (p.likes || []).length;
      return obj;
    });

    res.json({ projects: formatted });
  } catch (error) {
    next(error);
  }
});

app.post('/api/projects', auth, async (req, res, next) => {
  try {
    const { title, tagline, description, technologies, github, demo } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Project title is required.' });
    }

    const project = await Project.create({
      title: title.trim(),
      tagline: (tagline || '').trim(),
      description: description || '',
      technologies: list(technologies),
      github: (github || '').trim(),
      demo: (demo || '').trim(),
      creator: req.userId,
      likes: []
    });

    const populated = await Project.findById(project._id).populate('creator', 'name course college avatar verificationStatus collegeIdNumber');
    res.status(201).json({ project: populated, message: 'Project published successfully!' });
  } catch (error) {
    next(error);
  }
});

app.put('/api/projects/:id', auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    // Allow creator or admin to update
    const user = await User.findById(req.userId);
    if (String(project.creator) !== String(req.userId) && user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to edit this project.' });
    }

    const { title, tagline, description, technologies, github, demo } = req.body;
    if (title !== undefined) project.title = title.trim();
    if (tagline !== undefined) project.tagline = tagline.trim();
    if (description !== undefined) project.description = description;
    if (technologies !== undefined) project.technologies = list(technologies);
    if (github !== undefined) project.github = github.trim();
    if (demo !== undefined) project.demo = demo.trim();

    await project.save();
    const populated = await Project.findById(project._id).populate('creator', 'name course college avatar verificationStatus collegeIdNumber');
    res.json({ project: populated, message: 'Project updated successfully!' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/projects/:id', auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const user = await User.findById(req.userId);
    if (String(project.creator) !== String(req.userId) && user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this project.' });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully!' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/projects/:id/like', auth, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const index = project.likes.findIndex(id => String(id) === String(req.userId));
    let liked = false;
    if (index >= 0) {
      project.likes.splice(index, 1);
      liked = false;
    } else {
      project.likes.push(req.userId);
      liked = true;
    }

    await project.save();
    res.json({ likes: project.likes.length, liked });
  } catch (error) {
    next(error);
  }
});

// ================= HACKATHONS ROUTES =================

app.get('/api/hackathons', optionalAuth, async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find()
      .populate('members', 'name college course avatar')
      .populate('registrations.leader', 'name email college course')
      .sort('-createdAt');

    const formatted = hackathons.map(h => {
      const obj = h.toObject();
      obj.registeredTeamsCount = (h.registrations || []).length;
      if (req.userId) {
        const userReg = (h.registrations || []).find(r => 
          (r.leader && String(r.leader._id || r.leader) === String(req.userId)) ||
          (r.memberIds && r.memberIds.some(id => String(id) === String(req.userId)))
        );
        obj.myRegistration = userReg || null;
        obj.isRegistered = Boolean(userReg);
      } else {
        obj.myRegistration = null;
        obj.isRegistered = false;
      }
      return obj;
    });

    res.json({ hackathons: formatted });
  } catch (error) {
    next(error);
  }
});

app.post('/api/hackathons/:id/register', auth, async (req, res, next) => {
  try {
    const { teamName, leaderEmail, memberIds, track, portfolioUrl } = req.body;
    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ message: 'Team Name is required.' });
    }

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: 'Hackathon not found.' });

    const user = await User.findById(req.userId);
    const existing = (hackathon.registrations || []).find(r => 
      (r.leader && String(r.leader) === String(req.userId)) ||
      (r.leaderEmail && r.leaderEmail.toLowerCase() === (leaderEmail || user.email).toLowerCase())
    );

    if (existing) {
      return res.status(400).json({ message: 'You have already registered for this hackathon.' });
    }

    const registration = {
      teamName: teamName.trim(),
      leader: req.userId,
      leaderEmail: (leaderEmail || user.email).toLowerCase().trim(),
      memberIds: list(memberIds),
      track: track || 'General Innovation',
      portfolioUrl: (portfolioUrl || '').trim(),
      status: 'confirmed',
      registeredAt: new Date()
    };

    hackathon.registrations.push(registration);
    if (!hackathon.members.includes(req.userId)) {
      hackathon.members.push(req.userId);
    }

    await hackathon.save();
    res.status(201).json({
      registration,
      hackathonId: hackathon._id,
      message: `Team "${teamName}" successfully registered for ${hackathon.name}!`
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/hackathons/:id/join', auth, async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: req.userId } },
      { new: true }
    ).populate('members', 'name college course');
    res.json({ hackathon, message: 'You joined the hackathon participants list.' });
  } catch (error) {
    next(error);
  }
});

// ================= CAMPUS EVENTS ROUTES =================

app.get('/api/events', optionalAuth, async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (q && q.trim()) {
      filter.$or = [
        { title: new RegExp(q.trim(), 'i') },
        { venue: new RegExp(q.trim(), 'i') },
        { 'speaker.name': new RegExp(q.trim(), 'i') },
        { agenda: new RegExp(q.trim(), 'i') }
      ];
    }

    const events = await Event.find(filter)
      .populate('rsvps.user', 'name college course')
      .sort('date');

    const formatted = events.map(e => {
      const obj = e.toObject();
      obj.rsvpCount = (e.rsvps || []).length;
      obj.isRsvpd = req.userId ? (e.rsvps || []).some(r => String(r.user?._id || r.user) === String(req.userId)) : false;
      return obj;
    });

    res.json({ events: formatted });
  } catch (error) {
    next(error);
  }
});

app.post('/api/events/:id/rsvp', auth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    const index = (event.rsvps || []).findIndex(r => String(r.user?._id || r.user) === String(req.userId));
    let rsvpd = false;

    if (index >= 0) {
      event.rsvps.splice(index, 1);
      rsvpd = false;
    } else {
      if (event.capacity && event.rsvps.length >= event.capacity) {
        return res.status(400).json({ message: 'Event is at full capacity.' });
      }
      event.rsvps.push({ user: req.userId, registeredAt: new Date() });
      rsvpd = true;
    }

    await event.save();
    res.json({
      rsvpCount: event.rsvps.length,
      isRsvpd: rsvpd,
      attending: rsvpd,
      count: event.rsvps.length,
      message: rsvpd ? `RSVP confirmed for "${event.title}"!` : 'RSVP cancelled.'
    });
  } catch (error) {
    next(error);
  }
});

// ================= OPPORTUNITIES ROUTES =================

app.get('/api/opportunities', async (req, res, next) => {
  try {
    const { category, q, mode } = req.query;
    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (mode && mode !== 'all') {
      filter.workMode = mode;
    }
    if (q && q.trim()) {
      filter.$or = [
        { title: new RegExp(q.trim(), 'i') },
        { organization: new RegExp(q.trim(), 'i') },
        { description: new RegExp(q.trim(), 'i') },
        { requiredSkills: new RegExp(q.trim(), 'i') }
      ];
    }

    const opportunities = await Opportunity.find(filter).sort('deadline');
    res.json({ opportunities });
  } catch (error) {
    next(error);
  }
});

app.post('/api/opportunities', auth, async (req, res, next) => {
  try {
    const { title, organization, category, workMode, location, stipend, deadline, description, eligibility, requiredSkills, prepTips, link } = req.body;
    if (!title || !organization) {
      return res.status(400).json({ message: 'Title and organization are required.' });
    }

    const opp = await Opportunity.create({
      title,
      organization,
      category: category || 'Internship',
      workMode: workMode || 'On-site',
      location: location || 'Campus',
      stipend: stipend || '',
      deadline: deadline || '',
      description: description || '',
      eligibility: eligibility || 'All students',
      requiredSkills: list(requiredSkills),
      prepTips: list(prepTips),
      link: link || ''
    });

    res.status(201).json({ opportunity: opp, message: 'Opportunity posted successfully!' });
  } catch (error) {
    next(error);
  }
});

// ================= ACADEMIC RESOURCES ROUTES =================

app.get('/api/resources', optionalAuth, async (req, res, next) => {
  try {
    const { branch, semester, category, q } = req.query;
    const filter = {};

    if (branch && branch !== 'all') filter.branch = branch;
    if (semester && semester !== 'all') filter.semester = semester;
    if (category && category !== 'all') filter.category = category;
    if (q && q.trim()) {
      filter.$or = [
        { title: new RegExp(q.trim(), 'i') },
        { subject: new RegExp(q.trim(), 'i') },
        { subjectCode: new RegExp(q.trim(), 'i') },
        { description: new RegExp(q.trim(), 'i') }
      ];
    }

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name college role')
      .sort('-createdAt');

    res.json({ resources });
  } catch (error) {
    next(error);
  }
});

app.post('/api/resources', auth, async (req, res, next) => {
  try {
    const { title, subject, subjectCode, branch, semester, category, fileType, url, description } = req.body;
    if (!title || !subject || !url) {
      return res.status(400).json({ message: 'Title, subject, and resource link URL are required.' });
    }

    const resource = await Resource.create({
      title: title.trim(),
      subject: subject.trim(),
      subjectCode: (subjectCode || '').trim().toUpperCase(),
      branch: branch || 'CSE',
      semester: semester || 'Semester 5',
      category: category || 'Lecture Notes',
      fileType: fileType || 'PDF',
      url: url.trim(),
      description: description || '',
      uploadedBy: req.userId
    });

    const populated = await Resource.findById(resource._id).populate('uploadedBy', 'name college role');
    res.status(201).json({ resource: populated, message: 'Resource shared successfully with campus!' });
  } catch (error) {
    next(error);
  }
});

// ================= CAMPUS Q&A ROUTES =================

app.get('/api/questions', async (req, res, next) => {
  try {
    const questions = await Question.find().populate('author', 'name college avatar').sort('-createdAt');
    res.json({ questions });
  } catch (error) {
    next(error);
  }
});

app.post('/api/questions', auth, async (req, res, next) => {
  try {
    const { title, category, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Question title is required.' });

    const question = await Question.create({
      title,
      category: category || 'General',
      description: description || '',
      author: req.userId
    });

    const populated = await Question.findById(question._id).populate('author', 'name college');
    res.status(201).json({ question: populated, message: 'Question posted!' });
  } catch (error) {
    next(error);
  }
});

// ================= DATABASE EXPORT / DOWNLOAD ROUTE =================

app.get('/api/database/export', adminAuth, async (req, res, next) => {
  try {
    const users = await User.find().select('-password').lean();
    const projects = await Project.find().populate('creator', 'name email college course').lean();
    const opportunities = await Opportunity.find().lean();
    const hackathons = await Hackathon.find().populate('members', 'name email college').lean();
    const events = await Event.find().lean();
    const resources = await Resource.find().populate('uploadedBy', 'name email college').lean();
    const connections = await Connection.find().populate('from', 'name college').populate('to', 'name college').lean();
    const questions = await Question.find().populate('author', 'name college').lean();

    const exportData = {
      databaseName: 'campusconnect',
      institution: 'Adani University, Ahmedabad',
      campusLocation: 'Shantigram, SG Highway, Ahmedabad, Gujarat 382421',
      coordinates: {
        latitude: 23.1539,
        longitude: 72.5446
      },
      exportedAt: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalProjects: projects.length,
        totalOpportunities: opportunities.length,
        totalHackathons: hackathons.length,
        totalEvents: events.length,
        totalResources: resources.length,
        totalConnections: connections.length,
        totalQuestions: questions.length
      },
      collections: {
        users,
        projects,
        opportunities,
        hackathons,
        events,
        resources,
        connections,
        questions
      }
    };

    const formattedJson = JSON.stringify(exportData, null, 2);

    const exportFilePath = path.join(__dirname, '..', 'adani_university_database.json');
    try {
      fs.writeFileSync(exportFilePath, formattedJson, 'utf-8');
    } catch (e) {
      console.warn('Could not write export file:', e.message);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="adani_university_database.json"');
    res.send(formattedJson);
  } catch (error) {
    next(error);
  }
});

// ================= ERROR HANDLING & STATIC FALLBACK =================

app.use('/api', (error, req, res, next) => {
  console.error('API Error:', error);
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with those unique details already exists.' });
  }
  res.status(500).json({ message: error.message || 'Something went wrong on the server.' });
});

app.get('*', (req, res) => {
  const file = req.path.endsWith('.html') ? req.path : 'index.html';
  res.sendFile(path.join(__dirname, '..', file));
});

// ================= DATABASE CONNECTION WITH ROBUST ERROR HANDLING & AUTO-PORT RECOVERY =================
const { execSync } = require('child_process');
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

function killProcessOnPort(targetPort) {
  try {
    if (process.platform === 'win32') {
      // Use PowerShell to reliably find and stop any orphan process on the target port
      const psCmd = `Get-NetTCPConnection -LocalPort ${targetPort} -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -and $_.OwningProcess -ne $PID -and $_.OwningProcess -ne 0 } | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }`;
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`, { stdio: 'ignore' });
    } else {
      execSync(`lsof -ti:${targetPort} | xargs kill -9`, { stdio: 'ignore' });
    }
  } catch {
    // Port was already freed or no permission needed
  }
}

function listenServer(portToUse, retriesLeft = 3) {
  const http = require('http');
  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (retriesLeft > 0) {
        console.warn(`[Server Notice] Port ${portToUse} is occupied. Auto-recovering port (${retriesLeft} retries remaining)... `);
        killProcessOnPort(portToUse);
        setTimeout(() => {
          listenServer(portToUse, retriesLeft - 1);
        }, 800);
      } else {
        const nextPort = Number(portToUse) + 1;
        console.warn(`[Server Notice] Port ${portToUse} could not be released immediately. Automatically starting on port ${nextPort}...`);
        listenServer(nextPort, 2);
      }
    } else {
      console.error('[Server Error]', err);
      process.exit(1);
    }
  });

  server.listen(portToUse, () => {
    console.log(`[Server] CampusConnect running at http://localhost:${portToUse}`);
  });

  // Handle graceful exit so port is cleanly released
  const gracefulShutdown = () => {
    try {
      server.close(() => {
        mongoose.connection.close(false).catch(() => {}).finally(() => {
          process.exit(0);
        });
      });
    } catch {
      process.exit(0);
    }
  };

  process.once('SIGINT', gracefulShutdown);
  process.once('SIGTERM', gracefulShutdown);
}

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log(`[Database] Connected successfully to MongoDB: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    // Proactively clear stale process on port before listening
    killProcessOnPort(port);
    listenServer(port);
  })
  .catch(error => {
    console.error('====================================================');
    console.error('[Database Error] Failed to connect to MongoDB!');
    console.error(`Attempted URI: ${mongoUri}`);
    console.error(`Reason: ${error.message}`);
    console.error('Please ensure MongoDB service is running locally on port 27017:');
    console.error('  net start MongoDB');
    console.error('====================================================');
  });

mongoose.connection.on('disconnected', () => {
  console.warn('[Database Warning] MongoDB disconnected.');
});
