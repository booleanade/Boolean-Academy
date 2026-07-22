import { getDb } from './db.js';
export { getDb };
import { User, Submission, Course } from '../src/types.js';

// In-Memory Fallbacks (used if MongoDB is not configured or fails to connect)
const memoryUsers: User[] = [
  {
    name: 'Blessing Adeya',
    email: 'blessingadeya@gmail.com',
    enrolledCourses: [],
    role: 'student',
    password: 'password123'
  },
  {
    name: 'Boolean Admin',
    email: 'admin@booleanacademy.edu',
    enrolledCourses: [],
    role: 'admin',
    password: 'adminpassword'
  }
];

const initialSubmissions: Submission[] = [];

const memorySubmissions: Submission[] = [];
// Map of userEmail (lowercase) -> Record of courseId -> array of completed modules
const memoryCompletedModules: Record<string, Record<string, string[]>> = {};

const initialCourses: Course[] = [
  {
    id: 'frontend',
    title: 'Frontend Web Architecture & React',
    description: 'Master modern frontend development with React, TypeScript, Tailwind CSS, state management, and performance optimization.',
    duration: '10 Weeks',
    category: 'development',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    difficulty: 'Intermediate',
    syllabus: [
      'Module 1: HTML5, CSS3 & Modern Responsive Design (Week 1-2)',
      'Module 2: JavaScript ES6+ & Async Programming (Week 3-4)',
      'Module 3: React Fundamentals & Component Architecture (Week 5-6)',
      'Module 4: Advanced State Management & Custom Hooks (Week 7-8)',
      'Module 5: Capstone Project Deployment to Vercel (Week 9-10)'
    ]
  },
  {
    id: 'backend',
    title: 'Backend Systems & API Engineering',
    description: 'Build scalable RESTful APIs and microservices with Node.js, Express, MongoDB, PostgreSQL, and OAuth security.',
    duration: '12 Weeks',
    category: 'development',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
    difficulty: 'Intermediate',
    syllabus: [
      'Module 1: Node.js Runtime & Express Server Setup (Week 1-2)',
      'Module 2: Database Design with MongoDB & Mongoose (Week 3-5)',
      'Module 3: Authentication, JWT & Google OAuth 2.0 (Week 6-8)',
      'Module 4: API Testing, Security & Middleware Architecture (Week 9-10)',
      'Module 5: Production Deployment & Monitoring (Week 11-12)'
    ]
  },
  {
    id: 'fullstack',
    title: 'Full Stack Software Engineering',
    description: 'Comprehensive end-to-end full stack development combining React frontend with Express/MongoDB backend.',
    duration: '16 Weeks',
    category: 'development',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
    difficulty: 'Advanced',
    syllabus: [
      'Module 1: Monorepo Architecture & TypeScript Standards (Week 1-3)',
      'Module 2: Full Stack Auth Flow (Google OAuth & JWT) (Week 4-6)',
      'Module 3: Complex Data Relations & Database Optimization (Week 7-10)',
      'Module 4: CI/CD Pipelines with GitHub Actions & Vercel (Week 11-13)',
      'Module 5: Production Capstone Project & Code Review (Week 14-16)'
    ]
  },
  {
    id: 'cybersec',
    title: 'Cybersecurity & Ethical Hacking',
    description: 'Understand web security vulnerabilities, OWASP Top 10, network analysis, penetration testing, and secure coding.',
    duration: '8 Weeks',
    category: 'security',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60',
    difficulty: 'Intermediate',
    syllabus: [
      'Module 1: Network Protocols & Traffic Analysis (Week 1-2)',
      'Module 2: OWASP Top 10 Web Vulnerabilities (Week 3-4)',
      'Module 3: Penetration Testing & Ethical Hacking Basics (Week 5-6)',
      'Module 4: Incident Response & Defensive Auditing (Week 7-8)'
    ]
  },
  {
    id: 'uiux',
    title: 'UI/UX Product Design & Design Systems',
    description: 'Design intuitive digital experiences, wireframes, interactive prototypes in Figma, and build accessible UI components.',
    duration: '8 Weeks',
    category: 'design',
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60',
    difficulty: 'Beginner',
    syllabus: [
      'Module 1: User Research & Persona Creation (Week 1-2)',
      'Module 2: Wireframing & Prototyping in Figma (Week 3-4)',
      'Module 3: Design Systems & Visual Hierarchy (Week 5-6)',
      'Module 4: Usability Testing & Handoff to Engineers (Week 7-8)'
    ]
  }
];

const memoryCourses: Course[] = [...initialCourses];

let mongoSeeded = false;
let seedPromise: Promise<void> | null = null;

// Seed MongoDB with initial collections if empty and connection succeeds
async function seedMongoIfEmpty() {
  if (mongoSeeded) return;
  if (!seedPromise) {
    seedPromise = (async () => {
      const db = await getDb();
      if (!db) return;

      try {
        const submissionsCol = db.collection('submissions');
        
        // Clean up any old mock submissions that might have been seeded in previous sessions
        await submissionsCol.deleteMany({
          $or: [
            { id: { $in: ['sub-1', 'sub-2', 'sub-3'] } },
            { studentEmail: { $in: ['bayyor2010@gmail.com', 'student@booleanacademy.edu', 'mock@booleanacademy.edu'] } }
          ]
        });

        const count = await submissionsCol.countDocuments();
        if (count === 0 && initialSubmissions.length > 0) {
          console.log('Seeding MongoDB with initial academic academic submissions...');
          await submissionsCol.insertMany(initialSubmissions.map(s => ({
            ...s,
            studentEmail: s.studentEmail || 'student@booleanacademy.edu'
          })));
        }

        const usersCol = db.collection('users');
        const usersCount = await usersCol.countDocuments();
        if (usersCount === 0) {
          console.log('Seeding MongoDB with default accounts...');
          await usersCol.insertMany(memoryUsers);
        } else {
          // Robust cleanup: ensure Blessing starts with no mock enrolled courses
          await usersCol.updateOne(
            { email: 'blessingadeya@gmail.com' },
            { $set: { enrolledCourses: [] } }
          );
        }

        const coursesCol = db.collection('courses');
        const coursesCount = await coursesCol.countDocuments();
        if (coursesCount === 0 && initialCourses.length > 0) {
          console.log('Seeding MongoDB with initial academic courses...');
          await coursesCol.insertMany(initialCourses);
        }
        mongoSeeded = true;
      } catch (err: any) {
        console.warn(`Error seeding MongoDB: ${err?.message || err}`);
      }
    })();
  }
  await seedPromise;
}

// User Operations
export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const normalizedEmail = email.toLowerCase().trim();

  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('users');
    const doc = await col.findOne({ email: normalizedEmail });
    if (doc) {
      return {
        name: doc.name,
        email: doc.email,
        enrolledCourses: doc.enrolledCourses || [],
        role: doc.role as 'student' | 'admin',
        password: doc.password
      };
    }
    return null;
  } else {
    const user = memoryUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    return user || null;
  }
}

export async function saveUser(user: User, googleId?: string): Promise<User> {
  const db = await getDb();
  const normalizedUser = {
    ...user,
    email: user.email.toLowerCase().trim()
  };

  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('users');
    await col.updateOne(
      { email: normalizedUser.email },
      { $set: { ...normalizedUser, ...(googleId ? { googleId } : {}) } },
      { upsert: true }
    );
    return user;
  } else {
    const index = memoryUsers.findIndex(u => u.email.toLowerCase() === normalizedUser.email);
    if (index >= 0) {
      memoryUsers[index] = normalizedUser;
    } else {
      memoryUsers.push(normalizedUser);
    }
    return user;
  }
}

// Submissions Operations
export async function getSubmissions(email?: string, isAdmin?: boolean): Promise<Submission[]> {
  const db = await getDb();
  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('submissions');
    let query = {};
    if (email && !isAdmin) {
      query = { studentEmail: email.toLowerCase().trim() };
    }
    const docs = await col.find(query).sort({ submittedAt: -1 }).toArray();
    const seen = new Set<string>();
    const mockEmails = ['bayyor2010@gmail.com', 'student@booleanacademy.edu', 'mock@booleanacademy.edu'];
    const uniqueDocs = docs.filter(doc => {
      if (!doc.id) return false;
      if (seen.has(doc.id)) return false;
      const docEmail = (doc.studentEmail || '').toLowerCase().trim();
      if (mockEmails.includes(docEmail)) return false;
      seen.add(doc.id);
      return true;
    });
    return uniqueDocs.map(doc => ({
      id: doc.id,
      studentName: doc.studentName,
      studentEmail: doc.studentEmail || '',
      assignmentTitle: doc.assignmentTitle,
      githubUrl: doc.githubUrl,
      vercelUrl: doc.vercelUrl,
      screenshotUrl: doc.screenshotUrl,
      status: doc.status as 'Pending' | 'Approved' | 'Changes Requested',
      submittedAt: doc.submittedAt,
      grade: doc.grade,
      comment: doc.comment
    }));
  } else {
    if (email && !isAdmin) {
      const normalizedEmail = email.toLowerCase().trim();
      return memorySubmissions.filter(s => s.studentEmail?.toLowerCase() === normalizedEmail);
    }
    return memorySubmissions;
  }
}

export async function addSubmission(sub: Submission & { studentEmail: string }): Promise<Submission> {
  const db = await getDb();
  const normalizedSub = {
    ...sub,
    studentEmail: sub.studentEmail.toLowerCase().trim()
  };

  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('submissions');
    await col.insertOne(normalizedSub);
    return sub;
  } else {
    memorySubmissions.unshift(normalizedSub);
    return sub;
  }
}

export async function updateSubmissionStatusInStore(
  id: string,
  status?: 'Pending' | 'Approved' | 'Changes Requested',
  grade?: string,
  comment?: string
): Promise<boolean> {
  const db = await getDb();
  const updateFields: any = {};
  if (status !== undefined) updateFields.status = status;
  if (grade !== undefined) updateFields.grade = grade;
  if (comment !== undefined) updateFields.comment = comment;

  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('submissions');
    const res = await col.updateOne({ id }, { $set: updateFields });
    return res.matchedCount > 0;
  } else {
    const sub = memorySubmissions.find(s => s.id === id);
    if (sub) {
      if (status !== undefined) sub.status = status;
      if (grade !== undefined) sub.grade = grade;
      if (comment !== undefined) sub.comment = comment;
      return true;
    }
    return false;
  }
}

// Completed Syllabus Modules Operations
export async function getCompletedModules(email: string): Promise<Record<string, string[]>> {
  const db = await getDb();
  const normalizedEmail = email.toLowerCase().trim();

  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('completed_modules');
    const doc = await col.findOne({ email: normalizedEmail });
    return doc ? doc.modules : {};
  } else {
    return memoryCompletedModules[normalizedEmail] || {};
  }
}

export async function saveCompletedModules(email: string, modules: Record<string, string[]>): Promise<void> {
  const db = await getDb();
  const normalizedEmail = email.toLowerCase().trim();

  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('completed_modules');
    await col.updateOne(
      { email: normalizedEmail },
      { $set: { modules } },
      { upsert: true }
    );
  } else {
    memoryCompletedModules[normalizedEmail] = modules;
  }
}

// Admin & Course Store Management
export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('users');
    const docs = await col.find({}).toArray();
    
    const seen = new Set<string>();
    const uniqueDocs = [];
    for (const doc of docs) {
      const email = doc.email ? doc.email.toLowerCase().trim() : '';
      if (email && !seen.has(email)) {
        seen.add(email);
        uniqueDocs.push(doc);
      }
    }

    return uniqueDocs.map(doc => ({
      name: doc.name,
      email: doc.email,
      enrolledCourses: doc.enrolledCourses || [],
      role: doc.role as 'student' | 'admin',
      password: doc.password
    }));
  } else {
    return memoryUsers;
  }
}

export async function deleteUser(email: string): Promise<boolean> {
  const db = await getDb();
  const normalizedEmail = email.toLowerCase().trim();
  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('users');
    const res = await col.deleteOne({ email: normalizedEmail });
    return res.deletedCount > 0;
  } else {
    const idx = memoryUsers.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (idx >= 0) {
      memoryUsers.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export async function updateUser(email: string, updatedFields: Partial<User>): Promise<boolean> {
  const db = await getDb();
  const normalizedEmail = email.toLowerCase().trim();
  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('users');
    const res = await col.updateOne({ email: normalizedEmail }, { $set: updatedFields });
    return res.modifiedCount > 0;
  } else {
    const idx = memoryUsers.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (idx >= 0) {
      memoryUsers[idx] = { ...memoryUsers[idx], ...updatedFields };
      return true;
    }
    return false;
  }
}

export async function getCoursesStore(): Promise<Course[]> {
  const db = await getDb();
  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('courses');
    const docs = await col.find({}).toArray();

    const seen = new Set<string>();
    const uniqueDocs = [];
    for (const doc of docs) {
      if (doc.id && !seen.has(doc.id)) {
        seen.add(doc.id);
        uniqueDocs.push(doc);
      }
    }

    return uniqueDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      duration: doc.duration,
      category: doc.category as 'development' | 'design' | 'security',
      image: doc.image,
      syllabus: doc.syllabus || [],
      difficulty: doc.difficulty as 'Beginner' | 'Intermediate' | 'Advanced'
    }));
  } else {
    return memoryCourses;
  }
}

export async function saveCourseInStore(course: Course): Promise<Course> {
  const db = await getDb();
  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('courses');
    await col.updateOne(
      { id: course.id },
      { $set: course },
      { upsert: true }
    );
    return course;
  } else {
    const idx = memoryCourses.findIndex(c => c.id === course.id);
    if (idx >= 0) {
      memoryCourses[idx] = course;
    } else {
      memoryCourses.push(course);
    }
    return course;
  }
}

export async function deleteCourseFromStore(id: string): Promise<boolean> {
  const db = await getDb();
  if (db) {
    await seedMongoIfEmpty();
    const col = db.collection('courses');
    const res = await col.deleteOne({ id });
    return res.deletedCount > 0;
  } else {
    const idx = memoryCourses.findIndex(c => c.id === id);
    if (idx >= 0) {
      memoryCourses.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export async function resetCoursesInStore(): Promise<Course[]> {
  const db = await getDb();
  if (db) {
    const col = db.collection('courses');
    await col.deleteMany({});
    await col.insertMany(initialCourses);
    return initialCourses;
  } else {
    memoryCourses.length = 0;
    memoryCourses.push(...initialCourses);
    return memoryCourses;
  }
}

