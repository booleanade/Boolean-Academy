import React from 'react';
import { useApp } from '../AppContext';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';
import Modals from '../components/Modals';
import { Lock, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import AdminDashboardPage from './AdminDashboardPage';

export default function DashboardPage() {
  const { currentUser, setLoginOpen } = useApp();
  const [wasLoggedIn] = React.useState(!!currentUser);

  if (currentUser && currentUser.role === 'admin') {
    return <AdminDashboardPage />;
  }

  if (wasLoggedIn && !currentUser) {
    return (
      <div className="relative min-h-screen bg-brand-bg select-none" id="dashboard-page-root">
        <Navbar />
        <div className="min-h-[80vh] flex items-center justify-center px-4" />
        <Footer />
        <Modals />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-bg select-none" id="dashboard-page-root">
      {/* 1. Sticky Navigation Bar */}
      <Navbar />

      {currentUser ? (
        /* 2. Personalized Dashboard Console for Logged in Users */
        <Dashboard />
      ) : (
        /* 3. Restricted Access State for Guests */
        <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center space-y-6"
          >
            <div className="mx-auto h-16 w-16 bg-blue-50 text-primary-base rounded-full flex items-center justify-center border border-blue-100">
              <Lock className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight">
                Authentication Required
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                You must be logged in as a Student or Administrator to view the BooleanAcademy Console Command Center.
              </p>
            </div>

            <button
              onClick={() => setLoginOpen(true)}
              className="w-full bg-primary-base hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
              id="btn-restricted-login"
            >
              <LogIn className="h-4.5 w-4.5" />
              <span>Academy Login / Sign-on</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Information & Support Footer */}
      <Footer />

      {/* Modal Controller Panel */}
      <Modals />
    </div>
  );
}
