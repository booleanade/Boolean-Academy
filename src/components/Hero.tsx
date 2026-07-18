import React from 'react';
import { useApp } from '../AppContext';
import { ArrowRight, Sparkles, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
// Import the generated image relative path
import heroImg from '../assets/images/hero_students_coding_1783787192288.jpg';

export default function Hero() {
  const { setRegisterOpen, currentUser } = useApp();

  const handleScrollToCourses = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const coursesSection = document.querySelector('#courses');
    if (coursesSection) {
      const navHeight = 80;
      const elementPosition = coursesSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen pt-28 pb-16 flex items-center bg-brand-bg overflow-hidden"
    >
      {/* Decorative abstract elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-200/5 rounded-full blur-3xl -z-10" />

      {/* Grid Pattern Background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Text Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 text-primary-base font-semibold text-xs uppercase tracking-wider py-1.5 px-4 rounded-full"
            >
              <Sparkles className="h-4 w-4 text-accent-orange animate-pulse" />
              <span>Accredited Technical Education Portal</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight"
              >
                Learn. Build.<br />
                <span className="bg-gradient-to-r from-primary-dark via-primary-base to-primary-light bg-clip-text text-transparent">
                  Launch Your Tech Career.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed font-sans"
              >
                BooleanAcademy provides practical software engineering education where students learn by building real-world projects and deploying them online.
              </motion.p>
            </div>

            {/* Quick checkmarks */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-accent-orange flex-shrink-0" />
                <span>100% Practical project-based grading</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-accent-orange flex-shrink-0" />
                <span>Deploy to live Vercel links</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-accent-orange flex-shrink-0" />
                <span>Verified digital certifications</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-accent-orange flex-shrink-0" />
                <span>1-on-1 industry mentor feedback</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <button
                onClick={() => setRegisterOpen(true)}
                className="bg-accent-orange hover:bg-accent-orange-hover text-white font-bold text-base py-3.5 px-8 rounded-xl shadow-lg shadow-accent-orange/20 hover:shadow-accent-orange-hover/30 transition-all duration-200 flex items-center justify-center space-x-2 group transform hover:-translate-y-0.5"
                id="btn-hero-enroll"
              >
                <span>{currentUser ? 'Go to Academy' : 'Enroll Now'}</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>
              
              <button
                onClick={handleScrollToCourses}
                className="border-2 border-primary-base text-primary-base hover:bg-blue-50 font-bold text-base py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-1"
                id="btn-hero-browse"
              >
                <BookOpen className="h-5 w-5 mr-1" />
                <span>Browse Courses</span>
              </button>
            </motion.div>
          </div>

          {/* Hero Illustration / Right side */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-md sm:max-w-lg lg:max-w-full aspect-square md:aspect-auto h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border-4 border-white/50 bg-gradient-to-br from-blue-100 to-indigo-50"
            >
              {/* Educational illustration element using the generated image */}
              <img
                src={heroImg}
                alt="Students coding together at BooleanAcademy"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Gradient Overlay for high-end feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/40 via-transparent to-transparent pointer-events-none" />

              {/* Glassmorphic overlay widget: Real-time project status */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md border border-white/40 p-4 rounded-2xl shadow-xl flex items-center space-x-4 animate-bounce-slow">
                <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Assignment submission</div>
                  <div className="text-sm font-bold text-gray-900">Portfolio graded: <span className="text-emerald-600 font-extrabold">A+ Excellent</span></div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
