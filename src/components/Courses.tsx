import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Search, Clock, Award, BookOpen, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course } from '../types';

export default function Courses() {
  const { courses, currentUser, enrollInCourse, setSelectedCourseId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'development' | 'design' | 'security'>('all');

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || course.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Intermediate': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Advanced': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <section id="courses" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/2 left-0 w-[300px] h-[300px] bg-amber-50/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-base font-bold text-primary-base tracking-wider uppercase mb-3">
            Explorable Courses
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-display">
            Our Professional Programs
          </p>
          <div className="h-1 w-12 bg-accent-orange mx-auto rounded mt-4 mb-4" />
          <p className="text-lg text-gray-600">
            Learn with modular tracks. Submit code repositories, build dynamic user interfaces, and deploy your final build to the web.
          </p>
        </div>

        {/* Search & Tabs Filtering */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 bg-blue-50/50 border border-blue-100/30 p-4 rounded-3xl backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'development', 'design', 'security'] as const).map((tab, idx) => (
              <button
                key={`course-tab-${tab}-${idx}`}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-5 text-sm font-semibold rounded-xl transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'bg-primary-dark text-white shadow-md shadow-blue-900/10'
                    : 'bg-white text-gray-600 hover:text-primary-base hover:bg-blue-50/40 border border-gray-100'
                }`}
                id={`tab-${tab}`}
              >
                {tab === 'all' ? 'All Programs' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary-base focus:ring-2 focus:ring-blue-100 transition-all duration-150"
              id="course-search-input"
            />
          </div>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {(() => {
              const seen = new Set<string>();
              const uniqueCourses = filteredCourses.filter(c => {
                const cid = c.id || c.title;
                if (seen.has(cid)) return false;
                seen.add(cid);
                return true;
              });
              return uniqueCourses.map((course, index) => {
                const isEnrolled = currentUser?.enrolledCourses.includes(course.id) || false;

                return (
                  <motion.div
                    key={course.id ? `course-item-${course.id}-idx-${index}` : `course-item-idx-${index}`}
                    layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  id={`course-${course.id}`}
                >
                  <div>
                    {/* Course Card Banner Header */}
                    <div 
                      className={`h-40 relative p-6 flex flex-col justify-between text-white bg-cover bg-center ${!(course.image && (course.image.startsWith('data:') || course.image.startsWith('http'))) ? (course.image || 'bg-slate-800') : ''}`}
                      style={course.image && (course.image.startsWith('data:') || course.image.startsWith('http')) ? { backgroundImage: `url(${course.image})` } : undefined}
                    >
                      {/* Grid overlays */}
                      <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      
                      {/* Difficulty and Program Tags */}
                      <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full">
                          {course.category}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border rounded-full backdrop-blur-md ${getDifficultyColor(course.difficulty)} bg-white/90`}>
                          {course.difficulty}
                        </span>
                      </div>

                      {/* Title on Overlay */}
                      <h3 className="text-xl font-bold tracking-tight z-10 font-display drop-shadow-sm">
                        {course.title}
                      </h3>
                    </div>

                    {/* Card Content body */}
                    <div className="p-6 space-y-4">
                      <p className="text-sm text-gray-600 leading-relaxed font-sans min-h-[60px]">
                        {course.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs font-semibold text-gray-500 py-2 border-y border-gray-50">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-primary-base" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4 text-accent-orange" />
                          <span>{course.syllabus.length} Core Modules</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions bottom */}
                  <div className="p-6 pt-0 flex gap-2">
                    <button
                      onClick={() => setSelectedCourseId(course.id)}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:text-primary-dark hover:bg-gray-50 text-xs font-bold rounded-xl transition-all duration-200"
                      id={`btn-syllabus-${course.id}`}
                    >
                      Syllabus Detail
                    </button>

                    <button
                      onClick={() => enrollInCourse(course.id)}
                      className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                        isEnrolled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
                          : 'bg-primary-base text-white hover:bg-primary-dark shadow-md shadow-blue-500/10 hover:shadow-blue-900/20'
                      }`}
                      id={`btn-enroll-${course.id}`}
                    >
                      {isEnrolled ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Enrolled</span>
                        </>
                      ) : (
                        <span>Enroll Program</span>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            });
          })()}
        </AnimatePresence>
        </div>

        {/* Empty state search result */}
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-blue-50/30 rounded-3xl border border-dashed border-blue-100 max-w-md mx-auto mt-8"
          >
            <p className="text-gray-500 font-medium">No courses found matching "{searchQuery}"</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              className="mt-3 text-sm text-primary-base font-bold hover:underline"
            >
              Reset filters
            </button>
          </motion.div>
        )}

      </div>
    </section>
  );
}
