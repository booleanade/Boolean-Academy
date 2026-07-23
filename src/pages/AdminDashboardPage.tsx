import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Modals from '../components/Modals';
import { 
  GraduationCap, 
  Lock, 
  LogIn, 
  Users, 
  BookOpen, 
  FolderEdit, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  Github, 
  Globe, 
  ArrowUpRight, 
  PlusCircle, 
  BookMarked,
  Sparkles,
  Inbox,
  Activity,
  ChevronRight,
  Shield,
  Layers,
  LayoutDashboard,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Submission, User } from '../types';

export default function AdminDashboardPage() {
  const { currentUser, submissions, updateSubmissionStatus, refreshSubmissions, refreshCourses, setLoginOpen, logoutUser, dbStatus, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'manage_courses' | 'manage_students' | 'grade'>('overview');
  
  // States for dynamic data
  const [usersList, setUsersList] = useState<User[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal / Form States for Student Management
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'admin',
    enrolledCourses: [] as string[]
  });

  // Modal / Form States for Course Management
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    id: '',
    title: '',
    description: '',
    duration: '',
    category: 'development' as 'development' | 'design' | 'security',
    image: 'bg-gradient-to-br from-indigo-600 to-violet-800',
    difficulty: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    syllabusInput: '',
    syllabus: [] as string[]
  });

  // State for custom confirmation modal (to bypass iframe confirm limitations)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: () => {}
  });

  // Load Admin Data on Mount
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch Users list
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const seenEmails = new Set();
        const uniqueUsers = (usersData.users || []).filter((u: any) => {
          if (!u.email) return false;
          const email = u.email.toLowerCase().trim();
          if (seenEmails.has(email)) return false;
          seenEmails.add(email);
          return true;
        });
        setUsersList(uniqueUsers);
      }

      // 2. Fetch Courses list
      const coursesRes = await fetch('/api/admin/courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        const seenIds = new Set();
        const uniqueCourses = (coursesData.courses || []).filter((c: any) => {
          if (!c.id) return false;
          const id = c.id.toLowerCase().trim();
          if (seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        });
        setCoursesList(uniqueCourses);
      }

      // 3. Refresh Submissions
      await refreshSubmissions();
    } catch (err) {
      console.error('Failed to load admin workspace data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleResetCourses = async () => {
    if (!window.confirm('Are you sure you want to reset all courses to the default Boolean Academy curriculum?')) return;
    try {
      const res = await fetch('/api/admin/courses/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setCoursesList(data.courses || []);
        if (refreshCourses) refreshCourses();
        if (showToast) showToast('Courses reset to default curriculum successfully!', 'success');
      }
    } catch (err) {
      console.error('Failed to reset courses:', err);
    }
  };

  // HANDLERS FOR STUDENT MANAGEMENT
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email) return;

    try {
      if (editingStudent) {
        // Update user
        const res = await fetch(`/api/admin/users/${editingStudent.email}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: studentForm.name,
            role: studentForm.role,
            password: studentForm.password || 'password123',
            enrolledCourses: studentForm.enrolledCourses
          })
        });
        if (res.ok) {
          setUsersList(prev => prev.map(u => u.email === editingStudent.email ? {
            ...u,
            name: studentForm.name,
            role: studentForm.role,
            password: studentForm.password || u.password,
            enrolledCourses: studentForm.enrolledCourses
          } : u));
        }
      } else {
        // Create student user
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: studentForm.name,
            email: studentForm.email,
            role: studentForm.role,
            password: studentForm.password || 'password123',
            enrolledCourses: studentForm.enrolledCourses
          })
        });
        if (res.ok) {
          const data = await res.json();
          setUsersList(prev => {
            const exists = prev.some(u => u.email.toLowerCase().trim() === data.user.email.toLowerCase().trim());
            return exists ? prev.map(u => u.email.toLowerCase().trim() === data.user.email.toLowerCase().trim() ? data.user : u) : [...prev, data.user];
          });
        }
      }
      setIsStudentModalOpen(false);
      setEditingStudent(null);
      resetStudentForm();
    } catch (err) {
      console.error('Failed to save student user:', err);
    }
  };

  const handleDeleteStudent = (email: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Student Account',
      message: `Are you absolutely sure you want to delete account: ${email}? This action is permanent.`,
      confirmText: 'Delete Account',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
          if (res.ok) {
            setUsersList(prev => prev.filter(u => u.email !== email));
            showToast('Student account successfully deleted.', 'success');
          } else {
            showToast('Failed to delete student account.', 'error');
          }
        } catch (err) {
          console.error('Failed to delete student:', err);
          showToast('Error deleting student account.', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleEditStudentClick = (student: User) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      email: student.email,
      password: student.password || '',
      role: student.role,
      enrolledCourses: student.enrolledCourses || []
    });
    setIsStudentModalOpen(true);
  };

  const resetStudentForm = () => {
    setStudentForm({
      name: '',
      email: '',
      password: '',
      role: 'student',
      enrolledCourses: []
    });
  };

  // HANDLERS FOR COURSE MANAGEMENT
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.id || !courseForm.title) return;

    // Build syllabus array from lines/comma separation if needed
    let finalSyllabus = courseForm.syllabus;
    if (courseForm.syllabusInput.trim()) {
      finalSyllabus = courseForm.syllabusInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }

    const payload: Course = {
      id: courseForm.id.toLowerCase().trim(),
      title: courseForm.title,
      description: courseForm.description,
      duration: courseForm.duration || '12 Weeks',
      category: courseForm.category,
      image: courseForm.image,
      difficulty: courseForm.difficulty,
      syllabus: finalSyllabus
    };

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const savedCourse = data.course;
        
        if (editingCourse) {
          setCoursesList(prev => prev.map(c => c.id === savedCourse.id ? savedCourse : c));
        } else {
          setCoursesList(prev => {
            const exists = prev.some(c => c.id === savedCourse.id);
            return exists ? prev.map(c => c.id === savedCourse.id ? savedCourse : c) : [...prev, savedCourse];
          });
        }
        refreshCourses();
        setIsCourseModalOpen(false);
        setEditingCourse(null);
        resetCourseForm();
      }
    } catch (err) {
      console.error('Failed to save academic course:', err);
    }
  };

  const handleDeleteCourse = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Academic Course',
      message: `Are you sure you want to delete course: ${id}? All current enrollments might get orphaned.`,
      confirmText: 'Delete Course',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/courses/${encodeURIComponent(id)}`, { method: 'DELETE' });
          if (res.ok) {
            setCoursesList(prev => prev.filter(c => c.id !== id));
            refreshCourses();
            showToast('Academic course successfully deleted.', 'success');
          } else {
            showToast('Failed to delete academic course.', 'error');
          }
        } catch (err) {
          console.error('Failed to delete course:', err);
          showToast('Error deleting academic course.', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleEditCourseClick = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      id: course.id,
      title: course.title,
      description: course.description,
      duration: course.duration,
      category: course.category,
      image: course.image,
      difficulty: course.difficulty,
      syllabusInput: course.syllabus.join('\n'),
      syllabus: course.syllabus
    });
    setIsCourseModalOpen(true);
  };

  const resetCourseForm = () => {
    setCourseForm({
      id: '',
      title: '',
      description: '',
      duration: '12 Weeks',
      category: 'development',
      image: 'bg-gradient-to-br from-indigo-600 to-violet-800',
      difficulty: 'Intermediate',
      syllabusInput: '',
      syllabus: []
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image file is too large. Please select an image under 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCourseForm(prev => ({ ...prev, image: reader.result as string }));
          showToast('Course banner photo successfully selected.', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper arrays for visual badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Changes Requested':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case 'Changes Requested':
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  // Access Restriction Layer
  if (!currentUser) {
    return (
      <div className="relative min-h-screen bg-brand-bg select-none" id="admin-page-root">
        <Navbar />
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center space-y-6"
            id="admin-auth-required-panel"
          >
            <div className="mx-auto h-16 w-16 bg-blue-50 text-primary-base rounded-full flex items-center justify-center border border-blue-100">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight">
                Admin Area Restricted
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                You must sign in with a registered System Administrator account to access the Academic Admin Command Center.
              </p>
            </div>
            <button
              onClick={() => setLoginOpen(true)}
              className="w-full bg-primary-base hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              id="btn-admin-auth-login"
            >
              <LogIn className="h-4.5 w-4.5" />
              <span>Sign-on as Administrator</span>
            </button>
          </motion.div>
        </div>
        <Footer />
        <Modals />
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="relative min-h-screen bg-brand-bg select-none" id="admin-page-root">
        <Navbar />
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center space-y-6"
            id="admin-access-denied-panel"
          >
            <div className="mx-auto h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-red-600 font-display tracking-tight">
                Access Denied
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your current account is registered under the <span className="font-extrabold text-primary-base">Student</span> profile.
                This console requires full System Administrator credentials.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  logoutUser();
                  setLoginOpen(true);
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all cursor-pointer"
                id="btn-admin-switch-account"
              >
                Switch Account
              </button>
              <a
                href="/dashboard"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all block text-sm"
                id="btn-admin-return-student"
              >
                Go to Student Learning Hub
              </a>
            </div>
          </motion.div>
        </div>
        <Footer />
        <Modals />
      </div>
    );
  }

  // Calculate System Statistics
  const studentsOnly = usersList.filter(u => u.role === 'student');
  const totalSubmissionsCount = submissions.length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'Pending').length;
  const approvedSubmissionsCount = submissions.filter(s => s.status === 'Approved').length;

  const adminTotalSubmissions = submissions.length;
  const adminPendingSubmissions = submissions.filter((s) => s.status === 'Pending').length;
  const adminApprovedSubmissions = submissions.filter((s) => s.status === 'Approved').length;
  const adminChangesSubmissions = submissions.filter((s) => s.status === 'Changes Requested').length;

  const uniqueStudentsCount = new Set(submissions.map((s) => s.studentEmail || s.studentName)).size;
  const avgPassRate = submissions.length > 0 ? Math.round((adminApprovedSubmissions / (adminTotalSubmissions || 1)) * 100) : 0;

  const currentWeekSubmissionsRate = adminTotalSubmissions > 0 ? `${adminTotalSubmissions} submitted total` : "No submissions yet";
  const studentEnrollmentsRatio = `${uniqueStudentsCount} active student${uniqueStudentsCount === 1 ? '' : 's'}`;

  return (
    <div className="relative min-h-screen bg-gray-50/50 font-sans" id="admin-dashboard-page-root">
      <Navbar />

      <div className="pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* HEADER WELCOME BANNER */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-100 text-accent-orange border border-amber-200">
                  System Admin Console
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-gray-400 font-mono">Operations Active</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 font-display tracking-tight mt-1.5">
                Administrator Control Center
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Manage curriculum pathways, grade student code bundles, and review registration logs.
              </p>
            </div>
          </div>

          {/* Dedicated STICKY Tab Navigation Row */}
          <div className="sticky top-[80px] z-40 bg-gray-50/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-8 border-b border-gray-200/50 flex items-center justify-between gap-4">
            {/* TAB CHANGER NAV RAIL */}
            <div className="flex flex-wrap bg-white border border-gray-200 p-1.5 rounded-2xl shadow-xs self-start gap-1">
              <button
                onClick={() => { setActiveTab('overview'); setSearchTerm(''); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                id="btn-tab-overview"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => { setActiveTab('manage_courses'); setSearchTerm(''); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'manage_courses'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                id="btn-tab-manage-courses"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Manage Courses</span>
              </button>
              <button
                onClick={() => { setActiveTab('manage_students'); setSearchTerm(''); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'manage_students'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                id="btn-tab-manage-students"
              >
                <FolderEdit className="h-3.5 w-3.5" />
                <span>Manage Students</span>
              </button>
              <button
                onClick={() => { setActiveTab('grade'); setSearchTerm(''); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'grade'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                id="btn-tab-grade"
              >
                <Inbox className="h-3.5 w-3.5" />
                <span>Grading Students</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* 1. Welcome Hero card */}
              <div className="relative bg-gradient-to-r from-slate-900 via-primary-dark to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden" id="admin-overview-hero">
                <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-accent-orange/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-2xl" />
                <div className="relative space-y-2">
                  <div className="flex items-center space-x-2 text-accent-orange font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    <span>Administrative Command Hub</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight font-display">
                    Welcome Back, {currentUser?.name}!
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-2xl">
                    You have administrative credentials to approve build submissions, track program pathways, manage student directories, and monitor live sandbox pipelines across BooleanAcademy.
                  </p>
                </div>
              </div>

              {/* 2. ADMIN STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="admin-overview-stats">
                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Submissions</span>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">{adminTotalSubmissions}</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Active Queue
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 block">{currentWeekSubmissionsRate}</span>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Review</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">{adminPendingSubmissions}</span>
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      Awaiting
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 block">Requires grading action</span>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Approved Bundles</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">{adminApprovedSubmissions}</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 block">Deployed successfully</span>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Revisions Requested</span>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">{adminChangesSubmissions}</span>
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                      Incomplete
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-2 block">Feedback logs delivered</span>
                </div>
              </div>

              {/* 3. BENTO INTERACTIVE CONTENTS & LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-overview-bento">
                {/* Left Side (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 font-display">
                          Submissions Active Analytics
                        </h3>
                        <p className="text-xs text-gray-500">
                          Inspect queue progression and active academy response rates.
                        </p>
                      </div>
                      <Activity className="h-5 w-5 text-accent-orange" />
                    </div>

                    {/* Styled Analytics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Student Engagement</span>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-xl font-bold text-gray-900">{uniqueStudentsCount}</span>
                          <span className="text-xs text-emerald-600 font-semibold">{studentEnrollmentsRatio}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: uniqueStudentsCount > 0 ? '100%' : '0%' }} />
                        </div>
                      </div>

                      <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Average Pass Rate</span>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-xl font-bold text-gray-900">{avgPassRate}%</span>
                          <span className="text-xs text-blue-600 font-semibold">{adminApprovedSubmissions} approved</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${avgPassRate}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Live queue inspection overview list */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                        <Inbox className="h-4 w-4 text-primary-base" />
                        <span>Awaiting Reviews In Sandbox</span>
                      </h4>

                      {adminPendingSubmissions === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-65" />
                          <p className="text-xs text-gray-500">Grading Queue Clean! Excellent work instructor.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 max-h-[250px] overflow-y-auto pr-2 space-y-2.5">
                          {(() => {
                            const seen = new Set<string>();
                            const uniquePending = submissions
                              .filter((s) => s.status === 'Pending')
                              .filter((sub) => {
                                if (seen.has(sub.id)) return false;
                                seen.add(sub.id);
                                return true;
                              })
                              .slice(0, 4);

                            return uniquePending.map((sub, idx) => (
                              <div key={sub.id ? `admin-pending-${sub.id}-idx-${idx}` : `admin-pending-idx-${idx}`} className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-white transition-all">
                                <div>
                                  <h5 className="text-xs font-bold text-gray-900 leading-tight">{sub.assignmentTitle}</h5>
                                  <p className="text-[10px] text-gray-500 mt-0.5">By {sub.studentName} • {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveTab('grade');
                                  }}
                                  className="text-[10px] font-bold text-primary-base hover:text-primary-dark hover:underline flex items-center space-x-0.5 cursor-pointer"
                                >
                                  <span>Grade Now</span>
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side (5 cols) */}
                <div className="lg:col-span-5 space-y-8">
                  {/* GLOBAL ACADEMY NOTICE BOARD */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-indigo-50/20 rounded-full blur-2xl" />
                    <div className="flex items-center space-x-2 text-indigo-700">
                      <Shield className="h-5 w-5" />
                      <h3 className="text-sm font-bold uppercase tracking-wider">Academy Bulletins</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Interactive Build Sandbox</span>
                          <span className="text-[9px] text-gray-400 font-mono">July 2026</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-normal font-sans">
                          Our build verification systems now fully verify Vercel and GitHub repository deployments within 1.2 seconds of form uploads.
                        </p>
                      </div>

                      <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">Figma & UX/UI Bootcamp</span>
                          <span className="text-[9px] text-gray-400 font-mono">Summer Session</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-normal font-sans">
                          Students can now enroll in the Cybersecurity audit protocols and UI/UX typography masterclasses directly in the pathways tab.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN SYSTEM DEFAULTS UTILITY */}
                  <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-sm text-white space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-accent-orange/15 rounded-full blur-2xl" />
                    <h3 className="text-sm font-bold text-accent-orange uppercase tracking-wider flex items-center space-x-1.5">
                      <GraduationCap className="h-4 w-4" />
                      <span>Console Command Center</span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-normal">
                      Monitor pipeline status and run standard sandboxed student emulator queries to test grading mechanics dynamically.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs p-2.5 bg-slate-800 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400">Database Engine</span>
                        <span className="text-emerald-400 font-bold font-mono">{dbStatus?.mode || "Local Memory Store"}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2.5 bg-slate-800 rounded-xl border border-slate-700/50">
                        <span className="text-slate-400">Synchronized Pipeline</span>
                        <span className="text-blue-400 font-bold font-mono">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab !== 'overview' && (
            <>
              {/* DYNAMIC SYSTEM STATISTICS HIGHLIGHT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs" id="stat-total-students">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Students Enrolled</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900">{studentsOnly.length}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs" id="stat-pending-reviews">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pending Grading Queue</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900">{pendingSubmissionsCount}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${pendingSubmissionsCount > 0 ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                  {pendingSubmissionsCount > 0 ? 'Action Required' : 'Completed'}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs" id="stat-total-courses">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Course Paths</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900">{coursesList.length}</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Syllabus List</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs" id="stat-engagement-rate">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Completed Reviews</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900">{approvedSubmissionsCount}</span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Passed</span>
              </div>
            </div>
          </div>

          {/* MAIN TABS PANEL CONTENT */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs">
            
            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-150 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'grade' 
                      ? 'Search submissions by student name or assignment...'
                      : activeTab === 'view_students' || activeTab === 'manage_students'
                      ? 'Search users by name or email...'
                      : 'Search courses by title or category...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base focus:border-primary-base"
                  id="admin-search-input"
                />
              </div>

              <div className="flex items-center space-x-3">
                {activeTab === 'grade' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500">Status Filter:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-base"
                      id="admin-status-filter"
                    >
                      <option value="All">All Submissions</option>
                      <option value="Pending">Pending Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Changes Requested">Changes Requested</option>
                    </select>
                  </div>
                )}

                {activeTab === 'manage_students' && (
                  <button
                    onClick={() => {
                      resetStudentForm();
                      setEditingStudent(null);
                      setIsStudentModalOpen(true);
                    }}
                    className="bg-primary-base hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
                    id="btn-admin-add-student"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create User</span>
                  </button>
                )}

                {activeTab === 'manage_courses' && (
                  <button
                    onClick={() => {
                      resetCourseForm();
                      setEditingCourse(null);
                      setIsCourseModalOpen(true);
                    }}
                    className="bg-primary-base hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
                    id="btn-admin-add-course"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Course</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB CONTENT: GRADE STUDENT */}
            {activeTab === 'grade' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-accent-orange" />
                  <span>Submissions Verification Grid ({submissions.length})</span>
                </h3>
                
                {submissions.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-800">No Submissions Found</p>
                    <p className="text-xs text-gray-500 mt-1">There are no academic student projects submitted to the system yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const seen = new Set<string>();
                      const filtered = submissions.filter(sub => {
                        const matchesSearch = sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sub.studentEmail && sub.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()));
                        const matchesFilter = statusFilter === 'All' || sub.status === statusFilter;
                        return matchesSearch && matchesFilter;
                      }).filter(sub => {
                        if (seen.has(sub.id)) return false;
                        seen.add(sub.id);
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-12 bg-gray-50 rounded-2xl">
                            <p className="text-xs text-gray-500">No submissions matching the selected filters found.</p>
                          </div>
                        );
                      }

                      return filtered.map((sub, idx) => (
                        <div
                          key={sub.id ? `admin-submission-${sub.id}-idx-${idx}` : `admin-submission-idx-${idx}`}
                          className="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl flex flex-col gap-4 hover:bg-white hover:border-blue-100 transition-all shadow-xs"
                          id={`admin-sub-card-${sub.id}`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-slate-900 text-sm">{sub.assignmentTitle}</h4>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full flex items-center gap-1 ${getStatusBadge(sub.status)}`}>
                                  {getStatusIcon(sub.status)}
                                  {sub.status}
                                </span>
                                {sub.grade && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-200 bg-amber-50 text-amber-700 rounded-full font-sans">
                                    Grade: {sub.grade}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-sans">
                                Submitted by <span className="font-semibold text-gray-700">{sub.studentName}</span> 
                                {sub.studentEmail ? ` (${sub.studentEmail})` : ''} • {new Date(sub.submittedAt).toLocaleString()}
                              </p>
                              <div className="flex items-center space-x-4 pt-1">
                                <a
                                  href={sub.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-xs text-gray-600 hover:text-black font-semibold"
                                >
                                  <Github className="h-3.5 w-3.5" />
                                  <span>GitHub Repository</span>
                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                                <a
                                  href={sub.vercelUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-xs text-primary-base hover:text-primary-dark font-semibold"
                                >
                                  <Globe className="h-3.5 w-3.5" />
                                  <span>Vercel Deploy</span>
                                  <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 self-end md:self-center">
                              <button
                                onClick={() => updateSubmissionStatus(sub.id, 'Approved')}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                  sub.status === 'Approved'
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                                title="Approve Submission"
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span>Pass / Approve</span>
                              </button>
                              <button
                                onClick={() => updateSubmissionStatus(sub.id, 'Changes Requested')}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                                  sub.status === 'Changes Requested'
                                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                                title="Request Revisions"
                              >
                                <AlertTriangle className="h-4 w-4 text-rose-600" />
                                <span>Needs Revisions</span>
                              </button>
                              <button
                                onClick={() => updateSubmissionStatus(sub.id, 'Pending')}
                                className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-gray-400 hover:text-amber-600 hover:bg-amber-50`}
                                title="Reset status"
                              >
                                <Clock className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* FEEDBACK & GRADING CONTROLS */}
                          <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row gap-3 items-end bg-gray-50/40 p-3 rounded-xl border border-gray-100/80">
                            <div className="w-full sm:w-1/4 space-y-1">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">Letter Grade</label>
                              <select
                                id={`grade-select-${sub.id}`}
                                defaultValue={sub.grade || ''}
                                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
                              >
                                <option value="">Select Grade...</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="B-">B-</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="F">F</option>
                              </select>
                            </div>
                            <div className="w-full sm:w-2/4 space-y-1">
                              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-sans">Evaluation Comments</label>
                              <input
                                type="text"
                                id={`comment-input-${sub.id}`}
                                defaultValue={sub.comment || ''}
                                placeholder="Write feedback, recommendations, or revision details..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
                              />
                            </div>
                            <div className="w-full sm:w-1/4">
                              <button
                                onClick={async () => {
                                  const gradeEl = document.getElementById(`grade-select-${sub.id}`) as HTMLSelectElement;
                                  const commentEl = document.getElementById(`comment-input-${sub.id}`) as HTMLInputElement;
                                  const selectedGrade = gradeEl?.value || '';
                                  const commentText = commentEl?.value || '';

                                  await updateSubmissionStatus(sub.id, sub.status, selectedGrade, commentText);
                                  showToast('Grade and Feedback saved successfully!', 'success');
                                }}
                                className="w-full bg-primary-base hover:bg-primary-dark text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer font-sans"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Save Feedback</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: VIEW TOTAL STUDENTS */}
            {activeTab === 'view_students' && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary-base" />
                  <span>Enrolled Student Catalog</span>
                </h3>

                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="min-w-full divide-y divide-gray-150 text-left">
                    <thead className="bg-gray-50 font-display text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Student Profile</th>
                        <th className="px-6 py-4">Registered Email</th>
                        <th className="px-6 py-4">Enrolled Pathways</th>
                        <th className="px-6 py-4">Role Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-slate-700 bg-white">
                      {(() => {
                        const filteredStudents = studentsOnly.filter(u => 
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase())
                        );

                        if (filteredStudents.length === 0) {
                          return (
                            <tr>
                              <td colSpan={4} className="text-center py-10 text-gray-400">
                                No student records match your query.
                              </td>
                            </tr>
                          );
                        }

                        return filteredStudents.map((student, idx) => {
                          const studentEmail = student.email ? student.email.toLowerCase().trim() : `temp-${idx}`;
                          const enrolled = Array.from(new Set(student.enrolledCourses || []));
                          return (
                            <tr key={`student-row-${studentEmail}-idx-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900 flex items-center space-x-2.5">
                                <div className="h-8 w-8 rounded-full bg-blue-50 text-primary-base flex items-center justify-center font-bold font-display border border-blue-100 text-xs">
                                  {student.name.charAt(0)}
                                </div>
                                <span>{student.name}</span>
                              </td>
                              <td className="px-6 py-4 font-mono text-gray-500">{studentEmail}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {enrolled.length === 0 ? (
                                    <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">No active pathways</span>
                                  ) : (
                                    enrolled.map((cid, cIdx) => (
                                      <span key={`student-row-${studentEmail}-c-${cid}-cidx-${cIdx}`} className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-primary-base px-2 py-0.5 rounded-full border border-blue-100">
                                        {cid}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-blue-100 text-primary-base text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md">
                                  Student
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MANAGE COURSES */}
            {activeTab === 'manage_courses' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary-base" />
                    <span>Dynamic Academic Courses List</span>
                  </h3>
                  <button
                    onClick={handleResetCourses}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    id="btn-reset-default-courses"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span>Restore Default Tech Curriculum</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(() => {
                    const filteredCourses = coursesList.filter(c => 
                      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.category.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredCourses.length === 0) {
                      return (
                        <div className="col-span-full text-center py-12 text-gray-400">
                          No courses matching the query.
                        </div>
                      );
                    }

                    return filteredCourses.map((course, idx) => (
                      <div
                        key={course.id ? `admin-manage-course-${course.id}-idx-${idx}` : `admin-manage-course-idx-${idx}`}
                        className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all"
                        id={`admin-course-card-${course.id}`}
                      >
                        <div 
                          className={`p-5 text-white relative bg-cover bg-center ${!(course.image && (course.image.startsWith('data:') || course.image.startsWith('http'))) ? (course.image || 'bg-slate-800') : ''}`}
                          style={course.image && (course.image.startsWith('data:') || course.image.startsWith('http')) ? { backgroundImage: `url(${course.image})` } : undefined}
                        >
                          <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider absolute top-4 right-4">
                            {course.difficulty}
                          </span>
                          <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest block">{course.category}</span>
                          <h4 className="text-base font-bold font-display mt-1 leading-snug">{course.title}</h4>
                          <p className="text-xs text-white/80 line-clamp-2 mt-2">{course.description}</p>
                        </div>
                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-center text-xs text-gray-500 pb-2 border-b border-gray-100">
                            <span>Syllabus: <strong>{course.syllabus?.length || 0} items</strong></span>
                            <span>{course.duration}</span>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditCourseClick(course)}
                              className="p-2 border border-gray-200 rounded-xl hover:bg-slate-50 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer flex items-center space-x-1"
                              title="Edit Course"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-2 border border-red-100 rounded-xl hover:bg-red-50 text-red-500 transition-colors cursor-pointer flex items-center space-x-1"
                              title="Delete Course"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* TAB CONTENT: MANAGE STUDENTS */}
            {activeTab === 'manage_students' && (
              <div className="space-y-6">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FolderEdit className="h-5 w-5 text-primary-base" />
                  <span>Student & Account Directory</span>
                </h3>

                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                  <table className="min-w-full divide-y divide-gray-150 text-left">
                    <thead className="bg-gray-50 font-display text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Account Holder</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Password</th>
                        <th className="px-6 py-4">Access Level</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-slate-700 bg-white">
                      {(() => {
                        const filteredUsers = usersList.filter(u => 
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase())
                        );

                        if (filteredUsers.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="text-center py-10 text-gray-400">
                                No user accounts matching the query.
                              </td>
                            </tr>
                          );
                        }

                        return filteredUsers.map((user, idx) => (
                          <tr key={user.email ? `manage-user-row-${user.email.toLowerCase().trim()}-idx-${idx}` : `manage-user-row-idx-${idx}`} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                            <td className="px-6 py-4 font-mono text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 font-mono text-gray-400">{user.password || 'Google Auth'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                                user.role === 'admin' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-blue-100 text-primary-base'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleEditStudentClick(user)}
                                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:text-slate-900 hover:bg-gray-50 transition-colors cursor-pointer"
                                  title="Edit User"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(user.email)}
                                  className="p-1.5 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
          </>
        )}

        </div>
      </div>

      {/* STUDENT / ACCOUNT MODAL */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-100 shadow-2xl relative"
            >
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-base" />
                <span>{editingStudent ? 'Edit Account Details' : 'Register New Account'}</span>
              </h3>

              <form onSubmit={handleSaveStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingStudent}
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Password</label>
                  <input
                    type="text"
                    placeholder="password123"
                    value={studentForm.password}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Access Credentials</label>
                  <select
                    value={studentForm.role}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, role: e.target.value as 'student' | 'admin' }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="student">Academy Student (Restricted)</option>
                    <option value="admin">System Admin Workspace (Unrestricted)</option>
                  </select>
                </div>

                {studentForm.role === 'student' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Enrollment Course Pathways</label>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto border border-gray-200 p-3 rounded-xl bg-gray-50/50">
                      {coursesList.map((c, idx) => {
                        const isEnrolled = studentForm.enrolledCourses.includes(c.id);
                        return (
                          <label key={c.id ? `modal-enroll-${c.id}-idx-${idx}` : `modal-enroll-idx-${idx}`} className="flex items-center space-x-2 text-xs text-gray-700 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnrolled}
                              onChange={() => {
                                const updated = isEnrolled 
                                  ? studentForm.enrolledCourses.filter(id => id !== c.id)
                                  : [...studentForm.enrolledCourses, c.id];
                                setStudentForm(prev => ({ ...prev, enrolledCourses: updated }));
                              }}
                              className="rounded text-primary-base focus:ring-0"
                            />
                            <span>{c.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex space-x-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-base hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COURSE MODAL */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-base" />
                <span>{editingCourse ? 'Modify Course Specifications' : 'Draft New Course Path'}</span>
              </h3>

              <form onSubmit={handleSaveCourse} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Course ID (Slug)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. databases"
                      disabled={!!editingCourse}
                      value={courseForm.id}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Course Duration</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10 Weeks"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Databases"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Course Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Draft course summary specifications..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="development">Software Development</option>
                      <option value="design">UI/UX Design</option>
                      <option value="security">Cybersecurity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Difficulty Level</label>
                    <select
                      value={courseForm.difficulty}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-gray-600">Course Card Banner Design</label>
                    <span className="text-[10px] text-gray-400 font-semibold">Gradients or custom photos</span>
                  </div>
                  
                  {/* Banner type switcher */}
                  <div className="grid grid-cols-2 gap-1 mb-3 bg-gray-100 p-1 rounded-xl border border-gray-150">
                    <button
                      type="button"
                      onClick={() => {
                        if (courseForm.image.startsWith('data:') || courseForm.image.startsWith('http')) {
                          setCourseForm(prev => ({ ...prev, image: 'bg-gradient-to-br from-indigo-600 to-violet-800' }));
                        }
                      }}
                      className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        !(courseForm.image.startsWith('data:') || courseForm.image.startsWith('http'))
                          ? 'bg-white shadow-xs text-gray-900 border border-gray-200/50'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Preset Gradient
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!(courseForm.image.startsWith('data:') || courseForm.image.startsWith('http'))) {
                          setCourseForm(prev => ({ ...prev, image: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&h=450&fit=crop' }));
                        }
                      }}
                      className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        (courseForm.image.startsWith('data:') || courseForm.image.startsWith('http'))
                          ? 'bg-white shadow-xs text-gray-900 border border-gray-200/50'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Custom Photo
                    </button>
                  </div>

                  {/* Preset Gradients section */}
                  {!(courseForm.image.startsWith('data:') || courseForm.image.startsWith('http')) ? (
                    <select
                      value={courseForm.image}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base"
                    >
                      <option value="bg-gradient-to-br from-blue-500 to-indigo-600">Ocean Blue Gradient</option>
                      <option value="bg-gradient-to-br from-slate-700 to-slate-900">Charcoal Dark Gradient</option>
                      <option value="bg-gradient-to-br from-indigo-600 to-violet-800">Indigo Violet Gradient</option>
                      <option value="bg-gradient-to-br from-pink-500 to-rose-600">Rose Pink Gradient</option>
                      <option value="bg-gradient-to-br from-emerald-600 to-teal-800">Emerald Mint Gradient</option>
                      <option value="bg-gradient-to-br from-amber-500 to-orange-600">Amber Bronze Gradient</option>
                    </select>
                  ) : (
                    /* Custom Image Upload section */
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {courseForm.image && (courseForm.image.startsWith('data:') || courseForm.image.startsWith('http')) && (
                          <div className="h-14 w-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative flex-shrink-0 shadow-inner">
                            <img
                              src={courseForm.image}
                              alt="Course preview"
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="flex-grow flex flex-col justify-center">
                          <label className="flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 cursor-pointer shadow-xs transition-colors border-dashed hover:border-gray-400">
                            <Upload className="h-4 w-4 mr-1.5 text-gray-500" />
                            <span>Upload course photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Syllabus Milestones (one curriculum item per line)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g.&#10;Relational Modeling with SQL&#10;MongoDB and NoSQL Standards&#10;Drizzle ORM Integrations"
                    value={courseForm.syllabusInput}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, syllabusInput: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary-base font-mono"
                  />
                </div>

                <div className="pt-4 flex space-x-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-base hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Publish Course Path
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" id="custom-delete-confirm-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-gray-100 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center space-x-3 text-red-600">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold font-display text-slate-900">{confirmModal.title}</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">{confirmModal.message}</p>
              <div className="flex space-x-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
      <Modals />
    </div>
  );
}
