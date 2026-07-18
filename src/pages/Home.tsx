import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Statistics from '../components/Statistics';
import Features from '../components/Features';
import Courses from '../components/Courses';
import RegistrationSteps from '../components/RegistrationSteps';
import AssignmentSection from '../components/AssignmentSection';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import Modals from '../components/Modals';
import Dashboard from '../components/Dashboard';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-brand-bg select-none" id="home-page-root">
      {/* 1. Sticky Navigation Bar */}
      <Navbar />

      {/* 3. Static Public Landing Pages for Guest Visitors */}
      <>
        {/* Hero Header Section */}
        <Hero />

        {/* High Contrast Statistics Grid */}
        <Statistics />

        {/* Why Choose Us Features Grid */}
        <Features />

        {/* Explorer Courses Catalog */}
        <Courses />

        {/* Registration Timeline Steps */}
        <RegistrationSteps />

        {/* Active Assignment Submission Sandbox */}
        <AssignmentSection />

        {/* Graduate Testimonials Quote Wall */}
        <Testimonials />

        {/* Blue Gradient Call To Action */}
        <CTA />
      </>

      {/* Information & Support Footer */}
      <Footer />

      {/* Modal Controller Panel */}
      <Modals />
    </div>
  );
}
