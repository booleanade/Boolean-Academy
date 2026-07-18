import React, { useState } from 'react';
import { UserPlus, Compass, Share2, Award, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RegistrationSteps() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'step-reg',
      number: '01',
      title: 'Register Account',
      description: 'Create your academic profile in seconds. Unlock your personalized dashboard, assignment templates, and coding sandboxes.',
      detailList: [
        'Input full name & verification email',
        'Configure student coding preferences',
        'Access developer community channels'
      ],
      icon: UserPlus,
      color: 'border-blue-500 text-blue-600 bg-blue-50',
    },
    {
      id: 'step-course',
      number: '02',
      title: 'Choose Course',
      description: 'Select your preferred engineering track from Frontend, Backend, Full Stack, UI/UX, Security, or Mobile.',
      detailList: [
        'Explore syllabus & learning schedules',
        'Enroll with single-click actions',
        'Unlock modular repositories'
      ],
      icon: Compass,
      color: 'border-amber-500 text-amber-600 bg-amber-50',
    },
    {
      id: 'step-assign',
      number: '03',
      title: 'Submit Assignments',
      description: 'Build real-world projects and submit them dynamically. We grade active code repositories and production links.',
      detailList: [
        'Commit custom code to a GitHub repository',
        'Deploy production builds live on Vercel',
        'Input links on your assignment card'
      ],
      icon: Share2,
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    },
    {
      id: 'step-grade',
      number: '04',
      title: 'Receive Certificate',
      description: 'Our senior expert mentors grade your code against industry standards and issue secure, shareable digital credentials.',
      detailList: [
        'Review line-by-line expert code critique',
        'Earn passing grade marks (A, B, C)',
        'Share verified credentials to LinkedIn'
      ],
      icon: Award,
      color: 'border-indigo-500 text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <section id="process" className="py-20 bg-brand-bg relative overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold text-primary-base tracking-wider uppercase mb-3">
            Registration Process
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-display">
            How BooleanAcademy Works
          </p>
          <div className="h-1 w-12 bg-accent-orange mx-auto rounded mt-4 mb-4" />
          <p className="text-lg text-gray-600">
            A frictionless learning pipeline mapped directly to real production workflows. No boring multiple-choice exams — only real, deployed code.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative">
          {/* Desktop Timeline Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-1 bg-gradient-to-r from-blue-200 via-emerald-200 to-indigo-200 -translate-y-1/2 -z-10" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const IconComp = step.icon;
              const isSelected = activeStep === index;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  className={`relative cursor-pointer bg-white p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary-base shadow-lg ring-4 ring-blue-50/50'
                      : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                  }`}
                  id={step.id}
                >
                  {/* Floating badge for step sequence */}
                  <span className="absolute top-4 right-4 text-3xl font-black text-gray-100/80 font-display tracking-wider">
                    {step.number}
                  </span>

                  <div>
                    {/* Circle Icon Container */}
                    <div className={`p-4 rounded-2xl w-fit ${step.color} mb-6 border transition-all duration-300 ${isSelected ? 'scale-110 shadow-md' : ''}`}>
                      <IconComp className="h-6 w-6" />
                    </div>

                    <h3 className="text-lg font-extrabold text-gray-900 mb-3 font-display">
                      {step.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow Indicator inside card on hover */}
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-base uppercase tracking-wider">
                      {isSelected ? 'Viewing Requirements' : 'Click to details'}
                    </span>
                    <ChevronRight className={`h-4 w-4 text-primary-base transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detailed Panel for active step */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-blue-100/60 p-8 rounded-3xl shadow-sm max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8"
              id="step-detail-panel"
            >
              {/* Left Side Big Icon */}
              <div className={`p-6 rounded-3xl text-primary-base bg-blue-50 border border-blue-100/50 flex-shrink-0 flex items-center justify-center`}>
                {React.createElement(steps[activeStep].icon, { className: 'h-12 w-12' })}
              </div>

              {/* Right Side Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-accent-orange">Step {steps[activeStep].number} Checklist</span>
                  <h3 className="text-2xl font-extrabold text-gray-900 font-display mt-0.5">
                    {steps[activeStep].title} Requirements
                  </h3>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed">
                  To complete this phase successfully and advance, verify that you follow our technical standards:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {steps[activeStep].detailList.map((item, idx) => (
                    <div key={`step-detail-${steps[activeStep].id}-${idx}`} className="flex items-start space-x-2.5">
                      <div className="mt-1 p-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
