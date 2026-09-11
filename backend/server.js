require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = Number(process.env.PORT) || 3000;
const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-me';
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..')));

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
  createdAt: { type: Date, default: Date.now }
});
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true }, description: String, technologies: [String], github: String, demo: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], createdAt: { type: Date, default: Date.now }
});
const opportunitySchema = new mongoose.Schema({ title: String, organization: String, category: String, date: String, location: String, description: String, deadline: String });
const hackathonSchema = new mongoose.Schema({ name: String, date: String, location: String, description: String, skills: [String], teamSize: Number, members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] });
const resourceSchema = new mongoose.Schema({ title: String, subject: String, category: String, url: String, uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } });
const connectionSchema = new mongoose.Schema({ from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, default: 'pending' }, createdAt: { type: Date, default: Date.now } });
const questionSchema = new mongoose.Schema({ title: String, description: String, category: String, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } });
const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Opportunity = mongoose.model('Opportunity', opportunitySchema);
const Hackathon = mongoose.model('Hackathon', hackathonSchema);
const Resource = mongoose.model('Resource', resourceSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const Question = mongoose.model('Question', questionSchema);

function tokenFor(user) { return jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '7d' }); }
function publicUser(user) { const data = user.toObject(); delete data.password; return data; }
function auth(req, res, next) {
  const token = req.cookies.cc_token;
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try { req.userId = jwt.verify(token, jwtSecret).id; next(); } catch { res.status(401).json({ message: 'Your session has expired.' }); }
}
function list(value) { return String(value || '').split(',').map(item => item.trim()).filter(Boolean); }

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, college, course, year } = req.body;
    if (!name || !email || !password || !college || !course || !year) return res.status(400).json({ message: 'Please complete all required fields.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with that email already exists.' });
    const user = await User.create({ ...req.body, email: email.toLowerCase(), password: await bcrypt.hash(password, 12), skills: list(req.body.skills), interests: list(req.body.interests) });
    res.cookie('cc_token', tokenFor(user), { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});
app.post('/api/auth/login', async (req, res, next) => {
  try { const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() }); if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' }); res.cookie('cc_token', tokenFor(user), { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }); res.json({ user: publicUser(user) }); } catch (error) { next(error); }
});
app.post('/api/auth/logout', (req, res) => { res.clearCookie('cc_token'); res.json({ message: 'Logged out.' }); });
app.get('/api/auth/me', auth, async (req, res, next) => { try { res.json({ user: publicUser(await User.findById(req.userId)) }); } catch (error) { next(error); } });

app.get('/api/users', auth, async (req, res, next) => { try { const q = String(req.query.q || '').trim(); const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { course: new RegExp(q, 'i') }, { skills: new RegExp(q, 'i') }, { interests: new RegExp(q, 'i') }] } : {}; res.json({ users: (await User.find(filter).select('-password').limit(30)).filter(user => String(user._id) !== String(req.userId)) }); } catch (error) { next(error); } });
app.get('/api/users/:id', auth, async (req, res, next) => { try { res.json({ user: publicUser(await User.findById(req.params.id)) }); } catch (error) { next(error); } });
app.put('/api/users/me', auth, async (req, res, next) => { try { const allowed = ['name', 'college', 'course', 'year', 'skills', 'interests']; const update = Object.fromEntries(allowed.filter(key => req.body[key] !== undefined).map(key => [key, ['skills', 'interests'].includes(key) ? list(req.body[key]) : req.body[key]])); const user = await User.findByIdAndUpdate(req.userId, update, { new: true, runValidators: true }); res.json({ user: publicUser(user) }); } catch (error) { next(error); } });
app.post('/api/connections/:userId', auth, async (req, res, next) => { try { res.status(201).json({ connection: await Connection.create({ from: req.userId, to: req.params.userId }) }); } catch (error) { next(error); } });
app.get('/api/projects', auth, async (req, res, next) => { try { res.json({ projects: await Project.find().populate('creator', 'name course').sort('-createdAt') }); } catch (error) { next(error); } });
app.post('/api/projects', auth, async (req, res, next) => { try { res.status(201).json({ project: await Project.create({ ...req.body, creator: req.userId, technologies: list(req.body.technologies) }) }); } catch (error) { next(error); } });
app.post('/api/projects/:id/like', auth, async (req, res, next) => { try { const project = await Project.findById(req.params.id); const index = project.likes.findIndex(id => String(id) === String(req.userId)); index >= 0 ? project.likes.splice(index, 1) : project.likes.push(req.userId); await project.save(); res.json({ likes: project.likes.length }); } catch (error) { next(error); } });
app.get('/api/opportunities', async (req, res, next) => { try { res.json({ opportunities: await Opportunity.find().sort('deadline') }); } catch (error) { next(error); } });
app.get('/api/hackathons', async (req, res, next) => { try { res.json({ hackathons: await Hackathon.find().populate('members', 'name') }); } catch (error) { next(error); } });
app.post('/api/hackathons/:id/join', auth, async (req, res, next) => { try { res.json({ hackathon: await Hackathon.findByIdAndUpdate(req.params.id, { $addToSet: { members: req.userId } }, { new: true }) }); } catch (error) { next(error); } });
app.get('/api/resources', auth, async (req, res, next) => { try { res.json({ resources: await Resource.find().populate('uploadedBy', 'name').sort('-createdAt') }); } catch (error) { next(error); } });
app.post('/api/resources', auth, async (req, res, next) => { try { res.status(201).json({ resource: await Resource.create({ ...req.body, uploadedBy: req.userId }) }); } catch (error) { next(error); } });
app.get('/api/questions', async (req, res, next) => { try { res.json({ questions: await Question.find().populate('author', 'name').sort('-createdAt') }); } catch (error) { next(error); } });
app.post('/api/questions', auth, async (req, res, next) => { try { res.status(201).json({ question: await Question.create({ ...req.body, author: req.userId }) }); } catch (error) { next(error); } });

app.use('/api', (error, req, res, next) => { console.error(error); res.status(error.code === 11000 ? 409 : 500).json({ message: error.code === 11000 ? 'That record already exists.' : 'Something went wrong on the server.' }); });
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', req.path.endsWith('.html') ? req.path : 'index.html')));

mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`CampusConnect running at http://localhost:${port}`))).catch(error => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
