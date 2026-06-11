// client/src/pages/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tickets');
      setTickets(response.data.data);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/tickets', formData);
      setFormData({ title: '', description: '' });
      setShowCreateForm(false);
      setSuccess('Ticket created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const filteredTickets = 
    filter === 'All'
      ? tickets
      : tickets.filter((t) => t.status === filter);

  const statusConfig = {
    Open: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' },
    'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
    Resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' },
    Closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⚪' },
  };

  const priorityConfig = {
    Low: { color: 'text-blue-600', bg: 'bg-blue-50' },
    Medium: { color: 'text-yellow-600', bg: 'bg-yellow-50' },
    High: { color: 'text-orange-600', bg: 'bg-orange-50' },
    Critical: { color: 'text-red-600', bg: 'bg-red-50' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}! 👋</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <span>✅</span> {success}
          </div>
        )}

        {/* Create Ticket Button */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mb-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold flex items-center gap-2 shadow-lg"
          >
            <span>+</span> Create New Ticket
          </button>
        )}

        {/* Create Ticket Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create a New Support Ticket</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none h-32"
                  placeholder="Detailed explanation of your issue..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold"
                >
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-4">Loading your tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-gray-600 font-medium">No tickets found</p>
            <p className="text-gray-500 text-sm">Create your first ticket to get started</p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredTickets.map((ticket) => {
              const statusCfg = statusConfig[ticket.status] || statusConfig.Open;
              const priorityCfg = priorityConfig[ticket.priority] || priorityConfig.Medium;

              return (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="group block bg-white rounded-xl shadow hover:shadow-xl transition border border-gray-200 overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition flex-1">
                        {ticket.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        {statusCfg.icon} {ticket.status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 line-clamp-2">{ticket.description}</p>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex gap-3 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${priorityCfg.bg} ${priorityCfg.color}`}
                        >
                          {ticket.priority} Priority
                        </span>
                        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                          {ticket.category}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}