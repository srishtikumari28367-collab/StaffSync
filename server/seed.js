require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Training = require('./models/Training');
const Announcement = require('./models/Announcement');

// ─── Helpers ────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dayMs = 86400000;
const today = new Date();
const dateStr = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD

function pastDate(daysAgo) {
  const d = new Date(today.getTime() - daysAgo * dayMs);
  return d;
}

function futureDate(daysAhead) {
  return new Date(today.getTime() + daysAhead * dayMs);
}

function randomTime(baseDate, hourMin, hourMax) {
  const d = new Date(baseDate);
  d.setHours(hourMin + Math.floor(Math.random() * (hourMax - hourMin)));
  d.setMinutes(Math.floor(Math.random() * 60));
  d.setSeconds(Math.floor(Math.random() * 60));
  return d;
}

// ─── Seed Data ──────────────────────────────────────────────────────
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync');
    console.log('🔌 Connected to MongoDB');

    // Clear all collections
    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Training.deleteMany({}),
      Announcement.deleteMany({}),
    ]);
    console.log('🗑️  Cleared all collections');

    // ──────────────────── USERS ──────────────────────────────────────
    const hr1 = await User.create({
      name: 'Hannah Rodriguez',
      email: 'hr@staffsync.com',
      password: 'password123',
      role: 'hr',
      department: 'Human Resources',
      designation: 'HR Director',
      phone: '+1-555-101-2001',
      address: '42 Maple Avenue, Suite 300, San Francisco, CA 94102',
      joinDate: pastDate(820),
      leaveBalance: 18,
      active: true,
    });

    const hr2 = await User.create({
      name: 'Priya Nair',
      email: 'priya.hr@staffsync.com',
      password: 'password123',
      role: 'hr',
      department: 'Human Resources',
      designation: 'HR Specialist',
      phone: '+1-555-101-2002',
      address: '15 Birch Lane, Apt 4B, San Francisco, CA 94103',
      joinDate: pastDate(450),
      leaveBalance: 16,
      active: true,
    });

    const mgr1 = await User.create({
      name: 'Mike Chen',
      email: 'manager@staffsync.com',
      password: 'password123',
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
      phone: '+1-555-202-3001',
      address: '88 Oak Street, Floor 5, San Jose, CA 95110',
      joinDate: pastDate(650),
      leaveBalance: 15,
      active: true,
    });

    const mgr2 = await User.create({
      name: 'Rachel Kim',
      email: 'rachel.mgr@staffsync.com',
      password: 'password123',
      role: 'manager',
      department: 'Design',
      designation: 'Design Lead',
      phone: '+1-555-202-3002',
      address: '120 Pine Road, Mountain View, CA 94041',
      joinDate: pastDate(500),
      leaveBalance: 17,
      active: true,
    });

    const mgr3 = await User.create({
      name: 'David Okafor',
      email: 'david.mgr@staffsync.com',
      password: 'password123',
      role: 'manager',
      department: 'Marketing',
      designation: 'Marketing Manager',
      phone: '+1-555-202-3003',
      address: '77 Cedar Blvd, Sunnyvale, CA 94086',
      joinDate: pastDate(380),
      leaveBalance: 19,
      active: true,
    });

    const emp1 = await User.create({
      name: 'Eva Thompson',
      email: 'employee@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      designation: 'Senior Software Engineer',
      phone: '+1-555-303-4001',
      address: '200 Elm Street, Apt 12A, Palo Alto, CA 94301',
      manager: mgr1._id,
      joinDate: pastDate(410),
      leaveBalance: 12,
      active: true,
    });

    const emp2 = await User.create({
      name: 'Sam Sharma',
      email: 'sam@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      designation: 'QA Engineer',
      phone: '+1-555-303-4002',
      address: '55 Walnut Court, Unit 7, Santa Clara, CA 95050',
      manager: mgr1._id,
      joinDate: pastDate(290),
      leaveBalance: 14,
      active: true,
    });

    const emp3 = await User.create({
      name: 'Lisa Nguyen',
      email: 'lisa@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Design',
      designation: 'UI/UX Designer',
      phone: '+1-555-303-4003',
      address: '310 Spruce Drive, Cupertino, CA 95014',
      manager: mgr2._id,
      joinDate: pastDate(200),
      leaveBalance: 18,
      active: true,
    });

    const emp4 = await User.create({
      name: 'James Okonkwo',
      email: 'james@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Marketing',
      designation: 'Content Strategist',
      phone: '+1-555-303-4004',
      address: '99 Redwood Ave, Fremont, CA 94536',
      manager: mgr3._id,
      joinDate: pastDate(150),
      leaveBalance: 20,
      active: true,
    });

    const emp5 = await User.create({
      name: 'Anika Patel',
      email: 'anika@staffsync.com',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      designation: 'DevOps Engineer',
      phone: '+1-555-303-4005',
      address: '425 Sycamore Ln, Milpitas, CA 95035',
      manager: mgr1._id,
      joinDate: pastDate(90),
      leaveBalance: 20,
      active: true,
    });

    const allUsers = [hr1, hr2, mgr1, mgr2, mgr3, emp1, emp2, emp3, emp4, emp5];
    const employees = [emp1, emp2, emp3, emp4, emp5];
    const managers = [mgr1, mgr2, mgr3];
    console.log(`👤 Created ${allUsers.length} users`);

    // ──────────────────── ATTENDANCE ─────────────────────────────────
    const attendanceRecords = [];
    const statuses = ['present', 'late', 'half-day'];

    for (const user of allUsers) {
      // Generate 25 working-day attendance records over the past 35 days
      for (let i = 1; i <= 35; i++) {
        const d = pastDate(i);
        const dow = d.getDay();
        if (dow === 0 || dow === 6) continue; // skip weekends

        // 80% present, 12% late, 8% half-day
        const roll = Math.random();
        const status = roll < 0.8 ? 'present' : roll < 0.92 ? 'late' : 'half-day';

        const checkIn = randomTime(d, status === 'late' ? 10 : 8, status === 'late' ? 12 : 10);
        const checkOut = status === 'half-day'
          ? randomTime(d, 12, 14)
          : randomTime(d, 17, 19);

        attendanceRecords.push({
          user: user._id,
          date: dateStr(d),
          checkIn,
          checkOut,
          status,
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`📋 Created ${attendanceRecords.length} attendance records`);

    // ──────────────────── LEAVES ─────────────────────────────────────
    const leaveTypes = ['casual', 'sick', 'earned', 'unpaid'];
    const leaveStatuses = ['pending', 'approved', 'rejected'];
    const leaveReasons = [
      'Family wedding ceremony in hometown',
      'Scheduled dental surgery and recovery',
      'Flu and high fever, doctor advised rest',
      'Personal relocation — moving to new apartment',
      'Annual vacation trip planned with family',
      'Child\'s school annual day event',
      'Car accident recovery, need bed rest',
      'Mental health break — feeling burned out',
      'Attending a family reunion out of state',
      'Visa appointment at the embassy',
      'Home renovation work requires supervision',
      'Volunteering at a local charity event',
      'Sister\'s graduation ceremony',
      'Severe migraine, unable to work',
      'Planned hiking trip with friends',
    ];
    const reviewNotes = [
      'Approved — enjoy your time off!',
      'Approved. Please ensure handover is done.',
      'Rejected — team has a critical deadline this week.',
      'Approved with a note: please update your tasks in Jira.',
      'Rejected — insufficient leave balance. Please apply for unpaid leave.',
      'Approved. Take care and get well soon!',
      '',
    ];

    const leaveRecords = [];

    for (const emp of employees) {
      // Give each employee 3 leave requests
      for (let j = 0; j < 3; j++) {
        const daysAgo = 5 + j * 20 + Math.floor(Math.random() * 15);
        const duration = 1 + Math.floor(Math.random() * 4); // 1–4 days
        const start = pastDate(daysAgo);
        const end = new Date(start.getTime() + (duration - 1) * dayMs);
        const status = pick(leaveStatuses);
        const reviewer = emp.manager ? allUsers.find(u => u._id.equals(emp.manager)) : pick(managers);

        leaveRecords.push({
          user: emp._id,
          type: pick(leaveTypes),
          startDate: start,
          endDate: end,
          days: duration,
          reason: pick(leaveReasons),
          status,
          reviewedBy: status !== 'pending' ? (reviewer ? reviewer._id : mgr1._id) : undefined,
          reviewNote: status !== 'pending' ? pick(reviewNotes) : '',
        });
      }
    }

    // Also give managers a leave request each (reviewed by HR)
    for (const mgr of managers) {
      const start = pastDate(25 + Math.floor(Math.random() * 30));
      const duration = 1 + Math.floor(Math.random() * 3);
      const end = new Date(start.getTime() + (duration - 1) * dayMs);
      const status = pick(['approved', 'pending']);

      leaveRecords.push({
        user: mgr._id,
        type: pick(leaveTypes),
        startDate: start,
        endDate: end,
        days: duration,
        reason: pick(leaveReasons),
        status,
        reviewedBy: status === 'approved' ? hr1._id : undefined,
        reviewNote: status === 'approved' ? 'Approved by HR.' : '',
      });
    }

    await Leave.insertMany(leaveRecords);
    console.log(`🏖️  Created ${leaveRecords.length} leave requests`);

    // ──────────────────── TRAINING ───────────────────────────────────
    const trainings = [
      {
        title: 'React 19 & Server Components Deep Dive',
        description:
          'Hands-on workshop covering React 19 features including Server Components, Actions, use() hook, and the new compiler. Includes building a full-stack app from scratch.',
        startDate: pastDate(14),
        endDate: pastDate(7),
        mode: 'online',
        createdBy: mgr1._id,
        participants: [
          { user: emp1._id, status: 'completed' },
          { user: emp2._id, status: 'completed' },
          { user: emp5._id, status: 'in-progress' },
        ],
      },
      {
        title: 'Advanced Figma for Design Systems',
        description:
          'Learn to build scalable design systems in Figma including auto-layout, component variants, design tokens, and handoff best practices for developer collaboration.',
        startDate: pastDate(30),
        endDate: pastDate(25),
        mode: 'offline',
        createdBy: mgr2._id,
        participants: [
          { user: emp3._id, status: 'completed' },
          { user: emp1._id, status: 'completed' },
        ],
      },
      {
        title: 'Cybersecurity Awareness & Best Practices',
        description:
          'Mandatory company-wide security training covering phishing detection, password hygiene, 2FA setup, data classification, and incident reporting procedures.',
        startDate: pastDate(7),
        endDate: futureDate(7),
        mode: 'online',
        createdBy: hr1._id,
        participants: allUsers.map((u) => ({
          user: u._id,
          status: pick(['assigned', 'in-progress', 'completed']),
        })),
      },
      {
        title: 'Effective Team Leadership Workshop',
        description:
          'A 3-day intensive program on situational leadership, giving constructive feedback, running effective 1-on-1s, conflict resolution, and building psychological safety.',
        startDate: futureDate(10),
        endDate: futureDate(12),
        mode: 'offline',
        createdBy: hr1._id,
        participants: managers.map((m) => ({
          user: m._id,
          status: 'assigned',
        })),
      },
      {
        title: 'Docker & Kubernetes for DevOps',
        description:
          'Containerization fundamentals, multi-stage builds, Kubernetes architecture, deployments, services, ConfigMaps, Secrets, Helm charts, and CI/CD pipeline integration.',
        startDate: pastDate(45),
        endDate: pastDate(38),
        mode: 'online',
        createdBy: mgr1._id,
        participants: [
          { user: emp5._id, status: 'completed' },
          { user: emp2._id, status: 'completed' },
          { user: emp1._id, status: 'in-progress' },
        ],
      },
      {
        title: 'Content Marketing Strategy Masterclass',
        description:
          'SEO-driven content strategy, editorial calendars, audience personas, funnel content mapping, A/B testing copy, and measuring ROI on content campaigns.',
        startDate: futureDate(5),
        endDate: futureDate(8),
        mode: 'online',
        createdBy: mgr3._id,
        participants: [
          { user: emp4._id, status: 'assigned' },
          { user: emp3._id, status: 'assigned' },
        ],
      },
    ];

    await Training.insertMany(trainings);
    console.log(`🎓 Created ${trainings.length} training programs`);

    // ──────────────────── ANNOUNCEMENTS ──────────────────────────────
    const announcements = [
      {
        title: 'Welcome to StaffSync!',
        content:
          'We are thrilled to launch StaffSync — your one-stop HR portal. Use it to apply for leaves, mark daily attendance, track training programs, and stay updated with company news. If you have any questions, reach out to the HR team.',
        category: 'announcement',
        pinned: true,
        postedBy: hr1._id,
      },
      {
        title: 'Office Diwali Celebration — October 30',
        content:
          'Join us for the annual Diwali celebration at the main campus cafeteria on October 30th from 4 PM onwards! There will be rangoli competitions, music, traditional snacks, and a gift exchange. Dress code: ethnic wear. RSVP to HR by October 28.',
        category: 'event',
        pinned: true,
        postedBy: hr2._id,
      },
      {
        title: 'Updated Work-From-Home Policy',
        content:
          'Effective November 1, 2026, all employees may work from home up to 3 days per week. Managers will coordinate in-office days to ensure team overlap. Please update your preferences in StaffSync under Settings. Full policy document attached in the shared drive.',
        category: 'policy',
        pinned: false,
        postedBy: hr1._id,
      },
      {
        title: 'Q3 2026 Revenue Milestone Achieved 🎉',
        content:
          'We are proud to announce that the company has surpassed its Q3 revenue target by 14%! This achievement is a testament to every team\'s hard work. A special town hall will be held on November 5 to celebrate and share Q4 goals.',
        category: 'news',
        pinned: false,
        postedBy: mgr3._id,
      },
      {
        title: 'Mandatory Cybersecurity Training Reminder',
        content:
          'All employees must complete the "Cybersecurity Awareness & Best Practices" training by November 15, 2026. This is a compliance requirement. Access the training from the Training section in StaffSync. Contact IT support if you face any issues.',
        category: 'announcement',
        pinned: false,
        postedBy: hr1._id,
      },
      {
        title: 'New Health Insurance Plan Options',
        content:
          'Open enrollment for the 2027 health insurance plans begins November 10. We\'ve added a new premium tier with dental and vision coverage. Comparison charts and plan details will be shared via email. Walk-in sessions with the insurance advisor available Nov 12–14.',
        category: 'policy',
        pinned: false,
        postedBy: hr2._id,
      },
      {
        title: 'Engineering Hackathon — December 2026',
        content:
          'The annual 48-hour hackathon is back! Theme: "AI-Powered Internal Tools." Form teams of 3–5 and register on the intranet by November 20. Top 3 teams win cash prizes and their projects may be adopted company-wide. Judges include CTO and VP of Product.',
        category: 'event',
        pinned: false,
        postedBy: mgr1._id,
      },
      {
        title: 'Parking Lot Renovation Notice',
        content:
          'The basement parking lot (B2) will be closed for renovation from November 3 to November 20. Please use the temporary parking area on Level G or the nearby public garage. Shuttle service from the public garage runs every 15 minutes.',
        category: 'news',
        pinned: false,
        postedBy: hr1._id,
      },
    ];

    await Announcement.insertMany(announcements);
    console.log(`📢 Created ${announcements.length} announcements`);

    // ──────────────────── Summary ────────────────────────────────────
    console.log('\n✅ Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('  LOGIN CREDENTIALS  (password: password123)');
    console.log('═══════════════════════════════════════════════');
    console.log('  HR:');
    console.log('    hr@staffsync.com');
    console.log('    priya.hr@staffsync.com');
    console.log('  Managers:');
    console.log('    manager@staffsync.com    (Engineering)');
    console.log('    rachel.mgr@staffsync.com (Design)');
    console.log('    david.mgr@staffsync.com  (Marketing)');
    console.log('  Employees:');
    console.log('    employee@staffsync.com   (Engineering)');
    console.log('    sam@staffsync.com        (Engineering)');
    console.log('    lisa@staffsync.com       (Design)');
    console.log('    james@staffsync.com      (Marketing)');
    console.log('    anika@staffsync.com      (Engineering)');
    console.log('═══════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
