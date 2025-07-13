import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import RegistrationForm from './components/RegistrationForm';
import AdminSection from './components/AdminSection';
import AboutSection from './components/AboutSection';
import SupportSection from './components/SupportSection';
import Footer from './components/Footer';
import AdminAccess from './components/AdminAccess';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <RegistrationForm />
          <AdminSection />
          <AboutSection />
          <SupportSection />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminAccess />} />
      </Routes>
    </Router>
  );
}

export default App;