import React, { useState } from 'react';
import { useApp } from '../AppContext';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Award,
  BookMarked,
  Layers,
  Sparkles,
  ChevronRight,
  User,
  GraduationCap,
  Inbox,
  Shield,
  Activity,
  Zap,
  Users,
  CheckSquare,
  Square,
  ArrowRight,
  Code2,
  Github,
  Globe,
  Upload,
  Copy,
  Search,
  ExternalLink,
  Check,
  Send,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const {
    currentUser,
    courses,
    submissions,
    enrollInCourse,
    addSubmission,
    setSelectedCourseId,
    setRegisterOpen,
    completedModules,
    toggleModule,
    dbStatus,
    showToast
  } = useApp();

  // Student tabs: 'overview' | 'courses' | 'submit' | 'grades' | 'github' | 'vercel'
  // Admin tabs (fallback/legacy): 'overview' | 'courses' | 'sandbox'
  const [activeTab, setActiveTab] = useState<
    'overview' | 'courses' | 'submit' | 'grades' | 'github' | 'vercel' | 'sandbox'
  >('overview');

  // Search filters for links
  const [githubSearch, setGithubSearch] = useState('');
  const [vercelSearch, setVercelSearch] = useState('');

  // Copy success animation states (storing item IDs that were recently copied)
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Submit Assignment Form States
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitGithub, setSubmitGithub] = useState('');
  const [submitVercel, setSubmitVercel] = useState('');
  const [submitScreenshot, setSubmitScreenshot] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [submitFormSuccess, setSubmitFormSuccess] = useState(false);
  const [submitFormError, setSubmitFormError] = useState('');

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  // --- STUDENT DATA COMPUTATIONS ---
  const studentEnrolledIds = currentUser.enrolledCourses || [];
  const studentEnrolledCourses = courses.filter((c) => studentEnrolledIds.includes(c.id));
  const studentRecommendedCourses = courses.filter((c) => !studentEnrolledIds.includes(c.id));

  // Submissions filtered for student
  const studentSubmissions = submissions.filter(
    (s) => s.studentName.toLowerCase() === currentUser.name.toLowerCase()
  );
  const studentApprovedCount = studentSubmissions.filter((s) => s.status === 'Approved').length;
  const studentPendingCount = studentSubmissions.filter((s) => s.status === 'Pending').length;
  const studentChangesCount = studentSubmissions.filter((s) => s.status === 'Changes Requested').length;

  // Calculate overall syllabus progress
  let totalSyllabusModulesCount = 0;
  let completedSyllabusModulesCount = 0;
  studentEnrolledCourses.forEach((course) => {
    totalSyllabusModulesCount += course.syllabus.length;
    const completed = completedModules[course.id] || [];
    completedSyllabusModulesCount += completed.length;
  });

  const overallProgressPercent =
    totalSyllabusModulesCount > 0
      ? Math.round((completedSyllabusModulesCount / totalSyllabusModulesCount) * 100)
      : 0;

  // --- GRADE & CUMULATIVE COMPUTATIONS ---
  // 1. Average Course Syllabus Completion
  const enrolledCoursesProgress = studentEnrolledCourses.map((course) => {
    const completed = completedModules[course.id] || [];
    return (completed.length / course.syllabus.length) * 100;
  });
  const avgCourseCompletion =
    enrolledCoursesProgress.length > 0
      ? enrolledCoursesProgress.reduce((a, b) => a + b, 0) / enrolledCoursesProgress.length
      : 0;

  // 2. Assignment success pass rate
  const studentGradedSubmissions = studentSubmissions.filter((s) => s.status !== 'Pending');
  const assignmentPassRate =
    studentSubmissions.length > 0 ? (studentApprovedCount / studentSubmissions.length) * 100 : 0;

  // 3. Cumulative Academic Score
  let cumulativeScore = 0;
  if (studentEnrolledCourses.length > 0 && studentSubmissions.length > 0) {
    cumulativeScore = Math.round((avgCourseCompletion + assignmentPassRate) / 2);
  } else if (studentEnrolledCourses.length > 0) {
    cumulativeScore = Math.round(avgCourseCompletion);
  } else if (studentSubmissions.length > 0) {
    cumulativeScore = Math.round(assignmentPassRate);
  }

  // 4. GPA and Letter Grade translation
  let letterGrade = 'F';
  let gpaValue = '0.00';
  let gpaLabel = 'Needs Work';
  let gpaColor = 'text-rose-600 bg-rose-50 border-rose-100';

  if (cumulativeScore >= 95) {
    letterGrade = 'A+';
    gpaValue = '4.00';
    gpaLabel = 'Outstanding (Summa Cum Laude)';
    gpaColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
  } else if (cumulativeScore >= 90) {
    letterGrade = 'A';
    gpaValue = '3.85';
    gpaLabel = 'Excellent Performance';
    gpaColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  } else if (cumulativeScore >= 80) {
    letterGrade = 'B+';
    gpaValue = '3.50';
    gpaLabel = 'Very Good Standings';
    gpaColor = 'text-blue-700 bg-blue-50 border-blue-100';
  } else if (cumulativeScore >= 70) {
    letterGrade = 'B';
    gpaValue = '3.00';
    gpaLabel = 'Good standing';
    gpaColor = 'text-indigo-700 bg-indigo-50 border-indigo-100';
  } else if (cumulativeScore >= 60) {
    letterGrade = 'C';
    gpaValue = '2.00';
    gpaLabel = 'Satisfactory Progress';
    gpaColor = 'text-amber-700 bg-amber-50 border-amber-100';
  } else if (cumulativeScore >= 50) {
    letterGrade = 'D';
    gpaValue = '1.00';
    gpaLabel = 'Passing (Revisions Advisable)';
    gpaColor = 'text-orange-700 bg-orange-50 border-orange-100';
  } else {
    letterGrade = 'F';
    gpaValue = '0.00';
    gpaLabel = 'Academic Review Required';
    gpaColor = 'text-rose-700 bg-rose-50 border-rose-100';
  }

  // --- SUBMISSION ACTIONS ---
  const handleQuickFill = () => {
    setSubmitTitle('Responsive Dev Portfolio Website');
    setSubmitGithub('https://github.com/student-dev/boolean-portfolio-app');
    setSubmitVercel('https://boolean-portfolio-student.vercel.app');
    setSubmitScreenshot('https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=400&h=250&fit=crop');
    setSubmitFormError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitFormError('');

    if (!submitTitle.trim()) {
      setSubmitFormError('Please enter an assignment title.');
      return;
    }
    if (!submitGithub.trim() || !submitGithub.startsWith('https://github.com/')) {
      setSubmitFormError('Please provide a valid GitHub Repository link starting with https://github.com/');
      return;
    }
    if (!submitVercel.trim() || !submitVercel.startsWith('https://')) {
      setSubmitFormError('Please provide a valid deployment link starting with https://');
      return;
    }

    setIsSubmittingForm(true);

    try {
      await addSubmission(submitTitle, submitGithub, submitVercel, submitScreenshot);
      setIsSubmittingForm(false);
      setSubmitFormSuccess(true);
      showToast('Project assignment uploaded to sandbox queue!', 'success');

      // Reset form
      setSubmitTitle('');
      setSubmitGithub('');
      setSubmitVercel('');
      setSubmitScreenshot('');

      // Clear success notification after 4s
      setTimeout(() => setSubmitFormSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setIsSubmittingForm(false);
      setSubmitFormError('Submission failed. Please check internet connection.');
    }
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- ADMIN DATA COMPUTATIONS ---
  const adminTotalSubmissions = submissions.length;
  const adminPendingSubmissions = submissions.filter((s) => s.status === 'Pending').length;
  const adminApprovedSubmissions = submissions.filter((s) => s.status === 'Approved').length;
  const adminChangesSubmissions = submissions.filter((s) => s.status === 'Changes Requested').length;
  const uniqueStudentsCount = new Set(submissions.map((s) => s.studentEmail || s.studentName)).size;
  const avgPassRate = submissions.length > 0 ? Math.round((adminApprovedSubmissions / submissions.length) * 100) : 0;
  const currentWeekSubmissionsRate = adminTotalSubmissions > 0 ? `${adminTotalSubmissions} submitted total` : "No submissions yet";
  const studentEnrollmentsRatio = `${uniqueStudentsCount} active student${uniqueStudentsCount === 1 ? '' : 's'}`;

  // Filter lists based on search criteria
  const filteredGithubSubmissions = studentSubmissions.filter((sub) => {
    const q = githubSearch.toLowerCase();
    return sub.assignmentTitle.toLowerCase().includes(q) || sub.githubUrl.toLowerCase().includes(q);
  });

  const filteredVercelSubmissions = studentSubmissions.filter((sub) => {
    const q = vercelSearch.toLowerCase();
    return sub.assignmentTitle.toLowerCase().includes(q) || sub.vercelUrl.toLowerCase().includes(q);
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Changes Requested':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Changes Requested':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="pt-24 pb-16 bg-gray-50/50 min-h-screen font-sans" id="dashboard-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* UPPER CONSOLE BAR: User summary info */}
        <div className="border-b border-gray-200/80 pb-6 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-orange-100 text-accent-orange' : 'bg-blue-100 text-primary-base'
              }`}>
                {isAdmin ? 'System Admin Workspace' : 'Student Learning Hub'}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-mono">Live Session</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-display tracking-tight mt-1">
              Dashboard
            </h1>

            {dbStatus && (
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-xs ${
                  dbStatus.mongodbConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${dbStatus.mongodbConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  Database: {dbStatus.mode}
                </span>

                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-xs ${
                  dbStatus.googleClientConfigured
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${dbStatus.googleClientConfigured ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                  Google Sign-In: {dbStatus.googleClientConfigured ? 'Connected' : 'Simulator'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dedicated STICKY Tab Navigation Row */}
        <div className="sticky top-[80px] z-40 bg-gray-50/95 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-8 border-b border-gray-200/50 flex items-center justify-between gap-4">
          {/* Console Navigation Tabs (Admin vs Student structure) */}
          <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm self-start overflow-x-auto max-w-full no-scrollbar">
            {isAdmin ? (
              // Legacy/Fallback Admin Tabs inside this component
              <div className="flex space-x-1">
                <button
                  key="legacy-admin-overview"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-primary-dark text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Overview
                </button>
                <button
                  key="legacy-admin-courses"
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'courses'
                      ? 'bg-primary-dark text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Pathway Management
                </button>
                <button
                  key="legacy-admin-sandbox"
                  onClick={() => setActiveTab('sandbox')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'sandbox'
                      ? 'bg-primary-dark text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Grading System</span>
                </button>
              </div>
            ) : (
              // NEW STUDENTS-ONLY TABS (Strictly specified tabs, no sidebar)
              <div className="flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Layers },
                  { id: 'courses', label: 'Courses', icon: BookOpen },
                  { id: 'submit', label: 'Submit Assignment', icon: Upload },
                  { id: 'grades', label: 'View Grades', icon: Award },
                  { id: 'github', label: 'Github Links', icon: Github },
                  { id: 'vercel', label: 'Vercel Links', icon: Globe }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-primary-dark text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      id={`tab-btn-${tab.id}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* MAIN PANEL CONTENT - FULL WIDTH (Sidebar is completely removed) */}
        <div className="w-full">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="tab-content-overview"
            >
              {/* Header Hero Welcome Card */}
              <div className="relative bg-gradient-to-r from-slate-900 via-primary-dark to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-accent-orange/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-3xl" />
                
                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center space-x-2 text-accent-orange font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="h-4 w-4" />
                      <span>Welcome Back, Instructor & Student Portal</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
                      Hi, {currentUser.name}!
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      {isAdmin
                        ? "You have administrative credentials to approve build submissions, track program pathways, and monitor live sandbox pipelines across the entire Academy."
                        : "Here is your academic command center. Check off your syllabus modules, monitor live code performance on Vercel, and enroll in design or security modules below."}
                    </p>
                  </div>

                  {!isAdmin && studentEnrolledCourses.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col space-y-3 min-w-[220px]">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Overall Syllabus Progress</span>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-3xl font-extrabold text-white">{overallProgressPercent}%</span>
                        <span className="text-xs text-slate-400">of syllabus</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-accent-orange h-full rounded-full transition-all duration-500"
                          style={{ width: `${overallProgressPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {completedSyllabusModulesCount} of {totalSyllabusModulesCount} items checked
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* STATS GRID */}
              {isAdmin ? (
                /* ADMIN STATS GRID */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              ) : (
                /* STUDENT STATS GRID */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled Pathways</span>
                      <div className="p-2 bg-blue-50 text-primary-base rounded-lg">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-slate-900">{studentEnrolledCourses.length}</span>
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                        Active Path
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 block">{studentRecommendedCourses.length} paths available</span>
                  </div>

                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Awaiting Grading</span>
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-slate-900">{studentPendingCount}</span>
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                        Queue Review
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 block">System checks are running</span>
                  </div>

                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Graded & Approved</span>
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-slate-900">{studentApprovedCount}</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                        Passed
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 block">Production links live</span>
                  </div>

                  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Requires Feedback</span>
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-extrabold text-slate-900">{studentChangesCount}</span>
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                        Revisions
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2 block">Read feedback in logs</span>
                  </div>
                </div>
              )}

              {/* BENTO GRID AREA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Role Specific Main Section (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  {isAdmin ? (
                    /* ADMIN OVERVIEW WIDGET */
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
                                <div key={`admin-pending-${sub.id}-${idx}`} className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-xl hover:bg-white transition-all">
                                  <div>
                                    <h5 className="text-xs font-bold text-gray-900 leading-tight">{sub.assignmentTitle}</h5>
                                    <p className="text-[10px] text-gray-500 mt-0.5">By {sub.studentName} • {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setActiveTab('sandbox');
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
                  ) : (
                    /* STUDENT OVERVIEW WIDGET: ACTIVE ENROLLED PATHWAYS */
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 font-display">
                            My Enrolled Pathways
                          </h3>
                          <p className="text-xs text-gray-500">
                            Track your interactive learning syllabus and build logs below.
                          </p>
                        </div>
                        <BookMarked className="h-5 w-5 text-primary-base" />
                      </div>

                      {studentEnrolledCourses.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                          <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <h4 className="text-sm font-bold text-gray-900">No Enrolled Courses</h4>
                          <p className="text-xs text-gray-500 mt-1 mb-4 max-w-xs mx-auto">
                            You aren't enrolled in any academy paths yet. Browse recommended courses to start.
                          </p>
                          <button
                            onClick={() => setActiveTab('courses')}
                            className="px-4 py-2 bg-primary-base text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-primary-dark"
                          >
                            Explore Course Paths
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {studentEnrolledCourses.map((course, courseIdx) => {
                            const completed = completedModules[course.id] || [];
                            const percentage = Math.round((completed.length / course.syllabus.length) * 100);
                            
                            return (
                              <div key={`student-enrolled-${course.id}-${courseIdx}`} className="border border-gray-100 p-5 rounded-2xl bg-gray-50/50 hover:bg-white transition-all space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-extrabold text-gray-900">{course.title}</h4>
                                    <span className="text-[10px] text-gray-500">{course.duration} • {course.difficulty}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-extrabold text-primary-base block">{percentage}% Done</span>
                                    <span className="text-[10px] text-gray-400">{completed.length} / {course.syllabus.length} checked</span>
                                  </div>
                                </div>

                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-primary-base h-full rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>

                                {/* Quick check off first 4 modules */}
                                <div className="space-y-2.5 pt-2 border-t border-gray-100">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Syllabus Milestones</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {course.syllabus.slice(0, 4).map((mod, modIdx) => {
                                      const isChecked = completed.includes(mod);
                                      return (
                                        <button
                                          key={`milestone-${course.id}-${courseIdx}-${modIdx}-${mod}`}
                                          onClick={() => toggleModule(course.id, mod)}
                                          className="flex items-start text-left space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-xs text-gray-700 cursor-pointer"
                                        >
                                          {isChecked ? (
                                            <CheckSquare className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                          ) : (
                                            <Square className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                                          )}
                                          <span className={`leading-tight truncate ${isChecked ? 'line-through text-gray-400' : ''}`}>
                                            {mod}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setActiveTab('courses');
                                    }}
                                    className="text-[10px] font-bold text-primary-base hover:underline flex items-center space-x-1 cursor-pointer pt-1"
                                  >
                                    <span>Manage & Check Full Syllabus ({course.syllabus.length} Modules)</span>
                                    <ArrowUpRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side: Bento side information panel (5 cols) */}
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

                  {/* DYNAMIC PATHWAY RECOGNIZER */}
                  {!isAdmin && studentRecommendedCourses.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                      <h3 className="text-base font-extrabold text-gray-900 font-display">
                        Explore Other Pathways
                      </h3>
                      <p className="text-xs text-gray-500">
                        Expand your developer profile. Enroll in other high-performance sectors with a single click.
                      </p>

                      <div className="space-y-3.5 pt-2">
                        {studentRecommendedCourses.map((rec, idx) => (
                          <div key={`student-rec-${rec.id}-${idx}`} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-gray-200 transition-all">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-accent-orange uppercase tracking-wider">{rec.category}</span>
                              <h4 className="text-xs font-bold text-gray-900">{rec.title}</h4>
                              <p className="text-[10px] text-gray-400">{rec.duration} • {rec.difficulty}</p>
                            </div>
                            <button
                              onClick={() => enrollInCourse(rec.id)}
                              className="bg-primary-base hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm cursor-pointer transition-all flex items-center space-x-1"
                            >
                              <Zap className="h-3 w-3" />
                              <span>Enroll</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ADMIN SYSTEM DEFAULTS UTILITY */}
                  {isAdmin && (
                    <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-8 shadow-sm text-white space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-accent-orange/15 rounded-full blur-2xl" />
                      <h3 className="text-sm font-bold text-accent-orange uppercase tracking-wider flex items-center space-x-1.5">
                        <GraduationCap className="h-4 w-4" />
                        <span>Console Command Center</span>
                      </h3>
                      <p className="text-xs text-slate-300 leading-normal">
                        Monitor pipeline status and run student emulations to test grading mechanics dynamically.
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
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: MY PATHWAYS / PATHWAY CATALOG */}
          {activeTab === 'courses' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="tab-content-courses"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 font-display">
                  {isAdmin ? 'Pathway Management & Catalog' : 'My Academic Pathways'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isAdmin
                    ? "View and review the active academy course list, inspect curriculum items, and monitor student metrics."
                    : "Check off completed milestones in your syllabus. Expand your skillset by enrolling in supplementary pathways."}
                </p>
              </div>

              {/* Courses list Grid - expanded to 3 columns since sidebar is gone */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, courseIdx) => {
                  const isEnrolled = studentEnrolledIds.includes(course.id);
                  const completed = completedModules[course.id] || [];
                  const percentage = Math.round((completed.length / course.syllabus.length) * 100);

                  return (
                    <div key={`course-card-${course.id}-${courseIdx}`} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      
                      {/* Course header banner */}
                      <div 
                        className={`p-6 sm:p-8 text-white relative bg-cover bg-center ${!(course.image && (course.image.startsWith('data:') || course.image.startsWith('http'))) ? (course.image || 'bg-slate-800') : ''}`}
                        style={course.image && (course.image.startsWith('data:') || course.image.startsWith('http')) ? { backgroundImage: `url(${course.image})` } : undefined}
                      >
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {course.difficulty}
                        </div>
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest block mb-1">
                          {course.category}
                        </span>
                        <h3 className="text-xl font-bold font-display leading-tight">{course.title}</h3>
                        <p className="text-xs text-white/85 font-sans mt-2 line-clamp-2">{course.description}</p>
                      </div>

                      {/* Course body and syllabus details */}
                      <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100">
                            <span className="font-bold">Syllabus Curriculum</span>
                            <span>{course.duration} Duration</span>
                          </div>

                          {/* Checklist of modules */}
                          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                            {course.syllabus.map((mod, modIdx) => {
                              const isChecked = completed.includes(mod);
                              return (
                                <div
                                  key={`syllabus-${course.id}-${courseIdx}-${modIdx}-${mod}`}
                                  className={`flex items-start text-xs p-2.5 rounded-xl border transition-all ${
                                    isChecked
                                      ? 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                                      : 'bg-gray-50/50 border-gray-150 text-gray-600 hover:bg-white'
                                  }`}
                                >
                                  {isEnrolled && !isAdmin ? (
                                    <button
                                      onClick={() => toggleModule(course.id, mod)}
                                      className="mr-2.5 mt-0.5 text-gray-400 hover:text-primary-base cursor-pointer flex-shrink-0"
                                    >
                                      {isChecked ? (
                                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                                      ) : (
                                        <Square className="h-4 w-4 text-gray-300" />
                                      )}
                                    </button>
                                  ) : (
                                    <div className="mr-2.5 mt-1 flex-shrink-0">
                                      <div className="h-1.5 w-1.5 rounded-full bg-primary-base" />
                                    </div>
                                  )}
                                  <span className={`leading-snug ${isChecked && isEnrolled && !isAdmin ? 'line-through text-gray-400' : ''}`}>
                                    {mod}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Course footer controls */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          {isEnrolled ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Enrolled</span>
                              </span>
                              {!isAdmin && (
                                <span className="text-xs font-bold text-primary-base bg-blue-50 px-2 py-1 rounded-full">
                                  {percentage}% Completed
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (!isAdmin) {
                                  enrollInCourse(course.id);
                                }
                              }}
                              disabled={isAdmin}
                              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                isAdmin
                                  ? 'bg-gray-100 text-gray-400 border border-gray-200'
                                  : 'bg-primary-base hover:bg-primary-dark text-white cursor-pointer shadow-md shadow-blue-500/10'
                              }`}
                            >
                              {isAdmin ? 'Standard Core Module' : 'Enroll in Pathway'}
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedCourseId(course.id)}
                            className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center space-x-0.5 cursor-pointer"
                          >
                            <span>Full Specifications</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SUBMIT ASSIGNMENT */}
          {activeTab === 'submit' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="tab-content-submit"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 font-display">
                  Submit Project Assignment
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Upload your active repository paths and live web deployment URLs. Our backend instantly checks logs and queues for grading.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form column (5 cols) */}
                <div className="lg:col-span-5">
                  <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex space-x-2 text-gray-300">
                      <Github className="h-6 w-6 opacity-30" />
                      <Globe className="h-6 w-6 opacity-30" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 font-display mb-2">
                      New Project Submission
                    </h3>
                    <p className="text-xs text-gray-500 font-sans mb-6">
                      Provide accurate GitHub Repository structures and secure live HTTPS deployment hosts.
                    </p>

                    {submitFormError && (
                      <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>{submitFormError}</span>
                      </div>
                    )}

                    {submitFormSuccess && (
                      <div className="mb-4 p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span>Project Uploaded Successfully!</span>
                        </div>
                        <span className="text-emerald-700 pl-6 text-[11px]">It has been successfully added to your live submissions list.</span>
                      </div>
                    )}

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      {/* Assignment Title */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Assignment Title
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="e.g. Responsive Portfolio Project"
                            value={submitTitle}
                            onChange={(e) => { setSubmitTitle(e.target.value); setSubmitFormError(''); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                            required
                          />
                        </div>
                      </div>

                      {/* Github Link */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          GitHub Repository URL
                        </label>
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="e.g. https://github.com/username/project"
                            value={submitGithub}
                            onChange={(e) => { setSubmitGithub(e.target.value); setSubmitFormError(''); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                            required
                          />
                        </div>
                      </div>

                      {/* Vercel Link */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Vercel Deployment URL
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="e.g. https://my-project.vercel.app"
                            value={submitVercel}
                            onChange={(e) => { setSubmitVercel(e.target.value); setSubmitFormError(''); }}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                            required
                          />
                        </div>
                      </div>

                      {/* Screenshot URL */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Mock Screenshot URL (Optional)
                        </label>
                        <div className="relative">
                          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Leave empty or input online image URL"
                            value={submitScreenshot}
                            onChange={(e) => setSubmitScreenshot(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                          />
                        </div>
                      </div>

                      {/* Quick Fill & Submit */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={handleQuickFill}
                          className="text-xs text-primary-base font-bold hover:underline"
                        >
                          ⚡ Pre-fill Sample Links
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingForm}
                        className="w-full bg-primary-base hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isSubmittingForm ? (
                          <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit Project Bundle</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Queue Display column (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center justify-between bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50">
                    <div>
                      <h3 className="font-bold text-gray-900 font-display">My Submitted Assignments</h3>
                      <p className="text-xs text-gray-500">A live status overview of all your submitted coursework.</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                    {studentSubmissions.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-gray-900">No Submissions Yet</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          You haven't uploaded any projects yet. Fill in the form on the left to complete your first submission.
                        </p>
                      </div>
                    ) : (
                      studentSubmissions.map((sub, idx) => (
                        <div
                          key={`submit-queue-${sub.id}-${idx}`}
                          className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col gap-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start space-x-3.5">
                              <div className="p-3 rounded-xl bg-gray-50 text-gray-600 border border-gray-100 flex-shrink-0">
                                <FileText className="h-5 w-5 text-primary-base" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-gray-900 text-sm leading-tight">{sub.assignmentTitle}</span>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full flex items-center gap-1 ${getStatusBadge(sub.status)}`}>
                                    {getStatusIcon(sub.status)}
                                    {sub.status}
                                  </span>
                                  {sub.grade && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-amber-100 bg-amber-50 text-amber-700 rounded-full">
                                      Grade: {sub.grade}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          {sub.comment && (
                            <div className="text-xs bg-gray-50 border border-gray-100 p-3 rounded-xl text-gray-700">
                              <span className="font-bold text-gray-900 block mb-1">Instructor Feedback:</span>
                              {sub.comment}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: VIEW GRADES */}
          {activeTab === 'grades' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="tab-content-grades"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 font-display">
                  My Academic Grades & Standing
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  View verified coursework grades, overall program performances, and cumulative GPA reports.
                </p>
              </div>

              {/* Cumulative standing Report Card Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual GPA Card (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-primary-dark to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-accent-orange/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-blue-500/10 rounded-full blur-3xl" />

                  <div className="relative space-y-6">
                    <div className="flex items-center space-x-2 text-accent-orange">
                      <Award className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-widest">Cumulative GPA Report Card</span>
                    </div>

                    <div className="flex items-center space-x-6 py-4 border-y border-slate-800">
                      <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{letterGrade}</span>
                        <span className="text-[10px] text-slate-300 font-bold uppercase">Letter Grade</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cumulative Standing GPA</span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-black text-white">{gpaValue}</span>
                          <span className="text-xs text-slate-400">/ 4.00</span>
                        </div>
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 border ${gpaColor}`}>
                          {gpaLabel}
                        </span>
                      </div>
                    </div>

                    {/* Progress indicators */}
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Average Course Syllabus Completion</span>
                          <span className="font-bold text-white">{Math.round(avgCourseCompletion)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-accent-orange h-full rounded-full transition-all duration-500"
                            style={{ width: `${avgCourseCompletion}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Assignment Approval Rate</span>
                          <span className="font-bold text-white">{Math.round(assignmentPassRate)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${assignmentPassRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Grade Listings (7 cols) */}
                <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-display">Gradebook Ledger</h3>
                    <p className="text-xs text-gray-500">Detailed list of grades assigned to submitted assignments.</p>
                  </div>

                  <div className="space-y-4">
                    {studentSubmissions.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <Inbox className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">No project submissions recorded yet.</p>
                      </div>
                    ) : (
                      studentSubmissions.map((sub, idx) => {
                        let scoreDisplay = '-- / 100';
                        let gradeDisplay = 'Pending Grade';
                        let gradeTextColor = 'text-gray-500 bg-gray-50';

                        if (sub.grade) {
                          gradeDisplay = `${sub.grade} (${sub.status})`;
                          if (sub.status === 'Approved') {
                            scoreDisplay = '100 / 100';
                            gradeTextColor = 'text-emerald-700 bg-emerald-50';
                          } else if (sub.status === 'Changes Requested') {
                            scoreDisplay = '60 / 100';
                            gradeTextColor = 'text-rose-700 bg-rose-50';
                          } else {
                            gradeTextColor = 'text-amber-700 bg-amber-50';
                          }
                        } else {
                          if (sub.status === 'Approved') {
                            scoreDisplay = '100 / 100';
                            gradeDisplay = 'A+ (Pass)';
                            gradeTextColor = 'text-emerald-700 bg-emerald-50';
                          } else if (sub.status === 'Changes Requested') {
                            scoreDisplay = '60 / 100';
                            gradeDisplay = 'F (Needs Work)';
                            gradeTextColor = 'text-rose-700 bg-rose-50';
                          }
                        }

                        return (
                          <div
                            key={`grade-item-${sub.id}-${idx}`}
                            className="flex flex-col p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-xs transition-all gap-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-gray-950">{sub.assignmentTitle}</h4>
                                <p className="text-[11px] text-gray-400">
                                  Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-4 self-end sm:self-center">
                                <div className="text-right">
                                  <span className="text-xs font-bold text-gray-500 block">System Score</span>
                                  <span className="text-sm font-extrabold text-gray-900">{scoreDisplay}</span>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-xs font-black text-center min-w-[110px] ${gradeTextColor}`}>
                                  {gradeDisplay}
                                </div>
                              </div>
                            </div>
                            {sub.comment && (
                              <div className="mt-1 text-xs bg-white border border-gray-100 p-3 rounded-xl text-gray-700">
                                <span className="font-bold text-gray-900 block mb-1">Instructor Feedback:</span>
                                {sub.comment}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 5: VIEW GITHUB LINKS */}
          {activeTab === 'github' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="tab-content-github"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 font-display flex items-center gap-2">
                    <Github className="h-6 w-6 text-slate-900" />
                    <span>My Submitted Github Links</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    A secure registry of all repository source codes uploaded by your account.
                  </p>
                </div>

                {/* Live Search bar */}
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search github links..."
                    value={githubSearch}
                    onChange={(e) => setGithubSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* GitHub Links List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGithubSubmissions.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <Github className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-gray-900">No GitHub Links Found</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {githubSearch ? 'Try a different search term or query.' : 'Submit a project assignment to populate repository registry.'}
                    </p>
                  </div>
                ) : (
                  filteredGithubSubmissions.map((sub, idx) => (
                    <div
                      key={`github-link-card-${sub.id}-${idx}`}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow gap-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full flex items-center gap-1 ${getStatusBadge(sub.status)}`}>
                            {getStatusIcon(sub.status)}
                            {sub.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-gray-950 line-clamp-1">{sub.assignmentTitle}</h4>
                          <span className="text-[11px] text-gray-400 font-mono select-all block mt-1 leading-normal truncate">
                            {sub.githubUrl}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                        <button
                          onClick={() => handleCopyToClipboard(sub.githubUrl, `git-${sub.id}`)}
                          className="flex-1 flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                        >
                          {copiedId === `git-${sub.id}` ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <a
                          href={sub.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-primary-base hover:bg-primary-dark text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Visit Repo</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: VIEW VERCEL LINKS */}
          {activeTab === 'vercel' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
              id="tab-content-vercel"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 font-display flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                    <span>My Submitted Vercel Links</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    A listing of all compiled host sites and active deployment locations.
                  </p>
                </div>

                {/* Live Search bar */}
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vercel links..."
                    value={vercelSearch}
                    onChange={(e) => setVercelSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Vercel Links List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVercelSubmissions.length === 0 ? (
                  <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <Globe className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-gray-900">No Vercel Links Found</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {vercelSearch ? 'Try a different search term or query.' : 'Submit a project assignment to populate deployment hosts.'}
                    </p>
                  </div>
                ) : (
                  filteredVercelSubmissions.map((sub, idx) => (
                    <div
                      key={`vercel-link-card-${sub.id}-${idx}`}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow gap-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full flex items-center gap-1 ${getStatusBadge(sub.status)}`}>
                            {getStatusIcon(sub.status)}
                            {sub.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-extrabold text-gray-950 line-clamp-1">{sub.assignmentTitle}</h4>
                          <span className="text-[11px] text-gray-400 font-mono select-all block mt-1 leading-normal truncate">
                            {sub.vercelUrl}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                        <button
                          onClick={() => handleCopyToClipboard(sub.vercelUrl, `vercel-${sub.id}`)}
                          className="flex-1 flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                        >
                          {copiedId === `vercel-${sub.id}` ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <a
                          href={sub.vercelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-primary-base hover:bg-primary-dark text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Visit Live</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB (LEGACY ADMIN GRADING SANDBOX) */}
          {isAdmin && activeTab === 'sandbox' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              id="tab-content-sandbox"
            >
              {/* Fallback load of sandbox inside student dashboard if admin is here */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8">
                <span className="text-xs text-slate-500">Grading queue fallback workspace for administrator roles.</span>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
