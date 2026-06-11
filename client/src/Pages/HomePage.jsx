// client/src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isAgent, isCustomer } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(isAgent ? '/agent' : '/customer');
    }
  }, [isAuthenticated, isAgent, isCustomer, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎫</span>
            <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-gray-900 font-medium hover:text-blue-600 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                Support Made Simple & Efficient
              </h2>
              <p className="text-xl text-gray-600">
                Manage customer support tickets effortlessly with our intelligent triage system. AI-powered categorization, agent collaboration, and real-time updates.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 border-2 border-gray-300 text-gray-900 rounded-lg hover:border-blue-600 transition font-semibold"
              >
                Sign In
              </button>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">✨ Try with demo credentials:</p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700"><strong>Customer:</strong> customer@test.com / password</p>
                <p className="text-gray-700"><strong>Agent:</strong> agent@test.com / password</p>
              </div>
            </div>
          </div>

          {/* Right - Image/Illustration */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 flex items-center justify-center min-h-96">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎫</div>
              <p className="text-gray-600 font-medium">Support Ticket Management System</p>
              <div className="flex justify-center gap-3 pt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">AI Triage</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Real-time</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🤖',
                title: 'AI-Powered Triage',
                description: 'Automatically categorize and prioritize tickets using advanced AI algorithms',
              },
              {
                icon: '👥',
                title: 'Team Collaboration',
                description: 'Agents can assign, update, and comment on tickets in real-time',
              },
              {
                icon: '🔍',
                title: 'Smart Search',
                description: 'Find tickets instantly with powerful search and filtering capabilities',
              },
              {
                icon: '📊',
                title: 'Analytics',
                description: 'Track resolution times and ticket trends with detailed insights',
              },
              {
                icon: '💬',
                title: 'Comments & History',
                description: 'Full conversation history and audit trail for accountability',
              },
              {
                icon: '📧',
                title: 'Email Notifications',
                description: 'Instant notifications on ticket updates and resolutions',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition space-y-4"
              >
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            How It Works
          </h2>

          <div className="space-y-12">
            {[
              {
                step: '01',
                title: 'Customer Creates Ticket',
                description: 'Customers submit support requests with title and description. Our AI automatically categorizes and assigns priority.',
              },
              {
                step: '02',
                title: 'Agent Reviews & Assigns',
                description: 'Support agents view all tickets, search/filter as needed, and assign to themselves or teammates.',
              },
              {
                step: '03',
                title: 'Collaboration & Updates',
                description: 'Agents add comments, update status, and collaborate. Customers get instant email notifications.',
              },
              {
                step: '04',
                title: 'Resolution & Closure',
                description: 'When resolved, both customer and agent receive confirmation emails. Full history preserved.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-8">
          <h2 className="text-4xl font-bold">Ready to Transform Your Support?</h2>
          <p className="text-xl text-blue-100">
            Join thousands of teams managing support tickets efficiently
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold inline-block"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Support Tickets</h4>
              <p className="text-sm">Modern support ticket management platform powered by AI.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Support Tickets. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}