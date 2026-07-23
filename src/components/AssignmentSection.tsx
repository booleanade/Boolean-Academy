import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Github, Globe, Upload, FileText, Send, CheckCircle2, AlertTriangle, Clock, ArrowUpRight, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AssignmentSection() {
  const { currentUser, submissions, addSubmission, updateSubmissionStatus, setRegisterOpen } = useApp();

  // Form states
  const [title, setTitle] = useState('');
  const [github, setGithub] = useState('');
  const [vercel, setVercel] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleQuickFill = () => {
    setTitle('Personal Dev Portfolio Widget');
    setGithub('https://github.com/student-dev/boolean-portfolio');
    setVercel('https://boolean-portfolio-student.vercel.app');
    setScreenshot('https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=400&h=250&fit=crop');
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter an assignment title.');
      return;
    }
    if (!github.trim() || !github.startsWith('https://github.com/')) {
      setFormError('Please provide a valid GitHub Repository link starting with https://github.com/');
      return;
    }
    if (!vercel.trim() || !vercel.startsWith('https://')) {
      setFormError('Please provide a valid deployment link starting with https://');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addSubmission(title, github, vercel, screenshot);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form
      setTitle('');
      setGithub('');
      setVercel('');
      setScreenshot('');

      // Clear success notification after 4s
      setTimeout(() => setSubmitSuccess(false), 4000);
    }, 1200);
  };

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
    <section id="submissions" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-indigo-50/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-50/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary-base tracking-wider uppercase mb-3">
            Assignment submission
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-display">
            Real Deployment Sandbox
          </p>
          <div className="h-1 w-12 bg-accent-orange mx-auto rounded mt-4 mb-4" />
          <p className="text-lg text-gray-600">
            Submit your active projects. Our build systems verify repository commits and test live webpage performance on Vercel instantly.
          </p>
        </div>

        {/* Content Split: Left Form / Right Submissions Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Admin Workspace or Student Submission form (5 cols on large screen) */}
          <div className="lg:col-span-5">
            {currentUser?.role === 'admin' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-950/25 relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-accent-orange/10 rounded-full blur-2xl" />
                
                <div className="relative space-y-6">
                  {/* Title / Header */}
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-orange-500/10 text-accent-orange border border-orange-500/20 rounded-xl">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-accent-orange uppercase tracking-widest block">System Controller</span>
                      <h3 className="text-xl font-extrabold font-display leading-none">Admin Workspace</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    You are logged in as an <strong className="text-white">Academy Administrator</strong>. Use this workspace to oversee all live student sandbox codes, inspect repositories, and approve/request changes for their active programs.
                  </p>

                  {/* Active Statistics Card Grid */}
                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="bg-slate-800/50 border border-slate-850 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Projects</span>
                      <span className="text-2xl font-extrabold text-white mt-1 block">{submissions.length}</span>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pending Review</span>
                      <span className="text-2xl font-extrabold text-amber-300 mt-1 block">
                        {submissions.filter(s => s.status === 'Pending').length}
                      </span>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Approved</span>
                      <span className="text-2xl font-extrabold text-emerald-300 mt-1 block">
                        {submissions.filter(s => s.status === 'Approved').length}
                      </span>
                    </div>
                    <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Revision Req.</span>
                      <span className="text-2xl font-extrabold text-rose-300 mt-1 block">
                        {submissions.filter(s => s.status === 'Changes Requested').length}
                      </span>
                    </div>
                  </div>

                  {/* Administrator Quick Actions */}
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Sandbox Utilities</h4>
                    
                    <button
                      type="button"
                      onClick={() => {
                        // Quick add mock student submission to make grading feel amazing!
                        addSubmission(
                          "E-Commerce Sandbox Checkout API",
                          "https://github.com/adeya-dev/commerce-sandbox-api",
                          "https://adeya-commerce-api.vercel.app"
                        );
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-700/50 text-slate-200"
                    >
                      <span>⚡ Spawn Mock Student Submission</span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-accent-orange" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('boolean_submissions');
                        window.location.reload();
                      }}
                      className="w-full text-center p-3 rounded-xl bg-slate-850 hover:bg-rose-950/40 text-xs font-bold transition-all cursor-pointer border border-slate-800 text-rose-400 hover:border-rose-500/20"
                    >
                      🗑️ Clean Submission Logs
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                {/* Vercel + Github Watermarks at the top right */}
                <div className="absolute top-4 right-4 flex space-x-2 text-gray-300">
                  <Github className="h-6 w-6 opacity-30" />
                  <Globe className="h-6 w-6 opacity-30" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 font-display mb-2">
                  Submit Your Project
                </h3>
                <p className="text-xs text-gray-500 font-sans mb-6">
                  Fill in your repository path and production-ready host links below.
                </p>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {submitSuccess && (
                  <div className="mb-4 p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-100 flex flex-col space-y-1">
                    <div className="flex items-center space-x-2 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>Project Uploaded Successfully!</span>
                    </div>
                    <span className="text-emerald-700 pl-6">It is now listed in the portal live feed queue.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setFormError(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                        id="input-assignment-title"
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
                        value={github}
                        onChange={(e) => { setGithub(e.target.value); setFormError(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                        id="input-github-url"
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
                        value={vercel}
                        onChange={(e) => { setVercel(e.target.value); setFormError(''); }}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                        id="input-vercel-url"
                      />
                    </div>
                  </div>

                  {/* Screenshot URL / Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Mock Screenshot URL (Optional)
                    </label>
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Leave empty or input online image URL"
                        value={screenshot}
                        onChange={(e) => setScreenshot(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
                        id="input-screenshot-url"
                      />
                    </div>
                  </div>

                  {/* Quick Fill & submit button */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-xs text-primary-base font-bold hover:underline"
                      id="btn-quick-fill-assignment"
                    >
                      ⚡ Pre-fill Sample Project
                    </button>
                  </div>

                  {currentUser ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary-base hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                      id="btn-submit-assignment"
                    >
                      {isSubmitting ? (
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Submit Project Bundle</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setRegisterOpen(true)}
                      className="w-full bg-accent-orange hover:bg-accent-orange-hover text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                      id="btn-submit-assignment-unauthenticated"
                    >
                      <span>Register to Submit Projects</span>
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Submissions Live Feed Grid (7 cols on large screen) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50">
              <div>
                <h3 className="font-bold text-gray-900 font-display">Student Portal Submissions</h3>
                <p className="text-xs text-gray-500">Live active tracking feed of verified digital grading queue.</p>
              </div>
              <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              <AnimatePresence mode="popLayout">
                {(() => {
                  const seen = new Set<string>();
                  const uniqueSubmissions = submissions.filter((sub, idx) => {
                    const keyToTrack = sub.id || `sub-idx-${idx}`;
                    if (seen.has(keyToTrack)) return false;
                    seen.add(keyToTrack);
                    return true;
                  });
                  return uniqueSubmissions.map((sub, idx) => (
                    <motion.div
                      key={sub.id ? `submission-${sub.id}-idx-${idx}` : `submission-idx-${idx}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35 }}
                      className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                      id={`sub-item-${sub.id}`}
                    >
                      <div className="flex items-start space-x-3.5">
                        {/* Left icon wrapper */}
                        <div className="p-3 rounded-xl bg-gray-50 text-gray-600 border border-gray-100 flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary-base" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm leading-tight">{sub.assignmentTitle}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full flex items-center gap-1 ${getStatusBadge(sub.status)}`}>
                              {getStatusIcon(sub.status)}
                              {sub.status}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Submitted by <span className="font-semibold text-gray-700">{sub.studentName}</span> • {new Date(sub.submittedAt).toLocaleDateString()}
                          </div>

                          {/* Integration logos/links */}
                          <div className="flex items-center space-x-4 pt-2">
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
                      </div>

                      {/* Admin review controls */}
                      {currentUser?.role === 'admin' && (
                        <div className="flex items-center space-x-1.5 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 w-full md:w-auto justify-end">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1 hidden lg:inline">Grade:</span>
                          <button
                            onClick={() => updateSubmissionStatus(sub.id, 'Approved')}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                              sub.status === 'Approved'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold ring-1 ring-emerald-200'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            title="Approve Submission"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="md:hidden lg:inline text-[10px]">Approve</span>
                          </button>
                          <button
                            onClick={() => updateSubmissionStatus(sub.id, 'Changes Requested')}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                              sub.status === 'Changes Requested'
                                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold ring-1 ring-rose-200'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            title="Request Changes"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                            <span className="md:hidden lg:inline text-[10px]">Revision</span>
                          </button>
                          <button
                            onClick={() => updateSubmissionStatus(sub.id, 'Pending')}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                              sub.status === 'Pending'
                                ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold ring-1 ring-amber-200'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                            title="Set to Pending"
                          >
                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                            <span className="md:hidden lg:inline text-[10px]">Reset</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ));
                })()}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
