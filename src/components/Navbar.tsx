import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { GraduationCap, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { currentUser, logoutUser, setLoginOpen, setRegisterOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll position for glassmorphism styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = currentUser
    ? [
        { name: 'Dashboard', href: '/dashboard' },
      ]
    : [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '#courses' },
        { name: 'Features', href: '#features' },
        { name: 'Registration', href: '#process' },
        { name: 'Submissions', href: '#submissions' },
        { name: 'Testimonials', href: '#testimonials' },
      ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for page transition and scroll
        setTimeout(() => {
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
        }, 300);
        return;
      }
      
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
    } else {
      navigate(href);
    }
  };

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-md border-b border-blue-50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center space-x-2.5 group">
            <div className="bg-white p-1 rounded-xl shadow-md shadow-blue-900/10 group-hover:scale-105 transition-all duration-300 w-10 h-10 flex items-center justify-center overflow-hidden">
              <img src="https://i.imgur.com/oe15RJU.png" alt="Boolean Academy Logo" className="h-8 w-8 object-contain" referrerPolicy="no-referrer" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-dark font-display">
              Boolean<span className="text-accent-orange">Academy</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link, idx) => (
              <a
                key={`nav-desktop-${link.name}-${idx}`}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-gray-700 hover:text-primary-base text-sm font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Authentication Buttons */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-primary-base hover:bg-blue-50 focus:outline-none transition-all duration-200"
              aria-expanded="false"
              id="btn-mobile-menu-toggle"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-blue-50 shadow-inner px-4 pt-2 pb-6 space-y-3"
            id="mobile-menu-container"
          >
            <div className="space-y-1">
              {navLinks.map((link, idx) => (
                <a
                  key={`nav-mobile-${link.name}-${idx}`}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="block px-3 py-2.5 rounded-lg text-base font-medium text-gray-700 hover:text-primary-base hover:bg-blue-50 transition-all duration-150"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-blue-50 space-y-2">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg flex-wrap justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-primary-base" />
                      <span className="font-semibold text-primary-dark text-sm">
                        Hi, {currentUser.name}
                      </span>
                    </div>
                    {currentUser.role === 'admin' ? (
                      <span className="bg-accent-orange text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-sm">
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
                      setIsOpen(false);
                      navigate('/');
                      logoutUser();
                    }}
                    className="flex w-full items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-all duration-150 cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-3">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setLoginOpen(true);
                    }}
                    className="w-full text-center py-2.5 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-all duration-150 cursor-pointer"
                    id="btn-login-mobile"
                  >
                    Academy Login
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setRegisterOpen(true);
                    }}
                    className="w-full text-center py-2.5 px-4 bg-accent-orange hover:bg-accent-orange-hover text-white text-sm font-semibold rounded-xl shadow-md shadow-accent-orange/10 transition-all duration-150 cursor-pointer"
                    id="btn-register-mobile"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
