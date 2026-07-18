import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course, Submission, User, Testimonial, ToastMessage } from './types';
import ToastNotification from './components/ToastNotification';

interface DBStatus {
  mongodbConnected: boolean;
  googleClientConfigured: boolean;
  googleClientId: string | null;
  mode: string;
}

interface AppContextType {
  // Auth state
  currentUser: User | null;
  registerUser: (name: string, email: string, role: 'student' | 'admin', password?: string) => Promise<{ success: boolean; error?: string }>;
  loginUser: (email: string, role?: 'student' | 'admin', password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string, role?: 'student' | 'admin') => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  enrollInCourse: (courseId: string) => Promise<void>;

  // Toast notifications
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Modals state
  isLoginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
  isRegisterOpen: boolean;
  setRegisterOpen: (open: boolean) => void;
  selectedCourseId: string | null;
  setSelectedCourseId: (id: string | null) => void;

  // Assignments & Submissions
  submissions: Submission[];
  addSubmission: (title: string, github: string, vercel: string, screenshot?: string) => Promise<void>;
  updateSubmissionStatus: (submissionId: string, status?: 'Pending' | 'Approved' | 'Changes Requested', grade?: string, comment?: string) => Promise<void>;
  refreshSubmissions: () => Promise<void>;

  // Syllabus progress
  completedModules: Record<string, string[]>;
  toggleModule: (courseId: string, moduleName: string) => void;

  // Connection & DB status
  dbStatus: DBStatus | null;
  isLoading: boolean;

  // Static lists
  courses: Course[];
  refreshCourses: () => Promise<void>;
  testimonials: Testimonial[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialCourses: Course[] = [];

const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Emily Adebayo',
    role: 'Frontend Engineer at TechCorp',
    content: 'BooleanAcademy completely changed my career path. The course material was extremely direct and hands-on. I built 6 projects and deployed them all to Vercel. Within 2 months of graduating, I got hired!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'test-2',
    name: 'Marcus Vance',
    role: 'Full Stack Dev at StartupX',
    content: 'The assignment submission flow is brilliant. Submitting real Vercel and GitHub links simulates exactly how production environments operate in the real world. The instructor feedback was super specific.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 'test-3',
    name: 'Tariq Al-Mansoor',
    role: 'Security Analyst',
    content: 'I enrolled in the Cybersecurity module and was blown away by the depth of network modeling and OWASP training. The structured labs and final graded certificates are fully enterprise-ready.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  }
];

async function parseResponseJson(res: Response) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (e) {
      return { error: `Invalid JSON response from server (${res.status})` };
    }
  }
  try {
    const text = await res.text();
    const match = text.match(/<title>(.*?)<\/title>/i);
    const title = match ? match[1] : '';
    return { error: title ? `Server Error: ${title}` : `Server returned status ${res.status}` };
  } catch (e) {
    return { error: `Server returned status ${res.status}` };
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('boolean_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && user.email && user.email.toLowerCase().trim() === 'blessingadeya@gmail.com') {
          if (user.enrolledCourses && (user.enrolledCourses.includes('frontend') || user.enrolledCourses.includes('backend'))) {
            user.enrolledCourses = [];
            localStorage.setItem('boolean_user', JSON.stringify(user));
          }
        }
        return user;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [completedModules, setCompletedModules] = useState<Record<string, string[]>>({});
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toast State and Trigger
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, 4000);
  };

  // Fetch courses list from backend
  const refreshCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        if (data.courses) {
          const seen = new Set();
          const uniqueCourses = data.courses.filter((c: any) => {
            if (!c.id) return false;
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
          });
          setCourses(uniqueCourses);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dynamic courses list:', err);
    }
  };

  // Modal togglers
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Fetch db status on load
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch API status:', err);
    }
  };

  // Fetch submissions from backend
  const refreshSubmissions = async () => {
    if (!currentUser) return;
    try {
      const url = `/api/submissions?email=${encodeURIComponent(currentUser.email)}&role=${currentUser.role}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const seen = new Set();
        const uniqueSubmissions = (data.submissions || []).filter((s: any) => {
          if (!s.id) return false;
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
        setSubmissions(uniqueSubmissions);
        localStorage.setItem('boolean_submissions', JSON.stringify(uniqueSubmissions));
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      // Fallback cache
      const cached = localStorage.getItem('boolean_submissions');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const seen = new Set();
          const uniqueSubmissions = (parsed || []).filter((s: any) => {
            if (!s.id) return false;
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
          });
          setSubmissions(uniqueSubmissions);
        } catch (e) {
          setSubmissions([]);
        }
      }
    }
  };

  // Fetch completed syllabus modules from backend
  const refreshCompletedModules = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/completed-modules?email=${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        const modules = data.completedModules || {};
        setCompletedModules(modules);
        localStorage.setItem('boolean_completed_modules', JSON.stringify(modules));
      }
    } catch (err) {
      console.error('Failed to fetch completed modules:', err);
      // Fallback cache
      const cached = localStorage.getItem('boolean_completed_modules');
      if (cached) setCompletedModules(JSON.parse(cached));
    }
  };

  // Initial loads and re-syncing
  useEffect(() => {
    fetchDbStatus();
    refreshCourses();
  }, []);

  useEffect(() => {
    if (currentUser) {
      refreshSubmissions();
      refreshCompletedModules();
    } else {
      setSubmissions([]);
      setCompletedModules({});
    }
  }, [currentUser]);

  // Auth Operations
  const registerUser = async (name: string, email: string, role: 'student' | 'admin', password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password })
      });
      const data = await parseResponseJson(res);
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('boolean_user', JSON.stringify(data.user));
        showToast(`Welcome, ${data.user.name}! Your account has been registered successfully.`, 'success');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (err: any) {
      console.error('Registration failed, executing offline mode:', err);

      // Check if they already exist in local cache offline to prevent re-registration
      const existing = localStorage.getItem('boolean_user');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.email.toLowerCase() === email.toLowerCase()) {
          return { success: false, error: `Registration failed. An account with this email is already registered as a ${parsed.role}.` };
        }
      }

      // Offline Local Storage Fallback if server is unavailable
      const fallbackUser: User = { name, email, enrolledCourses: [], role, password };
      setCurrentUser(fallbackUser);
      localStorage.setItem('boolean_user', JSON.stringify(fallbackUser));
      showToast(`Welcome, ${name}! Your account has been registered offline.`, 'success');
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (email: string, role?: 'student' | 'admin', password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, password })
      });
      const data = await parseResponseJson(res);
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('boolean_user', JSON.stringify(data.user));
        setIsLoading(false);
        showToast(`Welcome back, ${data.user.name}! Successfully logged in.`, 'success');
        return { success: true };
      } else {
        setIsLoading(false);
        let errorMsg = data.error || 'Login failed';
        if (res.status === 403 || errorMsg.toLowerCase().includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.toLowerCase().includes('access denied')) {
          errorMsg = `Access Denied: Your account's registered role does not match the selected login mode (${role === 'admin' ? 'Admin' : 'Student'}). Please select the correct role (Student or Admin) and try again.`;
        }
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Login failed, checking offline cache:', err);
    }

    // Offline Local Storage Fallback (only allow if they exist in localStorage)
    const existing = localStorage.getItem('boolean_user');
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.email.toLowerCase() === email.toLowerCase()) {
        if (password && parsed.password && parsed.password !== password) {
          setIsLoading(false);
          return { success: false, error: 'Invalid password. Please try again.' };
        }
        if (role && parsed.role !== role) {
          setIsLoading(false);
          return { success: false, error: `Access Denied: Your account's registered role does not match the selected login mode (${role === 'admin' ? 'Admin' : 'Student'}). Please select the correct role (Student or Admin) and try again.` };
        }
        setCurrentUser(parsed);
        setIsLoading(false);
        showToast(`Welcome back, ${parsed.name}! Successfully logged in offline.`, 'success');
        return { success: true };
      }
    }

    setIsLoading(false);
    return { success: false, error: 'No user found with this email. Please register first.' };
  };

  const loginWithGoogle = async (credential: string, role?: 'student' | 'admin'): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, role })
      });
      const data = await parseResponseJson(res);
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('boolean_user', JSON.stringify(data.user));
        setIsLoading(false);
        showToast(`Welcome back, ${data.user.name}! Successfully signed in with Google.`, 'success');
        return { success: true };
      } else {
        setIsLoading(false);
        let errorMsg = data.error || 'Google authentication failed.';
        if (res.status === 403 || errorMsg.toLowerCase().includes('403') || errorMsg.toLowerCase().includes('forbidden') || errorMsg.toLowerCase().includes('access denied')) {
          errorMsg = `Access Denied: Your Google account's registered role does not match the selected login mode (${role === 'admin' ? 'Admin' : 'Student'}). Please select the correct role (Student or Admin) and try again.`;
        }
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Google Auth API failed:', err);
      // Fallback using simulation logic if offline
      const email = credential.includes('@') ? credential : 'google-user@gmail.com';
      const name = email.split('@')[0];
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

      const existing = localStorage.getItem('boolean_user');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.email.toLowerCase() === email.toLowerCase()) {
          if (role && parsed.role !== role) {
            setIsLoading(false);
            return { success: false, error: `Access Denied: Your Google account's registered role does not match the selected login mode (${role === 'admin' ? 'Admin' : 'Student'}). Please select the correct role (Student or Admin) and try again.` };
          }
          setCurrentUser(parsed);
          setIsLoading(false);
          showToast(`Welcome back, ${parsed.name}! Signed in with Google (Offline mode).`, 'success');
          return { success: true };
        }
      }

      setIsLoading(false);
      return { success: false, error: 'No account associated with this Google email. Please register first.' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('boolean_user');
    localStorage.removeItem('boolean_submissions');
    localStorage.removeItem('boolean_completed_modules');
    setSubmissions([]);
    setCompletedModules({});
    showToast('Successfully logged out of your academy account.', 'info');
  };

  const enrollInCourse = async (courseId: string) => {
    if (!currentUser) {
      setRegisterOpen(true);
      return;
    }
    if (currentUser.enrolledCourses.includes(courseId)) {
      return;
    }

    // Optimistic UI Update
    const updatedUser: User = {
      ...currentUser,
      enrolledCourses: [...currentUser.enrolledCourses, courseId]
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('boolean_user', JSON.stringify(updatedUser));

    try {
      await fetch('/api/user/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, courseId })
      });
    } catch (err) {
      console.error('Failed to enroll in course on server:', err);
    }
  };

  // Submissions
  const addSubmission = async (title: string, github: string, vercel: string, screenshot?: string) => {
    if (!currentUser) return;

    // Build optimistic state
    const uniqueId = `sub-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const newSub: Submission = {
      id: uniqueId,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      assignmentTitle: title,
      githubUrl: github,
      vercelUrl: vercel,
      screenshotUrl: screenshot || 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=400&h=250&fit=crop',
      status: 'Pending',
      submittedAt: new Date().toISOString()
    };

    setSubmissions((prev) => [newSub, ...prev]);

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentUser.name,
          studentEmail: currentUser.email,
          assignmentTitle: title,
          githubUrl: github,
          vercelUrl: vercel,
          screenshotUrl: screenshot
        })
      });
      if (res.ok) {
        await refreshSubmissions();
      }
    } catch (err) {
      console.error('Failed to submit assignment on backend:', err);
      // Persist in fallback cache
      localStorage.setItem('boolean_submissions', JSON.stringify([newSub, ...submissions]));
    }
  };

  const updateSubmissionStatus = async (
    submissionId: string,
    status?: 'Pending' | 'Approved' | 'Changes Requested',
    grade?: string,
    comment?: string
  ) => {
    // Optimistic UI Update
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? {
              ...sub,
              ...(status !== undefined ? { status } : {}),
              ...(grade !== undefined ? { grade } : {}),
              ...(comment !== undefined ? { comment } : {}),
            }
          : sub
      )
    );

    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, grade, comment })
      });
      if (res.ok) {
        await refreshSubmissions();
      }
    } catch (err) {
      console.error('Failed to update submission status on server:', err);
    }
  };

  // Completed Modules Toggle & Persistence
  const toggleModule = (courseId: string, moduleName: string) => {
    setCompletedModules((prev) => {
      const current = prev[courseId] || [];
      const updated = current.includes(moduleName)
        ? current.filter((m) => m !== moduleName)
        : [...current, moduleName];
      const newState = { ...prev, [courseId]: updated };

      // Persist locally
      localStorage.setItem('boolean_completed_modules', JSON.stringify(newState));

      // Persist to backend in background
      if (currentUser) {
        fetch('/api/completed-modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentUser.email,
            completedModules: newState
          })
        }).catch((err) => console.error('Failed to save module progress:', err));
      }

      return newState;
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        registerUser,
        loginUser,
        loginWithGoogle,
        logoutUser,
        enrollInCourse,
        toast,
        showToast,
        isLoginOpen,
        setLoginOpen,
        isRegisterOpen,
        setRegisterOpen,
        selectedCourseId,
        setSelectedCourseId,
        submissions,
        addSubmission,
        updateSubmissionStatus,
        refreshSubmissions,
        completedModules,
        toggleModule,
        dbStatus,
        isLoading,
        courses,
        refreshCourses,
        testimonials: initialTestimonials
      }}
    >
      {children}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
