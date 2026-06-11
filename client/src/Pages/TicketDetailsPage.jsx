// client/src/pages/TicketDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user, isAgent } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  // Edit form state (agents only)
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    priority: '',
    category: '',
  });

  // Fetch ticket and comments
  const fetchTicketDetails = async () => {
    try {
      setError('');
      setLoading(true);

      console.log('Fetching ticket:', id);

      const ticketRes = await api.get(`/tickets/${id}`);
      console.log('Ticket response:', ticketRes.data);

      setTicket(ticketRes.data.data);
      setEditData({
        status: ticketRes.data.data.status,
        priority: ticketRes.data.data.priority,
        category: ticketRes.data.data.category,
      });

      const commentsRes = await api.get(`/tickets/${id}/comments`);
      setComments(commentsRes.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to view this ticket.');
      } else if (err.response?.status === 404) {
        setError('Ticket not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to load ticket details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/tickets/${id}/comments`, {
        text: newComment,
      });

      setNewComment('');
      fetchTicketDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/tickets/${id}`, editData);
      setEditMode(false);
      fetchTicketDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-500 hover:text-blue-600 font-medium"
          >
            ← Go back
          </button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600 text-center">{error || 'Ticket not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = {
    Open: 'bg-red-100 text-red-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Resolved: 'bg-green-100 text-green-800',
    Closed: 'bg-gray-100 text-gray-800',
  };

  const priorityColors = {
    Low: 'text-blue-600',
    Medium: 'text-yellow-600',
    High: 'text-orange-600',
    Critical: 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            ← Go back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Ticket #{ticket._id.slice(-6).toUpperCase()}
          </h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Ticket Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{ticket.title}</h2>
              <p className="text-gray-600">{ticket.description}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-lg font-medium ${statusColors[ticket.status] || 'bg-gray-100'}`}
            >
              {ticket.status}
            </span>
          </div>

          {/* Edit Form (Agents only) */}
          {isAgent && editMode ? (
            <form onSubmit={handleUpdateTicket} className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editData.priority}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Billing">Billing</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Priority</p>
                <p className={`font-bold ${priorityColors[ticket.priority] || 'text-gray-800'}`}>
                  {ticket.priority}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Category</p>
                <p className="font-bold text-gray-800">{ticket.category}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Created By</p>
                <p className="font-bold text-gray-800">{ticket.createdBy?.name || 'Unknown'}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Assigned To</p>
                <p className="font-bold text-gray-800">
                  {ticket.assignedTo?.name || 'Unassigned'}
                </p>
              </div>
            </div>
          )}

          {isAgent && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Edit Ticket
            </button>
          )}

          {/* Suggested Response (AI-generated) */}
          {ticket.suggestedResponse && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-900 mb-2">💡 AI Suggested Response</h3>
              <p className="text-blue-800">{ticket.suggestedResponse}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">
            Comments ({comments.length})
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
              placeholder="Add a comment..."
              required
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Post Comment
            </button>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-gray-600">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex justify-between mb-2">
                    <p className="font-bold text-gray-800">
                      {comment.author?.name || 'Unknown'}{' '}
                      <span className="text-xs text-gray-500">
                        ({comment.author?.role || 'user'})
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}