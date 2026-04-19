const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Task = require('./models/Task');
const Announcement = require('./models/Announcement');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  // Clear existing data
  await User.deleteMany();
  await Task.deleteMany();
  await Announcement.deleteMany();

  // Create admin
  const admin = await User.create({
    name: 'Dr. Admin Kumar',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Computer Science'
  });

  // Create students
  const students = await User.insertMany([
    { name: 'Arun Sharma', email: 'arun@student.edu', password: await bcrypt.hash('student123', 12), role: 'student', department: 'Computer Science', semester: 6 },
    { name: 'Priya Nair', email: 'priya@student.edu', password: await bcrypt.hash('student123', 12), role: 'student', department: 'Electronics', semester: 4 },
    { name: 'Rahul Verma', email: 'rahul@student.edu', password: await bcrypt.hash('student123', 12), role: 'student', department: 'Computer Science', semester: 6 },
    { name: 'Sneha Patel', email: 'sneha@student.edu', password: await bcrypt.hash('student123', 12), role: 'student', department: 'Mechanical', semester: 2 },
    { name: 'Kiran Reddy', email: 'kiran@student.edu', password: await bcrypt.hash('student123', 12), role: 'student', department: 'Computer Science', semester: 6 }
  ]);

  const studentIds = students.map((s) => s._id);

  // Create tasks
  const now = new Date();
  await Task.insertMany([
    {
      title: 'DBMS Mini Project',
      description: 'Design and implement a relational database for a library management system.',
      subject: 'Database Management',
      priority: 'high',
      status: 'pending',
      deadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      assignedTo: [studentIds[0], studentIds[2], studentIds[4]],
      createdBy: admin._id,
      estimatedHours: 8,
      tags: ['database', 'sql', 'project']
    },
    {
      title: 'Data Structures Assignment',
      description: 'Implement AVL tree with insertion, deletion, and traversal operations.',
      subject: 'Data Structures',
      priority: 'medium',
      status: 'in-progress',
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      assignedTo: studentIds,
      createdBy: admin._id,
      estimatedHours: 5,
      tags: ['algorithms', 'trees']
    },
    {
      title: 'Machine Learning Lab Report',
      description: 'Submit lab report for linear regression and classification experiments.',
      subject: 'Machine Learning',
      priority: 'critical',
      status: 'pending',
      deadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      assignedTo: [studentIds[0], studentIds[2]],
      createdBy: admin._id,
      estimatedHours: 3,
      tags: ['ml', 'report']
    },
    {
      title: 'Web Development Project',
      description: 'Build a full-stack web application using MERN stack.',
      subject: 'Web Technologies',
      priority: 'high',
      status: 'completed',
      deadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      assignedTo: [studentIds[0], studentIds[1], studentIds[2]],
      createdBy: admin._id,
      estimatedHours: 20,
      tags: ['react', 'nodejs', 'mongodb'],
      submissions: [
        { student: studentIds[0], fileUrl: '', fileName: 'project.zip', grade: 88, feedback: 'Excellent work!', status: 'graded' },
        { student: studentIds[1], fileUrl: '', fileName: 'project.zip', grade: 75, feedback: 'Good effort, improve UI.', status: 'graded' }
      ]
    },
    {
      title: 'Operating Systems Quiz Prep',
      description: 'Prepare notes on process scheduling algorithms for upcoming quiz.',
      subject: 'Operating Systems',
      priority: 'low',
      status: 'pending',
      deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      assignedTo: studentIds,
      createdBy: admin._id,
      estimatedHours: 2,
      tags: ['os', 'quiz']
    }
  ]);

  // Create announcements
  await Announcement.insertMany([
    {
      title: 'Mid-Semester Exams Schedule Released',
      content: 'Mid-semester examinations will be held from next Monday. Check the timetable on the portal.',
      createdBy: admin._id,
      targetRole: 'all',
      priority: 'urgent'
    },
    {
      title: 'Hackathon 2024 - Registrations Open',
      content: 'Annual college hackathon registrations are now open. Form teams of 3-4 and register by Friday.',
      createdBy: admin._id,
      targetRole: 'student',
      priority: 'important'
    },
    {
      title: 'Library Hours Extended',
      content: 'The college library will remain open until 10 PM during exam season.',
      createdBy: admin._id,
      targetRole: 'all',
      priority: 'normal'
    }
  ]);

  console.log('✅ Sample data seeded successfully!');
  console.log('Admin: admin@college.edu / admin123');
  console.log('Student: arun@student.edu / student123');
  process.exit();
};

seed().catch((err) => { console.error(err); process.exit(1); });
