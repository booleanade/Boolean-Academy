import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Menu, X, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { currentUser, logoutUser, setLoginOpen, setRegisterOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll position for glassmorphism styling and active section tracking
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Active section scroll spy logic
      if (location.pathname === '/') {
        const sections = ['home', 'features', 'courses', 'process', 'testimonials'];
        const scrollPosition = window.scrollY + 120;

        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(sectionId);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Nav Links: Home -> Features -> Courses -> Registration -> Testimonials (Submissions removed)
  const navLinks = currentUser
    ? [
        { name: 'Dashboard', href: '/dashboard' },
      ]
    : [
        { name: 'Home', href: '#home' },
        { name: 'Features', href: '#features' },
        { name: 'Courses', href: '#courses' },
        { name: 'Registration', href: '#process' },
        { name: 'Testimonials', href: '#testimonials' },
      ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (href === '#home' || href === '/') {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setActiveSection('home');
      return;
    }

    if (href.startsWith('#')) {
      const sectionId = href.replace('#', '');
      setActiveSection(sectionId);

      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const targetElement = document.getElementById(sectionId);
          if (targetElement) {
            const navHeight = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 300);
        return;
      }
      
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        const navHeight = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      navigate(href);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    setActiveSection('home');
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-blue-50 py-3'
          : 'bg-white/80 backdrop-blur-sm lg:bg-transparent py-4 lg:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Takes user back to home section */}
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center space-x-2.5 group cursor-pointer focus:outline-none"
            aria-label="Boolean Academy Home"
          >
            <div className="bg-white p-1 rounded-xl shadow-md shadow-blue-900/10 group-hover:scale-105 transition-all duration-300 w-10 h-10 flex items-center justify-center overflow-hidden border border-blue-50">
              <img src="https://i.imgur.com/oe15RJU.png" alt="Boolean Academy Logo" className="h-8 w-8 object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-dark font-display">
              Boolean<span className="text-accent-orange">Academy</span>
            </span>
          </a>

          {/* Desktop Navigation Links (Visible on lg screens and up) */}
          <div className="hidden lg:flex space-x-2 items-center">
            {navLinks.map((link, idx) => {
              const targetId = link.href.replace('#', '');
              const isActive = location.pathname === '/' && activeSection === targetId;

              return (
                <a
                  key={`nav-desktop-${link.name}-${idx}`}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-primary-base font-bold bg-blue-50/90 shadow-sm border border-blue-100'
                      : 'text-gray-700 hover:text-primary-base hover:bg-gray-100/60'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Desktop Authentication Buttons (lg and up) */}
          <div className="hidden lg:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-blue-50 py-1.5 px-3 rounded-full border border-blue-100">
                  <User className="h-4 w-4 text-primary-base" />
                  <span className="text-sm font-semibold text-primary-dark">
                    Hi, {currentUser.name}
                  </span>
                  {currentUser.role === 'admin' ? (
                    <span className="bg-accent-orange text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-sm shadow-accent-orange/20">
                      Admin
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-primary-base text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                      Student
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    navigate('/');
                    logoutUser();
                  }}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 text-sm font-medium py-2 px-3 transition-colors duration-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="text-gray-700 hover:text-primary-base text-sm font-medium py-2 px-4 transition-colors duration-200 cursor-pointer"
                  id="btn-login-desktop"
                >
                  Academy Login
                </button>
                <button
                  onClick={() => setRegisterOpen(true)}
                  className="bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-accent-orange/20 hover:shadow-accent-orange-hover/30 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                  id="btn-register-desktop"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile & Tablet menu button (Visible below lg breakpoint) */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-700 hover:text-primary-base hover:bg-blue-50 focus:outline-none transition-all duration-200 border border-gray-200 shadow-sm"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isOpen}
              id="btn-mobile-menu-toggle"
            >
              {isOpen ? <X className="h-6 w-6 text-primary-dark" /> : <Menu className="h-6 w-6 text-primary-dark" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing menu on tap outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 top-[73px] bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 lg:hidden bg-white border-b border-blue-100 shadow-xl px-4 pt-3 pb-6 space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto"
              id="mobile-menu-container"
            >
              <div className="space-y-1">
                {navLinks.map((link, idx) => {
                  const targetId = link.href.replace('#', '');
                  const isActive = location.pathname === '/' && activeSection === targetId;

                  return (
                    <a
                      key={`nav-mobile-${link.name}-${idx}`}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150 active:scale-[0.99] ${
                        isActive
                          ? 'bg-blue-50 text-primary-base border-l-4 border-accent-orange font-bold shadow-xs'
                          : 'text-gray-700 hover:text-primary-base hover:bg-blue-50/60'
                      }`}
                    >
                      {link.name}
                    </a>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-3">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-blue-50 rounded-xl flex-wrap justify-between border border-blue-100">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-primary-base" />
                        <span className="font-semibold text-primary-dark text-sm">
                          Hi, {currentUser.name}
                        </span>
                      </div>
                      {currentUser.role === 'admin' ? (
                        <span className="bg-accent-orange text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-primary-base text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                          Student
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        navigate('/');
                        logoutUser();
                      }}
                      className="flex w-full items-center justify-center space-x-2 px-4 py-3 rounded-xl text-red-600 bg-red-50/80 hover:bg-red-100 font-semibold transition-all duration-150 cursor-pointer"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setLoginOpen(true);
                      }}
                      className="w-full text-center py-3 px-4 border border-gray-300 bg-white rounded-xl text-gray-800 hover:bg-gray-50 active:bg-gray-100 text-sm font-bold transition-all duration-150 shadow-xs cursor-pointer"
                      id="btn-login-mobile"
                    >
                      Academy Login
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setRegisterOpen(true);
                      }}
                      className="w-full text-center py-3 px-4 bg-accent-orange hover:bg-accent-orange-hover active:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-md shadow-accent-orange/20 transition-all duration-150 cursor-pointer"
                      id="btn-register-mobile"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

