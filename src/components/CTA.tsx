import React from 'react';
import { useApp } from '../AppContext';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export default function CTA() {
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
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Rounded Gradient Container card */}
        <div className="relative bg-gradient-to-br from-primary-dark via-primary-base to-blue-800 rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white overflow-hidden shadow-xl shadow-blue-900/20">
          
          {/* Abstract vector backgrounds inside card */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-5 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-orange/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            
            {/* Logo watermark icon */}
            <div className="mx-auto w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-accent-orange">
              <GraduationCap className="h-6 w-6" />
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display"
              id="cta-title"
            >
              Ready to Start Learning?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-blue-100 max-w-xl mx-auto font-sans leading-relaxed"
            >
              Join hundreds of active students already building, deploying, and certifying amazing software projects.
            </motion.p>

            {/* Buttons Group */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-4"
            >
              <button
                onClick={() => setRegisterOpen(true)}
                className="bg-accent-orange hover:bg-accent-orange-hover text-white font-bold text-base py-3.5 px-8 rounded-xl shadow-lg shadow-accent-orange/10 transition-all duration-200 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 group"
                id="btn-cta-register"
              >
                <span>{currentUser ? 'Enter Dashboard' : 'Register Now'}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleScrollToCourses}
                className="bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-sm text-white font-bold text-base py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-1.5"
                id="btn-cta-courses"
              >
                <BookOpen className="h-4.5 w-4.5 mr-1 text-accent-orange" />
                <span>Explore Courses</span>
              </button>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
