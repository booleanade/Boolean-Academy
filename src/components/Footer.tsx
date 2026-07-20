import React from 'react';
import { GraduationCap, Github, Linkedin, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const navHeight = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Layout: 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <a href="#home" onClick={(e) => handleScrollToSection(e, '#home')} className="flex items-center space-x-2.5">
              <div className="bg-primary-base p-2 rounded-xl text-white shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Boolean<span className="text-accent-orange">Academy</span>
              </span>
            </a>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              Accelerating student success through active software building and industry-grade digital certificates.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl transition-all duration-200">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Programs / Courses Links */}
          <div className="space-y-4 text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Programs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#courses" onClick={(e) => handleScrollToSection(e, '#courses')} className="hover:text-white transition-colors">
                  Frontend Development
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => handleScrollToSection(e, '#courses')} className="hover:text-white transition-colors">
                  Backend Development
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => handleScrollToSection(e, '#courses')} className="hover:text-white transition-colors">
                  Full Stack Dev Track
                </a>
              </li>
              <li>
                <a href="#courses" onClick={(e) => handleScrollToSection(e, '#courses')} className="hover:text-white transition-colors">
                  UI/UX Visual Design
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Quick Links */}
          <div className="space-y-4 text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" onClick={(e) => handleScrollToSection(e, '#features')} className="hover:text-white transition-colors">
                  Student Dashboard
                </a>
              </li>
              <li>
                <a href="#process" onClick={(e) => handleScrollToSection(e, '#process')} className="hover:text-white transition-colors">
                  Grading Timeline
                </a>
              </li>
              <li>
                <a href="#submissions" onClick={(e) => handleScrollToSection(e, '#submissions')} className="hover:text-white transition-colors">
                  Sandboxed Sandbox
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={(e) => handleScrollToSection(e, '#testimonials')} className="hover:text-white transition-colors">
                  Alumni Network
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 text-left" id="contact">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display">
              Contact Info
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-2.5">
                <Mail className="h-4 w-4 mt-1 text-primary-light flex-shrink-0" />
                <a href="mailto:info@booleantechconcepts.com" className="hover:text-white transition-colors font-sans break-all">
                  info@booleantechconcepts.com
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <Phone className="h-4 w-4 mt-1 text-primary-light flex-shrink-0" />
                <a href="tel:+2348135004477" className="hover:text-white transition-colors font-sans">
                  +234 813 500 4477
                </a>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 mt-1 text-primary-light flex-shrink-0" />
                <span>
                  Boolean Academy Building, Nyanya Phase 4, Abuja FCT
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright and Bottom Metadata */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-500">
          <div>
            © {currentYear} BooleanAcademy. All Rights Reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#home" onClick={(e) => handleScrollToSection(e, '#home')} className="hover:text-slate-300">Privacy Policy</a>
            <a href="#home" onClick={(e) => handleScrollToSection(e, '#home')} className="hover:text-slate-300">Terms of Service</a>
            <a href="#home" onClick={(e) => handleScrollToSection(e, '#home')} className="hover:text-slate-300">Cookie Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
