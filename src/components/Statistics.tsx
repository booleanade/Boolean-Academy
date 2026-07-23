import React from 'react';
import { Users, BookOpen, Award, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function Statistics() {
  const stats = [
    {
      id: 'stat-enrolled',
      value: '500+',
      label: 'Students Enrolled',
      icon: Users,
      color: 'text-primary-base',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      id: 'stat-courses',
      value: '25+',
      label: 'Professional Courses',
      icon: BookOpen,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      id: 'stat-rate',
      value: '98%',
      label: 'Course Completion Rate',
      icon: Award,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      id: 'stat-projects',
      value: '50+',
      label: 'Projects Submitted',
      icon: CheckSquare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
  ];

  return (
    <section className="py-12 bg-white relative z-10 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={`stat-${stat.id}-${index}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col items-center md:flex-row md:items-start p-6 rounded-2xl bg-white border ${stat.borderColor} shadow-sm hover:shadow-md transition-all duration-300 group`}
                id={stat.id}
              >
                {/* Icon Container */}
                <div className={`p-4 rounded-xl ${stat.bgColor} ${stat.color} mb-4 md:mb-0 md:mr-4 transition-all duration-300 group-hover:scale-110`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                {/* Stats Numbers & Label */}
                <div className="text-center md:text-left">
                  <div className="text-3xl font-extrabold text-gray-900 tracking-tight font-display mb-0.5">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-500 font-sans">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
