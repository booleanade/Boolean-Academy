import React from 'react';
import { UserPlus, Compass, Share2, Users, LayoutDashboard, ShieldAlert, Award, FileCheck2, Code2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Features() {
  const features = [
    {
      id: 'feat-reg',
      title: 'Student Registration',
      description: 'Students can easily create an account, build their academic profile, and track learning achievements.',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-600',
      badge: 'Simple Setup',
    },
    {
      id: 'feat-enroll',
      title: 'Course Enrollment',
      description: 'Enroll in industry-relevant courses instantly and access high-quality curriculum, syllabus, and step-by-step videos.',
      icon: Compass,
      color: 'bg-amber-100 text-amber-600',
      badge: 'One-Click',
    },
    {
      id: 'feat-assign',
      title: 'Assignment Submission',
      description: 'Submit real-world assignments by linking your active GitHub repository and live Vercel production deployment URL.',
      icon: Code2,
      color: 'bg-emerald-100 text-emerald-600',
      badge: 'Production-Ready',
    },
    {
      id: 'feat-inst',
      title: 'Expert Instructors',
      description: 'Learn directly from experienced senior developers, technical architects, and open-source contributors.',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600',
      badge: 'Industry Veterans',
    },
    {
      id: 'feat-dash',
      title: 'Student Dashboard',
      description: 'Monitor your course progress, check assignment grading feedback, and visualize your code learning analytics.',
      icon: LayoutDashboard,
      color: 'bg-pink-100 text-pink-600',
      badge: 'Personalized',
    },
    {
      id: 'feat-cert',
      title: 'Certification',
      description: 'Earn a cryptographically secured technical certificate that demonstrates your verified project accomplishments.',
      icon: FileCheck2,
      color: 'bg-purple-100 text-purple-600',
      badge: 'Verified Credential',
    },
  ];

  return (
    <section id="features" className="py-20 bg-brand-bg relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-400/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary-base tracking-wider uppercase mb-3">
            Why Choose Us
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-display">
            Why Choose BooleanAcademy?
          </p>
          <div className="h-1 w-12 bg-accent-orange mx-auto rounded mt-4 mb-4" />
          <p className="text-lg text-gray-600">
            We provide a unique, project-centered development program that mimics real engineering environments, preparing you to deploy software on day one.
          </p>
        </div>

        {/* Features Bento/Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const IconComp = feat.icon;
            return (
              <motion.div
                key={`feature-${feat.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group flex flex-col justify-between"
                id={feat.id}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Icon frame */}
                    <div className={`p-4 rounded-2xl ${feat.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md shadow-inner`}>
                      <IconComp className="h-6 w-6" />
                    </div>
                    {/* Subtle tag */}
                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-full">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-base transition-colors duration-200 mb-3 font-display">
                    {feat.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-sm font-sans">
                    {feat.description}
                  </p>
                </div>

                {/* Bottom decorative arrow link */}
                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center text-primary-base text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="mr-1">Learn more</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
