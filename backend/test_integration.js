const http = require('http');

let adminCookie = '';
let studentCookie = '';

function request(path, options = {}, cookie = '') {
  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    if (cookie) headers['Cookie'] = cookie;
    if (options.body) headers['Content-Type'] = 'application/json';

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method: options.method || 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let setCookie = res.headers['set-cookie'];
        let cookieVal = '';
        if (setCookie && setCookie.length) {
          cookieVal = setCookie[0].split(';')[0];
        }
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), cookie: cookieVal });
        } catch {
          resolve({ status: res.statusCode, data, cookie: cookieVal });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('--- CAMPUSCONNECT FULL INTEGRATION TEST SUITE ---');
  console.log('====================================================');

  // Wait for server ready handshake
  for (let i = 0; i < 10; i++) {
    try {
      await request('/api/hackathons');
      break;
    } catch {
      await new Promise(r => setTimeout(r, 600));
    }
  }

  // 1. Admin Login
  console.log('1. Testing Admin Authentication...');
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@adaniuni.ac.in', password: 'Admin@123' })
  });
  if (adminLogin.status !== 200 || adminLogin.data.user.role !== 'admin') {
    throw new Error('Admin login failed');
  }
  adminCookie = adminLogin.cookie;
  console.log('   ✓ Admin login successful. Role:', adminLogin.data.user.role);

  // 2. Admin CMS Overview
  console.log('2. Testing Admin CMS Overview (/api/admin/overview)...');
  const overviewRes = await request('/api/admin/overview', {}, adminCookie);
  if (overviewRes.status !== 200 || !overviewRes.data.students) {
    throw new Error('Admin overview failed');
  }
  console.log('   ✓ CMS overview stats:', overviewRes.data);

  // 3. Admin Entity Lists
  console.log('3. Testing Admin Entity GET Routes (/api/admin/*)...');
  const [adminHacks, adminEvs, adminOpps, adminRes, adminProjs] = await Promise.all([
    request('/api/admin/hackathons', {}, adminCookie),
    request('/api/admin/events', {}, adminCookie),
    request('/api/admin/opportunities', {}, adminCookie),
    request('/api/admin/resources', {}, adminCookie),
    request('/api/admin/projects', {}, adminCookie)
  ]);
  if (adminHacks.status !== 200 || adminEvs.status !== 200 || adminOpps.status !== 200 || adminRes.status !== 200 || adminProjs.status !== 200) {
    throw new Error('Admin GET routes failed');
  }
  console.log(`   ✓ Admin GET routes verified: Hackathons(${adminHacks.data.hackathons.length}), Events(${adminEvs.data.events.length}), Opportunities(${adminOpps.data.opportunities.length}), Resources(${adminRes.data.resources.length}), Projects(${adminProjs.data.projects.length})`);

  // 4. Student Verification Workflow
  console.log('4. Testing Student Verification Workflow...');
  const studentsRes = await request('/api/admin/students', {}, adminCookie);
  const studentToVerify = studentsRes.data.students.find(s => s.email === 'rohan.shah@adaniuni.ac.in');
  if (!studentToVerify) throw new Error('Student rohan.shah@adaniuni.ac.in not found');

  const verifyRes = await request(`/api/admin/students/${studentToVerify._id}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'approved' })
  }, adminCookie);
  if (verifyRes.status !== 200 || verifyRes.data.student.verificationStatus !== 'approved') {
    throw new Error('Verify student failed');
  }
  console.log('   ✓ Verified student Rohan Shah successfully.');

  // 5. Admin Hackathons CRUD
  console.log('5. Testing Admin Hackathon CRUD...');
  const newHackathon = await request('/api/admin/hackathons', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Adani AI Robotics Cup 2026',
      tagline: 'Autonomous systems challenge',
      date: 'October 25 - 27, 2026',
      mode: 'In-person',
      location: 'Shantigram Robotics Lab',
      prizePool: '₹2,00,000',
      description: 'Build autonomous robotics solutions for port automation.',
      requiredSkills: 'ROS, Python, Computer Vision, C++'
    })
  }, adminCookie);
  if (newHackathon.status !== 201) throw new Error(`Create hackathon failed: ${JSON.stringify(newHackathon.data)}`);
  const hackathonId = newHackathon.data.hackathon._id;
  console.log('   ✓ Created hackathon:', newHackathon.data.hackathon.name);

  // 6. Admin Events CRUD
  console.log('6. Testing Admin Event CRUD...');
  const newEvent = await request('/api/admin/events', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Green Hydrogen Systems Symposium 2026',
      category: 'Tech Fest',
      date: 'July 5, 2026',
      time: '10:00 AM - 04:00 PM',
      venue: 'Shantigram Grand Auditorium',
      capacity: 300,
      agenda: 'Symposium on green hydrogen production.'
    })
  }, adminCookie);
  if (newEvent.status !== 201) throw new Error(`Create event failed: ${JSON.stringify(newEvent.data)}`);
  const eventId = newEvent.data.event._id;
  console.log('   ✓ Created campus event:', newEvent.data.event.title);

  // 7. Student Login
  console.log('7. Testing Student Authentication...');
  const studentLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'aarav.sharma@adaniuni.ac.in', password: 'Student@123' })
  });
  if (studentLogin.status !== 200 || studentLogin.data.user.role !== 'student') {
    throw new Error('Student login failed');
  }
  studentCookie = studentLogin.cookie;
  console.log('   ✓ Student login successful for:', studentLogin.data.user.name);

  // 8. Student Event RSVP
  console.log('8. Testing Live Event RSVP (/api/events/:id/rsvp)...');
  const rsvpRes = await request(`/api/events/${eventId}/rsvp`, { method: 'POST' }, studentCookie);
  if (rsvpRes.status !== 200 || !rsvpRes.data.isRsvpd) {
    throw new Error(`Event RSVP failed: ${JSON.stringify(rsvpRes.data)}`);
  }
  console.log('   ✓ Student RSVP confirmed. Attendee count:', rsvpRes.data.rsvpCount);

  // 9. Student Hackathon Registration
  console.log('9. Testing Hackathon Team Registration (/api/hackathons/:id/register)...');
  const regRes = await request(`/api/hackathons/${hackathonId}/register`, {
    method: 'POST',
    body: JSON.stringify({
      teamName: 'Adani Alpha Bots',
      leaderEmail: 'aarav.sharma@adaniuni.ac.in',
      track: 'Autonomous Navigation',
      memberIds: 'AU-FSET-2023-0142, AU-FSET-2022-0089',
      portfolioUrl: 'https://github.com/aaravsharma/alpha-bot'
    })
  }, studentCookie);
  if (regRes.status !== 201) throw new Error(`Team registration failed: ${JSON.stringify(regRes.data)}`);
  console.log('   ✓ Team registered successfully:', regRes.data.message);

  // 10. Student Project Creation & Deletion
  console.log('10. Testing Student Project CRUD (POST & DELETE /api/projects)...');
  const createProj = await request('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Solar Inverter IoT Monitor',
      tagline: 'Real-time telemetry for campus solar arrays',
      technologies: 'Node.js, MQTT, React',
      description: 'Monitors micro-inverter efficiency across campus.'
    })
  }, studentCookie);
  if (createProj.status !== 201) throw new Error(`Create project failed: ${JSON.stringify(createProj.data)}`);
  const studentProjId = createProj.data.project._id;
  console.log('   ✓ Student successfully uploaded project:', createProj.data.project.title);

  const deleteProj = await request(`/api/projects/${studentProjId}`, { method: 'DELETE' }, studentCookie);
  if (deleteProj.status !== 200) throw new Error(`Delete project failed: ${JSON.stringify(deleteProj.data)}`);
  console.log('   ✓ Student successfully deleted own project.');

  // 11. Student Security Barrier (403 Forbidden check)
  console.log('11. Testing Student Access Control (Forbidden barrier on Admin endpoints)...');
  const forbiddenRes = await request('/api/admin/overview', {}, studentCookie);
  if (forbiddenRes.status !== 403) {
    throw new Error(`Expected 403 Forbidden, got ${forbiddenRes.status}`);
  }
  const forbiddenDb = await request('/api/database/export', {}, studentCookie);
  if (forbiddenDb.status !== 403) {
    throw new Error(`Expected 403 Forbidden on DB Export for student, got ${forbiddenDb.status}`);
  }
  console.log('   ✓ Security check passed: Student correctly denied access to Admin CMS & DB Export (403 Forbidden).');

  // 12. Admin DB Export Download
  console.log('12. Testing Admin Database Download (/api/database/export)...');
  const dbExport = await request('/api/database/export', {}, adminCookie);
  if (dbExport.status !== 200 || !dbExport.data.summary) {
    throw new Error('Database export failed');
  }
  console.log('   ✓ Database JSON export generated successfully. Total Users:', dbExport.data.summary.totalUsers, 'Collections:', Object.keys(dbExport.data.collections).join(', '));

  // Cleanup test items
  await request(`/api/admin/hackathons/${hackathonId}`, { method: 'DELETE' }, adminCookie);
  await request(`/api/admin/events/${eventId}`, { method: 'DELETE' }, adminCookie);

  console.log('====================================================');
  console.log('ALL 12 INTEGRATION TESTS COMPLETED & PASSED PERFECTLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
