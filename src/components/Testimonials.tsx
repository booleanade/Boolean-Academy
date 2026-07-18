import React from 'react';
import { useApp } from '../AppContext';
import { Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';

export default function Testimonials() {
  const { testimonials } = useApp();

  return (
    <section id="testimonials" className="py-20 bg-brand-bg relative overflow-hidden border-t border-gray-100">
      {/* Background blurs */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-300/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-amber-200/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary-base tracking-wider uppercase mb-3">
            Student Stories
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-display">
            What Our Graduates Say
          </p>
          <div className="h-1 w-12 bg-accent-orange mx-auto rounded mt-4 mb-4" />
          <p className="text-lg text-gray-600">
            Hear from developers who unlocked high-paying tech careers by building software and verifying assignments through our grading portals.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div
              key={`testimonial-${test.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white border border-gray-50 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between"
              id={test.id}
            >
              {/* Top Quote Icon wrapper */}
              <div className="absolute top-6 right-8 text-blue-50">
                <Quote className="h-10 w-10 stroke-[3]" />
              </div>

              <div>
                {/* 5 Star Rating Indicator */}
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={`star-${test.id}-${index}-${i}`} className="h-4 w-4 fill-accent-orange text-accent-orange" />
                  ))}
                </div>

                <p className="text-gray-600 font-sans leading-relaxed text-sm italic mb-6">
                  "{test.content}"
                </p>
              </div>

              {/* Student Metadata footer */}
              <div className="flex items-center space-x-3.5 border-t border-gray-50 pt-5 mt-2">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm leading-tight font-display">
                    {test.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium font-sans">
                    {test.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
