// client/src/pages/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignee: '',
    search: '',
  });

  // Fetch all tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.category) params.append('category', filters.category);
      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/tickets?${params.toString()}`);
      setTickets(response.data.data);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const statusConfig = {
    Open: { bg: 'bg-red-100', text: 'text-red-800', icon: '🔴' },
    'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '🟡' },
    Resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: '🟢' },
    Closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: '⚪' },
  };

  const priorityConfig = {
    Low: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '📌' },
    Medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '📍' },
    High: { color: 'text-orange-600', bg: 'bg-orange-50', icon: '🔸' },
    Critical: { color: 'text-red-600', bg: 'bg-red-50', icon: '🔴' },
  };

  // Stats
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
              <p className="text-gray-600 mt-1">Agent Dashboard • {user?.name} 🛠️</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: 'Total Tickets', value: stats.total, icon: '📊', color: 'from-blue-600 to-indigo-600' },
            { label: 'Open', value: stats.open, icon: '🔴', color: 'from-red-600 to-orange-600' },
            { label: 'In Progress', value: stats.inProgress, icon: '🟡', color: 'from-yellow-600 to-amber-600' },
            { label: 'Resolved', value: stats.resolved, icon: '🟢', color: 'from-green-600 to-emerald-600' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} rounded-xl shadow-lg p-6 text-white`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                  <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <input
              type="text"
              name="search"
              placeholder="Search by title..."
              value={filters.search}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            {/* Status Filter */}
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            {/* Category Filter */}
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              <option value="Billing">Billing</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Account Access">Account Access</option>
              <option value="Feature Request">Feature Request</option>
              <option value="General Inquiry">General Inquiry</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() =>
                setFilters({
                  status: '',
                  priority: '',
                  category: '',
                  assignee: '',
                  search: '',
                })
              }
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin text-3xl">⏳</div>
            <p className="text-gray-600 mt-4">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-2xl mb-2">📭</p>
            <p className="text-gray-600 font-medium">No tickets found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const statusCfg = statusConfig[ticket.status] || statusConfig.Open;
              const priorityCfg = priorityConfig[ticket.priority] || priorityConfig.Medium;

              return (
                <Link
                  key={ticket._id}
                  to={`/tickets/${ticket._id}`}
                  className="block bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-200 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex gap-6 items-start">
                      {/* Left - Ticket Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition truncate">
                            {ticket.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusCfg.bg} ${statusCfg.text}`}
                          >
                            {statusCfg.icon} {ticket.status}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-1">{ticket.description}</p>

                        <div className="flex gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${priorityCfg.bg} ${priorityCfg.color}`}
                          >
                            {priorityCfg.icon} {ticket.priority}
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                            {ticket.category}
                          </span>
                        </div>
                      </div>

                      {/* Right - Customer & Date */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-600 mb-1">From:</p>
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          {ticket.createdBy?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
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