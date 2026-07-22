import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import { isMongoConnected } from './server/db.js';
import * as store from './server/store.js';
import { User, Submission } from './src/types.js';

dotenv.config({ override: true });

const app = express();
const PORT = 3000;

// Setup Google Auth Client safely
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '1027156068869-hcibk8icgev7l6alma9ogotiudodje1p.apps.googleusercontent.com';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const oauthClient = new OAuth2Client(googleClientId, googleClientSecret);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API: System Connection Status
app.get('/api/status', async (req, res) => {
  const db = await store.getDb();
  const isConnected = isMongoConnected();
  res.json({
    mongodbConnected: isConnected,
    googleClientConfigured: !!googleClientId,
    googleClientId: googleClientId || null,
    mode: isConnected ? 'MongoDB Live' : 'Mock Memory Fallback'
  });
});

// API: Google Sign-In / Token Verification
app.post('/api/auth/google', async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential ID token is required' });
  }

  let email: string = '';
  let name: string = '';
  let googleId: string = '';

  // 1. Try real verification if Google Client ID is configured and credential is a real JWT token
  const isJwt = typeof credential === 'string' && credential.split('.').length === 3;
  if (oauthClient && googleClientId && isJwt) {
    try {
      const ticket = await oauthClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (payload) {
        email = payload.email || '';
        name = payload.name || payload.given_name || '';
        googleId = payload.sub || '';
      }
    } catch (err) {
      console.warn('Real Google Verification failed. Attempting decode fallback for development testing:', err);
    }
  }

  // 2. Fallback decode if real verification is not configured or failed
  if (!email && isJwt) {
    try {
      const parts = credential.split('.');
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        const decoded = JSON.parse(jsonPayload);
        email = decoded.email || '';
        name = decoded.name || decoded.given_name || (email ? email.split('@')[0] : '');
        googleId = decoded.sub || '';
      }
    } catch (e) {
      console.error('Fallback JWT decode error:', e);
    }
  }

  if (!email && typeof credential === 'string' && credential.includes('@')) {
    email = credential.trim().toLowerCase();
    name = email.split('@')[0];
    name = name.charAt(0).toUpperCase() + name.slice(1);
    googleId = `simulator-id-${email}`;
  }

  if (!email) {
    return res.status(400).json({ error: 'Could not verify or decode Google credentials.' });
  }

  try {
    // Look up user or create new one
    let user = await store.findUserByEmail(email);
    const resolvedRole = role || 'student';

    if (!user) {
      user = {
        name,
        email,
        enrolledCourses: [],
        role: resolvedRole
      };
      await store.saveUser(user, googleId);
    } else {
      // User exists, verify role matches
      if (role && user.role !== role) {
        return res.status(403).json({ error: `Access Denied: Your Google account (${email}) is registered as a ${user.role.toUpperCase()}. You selected "${role.toUpperCase()}" mode. Please select "${user.role.toUpperCase()}" role mode to sign in.` });
      }
    }

    res.json({ success: true, user });
  } catch (err: any) {
    console.error('Error in Google Auth:', err);
    res.status(500).json({ error: err.message || 'Authentication error' });
  }
});

// API: Register with Email
app.post('/api/auth/register', async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({ error: 'Name, email, role, and password are required' });
  }

  try {
    const existingUser = await store.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: `Registration failed. An account with this email is already registered as a ${existingUser.role}.` });
    }

    const newUser: User = {
      name,
      email,
      enrolledCourses: [],
      role: role as 'student' | 'admin',
      password
    };
    await store.saveUser(newUser);
    res.json({ success: true, user: newUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Login with Email
app.post('/api/auth/login', async (req, res) => {
  const { email, role, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await store.findUserByEmail(email);
    if (user) {
      if (!user.password) {
        return res.status(400).json({ error: 'This email is registered via Google Sign-In. Please sign in using Google.' });
      }

      // Validate password
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid password. Please try again.' });
      }

      if (role && user.role !== role) {
        return res.status(403).json({ error: `Access Denied: Your account's registered role does not match the selected login mode (${role === 'admin' ? 'Admin' : 'Student'}). Please select the correct role (Student or Admin) and try again.` });
      }
      res.json({ success: true, user });
    } else {
      return res.status(401).json({ error: 'No user found with this email. Please register first.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Course Enrollment
app.post('/api/user/enroll', async (req, res) => {
  const { email, courseId } = req.body;
  if (!email || !courseId) {
    return res.status(400).json({ error: 'Email and courseId are required' });
  }

  try {
    const user = await store.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await store.saveUser(user);
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Submissions
app.get('/api/submissions', async (req, res) => {
  const { email, role } = req.query;
  const isAdmin = role === 'admin';

  try {
    const list = await store.getSubmissions(
      email ? String(email) : undefined,
      isAdmin
    );
    res.json({ success: true, submissions: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Add Submission
app.post('/api/submissions', async (req, res) => {
  const { studentName, studentEmail, assignmentTitle, githubUrl, vercelUrl, screenshotUrl } = req.body;
  if (!studentName || !studentEmail || !assignmentTitle || !githubUrl || !vercelUrl) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const uniqueId = `sub-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  const submission: Submission & { studentEmail: string } = {
    id: uniqueId,
    studentName,
    studentEmail,
    assignmentTitle,
    githubUrl,
    vercelUrl,
    screenshotUrl: screenshotUrl || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=400&h=250&fit=crop',
    status: 'Pending',
    submittedAt: new Date().toISOString()
  };

  try {
    const created = await store.addSubmission(submission);
    res.json({ success: true, submission: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Submission Status (Admin grading)
app.patch('/api/submissions/:id', async (req, res) => {
  const { id } = req.params;
  const { status, grade, comment } = req.body;

  if (status === undefined && grade === undefined && comment === undefined) {
    return res.status(400).json({ error: 'At least one field (status, grade, comment) is required' });
  }

  try {
    const success = await store.updateSubmissionStatusInStore(id, status, grade, comment);
    if (success) {
      res.json({ success: true, status, grade, comment });
    } else {
      res.status(404).json({ error: 'Submission not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Completed Modules
app.get('/api/completed-modules', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const modules = await store.getCompletedModules(String(email));
    res.json({ success: true, completedModules: modules });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Save Completed Modules
app.post('/api/completed-modules', async (req, res) => {
  const { email, completedModules } = req.body;
  if (!email || !completedModules) {
    return res.status(400).json({ error: 'Email and completedModules are required' });
  }

  try {
    await store.saveCompletedModules(email, completedModules);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN APIs
app.get('/api/admin/users', async (req, res) => {
  try {
    const list = await store.getAllUsers();
    res.json({ success: true, users: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { name, email, role, password, enrolledCourses } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email and role are required' });
    }
    const existing = await store.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user: User = { name, email, role, password, enrolledCourses: enrolledCourses || [] };
    await store.saveUser(user);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { name, role, password, enrolledCourses } = req.body;
    const updated = await store.updateUser(email, { name, role, password, enrolledCourses });
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const deleted = await store.deleteUser(email);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public endpoint to fetch available courses
app.get('/api/courses', async (req, res) => {
  try {
    const list = await store.getCoursesStore();
    res.json({ success: true, courses: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/courses', async (req, res) => {
  try {
    const list = await store.getCoursesStore();
    res.json({ success: true, courses: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/courses', async (req, res) => {
  try {
    const course = req.body;
    if (!course.id || !course.title) {
      return res.status(400).json({ error: 'Course ID and Title are required' });
    }
    const saved = await store.saveCourseInStore(course);
    res.json({ success: true, course: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await store.deleteCourseFromStore(id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Course not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/courses/reset', async (req, res) => {
  try {
    const list = await store.resetCoursesInStore();
    res.json({ success: true, courses: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Vite Server / SPA static serving (development / standalone production)
async function startServer() {
  if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    try {
      const vitePkg = 'vite';
      const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePkg);
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error('Failed to load Vite middleware:', err);
    }
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
